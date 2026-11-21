"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import { Avatar } from "./Avatar";

type Labels = { photo: string; photoHint: string; uploadPhoto: string; changePhoto: string; removePhoto: string; photoError: string };
const MAX = 3 * 1024 * 1024;

/** The learner's profile photo: upload, change or remove (JPG or PNG, up to 3 MB). */
export function PhotoField({ id, name, hasPhoto, t }: { id: string; name: string; hasPhoto: boolean; t: Labels }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [has, setHas] = useState(hasPhoto);
  const [version, setVersion] = useState(String(Date.now()));

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > MAX) return setError(t.photoError);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/learn-api/profile/photo", { method: "POST", body });
      if (!res.ok) throw new Error();
      setHas(true);
      setVersion(String(Date.now()));
      router.refresh();
    } catch {
      setError(t.photoError);
    }
    setBusy(false);
  }

  async function remove() {
    setBusy(true);
    await fetch("/learn-api/profile/photo", { method: "DELETE" }).catch(() => undefined);
    setHas(false);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{t.photo}</span>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar id={id} name={name} hasPhoto={has} size={88} version={version} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => input.current?.click()}
            className="rounded-bov border border-navy px-4 py-2 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark disabled:opacity-60"
          >
            {has ? t.changePhoto : t.uploadPhoto}
          </button>
          {has && (
            <button type="button" disabled={busy} onClick={remove} className="rounded-bov border border-line px-4 py-2 text-sm font-semibold text-ink hover:border-danger hover:text-danger">
              {t.removePhoto}
            </button>
          )}
          <input ref={input} type="file" accept="image/jpeg,image/png" onChange={onFile} className="sr-only" tabIndex={-1} />
        </div>
      </div>
      <span className="text-xs text-ink-soft">{t.photoHint}</span>
      <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
    </div>
  );
}
