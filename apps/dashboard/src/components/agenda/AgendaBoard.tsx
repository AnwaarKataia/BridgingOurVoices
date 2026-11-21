"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { ImageField } from "../content/ImageField";
import { PreviewButton } from "../PreviewButton";

type Loc = "ar" | "en" | "fr";
type I18n = Record<Loc, string>;
type Tone = "event" | "series" | "deadline";
export type EventItem = {
  id: string;
  slug: string;
  status: "draft" | "published";
  tone: Tone;
  dates: string[];
  time: string;
  kind: I18n;
  title: I18n;
  body: I18n;
  place: I18n;
  image: string;
  registrationOpen: boolean;
  registrations: number;
};

type Props = {
  events: EventItem[];
  lang: Lang;
  portalUrl: string;
  t: Dict["agenda"];
  courses: Dict["courses"];
  image: Dict["content"]["image"];
  previewT: Dict["preview"];
  error: string;
  initialEvent: string | null;
};

const LOCS: Loc[] = ["ar", "en", "fr"];
const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const noon = (iso: string) => new Date(`${iso}T12:00:00`);
const input =
  "w-full rounded-bov border border-line-input bg-white px-3 py-2 text-[15px] leading-relaxed text-ink focus:border-sky focus:outline-2 focus:outline-sky";
const btnPrimary = "h-10 rounded-bov bg-navy px-4 text-sm font-semibold text-on-dark hover:bg-navy-hover disabled:opacity-50";
const btnLine = "h-10 rounded-bov border border-line bg-white px-3 text-sm font-semibold text-ink hover:border-navy disabled:opacity-40";
const toneDot: Record<Tone, string> = { event: "bg-navy", series: "bg-blue", deadline: "bg-danger" };

/** Month calendar of the team's events (drafts dashed, published solid) with an editor beside it. */
export function AgendaBoard({ events, lang, portalUrl, t, courses, image, previewT, error, initialEvent }: Props) {
  const router = useRouter();
  const intl = lang === "ar" ? "ar-EG" : "en-GB";
  const first = events.find((e) => e.id === initialEvent);
  const [selected, setSelected] = useState<string | null>(first?.dates[0] ?? null);
  const [openId, setOpenId] = useState<string | null>(first?.id ?? null);
  const start = noon(first?.dates[0] ?? isoOf(new Date()));
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const title = (x: I18n) => (lang === "ar" ? x.ar || x.en || x.fr : x.en || x.ar || x.fr) || courses.untitled;
  const today = isoOf(new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) for (const d of e.dates) map.set(d, [...(map.get(d) ?? []), e]);
    return map;
  }, [events]);

  const { y, m } = view;
  const firstDay = new Date(y, m, 1, 12);
  const startDow = (firstDay.getDay() + 6) % 7; // Monday first
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(startDow).fill(null), ...Array.from({ length: days }, (_, i) => `${y}-${pad(m + 1)}-${pad(i + 1)}`)];
  const nf = new Intl.NumberFormat(intl);
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(intl, { weekday: "short" }).format(new Date(2024, 0, 1 + i, 12)));
  const longDate = (iso: string) => new Intl.DateTimeFormat(intl, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(noon(iso));
  const dayEvents = selected ? byDay.get(selected) ?? [] : [];
  const open = events.find((e) => e.id === openId) ?? null;
  const shift = (d: number) => setView(({ y, m }) => ({ y: m + d < 0 ? y - 1 : m + d > 11 ? y + 1 : y, m: (m + d + 12) % 12 }));

  async function add() {
    if (!selected) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: selected }) });
      const data = (await res.json().catch(() => ({}))) as { id?: string };
      if (res.ok && data.id) {
        setOpenId(data.id);
        router.refresh();
      } else setMsg(error);
    } catch {
      setMsg(error);
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Calendar */}
      <div className="flex flex-col gap-3 self-start rounded-bov border border-line bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => shift(-1)} aria-label={t.prev} className={btnLine}>
            <span aria-hidden className="inline-block rtl:-scale-x-100">‹</span>
          </button>
          <h2 className="font-display text-xl" aria-live="polite">{new Intl.DateTimeFormat(intl, { month: "long", year: "numeric" }).format(firstDay)}</h2>
          <button type="button" onClick={() => shift(1)} aria-label={t.next} className={btnLine}>
            <span aria-hidden className="inline-block rtl:-scale-x-100">›</span>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-soft" aria-hidden>
          {weekdays.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <ul className="grid grid-cols-7 gap-1">
          {cells.map((iso, i) =>
            iso ? (
              <li key={iso}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(iso);
                    setOpenId(null);
                  }}
                  aria-pressed={selected === iso}
                  aria-label={longDate(iso)}
                  className={`flex min-h-14 w-full flex-col items-center gap-1 rounded-bov border p-1 text-sm ${
                    selected === iso ? "border-navy bg-navy text-on-dark" : iso === today ? "border-blue text-ink" : "border-line text-ink hover:border-navy"
                  }`}
                >
                  <span>{nf.format(Number(iso.slice(8)))}</span>
                  <span className="flex flex-wrap justify-center gap-0.5">
                    {(byDay.get(iso) ?? []).slice(0, 4).map((e) => (
                      <span key={e.id} className={`size-2 rounded-full ${toneDot[e.tone]} ${e.status === "draft" ? "opacity-40" : ""}`} />
                    ))}
                  </span>
                </button>
              </li>
            ) : (
              <li key={`pad-${i}`} aria-hidden />
            ),
          )}
        </ul>
        <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          {(["event", "series", "deadline"] as const).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${toneDot[k]}`} /> {t.tones[k]}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-navy opacity-40" /> {t.draft}
          </span>
        </p>
      </div>

      {/* Day and editor */}
      <div className="flex min-w-0 flex-col gap-4">
        {!selected && !open && <p className="rounded-bov border border-line bg-white p-5 text-ink-soft">{t.pickDay}</p>}
        {selected && !open && (
          <div className="flex flex-col gap-3 rounded-bov border border-line bg-white p-5">
            <h2 className="font-display text-xl">{longDate(selected)}</h2>
            {dayEvents.length === 0 ? (
              <p className="m-0 text-sm text-ink-soft">{t.noneOnDay}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {dayEvents.map((e) => (
                  <li key={e.id}>
                    <button type="button" onClick={() => setOpenId(e.id)} className="flex w-full items-center justify-between gap-3 py-2.5 text-start hover:text-blue">
                      <span className="font-semibold" dir="auto">{title(e.title)}</span>
                      <span className={`rounded-bov px-2 py-0.5 text-xs font-semibold ${e.status === "published" ? "bg-gold text-navy" : "bg-sand text-ink-soft"}`}>
                        {e.status === "published" ? t.published : t.draft}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={add} disabled={busy} className={`${btnPrimary} self-start`}>
              + {t.addOn.replace("{date}", new Intl.DateTimeFormat(intl, { day: "numeric", month: "long" }).format(noon(selected)))}
            </button>
            <span role="alert" className="text-sm text-danger empty:hidden">{msg}</span>
          </div>
        )}
        {open && (
          <EventEditor
            key={open.id}
            ev={open}
            lang={lang}
            portalUrl={portalUrl}
            t={t}
            courses={courses}
            image={image}
            previewT={previewT}
            error={error}
            onClose={() => setOpenId(null)}
          />
        )}
      </div>

      {/* Every event, to find drafts quickly */}
      <section className="flex flex-col gap-3 xl:col-span-2" aria-labelledby="all-events">
        <h2 id="all-events" className="font-display text-h3 font-normal">{t.allEvents}</h2>
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
          {events.map((e) => (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => {
                  const d = e.dates[0];
                  setSelected(d);
                  setView({ y: noon(d).getFullYear(), m: noon(d).getMonth() });
                  setOpenId(e.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="grid w-full gap-x-4 gap-y-1 p-4 text-start hover:bg-sand/50 sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="text-sm text-ink-soft">{e.dates.map((d) => new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric" }).format(noon(d))).join(" · ")}</span>
                <span className="flex min-w-0 items-center gap-2 font-semibold text-ink" dir="auto">
                  <span className={`size-2 flex-none rounded-full ${toneDot[e.tone]}`} />
                  <span className="truncate">{title(e.title)}</span>
                </span>
                <span className={`justify-self-start rounded-bov px-2 py-0.5 text-xs font-semibold sm:justify-self-end ${e.status === "published" ? "bg-gold text-navy" : "bg-sand text-ink-soft"}`}>
                  {e.status === "published" ? t.published : t.draft}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function EventEditor({
  ev,
  lang,
  portalUrl,
  t,
  courses,
  image,
  previewT,
  error,
  onClose,
}: {
  ev: EventItem;
  lang: Lang;
  portalUrl: string;
  t: Dict["agenda"];
  courses: Dict["courses"];
  image: Dict["content"]["image"];
  previewT: Dict["preview"];
  error: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const pick = (e: EventItem) => ({
    title: e.title,
    kind: e.kind,
    place: e.place,
    body: e.body,
    time: e.time,
    tone: e.tone,
    dates: e.dates,
    image: e.image,
    registrationOpen: e.registrationOpen,
    slug: e.slug,
  });
  const [saved, setSaved] = useState(() => pick(ev));
  const [v, setV] = useState(() => pick(ev));
  const [loc, setLoc] = useState<Loc>(lang === "ar" ? "ar" : "en");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);
  const published = ev.status === "published";
  const dir = loc === "ar" ? "rtl" : "ltr";

  async function save(extra?: { status: "draft" | "published" }) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/events/${ev.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, ...extra }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.ok) {
        setSaved(v);
        setMsg({ ok: true, text: courses.saved });
        router.refresh();
      } else setMsg({ ok: false, text: data.error === "slug_taken" ? courses.slugTaken : courses.saveError });
    } catch {
      setMsg({ ok: false, text: error });
    }
    setBusy(false);
  }

  async function remove() {
    if (!confirm(t.removeConfirm)) return;
    const res = await fetch(`/api/admin/events/${ev.id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      onClose();
      router.refresh();
    } else setMsg({ ok: false, text: error });
  }

  const text = (key: "title" | "kind" | "place" | "body", label: string, rows?: number) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`ev-${key}`} className="text-sm font-semibold text-ink">
        {label} <span className="font-normal text-ink-soft">· {loc.toUpperCase()}</span>
      </label>
      {rows ? (
        <textarea id={`ev-${key}`} dir={dir} lang={loc} rows={rows} value={v[key][loc]} onChange={(e) => setV({ ...v, [key]: { ...v[key], [loc]: e.target.value } })} className={input} />
      ) : (
        <input id={`ev-${key}`} dir={dir} lang={loc} value={v[key][loc]} onChange={(e) => setV({ ...v, [key]: { ...v[key], [loc]: e.target.value } })} className={`${input} h-11`} />
      )}
    </div>
  );

  return (
    <article className="flex flex-col gap-4 rounded-bov border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={`m-0 text-sm font-semibold ${published ? "text-blue-deep" : "text-ink-soft"}`}>{published ? t.published : t.draft}</p>
          <p className="m-0 text-sm text-ink-soft">{t.registrations.replace("{n}", new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB").format(ev.registrations))}</p>
        </div>
        <button type="button" onClick={onClose} className={btnLine}>
          {t.close}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {LOCS.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={loc === l}
            onClick={() => setLoc(l)}
            className={`h-9 rounded-bov border px-3 text-sm font-semibold ${loc === l ? "border-navy bg-navy text-on-dark" : "border-line bg-white text-ink hover:border-navy"}`}
          >
            {courses.langs[l]}
          </button>
        ))}
      </div>
      {text("title", t.fields.title)}
      {text("kind", t.fields.kind)}
      {text("place", t.fields.place)}
      {text("body", t.fields.body, 5)}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ev-time" className="text-sm font-semibold text-ink">{t.fields.time}</label>
          <input id="ev-time" dir="auto" value={v.time} onChange={(e) => setV({ ...v, time: e.target.value })} className={`${input} h-11`} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ev-tone" className="text-sm font-semibold text-ink">{t.fields.tone}</label>
          <select id="ev-tone" value={v.tone} onChange={(e) => setV({ ...v, tone: e.target.value as Tone })} className={`${input} h-11`}>
            {(["event", "series", "deadline"] as const).map((k) => (
              <option key={k} value={k}>{t.tones[k]}</option>
            ))}
          </select>
        </div>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-semibold text-ink">{t.fields.dates}</legend>
        {v.dates.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="date"
              aria-label={`${t.fields.dates} ${i + 1}`}
              value={d}
              onChange={(e) => setV({ ...v, dates: v.dates.map((x, j) => (j === i ? e.target.value : x)) })}
              className={`${input} h-11 max-w-[220px]`}
            />
            {v.dates.length > 1 && (
              <button type="button" onClick={() => setV({ ...v, dates: v.dates.filter((_, j) => j !== i) })} className={btnLine}>
                {t.fields.removeDate}
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => setV({ ...v, dates: [...v.dates, v.dates[v.dates.length - 1]] })} className={`${btnLine} self-start`}>
          + {t.fields.addDate}
        </button>
      </fieldset>
      <ImageField value={v.image} onChange={(image) => setV({ ...v, image })} portalUrl={portalUrl} t={image} label={t.fields.image} changed={v.image !== saved.image} changedLabel={courses.unsaved} />
      <label className="flex items-center gap-2 text-[15px]">
        <input type="checkbox" checked={v.registrationOpen} onChange={(e) => setV({ ...v, registrationOpen: e.target.checked })} className="size-4 accent-navy" />
        {t.fields.registrationOpen}
      </label>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="ev-slug" className="text-sm font-semibold text-ink">{t.fields.slug}</label>
        <input
          id="ev-slug"
          dir="ltr"
          value={v.slug}
          onChange={(e) => setV({ ...v, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
          className={`${input} h-11`}
        />
        <span className="text-xs text-ink-soft">{courses.fields.slugHint}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <button type="button" disabled={busy || !dirty} onClick={() => save()} className={btnPrimary}>
          {busy ? courses.saving : courses.save}
        </button>
        <button type="button" disabled={busy} onClick={() => save({ status: published ? "draft" : "published" })} className={published ? btnLine : btnPrimary}>
          {published ? t.unpublish : t.publish}
        </button>
        <PreviewButton portalUrl={portalUrl} path={`/${lang}/agenda/${saved.slug}`} t={previewT} />
        {dirty && <span className="text-sm font-semibold text-gold-deep">{courses.unsaved}</span>}
        <span role="status" className={`text-sm empty:hidden ${msg?.ok ? "text-blue-deep" : "text-danger"}`}>{msg?.text ?? ""}</span>
      </div>
      <button type="button" onClick={remove} className="self-start text-sm font-semibold text-danger hover:underline">
        {t.remove}
      </button>
    </article>
  );
}
