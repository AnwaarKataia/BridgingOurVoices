"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { NetworkContent } from "@/content/network";
import { apiUrl } from "@/lib/site";
import type { SiteContent } from "@/content/site";
import { btn } from "../ui";
import { PrivacyNote } from "../PrivacyNote";

type Status = "idle" | "sending" | "done" | "error";
type Props = {
  locale: Locale;
  join: NetworkContent["join"];
  countries: { code: string; name: string }[];
  privacy: SiteContent["privacy"];
};

const MAX_PHOTO = 3 * 1024 * 1024;
/** Same limits as the API (apps/api/src/network.ts): the API also checks the PDF's page count. */
const MAX_CV = 5 * 1024 * 1024;
const MAX_WORDS = 150;
const countWords = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
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

/**
 * "Add your voice to ours" membership application (multipart): details, experience summary (max 150 words),
 * CV (PDF, max 4 pages), motivation, activities, optional photo. Shown on the Membership and Join pages.
 */
export function JoinForm({ locale, join, countries, privacy }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const [words, setWords] = useState(0);
  const [cvName, setCvName] = useState("");
  const [cvError, setCvError] = useState(false);
  const [errorText, setErrorText] = useState("");
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

  function onCv(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setCvError(false);
    setCvName("");
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf || file.size > MAX_CV) {
      setCvError(true);
      e.target.value = "";
      return;
    }
    setCvName(file.name);
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const data = new FormData(el);
    if (countWords(String(data.get("experience") ?? "")) > MAX_WORDS) {
      setStatus("error");
      setErrorText(join.experienceTooLong);
      return;
    }
    data.set("locale", locale);
    setStatus("sending");
    setErrorText("");
    try {
      const res = await fetch(`${apiUrl}/network/apply`, { method: "POST", body: data });
      if (!res.ok) {
        // Point to the field the API rejected when it is one the visitor can fix
        const body = (await res.json().catch(() => ({}))) as { errors?: string[] };
        const errs = body.errors ?? [];
        if (errs.includes("cv") || errs.includes("cv_pages")) setCvError(true);
        setErrorText(errs.includes("cv") || errs.includes("cv_pages") ? join.cvError : errs.includes("experience") ? join.experienceTooLong : join.error);
        setStatus("error");
        return;
      }
      setStatus("done");
      el.reset();
      setPreview(null);
      setWords(0);
      setCvName("");
    } catch {
      setErrorText(join.error);
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative flex flex-col gap-9 rounded-bov border border-t-4 border-line border-t-gold bg-white p-5 sm:p-9"
    >
      <fieldset className="m-0 flex min-w-0 flex-col gap-[18px] border-0 p-0">
        <legend className="mb-[18px] w-full border-b border-line pb-3.5 text-[19px] font-semibold text-ink">{join.legend}</legend>

        <div className="grid gap-x-5 gap-y-[18px] sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <Label text={join.name} required />
            <input name="name" required minLength={2} maxLength={120} autoComplete="name" className={`${input} h-12`} />
          </label>

          <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="mb-2 p-0"><Label text={join.gender} required /></legend>
            <div className="flex min-h-12 flex-wrap items-center gap-x-5 gap-y-2">
              {join.genders.map((g) => (
                <label key={g.value} className="flex items-center gap-2 text-[15px] text-ink">
                  <input type="radio" name="gender" value={g.value} required className="size-[18px] accent-navy" />
                  {g.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="flex flex-col gap-2">
            <Label text={join.job} required />
            <input name="job" required minLength={2} maxLength={120} autoComplete="organization-title" className={`${input} h-12`} />
          </label>

          <label className="flex flex-col gap-2">
            <Label text={join.org} />
            <input name="org" maxLength={160} autoComplete="organization" className={`${input} h-12`} />
          </label>

          <label className="flex flex-col gap-2">
            <Label text={join.country} required />
            <select name="country" required defaultValue="" autoComplete="country" className={`${input} h-12`}>
              <option value="" disabled>{join.countryPlaceholder}</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <Label text={join.email} required />
            <input name="email" type="email" required maxLength={254} autoComplete="email" dir="ltr" className={`${input} h-12 rtl:text-end`} />
          </label>

          <label className="flex flex-col gap-2">
            <Label text={join.religion} required />
            <input name="religion" required minLength={2} maxLength={80} className={`${input} h-12`} />
          </label>

          <label className="flex flex-col gap-2">
            <Label text={join.subreligion} />
            <input name="subreligion" maxLength={80} className={`${input} h-12`} />
          </label>
        </div>

        <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
          <legend className="mb-2 p-0"><Label text={join.fields} /></legend>
          <div className="flex flex-wrap gap-2">
            {join.fieldOptions.map((f) => (
              <label
                key={f.value}
                className="flex h-10 cursor-pointer items-center rounded-full border border-line-input bg-white px-3.5 text-sm text-ink transition hover:border-navy has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-on-dark has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sky"
              >
                <input type="checkbox" name="fields" value={f.value} className="sr-only" />
                {f.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Experience summary: one paragraph of at most 150 words, with a live word count */}
        <label className="flex flex-col gap-2">
          <Label text={join.experience} required />
          <textarea
            name="experience"
            required
            minLength={10}
            maxLength={2000}
            rows={6}
            aria-describedby="experience-hint"
            onChange={(e) => setWords(countWords(e.target.value))}
            className={`${input} py-3 leading-relaxed ${words > MAX_WORDS ? "border-danger" : ""}`}
          />
          <span id="experience-hint" className="flex flex-wrap justify-between gap-x-4 text-label">
            <span className="text-ink-soft">{join.experienceHint}</span>
            <span aria-live="polite" className={words > MAX_WORDS ? "font-semibold text-danger" : "text-ink-soft"}>
              {join.wordCount.replace("{count}", nf.format(words)).replace("{max}", nf.format(MAX_WORDS))}
            </span>
          </span>
        </label>

        {/* CV: PDF only, up to 4 pages and 5 MB */}
        <div className="flex flex-col gap-2">
          <Label text={join.cv} required />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <label className="flex h-10 w-fit cursor-pointer items-center rounded-bov border border-navy px-[18px] text-sm font-semibold text-navy transition hover:bg-navy hover:text-on-dark has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sky">
              {join.cvButton}
              <input type="file" name="cv" required accept="application/pdf,.pdf" onChange={onCv} className="sr-only" />
            </label>
            {cvName && <span dir="ltr" className="max-w-full truncate text-sm text-ink">{cvName}</span>}
          </div>
          <span className={`text-label ${cvError ? "text-danger" : "text-ink-soft"}`}>{cvError ? join.cvError : join.cvHint}</span>
        </div>

        <label className="flex flex-col gap-2">
          <Label text={join.motivation} required />
          <textarea name="motivation" required minLength={10} maxLength={2000} rows={4} className={`${input} py-3 leading-relaxed`} />
        </label>

        <label className="flex flex-col gap-2">
          <Label text={join.activities} required />
          <textarea name="activities" required minLength={10} maxLength={2000} rows={4} className={`${input} py-3 leading-relaxed`} />
        </label>

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
        <label className="flex items-start gap-2.5 text-[15px] leading-relaxed text-ink-soft">
          <input type="checkbox" name="consent" value="yes" required className="mt-1 size-[18px] flex-none accent-navy" />
          {join.consent}
        </label>
        <PrivacyNote locale={locale} privacy={privacy} />
        <div className="flex flex-col items-start gap-3">
          <button type="submit" disabled={status === "sending"} className={`${btn.gold} h-[54px] px-[30px] disabled:opacity-60`}>
            {status === "sending" ? join.sending : join.submit}
          </button>
          <p role="status" className={`m-0 text-sm empty:hidden ${status === "error" ? "text-danger" : "text-blue-deep"}`}>
            {status === "done" ? join.success : status === "error" ? errorText || join.error : ""}
          </p>
        </div>
      </div>
    </form>
  );
}
