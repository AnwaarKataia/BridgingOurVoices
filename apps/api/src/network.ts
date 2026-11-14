import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { PDFDocument } from "pdf-lib";
import { addNetworkApplication, saveUpload } from "./store.js";

/** Values the portal form sends (see apps/portal/src/content/network.ts). */
export const genders = ["female", "male", "na"];
export const workFields = [
  "interfaith", "intercultural", "mediation", "conflict-analysis", "hate-speech", "wps",
  "youth", "healing", "citizenship", "education", "research", "media",
];

const MAX_PHOTO = 3 * 1024 * 1024;
/** CV rules (owner, 2026-11-14): PDF, at most 4 pages; 5 MB keeps uploads reasonable. */
const MAX_CV = 5 * 1024 * 1024;
const MAX_CV_PAGES = 4;
/** Experience summary: one paragraph of at most 150 words. */
export const MAX_EXPERIENCE_WORDS = 150;

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Page count of a real PDF, or null if the file is not a readable PDF. */
async function pdfPages(buf: Buffer): Promise<number | null> {
  if (buf.length < 5 || buf.subarray(0, 5).toString("latin1") !== "%PDF-") return null;
  try {
    const doc = await PDFDocument.load(buf, { ignoreEncryption: true, updateMetadata: false });
    return doc.getPageCount();
  } catch {
    return null;
  }
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
const len = (s: string, min: number, max: number) => s.trim().length >= min && s.trim().length <= max;

/** Detects JPG / PNG from the first bytes (the extension and MIME type can lie). */
function imageType(buf: Buffer): "jpg" | "png" | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  return null;
}

/** POST /network/apply — multipart form "Add your voice to ours" (on the Membership and Join pages). */
export async function networkRoutes(app: FastifyInstance) {
  app.post("/network/apply", async (req, reply) => {
    const fields: Record<string, string> = {};
    const workSelected: string[] = [];
    let photo: Buffer | null = null;
    let cv: Buffer | null = null;

    try {
      for await (const part of req.parts()) {
        if (part.type === "file") {
          const buf = await part.toBuffer();
          if (!buf.length) continue;
          if (part.fieldname === "photo") photo = buf;
          else if (part.fieldname === "cv") cv = buf;
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
    if (!len(f("experience"), 10, 2000) || wordCount(f("experience")) > MAX_EXPERIENCE_WORDS) errors.push("experience");
    if (!len(f("motivation"), 10, 2000)) errors.push("motivation");
    if (!len(f("activities"), 10, 2000)) errors.push("activities");
    if (f("consent") !== "yes") errors.push("consent");
    const ext = photo ? imageType(photo) : null;
    if (photo && (!ext || photo.length > MAX_PHOTO)) errors.push("photo");
    // The CV is required: a real PDF of at most 4 pages and 5 MB
    const pages = cv && cv.length <= MAX_CV ? await pdfPages(cv) : null;
    if (pages === null) errors.push("cv");
    else if (pages < 1 || pages > MAX_CV_PAGES) errors.push("cv_pages");
    if (errors.length) return reply.code(400).send({ ok: false, errors });

    const id = randomUUID();
    const photoFile = photo && ext ? await saveUpload(`${id}.${ext}`, photo) : null;
    const cvFile = await saveUpload(`${id}-cv.pdf`, cv!);

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
      experience: f("experience"),
      motivation: f("motivation"),
      activities: f("activities"),
      photo: photoFile,
      cv: cvFile,
      locale: ["en", "fr", "ar"].includes(f("locale")) ? f("locale") : "en",
    });
    return reply.code(201).send({ ok: true });
  });
}

/** Photo (3 MB) + CV (5 MB); the per-file limit is the larger one, the photo is re-checked above. */
export const multipartLimits = { fileSize: MAX_CV, files: 2, fields: 40, fieldSize: 20_000 };
