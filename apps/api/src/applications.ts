import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { count, desc, eq } from "drizzle-orm";
import { dataDir, db, schema } from "./db/client.js";
import { requireUser } from "./auth/session.js";

/**
 * Dashboard: membership applications ("Add your voice to ours").
 * The CV and photo are private: only signed-in team members can open them, through these routes.
 */
const STATUSES = ["pending", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];
const uploadsDir = join(dataDir, "uploads");
const ID = /^[0-9a-f-]{36}$/;

export async function applicationRoutes(app: FastifyInstance) {
  /** List, newest first, optionally by status; with counts per status for the tabs. */
  app.get<{ Querystring: { status?: string } }>("/admin/applications", { preHandler: requireUser }, async (req) => {
    const status = STATUSES.includes(req.query.status as Status) ? (req.query.status as Status) : null;
    const items = await db
      .select({
        id: schema.applications.id,
        name: schema.applications.name,
        email: schema.applications.email,
        country: schema.applications.country,
        job: schema.applications.job,
        status: schema.applications.status,
        hasCv: schema.applications.cv,
        createdAt: schema.applications.createdAt,
      })
      .from(schema.applications)
      .where(status ? eq(schema.applications.status, status) : undefined)
      .orderBy(desc(schema.applications.createdAt))
      .limit(500);
    const counts = await db
      .select({ status: schema.applications.status, n: count() })
      .from(schema.applications)
      .groupBy(schema.applications.status);
    return {
      ok: true,
      items: items.map((i) => ({ ...i, hasCv: !!i.hasCv })),
      counts: Object.fromEntries(STATUSES.map((s) => [s, counts.find((c) => c.status === s)?.n ?? 0])),
    };
  });

  /** One application with everything the applicant sent, and who reviewed it. */
  app.get<{ Params: { id: string } }>("/admin/applications/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [row] = await db
      .select({ app: schema.applications, reviewer: schema.users.name })
      .from(schema.applications)
      .leftJoin(schema.users, eq(schema.applications.reviewedBy, schema.users.id))
      .where(eq(schema.applications.id, req.params.id))
      .limit(1);
    if (!row) return reply.code(404).send({ ok: false });
    const { photo, cv, ...rest } = row.app;
    return { ok: true, application: { ...rest, hasPhoto: !!photo, hasCv: !!cv, reviewerName: row.reviewer } };
  });

  /** Accept, reject, or put back to pending. */
  app.patch<{ Params: { id: string }; Body: { status: Status } }>(
    "/admin/applications/:id",
    {
      preHandler: requireUser,
      schema: {
        body: { type: "object", required: ["status"], properties: { status: { type: "string", enum: [...STATUSES] } }, additionalProperties: false },
      },
    },
    async (req, reply) => {
      if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
      const pending = req.body.status === "pending";
      const updated = await db
        .update(schema.applications)
        .set({ status: req.body.status, reviewedBy: pending ? null : req.user!.id, reviewedAt: pending ? null : new Date() })
        .where(eq(schema.applications.id, req.params.id))
        .returning({ id: schema.applications.id });
      if (!updated.length) return reply.code(404).send({ ok: false });
      return { ok: true };
    },
  );

  /** Private files: the CV (PDF) and the photo. `?download=1` saves instead of opening. */
  app.get<{ Params: { id: string; kind: string }; Querystring: { download?: string } }>(
    "/admin/applications/:id/:kind",
    { preHandler: requireUser },
    async (req, reply) => {
      const { id, kind } = req.params;
      if (!ID.test(id) || (kind !== "cv" && kind !== "photo")) return reply.code(404).send({ ok: false });
      const [row] = await db
        .select({ name: schema.applications.name, cv: schema.applications.cv, photo: schema.applications.photo })
        .from(schema.applications)
        .where(eq(schema.applications.id, id))
        .limit(1);
      const file = row?.[kind];
      if (!row || !file || !/^[0-9a-f-]{36}(-cv\.pdf|\.(jpg|png))$/.test(file)) return reply.code(404).send({ ok: false });
      const path = join(uploadsDir, file);
      try {
        await stat(path);
      } catch {
        return reply.code(404).send({ ok: false });
      }
      const type = file.endsWith(".pdf") ? "application/pdf" : file.endsWith(".png") ? "image/png" : "image/jpeg";
      // ASCII-safe file name for the download, from the applicant's name
      const base = row.name.normalize("NFKD").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "applicant";
      const name = kind === "cv" ? `CV-${base}.pdf` : `photo-${base}.${file.split(".").pop()}`;
      return reply
        .header("Content-Type", type)
        .header("Content-Disposition", `${req.query.download ? "attachment" : "inline"}; filename="${name}"`)
        .header("Cache-Control", "private, no-store")
        .header("X-Content-Type-Options", "nosniff")
        .send(createReadStream(path));
    },
  );
}
