"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "new" | "review" | "hold" | "replied" | "archived";
type Labels = { actions: Record<Status, string>; saved: string; error: string };

const base = "h-11 rounded-bov px-4 text-sm font-semibold transition disabled:opacity-40";
const order: Status[] = ["review", "hold", "replied", "archived", "new"];
const tone: Record<Status, string> = {
  review: "border border-line bg-white text-ink hover:border-navy",
  hold: "border border-line bg-white text-ink hover:border-navy",
  replied: "bg-navy text-on-dark hover:bg-navy-hover",
  archived: "border border-line bg-white text-ink-soft hover:border-navy",
  new: "text-ink-soft hover:text-ink",
};

/** Status buttons for a contact message: under review, on hold, replied, archive, back to new. */
export function MessageActions({ id, status, t }: { id: string; status: Status; t: Labels }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function set(next: Status) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      setMessage(res.ok ? { ok: true, text: t.saved } : { ok: false, text: t.error });
      if (res.ok) router.refresh();
    } catch {
      setMessage({ ok: false, text: t.error });
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {order
          .filter((s) => s !== status)
          .map((s) => (
            <button key={s} type="button" disabled={busy} onClick={() => set(s)} className={`${base} ${tone[s]}`}>
              {t.actions[s]}
            </button>
          ))}
      </div>
      <p role="status" className={`text-sm empty:hidden ${message?.ok ? "text-blue-deep" : "text-danger"}`}>{message?.text ?? ""}</p>
    </div>
  );
}
