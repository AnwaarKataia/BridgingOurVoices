"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { NetworkContent } from "@/content/network";
import { apiUrl } from "@/lib/site";
import type { SiteContent } from "@/content/site";
import { btn } from "../ui";
import { PrivacyNote } from "../PrivacyNote";
import { ErrorSummary, FieldError, focusFirst, ReligionFields, serverErrors, validateForm, WorkFields, type FormErrors } from "../forms/FormHelpers";

type Status = "idle" | "sending" | "done" | "error";
type Props = {
  locale: Locale;
  join: NetworkContent["join"];
  countries: { code: string; name: string }[];
  privacy: SiteContent["privacy"];
  /** Messages for missing or wrong fields. */
  forms: SiteContent["forms"];
};

const MAX_PHOTO = 3 * 1024 * 1024;
const input =
  "w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <span className="text-sm font-medium text-ink">
      {text}
      {required && <span aria-hidden className="ms-1 text-danger">*</span>}
    </span>
  );
}

/** "Add your voice to ours" membership application (multipart, with optional photo). */
export function JoinForm({ locale, join, countries, privacy, forms }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [resetKey, setResetKey] = useState(0);
  // message / article / both: each choice opens its own box (owner, 2026-11-21)
  const [contribution, setContribution] = useState("");
  const showQuote = contribution === "message" || contribution === "both";
  const showArticle = contribution === "article" || contribution === "both";
  const formRef = useRef<HTMLFormElement>(null);
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoError(false);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > MAX_PHOTO) {
      setPhotoError(true);
      e.target.value = "";
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    // Every problem at once, with a message under each field
    const found = validateForm(el, forms, nf);
    setErrors(found);
    if (Object.keys(found).length) {
      setStatus("error");
      focusFirst(el, found);
      return;
    }
    const data = new FormData(el);
    data.set("locale", locale);
    setStatus("sending");
    try {
      const res = await fetch(`${apiUrl}/network/apply`, { method: "POST", body: data });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { errors?: string[] };
        const mapped = serverErrors(body.errors ?? [], forms, { contribution: forms.choose });
        setErrors(mapped);
        setStatus("error");
        focusFirst(el, mapped);
        return;
      }
      setStatus("done");
      el.reset();
      setPreview(null);
      setErrors({});
      setResetKey((k) => k + 1);
      setContribution("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      className="relative flex flex-col gap-9 rounded-bov border border-t-4 border-line border-t-gold bg-white p-5 sm:p-9"
    >
      <fieldset className="m-0 flex min-w-0 flex-col gap-[18px] border-0 p-0">
        <legend className="mb-[18px] w-full border-b border-line pb-3.5 text-[19px] font-semibold text-ink">{join.legend}</legend>

        <div className="grid gap-x-5 gap-y-[18px] sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <Label text={join.name} required />
            <input name="name" aria-invalid={errors.name ? true : undefined} required minLength={2} maxLength={120} autoComplete="name" className={`${input} h-12`} />
          <FieldError msg={errors.name} />
          </label>

          <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="mb-2 p-0"><Label text={join.gender} required /></legend>
            <div className="flex min-h-12 flex-wrap items-center gap-x-5 gap-y-2">
              {join.genders.map((g) => (
                <label key={g.value} className="flex items-center gap-2 text-[15px] text-ink">
                  <input type="radio" name="gender" aria-invalid={errors.gender ? true : undefined} value={g.value} required className="size-[18px] accent-navy" />
                  {g.label}
                </label>
              ))}
            </div>
          <FieldError msg={errors.gender} />
          </fieldset>

          <label className="flex flex-col gap-2">
            <Label text={join.job} required />
            <input name="job" aria-invalid={errors.job ? true : undefined} required minLength={2} maxLength={120} autoComplete="organization-title" className={`${input} h-12`} />
          <FieldError msg={errors.job} />
          </label>

          <label className="flex flex-col gap-2">
            <Label text={join.org} />
            <input name="org" maxLength={160} autoComplete="organization" className={`${input} h-12`} />
          </label>

          <label className="flex flex-col gap-2">
            <Label text={join.country} required />
            <select name="country" aria-invalid={errors.country ? true : undefined} required defaultValue="" autoComplete="country" className={`${input} h-12`}>
              <option value="" disabled>{join.countryPlaceholder}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          <FieldError msg={errors.country} />
          </label>

          <label className="flex flex-col gap-2">
            <Label text={join.email} required />
            <input name="email" aria-invalid={errors.email ? true : undefined} type="email" required maxLength={254} autoComplete="email" dir="ltr" className={`${input} h-12 rtl:text-end`} />
          <FieldError msg={errors.email} />
          </label>

          <ReligionFields key={`religion-${resetKey}`} join={join} errors={errors} inputClass={input} Label={Label} />
        </div>

        <WorkFields key={`fields-${resetKey}`} join={join} error={errors.fields} Label={Label} />

        <label className="flex flex-col gap-2">
          <Label text={join.contribution} required />
          <select
            name="contribution"
            required
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            aria-invalid={errors.contribution ? true : undefined}
            className={`${input} h-12`}
          >
            <option value="" disabled>{join.contributionPlaceholder}</option>
            {join.contributionOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <FieldError msg={errors.contribution} />
        </label>

        {showQuote && (
          <label className="flex flex-col gap-2">
            <Label text={join.quote} required />
            <textarea name="quote" aria-invalid={errors.quote ? true : undefined} required minLength={10} maxLength={600} rows={4} className={`${input} py-3 leading-relaxed`} />
            <FieldError msg={errors.quote} />
          </label>
        )}

        {showArticle && (
          <label className="flex flex-col gap-2">
            <Label text={join.article} required />
            <textarea name="article" aria-invalid={errors.article ? true : undefined} required minLength={50} maxLength={10000} rows={10} className={`${input} py-3 leading-relaxed`} />
            <span className="text-xs text-ink-soft">{join.articleHint}</span>
            <FieldError msg={errors.article} />
          </label>
        )}

        <div className="flex flex-col gap-2">
          <Label text={join.photo} />
          <div className="flex flex-wrap items-center gap-4">
            <div className="size-[88px] flex-none overflow-hidden rounded-full border-[1.6px] border-gold bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file */}
              {preview && <img src={preview} alt="" className="size-full object-cover" />}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="flex h-10 w-fit cursor-pointer items-center rounded-bov border border-navy px-[18px] text-sm font-semibold text-navy transition hover:bg-navy hover:text-on-dark has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sky">
                {join.photoButton}
                <input type="file" name="photo" accept="image/jpeg,image/png" onChange={onPhoto} className="sr-only" />
              </label>
              <span className={`text-label ${photoError ? "text-danger" : "text-ink-soft"}`}>{photoError ? join.photoTooBig : join.photoHint}</span>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Honeypot: hidden from people, bots fill it and get ignored by the API */}
      <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-5 border-t border-line pt-4">
        {/* Optional: lets the team publish this on the site from the dashboard */}
        <label className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-soft">
          <input type="checkbox" name="publish" value="yes" className="mt-1 size-[18px] flex-none accent-navy" />
          {join.publishConsent}
        </label>
        <label className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-soft">
          <input type="checkbox" name="consent" aria-invalid={errors.consent ? true : undefined} value="yes" required className="mt-1 size-[18px] flex-none accent-navy" />
          {join.consent}
        <FieldError msg={errors.consent} />
          </label>
        <PrivacyNote locale={locale} privacy={privacy} />
        <ErrorSummary errors={errors} form={formRef.current} title={forms.summary} />
        <div className="flex flex-col items-start gap-3">
          <button type="submit" disabled={status === "sending"} className={`${btn.gold} h-[54px] px-[30px] disabled:opacity-60`}>
            {status === "sending" ? join.sending : join.submit}
          </button>
          <p role="status" className={`m-0 text-sm empty:hidden ${status === "error" ? "text-danger" : "text-blue-deep"}`}>
            {status === "done" ? join.success : status === "error" && !Object.keys(errors).length ? join.error : ""}
          </p>
        </div>
      </div>
    </form>
  );
}
