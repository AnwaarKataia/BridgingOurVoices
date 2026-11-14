/**
 * Content editing rules (owner, 2026-11-12): the dashboard changes the content of pages, not the pages
 * themselves. So a draft must keep exactly the same shape as the published document:
 *   - same keys, same array lengths, same value types;
 *   - technical fields (links, ids, slugs, form values, dates…) unchanged;
 *   - "brandName" unchanged ("Bridging Our Voices" is never translated);
 *   - "image" fields: empty (placeholder) or a site image path.
 * Only text and images can change.
 */

/** Keys whose values are technical: never editable, hidden in the dashboard editor. */
export const TECHNICAL_KEYS = new Set([
  "key", "href", "id", "slug", "value", "url", "iso", "start", "end", "tone", "code", "num", "brandName",
]);

/** Image fields hold a path: "" = placeholder, "/media/<file>" = uploaded, or a file shipped with the portal. */
export const IMAGE_KEY = "image";
const IMAGE_PATH = /^(\/media\/[a-f0-9-]{36}\.(jpg|png|webp)|\/[\w\-/]+\.(jpg|jpeg|png|webp))$/;

const MAX_TEXT = 20_000;

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** Returns null when `next` is a valid edit of `base`, otherwise the path of the first problem. */
export function checkEdit(base: Json, next: Json, path = "", key = ""): string | null {
  const where = path || "(root)";
  if (Array.isArray(base)) {
    if (!Array.isArray(next) || next.length !== base.length) return where;
    for (let i = 0; i < base.length; i++) {
      const p = checkEdit(base[i], next[i], `${path}[${i}]`, key);
      if (p) return p;
    }
    return null;
  }
  if (base !== null && typeof base === "object") {
    if (next === null || typeof next !== "object" || Array.isArray(next)) return where;
    const a = Object.keys(base).sort();
    const b = Object.keys(next).sort();
    if (a.length !== b.length || a.some((k, i) => k !== b[i])) return where;
    for (const k of a) {
      const p = checkEdit(base[k], (next as Record<string, Json>)[k], path ? `${path}.${k}` : k, k);
      if (p) return p;
    }
    return null;
  }
  if (typeof base !== typeof next) return where;
  if (typeof base !== "string") return base === next ? null : where; // numbers / booleans are structure
  const value = next as string;
  if (TECHNICAL_KEYS.has(key)) return value === base ? null : where;
  if (key === IMAGE_KEY) return value === "" || IMAGE_PATH.test(value) ? null : where;
  return value.length <= MAX_TEXT ? null : where;
}

/**
 * Adds keys that exist in `seed` but not in `doc` (when the site's code gains a new field), without
 * touching existing values. Arrays of the same length are merged item by item.
 */
export function addMissing(doc: Json, seed: Json): Json {
  if (Array.isArray(doc) && Array.isArray(seed)) {
    return doc.length === seed.length ? doc.map((d, i) => addMissing(d, seed[i])) : doc;
  }
  if (doc && seed && typeof doc === "object" && typeof seed === "object" && !Array.isArray(doc) && !Array.isArray(seed)) {
    const out: Record<string, Json> = { ...doc };
    for (const [k, v] of Object.entries(seed)) out[k] = k in out ? addMissing(out[k], v) : v;
    return out;
  }
  return doc;
}

/**
 * Field-by-field update when the code's copy changes: `oldSeed` is the copy the document started from,
 * `newSeed` the code's new copy. A field still equal to `oldSeed` (never edited in the dashboard) takes the
 * new text; an edited field keeps the dashboard's text. The shape follows `newSeed` (new fields added,
 * removed fields dropped).
 */
export function rebase(doc: Json, oldSeed: Json | undefined, newSeed: Json): Json {
  if (Array.isArray(newSeed)) {
    if (!Array.isArray(doc) || doc.length !== newSeed.length) return newSeed;
    const old = Array.isArray(oldSeed) && oldSeed.length === newSeed.length ? oldSeed : undefined;
    return newSeed.map((n, i) => rebase(doc[i], old?.[i], n));
  }
  if (newSeed !== null && typeof newSeed === "object") {
    if (doc === null || typeof doc !== "object" || Array.isArray(doc)) return newSeed;
    const old = oldSeed && typeof oldSeed === "object" && !Array.isArray(oldSeed) ? (oldSeed as Record<string, Json>) : undefined;
    const d = doc as Record<string, Json>;
    return Object.fromEntries(Object.entries(newSeed).map(([k, n]) => [k, k in d ? rebase(d[k], old?.[k], n) : n]));
  }
  if (typeof doc !== typeof newSeed) return newSeed;
  // Unedited (still the old copy) → new copy; edited → keep
  return oldSeed !== undefined && JSON.stringify(doc) === JSON.stringify(oldSeed) ? newSeed : doc;
}

/** Drops object keys that the seed (the current code) no longer has, so removed fields leave the editor. */
export function dropRemoved(doc: Json, seed: Json): Json {
  if (Array.isArray(doc) && Array.isArray(seed)) {
    return doc.length === seed.length ? doc.map((d, i) => dropRemoved(d, seed[i])) : doc;
  }
  if (doc && seed && typeof doc === "object" && typeof seed === "object" && !Array.isArray(doc) && !Array.isArray(seed)) {
    return Object.fromEntries(Object.entries(doc).filter(([k]) => k in seed).map(([k, v]) => [k, dropRemoved(v, (seed as Record<string, Json>)[k])]));
  }
  return doc;
}

export type { Json };
