import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { and, eq } from "drizzle-orm";
import { apiRoot, db, schema } from "../db/client.js";
import { addMissing, type Json } from "./rules.js";

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
 *  - an existing one gets any new fields the code added (existing text is never overwritten).
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
      const published = addMissing(row.published as Json, fresh);
      const draft = row.draft == null ? null : addMissing(row.draft as Json, fresh);
      if (JSON.stringify(published) !== JSON.stringify(row.published) || JSON.stringify(draft) !== JSON.stringify(row.draft)) {
        await db.update(schema.content).set({ published, draft }).where(where);
        log(`content: added new fields to ${key}/${locale}`);
      }
    }
  }
}
