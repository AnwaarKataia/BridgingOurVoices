"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Labels = { unsubscribe: string; remove: string; confirmUnsubscribe: string; confirmRemove: string; error: string };

/** Unsubscribe (keeps the record) or delete permanently, each after a confirmation. */
export function SubscriberActions({ id, active, t }: { id: string; active: boolean; t: Labels }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function act(remove: boolean) {
    if (!window.confirm(remove ? t.confirmRemove : t.confirmUnsubscribe)) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/subscribers/${id}${remove ? "?remove=1" : ""}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else setError(true);
    } catch {
      setError(true);
    }
    setBusy(false);
  }

  return (
    <span className="flex flex-wrap items-center gap-3">
      {active && (
        <button type="button" disabled={busy} onClick={() => act(false)} className="text-sm font-semibold text-blue hover:text-navy disabled:opacity-40">
          {t.unsubscribe}
        </button>
      )}
      <button type="button" disabled={busy} onClick={() => act(true)} className="text-sm font-semibold text-danger hover:underline disabled:opacity-40">
        {t.remove}
      </button>
      {error && <span role="alert" className="text-xs text-danger">{t.error}</span>}
    </span>
  );
}
