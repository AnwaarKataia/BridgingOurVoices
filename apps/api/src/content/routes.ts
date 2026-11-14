import type { FastifyInstance } from "fastify";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db, schema } from "../db/client.js";
import { requireUser } from "../auth/session.js";
import { checkEdit, type Json } from "./rules.js";
import { contentKeys, LOCALES, type Locale } from "./seed.js";
import { revalidatePortal } from "../revalidate.js";

const isLocale = (l: string): l is Locale => (LOCALES as readonly string[]).includes(l);

export async function contentRoutes(app: FastifyInstance) {
  const keys = new Set(await contentKeys());
  const knownKey = (k: string) => keys.has(k);

  /** Public: the published content of one page in one language (read by the portal). */
  app.get<{ Params: { key: string; locale: string } }>("/content/:key/:locale", async (req, reply) => {
    const { key, locale } = req.params;
    if (!knownKey(key) || !isLocale(locale)) return reply.code(404).send({ ok: false });
    const [row] = await db
      .select({ published: schema.content.published, publishedAt: schema.content.publishedAt })
      .from(schema.content)
      .where(and(eq(schema.content.key, key), eq(schema.content.locale, locale)))
      .limit(1);
    if (!row) return reply.code(404).send({ ok: false });
    return { ok: true, data: row.published, publishedAt: row.publishedAt };
  });

  /** Dashboard: every page with its status per language. */
  app.get("/admin/content", { preHandler: requireUser }, async () => {
    const rows = await db
      .select({
        key: schema.content.key,
        locale: schema.content.locale,
        hasDraft: isNotNull(schema.content.draft),
        draftUpdatedAt: schema.content.draftUpdatedAt,
        publishedAt: schema.content.publishedAt,
      })
      .from(schema.content);
    return { ok: true, pages: [...keys].map((key) => ({ key, locales: rows.filter((r) => r.key === key) })) };
  });

  /** Dashboard: one page in all languages (published + draft). */
  app.get<{ Params: { key: string } }>("/admin/content/:key", { preHandler: requireUser }, async (req, reply) => {
    if (!knownKey(req.params.key)) return reply.code(404).send({ ok: false });
    const rows = await db.select().from(schema.content).where(eq(schema.content.key, req.params.key));
    const locales = Object.fromEntries(
      rows.map((r) => [r.locale, { published: r.published, draft: r.draft, draftUpdatedAt: r.draftUpdatedAt, publishedAt: r.publishedAt }]),
    );
    return { ok: true, key: req.params.key, locales };
  });

  /** Save drafts (any of en / fr / ar). Rejected if anything other than text or images changed. */
  app.put<{ Params: { key: string }; Body: { drafts: Partial<Record<Locale, Json>> } }>(
    "/admin/content/:key",
    {
      preHandler: requireUser,
      bodyLimit: 2 * 1024 * 1024,
      schema: { body: { type: "object", required: ["drafts"], properties: { drafts: { type: "object" } }, additionalProperties: false } },
    },
    async (req, reply) => {
      const { key } = req.params;
      if (!knownKey(key)) return reply.code(404).send({ ok: false });
      const entries = Object.entries(req.body.drafts);
      if (!entries.length || entries.some(([l]) => !isLocale(l))) return reply.code(400).send({ ok: false, error: "locale" });

      const rows = await db.select().from(schema.content).where(eq(schema.content.key, key));
      for (const [locale, draft] of entries) {
        const row = rows.find((r) => r.locale === locale);
        if (!row) return reply.code(404).send({ ok: false });
        const problem = checkEdit(row.published as Json, draft as Json);
        if (problem) return reply.code(400).send({ ok: false, error: "structure", locale, path: problem });
      }
      for (const [locale, draft] of entries) {
        // A draft identical to the published version is no draft
        const row = rows.find((r) => r.locale === locale)!;
        const same = JSON.stringify(draft) === JSON.stringify(row.published);
        await db
          .update(schema.content)
          .set({ draft: same ? null : (draft as Json), draftUpdatedAt: same ? null : new Date(), draftUpdatedBy: same ? null : req.user!.id })
          .where(and(eq(schema.content.key, key), eq(schema.content.locale, locale)));
      }
      return { ok: true };
    },
  );

  /** Publish all drafts of a page, keep each as a revision, and refresh the portal. */
  app.post<{ Params: { key: string } }>("/admin/content/:key/publish", { preHandler: requireUser }, async (req, reply) => {
    const { key } = req.params;
    if (!knownKey(key)) return reply.code(404).send({ ok: false });
    const rows = await db
      .select()
      .from(schema.content)
      .where(and(eq(schema.content.key, key), isNotNull(schema.content.draft)));
    if (!rows.length) return reply.code(400).send({ ok: false, error: "no_draft" });
    for (const row of rows) {
      await db
        .update(schema.content)
        .set({ published: row.draft as Json, draft: null, draftUpdatedAt: null, draftUpdatedBy: null, publishedAt: new Date(), publishedBy: req.user!.id })
        .where(and(eq(schema.content.key, key), eq(schema.content.locale, row.locale)));
      await db.insert(schema.contentRevisions).values({ key, locale: row.locale, data: row.draft as Json, createdBy: req.user!.id });
    }
    await revalidatePortal((m) => req.log.warn(m));
    return { ok: true, published: rows.map((r) => r.locale) };
  });

  /** Throw away the drafts of a page. */
  app.delete<{ Params: { key: string } }>("/admin/content/:key/draft", { preHandler: requireUser }, async (req, reply) => {
    if (!knownKey(req.params.key)) return reply.code(404).send({ ok: false });
    await db
      .update(schema.content)
      .set({ draft: null, draftUpdatedAt: null, draftUpdatedBy: null })
      .where(eq(schema.content.key, req.params.key));
    return { ok: true };
  });

  /** History: the last 30 published versions of a page. */
  app.get<{ Params: { key: string } }>("/admin/content/:key/revisions", { preHandler: requireUser }, async (req, reply) => {
    if (!knownKey(req.params.key)) return reply.code(404).send({ ok: false });
    const revisions = await db
      .select({
        id: schema.contentRevisions.id,
        locale: schema.contentRevisions.locale,
        note: schema.contentRevisions.note,
        createdAt: schema.contentRevisions.createdAt,
        by: schema.users.name,
      })
      .from(schema.contentRevisions)
      .leftJoin(schema.users, eq(schema.contentRevisions.createdBy, schema.users.id))
      .where(eq(schema.contentRevisions.key, req.params.key))
      .orderBy(desc(schema.contentRevisions.createdAt))
      .limit(30);
    return { ok: true, revisions };
  });

  /** Restore: copies an old version into the draft of its language (publish to make it live). */
  app.post<{ Params: { key: string; id: string } }>("/admin/content/:key/revisions/:id/restore", { preHandler: requireUser }, async (req, reply) => {
    const { key, id } = req.params;
    if (!knownKey(key) || !/^[0-9a-f-]{36}$/.test(id)) return reply.code(404).send({ ok: false });
    const [rev] = await db
      .select()
      .from(schema.contentRevisions)
      .where(and(eq(schema.contentRevisions.id, id), eq(schema.contentRevisions.key, key)))
      .limit(1);
    if (!rev) return reply.code(404).send({ ok: false });
    const where = and(eq(schema.content.key, key), eq(schema.content.locale, rev.locale));
    const [row] = await db.select().from(schema.content).where(where).limit(1);
    // An old version from before a code change may not fit the current page any more
    if (!row || checkEdit(row.published as Json, rev.data as Json)) return reply.code(409).send({ ok: false, error: "outdated" });
    await db.update(schema.content).set({ draft: rev.data as Json, draftUpdatedAt: new Date(), draftUpdatedBy: req.user!.id }).where(where);
    return { ok: true, locale: rev.locale };
  });
}
