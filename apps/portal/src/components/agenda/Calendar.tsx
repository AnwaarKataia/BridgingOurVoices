"use client";

import { useEffect, useMemo, useState } from "react";
import type { AgendaContent, AgendaItem, Observance } from "@/content/agenda";
import { AgendaRow } from "./AgendaRow";
import { chipParts, observanceParts } from "./dates";

type Props = {
  loc: string;
  rtl: boolean;
  labels: AgendaContent["calendar"];
  items: AgendaItem[];
  observances: Observance[];
  observanceKind: string;
  /** Build-time date, so the server and the first client render match; replaced by the real date on mount. */
  initialIso: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const noon = (iso: string) => new Date(`${iso}T12:00:00`);

/** Month calendar (as in the brand file): event days are tinted with a gold dot, international days get a sky dot, today has a blue frame. Picking a day filters the list. */
export function Calendar({ loc, rtl, labels, items, observances, observanceKind, initialIso }: Props) {
  const [today, setToday] = useState(initialIso);
  const [view, setView] = useState(() => ({ y: noon(initialIso).getFullYear(), m: noon(initialIso).getMonth() }));
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const now = new Date();
    const iso = isoOf(now);
    if (iso !== initialIso) {
      setToday(iso);
      setView({ y: now.getFullYear(), m: now.getMonth() });
    }
  }, [initialIso]);

  const { y, m } = view;
  const monthKey = `${y}-${pad(m + 1)}`;

  // The page's own items plus this year's international days, sorted by date
  const all = useMemo(() => {
    const obs: AgendaItem[] = observances.map((o) => ({
      iso: `${y}-${o.start}`,
      kind: observanceKind,
      title: o.title,
      place: observanceParts(o, loc).range,
      tone: "observance",
      href: o.url,
      external: true,
    }));
    return [...items, ...obs].sort((a, b) => a.iso.localeCompare(b.iso));
  }, [items, observances, observanceKind, y, loc]);

  const fmt = (opts: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat(loc, opts).format(d);
  const nf = new Intl.NumberFormat(loc);
  const first = new Date(y, m, 1, 12);
  const monthTitle = fmt({ month: "long", year: "numeric" }, first);
  const startDow = (first.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  // 2 Nov 2026 is a Monday
  // Short names from 640px; single letters on small phones so Arabic names don't run together
  const weekdays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2026, 10, 2 + i, 12);
    return { short: fmt({ weekday: "short" }, d), narrow: fmt({ weekday: "narrow" }, d) };
  });

  const shift = (delta: number) => {
    const d = new Date(y, m + delta, 1);
    setView({ y: d.getFullYear(), m: d.getMonth() });
    setSelected(null);
  };

  const list = selected ? all.filter((e) => e.iso === selected) : all.filter((e) => e.iso.startsWith(monthKey));
  const listTitle = selected ? fmt({ weekday: "long", day: "numeric", month: "long" }, noon(selected)) : monthTitle;

  return (
    <div className="grid items-start gap-x-12 gap-y-8 lg:grid-cols-2">
      <div className="flex flex-col gap-4 rounded-bov border border-t-4 border-line border-t-gold bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={() => shift(-1)} aria-label={labels.prev} className="size-11 flex-none rounded-bov border border-line bg-white text-lg text-navy hover:border-navy">
            <span aria-hidden>{rtl ? "→" : "←"}</span>
          </button>
          <h2 className="text-center font-display text-2xl font-normal text-ink" aria-live="polite">{monthTitle}</h2>
          <button type="button" onClick={() => shift(1)} aria-label={labels.next} className="size-11 flex-none rounded-bov border border-line bg-white text-lg text-navy hover:border-navy">
            <span aria-hidden>{rtl ? "←" : "→"}</span>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((w) => (
            <div key={w.short} aria-hidden className="py-1.5 text-center text-xs font-semibold text-ink-soft">
              <span className="sm:hidden">{w.narrow}</span>
              <span className="hidden sm:inline">{w.short}</span>
            </div>
          ))}
          {Array.from({ length: startDow }, (_, i) => <div key={`pad-${i}`} aria-hidden />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const iso = `${monthKey}-${pad(i + 1)}`;
            const dayItems = all.filter((e) => e.iso === iso);
            const hasEvent = dayItems.some((e) => e.tone !== "observance");
            const hasObservance = dayItems.some((e) => e.tone === "observance");
            const isSel = selected === iso;
            const isToday = iso === today;
            const label = [fmt({ weekday: "long", day: "numeric", month: "long" }, noon(iso)), ...dayItems.map((e) => e.title)].join(" · ");
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelected(isSel ? null : iso)}
                aria-pressed={isSel}
                aria-label={label}
                className={`flex aspect-square min-h-10 flex-col items-center justify-center gap-[3px] rounded-bov border p-0 text-[15px] transition ${
                  isSel ? "bg-navy text-on-dark" : `${hasEvent ? "bg-[#fbf5e8] font-semibold" : hasObservance ? "bg-sky-tint font-semibold" : "bg-white"} text-ink`
                } ${isToday ? "border-[1.5px] border-blue" : isSel ? "border-navy" : "border-[#efeae0] hover:border-navy"}`}
              >
                <span>{nf.format(i + 1)}</span>
                <span aria-hidden className="flex h-1.5 gap-0.5">
                  {hasEvent && <span className="size-1.5 rounded-full bg-gold" />}
                  {hasObservance && <span className="size-1.5 rounded-full bg-sky" />}
                </span>
              </button>
            );
          })}
        </div>

        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-ink-soft">
          <li className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-gold" />{labels.legendEvent}</li>
          <li className="flex items-center gap-1.5"><span aria-hidden className="size-2 rounded-full bg-sky" />{labels.legendObservance}</li>
          <li className="flex items-center gap-1.5"><span aria-hidden className="size-3.5 rounded-bov border-[1.5px] border-blue" />{labels.legendToday}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-4" aria-live="polite">
        <p className="eyebrow text-gold-deep">{selected ? labels.dayLabel : labels.monthLabel}</p>
        <h3 className="font-display text-h2 font-normal text-ink">{listTitle}</h3>
        <div className="border-t-[1.5px] border-navy">
          {list.length === 0 ? (
            <p className="py-4 text-ink-soft">{labels.empty}</p>
          ) : (
            <ul>
              {list.map((e) => {
                const { day, month } = chipParts(e.iso, loc);
                return (
                  <li key={`${e.iso}-${e.title}`}>
                    <AgendaRow day={day} month={month} kind={e.kind} title={e.title} place={e.place} tone={e.tone} dateTime={e.iso} href={e.href} external={e.external} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {selected && (
          <button type="button" onClick={() => setSelected(null)} className="self-start text-sm font-semibold text-blue hover:text-navy">
            {labels.showMonth}
          </button>
        )}
      </div>
    </div>
  );
}
