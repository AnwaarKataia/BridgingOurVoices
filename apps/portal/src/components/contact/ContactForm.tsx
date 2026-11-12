"use client";

import { useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { ContactContent } from "@/content/contact";
import { apiUrl } from "@/lib/site";
import type { SiteContent } from "@/content/site";
import { btn } from "../ui";
import { PrivacyNote } from "../PrivacyNote";

type Status = "idle" | "sending" | "done" | "error";

const field =
  "w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";
const label = "flex flex-col gap-1.5 text-sm font-medium text-ink";

type Props = { locale: Locale; form: ContactContent["form"]; privacy: SiteContent["privacy"] };

export function ContactForm({ locale, form, privacy }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const data = Object.fromEntries(new FormData(el)) as Record<string, string>;
    setStatus("sending");
    try {
      const res = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      el.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative flex flex-col gap-[18px] rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          {form.name}
          <input name="name" required minLength={2} maxLength={120} autoComplete="name" className={`${field} h-12`} />
        </label>
        <label className={label}>
          {form.email}
          <input name="email" type="email" required maxLength={254} autoComplete="email" dir="ltr" className={`${field} h-12 rtl:text-end`} />
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
        <textarea name="message" required minLength={10} maxLength={5000} rows={6} className={`${field} min-h-40 py-3 leading-relaxed`} />
      </label>

      {/* Honeypot: hidden from people, bots fill it and get ignored by the API */}
      <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col items-start gap-3">
        <PrivacyNote locale={locale} privacy={privacy} />
        <button type="submit" disabled={status === "sending"} className={`${btn.navy} h-[50px] px-7 text-[15px] disabled:opacity-60`}>
          {status === "sending" ? form.sending : form.submit}
        </button>
        <p
          role="status"
          className={`m-0 text-sm empty:hidden ${status === "error" ? "text-danger" : "text-blue-deep"}`}
        >
          {status === "done" ? form.success : status === "error" ? form.error : ""}
        </p>
      </div>
    </form>
  );
}
