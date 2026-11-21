"use client";

import { useState } from "react";

type Labels = { open: string; opening: string; error: string };

/**
 * Opens a page of the site in preview mode (hidden sections and drafts visible to this browser only).
 * Gets a 2-hour signed link from the API, then the portal's /api/preview switches preview on.
 */
export function PreviewButton({ portalUrl, path, t, className }: { portalUrl: string; path: string; t: Labels; className?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function open() {
    setBusy(true);
    setError("");
    // Open the window now (inside the click) so pop-up blockers allow it, then point it at the preview link
    const win = window.open("", "_blank");
    try {
      const res = await fetch("/api/admin/preview-token");
      const data = (await res.json().catch(() => ({}))) as { token?: string };
      if (!res.ok || !data.token) throw new Error();
      const url = `${portalUrl}/api/preview?token=${encodeURIComponent(data.token)}&to=${encodeURIComponent(path)}`;
      if (win) win.location.href = url;
      else window.location.href = url;
    } catch {
      win?.close();
      setError(t.error);
    }
    setBusy(false);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={open}
        disabled={busy}
        className={className ?? "h-10 rounded-bov border border-navy bg-white px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark disabled:opacity-60"}
      >
        👁 {busy ? t.opening : t.open}
      </button>
      <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
    </span>
  );
}
