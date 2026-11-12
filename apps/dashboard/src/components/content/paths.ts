/**
 * Walking a content document. Mirrors the API rules (apps/api/src/content/rules.ts): only text and
 * "image" fields are editable; technical fields are hidden; the shape never changes.
 */
export type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
export type Seg = string | number;
export type Field = { path: Seg[]; key: string; kind: "text" | "image" };

export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

const TECHNICAL_KEYS = new Set(["key", "href", "id", "slug", "value", "url", "iso", "start", "end", "tone", "code", "num", "brandName"]);

/** Every editable leaf of a document, in document order. */
export function collectFields(node: Json, path: Seg[] = [], key = "", out: Field[] = []): Field[] {
  if (Array.isArray(node)) node.forEach((item, i) => collectFields(item, [...path, i], key, out));
  else if (node !== null && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) collectFields(v, [...path, k], k, out);
  } else if (typeof node === "string" && !TECHNICAL_KEYS.has(key)) {
    out.push({ path, key, kind: key === "image" ? "image" : "text" });
  }
  return out;
}

export function getAt(doc: Json, path: Seg[]): Json | undefined {
  let cur: Json | undefined = doc;
  for (const seg of path) {
    if (cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, Json>)[seg as string];
  }
  return cur;
}

/** Returns a copy of `doc` with `value` at `path` (only the touched branch is copied). */
export function setAt(doc: Json, path: Seg[], value: Json): Json {
  if (!path.length) return value;
  const [head, ...rest] = path;
  if (Array.isArray(doc)) {
    const copy = [...doc];
    copy[head as number] = setAt(copy[head as number], rest, value);
    return copy;
  }
  const obj = (doc ?? {}) as Record<string, Json>;
  return { ...obj, [head]: setAt(obj[head as string], rest, value) };
}

export const pathId = (path: Seg[]) => path.join(".");
