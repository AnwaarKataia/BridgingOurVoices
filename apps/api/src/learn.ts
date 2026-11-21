import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, asc, count, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { db, schema } from "./db/client.js";
import { dummyHash, hashPassword, passwordProblem, verifyPassword } from "./auth/password.js";
import { isPreviewRequest } from "./revalidate.js";

/**
 * E-learning phase 2 (owner, 2026-11-21): learner accounts on the public site.
 * A learner signs up, joins a published course, watches its lessons and marks them as done.
 * The portal reaches these routes through its own /learn-api rewrite, so the cookie belongs to the site.
 * Learners are separate from dashboard users and can never reach /admin routes.
 */
export const LEARNER_COOKIE = "bov_learner";
const SESSION_DAYS = 30;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID = /^[0-9a-f-]{36}$/;
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
const cookieOptions = () => ({ path: "/", httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" });

type Learner = typeof schema.learners.$inferSelect;
declare module "fastify" {
  interface FastifyRequest {
    learner: Learner | null;
  }
}

async function startLearnerSession(reply: FastifyReply, learnerId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(schema.learnerSessions).where(and(eq(schema.learnerSessions.learnerId, learnerId), lt(schema.learnerSessions.expiresAt, new Date())));
  await db.insert(schema.learnerSessions).values({ id: hashToken(token), learnerId, expiresAt });
  reply.setCookie(LEARNER_COOKIE, token, { ...cookieOptions(), expires: expiresAt });
}

async function sessionLearner(req: FastifyRequest): Promise<Learner | null> {
  const token = req.cookies[LEARNER_COOKIE];
  if (!token) return null;
  const rows = await db
    .select({ learner: schema.learners })
    .from(schema.learnerSessions)
    .innerJoin(schema.learners, eq(schema.learnerSessions.learnerId, schema.learners.id))
    .where(and(eq(schema.learnerSessions.id, hashToken(token)), gt(schema.learnerSessions.expiresAt, new Date())))
    .limit(1);
  return rows[0]?.learner ?? null;
}

async function requireLearner(req: FastifyRequest, reply: FastifyReply) {
  req.learner = await sessionLearner(req);
  if (!req.learner) return reply.code(401).send({ ok: false, error: "unauthorized" });
}

const publicLearner = (l: Learner) => ({ name: l.name, email: l.email, country: l.country });

/** The learner's registration for a course, if any (rejected = access removed by the team). */
async function enrolment(learnerId: string, courseId: string) {
  const [r] = await db
    .select()
    .from(schema.courseRegistrations)
    .where(and(eq(schema.courseRegistrations.learnerId, learnerId), eq(schema.courseRegistrations.courseId, courseId)))
    .limit(1);
  return r ?? null;
}

/** Lesson ids of a course, in order. */
async function courseLessonIds(courseId: string) {
  const rows = await db
    .select({ id: schema.courseLessons.id })
    .from(schema.courseLessons)
    .innerJoin(schema.courseModules, eq(schema.courseLessons.moduleId, schema.courseModules.id))
    .where(eq(schema.courseModules.courseId, courseId));
  return rows.map((r) => r.id);
}

/** Done / total lessons for one learner in one course. */
export async function progressOf(learnerId: string, courseId: string) {
  const ids = await courseLessonIds(courseId);
  if (!ids.length) return { done: 0, total: 0 };
  const [{ n }] = await db
    .select({ n: count() })
    .from(schema.lessonProgress)
    .where(and(eq(schema.lessonProgress.learnerId, learnerId), inArray(schema.lessonProgress.lessonId, ids)));
  return { done: n, total: ids.length };
}

export async function learnRoutes(app: FastifyInstance) {
  app.decorateRequest("learner", null);

  /* ---------------- Account ---------------- */

  app.post<{ Body: { name: string; email: string; country: string; password: string; locale?: string; website?: string } }>(
    "/learn/signup",
    {
      config: { rateLimit: { max: 5, timeWindow: "10 minutes" } },
      schema: {
        body: {
          type: "object",
          required: ["name", "email", "country", "password"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 120 },
            email: { type: "string", maxLength: 254 },
            country: { type: "string", pattern: "^[A-Z]{2}$" },
            password: { type: "string", maxLength: 200 },
            locale: { type: "string", enum: ["en", "fr", "ar"] },
            website: { type: "string", maxLength: 200 },
          },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      if (req.body.website) return reply.code(201).send({ ok: true });
      const email = req.body.email.trim().toLowerCase();
      if (!isEmail(email)) return reply.code(400).send({ ok: false, errors: ["email"] });
      const weak = passwordProblem(req.body.password);
      if (weak) return reply.code(400).send({ ok: false, errors: ["password"], weak });
      const [exists] = await db.select({ id: schema.learners.id }).from(schema.learners).where(eq(schema.learners.email, email)).limit(1);
      if (exists) return reply.code(409).send({ ok: false, error: "exists" });
      const [l] = await db
        .insert(schema.learners)
        .values({
          email,
          name: req.body.name.trim(),
          country: req.body.country,
          locale: req.body.locale ?? "en",
          passwordHash: await hashPassword(req.body.password),
          lastLoginAt: new Date(),
        })
        .returning();
      await startLearnerSession(reply, l.id);
      return reply.code(201).send({ ok: true, learner: publicLearner(l) });
    },
  );

  app.post<{ Body: { email: string; password: string } }>(
    "/learn/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
          hook: "preHandler",
          keyGenerator: (req) => `${String((req.body as { email?: string })?.email ?? "").toLowerCase()}|${req.ip}`,
        },
      },
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: { email: { type: "string", maxLength: 254 }, password: { type: "string", maxLength: 200 } },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const email = req.body.email.trim().toLowerCase();
      const [l] = await db.select().from(schema.learners).where(eq(schema.learners.email, email)).limit(1);
      const ok = await verifyPassword(req.body.password, l?.passwordHash ?? dummyHash);
      if (!l || !ok) return reply.code(401).send({ ok: false, error: "invalid" });
      await db.update(schema.learners).set({ lastLoginAt: new Date() }).where(eq(schema.learners.id, l.id));
      await startLearnerSession(reply, l.id);
      return { ok: true, learner: publicLearner(l) };
    },
  );

  app.post("/learn/logout", async (req, reply) => {
    const token = req.cookies[LEARNER_COOKIE];
    if (token) await db.delete(schema.learnerSessions).where(eq(schema.learnerSessions.id, hashToken(token)));
    reply.clearCookie(LEARNER_COOKIE, cookieOptions());
    return { ok: true };
  });

  app.get("/learn/me", { preHandler: requireLearner }, async (req) => ({ ok: true, learner: publicLearner(req.learner!) }));

  /* ---------------- Courses ---------------- */

  /** The learner's courses with progress. */
  app.get("/learn/my", { preHandler: requireLearner }, async (req) => {
    const rows = await db
      .select({ reg: schema.courseRegistrations, course: schema.courses })
      .from(schema.courseRegistrations)
      .innerJoin(schema.courses, eq(schema.courseRegistrations.courseId, schema.courses.id))
      .where(and(eq(schema.courseRegistrations.learnerId, req.learner!.id), ne(schema.courseRegistrations.status, "rejected"), eq(schema.courses.status, "published")));
    const items = [];
    for (const { reg, course } of rows) {
      items.push({
        slug: course.slug,
        kind: course.kind,
        title: course.title,
        image: course.image,
        certificate: course.certificate,
        joinedAt: reg.createdAt,
        progress: await progressOf(req.learner!.id, course.id),
      });
    }
    return { ok: true, items };
  });

  /** Whether the signed-in learner has joined a course (for the course page's button). */
  app.get<{ Params: { slug: string } }>("/learn/courses/:slug/status", { preHandler: requireLearner }, async (req, reply) => {
    if (!SLUG.test(req.params.slug)) return reply.code(404).send({ ok: false });
    const [c] = await db.select({ id: schema.courses.id }).from(schema.courses).where(eq(schema.courses.slug, req.params.slug)).limit(1);
    if (!c) return reply.code(404).send({ ok: false });
    const r = await enrolment(req.learner!.id, c.id);
    return { ok: true, joined: !!r && r.status !== "rejected", removed: r?.status === "rejected" };
  });

  /** Join a published course whose registration is open. Also appears in the dashboard's registrations. */
  app.post<{ Params: { slug: string } }>(
    "/learn/courses/:slug/join",
    { preHandler: requireLearner, config: { rateLimit: { max: 20, timeWindow: "10 minutes" } } },
    async (req, reply) => {
      if (!SLUG.test(req.params.slug)) return reply.code(404).send({ ok: false });
      const [c] = await db
        .select({ id: schema.courses.id, open: schema.courses.registrationOpen })
        .from(schema.courses)
        .where(and(eq(schema.courses.slug, req.params.slug), eq(schema.courses.status, "published")))
        .limit(1);
      if (!c) return reply.code(404).send({ ok: false });
      const existing = await enrolment(req.learner!.id, c.id);
      if (existing) return existing.status === "rejected" ? reply.code(403).send({ ok: false, error: "removed" }) : { ok: true };
      if (!c.open) return reply.code(409).send({ ok: false, error: "closed" });
      const l = req.learner!;
      await db.insert(schema.courseRegistrations).values({ courseId: c.id, learnerId: l.id, name: l.name, email: l.email, country: l.country, locale: l.locale });
      return reply.code(201).send({ ok: true });
    },
  );

  /**
   * The course with full lesson content and the learner's progress. Only for learners who joined
   * (and weren't removed), or for the team's preview.
   */
  app.get<{ Params: { slug: string } }>("/learn/courses/:slug", async (req, reply) => {
    if (!SLUG.test(req.params.slug)) return reply.code(404).send({ ok: false });
    const preview = isPreviewRequest(req.headers);
    const [c] = await db
      .select()
      .from(schema.courses)
      .where(preview ? eq(schema.courses.slug, req.params.slug) : and(eq(schema.courses.slug, req.params.slug), eq(schema.courses.status, "published")))
      .limit(1);
    if (!c) return reply.code(404).send({ ok: false });
    const learner = await sessionLearner(req);
    if (!preview) {
      if (!learner) return reply.code(401).send({ ok: false, error: "unauthorized" });
      const r = await enrolment(learner.id, c.id);
      if (!r || r.status === "rejected") return reply.code(403).send({ ok: false, error: r ? "removed" : "not_joined" });
    }
    const modules = await db.select().from(schema.courseModules).where(eq(schema.courseModules.courseId, c.id)).orderBy(asc(schema.courseModules.sort));
    const lessons = modules.length
      ? await db
          .select()
          .from(schema.courseLessons)
          .where(inArray(schema.courseLessons.moduleId, modules.map((m) => m.id)))
          .orderBy(asc(schema.courseLessons.sort))
      : [];
    const done = new Set<string>();
    if (learner && lessons.length) {
      const rows = await db
        .select({ id: schema.lessonProgress.lessonId })
        .from(schema.lessonProgress)
        .where(and(eq(schema.lessonProgress.learnerId, learner.id), inArray(schema.lessonProgress.lessonId, lessons.map((l) => l.id))));
      for (const r of rows) done.add(r.id);
    }
    return {
      ok: true,
      course: {
        slug: c.slug,
        kind: c.kind,
        title: c.title,
        certificate: c.certificate,
        modules: modules.map((m) => ({
          id: m.id,
          title: m.title,
          summary: m.summary,
          lessons: lessons
            .filter((l) => l.moduleId === m.id)
            .map((l) => ({ id: l.id, type: l.type, title: l.title, body: l.body, videoUrl: l.videoUrl, fileUrl: l.fileUrl, linkUrl: l.linkUrl, minutes: l.minutes, done: done.has(l.id) })),
        })),
      },
    };
  });

  /** Mark a lesson as done (or not done). */
  app.post<{ Params: { id: string }; Body: { done: boolean } }>(
    "/learn/lessons/:id/progress",
    {
      preHandler: requireLearner,
      schema: { body: { type: "object", required: ["done"], properties: { done: { type: "boolean" } }, additionalProperties: false } },
    },
    async (req, reply) => {
      if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
      const [l] = await db
        .select({ id: schema.courseLessons.id, courseId: schema.courseModules.courseId })
        .from(schema.courseLessons)
        .innerJoin(schema.courseModules, eq(schema.courseLessons.moduleId, schema.courseModules.id))
        .where(eq(schema.courseLessons.id, req.params.id))
        .limit(1);
      if (!l) return reply.code(404).send({ ok: false });
      const r = await enrolment(req.learner!.id, l.courseId);
      if (!r || r.status === "rejected") return reply.code(403).send({ ok: false });
      if (req.body.done) {
        await db.insert(schema.lessonProgress).values({ learnerId: req.learner!.id, lessonId: l.id }).onConflictDoNothing();
      } else {
        await db.delete(schema.lessonProgress).where(and(eq(schema.lessonProgress.learnerId, req.learner!.id), eq(schema.lessonProgress.lessonId, l.id)));
      }
      return { ok: true, progress: await progressOf(req.learner!.id, l.courseId) };
    },
  );
}
