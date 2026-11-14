import { randomUUID } from "node:crypto";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PDFDocument } from "pdf-lib";
import { addNetworkApplication, saveUpload } from "./store.js";
import { loadSeed } from "./content/seed.js";

/**
 * The two network forms (owner, 2026-11-14):
 *  - POST /network/apply       "Add your voice to ours" (Join page): details + statement + optional article.
 *  - POST /network/membership  Membership application (Membership page): details + experience summary
 *                               (max 150 words), CV (PDF, max 4 pages), motivation, activities, organisations.
 * Both take the same personal details and an optional photo, and are reviewed in the dashboard.
 */

/** Values the portal forms send (see apps/portal/src/content/network.ts). */
export const genders = ["female", "male", "na"];
export const workFields = [
  "interfaith", "intercultural", "mediation", "conflict-analysis", "hate-speech", "wps",
  "youth", "healing", "citizenship", "education", "research", "media",
];

const MAX_PHOTO = 3 * 1024 * 1024;
const MAX_CV = 5 * 1024 * 1024;
const MAX_CV_PAGES = 4;
export const MAX_EXPERIENCE_WORDS = 150;
/** Fields of work: at most 3 (owner, 2026-11-14). */
export const MAX_FIELDS = 3;

/** religion code → its denomination codes, from the site content (network.join.religions). */
type ReligionList = Map<string, Set<string>>;
async function loadReligions(): Promise<ReligionList> {
  const seed = (await loadSeed()) as unknown as { network: { en: { join: { religions: { value: string; denominations: { value: string }[] }[] } } } };
  return new Map(seed.network.en.join.religions.map((r) => [r.value, new Set(r.denominations.map((d) => d.value))]));
}

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 254;
const len = (s: string, min: number, max: number) => s.trim().length >= min && s.trim().length <= max;
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Detects JPG / PNG from the first bytes (the extension and MIME type can lie). */
function imageType(buf: Buffer): "jpg" | "png" | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  return null;
}

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

type Parsed = { fields: Record<string, string>; work: string[]; files: Record<string, Buffer> };

/** Reads the multipart body; files over the size limit throw (→ 400). */
async function parse(req: FastifyRequest): Promise<Parsed | null> {
  const fields: Record<string, string> = {};
  const work: string[] = [];
  const files: Record<string, Buffer> = {};
  try {
    for await (const part of req.parts()) {
      if (part.type === "file") {
        const buf = await part.toBuffer();
        if (buf.length) files[part.fieldname] = buf;
      } else if (part.fieldname === "fields") {
        work.push(String(part.value));
      } else {
        fields[part.fieldname] = String(part.value ?? "");
      }
    }
  } catch {
    return null;
  }
  return { fields, work, files };
}

/** The personal details both forms share; pushes field names that fail into `errors`. */
function checkDetails({ fields, work, files }: Parsed, errors: string[], religions: ReligionList) {
  const f = (k: string) => (fields[k] ?? "").trim();
  if (!len(f("name"), 2, 120)) errors.push("name");
  if (!genders.includes(f("gender"))) errors.push("gender");
  if (!len(f("job"), 2, 120)) errors.push("job");
  if (f("org").length > 160) errors.push("org");
  if (!/^[A-Z]{2}$/.test(f("country"))) errors.push("country");
  if (!isEmail(f("email"))) errors.push("email");
  // Religion from the list ("other" → the typed name); denomination from that religion's list or typed
  let religion = f("religion");
  let subreligion = f("subreligion");
  if (!religions.has(religion)) errors.push("religion");
  else if (religion === "other") {
    if (!len(f("religionOther"), 2, 80)) errors.push("religionOther");
    religion = f("religionOther");
  }
  const denominations = religions.get(f("religion"));
  if (subreligion && !denominations?.has(subreligion)) errors.push("subreligion");
  else if (subreligion === "other") {
    if (f("subreligionOther").length > 80) errors.push("subreligionOther");
    subreligion = f("subreligionOther");
  }
  const chosen = [...new Set(work)];
  if (chosen.some((w) => !workFields.includes(w)) || chosen.length > MAX_FIELDS) errors.push("fields");
  if (f("consent") !== "yes") errors.push("consent");
  const photo = files.photo;
  const ext = photo ? imageType(photo) : null;
  if (photo && (!ext || photo.length > MAX_PHOTO)) errors.push("photo");
  return {
    f,
    ext,
    details: {
      name: f("name"),
      gender: f("gender"),
      job: f("job"),
      org: f("org"),
      country: f("country"),
      email: f("email"),
      religion,
      subreligion,
      fields: chosen,
      locale: ["en", "fr", "ar"].includes(f("locale")) ? f("locale") : "en",
      // Optional box "may be published on the site": publishing in the dashboard needs it
      publishConsent: f("publish") === "yes",
    },
  };
}

const reject = (reply: FastifyReply, errors: string[]) => reply.code(400).send({ ok: false, errors });

export async function networkRoutes(app: FastifyInstance) {
  const religions = await loadReligions();
  /** "Add your voice to ours": statement of support (required) + optional article. */
  app.post("/network/apply", async (req, reply) => {
    const parsed = await parse(req);
    if (!parsed) return reply.code(400).send({ ok: false, error: "invalid_upload" });
    // Honeypot: pretend success to bots without storing anything
    if (parsed.fields.website) return reply.code(201).send({ ok: true });

    const errors: string[] = [];
    const { f, ext, details } = checkDetails(parsed, errors, religions);
    if (!len(f("quote"), 10, 600)) errors.push("quote");
    if (f("article").length > 10000) errors.push("article");
    if (errors.length) return reject(reply, errors);

    const id = randomUUID();
    const photo = parsed.files.photo && ext ? await saveUpload(`${id}.${ext}`, parsed.files.photo) : null;
    await addNetworkApplication({ id, kind: "voice", ...details, quote: f("quote"), article: f("article"), photo });
    return reply.code(201).send({ ok: true });
  });

  /** Membership application: experience (≤150 words), CV (PDF ≤4 pages), motivation, activities, organisations. */
  app.post("/network/membership", async (req, reply) => {
    const parsed = await parse(req);
    if (!parsed) return reply.code(400).send({ ok: false, error: "invalid_upload" });
    if (parsed.fields.website) return reply.code(201).send({ ok: true });

    const errors: string[] = [];
    const { f, ext, details } = checkDetails(parsed, errors, religions);
    if (!len(f("experience"), 10, 2000) || wordCount(f("experience")) > MAX_EXPERIENCE_WORDS) errors.push("experience");
    if (!len(f("motivation"), 10, 2000)) errors.push("motivation");
    if (!len(f("activities"), 10, 2000)) errors.push("activities");
    if (f("connections").length > 2000) errors.push("connections");
    // The CV is required: a real PDF of 1–4 pages and at most 5 MB
    const cv = parsed.files.cv;
    const pages = cv && cv.length <= MAX_CV ? await pdfPages(cv) : null;
    if (pages === null) errors.push("cv");
    else if (pages < 1 || pages > MAX_CV_PAGES) errors.push("cv_pages");
    if (errors.length) return reject(reply, errors);

    const id = randomUUID();
    const photo = parsed.files.photo && ext ? await saveUpload(`${id}.${ext}`, parsed.files.photo) : null;
    const cvFile = await saveUpload(`${id}-cv.pdf`, cv!);
    await addNetworkApplication({
      id,
      kind: "member",
      ...details,
      experience: f("experience"),
      motivation: f("motivation"),
      activities: f("activities"),
      connections: f("connections"),
      photo,
      cv: cvFile,
    });
    return reply.code(201).send({ ok: true });
  });
}

/** Photo (3 MB) + CV (5 MB): the per-file limit is the larger one; the photo is re-checked above. */
export const multipartLimits = { fileSize: MAX_CV, files: 2, fields: 40, fieldSize: 20_000 };
