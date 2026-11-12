import type { Locale } from "@/i18n/config";
import { apiUrl } from "@/lib/site";

/**
 * Page content comes from the dashboard (API → database). Each content file keeps its built-in copy as
 * `defaults`: it seeds the database (`pnpm --filter @bov/portal content:export`) and is used whenever the
 * API can't be reached, so a page is never empty.
 *
 * Caching: responses are cached under the "content" tag for up to 5 minutes; publishing in the dashboard
 * calls /api/revalidate, which expires the tag at once.
 */
export const CONTENT_TAG = "content";
const REVALIDATE_SECONDS = 300;

/** Technical fields always come from the code (links, ids, form values…), never from the database. */
const TECHNICAL_KEYS = new Set(["key", "href", "id", "slug", "value", "url", "iso", "start", "end", "tone", "code", "num", "brandName"]);

/**
 * Database text over the built-in structure: the code decides the shape (keys, list lengths, technical
 * values); the database fills in text and images where the shape matches.
 */
function merge<T>(fromDb: unknown, fallback: T, key = ""): T {
  if (Array.isArray(fallback)) {
    if (!Array.isArray(fromDb) || fromDb.length !== fallback.length) return fallback;
    return fallback.map((item, i) => merge(fromDb[i], item, key)) as T;
  }
  if (fallback !== null && typeof fallback === "object") {
    if (fromDb === null || typeof fromDb !== "object" || Array.isArray(fromDb)) return fallback;
    const db = fromDb as Record<string, unknown>;
    return Object.fromEntries(Object.entries(fallback).map(([k, v]) => [k, k in db ? merge(db[k], v, k) : v])) as T;
  }
  if (TECHNICAL_KEYS.has(key)) return fallback;
  return typeof fromDb === typeof fallback ? (fromDb as T) : fallback;
}

export async function loadContent<T>(key: string, locale: Locale, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${apiUrl}/content/${key}/${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS, tags: [CONTENT_TAG] },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return fallback;
    const body = (await res.json()) as { data?: unknown };
    return merge(body.data, fallback);
  } catch {
    return fallback;
  }
}

/** Image paths: uploads live on the API (/media/…, proxied by the portal) and are served as-is. */
export const isUploaded = (src: string) => src.startsWith("/media/");
