"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { ActivitiesContent } from "@/content/activities";
import type { SiteContent } from "@/content/site";
import { apiUrl } from "@/lib/site";
import { btn } from "../ui";
import { PrivacyNote } from "../PrivacyNote";
import { ErrorSummary, FieldError, focusFirst, serverErrors, validateForm, type FormErrors } from "../forms/FormHelpers";

type Status = "idle" | "sending" | "done" | "closed" | "error";
const field =
  "w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";
const label = "flex flex-col gap-1.5 text-sm font-medium text-ink";

type Props = {
  locale: Locale;
  slug: string;
  t: ActivitiesContent["elearning"]["register"];
  countries: { code: string; name: string }[];
  privacy: SiteContent["privacy"];
  forms: SiteContent["forms"];
};

/** Registration for a published course (phase 1: the team follows up by email). */
export function CourseRegisterForm({ locale, slug, t, countries, privacy, forms }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const el = ev.currentTarget;
    const found = validateForm(el, forms, new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale));
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus("error");
      focusFirst(el, found);
      return;
    }
    const data = Object.fromEntries(new FormData(el)) as Record<string, string>;
    setStatus("sending");
    try {
      const res = await fetch(`${apiUrl}/public/courses/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (res.status === 409) return setStatus("closed");
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: string[] };
        const names = body.errors ?? [/body\/(\w+)/.exec(body.message ?? "")?.[1]].filter((x): x is string => !!x);
        if (names.length) {
          const mapped = serverErrors(names, forms);
          setErrors(mapped);
          setStatus("error");
          focusFirst(el, mapped);
          return;
        }
        throw new Error(String(res.status));
      }
      setStatus("done");
      setErrors({});
      el.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      className="relative flex flex-col gap-[18px] rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          {t.name}
          <input name="name" aria-invalid={errors.name ? true : undefined} required minLength={2} maxLength={120} autoComplete="name" className={`${field} h-12`} />
          <FieldError msg={errors.name} />
        </label>
        <label className={label}>
          {t.email}
          <input name="email" aria-invalid={errors.email ? true : undefined} type="email" required maxLength={254} autoComplete="email" dir="ltr" className={`${field} h-12 rtl:text-end`} />
          <FieldError msg={errors.email} />
        </label>
      </div>
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

      {/* Honeypot: hidden from people, bots fill it and get ignored by the API */}
      <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <ErrorSummary errors={errors} form={formRef.current} title={forms.summary} />
      <div className="flex flex-col items-start gap-3">
        <PrivacyNote locale={locale} privacy={privacy} />
        <button type="submit" disabled={status === "sending" || status === "done"} className={`${btn.navy} h-[50px] px-7 text-[15px] disabled:opacity-60`}>
          {status === "sending" ? t.sending : t.submit}
        </button>
        <p role="status" className={`m-0 text-sm empty:hidden ${status === "error" || status === "closed" ? "text-danger" : "text-blue-deep"}`}>
          {status === "done" ? t.success : status === "closed" ? t.closed : status === "error" && !Object.keys(errors).length ? t.error : ""}
        </p>
      </div>
    </form>
  );
}
