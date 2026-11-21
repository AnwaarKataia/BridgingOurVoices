"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type ChangeEvent } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { ImageField } from "../content/ImageField";

type L = Dict["courses"];
type Loc = "ar" | "en" | "fr";
export type I18n = Record<Loc, string>;
type LessonType = "video" | "file" | "text" | "link";
export type Lesson = { id: string; sort: number; type: LessonType; title: I18n; body: I18n; videoUrl: string; fileUrl: string; linkUrl: string; minutes: number };
export type Unit = { id: string; sort: number; title: I18n; summary: I18n; lessons: Lesson[] };
export type Course = {
  id: string;
  slug: string;
  kind: "course" | "webinar";
  status: "draft" | "published";
  title: I18n;
  summary: I18n;
  description: I18n;
  programmeArea: I18n;
  duration: I18n;
  learningTime: I18n;
  fees: I18n;
  format: "self-paced" | "instructor-led" | "live";
  languages: string[];
  startDate: string | null;
  deadline: string | null;
  certificate: boolean;
  registrationOpen: boolean;
  image: string;
  flyer: string;
  modules: Unit[];
};
export type Registration = { id: string; name: string; email: string; country: string; locale: string; status: "new" | "accepted" | "rejected"; createdAt: string };

const LOCS: Loc[] = ["ar", "en", "fr"];
const input =
  "w-full rounded-bov border border-line-input bg-white px-3 py-2 text-[15px] leading-relaxed text-ink focus:border-sky focus:outline-2 focus:outline-sky";
const btnPrimary = "h-10 rounded-bov bg-navy px-4 text-sm font-semibold text-on-dark hover:bg-navy-hover disabled:opacity-50";
const btnLine = "h-10 rounded-bov border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-navy disabled:opacity-40";
const btnDanger = "h-10 rounded-bov border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-danger hover:text-danger";

async function send(url: string, method: string, body?: unknown): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  try {
    const res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  } catch {
    return { ok: false, status: 0, data: {} };
  }
}

/** A text field for one language of an { en, fr, ar } value. */
function I18nField({
  id,
  label,
  value,
  loc,
  onChange,
  rows,
  hint,
}: {
  id: string;
  label: string;
  value: I18n;
  loc: Loc;
  onChange: (v: I18n) => void;
  rows?: number;
  hint?: string;
}) {
  const dir = loc === "ar" ? "rtl" : "ltr";
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label} <span className="font-normal text-ink-soft">· {loc.toUpperCase()}</span>
      </label>
      {rows ? (
        <textarea id={id} dir={dir} lang={loc} rows={rows} value={value[loc]} onChange={(e) => onChange({ ...value, [loc]: e.target.value })} className={input} />
      ) : (
        <input id={id} dir={dir} lang={loc} value={value[loc]} onChange={(e) => onChange({ ...value, [loc]: e.target.value })} className={`${input} h-11`} />
      )}
      {hint && <span className="text-xs text-ink-soft">{hint}</span>}
    </div>
  );
}

/** One PDF (flyer or lesson file): upload to /api/admin/media, open, remove. */
function PdfField({ label, value, onChange, t }: { label: string; value: string; onChange: (v: string) => void; t: L["pdf"] }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    if (file.size > 15 * 1024 * 1024 || !/\.pdf$/i.test(file.name)) return setError(t.error);
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { path?: string };
      if (res.ok && data.path?.endsWith(".pdf")) onChange(data.path);
      else setError(t.error);
    } catch {
      setError(t.error);
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        {value ? (
          <a href={value} target="_blank" rel="noopener" className="text-sm font-semibold text-blue hover:text-navy">
            📄 {t.open}
          </a>
        ) : (
          <span className="text-sm text-ink-soft">{t.none}</span>
        )}
        <button type="button" disabled={busy} onClick={() => ref.current?.click()} className={btnLine}>
          {busy ? t.uploading : value ? t.replace : t.upload}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className={btnDanger}>
            {t.remove}
          </button>
        )}
        <input ref={ref} type="file" accept="application/pdf" onChange={onFile} className="sr-only" tabIndex={-1} />
      </div>
      <span className="text-xs text-ink-soft">{t.hint}</span>
      <span role="alert" className="text-sm text-danger empty:hidden">{error}</span>
    </div>
  );
}

function Status({ msg }: { msg: { ok: boolean; text: string } | null }) {
  return <span role="status" className={`text-sm empty:hidden ${msg?.ok ? "text-blue-deep" : "text-danger"}`}>{msg?.text ?? ""}</span>;
}

type InfoKeys = Exclude<keyof Course, "id" | "status" | "modules">;
const pickInfo = (c: Course) => {
  const { id: _i, status: _s, modules: _m, ...info } = c;
  return info as Pick<Course, InfoKeys>;
};

export function CourseEditor({
  course,
  registrations,
  lang,
  portalUrl,
  t,
  image,
  error,
}: {
  course: Course;
  registrations: Registration[];
  lang: Lang;
  portalUrl: string;
  t: L;
  image: Dict["content"]["image"];
  error: string;
}) {
  const router = useRouter();
  const [loc, setLoc] = useState<Loc>(lang === "ar" ? "ar" : "en");
  const [saved, setSaved] = useState(() => pickInfo(course));
  const [info, setInfo] = useState(() => pickInfo(course));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(info) !== JSON.stringify(saved);
  const set = <K extends InfoKeys>(k: K, v: Course[K]) => setInfo((s) => ({ ...s, [k]: v }));
  const title = (x: I18n) => (lang === "ar" ? x.ar || x.en || x.fr : x.en || x.ar || x.fr) || t.untitled;

  async function save(extra?: { status: Course["status"] }) {
    setBusy(true);
    setMsg(null);
    const body = { ...info, startDate: info.startDate ?? "", deadline: info.deadline ?? "", ...extra };
    const r = await send(`/api/admin/courses/${course.id}`, "PATCH", body);
    if (r.ok) {
      setSaved(info);
      setMsg({ ok: true, text: t.saved });
      router.refresh();
    } else setMsg({ ok: false, text: r.data.error === "slug_taken" ? t.slugTaken : t.saveError });
    setBusy(false);
  }

  async function remove() {
    if (!confirm(t.deleteConfirm)) return;
    const r = await send(`/api/admin/courses/${course.id}`, "DELETE");
    if (r.ok) router.push("/courses");
    else setMsg({ ok: false, text: error });
  }

  async function addUnit() {
    const r = await send(`/api/admin/courses/${course.id}/modules`, "POST", { title: { [loc]: `${t.unit} ${course.modules.length + 1}` } });
    if (r.ok) router.refresh();
    else setMsg({ ok: false, text: error });
  }

  const published = course.status === "published";

  return (
    <div className="flex flex-col gap-8">
      {/* Title, status, publish */}
      <div className="flex flex-col gap-4 rounded-bov border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gold-deep">{t.kinds[info.kind]}</p>
            <h1 className="font-display text-h3 font-normal" dir="auto">{title(saved.title)}</h1>
            <p className={`mt-1 text-sm font-semibold ${published ? "text-blue-deep" : "text-ink-soft"}`}>{published ? t.publishedNote : t.draftNote}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {published && (
              <a href={`${portalUrl}/${lang}/e-learning/${saved.slug}`} target="_blank" rel="noopener" className={`${btnLine} inline-flex items-center`}>
                {t.viewOnSite}
              </a>
            )}
            <button type="button" disabled={busy} onClick={() => save({ status: published ? "draft" : "published" })} className={published ? btnLine : btnPrimary}>
              {published ? t.unpublish : t.publish}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="text-sm font-semibold text-ink">{t.editLang}</span>
          {LOCS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={loc === l}
              onClick={() => setLoc(l)}
              className={`h-9 rounded-bov border px-3 text-sm font-semibold ${loc === l ? "border-navy bg-navy text-on-dark" : "border-line bg-white text-ink hover:border-navy"}`}
            >
              {t.langs[l]}
            </button>
          ))}
          <span className="basis-full text-xs text-ink-soft">{t.editLangHint}</span>
        </div>
      </div>

      {/* Course details */}
      <section aria-labelledby="info-h" className="flex flex-col gap-4">
        <h2 id="info-h" className="font-display text-h3 font-normal">{t.sections.info}</h2>
        <div className="grid gap-4 rounded-bov border border-line bg-white p-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <I18nField id="f-title" label={t.fields.title} value={info.title} loc={loc} onChange={(v) => set("title", v)} />
          </div>
          <div className="md:col-span-2">
            <I18nField id="f-summary" label={t.fields.summary} value={info.summary} loc={loc} rows={2} onChange={(v) => set("summary", v)} />
          </div>
          <div className="md:col-span-2">
            <I18nField id="f-desc" label={t.fields.description} value={info.description} loc={loc} rows={6} onChange={(v) => set("description", v)} />
          </div>
          <I18nField id="f-area" label={t.fields.programmeArea} value={info.programmeArea} loc={loc} onChange={(v) => set("programmeArea", v)} />
          <I18nField id="f-fees" label={t.fields.fees} value={info.fees} loc={loc} onChange={(v) => set("fees", v)} />
          <I18nField id="f-dur" label={t.fields.duration} value={info.duration} loc={loc} onChange={(v) => set("duration", v)} />
          <I18nField id="f-time" label={t.fields.learningTime} value={info.learningTime} loc={loc} onChange={(v) => set("learningTime", v)} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-kind" className="text-sm font-semibold text-ink">{t.fields.kind}</label>
            <select id="f-kind" value={info.kind} onChange={(e) => set("kind", e.target.value as Course["kind"])} className={`${input} h-11`}>
              {(["course", "webinar"] as const).map((k) => (
                <option key={k} value={k}>{t.kinds[k]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-format" className="text-sm font-semibold text-ink">{t.fields.format}</label>
            <select id="f-format" value={info.format} onChange={(e) => set("format", e.target.value as Course["format"])} className={`${input} h-11`}>
              {(["self-paced", "instructor-led", "live"] as const).map((k) => (
                <option key={k} value={k}>{t.formats[k]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-start" className="text-sm font-semibold text-ink">{t.fields.startDate}</label>
            <input id="f-start" type="date" value={info.startDate ?? ""} onChange={(e) => set("startDate", e.target.value || null)} className={`${input} h-11`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="f-deadline" className="text-sm font-semibold text-ink">{t.fields.deadline}</label>
            <input id="f-deadline" type="date" value={info.deadline ?? ""} onChange={(e) => set("deadline", e.target.value || null)} className={`${input} h-11`} />
          </div>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 text-sm font-semibold text-ink">{t.fields.languages}</legend>
            <div className="flex flex-wrap gap-4">
              {LOCS.map((l) => (
                <label key={l} className="flex items-center gap-2 text-[15px]">
                  <input
                    type="checkbox"
                    checked={info.languages.includes(l)}
                    onChange={(e) => set("languages", e.target.checked ? [...info.languages, l] : info.languages.filter((x) => x !== l))}
                    className="size-4 accent-navy"
                  />
                  {t.langs[l]}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2 text-[15px]">
              <input type="checkbox" checked={info.certificate} onChange={(e) => set("certificate", e.target.checked)} className="size-4 accent-navy" />
              {t.fields.certificate}
            </label>
            <label className="flex items-center gap-2 text-[15px]">
              <input type="checkbox" checked={info.registrationOpen} onChange={(e) => set("registrationOpen", e.target.checked)} className="size-4 accent-navy" />
              {t.fields.registrationOpen}
            </label>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label htmlFor="f-slug" className="text-sm font-semibold text-ink">{t.fields.slug}</label>
            <div className="flex min-w-0 items-center gap-1 text-sm text-ink-soft" dir="ltr">
              <span className="hidden truncate sm:inline">/e-learning/</span>
              <input
                id="f-slug"
                dir="ltr"
                value={info.slug}
                onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className={`${input} h-11 min-w-0`}
              />
            </div>
            <span className="text-xs text-ink-soft">{t.fields.slugHint}</span>
          </div>
          <div className="md:col-span-2">
            <ImageField value={info.image} onChange={(v) => set("image", v)} portalUrl={portalUrl} t={image} label={t.fields.image} changed={info.image !== saved.image} changedLabel={t.unsaved} />
          </div>
          <div className="md:col-span-2">
            <PdfField label={t.fields.flyer} value={info.flyer} onChange={(v) => set("flyer", v)} t={t.pdf} />
          </div>
        </div>
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-line bg-paper/95 py-3 backdrop-blur">
          <button type="button" disabled={busy || !dirty} onClick={() => save()} className={btnPrimary}>
            {busy ? t.saving : t.save}
          </button>
          {dirty && <span className="text-sm font-semibold text-gold-deep">{t.unsaved}</span>}
          <Status msg={msg} />
        </div>
      </section>

      {/* Units and lessons */}
      <section aria-labelledby="units-h" className="flex flex-col gap-4">
        <h2 id="units-h" className="font-display text-h3 font-normal">{t.sections.units}</h2>
        {course.modules.length === 0 && <p className="rounded-bov border border-line bg-white p-5 text-ink-soft">{t.noUnits}</p>}
        {course.modules.map((u, i) => (
          <UnitCard key={u.id} unit={u} index={i} total={course.modules.length} loc={loc} lang={lang} t={t} error={error} />
        ))}
        <button type="button" onClick={addUnit} className={`${btnLine} self-start`}>
          + {t.addUnit}
        </button>
      </section>

      {/* Registrations */}
      <section aria-labelledby="regs-h" className="flex flex-col gap-4">
        <h2 id="regs-h" className="font-display text-h3 font-normal">
          {t.sections.registrations} <span className="text-base text-ink-soft">({registrations.length})</span>
        </h2>
        <Registrations items={registrations} lang={lang} t={t} error={error} />
      </section>

      <div className="border-t border-line pt-6">
        <button type="button" onClick={remove} className={btnDanger}>
          {t.deleteCourse}
        </button>
      </div>
    </div>
  );
}

function UnitCard({ unit, index, total, loc, lang, t, error }: { unit: Unit; index: number; total: number; loc: Loc; lang: Lang; t: L; error: string }) {
  const router = useRouter();
  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB");
  const [saved, setSaved] = useState({ title: unit.title, summary: unit.summary });
  const [v, setV] = useState(saved);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [newType, setNewType] = useState<LessonType>("video");
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);

  async function act(url: string, method: string, body?: unknown, after?: () => void) {
    setMsg(null);
    const r = await send(url, method, body);
    if (r.ok) {
      after?.();
      router.refresh();
    } else setMsg({ ok: false, text: error });
    return r.ok;
  }

  return (
    <article className="flex flex-col gap-4 rounded-bov border border-line bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-normal">
          {t.unit} {nf.format(index + 1)}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" aria-label={t.moveUp} title={t.moveUp} disabled={index === 0} onClick={() => act(`/api/admin/modules/${unit.id}`, "PATCH", { move: -1 })} className={btnLine}>↑</button>
          <button type="button" aria-label={t.moveDown} title={t.moveDown} disabled={index === total - 1} onClick={() => act(`/api/admin/modules/${unit.id}`, "PATCH", { move: 1 })} className={btnLine}>↓</button>
          <button type="button" onClick={() => confirm(t.removeUnitConfirm) && act(`/api/admin/modules/${unit.id}`, "DELETE")} className={btnDanger}>{t.remove}</button>
        </div>
      </div>
      <I18nField id={`u-${unit.id}-t`} label={t.fields.title} value={v.title} loc={loc} onChange={(title) => setV({ ...v, title })} />
      <I18nField id={`u-${unit.id}-s`} label={t.unitSummary} value={v.summary} loc={loc} rows={2} onChange={(summary) => setV({ ...v, summary })} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!dirty} onClick={() => act(`/api/admin/modules/${unit.id}`, "PATCH", v, () => { setSaved(v); setMsg({ ok: true, text: t.saved }); })} className={btnPrimary}>
          {t.save}
        </button>
        {dirty && <span className="text-sm font-semibold text-gold-deep">{t.unsaved}</span>}
        <Status msg={msg} />
      </div>

      <ol className="flex flex-col gap-3 border-t border-line pt-4">
        {unit.lessons.length === 0 && <li className="text-sm text-ink-soft">{t.noLessons}</li>}
        {unit.lessons.map((l, i) => (
          <LessonCard key={l.id} lesson={l} index={i} total={unit.lessons.length} loc={loc} nf={nf} t={t} error={error} />
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor={`nt-${unit.id}`} className="sr-only">{t.lessonType}</label>
        <select id={`nt-${unit.id}`} value={newType} onChange={(e) => setNewType(e.target.value as LessonType)} className={`${input} h-10 w-auto py-0`}>
          {(["video", "file", "text", "link"] as const).map((k) => (
            <option key={k} value={k}>{t.lessonTypes[k]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => act(`/api/admin/modules/${unit.id}/lessons`, "POST", { type: newType, title: { [loc]: `${t.lesson} ${unit.lessons.length + 1}` } })}
          className={btnLine}
        >
          + {t.addLesson}
        </button>
      </div>
    </article>
  );
}

const emptyFor = (l: Pick<Lesson, "type" | "videoUrl" | "fileUrl" | "linkUrl" | "body">) =>
  l.type === "video" ? !l.videoUrl : l.type === "file" ? !l.fileUrl : l.type === "link" ? !l.linkUrl : !(l.body.ar || l.body.en || l.body.fr);

function LessonCard({ lesson, index, total, loc, nf, t, error }: { lesson: Lesson; index: number; total: number; loc: Loc; nf: Intl.NumberFormat; t: L; error: string }) {
  const router = useRouter();
  const pick = (l: Lesson) => ({ type: l.type, title: l.title, body: l.body, videoUrl: l.videoUrl, fileUrl: l.fileUrl, linkUrl: l.linkUrl, minutes: l.minutes });
  const [saved, setSaved] = useState(() => pick(lesson));
  const [v, setV] = useState(() => pick(lesson));
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const id = `l-${lesson.id}`;

  async function act(method: string, body?: unknown, after?: () => void) {
    setMsg(null);
    const r = await send(`/api/admin/lessons/${lesson.id}`, method, body);
    if (r.ok) {
      after?.();
      router.refresh();
    } else setMsg({ ok: false, text: r.status === 400 ? t.saveError : error });
  }

  return (
    <li className="flex flex-col gap-3 rounded-bov border border-line bg-sand/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
          {t.lesson} {nf.format(index + 1)} · {t.lessonTypes[saved.type]}
          {emptyFor(saved) && <span className="rounded-bov bg-gold/25 px-1.5 py-0.5 text-[11px] text-gold-deep">{t.missing}</span>}
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" aria-label={t.moveUp} title={t.moveUp} disabled={index === 0} onClick={() => act("PATCH", { move: -1 })} className={btnLine}>↑</button>
          <button type="button" aria-label={t.moveDown} title={t.moveDown} disabled={index === total - 1} onClick={() => act("PATCH", { move: 1 })} className={btnLine}>↓</button>
          <button type="button" onClick={() => confirm(t.removeLessonConfirm) && act("DELETE")} className={btnDanger}>{t.remove}</button>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px_140px]">
        <I18nField id={`${id}-t`} label={t.fields.title} value={v.title} loc={loc} onChange={(title) => setV({ ...v, title })} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-type`} className="text-sm font-semibold text-ink">{t.lessonType}</label>
          <select id={`${id}-type`} value={v.type} onChange={(e) => setV({ ...v, type: e.target.value as LessonType })} className={`${input} h-11`}>
            {(["video", "file", "text", "link"] as const).map((k) => (
              <option key={k} value={k}>{t.lessonTypes[k]}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-min`} className="text-sm font-semibold text-ink">{t.minutes}</label>
          <input
            id={`${id}-min`}
            type="number"
            min={0}
            max={1000}
            value={v.minutes}
            onChange={(e) => setV({ ...v, minutes: Math.max(0, Math.min(1000, Number(e.target.value) || 0)) })}
            className={`${input} h-11`}
          />
        </div>
      </div>
      {v.type === "video" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-v`} className="text-sm font-semibold text-ink">{t.videoUrl}</label>
          <input id={`${id}-v`} dir="ltr" type="url" value={v.videoUrl} onChange={(e) => setV({ ...v, videoUrl: e.target.value })} className={`${input} h-11`} />
          <span className="text-xs text-ink-soft">{t.videoHint}</span>
        </div>
      )}
      {v.type === "file" && <PdfField label={t.lessonFile} value={v.fileUrl} onChange={(fileUrl) => setV({ ...v, fileUrl })} t={t.pdf} />}
      {v.type === "link" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-k`} className="text-sm font-semibold text-ink">{t.linkUrl}</label>
          <input id={`${id}-k`} dir="ltr" type="url" value={v.linkUrl} onChange={(e) => setV({ ...v, linkUrl: e.target.value })} className={`${input} h-11`} />
        </div>
      )}
      <I18nField id={`${id}-b`} label={t.body} value={v.body} loc={loc} rows={v.type === "text" ? 6 : 2} onChange={(body) => setV({ ...v, body })} />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" disabled={!dirty} onClick={() => act("PATCH", v, () => { setSaved(v); setMsg({ ok: true, text: t.saved }); })} className={btnPrimary}>
          {t.save}
        </button>
        {dirty && <span className="text-sm font-semibold text-gold-deep">{t.unsaved}</span>}
        <Status msg={msg} />
      </div>
    </li>
  );
}

function Registrations({ items, lang, t, error }: { items: Registration[]; lang: Lang; t: L; error: string }) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const countries = new Intl.DisplayNames([lang], { type: "region" });
  if (!items.length) return <p className="rounded-bov border border-line bg-white p-5 text-ink-soft">{t.regEmpty}</p>;

  async function setStatus(id: string, status: Registration["status"]) {
    const r = await send(`/api/admin/registrations/${id}`, "PATCH", { status });
    if (r.ok) router.refresh();
    else setMsg({ ok: false, text: error });
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
        {items.map((r) => (
          <li key={r.id} className="grid gap-x-4 gap-y-1 p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-center">
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold text-ink">{r.name}</span>
              <a href={`mailto:${r.email}`} dir="ltr" className="truncate text-sm text-blue hover:text-navy">{r.email}</a>
            </span>
            <span className="text-sm text-ink-soft">
              {countries.of(r.country) ?? r.country} · {fmt.format(new Date(r.createdAt))}
            </span>
            <span>
              <label htmlFor={`rs-${r.id}`} className="sr-only">{t.regCols.status}</label>
              <select id={`rs-${r.id}`} value={r.status} onChange={(e) => setStatus(r.id, e.target.value as Registration["status"])} className={`${input} h-10 w-auto py-0`}>
                {(["new", "accepted", "rejected"] as const).map((s) => (
                  <option key={s} value={s}>{t.regStatus[s]}</option>
                ))}
              </select>
            </span>
          </li>
        ))}
      </ul>
      <Status msg={msg} />
    </div>
  );
}
