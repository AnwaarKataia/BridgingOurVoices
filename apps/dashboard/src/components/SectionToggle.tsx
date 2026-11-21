"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Shows a section on the site, or puts it back to "Coming soon". */
export function SectionToggle({ sectionKey, visible, t }: { sectionKey: string; visible: boolean; t: { show: string; hide: string; error: string } }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: sectionKey, visible: !visible }),
      });
      if (res.ok) router.refresh();
      else setError(t.error);
    } catch {
      setError(t.error);
    }
    setBusy(false);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        className={`h-10 rounded-bov px-4 text-sm font-semibold disabled:opacity-60 ${
          visible ? "border border-line bg-white text-ink hover:border-navy" : "bg-navy text-on-dark hover:bg-navy-hover"
        }`}
      >
        {visible ? t.hide : t.show}
      </button>
      <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
    </span>
  );
}
