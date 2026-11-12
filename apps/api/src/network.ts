import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { addNetworkApplication, saveUpload } from "./store.js";

/** Values the portal form sends (see apps/portal/src/content/network.ts). */
export const genders = ["female", "male", "na"];
export const workFields = [
  "interfaith", "intercultural", "mediation", "conflict-analysis", "hate-speech", "wps",
  "youth", "healing", "citizenship", "education", "research", "media",
];

const MAX_PHOTO = 3 * 1024 * 1024;

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
const len = (s: string, min: number, max: number) => s.trim().length >= min && s.trim().length <= max;

/** Detects JPG / PNG from the first bytes (the extension and MIME type can lie). */
function imageType(buf: Buffer): "jpg" | "png" | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  return null;
}

/** POST /network/apply — multipart form from "Add your voice to ours". */
export async function networkRoutes(app: FastifyInstance) {
  app.post("/network/apply", async (req, reply) => {
    const fields: Record<string, string> = {};
    const workSelected: string[] = [];
    let photo: Buffer | null = null;

    try {
      for await (const part of req.parts()) {
        if (part.type === "file") {
          if (part.fieldname !== "photo") {
            await part.toBuffer();
            continue;
          }
          const buf = await part.toBuffer();
          if (buf.length > 0) photo = buf;
        } else if (part.fieldname === "fields") {
          workSelected.push(String(part.value));
        } else {
          fields[part.fieldname] = String(part.value ?? "");
        }
      }
    } catch {
      // Includes files over the size limit
      return reply.code(400).send({ ok: false, error: "invalid_upload" });
    }

    // Honeypot: pretend success to bots without storing anything
    if (fields.website) return reply.code(201).send({ ok: true });

    const f = (k: string) => (fields[k] ?? "").trim();
    const errors: string[] = [];
    if (!len(f("name"), 2, 120)) errors.push("name");
    if (!genders.includes(f("gender"))) errors.push("gender");
    if (!len(f("job"), 2, 120)) errors.push("job");
    if (f("org").length > 160) errors.push("org");
    if (!/^[A-Z]{2}$/.test(f("country"))) errors.push("country");
    if (!isEmail(f("email"))) errors.push("email");
    if (!len(f("religion"), 2, 80)) errors.push("religion");
    if (f("subreligion").length > 80) errors.push("subreligion");
    if (workSelected.some((w) => !workFields.includes(w))) errors.push("fields");
    if (!len(f("quote"), 10, 600)) errors.push("quote");
    if (f("article").length > 10000) errors.push("article");
    if (f("consent") !== "yes") errors.push("consent");
    const ext = photo ? imageType(photo) : null;
    if (photo && !ext) errors.push("photo");
    if (errors.length) return reply.code(400).send({ ok: false, errors });

    const id = randomUUID();
    const photoFile = photo && ext ? await saveUpload(`${id}.${ext}`, photo) : null;

    await addNetworkApplication({
      id,
      name: f("name"),
      gender: f("gender"),
      job: f("job"),
      org: f("org"),
      country: f("country"),
      email: f("email"),
      religion: f("religion"),
      subreligion: f("subreligion"),
      fields: [...new Set(workSelected)],
      quote: f("quote"),
      article: f("article"),
      photo: photoFile,
      locale: ["en", "fr", "ar"].includes(f("locale")) ? f("locale") : "en",
    });
    return reply.code(201).send({ ok: true });
  });
}

export const multipartLimits = { fileSize: MAX_PHOTO, files: 1, fields: 40, fieldSize: 20_000 };
