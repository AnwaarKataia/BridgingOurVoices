"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PasswordInput } from "./PasswordInput";

type Labels = { email: string; password: string; submit: string; signingIn: string; invalid: string; tooMany: string; error: string; showPassword: string; hidePassword: string };

const field =
  "h-12 w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";

/** Posts to /api/auth/login (proxied to the API); the API sets the httpOnly session cookie. */
export function LoginForm({ t }: { t: Labels }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      if (res.ok) {
        router.replace("/");
        router.refresh();
        return;
      }
      setError(res.status === 429 ? t.tooMany : res.status === 401 || res.status === 400 ? t.invalid : t.error);
    } catch {
      setError(t.error);
    }
    setSending(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.email}
        <input name="email" type="email" required autoComplete="username" dir="ltr" className={`${field} rtl:text-end`} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t.password}
        <PasswordInput name="password" required autoComplete="current-password" className={field} showLabel={t.showPassword} hideLabel={t.hidePassword} />
      </label>
      <p role="alert" className="m-0 text-sm text-danger empty:hidden">{error}</p>
      <button
        type="submit"
        disabled={sending}
        className="mt-1 inline-flex h-12 items-center justify-center rounded-bov bg-navy px-6 font-semibold text-on-dark transition hover:bg-navy-hover disabled:opacity-60"
      >
        {sending ? t.signingIn : t.submit}
      </button>
    </form>
  );
}
