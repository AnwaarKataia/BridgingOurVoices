"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** "Mark as done" on a lesson; after marking, goes on to the next lesson. */
export function MarkDoneButton({
  lessonId,
  done,
  nextHref,
  t,
}: {
  lessonId: string;
  done: boolean;
  nextHref: string | null;
  t: { markDone: string; done: string; undo: string; error: string };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function set(value: boolean) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/learn-api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: value }),
      });
      if (!res.ok) throw new Error();
      if (value && nextHref) router.push(nextHref);
      router.refresh();
    } catch {
      setError(t.error);
    }
    setBusy(false);
  }

  return (
    <span className="flex flex-wrap items-center gap-3">
      {done ? (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-bov bg-gold px-3 py-2 text-sm font-semibold text-navy">✓ {t.done}</span>
          <button type="button" disabled={busy} onClick={() => set(false)} className="text-sm font-semibold text-blue underline underline-offset-4 hover:text-navy disabled:opacity-50">
            {t.undo}
          </button>
        </>
      ) : (
        <button type="button" disabled={busy} onClick={() => set(true)} className="rounded-bov bg-gold px-5 py-2.5 text-sm font-semibold text-navy hover:bg-gold-hover disabled:opacity-60">
          ✓ {t.markDone}
        </button>
      )}
      <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
    </span>
  );
}
