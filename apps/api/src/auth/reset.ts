import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "../db/client.js";
import { sendMail } from "../mail.js";
import { hashPassword, passwordProblem } from "./password.js";

/**
 * Forgot password for dashboard accounts (owner, 2026-11-21).
 *  - POST /auth/forgot { email, lang }: always answers the same (so nobody can test which emails have an
 *    account); for an active account, emails a link to <dashboard>/reset?token=… valid once, for 1 hour.
 *  - POST /auth/reset { token, password }: sets the new password (owner's rule) and signs the account out
 *    everywhere. Older links of that account stop working.
 */
const dashboardUrl = (process.env.DASHBOARD_URL ?? "http://localhost:3002").replace(/\/$/, "");
const LINK_MINUTES = 60;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function resetMail(lang: "ar" | "en", name: string, link: string) {
  const ar = {
    hello: `مرحبًا ${name}،`,
    body: "طلب أحدهم إعادة تعيين كلمة المرور لحسابك في لوحة تحكم Bridging Our Voices.",
    action: "لاختيار كلمة مرور جديدة افتح/ي هذا الرابط (صالح لمدة ساعة ولمرة واحدة):",
    ignore: "إذا لم تطلب/ي ذلك فتجاهل/ي هذه الرسالة، وستبقى كلمة المرور كما هي.",
    button: "اختيار كلمة مرور جديدة",
    dir: "rtl",
  };
  const en = {
    hello: `Hello ${name},`,
    body: "Someone asked to reset the password of your Bridging Our Voices dashboard account.",
    action: "To choose a new password, open this link (valid for one hour, once):",
    ignore: "If you didn’t ask for this, ignore this email and your password stays the same.",
    button: "Choose a new password",
    dir: "ltr",
  };
  const blocks = lang === "ar" ? [ar, en] : [en, ar];
  const text = blocks.map((b) => `${b.hello}\n\n${b.body}\n${b.action}\n${link}\n\n${b.ignore}`).join("\n\n— — —\n\n");
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const html = blocks
    .map(
      (b) =>
        `<div dir="${b.dir}" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0b1c3d">` +
        `<p>${esc(b.hello)}</p><p>${esc(b.body)}</p><p>${esc(b.action)}</p>` +
        `<p><a href="${link}" style="display:inline-block;background:#0b1c3d;color:#fff;padding:10px 18px;border-radius:2px;text-decoration:none">${b.button}</a></p>` +
        `<p style="color:#5a6478">${esc(b.ignore)}</p></div>`,
    )
    .join('<hr style="border:0;border-top:1px solid #e5e0d5;margin:24px 0">');
  return {
    subject: lang === "ar" ? "Bridging Our Voices — إعادة تعيين كلمة المرور" : "Bridging Our Voices — Password reset",
    text,
    html,
  };
}

export async function resetRoutes(app: FastifyInstance) {
  app.post<{ Body: { email: string; lang?: "ar" | "en" } }>(
    "/auth/forgot",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "15 minutes",
          hook: "preHandler",
          keyGenerator: (req) => `forgot|${req.ip}|${String((req.body as { email?: string } | undefined)?.email ?? "").toLowerCase()}`,
        },
      },
      schema: {
        body: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", maxLength: 254 }, lang: { type: "string", enum: ["ar", "en"] } },
          additionalProperties: false,
        },
      },
    },
    async (req) => {
      const email = req.body.email.trim().toLowerCase();
      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
      if (user && !user.disabled) {
        // One live link per account: a new request replaces older links
        await db.delete(schema.passwordResets).where(eq(schema.passwordResets.userId, user.id));
        await db.delete(schema.passwordResets).where(lt(schema.passwordResets.expiresAt, new Date()));
        const token = randomBytes(32).toString("base64url");
        await db.insert(schema.passwordResets).values({ id: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + LINK_MINUTES * 60 * 1000) });
        const link = `${dashboardUrl}/reset?token=${token}`;
        try {
          await sendMail({ to: user.email, ...resetMail(req.body.lang ?? "ar", user.name, link) }, (m) => req.log.warn(m));
        } catch (err) {
          req.log.error({ err: (err as Error).message }, "password reset email failed");
        }
      }
      // Same answer whether or not the account exists
      return { ok: true };
    },
  );

  app.post<{ Body: { token: string; password: string } }>(
    "/auth/reset",
    {
      config: { rateLimit: { max: 10, timeWindow: "15 minutes" } },
      schema: {
        body: {
          type: "object",
          required: ["token", "password"],
          properties: { token: { type: "string", minLength: 20, maxLength: 200 }, password: { type: "string", minLength: 1, maxLength: 200 } },
          additionalProperties: false,
        },
      },
    },
    async (req, reply) => {
      const [row] = await db
        .select({ reset: schema.passwordResets, user: schema.users })
        .from(schema.passwordResets)
        .innerJoin(schema.users, eq(schema.passwordResets.userId, schema.users.id))
        .where(and(eq(schema.passwordResets.id, hashToken(req.body.token)), gt(schema.passwordResets.expiresAt, new Date())))
        .limit(1);
      if (!row || row.user.disabled) return reply.code(400).send({ ok: false, error: "expired" });
      const problem = passwordProblem(req.body.password);
      if (problem) return reply.code(400).send({ ok: false, error: `weak_${problem}` });

      await db.update(schema.users).set({ passwordHash: await hashPassword(req.body.password) }).where(eq(schema.users.id, row.user.id));
      // The link is used up, and every session of the account ends (sign in again with the new password)
      await db.delete(schema.passwordResets).where(eq(schema.passwordResets.userId, row.user.id));
      await db.delete(schema.sessions).where(eq(schema.sessions.userId, row.user.id));
      return { ok: true };
    },
  );
}
