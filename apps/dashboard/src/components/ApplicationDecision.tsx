"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "pending" | "approved" | "rejected";
type Labels = { approve: string; reject: string; reset: string; saved: string; error: string };

/** Accept / reject / back to review for one application. */
export function ApplicationDecision({ id, status, t }: { id: string; status: Status; t: Labels }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function decide(next: Status) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      setMessage(res.ok ? { ok: true, text: t.saved } : { ok: false, text: t.error });
      if (res.ok) router.refresh();
    } catch {
      setMessage({ ok: false, text: t.error });
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {status !== "approved" && (
          <button type="button" disabled={busy} onClick={() => decide("approved")} className="h-11 rounded-bov bg-navy px-5 font-semibold text-on-dark hover:bg-navy-hover disabled:opacity-50">
            {t.approve}
          </button>
        )}
        {status !== "rejected" && (
          <button type="button" disabled={busy} onClick={() => decide("rejected")} className="h-11 rounded-bov border border-danger px-5 font-semibold text-danger hover:bg-danger hover:text-on-dark disabled:opacity-50">
            {t.reject}
          </button>
        )}
        {status !== "pending" && (
          <button type="button" disabled={busy} onClick={() => decide("pending")} className="h-11 rounded-bov border border-line px-5 font-semibold text-ink hover:border-navy disabled:opacity-50">
            {t.reset}
          </button>
        )}
      </div>
      <p role="status" className={`text-sm empty:hidden ${message?.ok ? "text-blue-deep" : "text-danger"}`}>{message?.text ?? ""}</p>
    </div>
  );
}
