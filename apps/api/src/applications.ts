import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance, FastifyReply } from "fastify";
import { and, count, desc, eq } from "drizzle-orm";
import { dataDir, db, schema } from "./db/client.js";
import { requireUser } from "./auth/session.js";
import { revalidatePortal } from "./revalidate.js";

/**
 * Submissions from the two network forms — kind "member" (membership applications, Membership page) and
 * kind "voice" ("Add your voice to ours", Join page).
 *
 * Dashboard actions (owner, 2026-11-14): publish on the site (only with the applicant's consent; it also
 * accepts), under review, on hold (look later, with an internal note), accept, reject, unpublish.
 * The CV is always private. A photo becomes public only while its submission is published.
 */
const STATUSES = ["pending", "review", "hold", "approved", "rejected"] as const;
type Status = (typeof STATUSES)[number];
const KINDS = ["member", "voice"] as const;
type Kind = (typeof KINDS)[number];
const uploadsDir = join(dataDir, "uploads");
const ID = /^[0-9a-f-]{36}$/;
const FILE = /^[0-9a-f-]{36}(-cv\.pdf|\.(jpg|png))$/;

async function sendFile(reply: FastifyReply, file: string, opts: { name: string; download: boolean; cache: string }) {
  const path = join(uploadsDir, file);
  try {
    await stat(path);
  } catch {
    return reply.code(404).send({ ok: false });
  }
  const type = file.endsWith(".pdf") ? "application/pdf" : file.endsWith(".png") ? "image/png" : "image/jpeg";
  return reply
    .header("Content-Type", type)
    .header("Content-Disposition", `${opts.download ? "attachment" : "inline"}; filename="${opts.name}"`)
    .header("Cache-Control", opts.cache)
    .header("X-Content-Type-Options", "nosniff")
    .send(createReadStream(path));
}

export async function applicationRoutes(app: FastifyInstance) {
  /** List of one kind (default "member"), newest first, optionally by status; with counts for the tabs. */
  app.get<{ Querystring: { status?: string; kind?: string } }>("/admin/applications", { preHandler: requireUser }, async (req) => {
    const status = STATUSES.includes(req.query.status as Status) ? (req.query.status as Status) : null;
    const kind: Kind = KINDS.includes(req.query.kind as Kind) ? (req.query.kind as Kind) : "member";
    const items = await db
      .select({
        id: schema.applications.id,
        kind: schema.applications.kind,
        name: schema.applications.name,
        email: schema.applications.email,
        country: schema.applications.country,
        job: schema.applications.job,
        status: schema.applications.status,
        published: schema.applications.published,
        note: schema.applications.note,
        createdAt: schema.applications.createdAt,
      })
      .from(schema.applications)
      .where(and(eq(schema.applications.kind, kind), status ? eq(schema.applications.status, status) : undefined))
      .orderBy(desc(schema.applications.createdAt))
      .limit(500);
    const counts = await db
      .select({ kind: schema.applications.kind, status: schema.applications.status, n: count() })
      .from(schema.applications)
      .groupBy(schema.applications.kind, schema.applications.status);
    const n = (k: Kind, s?: Status) => counts.filter((c) => c.kind === k && (!s || c.status === s)).reduce((a, c) => a + c.n, 0);
    return {
      ok: true,
      kind,
      items: items.map(({ note, ...i }) => ({ ...i, hasNote: !!note })),
      counts: Object.fromEntries(STATUSES.map((s) => [s, n(kind, s)])),
      // New (pending) per kind, for the badges on the two kinds
      pending: Object.fromEntries(KINDS.map((k) => [k, n(k, "pending")])),
    };
  });

  /** One submission with everything sent, the internal note, and who reviewed it. */
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

  /**
   * Update a submission: `status`, internal `note`, and/or `published`.
   * Publishing needs the applicant's consent and marks the submission approved; rejecting unpublishes it.
   */
  app.patch<{ Params: { id: string }; Body: { status?: Status; note?: string; published?: boolean } }>(
    "/admin/applications/:id",
    {
      preHandler: requireUser,
      schema: {
        body: {
          type: "object",
          minProperties: 1,
          properties: {
            status: { type: "string", enum: [...STATUSES] },
            note: { type: "string", maxLength: 5000 },
            published: { type: "boolean" },
          },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
      const [row] = await db.select().from(schema.applications).where(eq(schema.applications.id, req.params.id)).limit(1);
      if (!row) return reply.code(404).send({ ok: false });
      const { status, note, published } = req.body;
      if (published && !row.publishConsent) return reply.code(409).send({ ok: false, error: "no_consent" });

      const next: Partial<typeof schema.applications.$inferInsert> = {};
      if (note !== undefined) next.note = note.trim();
      let nextStatus = status ?? row.status;
      if (published === true) nextStatus = "approved";
      if (nextStatus !== row.status) {
        next.status = nextStatus;
        const open = nextStatus === "pending";
        next.reviewedBy = open ? null : req.user!.id;
        next.reviewedAt = open ? null : new Date();
      }
      // Only approved submissions stay on the site
      const nextPublished = published ?? (nextStatus === "approved" ? row.published : false);
      if (nextPublished !== row.published) {
        next.published = nextPublished;
        next.publishedAt = nextPublished ? new Date() : null;
      }
      if (Object.keys(next).length) await db.update(schema.applications).set(next).where(eq(schema.applications.id, row.id));
      if (next.published !== undefined) await revalidatePortal((m) => req.log.warn(m));
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
      if (!row || !file || !FILE.test(file)) return reply.code(404).send({ ok: false });
      // ASCII-safe file name for the download, from the applicant's name
      const base = row.name.normalize("NFKD").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") || "applicant";
      const name = kind === "cv" ? `CV-${base}.pdf` : `photo-${base}.${file.split(".").pop()}`;
      return sendFile(reply, file, { name, download: !!req.query.download, cache: "private, no-store" });
    },
  );

  /** Public (portal): published submissions of one kind, newest first. No email, religion or CV. */
  const publicList = async (kind: Kind) => {
    const rows = await db
      .select({
        id: schema.applications.id,
        name: schema.applications.name,
        job: schema.applications.job,
        org: schema.applications.org,
        country: schema.applications.country,
        quote: schema.applications.quote,
        article: schema.applications.article,
        experience: schema.applications.experience,
        photo: schema.applications.photo,
        publishedAt: schema.applications.publishedAt,
      })
      .from(schema.applications)
      .where(and(eq(schema.applications.kind, kind), eq(schema.applications.published, true)))
      .orderBy(desc(schema.applications.publishedAt))
      .limit(200);
    return {
      ok: true,
      items: rows.map(({ photo, quote, article, experience, ...r }) => ({
        ...r,
        ...(kind === "voice" ? { quote, article } : { experience }),
        photo: photo ? `/public-photo/${r.id}` : null,
      })),
    };
  };
  app.get("/public/voices", () => publicList("voice"));
  app.get("/public/members", () => publicList("member"));

  /** Public photo of a published submission only (the portal proxies /public-photo/:id). */
  app.get<{ Params: { id: string } }>("/public/photo/:id", async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send();
    const [row] = await db
      .select({ photo: schema.applications.photo, published: schema.applications.published })
      .from(schema.applications)
      .where(eq(schema.applications.id, req.params.id))
      .limit(1);
    if (!row?.published || !row.photo || !FILE.test(row.photo)) return reply.code(404).send();
    return sendFile(reply, row.photo, { name: `photo.${row.photo.split(".").pop()}`, download: false, cache: "public, max-age=300" });
  });
}
