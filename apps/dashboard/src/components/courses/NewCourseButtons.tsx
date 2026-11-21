"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Labels = { newCourse: string; newWebinar: string; creating: string; error: string };

/** Creates a draft course or webinar and opens it in the editor. */
export function NewCourseButtons({ t }: { t: Labels }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"" | "course" | "webinar">("");
  const [error, setError] = useState("");

  async function create(kind: "course" | "webinar") {
    setBusy(kind);
    setError("");
    try {
      const res = await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      if (res.ok && data.id) return router.push(`/courses/${data.id}`);
      setError(t.error);
    } catch {
      setError(t.error);
    }
    setBusy("");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(["course", "webinar"] as const).map((k) => (
        <button
          key={k}
          type="button"
          disabled={!!busy}
          onClick={() => create(k)}
          className={`h-11 rounded-bov px-5 text-sm font-semibold disabled:opacity-60 ${
            k === "course" ? "bg-navy text-on-dark hover:bg-navy-hover" : "border border-navy text-navy hover:bg-navy hover:text-on-dark"
          }`}
        >
          + {busy === k ? t.creating : k === "course" ? t.newCourse : t.newWebinar}
        </button>
      ))}
      <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
    </div>
  );
}
