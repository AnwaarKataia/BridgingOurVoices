"use client";

import { useState, type FormEvent } from "react";
import { PasswordInput } from "./PasswordInput";
import type { Dict } from "@/lib/i18n";

type Labels = Dict["account"];
type ErrorKey = keyof Labels["errors"];

const field =
  "h-12 w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";

/** Same rule as the API (apps/api/src/auth/password.ts), checked here first for quick feedback. */
function ruleProblem(pw: string): ErrorKey | null {
  if (pw.length < 12) return "weak_length";
  if (!/\p{L}/u.test(pw)) return "weak_letter";
  if (!/\p{N}/u.test(pw)) return "weak_number";
  if (!/[^\p{L}\p{N}\s]/u.test(pw)) return "weak_symbol";
  return null;
}

export function ChangePasswordForm({ t, eye }: { t: Labels; eye: { show: string; hide: string } }) {
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<ErrorKey | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const currentPassword = String(data.get("current") ?? "");
    const newPassword = String(data.get("next") ?? "");
    setError(null);
    if (newPassword !== String(data.get("confirm") ?? "")) return setError("mismatch");
    const problem = ruleProblem(newPassword);
    if (problem) return setError(problem);

    setStatus("saving");
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        form.reset();
        setStatus("done");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(res.status === 429 ? "tooMany" : body.error && body.error in t.errors ? (body.error as ErrorKey) : "generic");
    } catch {
      setError("generic");
    }
    setStatus("idle");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" onChange={() => status === "done" && setStatus("idle")}>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.current}
        <PasswordInput name="current" required autoComplete="current-password" className={field} showLabel={eye.show} hideLabel={eye.hide} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.next}
        <PasswordInput
          name="next"
          required
          minLength={12}
          autoComplete="new-password"
          aria-describedby="pw-rule"
          className={field}
          showLabel={eye.show}
          hideLabel={eye.hide}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.confirm}
        <PasswordInput name="confirm" required minLength={12} autoComplete="new-password" className={field} showLabel={eye.show} hideLabel={eye.hide} />
      </label>
      <p id="pw-rule" className="m-0 text-[13px] text-ink-soft">{t.rule}</p>
      <p role="alert" className="m-0 text-sm text-danger empty:hidden">{error ? t.errors[error] : ""}</p>
      <p role="status" className="m-0 text-sm text-blue-deep empty:hidden">{status === "done" ? t.done : ""}</p>
      <button
        type="submit"
        disabled={status === "saving"}
        className="inline-flex h-12 items-center justify-center self-start rounded-bov bg-navy px-6 font-semibold text-on-dark transition hover:bg-navy-hover disabled:opacity-60"
      >
        {status === "saving" ? t.saving : t.submit}
      </button>
    </form>
  );
}
