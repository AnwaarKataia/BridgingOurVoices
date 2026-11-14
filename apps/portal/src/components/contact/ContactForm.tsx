"use client";

import { useRef, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { ContactContent } from "@/content/contact";
import { apiUrl } from "@/lib/site";
import type { SiteContent } from "@/content/site";
import { btn } from "../ui";
import { PrivacyNote } from "../PrivacyNote";
import { ErrorSummary, FieldError, focusFirst, serverErrors, validateForm, type FormErrors } from "../forms/FormHelpers";

type Status = "idle" | "sending" | "done" | "error";

const field =
  "w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";
const label = "flex flex-col gap-1.5 text-sm font-medium text-ink";

type Props = { locale: Locale; form: ContactContent["form"]; privacy: SiteContent["privacy"]; forms: SiteContent["forms"] };

export function ContactForm({ locale, form, privacy, forms }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FormErrors>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    // Every problem at once, with a message under each field
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
      const res = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) {
        // Fastify schema errors name the field in the message (e.g. "body/email ...")
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        const field = /body\/(\w+)/.exec(body.message ?? "")?.[1];
        if (field) {
          const mapped = serverErrors([field], forms);
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
          {form.name}
          <input name="name" aria-invalid={errors.name ? true : undefined} required minLength={2} maxLength={120} autoComplete="name" className={`${field} h-12`} />
          <FieldError msg={errors.name} />
        </label>
        <label className={label}>
          {form.email}
          <input name="email" aria-invalid={errors.email ? true : undefined} type="email" required maxLength={254} autoComplete="email" dir="ltr" className={`${field} h-12 rtl:text-end`} />
          <FieldError msg={errors.email} />
        </label>
      </div>

      <label className={label}>
        {form.topic}
        <select name="topic" required defaultValue="general" className={`${field} h-12`}>
          {form.topics.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className={label}>
        {form.message}
        <textarea name="message" aria-invalid={errors.message ? true : undefined} required minLength={10} maxLength={5000} rows={6} className={`${field} min-h-40 py-3 leading-relaxed`} />
        <FieldError msg={errors.message} />
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
        <button type="submit" disabled={status === "sending"} className={`${btn.navy} h-[50px] px-7 text-[15px] disabled:opacity-60`}>
          {status === "sending" ? form.sending : form.submit}
        </button>
        <p
          role="status"
          className={`m-0 text-sm empty:hidden ${status === "error" ? "text-danger" : "text-blue-deep"}`}
        >
          {status === "done" ? form.success : status === "error" && !Object.keys(errors).length ? form.error : ""}
        </p>
      </div>
    </form>
  );
}
