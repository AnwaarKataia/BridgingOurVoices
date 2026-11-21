"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { ActivitiesContent } from "@/content/activities";
import type { SiteContent } from "@/content/site";
import { btn } from "../ui";
import { PrivacyNote } from "../PrivacyNote";
import { ErrorSummary, FieldError, focusFirst, validateForm, type FormErrors } from "../forms/FormHelpers";
import { PasswordInput } from "../forms/PasswordInput";

type Props = {
  mode: "signup" | "login";
  locale: Locale;
  /** Where to go after signing in (a path on this site). */
  next: string;
  t: ActivitiesContent["elearning"]["learn"];
  countries: { code: string; name: string }[];
  privacy: SiteContent["privacy"];
  forms: SiteContent["forms"];
};

const field =
  "w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";
const label = "flex flex-col gap-1.5 text-sm font-medium text-ink";

/** Learner sign-up or sign-in (phase 2, 2026-11-21). The cookie is set by /learn-api (same site). */
export function LearnerAuthForm({ mode, locale, next, t, countries, privacy, forms }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const signup = mode === "signup";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    setMessage("");
    const found = validateForm(el, forms, new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale));
    setErrors(found);
    if (Object.keys(found).length) return focusFirst(el, found);
    const data = Object.fromEntries(new FormData(el)) as Record<string, string>;
    setBusy(true);
    try {
      // Sign-in checks team accounts too: the team goes on to the dashboard (owner, 2026-11-21)
      const res = await fetch(`/learn-api/${signup ? "signup" : "signin"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signup ? { ...data, locale } : { email: data.email, password: data.password }),
      });
      if (res.ok) {
        const body = (await res.json().catch(() => ({}))) as { kind?: string; redirect?: string };
        window.location.href = body.kind === "team" && body.redirect ? body.redirect : next;
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string; errors?: string[] };
      if (res.status === 429) setMessage(t.errors.tooMany);
      else if (res.status === 409) setMessage(t.errors.exists);
      else if (res.status === 401) setMessage(t.errors.invalid);
      else if (body.errors?.includes("password")) {
        setErrors({ password: t.errors.weak });
      } else if (body.errors?.includes("email")) {
        setErrors({ email: forms.email });
      } else setMessage(t.errors.generic);
    } catch {
      setMessage(t.errors.generic);
    }
    setBusy(false);
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      className="relative flex flex-col gap-[18px] rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5 sm:p-8"
    >
      {signup && (
        <label className={label}>
          {t.name}
          <input name="name" aria-invalid={errors.name ? true : undefined} required minLength={2} maxLength={120} autoComplete="name" className={`${field} h-12`} />
          <FieldError msg={errors.name} />
        </label>
      )}
      <label className={label}>
        {t.email}
        <input name="email" type="email" aria-invalid={errors.email ? true : undefined} required maxLength={254} autoComplete="email" dir="ltr" className={`${field} h-12 rtl:text-end`} />
        <FieldError msg={errors.email} />
      </label>
      {signup && (
        <label className={label}>
          {t.country}
          <select name="country" aria-invalid={errors.country ? true : undefined} required defaultValue="" className={`${field} h-12`}>
            <option value="" disabled>{t.countryPlaceholder}</option>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <FieldError msg={errors.country} />
        </label>
      )}
      <label className={label}>
        {t.password}
        <PasswordInput
          name="password"
          aria-invalid={errors.password ? true : undefined}
          required
          minLength={signup ? 12 : 1}
          maxLength={200}
          autoComplete={signup ? "new-password" : "current-password"}
          className={`${field} h-12`}
          showLabel={t.showPassword}
          hideLabel={t.hidePassword}
        />
        {signup && <span className="text-xs font-normal text-ink-soft">{t.passwordHint}</span>}
        <FieldError msg={errors.password} />
      </label>

      {signup && (
        // Honeypot: hidden from people, bots fill it and get ignored by the API
        <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      )}

      <ErrorSummary errors={errors} form={formRef.current} title={forms.summary} />
      <div className="flex flex-col items-start gap-3">
        {signup && <PrivacyNote locale={locale} privacy={privacy} />}
        <button type="submit" disabled={busy} className={`${btn.navy} h-[50px] px-7 text-[15px] disabled:opacity-60`}>
          {busy ? t.sending : signup ? t.submitSignup : t.submitLogin}
        </button>
        <p role="alert" className="m-0 text-sm text-danger empty:hidden">{message}</p>
      </div>
    </form>
  );
}
