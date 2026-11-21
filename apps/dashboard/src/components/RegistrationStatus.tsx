"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "new" | "accepted" | "rejected";

/** Status of one registration (course or event). */
export function RegistrationStatus({
  id,
  type,
  status,
  t,
}: {
  id: string;
  type: "course" | "event";
  status: Status;
  t: { label: string; status: Record<Status, string>; error: string };
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const url = type === "course" ? `/api/admin/registrations/${id}` : `/api/admin/event-registrations/${id}`;

  async function change(next: Status) {
    setError("");
    try {
      const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      if (res.ok) router.refresh();
      else setError(t.error);
    } catch {
      setError(t.error);
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <label htmlFor={`rs-${id}`} className="sr-only">{t.label}</label>
      <select
        id={`rs-${id}`}
        value={status}
        onChange={(e) => change(e.target.value as Status)}
        className="h-10 rounded-bov border border-line-input bg-white px-3 text-[15px] text-ink focus:border-sky focus:outline-2 focus:outline-sky"
      >
        {(["new", "accepted", "rejected"] as const).map((s) => (
          <option key={s} value={s}>{t.status[s]}</option>
        ))}
      </select>
      <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
    </span>
  );
}
