"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "pending" | "review" | "hold" | "approved" | "rejected";
type Labels = {
  actions: { publish: string; unpublish: string; review: string; hold: string; approve: string; reject: string; reset: string };
  noConsent: string;
  saved: string;
  error: string;
};
type Body = { status?: Status; published?: boolean };

const base = "h-11 rounded-bov px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Owner's actions on a submission (2026-11-14): add to the site (publish + accept, needs consent),
 * under review, on hold (comment later), accept without publishing, reject, remove from site, back to new.
 */
export function ApplicationActions({ id, status, published, consent, t }: { id: string; status: Status; published: boolean; consent: boolean; t: Labels }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(body: Body) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) {
        setMessage({ ok: true, text: t.saved });
        router.refresh();
      } else setMessage({ ok: false, text: res.status === 409 ? t.noConsent : t.error });
    } catch {
      setMessage({ ok: false, text: t.error });
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {published ? (
        <button type="button" disabled={busy} onClick={() => send({ published: false })} className={`${base} border border-danger text-danger hover:bg-danger hover:text-on-dark`}>
          {t.actions.unpublish}
        </button>
      ) : (
        <>
          <button type="button" disabled={busy || !consent} onClick={() => send({ published: true })} className={`${base} bg-gold text-navy hover:bg-gold-hover`}>
            {t.actions.publish}
          </button>
          {!consent && <p className="text-xs text-ink-soft">{t.noConsent}</p>}
        </>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {status !== "review" && (
          <button type="button" disabled={busy} onClick={() => send({ status: "review" })} className={`${base} border border-line bg-white text-ink hover:border-navy`}>
            {t.actions.review}
          </button>
        )}
        {status !== "hold" && (
          <button type="button" disabled={busy} onClick={() => send({ status: "hold" })} className={`${base} border border-line bg-white text-ink hover:border-navy`}>
            {t.actions.hold}
          </button>
        )}
        {status !== "approved" && (
          <button type="button" disabled={busy} onClick={() => send({ status: "approved" })} className={`${base} bg-navy text-on-dark hover:bg-navy-hover`}>
            {t.actions.approve}
          </button>
        )}
        {status !== "rejected" && (
          <button type="button" disabled={busy} onClick={() => send({ status: "rejected" })} className={`${base} border border-danger/60 text-danger hover:bg-danger hover:text-on-dark`}>
            {t.actions.reject}
          </button>
        )}
        {status !== "pending" && (
          <button type="button" disabled={busy} onClick={() => send({ status: "pending" })} className={`${base} text-ink-soft hover:text-ink`}>
            {t.actions.reset}
          </button>
        )}
      </div>
      <p role="status" className={`text-sm empty:hidden ${message?.ok ? "text-blue-deep" : "text-danger"}`}>{message?.text ?? ""}</p>
    </div>
  );
}
