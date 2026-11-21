"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "./PasswordInput";

type Labels = {
  next: string;
  confirm: string;
  rule: string;
  save: string;
  saving: string;
  done: string;
  signIn: string;
  expired: string;
  newLink: string;
  mismatch: string;
  tooMany: string;
  error: string;
  weak: { length: string; letter: string; number: string; symbol: string };
  showPassword: string;
  hidePassword: string;
};

const field =
  "h-12 w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";

/** Sets a new password with the emailed token; afterwards every session of the account is signed out. */
export function ResetForm({ token, t }: { token: string; t: Labels }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "expired">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm") ?? "")) return setError(t.mismatch);
    setState("saving");
    setError("");
    try {
      const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      if (res.ok) return setState("done");
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (body.error === "expired") return setState("expired");
      const weak = body.error?.startsWith("weak_") ? t.weak[body.error.slice(5) as keyof Labels["weak"]] : undefined;
      setError(weak ?? (res.status === 429 ? t.tooMany : t.error));
    } catch {
      setError(t.error);
    }
    setState("idle");
  }

  if (state === "done" || state === "expired") {
    return (
      <div className="flex flex-col items-start gap-4">
        <p role="status" className={`m-0 rounded-bov p-4 text-[15px] leading-relaxed ${state === "done" ? "bg-sand text-ink" : "bg-danger/10 text-danger"}`}>
          {state === "done" ? t.done : t.expired}
        </p>
        <Link href={state === "done" ? "/login" : "/forgot"} className="inline-flex h-11 items-center rounded-bov bg-navy px-5 text-sm font-semibold text-on-dark hover:bg-navy-hover">
          {state === "done" ? t.signIn : t.newLink}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.next}
        <PasswordInput name="password" required minLength={12} maxLength={200} autoComplete="new-password" className={field} showLabel={t.showPassword} hideLabel={t.hidePassword} />
        <span className="text-xs font-normal text-ink-soft">{t.rule}</span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.confirm}
        <PasswordInput name="confirm" required minLength={12} maxLength={200} autoComplete="new-password" className={field} showLabel={t.showPassword} hideLabel={t.hidePassword} />
      </label>
      <p role="alert" className="m-0 text-sm text-danger empty:hidden">{error}</p>
      <button
        type="submit"
        disabled={state === "saving"}
        className="mt-1 inline-flex h-12 items-center justify-center rounded-bov bg-navy px-6 font-semibold text-on-dark transition hover:bg-navy-hover disabled:opacity-60"
      >
        {state === "saving" ? t.saving : t.save}
      </button>
    </form>
  );
}
