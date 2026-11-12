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
export function JoinForm({ locale, join, countries, privacy }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);

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
    const data = new FormData(el);
    data.set("locale", locale);
    setStatus("sending");
    try {
      const res = await fetch(`${apiUrl}/network/apply`, { method: "POST", body: data });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      el.reset();
      setPreview(null);
    } catch {
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

        <label className="flex flex-col gap-2">
          <Label text={join.quote} required />
          <textarea name="quote" required minLength={10} maxLength={600} rows={4} className={`${input} py-3 leading-relaxed`} />
        </label>

        <label className="flex flex-col gap-2">
          <Label text={join.article} />
          <textarea name="article" maxLength={10000} rows={8} className={`${input} py-3 leading-relaxed`} />
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
            {status === "done" ? join.success : status === "error" ? join.error : ""}
          </p>
        </div>
      </div>
    </form>
  );
}
