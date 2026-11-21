import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { desc } from "drizzle-orm";
import { dataDir, db, schema } from "../db/client.js";
import { requireUser } from "../auth/session.js";

/**
 * Images for page content, uploaded from the dashboard. Stored on local disk in apps/api/data/media
 * (production needs object storage, see SPEC.md) and served publicly at /media/<uuid>.<ext>.
 * The portal and dashboard proxy /media/* to the API, so pages use the same path everywhere.
 */
const MEDIA_MAX = 5 * 1024 * 1024;
/** PDFs (course materials and flyers, 2026-11-21) may be larger than images. */
const PDF_MAX = 15 * 1024 * 1024;
const mediaDir = join(dataDir, "media");
const FILE_NAME = /^[a-f0-9-]{36}\.(jpg|png|webp|pdf)$/;
const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf" } as const;

/** Detects the real type from the first bytes (the file name and browser type are not trusted). */
function imageKind(buf: Buffer): keyof typeof MIME | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  if (buf.length > 5 && buf.subarray(0, 5).toString("latin1") === "%PDF-") return "pdf";
  return null;
}

export async function mediaRoutes(app: FastifyInstance) {
  /** Upload one image (JPG, PNG or WebP, up to 5 MB) or PDF (up to 15 MB). Returns its path. */
  app.post("/admin/media", { preHandler: requireUser }, async (req, reply) => {
    let part;
    try {
      part = await req.file({ limits: { fileSize: PDF_MAX, files: 1 } });
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
    const kind = imageKind(buf);
    if (!kind) return reply.code(400).send({ ok: false, error: "not_image" });
    // Images up to 5 MB, PDFs up to 15 MB
    if (kind !== "pdf" && buf.length > MEDIA_MAX) return reply.code(413).send({ ok: false, error: "too_big" });

    const id = randomUUID();
    const file = `${id}.${kind}`;
    await mkdir(mediaDir, { recursive: true });
    await writeFile(join(mediaDir, file), buf);
    await db.insert(schema.media).values({
      id,
      file,
      originalName: (part.filename || file).slice(0, 200),
      mime: MIME[kind],
      size: buf.length,
      uploadedBy: req.user!.id,
    });
    return reply.code(201).send({ ok: true, path: `/media/${file}` });
  });

  /** The latest uploads, to reuse an image. */
  app.get("/admin/media", { preHandler: requireUser }, async () => {
    const items = await db
      .select({ file: schema.media.file, originalName: schema.media.originalName, size: schema.media.size, createdAt: schema.media.createdAt })
      .from(schema.media)
      .orderBy(desc(schema.media.createdAt))
      .limit(200);
    return { ok: true, items: items.map((m) => ({ ...m, path: `/media/${m.file}` })) };
  });

  /** Public: serve an uploaded image. File names are random UUIDs, so they can be cached forever. */
  app.get<{ Params: { file: string } }>("/media/:file", async (req, reply) => {
    const { file } = req.params;
    if (!FILE_NAME.test(file)) return reply.code(404).send();
    const path = join(mediaDir, file);
    try {
      await stat(path);
    } catch {
      return reply.code(404).send();
    }
    const ext = file.split(".").pop() as keyof typeof MIME;
    return reply
      .header("Content-Type", MIME[ext])
      .header("Cache-Control", "public, max-age=31536000, immutable")
      .header("X-Content-Type-Options", "nosniff")
      .send(createReadStream(path));
  });
}
