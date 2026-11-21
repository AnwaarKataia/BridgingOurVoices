"use client";

import { useState, type FormEvent } from "react";
import type { Lang } from "@/lib/i18n";

type Labels = { email: string; submit: string; sending: string; sent: string; tooMany: string; error: string };

const field =
  "h-12 w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";

/** Asks the API to email a reset link. The answer is the same whether or not the email has an account. */
export function ForgotForm({ lang, t }: { lang: Lang; t: Labels }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, lang }) });
      if (res.ok) return setState("sent");
      setError(res.status === 429 ? t.tooMany : t.error);
    } catch {
      setError(t.error);
    }
    setState("idle");
  }

  if (state === "sent") return <p role="status" className="m-0 rounded-bov bg-sand p-4 text-[15px] leading-relaxed text-ink">{t.sent}</p>;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.email}
        <input name="email" type="email" required maxLength={254} autoComplete="username" dir="ltr" className={`${field} rtl:text-end`} />
      </label>
      <p role="alert" className="m-0 text-sm text-danger empty:hidden">{error}</p>
      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-1 inline-flex h-12 items-center justify-center rounded-bov bg-navy px-6 font-semibold text-on-dark transition hover:bg-navy-hover disabled:opacity-60"
      >
        {state === "sending" ? t.sending : t.submit}
      </button>
    </form>
  );
}
