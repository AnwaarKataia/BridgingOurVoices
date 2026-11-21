"use client";

import { useState, type FormEvent } from "react";
import type { ActivitiesContent } from "@/content/activities";
import type { Profile } from "@/lib/learn";
import { btn } from "../ui";
import { PhotoField } from "./PhotoField";

const field =
  "w-full rounded-bov border border-line-input bg-white px-3.5 text-[15px] text-ink transition focus:border-sky focus:outline-2 focus:outline-sky";
const label = "flex flex-col gap-1.5 text-sm font-medium text-ink";

/** Edits the learner's profile: name, country, job, organisation, a few lines about them, and visibility. */
export function ProfileForm({ profile, countries, t }: { profile: Profile; countries: { code: string; name: string }[]; t: ActivitiesContent["elearning"]["learn"] }) {
  const st = t.study;
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name") ?? "").trim(),
      country: String(f.get("country") ?? ""),
      job: String(f.get("job") ?? ""),
      org: String(f.get("org") ?? ""),
      bio: String(f.get("bio") ?? ""),
      showProfile: f.get("showProfile") === "on",
    };
    if (body.name.length < 2) return setMsg({ ok: false, text: t.errors.generic });
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/learn-api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setMsg(res.ok ? { ok: true, text: st.saved } : { ok: false, text: t.errors.generic });
    } catch {
      setMsg({ ok: false, text: t.errors.generic });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-[18px] rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5 sm:p-8">
      <PhotoField id={profile.id} name={profile.name} hasPhoto={profile.hasPhoto} t={st} />
      <label className={label}>
        {t.name}
        <input name="name" defaultValue={profile.name} required minLength={2} maxLength={120} autoComplete="name" className={`${field} h-12`} />
      </label>
      <p className="m-0 text-sm text-ink-soft" dir="ltr">{profile.email}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          {st.job}
          <input name="job" defaultValue={profile.job} maxLength={120} autoComplete="organization-title" className={`${field} h-12`} />
        </label>
        <label className={label}>
          {st.org}
          <input name="org" defaultValue={profile.org} maxLength={160} autoComplete="organization" className={`${field} h-12`} />
        </label>
      </div>
      <label className={label}>
        {t.country}
        <select name="country" defaultValue={profile.country} className={`${field} h-12`}>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className={label}>
        {st.bio}
        <textarea name="bio" defaultValue={profile.bio} maxLength={1500} rows={6} className={`${field} py-3 leading-relaxed`} />
        <span className="text-xs font-normal text-ink-soft">{st.bioHint}</span>
      </label>
      <label className="flex items-start gap-2.5 text-[15px] text-ink">
        <input type="checkbox" name="showProfile" defaultChecked={profile.showProfile} className="mt-1 size-4 flex-none accent-navy" />
        {st.showProfile}
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className={`${btn.navy} h-[50px] px-7 text-[15px] disabled:opacity-60`}>
          {busy ? t.sending : st.save}
        </button>
        <span role="status" className={`text-sm empty:hidden ${msg?.ok ? "text-blue-deep" : "text-danger"}`}>{msg?.text ?? ""}</span>
      </div>
    </form>
  );
}
