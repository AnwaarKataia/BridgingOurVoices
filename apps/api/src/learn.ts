import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { and, asc, count, eq, gt, inArray, lt, ne } from "drizzle-orm";
import { db, schema } from "./db/client.js";
import { dummyHash, hashPassword, passwordProblem, verifyPassword } from "./auth/password.js";
import { isPreviewRequest } from "./revalidate.js";
import { createReadStream } from "node:fs";
import { stat, unlink } from "node:fs/promises";
import { join } from "node:path";
import { dataDir } from "./db/client.js";
import { saveUpload } from "./store.js";
import { imageType } from "./network.js";
import { requireUser } from "./auth/session.js";

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
const PHOTO_MAX = 3 * 1024 * 1024;
const dashboardUrl = (process.env.DASHBOARD_URL ?? "http://localhost:3002").replace(/\/$/, "");

async function sendPhoto(reply: FastifyReply, file: string) {
  if (!/^learner-[0-9a-f-]{36}\.(jpg|png)$/.test(file)) return reply.code(404).send();
  const path = join(dataDir, "uploads", file);
  try {
    await stat(path);
  } catch {
    return reply.code(404).send();
  }
  return reply
    .header("Content-Type", file.endsWith(".png") ? "image/png" : "image/jpeg")
    .header("Cache-Control", "private, no-store")
    .header("X-Content-Type-Options", "nosniff")
    .send(createReadStream(path));
}

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

const publicLearner = (l: Learner) => ({ name: l.name, email: l.email, country: l.country, id: l.id, hasPhoto: !!l.photo });

/** The learner's registration for a course, if any (rejected = access removed by the team). */
async function enrolment(learnerId: string, courseId: string) {
  const [r] = await db
    .select()
    .from(schema.courseRegistrations)
    .where(and(eq(schema.courseRegistrations.learnerId, learnerId), eq(schema.courseRegistrations.courseId, courseId)))
    .limit(1);
  return r ?? null;
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
   * The course for the player: lessons with content, done / locked state, unit quizzes (without the correct
   * answers) and their best result. Only for learners who joined (and weren't removed), or the team's preview.
   * Owner, 2026-11-21: lessons open in order; the next unit opens once the unit quiz is passed.
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
    const state = await courseState(c.id, learner?.id ?? null);
    return {
      ok: true,
      learner: learner ? { id: learner.id, name: learner.name } : null,
      course: {
        slug: c.slug,
        kind: c.kind,
        title: c.title,
        certificate: c.certificate,
        progress: state.progress,
        modules: state.modules.map((m) => ({
          id: m.id,
          title: m.title,
          summary: m.summary,
          lessons: m.lessons.map((l) => ({
            id: l.id,
            type: l.type,
            title: l.title,
            body: l.body,
            videoUrl: l.videoUrl,
            fileUrl: l.fileUrl,
            linkUrl: l.linkUrl,
            minutes: l.minutes,
            done: l.done,
            locked: l.locked,
            /** Seconds still needed before "Mark as done" (time spent on the lesson). */
            waitSeconds: l.waitSeconds,
          })),
          quiz: m.quiz
            ? {
                passMark: m.quiz.passMark,
                locked: m.quiz.locked,
                best: m.quiz.best,
                questions: m.quiz.questions.map((q) => ({ id: q.id, text: q.text, options: q.options })),
              }
            : null,
        })),
      },
    };
  });

  /** First time a learner opens a lesson (starts the time needed before "Mark as done"). */
  app.post<{ Params: { id: string } }>("/learn/lessons/:id/open", { preHandler: requireLearner }, async (req, reply) => {
    const found = await lessonForLearner(req.params.id, req.learner!.id);
    if (!found) return reply.code(404).send({ ok: false });
    if (found.lesson.locked) return reply.code(409).send({ ok: false, error: "locked" });
    await db.insert(schema.lessonOpens).values({ learnerId: req.learner!.id, lessonId: found.lesson.id }).onConflictDoNothing();
    return { ok: true };
  });

  /**
   * Mark a lesson as done (or not done). Done needs the lesson to be open (previous steps finished), opened
   * before, and enough time on it: half of its length in minutes. The player also requires the whole video to
   * be watched or the whole text to be read before the button turns on.
   */
  app.post<{ Params: { id: string }; Body: { done: boolean } }>(
    "/learn/lessons/:id/progress",
    {
      preHandler: requireLearner,
      schema: { body: { type: "object", required: ["done"], properties: { done: { type: "boolean" } }, additionalProperties: false } },
    },
    async (req, reply) => {
      const found = await lessonForLearner(req.params.id, req.learner!.id);
      if (!found) return reply.code(404).send({ ok: false });
      const { lesson, courseId } = found;
      if (req.body.done) {
        if (lesson.locked) return reply.code(409).send({ ok: false, error: "locked" });
        if (!lesson.opened) return reply.code(409).send({ ok: false, error: "not_opened" });
        if (lesson.waitSeconds > 0) return reply.code(409).send({ ok: false, error: "too_soon", waitSeconds: lesson.waitSeconds });
        await db.insert(schema.lessonProgress).values({ learnerId: req.learner!.id, lessonId: lesson.id }).onConflictDoNothing();
      } else {
        await db.delete(schema.lessonProgress).where(and(eq(schema.lessonProgress.learnerId, req.learner!.id), eq(schema.lessonProgress.lessonId, lesson.id)));
      }
      return { ok: true, progress: await progressOf(req.learner!.id, courseId) };
    },
  );

  /** Submit a unit quiz: graded here (the correct answers never leave the API). */
  app.post<{ Params: { id: string }; Body: { answers: Record<string, string> } }>(
    "/learn/modules/:id/quiz",
    {
      preHandler: requireLearner,
      config: { rateLimit: { max: 20, timeWindow: "10 minutes" } },
      schema: {
        body: {
          type: "object",
          required: ["answers"],
          properties: { answers: { type: "object", maxProperties: 100, additionalProperties: { type: "string", maxLength: 40 } } },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
      const [m] = await db.select().from(schema.courseModules).where(eq(schema.courseModules.id, req.params.id)).limit(1);
      if (!m) return reply.code(404).send({ ok: false });
      const r = await enrolment(req.learner!.id, m.courseId);
      if (!r || r.status === "rejected") return reply.code(403).send({ ok: false });
      const state = await courseState(m.courseId, req.learner!.id);
      const unit = state.modules.find((x) => x.id === m.id);
      if (!unit?.quiz) return reply.code(404).send({ ok: false });
      if (unit.quiz.locked) return reply.code(409).send({ ok: false, error: "locked" });
      const questions = unit.quiz.questions;
      const answers = req.body.answers;
      if (questions.some((q) => !answers[q.id])) return reply.code(400).send({ ok: false, error: "unanswered" });
      const wrong = questions.filter((q) => answers[q.id] !== q.correct).map((q) => q.id);
      const total = questions.length;
      const score = total - wrong.length;
      const percent = Math.round((score / total) * 100);
      const passed = percent >= m.passMark;
      await db.insert(schema.quizAttempts).values({ learnerId: req.learner!.id, moduleId: m.id, score, total, passed, answers });
      // Which questions were wrong, never which option was right
      return { ok: true, score, total, percent, passed, passMark: m.passMark, wrong, progress: await progressOf(req.learner!.id, m.courseId) };
    },
  );

  /**
   * Dashboard (owner, 2026-11-21): everything about one participant: profile, courses joined, progress and
   * unit quiz results. Signed-in team members only.
   */
  app.get<{ Params: { id: string } }>("/admin/learners/:id", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [l] = await db.select().from(schema.learners).where(eq(schema.learners.id, req.params.id)).limit(1);
    if (!l) return reply.code(404).send({ ok: false });
    const regs = await db
      .select({ reg: schema.courseRegistrations, course: schema.courses })
      .from(schema.courseRegistrations)
      .innerJoin(schema.courses, eq(schema.courseRegistrations.courseId, schema.courses.id))
      .where(eq(schema.courseRegistrations.learnerId, l.id));
    const courses = [];
    for (const { reg, course } of regs) {
      const state = await courseState(course.id, l.id);
      const unitIds = state.modules.map((m) => m.id);
      const attempts = unitIds.length
        ? await db
            .select()
            .from(schema.quizAttempts)
            .where(and(eq(schema.quizAttempts.learnerId, l.id), inArray(schema.quizAttempts.moduleId, unitIds)))
            .orderBy(asc(schema.quizAttempts.createdAt))
        : [];
      courses.push({
        courseId: course.id,
        title: course.title,
        registrationId: reg.id,
        status: reg.status,
        joinedAt: reg.createdAt,
        progress: state.progress,
        units: state.modules.map((m) => {
          const mine = attempts.filter((a) => a.moduleId === m.id);
          return {
            title: m.title,
            lessonsDone: m.lessons.filter((x) => x.done).length,
            lessons: m.lessons.length,
            quiz: m.quiz
              ? { passMark: m.quiz.passMark, attempts: mine.length, passed: m.quiz.passed, best: m.quiz.best, last: mine.length ? mine[mine.length - 1].createdAt : null }
              : null,
          };
        }),
      });
    }
    return {
      ok: true,
      learner: {
        id: l.id,
        name: l.name,
        email: l.email,
        country: l.country,
        locale: l.locale,
        job: l.job,
        org: l.org,
        bio: l.bio,
        showProfile: l.showProfile,
        hasPhoto: !!l.photo,
        createdAt: l.createdAt,
        lastLoginAt: l.lastLoginAt,
      },
      courses,
    };
  });

  /* ---------------- Profile photo (owner, 2026-11-21) ---------------- */

  /** Upload or replace the learner's photo (JPG or PNG, up to 3 MB; the real type is checked). */
  app.post("/learn/profile/photo", { preHandler: requireLearner, config: { rateLimit: { max: 20, timeWindow: "10 minutes" } } }, async (req, reply) => {
    let part;
    try {
      part = await req.file({ limits: { fileSize: PHOTO_MAX, files: 1 } });
    } catch {
      return reply.code(400).send({ ok: false, error: "no_file" });
    }
    if (!part) return reply.code(400).send({ ok: false, error: "no_file" });
    let buf: Buffer;
    try {
      buf = await part.toBuffer();
    } catch {
      return reply.code(413).send({ ok: false, error: "too_big" });
    }
    const ext = imageType(buf);
    if (!ext) return reply.code(400).send({ ok: false, error: "not_image" });
    const l = req.learner!;
    const file = `learner-${l.id}.${ext}`;
    if (l.photo && l.photo !== file) await unlink(join(dataDir, "uploads", l.photo)).catch(() => undefined);
    await saveUpload(file, buf);
    await db.update(schema.learners).set({ photo: file }).where(eq(schema.learners.id, l.id));
    return reply.code(201).send({ ok: true });
  });

  app.delete("/learn/profile/photo", { preHandler: requireLearner }, async (req) => {
    const l = req.learner!;
    if (l.photo) await unlink(join(dataDir, "uploads", l.photo)).catch(() => undefined);
    await db.update(schema.learners).set({ photo: null }).where(eq(schema.learners.id, l.id));
    return { ok: true };
  });

  /** A participant's photo, under the same rule as their profile (self, or a shared course and shown). */
  app.get<{ Params: { id: string } }>("/learn/people/:id/photo", { preHandler: requireLearner }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send();
    const [l] = await db.select().from(schema.learners).where(eq(schema.learners.id, req.params.id)).limit(1);
    if (!l?.photo || !(await canSeeProfile(req.learner!.id, l))) return reply.code(404).send();
    return sendPhoto(reply, l.photo);
  });

  /** Dashboard: a participant's photo. */
  app.get<{ Params: { id: string } }>("/admin/learners/:id/photo", { preHandler: requireUser }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send();
    const [l] = await db.select({ photo: schema.learners.photo }).from(schema.learners).where(eq(schema.learners.id, req.params.id)).limit(1);
    if (!l?.photo) return reply.code(404).send();
    return sendPhoto(reply, l.photo);
  });

  /* ---------------- One sign-in for the website (owner, 2026-11-21) ---------------- */

  /**
   * The website's sign-in form: a team account (dashboard user) gets a one-time link to the dashboard;
   * a learner account is signed in on the website. Team accounts are checked first.
   */
  app.post<{ Body: { email: string; password: string } }>(
    "/learn/signin",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
          hook: "preHandler",
          keyGenerator: (req) => `signin|${String((req.body as { email?: string })?.email ?? "").toLowerCase()}|${req.ip}`,
        },
      },
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: { email: { type: "string", maxLength: 254 }, password: { type: "string", minLength: 1, maxLength: 200 } },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const email = req.body.email.trim().toLowerCase();
      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      const teamOk = await verifyPassword(req.body.password, user?.passwordHash ?? dummyHash);
      if (user && teamOk && !user.disabled) {
        const token = randomBytes(32).toString("base64url");
        await db.delete(schema.loginHandoffs).where(lt(schema.loginHandoffs.expiresAt, new Date()));
        await db.insert(schema.loginHandoffs).values({ id: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + 60 * 1000) });
        return { ok: true, kind: "team", redirect: `${dashboardUrl}/handoff?token=${token}` };
      }
      const [l] = await db.select().from(schema.learners).where(eq(schema.learners.email, email)).limit(1);
      const learnerOk = await verifyPassword(req.body.password, l?.passwordHash ?? dummyHash);
      if (!l || !learnerOk) return reply.code(401).send({ ok: false, error: "invalid" });
      await db.update(schema.learners).set({ lastLoginAt: new Date() }).where(eq(schema.learners.id, l.id));
      await startLearnerSession(reply, l.id);
      return { ok: true, kind: "learner" };
    },
  );

  /* ---------------- Profile and participants (owner, 2026-11-21) ---------------- */

  const profileOf = (l: Learner) => ({ id: l.id, name: l.name, email: l.email, country: l.country, job: l.job, org: l.org, bio: l.bio, showProfile: l.showProfile, hasPhoto: !!l.photo });
  const publicProfile = (l: Pick<Learner, "id" | "name" | "country" | "job" | "org" | "bio" | "photo">) => ({ id: l.id, name: l.name, country: l.country, job: l.job, org: l.org, bio: l.bio, hasPhoto: !!l.photo });

  app.get("/learn/profile", { preHandler: requireLearner }, async (req) => ({ ok: true, profile: profileOf(req.learner!) }));

  app.patch<{ Body: { name: string; country: string; job: string; org: string; bio: string; showProfile: boolean } }>(
    "/learn/profile",
    {
      preHandler: requireLearner,
      schema: {
        body: {
          type: "object",
          required: ["name", "country", "job", "org", "bio", "showProfile"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 120 },
            country: { type: "string", pattern: "^[A-Z]{2}$" },
            job: { type: "string", maxLength: 120 },
            org: { type: "string", maxLength: 160 },
            bio: { type: "string", maxLength: 1500 },
            showProfile: { type: "boolean" },
          },
          additionalProperties: false,
        },
      },
    },
    async (req) => {
      const b = req.body;
      const [l] = await db
        .update(schema.learners)
        .set({ name: b.name.trim(), country: b.country, job: b.job.trim(), org: b.org.trim(), bio: b.bio.trim(), showProfile: b.showProfile })
        .where(eq(schema.learners.id, req.learner!.id))
        .returning();
      // Keep the name on the team's participant list in step
      await db.update(schema.courseRegistrations).set({ name: l.name, country: l.country }).where(eq(schema.courseRegistrations.learnerId, l.id));
      return { ok: true, profile: profileOf(l) };
    },
  );

  /** Ids of the courses a learner has joined (not removed). */
  async function joinedCourses(learnerId: string) {
    const rows = await db
      .select({ courseId: schema.courseRegistrations.courseId })
      .from(schema.courseRegistrations)
      .where(and(eq(schema.courseRegistrations.learnerId, learnerId), ne(schema.courseRegistrations.status, "rejected")));
    return rows.map((r) => r.courseId);
  }

  /** The other participants of a course who show their profile. For learners of that course only. */
  app.get<{ Params: { slug: string } }>("/learn/courses/:slug/people", { preHandler: requireLearner }, async (req, reply) => {
    if (!SLUG.test(req.params.slug)) return reply.code(404).send({ ok: false });
    const [c] = await db.select({ id: schema.courses.id }).from(schema.courses).where(eq(schema.courses.slug, req.params.slug)).limit(1);
    if (!c) return reply.code(404).send({ ok: false });
    const r = await enrolment(req.learner!.id, c.id);
    if (!r || r.status === "rejected") return reply.code(403).send({ ok: false });
    const rows = await db
      .select({ l: schema.learners })
      .from(schema.courseRegistrations)
      .innerJoin(schema.learners, eq(schema.courseRegistrations.learnerId, schema.learners.id))
      .where(and(eq(schema.courseRegistrations.courseId, c.id), ne(schema.courseRegistrations.status, "rejected")));
    const items = rows.map((x) => x.l).filter((l) => l.showProfile || l.id === req.learner!.id);
    return { ok: true, items: items.map((l) => ({ ...publicProfile(l), bio: l.bio.slice(0, 160), me: l.id === req.learner!.id })) };
  });

  /** Self, or (profile shown and) a course in common. */
  async function canSeeProfile(viewerId: string, l: Learner) {
    if (l.id === viewerId) return true;
    if (!l.showProfile) return false;
    const mine = new Set(await joinedCourses(viewerId));
    return (await joinedCourses(l.id)).some((id) => mine.has(id));
  }

  /** One participant's profile: for learners who share a course with them (and only if they show it). */
  app.get<{ Params: { id: string } }>("/learn/people/:id", { preHandler: requireLearner }, async (req, reply) => {
    if (!ID.test(req.params.id)) return reply.code(404).send({ ok: false });
    const [l] = await db.select().from(schema.learners).where(eq(schema.learners.id, req.params.id)).limit(1);
    if (!l) return reply.code(404).send({ ok: false });
    const me = req.learner!;
    if (!(await canSeeProfile(me.id, l))) return reply.code(404).send({ ok: false });
    // The email only on one's own page
    return { ok: true, profile: { ...publicProfile(l), me: l.id === me.id, ...(l.id === me.id ? { email: l.email } : {}) } };
  });
}

/* ---------------- Course state (order, locks, time, quizzes) ---------------- */

const MIN_TIME_SHARE = 0.5;

type QuizQuestion = typeof schema.quizQuestions.$inferSelect;
type StateLesson = typeof schema.courseLessons.$inferSelect & { done: boolean; locked: boolean; opened: boolean; waitSeconds: number };
type StateModule = typeof schema.courseModules.$inferSelect & {
  lessons: StateLesson[];
  quiz: { passMark: number; locked: boolean; passed: boolean; best: { score: number; total: number; passed: boolean } | null; questions: QuizQuestion[] } | null;
};

/**
 * Everything the player and the rules need for one course and one learner (or none: the team's preview, where
 * nothing is locked). Steps go in order: each lesson opens when the previous one is done, and a unit's quiz
 * (if it has questions) must be passed before the next unit opens.
 */
async function courseState(courseId: string, learnerId: string | null) {
  const modules = await db.select().from(schema.courseModules).where(eq(schema.courseModules.courseId, courseId)).orderBy(asc(schema.courseModules.sort));
  const moduleIds = modules.map((m) => m.id);
  const lessons = moduleIds.length
    ? await db.select().from(schema.courseLessons).where(inArray(schema.courseLessons.moduleId, moduleIds)).orderBy(asc(schema.courseLessons.sort))
    : [];
  const questions = moduleIds.length
    ? await db.select().from(schema.quizQuestions).where(inArray(schema.quizQuestions.moduleId, moduleIds)).orderBy(asc(schema.quizQuestions.sort))
    : [];
  const lessonIds = lessons.map((l) => l.id);
  const done = new Set<string>();
  const opened = new Map<string, Date>();
  const attempts: (typeof schema.quizAttempts.$inferSelect)[] = [];
  if (learnerId && lessonIds.length) {
    for (const r of await db
      .select({ id: schema.lessonProgress.lessonId })
      .from(schema.lessonProgress)
      .where(and(eq(schema.lessonProgress.learnerId, learnerId), inArray(schema.lessonProgress.lessonId, lessonIds))))
      done.add(r.id);
    for (const r of await db
      .select()
      .from(schema.lessonOpens)
      .where(and(eq(schema.lessonOpens.learnerId, learnerId), inArray(schema.lessonOpens.lessonId, lessonIds))))
      opened.set(r.lessonId, r.openedAt);
  }
  if (learnerId && moduleIds.length) {
    attempts.push(
      ...(await db.select().from(schema.quizAttempts).where(and(eq(schema.quizAttempts.learnerId, learnerId), inArray(schema.quizAttempts.moduleId, moduleIds)))),
    );
  }
  const now = Date.now();
  let open = true; // everything so far is finished
  const out: StateModule[] = modules.map((m) => {
    const ls: StateLesson[] = lessons
      .filter((l) => l.moduleId === m.id)
      .map((l) => {
        const isDone = done.has(l.id);
        const openedAt = opened.get(l.id);
        const needed = Math.round(l.minutes * 60 * MIN_TIME_SHARE);
        const spent = openedAt ? Math.floor((now - openedAt.getTime()) / 1000) : 0;
        const item: StateLesson = {
          ...l,
          done: isDone,
          locked: learnerId ? !open && !isDone : false,
          opened: !!openedAt,
          waitSeconds: learnerId && !isDone ? Math.max(0, needed - spent) : 0,
        };
        if (learnerId && !isDone) open = false;
        return item;
      });
    const qs = questions.filter((q) => q.moduleId === m.id);
    let quiz: StateModule["quiz"] = null;
    if (qs.length) {
      const mine = attempts.filter((a) => a.moduleId === m.id);
      const passed = mine.some((a) => a.passed);
      const best = mine.length ? mine.reduce((a, b) => (b.score / b.total > a.score / a.total ? b : a)) : null;
      quiz = {
        passMark: m.passMark,
        locked: learnerId ? !open : false,
        passed,
        best: best ? { score: best.score, total: best.total, passed } : null,
        questions: qs,
      };
      if (learnerId && !passed) open = false;
    }
    return { ...m, lessons: ls, quiz };
  });
  const steps = out.flatMap((m) => [...m.lessons.map((l) => l.done), ...(m.quiz ? [m.quiz.passed] : [])]);
  return { modules: out, progress: { done: steps.filter(Boolean).length, total: steps.length } };
}

/** Lessons + quizzes done out of the course's total (dashboard participants, "My learning"). */
export async function progressOf(learnerId: string, courseId: string) {
  return (await courseState(courseId, learnerId)).progress;
}

/** A lesson with its state for this learner, if they joined its course. */
async function lessonForLearner(lessonId: string, learnerId: string) {
  if (!ID.test(lessonId)) return null;
  const [row] = await db
    .select({ courseId: schema.courseModules.courseId })
    .from(schema.courseLessons)
    .innerJoin(schema.courseModules, eq(schema.courseLessons.moduleId, schema.courseModules.id))
    .where(eq(schema.courseLessons.id, lessonId))
    .limit(1);
  if (!row) return null;
  const r = await enrolment(learnerId, row.courseId);
  if (!r || r.status === "rejected") return null;
  const state = await courseState(row.courseId, learnerId);
  const lesson = state.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId);
  return lesson ? { lesson, courseId: row.courseId } : null;
}
