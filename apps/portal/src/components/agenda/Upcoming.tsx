import type { AgendaItem } from "@/content/agenda";
import { AgendaRow } from "./AgendaRow";
import { chipParts } from "./dates";

/**
 * Upcoming events from the dashboard (owner, 2026-11-21), one row per event (a series shows its first coming
 * session). Not shown while there is no published event, so the public agenda is the calendar and the
 * international days.
 */
export function Upcoming({ title, items, loc }: { title: string; items: AgendaItem[]; loc: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = items.filter((i) => i.iso >= today && i.tone !== "deadline").filter((i, n, all) => all.findIndex((x) => x.href === i.href) === n);
  if (!rows.length) return null;
  return (
    <section aria-labelledby="upcoming-title">
      <div className="container-site flex flex-col gap-6 pt-12 pb-4 md:pt-[72px]">
        <h2 id="upcoming-title" className="font-display text-h2 font-normal text-ink">{title}</h2>
        <ul className="border-t-[1.5px] border-navy">
          {rows.map((e) => {
            const { day, month } = chipParts(e.iso, loc);
            return (
              <li key={e.href}>
                <AgendaRow size="lg" day={day} month={month} kind={e.kind} title={e.title} place={e.place} tone={e.tone} dateTime={e.iso} href={e.href} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
