"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Labels = { note: string; noteHint: string; saveNote: string; saved: string; error: string };

/** Internal team note on a message or a submission (PATCH { note } to `endpoint`). */
export function NoteEditor({ endpoint, initial, t }: { endpoint: string; initial: string; t: Labels }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(endpoint, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: value }) });
      if (res.ok) {
        setSaved(value);
        setMessage({ ok: true, text: t.saved });
        router.refresh();
      } else setMessage({ ok: false, text: t.error });
    } catch {
      setMessage({ ok: false, text: t.error });
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="team-note" className="text-sm font-semibold text-ink">{t.note}</label>
      <textarea
        id="team-note"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={5000}
        rows={4}
        dir="auto"
        className="w-full rounded-bov border border-line-input bg-white px-3 py-2 text-[15px] leading-relaxed text-ink focus:border-sky focus:outline-2 focus:outline-sky"
      />
      <span className="text-xs text-ink-soft">{t.noteHint}</span>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={busy || value === saved}
          className="h-10 rounded-bov border border-navy px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark disabled:opacity-40"
        >
          {t.saveNote}
        </button>
        <span role="status" className={`text-sm empty:hidden ${message?.ok ? "text-blue-deep" : "text-danger"}`}>{message?.text ?? ""}</span>
      </div>
    </div>
  );
}
