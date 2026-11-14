"use client";

import { useState } from "react";
import type { SiteContent } from "@/content/site";
import type { NetworkContent } from "@/content/network";

/**
 * Shared form helpers (owner, 2026-11-14): when a field is missing or wrong, the person sees a clear
 * message under that field and a summary near the send button, and the first problem gets the focus.
 */
export type FormErrors = Record<string, string>;
export type FormLabels = SiteContent["forms"];

/** Checks every named field with the browser's own rules and turns failures into readable messages. */
export function validateForm(form: HTMLFormElement, t: FormLabels, nf: Intl.NumberFormat): FormErrors {
  const errors: FormErrors = {};
  for (const el of Array.from(form.elements)) {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) continue;
    if (!el.name || el.name === "website" || errors[el.name] || !el.willValidate || el.validity.valid) continue;
    const v = el.validity;
    let msg = t.required;
    if (v.valueMissing) {
      if (el instanceof HTMLInputElement && el.type === "checkbox") msg = el.name === "consent" ? t.consent : t.required;
      else if (el instanceof HTMLSelectElement || (el instanceof HTMLInputElement && el.type === "radio")) msg = t.choose;
      else if (el instanceof HTMLInputElement && el.type === "file") msg = t.file;
    } else if (v.typeMismatch) msg = t.email;
    else if (v.tooShort) msg = t.tooShort.replace("{min}", nf.format((el as HTMLInputElement).minLength));
    else if (v.tooLong) msg = t.tooLong;
    errors[el.name] = msg;
  }
  return errors;
}

/** Field names the API rejected → the same readable messages. */
export function serverErrors(names: string[], t: FormLabels, special: Record<string, string> = {}): FormErrors {
  const out: FormErrors = {};
  for (const n of names) {
    out[n] = special[n] ?? (n === "email" ? t.email : n === "fields" ? t.fieldsMax : n === "consent" ? t.consent : ["gender", "country", "religion"].includes(n) ? t.choose : t.required);
  }
  return out;
}

/** Moves the focus to the first field with a problem (and scrolls to it). */
export function focusFirst(form: HTMLFormElement, errors: FormErrors) {
  const first = Array.from(form.elements).find((el) => (el as HTMLInputElement).name in errors) as HTMLElement | undefined;
  first?.focus({ preventScroll: true });
  first?.scrollIntoView({ block: "center", behavior: "smooth" });
}

export function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span role="alert" className="text-label font-medium text-danger">
      {msg}
    </span>
  );
}

/** Summary above the send button: "Please check the highlighted fields: Name, Email…". */
export function ErrorSummary({ errors, form, title }: { errors: FormErrors; form: HTMLFormElement | null; title: string }) {
  const names = Object.keys(errors);
  if (!names.length || !form) return null;
  // The field's own name only: the label (or group legend) without its error message, hints or options
  const labelOf = (name: string) => {
    const el = form.querySelector<HTMLInputElement>(`[name="${CSS.escape(name)}"]`);
    const grouped = (el?.type === "radio" || el?.type === "checkbox") && name !== "consent";
    // A file input sits in an "upload" button; its field name is the label above the button row
    const fileTitle = el?.type === "file" ? el.closest("label")?.parentElement?.parentElement?.firstElementChild : null;
    const box = fileTitle ?? (grouped ? el?.closest("fieldset")?.querySelector("legend") : (el?.closest("label") ?? el?.closest("fieldset")?.querySelector("legend")));
    if (!box) return name;
    const copy = box.cloneNode(true) as HTMLElement;
    copy.querySelectorAll("[role=alert], input, select, textarea, option, span.text-label").forEach((n) => n.remove());
    return (copy.textContent ?? name).replace(/\*/g, "").replace(/\s+/g, " ").trim() || name;
  };
  return (
    <div role="alert" className="rounded-bov border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">
      <p className="m-0 font-semibold">{title}</p>
      <ul className="m-0 mt-1 list-disc ps-5">
        {names.map((n) => (
          <li key={n}>{labelOf(n)}</li>
        ))}
      </ul>
    </div>
  );
}

type Join = NetworkContent["join"];

/**
 * Religion (required) and denomination (optional), chosen from lists; "Other" opens a text box.
 * Sends `religion`, `religionOther`, `subreligion`, `subreligionOther`.
 */
export function ReligionFields({ join, errors, inputClass, Label }: { join: Join; errors: FormErrors; inputClass: string; Label: (p: { text: string; required?: boolean }) => React.ReactNode }) {
  const [religion, setReligion] = useState("");
  const [denomination, setDenomination] = useState("");
  const current = join.religions.find((r) => r.value === religion);
  const denominations = current?.denominations ?? [];

  return (
    <>
      <label className="flex flex-col gap-2">
        <Label text={join.religion} required />
        <select
          name="religion"
          required
          value={religion}
          onChange={(e) => {
            setReligion(e.target.value);
            setDenomination("");
          }}
          aria-invalid={errors.religion ? true : undefined}
          className={`${inputClass} h-12`}
        >
          <option value="" disabled>{join.religionPlaceholder}</option>
          {join.religions.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <FieldError msg={errors.religion} />
      </label>

      <label className="flex flex-col gap-2">
        <Label text={join.subreligion} />
        <select
          name="subreligion"
          value={denomination}
          onChange={(e) => setDenomination(e.target.value)}
          disabled={!denominations.length}
          className={`${inputClass} h-12 disabled:bg-paper disabled:text-ink-soft`}
        >
          <option value="">{join.denominationPlaceholder}</option>
          {denominations.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </label>

      {religion === "other" && (
        <label className="flex flex-col gap-2">
          <Label text={join.otherReligion} required />
          <input name="religionOther" required minLength={2} maxLength={80} aria-invalid={errors.religionOther ? true : undefined} className={`${inputClass} h-12`} />
          <FieldError msg={errors.religionOther} />
        </label>
      )}
      {denomination === "other" && (
        <label className="flex flex-col gap-2">
          <Label text={join.otherDenomination} />
          <input name="subreligionOther" maxLength={80} className={`${inputClass} h-12`} />
        </label>
      )}
    </>
  );
}

/** Fields of work as chips: up to 3 (the others are disabled once 3 are chosen). */
export function WorkFields({ join, error, Label }: { join: Join; error?: string; Label: (p: { text: string; required?: boolean }) => React.ReactNode }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const full = chosen.length >= 3;
  return (
    <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
      <legend className="mb-2 p-0">
        <Label text={join.fields} />
      </legend>
      <span className="-mt-1 text-label text-ink-soft">{join.fieldsHint}</span>
      <div className="flex flex-wrap gap-2">
        {join.fieldOptions.map((f) => {
          const on = chosen.includes(f.value);
          return (
            <label
              key={f.value}
              className={`flex h-10 items-center rounded-full border border-line-input bg-white px-3.5 text-sm text-ink transition has-[:checked]:border-navy has-[:checked]:bg-navy has-[:checked]:text-on-dark has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-sky ${
                !on && full ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:border-navy"
              }`}
            >
              <input
                type="checkbox"
                name="fields"
                value={f.value}
                checked={on}
                disabled={!on && full}
                onChange={(e) => setChosen((c) => (e.target.checked ? [...c, f.value].slice(0, 3) : c.filter((x) => x !== f.value)))}
                className="sr-only"
              />
              {f.label}
            </label>
          );
        })}
      </div>
      <FieldError msg={error} />
    </fieldset>
  );
}
