import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { and, desc, eq } from "drizzle-orm";
import { apiRoot, db, schema } from "../db/client.js";
import { addMissing, dropRemoved, rebase, type Json } from "./rules.js";

export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

/** { key: { en, fr, ar } } exported from the portal's content files (`pnpm --filter portal content:export`). */
type Seed = Record<string, Record<Locale, Json>>;

let seedCache: Seed | null = null;
export async function loadSeed(): Promise<Seed> {
  seedCache ??= JSON.parse(await readFile(join(apiRoot, "seed", "content.json"), "utf8")) as Seed;
  return seedCache;
}

export async function contentKeys(): Promise<string[]> {
  return Object.keys(await loadSeed());
}

/**
 * Runs at startup:
 *  - a page/language missing from the database is inserted from the seed (first run);
 *  - when the code's copy changed since the last seed, each field nobody edited in the dashboard takes
 *    the new text, and each edited field keeps the dashboard's text (see `rebase` in rules.ts).
 */
export async function syncSeed(log: (msg: string) => void) {
  const seed = await loadSeed();
  for (const [key, byLocale] of Object.entries(seed)) {
    for (const locale of LOCALES) {
      const fresh = byLocale[locale];
      if (fresh === undefined) continue;
      const where = and(eq(schema.content.key, key), eq(schema.content.locale, locale));
      const [row] = await db.select().from(schema.content).where(where).limit(1);
      if (!row) {
        await db.insert(schema.content).values({ key, locale, published: fresh });
        await db.insert(schema.contentRevisions).values({ key, locale, data: fresh, note: "seed" });
        log(`content: seeded ${key}/${locale}`);
        continue;
      }
      const [lastSeed] = await db
        .select({ data: schema.contentRevisions.data })
        .from(schema.contentRevisions)
        .where(and(eq(schema.contentRevisions.key, key), eq(schema.contentRevisions.locale, locale), eq(schema.contentRevisions.note, "seed")))
        .orderBy(desc(schema.contentRevisions.createdAt))
        .limit(1);
      // The code's copy changed since the last seed: update every field nobody edited, keep edited ones
      if (lastSeed && JSON.stringify(fresh) !== JSON.stringify(lastSeed.data)) {
        const published = rebase(row.published as Json, lastSeed.data as Json, fresh);
        const draft = row.draft == null ? null : rebase(row.draft as Json, lastSeed.data as Json, fresh);
        await db.update(schema.content).set({ published, draft }).where(where);
        // The new copy becomes the reference for the next comparison
        await db.insert(schema.contentRevisions).values({ key, locale, data: fresh, note: "seed" });
        log(`content: updated ${key}/${locale} from the code (fields edited in the dashboard kept)`);
        continue;
      }
      // No reference copy (older databases): only add new fields and drop removed ones
      if (!lastSeed) {
        const published = dropRemoved(addMissing(row.published as Json, fresh), fresh);
        const draft = row.draft == null ? null : dropRemoved(addMissing(row.draft as Json, fresh), fresh);
        if (JSON.stringify(published) !== JSON.stringify(row.published) || JSON.stringify(draft) !== JSON.stringify(row.draft)) {
          await db.update(schema.content).set({ published, draft }).where(where);
          log(`content: added new fields to ${key}/${locale}`);
        }
      }
    }
  }
}
