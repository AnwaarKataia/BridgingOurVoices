import { createHash, randomBytes } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { and, eq, gt, lt } from "drizzle-orm";
import { db, schema } from "./db/client.js";
import { sendMail } from "./mail.js";
import { hashPassword, passwordProblem } from "./auth/password.js";

/**
 * Forgot password for learner accounts (owner, 2026-11-21: anyone who creates an account must be able to
 * recover it). Same rules as the dashboard: same answer for every email, link valid once for 1 hour,
 * new password follows the rule, every session of the account ends after the reset.
 * The email is in the language of the page the learner used.
 */
const portalUrl = (process.env.PORTAL_URL ?? "http://localhost:3000").replace(/\/$/, "");
const LINK_MINUTES = 60;
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
type Lang = "en" | "fr" | "ar";

const copy: Record<Lang, { subject: string; hello: (n: string) => string; body: string; action: string; button: string; ignore: string; dir: "ltr" | "rtl" }> = {
  en: {
    subject: "Bridging Our Voices — Reset your password",
    hello: (n) => `Hello ${n},`,
    body: "Someone asked to reset the password of your Bridging Our Voices learner account.",
    action: "To choose a new password, open this link (valid for one hour, once):",
    button: "Choose a new password",
    ignore: "If you didn’t ask for this, ignore this email and your password stays the same.",
    dir: "ltr",
  },
  fr: {
    subject: "Bridging Our Voices — Réinitialiser votre mot de passe",
    hello: (n) => `Bonjour ${n},`,
    body: "Une demande de réinitialisation du mot de passe de votre compte d’apprentissage Bridging Our Voices a été faite.",
    action: "Pour choisir un nouveau mot de passe, ouvrez ce lien (valable une heure, une seule fois) :",
    button: "Choisir un nouveau mot de passe",
    ignore: "Si vous n’êtes pas à l’origine de cette demande, ignorez ce message : votre mot de passe reste inchangé.",
    dir: "ltr",
  },
  ar: {
    subject: "Bridging Our Voices — إعادة تعيين كلمة المرور",
    hello: (n) => `مرحبًا ${n}،`,
    body: "طلب أحدهم إعادة تعيين كلمة المرور لحساب المتعلّم الخاص بك في Bridging Our Voices.",
    action: "لاختيار كلمة مرور جديدة افتح/ي هذا الرابط (صالح لمدة ساعة ولمرة واحدة):",
    button: "اختيار كلمة مرور جديدة",
    ignore: "إذا لم تطلب/ي ذلك فتجاهل/ي هذه الرسالة، وستبقى كلمة المرور كما هي.",
    dir: "rtl",
  },
};

function mail(lang: Lang, name: string, link: string) {
  const c = copy[lang];
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return {
    subject: c.subject,
    text: `${c.hello(name)}\n\n${c.body}\n${c.action}\n${link}\n\n${c.ignore}`,
    html:
      `<div dir="${c.dir}" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#0b1c3d">` +
      `<p>${esc(c.hello(name))}</p><p>${esc(c.body)}</p><p>${esc(c.action)}</p>` +
      `<p><a href="${link}" style="display:inline-block;background:#0b1c3d;color:#fff;padding:10px 18px;border-radius:2px;text-decoration:none">${c.button}</a></p>` +
      `<p style="color:#5a6478">${esc(c.ignore)}</p></div>`,
  };
}

export async function learnResetRoutes(app: FastifyInstance) {
  app.post<{ Body: { email: string; locale?: Lang } }>(
    "/learn/forgot",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "15 minutes",
          hook: "preHandler",
          keyGenerator: (req) => `lforgot|${req.ip}|${String((req.body as { email?: string } | undefined)?.email ?? "").toLowerCase()}`,
        },
      },
      schema: {
        body: {
          type: "object",
          required: ["email"],
          properties: { email: { type: "string", maxLength: 254 }, locale: { type: "string", enum: ["en", "fr", "ar"] } },
          additionalProperties: false,
        },
      },
    },
    async (req) => {
      const email = req.body.email.trim().toLowerCase();
      const [l] = await db.select().from(schema.learners).where(eq(schema.learners.email, email)).limit(1);
      if (l) {
        await db.delete(schema.learnerPasswordResets).where(eq(schema.learnerPasswordResets.learnerId, l.id));
        await db.delete(schema.learnerPasswordResets).where(lt(schema.learnerPasswordResets.expiresAt, new Date()));
        const token = randomBytes(32).toString("base64url");
        await db.insert(schema.learnerPasswordResets).values({ id: hashToken(token), learnerId: l.id, expiresAt: new Date(Date.now() + LINK_MINUTES * 60 * 1000) });
        const lang = req.body.locale ?? (l.locale as Lang);
        try {
          await sendMail({ to: l.email, ...mail(lang, l.name, `${portalUrl}/${lang}/learn/reset?token=${token}`) }, (m) => req.log.warn(m));
        } catch (err) {
          req.log.error({ err: (err as Error).message }, "learner reset email failed");
        }
      }
      return { ok: true };
    },
  );

  app.post<{ Body: { token: string; password: string } }>(
    "/learn/reset",
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
        .select()
        .from(schema.learnerPasswordResets)
        .where(and(eq(schema.learnerPasswordResets.id, hashToken(req.body.token)), gt(schema.learnerPasswordResets.expiresAt, new Date())))
        .limit(1);
      if (!row) return reply.code(400).send({ ok: false, error: "expired" });
      if (passwordProblem(req.body.password)) return reply.code(400).send({ ok: false, error: "weak" });
      await db.update(schema.learners).set({ passwordHash: await hashPassword(req.body.password) }).where(eq(schema.learners.id, row.learnerId));
      await db.delete(schema.learnerPasswordResets).where(eq(schema.learnerPasswordResets.learnerId, row.learnerId));
      await db.delete(schema.learnerSessions).where(eq(schema.learnerSessions.learnerId, row.learnerId));
      return { ok: true };
    },
  );
}
