import { createHmac } from "node:crypto";
import type { FastifyInstance, FastifyReply } from "fastify";
import { and, asc, count, desc, eq } from "drizzle-orm";
import { db, schema } from "./db/client.js";
import { requireUser } from "./auth/session.js";
import { isPreviewRequest, previewSecret, revalidatePortal } from "./revalidate.js";
import type { I18n } from "./db/schema.js";

/**
 * Owner, 2026-11-21:
 *  - undecided sections (seminars, conferences, fellowship) show "Coming soon" until switched on;
 *  - agenda events are managed from the dashboard calendar (drafts stay in the dashboard);
 *  - every "Register" lands in the database, and all registrations are listed in the dashboard;
 *  - "Preview" shows hidden and draft items on the real site to the team only.
 */
export const SECTIONS = ["seminars", "conferences", "fellowship"] as const;

const ID = /^[0-9a-f-]{36}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SITE_IMAGE = /^(\/media\/[a-f0-9-]{36}\.(jpg|png|webp)|\/[\w\-/]+\.(jpg|jpeg|png|webp))$/;
const LANGS = ["en", "fr", "ar"] as const;
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
const emptyI18n = (): I18n => ({ en: "", fr: "", ar: "" });
const bad = (reply: FastifyReply, field: string) => reply.code(400).send({ ok: false, error: "invalid", field });

function i18n(v: unknown, max: number): I18n | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const out = emptyI18n();
  for (const l of LANGS) {
    const s = o[l] ?? "";
    if (typeof s !== "string" || s.length > max) return null;
    out[l] = s.trim();
  }
  return out;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

async function uniqueSlug(base: string, exceptId?: string) {
  const root = base || "event";
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${root}-${i + 1}` : root;
    const [hit] = await db.select({ id: schema.events.id }).from(schema.events).where(eq(schema.events.slug, slug)).limit(1);
    if (!hit || hit.id === exceptId) return slug;
  }
  return `${root}-${Date.now()}`;
}

/** Signed preview link token: "<expiry ms>.<hmac>", valid for 2 hours. The portal checks it with the same secret. */
function previewToken() {
  const exp = Date.now() + 2 * 60 * 60 * 1000;
  return `${exp}.${createHmac("sha256", previewSecret).update(`preview:${exp}`).digest("hex")}`;
}

const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
const firstText = (x: I18n) => x.ar || x.en || x.fr;

export async function eventRoutes(app: FastifyInstance) {
  const refresh = (log: (m: string) => void) => revalidatePortal(log);

  /* ---------------- Preview ---------------- */

  app.get("/admin/preview-token", { preHandler: requireUser }, async (_req, reply) => {
    if (!previewSecret) return reply.code(503).send({ ok: false, error: "no_secret" });
    return { ok: true, token: previewToken() };
  });

  /* ---------------- Sections shown or "coming soon" ---------------- */

  const visibility = async () => {
    const rows = await db.select().from(schema.siteSections);
    return Object.fromEntries(SECTIONS.map((k) => [k, rows.find((r) => r.key === k)?.visible ?? false])) as Record<(typeof SECTIONS)[number], boolean>;
  };

  app.get("/public/sections", async () => ({ ok: true, sections: await visibility() }));
  app.get("/admin/sections", { preHandler: requireUser }, async () => ({ ok: true, sections: await visibility() }));

  app.patch<{ Body: { key: string; visible: boolean } }>(
    "/admin/sections",
    {
      preHandler: requireUser,
      schema: {
        body: {
          type: "object",
          required: ["key", "visible"],
          properties: { key: { type: "string", enum: [...SECTIONS] }, visible: { type: "boolean" } },
          additionalProperties: false,
        },
      },
    },
    async (req) => {
      const { key, visible } = req.body;
      await db
        .insert(schema.siteSections)
        .values({ key, visible, updatedBy: req.user!.id })
        .onConflictDoUpdate({ target: schema.siteSections.key, set: { visible, updatedBy: req.user!.id, updatedAt: new Date() } });
      await refresh((m) => req.log.warn(m));
      return { ok: true };
    },
  );

  /* ---------------- Events (dashboard) ---------------- */

  app.get<{ Querystring: { from?: string; to?: string } }>("/admin/events", { preHandler: requireUser }, async () => {
    const rows = await db.select().from(schema.events).orderBy(asc(schema.events.createdAt));
    const regs = await db
      .select({ eventId: schema.eventRegistrations.eventId, n: count() })
      .from(schema.eventRegistrations)
      .groupBy(schema.eventRegistrations.eventId);
    return {
      ok: true,
      items: rows
        .map((e) => ({ ...e, registrations: regs.find((r) => r.eventId === e.id)?.n ?? 0 }))
        .sort((a, b) => (a.dates[0] ?? "").localeCompare(b.dates[0] ?? "")),
    };
  });

  /** New draft event on a date (clicked in the dashboard calendar). */
  app.post<{ Body: { date?: string; title?: unknown } }>("/admin/events", { preHandler: requireUser }, async (req, reply) => {
    const date = String(req.body?.date ?? "");
    if (!DATE.test(date)) return bad(reply, "date");
    const title = i18n(req.body?.title ?? {}, 200) ?? emptyI18n();
    const slug = await uniqueSlug(slugify(title.en || title.fr) || `event-${date}`);
    const [row] = await db
      .insert(schema.events)
      .values({ slug, dates: [date], title, kind: emptyI18n(), body: emptyI18n(), place: emptyI18n() })
      .returning({ id: schema.events.id });
    return reply.code(201).send({ ok: true, id: row.id });
  });

  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>("/admin/events/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [row] = await db.select().from(schema.events).where(eq(schema.events.id, req.params.id)).limit(1);
    if (!row) return reply.code(404).send({ ok: false });
    const b = req.body ?? {};
    const next: Partial<typeof schema.events.$inferInsert> = {};
    for (const [key, max] of [["title", 200], ["kind", 100], ["place", 200], ["body", 8000]] as const) {
      if (key in b) {
        const v = i18n(b[key], max);
        if (!v) return bad(reply, key);
        next[key] = v;
      }
    }
    if ("dates" in b) {
      const d = b.dates;
      if (!Array.isArray(d) || !d.length || d.length > 30 || d.some((x) => typeof x !== "string" || !DATE.test(x))) return bad(reply, "dates");
      next.dates = [...new Set(d as string[])].sort();
    }
    if ("tone" in b) {
      if (!["event", "series", "deadline"].includes(String(b.tone))) return bad(reply, "tone");
      next.tone = b.tone as "event" | "series" | "deadline";
    }
    if ("time" in b) {
      const v = String(b.time ?? "").trim();
      if (v.length > 100) return bad(reply, "time");
      next.time = v;
    }
    if ("image" in b) {
      const v = String(b.image ?? "");
      if (v && !SITE_IMAGE.test(v)) return bad(reply, "image");
      next.image = v;
    }
    if ("registrationOpen" in b) {
      if (typeof b.registrationOpen !== "boolean") return bad(reply, "registrationOpen");
      next.registrationOpen = b.registrationOpen;
    }
    if ("slug" in b) {
      const v = String(b.slug ?? "");
      if (!SLUG.test(v) || v.length > 80) return bad(reply, "slug");
      if ((await uniqueSlug(v, row.id)) !== v) return reply.code(409).send({ ok: false, error: "slug_taken" });
      next.slug = v;
    }
    if ("status" in b) {
      if (b.status !== "draft" && b.status !== "published") return bad(reply, "status");
      const title = (next.title ?? row.title) as I18n;
      if (b.status === "published" && !title.en && !title.fr && !title.ar) return bad(reply, "title");
      next.status = b.status;
      if (b.status === "published" && row.status !== "published") next.publishedAt = new Date();
    }
    if (!Object.keys(next).length) return bad(reply, "empty");
    next.updatedAt = new Date();
    await db.update(schema.events).set(next).where(eq(schema.events.id, row.id));
    if (row.status === "published" || next.status) await refresh((m) => req.log.warn(m));
    return { ok: true };
  });

  app.delete<{ Params: { id: string } }>("/admin/events/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const done = await db.delete(schema.events).where(eq(schema.events.id, req.params.id)).returning({ status: schema.events.status });
    if (!done.length) return reply.code(404).send({ ok: false });
    if (done[0].status === "published") await refresh((m) => req.log.warn(m));
    return { ok: true };
  });

  /* ---------------- Registrations (courses + events) ---------------- */

  type Reg = {
    id: string;
    type: "course" | "event";
    itemId: string;
    item: I18n;
    name: string;
    email: string;
    country: string;
    locale: string;
    status: "new" | "accepted" | "rejected";
    createdAt: Date;
  };

  async function allRegistrations(): Promise<Reg[]> {
    const c = await db
      .select({ r: schema.courseRegistrations, title: schema.courses.title })
      .from(schema.courseRegistrations)
      .innerJoin(schema.courses, eq(schema.courseRegistrations.courseId, schema.courses.id));
    const e = await db
      .select({ r: schema.eventRegistrations, title: schema.events.title })
      .from(schema.eventRegistrations)
      .innerJoin(schema.events, eq(schema.eventRegistrations.eventId, schema.events.id));
    return [
      ...c.map(({ r, title }) => ({ ...r, type: "course" as const, itemId: r.courseId, item: title })),
      ...e.map(({ r, title }) => ({ ...r, type: "event" as const, itemId: r.eventId, item: title })),
    ]
      .map(({ id, type, itemId, item, name, email, country, locale, status, createdAt }) => ({ id, type, itemId, item, name, email, country, locale, status, createdAt }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  app.get("/admin/registrations", { preHandler: requireUser }, async () => ({ ok: true, items: await allRegistrations() }));

  app.get("/admin/registrations.csv", { preHandler: requireUser }, async (_req, reply) => {
    const rows = await allRegistrations();
    const csv =
      "﻿" +
      [
        "type,item,name,email,country,language,status,registered_at",
        ...rows.map((r) => [r.type, firstText(r.item), r.name, r.email, r.country, r.locale, r.status, r.createdAt.toISOString()].map(cell).join(",")),
      ].join("\r\n");
    return reply
      .header("Content-Type", "text/csv; charset=utf-8")
      .header("Content-Disposition", `attachment; filename="registrations-${new Date().toISOString().slice(0, 10)}.csv"`)
      .header("Cache-Control", "private, no-store")
      .send(csv);
  });

  app.patch<{ Params: { id: string }; Body: { status: "new" | "accepted" | "rejected" } }>(
    "/admin/event-registrations/:id",
    {
      preHandler: requireUser,
      schema: { body: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["new", "accepted", "rejected"] } }, additionalProperties: false } },
    },
    async (req, reply) => {
      if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
      const done = await db
        .update(schema.eventRegistrations)
        .set({ status: req.body.status })
        .where(eq(schema.eventRegistrations.id, req.params.id))
        .returning({ id: schema.eventRegistrations.id });
      if (!done.length) return reply.code(404).send({ ok: false });
      return { ok: true };
    },
  );

  /* ---------------- Public (portal) ---------------- */

  const pub = (e: typeof schema.events.$inferSelect) => ({
    slug: e.slug,
    status: e.status,
    tone: e.tone,
    dates: e.dates,
    time: e.time,
    kind: e.kind,
    title: e.title,
    body: e.body,
    place: e.place,
    image: e.image,
    registrationOpen: e.registrationOpen,
  });

  /** Published events; in preview, drafts too. */
  app.get("/public/events", async (req) => {
    const preview = isPreviewRequest(req.headers);
    const rows = await db
      .select()
      .from(schema.events)
      .where(preview ? undefined : eq(schema.events.status, "published"))
      .orderBy(desc(schema.events.createdAt));
    return { ok: true, items: rows.filter((e) => e.dates.length).map(pub) };
  });

  app.get<{ Params: { slug: string } }>("/public/events/:slug", async (req, reply) => {
    if (!SLUG.test(req.params.slug)) return reply.code(404).send({ ok: false });
    const preview = isPreviewRequest(req.headers);
    const [e] = await db
      .select()
      .from(schema.events)
      .where(preview ? eq(schema.events.slug, req.params.slug) : and(eq(schema.events.slug, req.params.slug), eq(schema.events.status, "published")))
      .limit(1);
    if (!e) return reply.code(404).send({ ok: false });
    return { ok: true, event: pub(e) };
  });

  app.post<{ Params: { slug: string }; Body: { name: string; email: string; country: string; locale?: string; website?: string } }>(
    "/public/events/:slug/register",
    {
      config: { rateLimit: { max: 10, timeWindow: "10 minutes" } },
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "country"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 120 },
            email: { type: "string", maxLength: 254 },
            country: { type: "string", pattern: "^[A-Z]{2}$" },
            locale: { type: "string", enum: ["en", "fr", "ar"] },
            website: { type: "string", maxLength: 200 },
          },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      if (req.body.website) return reply.code(201).send({ ok: true });
      if (!isEmail(req.body.email.trim())) return reply.code(400).send({ ok: false, errors: ["email"] });
      const [e] = await db
        .select({ id: schema.events.id, open: schema.events.registrationOpen, tone: schema.events.tone })
        .from(schema.events)
        .where(and(eq(schema.events.slug, req.params.slug), eq(schema.events.status, "published")))
        .limit(1);
      if (!e) return reply.code(404).send({ ok: false });
      if (!e.open || e.tone === "deadline") return reply.code(409).send({ ok: false, error: "closed" });
      await db.insert(schema.eventRegistrations).values({
        eventId: e.id,
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        country: req.body.country,
        locale: req.body.locale ?? "en",
      });
      return reply.code(201).send({ ok: true });
    },
  );
}
