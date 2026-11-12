"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Dict } from "@/lib/i18n";
import { ImageField } from "./ImageField";
import { collectFields, getAt, LOCALES, pathId, setAt, type Field, type Json, type Locale, type Seg } from "./paths";

type Labels = Dict["content"];
type Docs = Record<Locale, Json>;
type Revision = { id: string; locale: string; note: string; createdAt: string; by: string | null };

type Props = {
  pageKey: string;
  pageName: string;
  published: Docs;
  initial: Docs; // draft where there is one, else published
  hasDraft: boolean;
  t: Labels;
  uiLang: "ar" | "en";
  portalUrl: string;
  viewPath: string;
};

const input =
  "w-full rounded-bov border border-line-input bg-white px-3 py-2 text-[15px] leading-relaxed text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";

const humanize = (key: string) => key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

/**
 * Edits one page's text and images in EN / FR / AR side by side.
 * Save → draft (not on the site). Publish → live, kept in history. Only text and images can change.
 */
export function ContentEditor({ pageKey, pageName, published, initial, hasDraft: initialHasDraft, t, uiLang, portalUrl, viewPath }: Props) {
  const [docs, setDocs] = useState<Docs>(initial);
  const [saved, setSaved] = useState<Docs>(initial);
  const [live, setLive] = useState<Docs>(published);
  const [hasDraft, setHasDraft] = useState(initialHasDraft);
  const [busy, setBusy] = useState<"" | "save" | "publish" | "discard">("");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [revisions, setRevisions] = useState<Revision[] | null>(null);

  const label = (key: string) => (uiLang === "ar" ? t.labels[key] : undefined) ?? humanize(key);
  const segLabel = (seg: Seg) => (typeof seg === "number" ? `${t.item} ${seg + 1}` : label(seg));

  // Fields come from the English document; all languages share the same shape
  const fields = useMemo(() => collectFields(published.en), [published]);
  const dirty = JSON.stringify(docs) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Group by top-level section; filter by the search box (labels and text in any language)
  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, Field[]>();
    for (const f of fields) {
      if (q) {
        const hay = [f.path.map(segLabel).join(" "), ...LOCALES.map((l) => String(getAt(docs[l], f.path) ?? ""))].join(" ").toLowerCase();
        if (!hay.includes(q)) continue;
      }
      const g = String(f.path[0]);
      map.set(g, [...(map.get(g) ?? []), f]);
    }
    return [...map.entries()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, query, docs, uiLang]);

  const update = (locale: Locale, path: Seg[], value: string) => setDocs((d) => ({ ...d, [locale]: setAt(d[locale], path, value) }));
  // Images are the same in every language
  const updateImage = (path: Seg[], value: string) =>
    setDocs((d) => Object.fromEntries(LOCALES.map((l) => [l, setAt(d[l], path, value)])) as Docs);

  async function save(): Promise<boolean> {
    setBusy("save");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/content/${pageKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drafts: docs }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage({ kind: "error", text: body.error === "structure" ? t.structureError : t.error });
        return false;
      }
      setSaved(docs);
      setHasDraft(JSON.stringify(docs) !== JSON.stringify(live));
      setMessage({ kind: "ok", text: t.savedDraft });
      return true;
    } catch {
      setMessage({ kind: "error", text: t.error });
      return false;
    } finally {
      setBusy("");
    }
  }

  async function publish() {
    if (dirty && !(await save())) return;
    if (JSON.stringify(docs) === JSON.stringify(live)) return setMessage({ kind: "error", text: t.noDraft });
    setBusy("publish");
    try {
      const res = await fetch(`/api/admin/content/${pageKey}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (res.ok) {
        setLive(docs);
        setHasDraft(false);
        setRevisions(null);
        setMessage({ kind: "ok", text: t.published });
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setMessage({ kind: "error", text: body.error === "no_draft" ? t.noDraft : t.error });
      }
    } catch {
      setMessage({ kind: "error", text: t.error });
    }
    setBusy("");
  }

  async function discard() {
    if (!window.confirm(t.discardConfirm)) return;
    setBusy("discard");
    try {
      const res = await fetch(`/api/admin/content/${pageKey}/draft`, { method: "DELETE" });
      if (res.ok) {
        setDocs(live);
        setSaved(live);
        setHasDraft(false);
        setMessage(null);
      } else setMessage({ kind: "error", text: t.error });
    } catch {
      setMessage({ kind: "error", text: t.error });
    }
    setBusy("");
  }

  async function loadHistory() {
    const res = await fetch(`/api/admin/content/${pageKey}/revisions`);
    const body = (await res.json().catch(() => ({}))) as { revisions?: Revision[] };
    setRevisions(body.revisions ?? []);
  }

  async function restore(id: string) {
    const res = await fetch(`/api/admin/content/${pageKey}/revisions/${id}/restore`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    if (res.ok) {
      // Reload so the restored draft is shown
      window.location.reload();
      return;
    }
    setMessage({ kind: "error", text: res.status === 409 ? t.outdated : t.error });
  }

  const fmtDate = new Intl.DateTimeFormat(uiLang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
  const status = dirty ? t.unsaved : hasDraft ? t.draftPending : t.upToDate;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/content" className="self-start text-sm font-semibold text-blue hover:text-navy">
          <span aria-hidden className="me-1 inline-block rtl:-scale-x-100">←</span>
          {t.back}
        </Link>
        <h1 className="font-display text-h2 font-normal">{pageName}</h1>
      </div>

      {/* Sticky action bar */}
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-bov border border-line bg-paper/95 p-3 shadow-sm backdrop-blur">
        <span
          className={`rounded-bov px-2 py-1 text-xs font-semibold ${dirty ? "bg-danger/10 text-danger" : hasDraft ? "bg-gold/20 text-gold-deep" : "bg-sky-tint text-blue-deep"}`}
        >
          {status}
        </span>
        <div className="ms-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            disabled={!!busy || !dirty}
            className="h-10 rounded-bov border border-navy px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark disabled:opacity-40"
          >
            {busy === "save" ? t.saving : t.save}
          </button>
          <button
            type="button"
            onClick={publish}
            disabled={!!busy || (!dirty && !hasDraft)}
            className="h-10 rounded-bov bg-gold px-4 text-sm font-semibold text-navy hover:bg-gold-hover disabled:opacity-40"
          >
            {busy === "publish" ? t.publishing : t.publish}
          </button>
          {(hasDraft || dirty) && (
            <button type="button" onClick={discard} disabled={!!busy} className="h-10 rounded-bov px-3 text-sm font-semibold text-danger hover:underline disabled:opacity-40">
              {t.discard}
            </button>
          )}
        </div>
        <p role="status" className={`w-full text-sm empty:hidden ${message?.kind === "error" ? "text-danger" : "text-blue-deep"}`}>
          {message?.text ?? ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          aria-label={t.search}
          className={`${input} h-10 max-w-[360px] py-0`}
        />
        <a href={`${portalUrl}/${uiLang}${viewPath}`} target="_blank" rel="noopener" className="text-sm font-semibold text-blue hover:text-navy">
          {t.viewSite} ↗
        </a>
      </div>

      {groups.length === 0 && <p className="text-ink-soft">{t.noMatch}</p>}

      <div className="flex flex-col gap-4">
        {groups.map(([group, groupFields]) => (
          <details key={group} open={!!query || groups.length <= 3} className="rounded-bov border border-line bg-white">
            <summary className="cursor-pointer list-none px-4 py-3 font-display text-xl text-ink marker:hidden hover:bg-sand/60">
              {label(group)}
              <span className="ms-2 text-sm text-ink-soft">({groupFields.length})</span>
            </summary>
            <div className="flex flex-col gap-5 border-t border-line p-4">
              {groupFields.map((f) => {
                const fieldLabel = f.path.slice(1).map(segLabel).join(" › ") || label(group);
                const id = pathId(f.path);
                if (f.kind === "image") {
                  const value = String(getAt(docs.en, f.path) ?? "");
                  return (
                    <ImageField
                      key={id}
                      value={value}
                      onChange={(p) => updateImage(f.path, p)}
                      portalUrl={portalUrl}
                      t={t.image}
                      label={fieldLabel}
                      changed={value !== String(getAt(live.en, f.path) ?? "")}
                      changedLabel={t.changed}
                    />
                  );
                }
                const values = LOCALES.map((l) => String(getAt(docs[l], f.path) ?? ""));
                const long = values.some((v) => v.length > 90 || v.includes("\n"));
                return (
                  <fieldset key={id} className="flex flex-col gap-2">
                    <legend className="mb-1 text-sm font-semibold text-ink">{fieldLabel}</legend>
                    <div className="grid gap-3 lg:grid-cols-3">
                      {LOCALES.map((l, i) => {
                        const changed = values[i] !== String(getAt(live[l], f.path) ?? "");
                        const common = {
                          id: `${id}-${l}`,
                          value: values[i],
                          lang: l,
                          dir: l === "ar" ? "rtl" : "ltr",
                          onChange: (e: { target: { value: string } }) => update(l, f.path, e.target.value),
                          className: `${input} ${changed ? "border-gold bg-gold/5" : ""}`,
                        } as const;
                        return (
                          <label key={l} htmlFor={common.id} className="flex flex-col gap-1">
                            <span className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                              {t.langs[l]}
                              {changed && <span className="rounded-bov bg-gold/20 px-1.5 py-0.5 text-[11px] text-gold-deep">{t.changed}</span>}
                            </span>
                            {long ? <textarea rows={Math.min(8, Math.ceil(Math.max(...values.map((v) => v.length)) / 70) + 1)} {...common} /> : <input type="text" {...common} />}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </details>
        ))}
      </div>

      {/* History */}
      <details
        className="rounded-bov border border-line bg-white"
        onToggle={(e) => {
          if ((e.target as HTMLDetailsElement).open && !revisions) void loadHistory();
        }}
      >
        <summary className="cursor-pointer list-none px-4 py-3 font-display text-xl text-ink hover:bg-sand/60">{t.history}</summary>
        <div className="border-t border-line p-4">
          {revisions === null ? (
            <p className="text-sm text-ink-soft">…</p>
          ) : revisions.length === 0 ? (
            <p className="text-sm text-ink-soft">{t.historyEmpty}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {revisions.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5 text-sm">
                  <span className="font-medium text-ink">{fmtDate.format(new Date(r.createdAt))}</span>
                  <span className="rounded-bov bg-sand px-1.5 py-0.5 text-xs font-semibold">{t.langs[r.locale as Locale] ?? r.locale}</span>
                  <span className="text-ink-soft">{r.note === "seed" ? t.seedNote : r.by ?? ""}</span>
                  <button type="button" onClick={() => restore(r.id)} className="ms-auto text-sm font-semibold text-blue hover:text-navy">
                    {t.restore}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </div>
  );
}
