"use client";

import { useRef, useState, type ChangeEvent } from "react";
import type { Dict } from "@/lib/i18n";

type Labels = Dict["content"]["image"];
const MAX = 5 * 1024 * 1024;

/**
 * One image for all three languages: preview, upload (to /api/admin/media), remove (→ striped placeholder).
 * Uploads are served at /media/…; images shipped with the portal are previewed from the portal.
 */
export function ImageField({
  value,
  onChange,
  portalUrl,
  t,
  label,
  changed,
  changedLabel,
}: {
  value: string;
  onChange: (path: string) => void;
  portalUrl: string;
  t: Labels;
  label: string;
  changed: boolean;
  changedLabel: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const preview = value ? (value.startsWith("/media/") ? value : `${portalUrl}${value}`) : "";

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (file.size > MAX) return setError(t.tooBig);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { path?: string; error?: string };
      if (res.ok && data.path) onChange(data.path);
      else setError(res.status === 413 || data.error === "too_big" ? t.tooBig : t.notImage);
    } catch {
      setError(t.notImage);
    }
    setBusy(false);
  }

  return (
    <div className={`flex flex-col gap-3 rounded-bov border bg-white p-4 sm:flex-row sm:items-start ${changed ? "border-gold" : "border-line"}`}>
      <div className="bg-stripes-light relative aspect-video w-full flex-none overflow-hidden rounded-bov border border-line sm:w-56">
        {/* eslint-disable-next-line @next/next/no-img-element -- previews of arbitrary uploads */}
        {preview && <img src={preview} alt="" className="absolute inset-0 size-full object-cover" />}
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="text-sm font-semibold text-ink">
          {label}
          {changed && <span className="ms-2 rounded-bov bg-gold/20 px-1.5 py-0.5 text-[11px] text-gold-deep">{changedLabel}</span>}
        </span>
        {!value && <span className="text-sm text-ink-soft">{t.none}</span>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="h-10 rounded-bov bg-navy px-4 text-sm font-semibold text-on-dark hover:bg-navy-hover disabled:opacity-60"
          >
            {busy ? t.uploading : value ? t.replace : t.upload}
          </button>
          {value && (
            <button type="button" onClick={() => onChange("")} className="h-10 rounded-bov border border-line px-4 text-sm font-semibold text-ink hover:border-danger hover:text-danger">
              {t.remove}
            </button>
          )}
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="sr-only" tabIndex={-1} />
        </div>
        <span className="text-xs text-ink-soft">{t.hint}</span>
        <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
      </div>
    </div>
  );
}
