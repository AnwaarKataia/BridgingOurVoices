import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import nodemailer from "nodemailer";
import { dataDir } from "./db/client.js";

/**
 * Outgoing email (2026-11-21, first use: password reset links).
 * Sends through SMTP when SMTP_HOST is set (e.g. Gmail with an app password, or any mail provider).
 * Without SMTP (local development) each email is saved to apps/api/data/outbox/ instead, never sent and
 * never written to the logs, so reset links don't leak.
 */
const host = process.env.SMTP_HOST ?? "";
const from = process.env.MAIL_FROM ?? `Bridging Our Voices <${process.env.SMTP_USER ?? "no-reply@localhost"}>`;

const transport = host
  ? nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      // 465 = TLS from the start; 587 = STARTTLS
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS ?? "" } : undefined,
    })
  : null;

export const mailConfigured = !!transport;

export type Mail = { to: string; subject: string; text: string; html: string };

export async function sendMail(mail: Mail, log: (m: string) => void) {
  if (transport) {
    await transport.sendMail({ from, ...mail });
    return;
  }
  if (process.env.NODE_ENV === "production") {
    log("SMTP_HOST is not set: email not sent");
    return;
  }
  const dir = join(dataDir, "outbox");
  await mkdir(dir, { recursive: true });
  const file = join(dir, `${new Date().toISOString().replace(/[:.]/g, "-")}.txt`);
  await writeFile(file, `To: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n`, "utf8");
  log("SMTP is not configured: email saved to apps/api/data/outbox (local only)");
}
