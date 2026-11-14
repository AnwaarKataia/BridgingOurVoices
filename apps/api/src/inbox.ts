import type { FastifyInstance } from "fastify";
import { and, count, desc, eq, ilike, isNull, isNotNull } from "drizzle-orm";
import { db, schema } from "./db/client.js";
import { requireUser } from "./auth/session.js";

/**
 * Dashboard inbox (owner, 2026-11-14): contact messages and newsletter subscribers, plus a feed of the
 * latest submissions of every kind for the overview.
 */
const MSG_STATUSES = ["new", "review", "hold", "replied", "archived"] as const;
type MsgStatus = (typeof MSG_STATUSES)[number];
const ID = /^[0-9a-f-]{36}$/;

export async function inboxRoutes(app: FastifyInstance) {
  /** Contact messages, newest first, by status (default: all except archived), with counts. */
  app.get<{ Querystring: { status?: string } }>("/admin/messages", { preHandler: requireUser }, async (req) => {
    const status = MSG_STATUSES.includes(req.query.status as MsgStatus) ? (req.query.status as MsgStatus) : null;
    const items = await db
      .select({
        id: schema.contactMessages.id,
        name: schema.contactMessages.name,
        email: schema.contactMessages.email,
        topic: schema.contactMessages.topic,
        message: schema.contactMessages.message,
        status: schema.contactMessages.status,
        note: schema.contactMessages.note,
        createdAt: schema.contactMessages.createdAt,
      })
      .from(schema.contactMessages)
      .where(status ? eq(schema.contactMessages.status, status) : undefined)
      .orderBy(desc(schema.contactMessages.createdAt))
      .limit(500);
    const counts = await db
      .select({ status: schema.contactMessages.status, n: count() })
      .from(schema.contactMessages)
      .groupBy(schema.contactMessages.status);
    return {
      ok: true,
      // A short preview in the list; the full text is on the message page
      items: items.map(({ message, note, ...m }) => ({ ...m, preview: message.slice(0, 160), hasNote: !!note })),
      counts: Object.fromEntries(MSG_STATUSES.map((s) => [s, counts.find((c) => c.status === s)?.n ?? 0])),
    };
  });

  app.get<{ Params: { id: string } }>("/admin/messages/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [row] = await db
      .select({ msg: schema.contactMessages, handler: schema.users.name })
      .from(schema.contactMessages)
      .leftJoin(schema.users, eq(schema.contactMessages.handledBy, schema.users.id))
      .where(eq(schema.contactMessages.id, req.params.id))
      .limit(1);
    if (!row) return reply.code(404).send({ ok: false });
    return { ok: true, message: { ...row.msg, handlerName: row.handler } };
  });

  /** Set the status (review / hold / replied / archived / new) and/or the internal note. */
  app.patch<{ Params: { id: string }; Body: { status?: MsgStatus; note?: string } }>(
    "/admin/messages/:id",
    {
      preHandler: requireUser,
      schema: {
        body: {
          type: "object",
          minProperties: 1,
          properties: { status: { type: "string", enum: [...MSG_STATUSES] }, note: { type: "string", maxLength: 5000 } },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
      const { status, note } = req.body;
      const updated = await db
        .update(schema.contactMessages)
        .set({
          ...(status ? { status } : {}),
          ...(note !== undefined ? { note: note.trim() } : {}),
          handledBy: req.user!.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.contactMessages.id, req.params.id))
        .returning({ id: schema.contactMessages.id });
      if (!updated.length) return reply.code(404).send({ ok: false });
      return { ok: true };
    },
  );

  /** Newsletter subscribers: active (default) or unsubscribed, optional search by email. */
  app.get<{ Querystring: { q?: string; show?: string } }>("/admin/subscribers", { preHandler: requireUser }, async (req) => {
    const q = (req.query.q ?? "").trim().slice(0, 100);
    const showUnsub = req.query.show === "unsubscribed";
    const where = and(
      showUnsub ? isNotNull(schema.subscribers.unsubscribedAt) : isNull(schema.subscribers.unsubscribedAt),
      q ? ilike(schema.subscribers.email, `%${q.replace(/[%_\\]/g, "\\$&")}%`) : undefined,
    );
    const items = await db.select().from(schema.subscribers).where(where).orderBy(desc(schema.subscribers.createdAt)).limit(2000);
    const [active] = await db.select({ n: count() }).from(schema.subscribers).where(isNull(schema.subscribers.unsubscribedAt));
    const [unsub] = await db.select({ n: count() }).from(schema.subscribers).where(isNotNull(schema.subscribers.unsubscribedAt));
    return { ok: true, items, counts: { active: active.n, unsubscribed: unsub.n } };
  });

  /** Active subscribers as a CSV file (opens in Excel; UTF-8 with BOM so Arabic shows correctly). */
  app.get("/admin/subscribers.csv", { preHandler: requireUser }, async (_req, reply) => {
    const rows = await db
      .select({ email: schema.subscribers.email, createdAt: schema.subscribers.createdAt })
      .from(schema.subscribers)
      .where(isNull(schema.subscribers.unsubscribedAt))
      .orderBy(desc(schema.subscribers.createdAt));
    // Guard against spreadsheet formulas in cells
    const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
    const csv = "﻿" + ["email,subscribed_at", ...rows.map((r) => `${cell(r.email)},${cell(r.createdAt.toISOString())}`)].join("\r\n");
    return reply
      .header("Content-Type", "text/csv; charset=utf-8")
      .header("Content-Disposition", `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`)
      .header("Cache-Control", "private, no-store")
      .send(csv);
  });

  /** Unsubscribe (keeps the record) or remove completely (`?remove=1`, e.g. on the person's request). */
  app.delete<{ Params: { id: string }; Querystring: { remove?: string } }>("/admin/subscribers/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const done = req.query.remove
      ? await db.delete(schema.subscribers).where(eq(schema.subscribers.id, req.params.id)).returning({ id: schema.subscribers.id })
      : await db
          .update(schema.subscribers)
          .set({ unsubscribedAt: new Date() })
          .where(eq(schema.subscribers.id, req.params.id))
          .returning({ id: schema.subscribers.id });
    if (!done.length) return reply.code(404).send({ ok: false });
    return { ok: true };
  });

  /** Overview feed: the latest submissions of every kind, newest first. */
  app.get("/admin/recent", { preHandler: requireUser }, async () => {
    const [msgs, apps, subs] = await Promise.all([
      db
        .select({ id: schema.contactMessages.id, name: schema.contactMessages.name, status: schema.contactMessages.status, createdAt: schema.contactMessages.createdAt })
        .from(schema.contactMessages)
        .orderBy(desc(schema.contactMessages.createdAt))
        .limit(10),
      db
        .select({ id: schema.applications.id, kind: schema.applications.kind, name: schema.applications.name, status: schema.applications.status, createdAt: schema.applications.createdAt })
        .from(schema.applications)
        .orderBy(desc(schema.applications.createdAt))
        .limit(10),
      db
        .select({ id: schema.subscribers.id, name: schema.subscribers.email, createdAt: schema.subscribers.createdAt })
        .from(schema.subscribers)
        .where(isNull(schema.subscribers.unsubscribedAt))
        .orderBy(desc(schema.subscribers.createdAt))
        .limit(10),
    ]);
    const items = [
      ...msgs.map((m) => ({ type: "message" as const, ...m })),
      ...apps.map(({ kind, ...a }) => ({ type: kind, ...a })),
      ...subs.map((s) => ({ type: "subscriber" as const, status: "new", ...s })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 12);
    return { ok: true, items };
  });
}
