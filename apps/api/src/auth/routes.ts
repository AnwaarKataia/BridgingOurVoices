import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { and, count, eq, isNull } from "drizzle-orm";
import { db, schema } from "../db/client.js";
import { dummyHash, hashPassword, passwordProblem, verifyPassword } from "./password.js";
import { endOtherSessions, endSession, publicUser, requireUser, sessionUser, startSession } from "./session.js";

type LoginBody = { email: string; password: string };

/** Dashboard authentication + the first protected endpoint (overview counts). */
export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: LoginBody }>(
    "/auth/login",
    {
      // 5 attempts per minute per IP + email; then 429
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "1 minute",
          // Run after the body is parsed so the key includes the email
          hook: "preHandler",
          keyGenerator: (req) => `${req.ip}|${String((req.body as Partial<LoginBody> | undefined)?.email ?? "").toLowerCase()}`,
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
      // Always run one hash check, so unknown emails can't be told apart by timing
      const ok = await verifyPassword(req.body.password, user?.passwordHash ?? dummyHash);
      if (!user || !ok || user.disabled) return reply.code(401).send({ ok: false, error: "invalid_credentials" });

      await startSession(reply, user.id, req.headers["user-agent"]);
      await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
      return { ok: true, user: publicUser(user) };
    },
  );

  /**
   * One-time link from the website's sign-in (owner, 2026-11-21): the dashboard posts the token here
   * (through its own /api address) and gets its session cookie. Valid once, for 60 seconds.
   */
  app.post<{ Body: { token: string } }>(
    "/auth/handoff",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        body: { type: "object", required: ["token"], properties: { token: { type: "string", minLength: 20, maxLength: 200 } }, additionalProperties: false },
      },
    },
    async (req, reply) => {
      const id = createHash("sha256").update(req.body.token).digest("hex");
      const [row] = await db.delete(schema.loginHandoffs).where(eq(schema.loginHandoffs.id, id)).returning();
      if (!row || row.expiresAt < new Date()) return reply.code(400).send({ ok: false, error: "expired" });
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, row.userId)).limit(1);
      if (!user || user.disabled) return reply.code(400).send({ ok: false, error: "expired" });
      await startSession(reply, user.id, req.headers["user-agent"]);
      await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));
      return { ok: true };
    },
  );

  app.post("/auth/logout", async (req, reply) => {
    await endSession(req, reply);
    return { ok: true };
  });

  /**
   * Change your own password. Needs the current password; the new one must follow the rule.
   * Other sessions of this account are signed out; this one stays signed in.
   */
  app.post<{ Body: { currentPassword: string; newPassword: string } }>(
    "/auth/password",
    {
      preHandler: requireUser,
      config: { rateLimit: { max: 5, timeWindow: "1 minute", hook: "preHandler", keyGenerator: (req) => `pw|${req.user?.id ?? req.ip}` } },
      schema: {
        body: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: { type: "string", minLength: 1, maxLength: 200 },
            newPassword: { type: "string", minLength: 1, maxLength: 200 },
          },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const me = req.user!;
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, me.id)).limit(1);
      if (!user || !(await verifyPassword(req.body.currentPassword, user.passwordHash))) {
        return reply.code(400).send({ ok: false, error: "wrong_current" });
      }
      const problem = passwordProblem(req.body.newPassword);
      if (problem) return reply.code(400).send({ ok: false, error: `weak_${problem}` });
      if (req.body.newPassword === req.body.currentPassword) return reply.code(400).send({ ok: false, error: "same" });

      await db.update(schema.users).set({ passwordHash: await hashPassword(req.body.newPassword) }).where(eq(schema.users.id, me.id));
      await endOtherSessions(req, me.id);
      return { ok: true };
    },
  );

  app.get("/auth/me", async (req, reply) => {
    const user = await sessionUser(req);
    if (!user) return reply.code(401).send({ ok: false, error: "unauthorized" });
    return { ok: true, user };
  });

  /** Overview numbers for the dashboard home. */
  app.get("/admin/stats", { preHandler: requireUser }, async () => {
    const one = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0;
    const pending = (kind: "member" | "voice") =>
      one(db.select({ n: count() }).from(schema.applications).where(and(eq(schema.applications.status, "pending"), eq(schema.applications.kind, kind))));
    const [newMessages, pendingMembers, pendingVoices, subscribers] = await Promise.all([
      one(db.select({ n: count() }).from(schema.contactMessages).where(eq(schema.contactMessages.status, "new"))),
      pending("member"),
      pending("voice"),
      one(db.select({ n: count() }).from(schema.subscribers).where(isNull(schema.subscribers.unsubscribedAt))),
    ]);
    return { ok: true, stats: { newMessages, pendingMembers, pendingVoices, subscribers } };
  });
}
