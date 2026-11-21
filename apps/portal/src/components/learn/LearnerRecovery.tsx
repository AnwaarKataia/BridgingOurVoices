"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { ActivitiesContent } from "@/content/activities";
import { btn } from "../ui";

type T = ActivitiesContent["elearning"]["learn"];
const field =
  "h-12 w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";
const card = "flex flex-col gap-[18px] rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5 sm:p-8";

/** Learner "Forgot password": emails a one-time link (same answer whether or not the email has an account). */
export function LearnerForgotForm({ locale, t }: { locale: Locale; t: T }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    if (!email) return setError(t.errors.generic);
    setState("sending");
    setError("");
    try {
      const res = await fetch("/learn-api/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, locale }) });
      if (res.ok) return setState("sent");
      setError(res.status === 429 ? t.errors.tooMany : t.errors.generic);
    } catch {
      setError(t.errors.generic);
    }
    setState("idle");
  }

  if (state === "sent") return <p role="status" className="m-0 rounded-bov border border-line bg-white p-6 leading-relaxed text-ink">{t.forgot.sent}</p>;
  return (
    <form onSubmit={onSubmit} className={card}>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        {t.email}
        <input name="email" type="email" required maxLength={254} autoComplete="email" dir="ltr" className={`${field} rtl:text-end`} />
      </label>
      <p role="alert" className="m-0 text-sm text-danger empty:hidden">{error}</p>
      <button type="submit" disabled={state === "sending"} className={`${btn.navy} h-[50px] self-start px-7 text-[15px] disabled:opacity-60`}>
        {state === "sending" ? t.sending : t.forgot.submit}
      </button>
    </form>
  );
}

/** Learner "Choose a new password" from the emailed link; all sessions of the account end afterwards. */
export function LearnerResetForm({ locale, token, t }: { locale: Locale; token: string; t: T }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "expired">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm") ?? "")) return setError(t.forgot.mismatch);
    setState("saving");
    setError("");
    try {
      const res = await fetch("/learn-api/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      if (res.ok) return setState("done");
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (body.error === "expired") return setState("expired");
      setError(body.error === "weak" ? t.errors.weak : res.status === 429 ? t.errors.tooMany : t.errors.generic);
    } catch {
      setError(t.errors.generic);
    }
    setState("idle");
  }

  if (state === "done" || state === "expired") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-bov border border-line bg-white p-6">
        <p role="status" className={`m-0 leading-relaxed ${state === "done" ? "text-ink" : "text-danger"}`}>{state === "done" ? t.forgot.done : t.forgot.expired}</p>
        <Link href={`/${locale}/learn/${state === "done" ? "login" : "forgot"}`} className={btn.navy}>
          {state === "done" ? t.forgot.signIn : t.forgot.newLink}
        </Link>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className={card}>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        {t.forgot.newPassword}
        <input name="password" type="password" required minLength={12} maxLength={200} autoComplete="new-password" dir="ltr" className={field} />
        <span className="text-xs font-normal text-ink-soft">{t.passwordHint}</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        {t.forgot.confirm}
        <input name="confirm" type="password" required minLength={12} maxLength={200} autoComplete="new-password" dir="ltr" className={field} />
      </label>
      <p role="alert" className="m-0 text-sm text-danger empty:hidden">{error}</p>
      <button type="submit" disabled={state === "saving"} className={`${btn.navy} h-[50px] self-start px-7 text-[15px] disabled:opacity-60`}>
        {state === "saving" ? t.sending : t.forgot.save}
      </button>
    </form>
  );
}
