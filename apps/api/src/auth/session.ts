import { createHash, randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { and, eq, gt, lt, ne } from "drizzle-orm";
import { db, schema } from "../db/client.js";
import type { Role, User } from "../db/schema.js";

export const SESSION_COOKIE = "bov_session";
const SESSION_DAYS = 7;

/** What the dashboard sees about the signed-in user (never the password hash). */
export type PublicUser = Pick<User, "id" | "email" | "name" | "role">;
export const publicUser = (u: User): PublicUser => ({ id: u.id, email: u.email, name: u.name, role: u.role });

declare module "fastify" {
  interface FastifyRequest {
    user: PublicUser | null;
  }
}

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const cookieOptions = () => ({
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
});

/** Creates a session, sets the httpOnly cookie, and clears this user's expired sessions. */
export async function startSession(reply: FastifyReply, userId: string, userAgent?: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.delete(schema.sessions).where(and(eq(schema.sessions.userId, userId), lt(schema.sessions.expiresAt, new Date())));
  await db.insert(schema.sessions).values({ id: hashToken(token), userId, expiresAt, userAgent: userAgent?.slice(0, 300) });
  reply.setCookie(SESSION_COOKIE, token, { ...cookieOptions(), expires: expiresAt });
}

export async function endSession(req: FastifyRequest, reply: FastifyReply) {
  const token = req.cookies[SESSION_COOKIE];
  if (token) await db.delete(schema.sessions).where(eq(schema.sessions.id, hashToken(token)));
  reply.clearCookie(SESSION_COOKIE, cookieOptions());
}

/** Signs a user out everywhere except the current session (after a password change). */
export async function endOtherSessions(req: FastifyRequest, userId: string) {
  const token = req.cookies[SESSION_COOKIE];
  const current = token ? hashToken(token) : "";
  await db.delete(schema.sessions).where(and(eq(schema.sessions.userId, userId), ne(schema.sessions.id, current)));
}

/** Reads the session cookie and returns the active (not disabled) user, or null. */
export async function sessionUser(req: FastifyRequest): Promise<PublicUser | null> {
  const token = req.cookies[SESSION_COOKIE];
  if (!token) return null;
  const rows = await db
    .select({ user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(and(eq(schema.sessions.id, hashToken(token)), gt(schema.sessions.expiresAt, new Date()), eq(schema.users.disabled, false)))
    .limit(1);
  return rows[0] ? publicUser(rows[0].user) : null;
}

/** preHandler: 401 unless signed in. Sets req.user. */
export async function requireUser(req: FastifyRequest, reply: FastifyReply) {
  req.user = await sessionUser(req);
  if (!req.user) return reply.code(401).send({ ok: false, error: "unauthorized" });
}

/** preHandler factory: 403 unless the signed-in user has one of these roles. Use after requireUser. */
export const requireRole =
  (...roles: Role[]) =>
  async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user || !roles.includes(req.user.role)) return reply.code(403).send({ ok: false, error: "forbidden" });
  };
