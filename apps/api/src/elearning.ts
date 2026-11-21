import type { FastifyInstance, FastifyReply } from "fastify";
import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db, schema } from "./db/client.js";
import { requireUser } from "./auth/session.js";
import { isPreviewRequest, revalidatePortal } from "./revalidate.js";
import type { I18n } from "./db/schema.js";
import { progressOf } from "./learn.js";

/**
 * E-learning (owner, 2026-11-21): courses and webinars with units and lessons, built in the dashboard.
 * Drafts are visible only in the dashboard; a published course gets a public page with a registration form.
 * Phase 1: registrations are followed up by the team (learner accounts, progress and certificates come later).
 */
const ID = /^[0-9a-f-]{36}$/;
const LANGS = ["en", "fr", "ar"] as const;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VIDEO = /^https:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|live\/)|youtu\.be\/|vimeo\.com\/|player\.vimeo\.com\/video\/)[\w\-?=&./]+$/;
const MEDIA = /^\/media\/[a-f0-9-]{36}\.(pdf|jpg|png|webp)$/;
const SITE_IMAGE = /^(\/media\/[a-f0-9-]{36}\.(jpg|png|webp)|\/[\w\-/]+\.(jpg|jpeg|png|webp))$/;
const HTTPS = /^https:\/\/[^\s]{3,500}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;

const emptyI18n = (): I18n => ({ en: "", fr: "", ar: "" });

/** A { en, fr, ar } object with strings up to `max` characters, or null. */
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
  const root = base || "course";
  for (let i = 0; i < 50; i++) {
    const slug = i ? `${root}-${i + 1}` : root;
    const [hit] = await db.select({ id: schema.courses.id }).from(schema.courses).where(eq(schema.courses.slug, slug)).limit(1);
    if (!hit || hit.id === exceptId) return slug;
  }
  return `${root}-${Date.now()}`;
}

const bad = (reply: FastifyReply, field: string) => reply.code(400).send({ ok: false, error: "invalid", field });

/** Course with its units and lessons, in order. */
async function fullCourse(id: string) {
  const [course] = await db.select().from(schema.courses).where(eq(schema.courses.id, id)).limit(1);
  if (!course) return null;
  const modules = await db.select().from(schema.courseModules).where(eq(schema.courseModules.courseId, id)).orderBy(asc(schema.courseModules.sort));
  const lessons = modules.length
    ? await db
        .select()
        .from(schema.courseLessons)
        .where(inArray(schema.courseLessons.moduleId, modules.map((m) => m.id)))
        .orderBy(asc(schema.courseLessons.sort))
    : [];
  return { ...course, modules: modules.map((m) => ({ ...m, lessons: lessons.filter((l) => l.moduleId === m.id) })) };
}

/** Swap an item with its neighbour (dir -1 = up, 1 = down) inside its list. */
async function move<T extends { id: string; sort: number }>(items: T[], id: string, dir: number, save: (id: string, sort: number) => Promise<unknown>) {
  const sorted = [...items].sort((a, b) => a.sort - b.sort);
  sorted.forEach((it, i) => (it.sort = i));
  const i = sorted.findIndex((it) => it.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sorted.length) return false;
  [sorted[i].sort, sorted[j].sort] = [sorted[j].sort, sorted[i].sort];
  for (const it of sorted) await save(it.id, it.sort);
  return true;
}

/** Marks the course as changed; a published course's page on the site is refreshed. */
async function touch(courseId: string, log: (m: string) => void = () => {}) {
  const [c] = await db.update(schema.courses).set({ updatedAt: new Date() }).where(eq(schema.courses.id, courseId)).returning({ status: schema.courses.status });
  if (c?.status === "published") await revalidatePortal(log);
}

export async function elearningRoutes(app: FastifyInstance) {
  const refresh = (log: (m: string) => void) => revalidatePortal(log);

  /* ---------------- Dashboard ---------------- */

  app.get("/admin/courses", { preHandler: requireUser }, async () => {
    const rows = await db.select().from(schema.courses).orderBy(asc(schema.courses.sort), desc(schema.courses.createdAt));
    const mods = await db.select({ courseId: schema.courseModules.courseId, n: count() }).from(schema.courseModules).groupBy(schema.courseModules.courseId);
    const regs = await db
      .select({ courseId: schema.courseRegistrations.courseId, n: count() })
      .from(schema.courseRegistrations)
      .groupBy(schema.courseRegistrations.courseId);
    const lessonCounts = await db
      .select({ courseId: schema.courseModules.courseId, n: count() })
      .from(schema.courseLessons)
      .innerJoin(schema.courseModules, eq(schema.courseLessons.moduleId, schema.courseModules.id))
      .groupBy(schema.courseModules.courseId);
    const n = (list: { courseId: string; n: number }[], id: string) => list.find((x) => x.courseId === id)?.n ?? 0;
    return {
      ok: true,
      items: rows.map((c) => ({
        id: c.id,
        slug: c.slug,
        kind: c.kind,
        status: c.status,
        title: c.title,
        image: c.image,
        updatedAt: c.updatedAt,
        modules: n(mods, c.id),
        lessons: n(lessonCounts, c.id),
        registrations: n(regs, c.id),
      })),
    };
  });

  /** New draft course or webinar. */
  app.post<{ Body: { kind?: "course" | "webinar"; title?: Partial<I18n> } }>("/admin/courses", { preHandler: requireUser }, async (req, reply) => {
    const kind = req.body?.kind === "webinar" ? "webinar" : "course";
    const title = i18n(req.body?.title ?? {}, 200) ?? emptyI18n();
    if (!title.en && !title.ar && !title.fr) title.en = kind === "webinar" ? "New webinar" : "New course";
    const slug = await uniqueSlug(slugify(title.en || title.fr) || kind);
    const [row] = await db
      .insert(schema.courses)
      .values({
        slug,
        kind,
        title,
        summary: emptyI18n(),
        description: emptyI18n(),
        programmeArea: emptyI18n(),
        duration: emptyI18n(),
        learningTime: emptyI18n(),
        fees: { en: "Free", fr: "Gratuit", ar: "مجاني" },
        format: kind === "webinar" ? "live" : "self-paced",
        languages: ["ar"],
      })
      .returning({ id: schema.courses.id });
    return reply.code(201).send({ ok: true, id: row.id });
  });

  app.get<{ Params: { id: string } }>("/admin/courses/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const course = await fullCourse(req.params.id);
    if (!course) return reply.code(404).send({ ok: false });
    const [regs] = await db.select({ n: count() }).from(schema.courseRegistrations).where(eq(schema.courseRegistrations.courseId, course.id));
    return { ok: true, course, registrations: regs.n };
  });

  /** Update any course field; publishing/unpublishing refreshes the site. */
  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>("/admin/courses/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [row] = await db.select().from(schema.courses).where(eq(schema.courses.id, req.params.id)).limit(1);
    if (!row) return reply.code(404).send({ ok: false });
    const b = req.body ?? {};
    const next: Partial<typeof schema.courses.$inferInsert> = {};
    const texts: [keyof typeof schema.courses.$inferInsert, string, number][] = [
      ["title", "title", 200],
      ["summary", "summary", 600],
      ["description", "description", 8000],
      ["programmeArea", "programmeArea", 200],
      ["duration", "duration", 100],
      ["learningTime", "learningTime", 100],
      ["fees", "fees", 100],
    ];
    for (const [col, key, max] of texts) {
      if (key in b) {
        const v = i18n(b[key], max);
        if (!v) return bad(reply, key);
        (next as Record<string, unknown>)[col] = v;
      }
    }
    if ("kind" in b) {
      if (b.kind !== "course" && b.kind !== "webinar") return bad(reply, "kind");
      next.kind = b.kind;
    }
    if ("format" in b) {
      if (!["self-paced", "instructor-led", "live"].includes(String(b.format))) return bad(reply, "format");
      next.format = b.format as "self-paced" | "instructor-led" | "live";
    }
    if ("languages" in b) {
      if (!Array.isArray(b.languages) || b.languages.some((l) => !(LANGS as readonly string[]).includes(String(l)))) return bad(reply, "languages");
      next.languages = [...new Set(b.languages as string[])];
    }
    for (const key of ["startDate", "deadline"] as const) {
      if (key in b) {
        const v = String(b[key] ?? "");
        if (v && !DATE.test(v)) return bad(reply, key);
        next[key] = v || null;
      }
    }
    for (const key of ["certificate", "registrationOpen"] as const) {
      if (key in b) {
        if (typeof b[key] !== "boolean") return bad(reply, key);
        next[key] = b[key] as boolean;
      }
    }
    if ("image" in b) {
      const v = String(b.image ?? "");
      if (v && !SITE_IMAGE.test(v)) return bad(reply, "image");
      next.image = v;
    }
    if ("flyer" in b) {
      const v = String(b.flyer ?? "");
      if (v && !/^\/media\/[a-f0-9-]{36}\.pdf$/.test(v)) return bad(reply, "flyer");
      next.flyer = v;
    }
    if ("slug" in b) {
      const v = String(b.slug ?? "");
      if (!SLUG.test(v) || v.length > 80) return bad(reply, "slug");
      if ((await uniqueSlug(v, row.id)) !== v) return reply.code(409).send({ ok: false, error: "slug_taken" });
      next.slug = v;
    }
    if ("status" in b) {
      if (b.status !== "draft" && b.status !== "published") return bad(reply, "status");
      // A course can't be published without a title in at least one language
      const title = (next.title ?? row.title) as I18n;
      if (b.status === "published" && !title.en && !title.fr && !title.ar) return bad(reply, "title");
      next.status = b.status;
      if (b.status === "published" && row.status !== "published") next.publishedAt = new Date();
    }
    if (!Object.keys(next).length) return bad(reply, "empty");
    next.updatedAt = new Date();
    await db.update(schema.courses).set(next).where(eq(schema.courses.id, row.id));
    if (row.status === "published" || next.status) await refresh((m) => req.log.warn(m));
    return { ok: true };
  });

  app.delete<{ Params: { id: string } }>("/admin/courses/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const done = await db.delete(schema.courses).where(eq(schema.courses.id, req.params.id)).returning({ status: schema.courses.status });
    if (!done.length) return reply.code(404).send({ ok: false });
    if (done[0].status === "published") await refresh((m) => req.log.warn(m));
    return { ok: true };
  });

  /* Units */
  app.post<{ Params: { id: string }; Body: { title?: Partial<I18n> } }>("/admin/courses/:id/modules", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [c] = await db.select({ id: schema.courses.id }).from(schema.courses).where(eq(schema.courses.id, req.params.id)).limit(1);
    if (!c) return reply.code(404).send({ ok: false });
    const [last] = await db
      .select({ sort: schema.courseModules.sort })
      .from(schema.courseModules)
      .where(eq(schema.courseModules.courseId, c.id))
      .orderBy(desc(schema.courseModules.sort))
      .limit(1);
    const title = i18n(req.body?.title ?? {}, 200) ?? emptyI18n();
    const [row] = await db
      .insert(schema.courseModules)
      .values({ courseId: c.id, sort: (last?.sort ?? -1) + 1, title, summary: emptyI18n() })
      .returning({ id: schema.courseModules.id });
    await touch(c.id, (m) => req.log.warn(m));
    return reply.code(201).send({ ok: true, id: row.id });
  });

  app.patch<{ Params: { id: string }; Body: { title?: unknown; summary?: unknown; move?: number } }>("/admin/modules/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [m] = await db.select().from(schema.courseModules).where(eq(schema.courseModules.id, req.params.id)).limit(1);
    if (!m) return reply.code(404).send({ ok: false });
    const b = req.body ?? {};
    if (b.move === -1 || b.move === 1) {
      const siblings = await db.select().from(schema.courseModules).where(eq(schema.courseModules.courseId, m.courseId));
      await move(siblings, m.id, b.move, (id, sort) => db.update(schema.courseModules).set({ sort }).where(eq(schema.courseModules.id, id)));
    }
    const next: Partial<typeof schema.courseModules.$inferInsert> = {};
    if ("title" in b) {
      const v = i18n(b.title, 200);
      if (!v) return bad(reply, "title");
      next.title = v;
    }
    if ("summary" in b) {
      const v = i18n(b.summary, 1000);
      if (!v) return bad(reply, "summary");
      next.summary = v;
    }
    if (Object.keys(next).length) await db.update(schema.courseModules).set(next).where(eq(schema.courseModules.id, m.id));
    await touch(m.courseId, (m2) => req.log.warn(m2));
    return { ok: true };
  });

  app.delete<{ Params: { id: string } }>("/admin/modules/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const done = await db.delete(schema.courseModules).where(eq(schema.courseModules.id, req.params.id)).returning({ courseId: schema.courseModules.courseId });
    if (!done.length) return reply.code(404).send({ ok: false });
    await touch(done[0].courseId, (m) => req.log.warn(m));
    return { ok: true };
  });

  /* Lessons */
  app.post<{ Params: { id: string }; Body: { type?: string; title?: Partial<I18n> } }>("/admin/modules/:id/lessons", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [m] = await db.select().from(schema.courseModules).where(eq(schema.courseModules.id, req.params.id)).limit(1);
    if (!m) return reply.code(404).send({ ok: false });
    const type = ["video", "file", "text", "link"].includes(String(req.body?.type)) ? (req.body!.type as "video" | "file" | "text" | "link") : "video";
    const [last] = await db
      .select({ sort: schema.courseLessons.sort })
      .from(schema.courseLessons)
      .where(eq(schema.courseLessons.moduleId, m.id))
      .orderBy(desc(schema.courseLessons.sort))
      .limit(1);
    const [row] = await db
      .insert(schema.courseLessons)
      .values({ moduleId: m.id, sort: (last?.sort ?? -1) + 1, type, title: i18n(req.body?.title ?? {}, 200) ?? emptyI18n(), body: emptyI18n() })
      .returning({ id: schema.courseLessons.id });
    await touch(m.courseId, (m2) => req.log.warn(m2));
    return reply.code(201).send({ ok: true, id: row.id });
  });

  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>("/admin/lessons/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [l] = await db
      .select({ lesson: schema.courseLessons, courseId: schema.courseModules.courseId })
      .from(schema.courseLessons)
      .innerJoin(schema.courseModules, eq(schema.courseLessons.moduleId, schema.courseModules.id))
      .where(eq(schema.courseLessons.id, req.params.id))
      .limit(1);
    if (!l) return reply.code(404).send({ ok: false });
    const b = req.body ?? {};
    if (b.move === -1 || b.move === 1) {
      const siblings = await db.select().from(schema.courseLessons).where(eq(schema.courseLessons.moduleId, l.lesson.moduleId));
      await move(siblings, l.lesson.id, b.move as number, (id, sort) => db.update(schema.courseLessons).set({ sort }).where(eq(schema.courseLessons.id, id)));
    }
    const next: Partial<typeof schema.courseLessons.$inferInsert> = {};
    if ("type" in b) {
      if (!["video", "file", "text", "link"].includes(String(b.type))) return bad(reply, "type");
      next.type = b.type as "video" | "file" | "text" | "link";
    }
    if ("title" in b) {
      const v = i18n(b.title, 200);
      if (!v) return bad(reply, "title");
      next.title = v;
    }
    if ("body" in b) {
      const v = i18n(b.body, 20000);
      if (!v) return bad(reply, "body");
      next.body = v;
    }
    if ("videoUrl" in b) {
      const v = String(b.videoUrl ?? "").trim();
      if (v && !VIDEO.test(v)) return bad(reply, "videoUrl");
      next.videoUrl = v;
    }
    if ("fileUrl" in b) {
      const v = String(b.fileUrl ?? "");
      if (v && !MEDIA.test(v)) return bad(reply, "fileUrl");
      next.fileUrl = v;
    }
    if ("linkUrl" in b) {
      const v = String(b.linkUrl ?? "").trim();
      if (v && !HTTPS.test(v)) return bad(reply, "linkUrl");
      next.linkUrl = v;
    }
    if ("minutes" in b) {
      const v = Number(b.minutes);
      if (!Number.isInteger(v) || v < 0 || v > 1000) return bad(reply, "minutes");
      next.minutes = v;
    }
    if (Object.keys(next).length) await db.update(schema.courseLessons).set(next).where(eq(schema.courseLessons.id, l.lesson.id));
    await touch(l.courseId, (m) => req.log.warn(m));
    return { ok: true };
  });

  app.delete<{ Params: { id: string } }>("/admin/lessons/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const done = await db.delete(schema.courseLessons).where(eq(schema.courseLessons.id, req.params.id)).returning({ moduleId: schema.courseLessons.moduleId });
    if (!done.length) return reply.code(404).send({ ok: false });
    const [m] = await db.select({ courseId: schema.courseModules.courseId }).from(schema.courseModules).where(eq(schema.courseModules.id, done[0].moduleId)).limit(1);
    if (m) await touch(m.courseId, (msg) => req.log.warn(msg));
    return { ok: true };
  });

  /* Registrations */
  app.get<{ Params: { id: string } }>("/admin/courses/:id/registrations", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const rows = await db
      .select()
      .from(schema.courseRegistrations)
      .where(eq(schema.courseRegistrations.courseId, req.params.id))
      .orderBy(desc(schema.courseRegistrations.createdAt));
    // Participants with an account: lessons done out of the course's lessons (phase 2)
    const items = [];
    for (const r of rows) items.push({ ...r, progress: r.learnerId ? await progressOf(r.learnerId, r.courseId) : null });
    return { ok: true, items };
  });

  app.patch<{ Params: { id: string }; Body: { status: "new" | "accepted" | "rejected" } }>(
    "/admin/registrations/:id",
    {
      preHandler: requireUser,
      schema: { body: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["new", "accepted", "rejected"] } }, additionalProperties: false } },
    },
    async (req, reply) => {
      if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
      const done = await db
        .update(schema.courseRegistrations)
        .set({ status: req.body.status })
        .where(eq(schema.courseRegistrations.id, req.params.id))
        .returning({ id: schema.courseRegistrations.id });
      if (!done.length) return reply.code(404).send({ ok: false });
      return { ok: true };
    },
  );

  /* ---------------- Public (portal) ---------------- */

  /** Published courses and webinars (cards). */
  app.get("/public/courses", async (req) => {
    // Preview (team only): drafts too
    const preview = isPreviewRequest(req.headers);
    const rows = await db
      .select()
      .from(schema.courses)
      .where(preview ? undefined : eq(schema.courses.status, "published"))
      .orderBy(asc(schema.courses.sort), desc(schema.courses.publishedAt));
    const mods = await db.select({ courseId: schema.courseModules.courseId, n: count() }).from(schema.courseModules).groupBy(schema.courseModules.courseId);
    return {
      ok: true,
      items: rows.map((c) => ({
        slug: c.slug,
        kind: c.kind,
        title: c.title,
        summary: c.summary,
        format: c.format,
        image: c.image,
        certificate: c.certificate,
        languages: c.languages,
        modules: mods.find((m) => m.courseId === c.id)?.n ?? 0,
      })),
    };
  });

  /** One published course: details + unit and lesson titles (lesson content is for registered learners, later). */
  app.get<{ Params: { slug: string } }>("/public/courses/:slug", async (req, reply) => {
    if (!SLUG.test(req.params.slug)) return reply.code(404).send({ ok: false });
    const [c] = await db
      .select({ id: schema.courses.id })
      .from(schema.courses)
      .where(isPreviewRequest(req.headers) ? eq(schema.courses.slug, req.params.slug) : and(eq(schema.courses.slug, req.params.slug), eq(schema.courses.status, "published")))
      .limit(1);
    if (!c) return reply.code(404).send({ ok: false });
    const full = await fullCourse(c.id);
    if (!full) return reply.code(404).send({ ok: false });
    const { id: _id, status: _s, sort: _o, createdAt: _c, updatedAt: _u, ...pub } = full;
    return {
      ok: true,
      course: {
        ...pub,
        modules: full.modules.map((m) => ({
          title: m.title,
          summary: m.summary,
          lessons: m.lessons.map((l) => ({ title: l.title, type: l.type, minutes: l.minutes })),
        })),
      },
    };
  });

  /** Register for a published course (honeypot `website`). */
  app.post<{ Params: { slug: string }; Body: { name: string; email: string; country: string; locale?: string; website?: string } }>(
    "/public/courses/:slug/register",
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
      const [c] = await db
        .select({ id: schema.courses.id, open: schema.courses.registrationOpen })
        .from(schema.courses)
        .where(and(eq(schema.courses.slug, req.params.slug), eq(schema.courses.status, "published")))
        .limit(1);
      if (!c) return reply.code(404).send({ ok: false });
      if (!c.open) return reply.code(409).send({ ok: false, error: "closed" });
      await db.insert(schema.courseRegistrations).values({
        courseId: c.id,
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        country: req.body.country,
        locale: req.body.locale ?? "en",
      });
      return reply.code(201).send({ ok: true });
    },
  );
}
