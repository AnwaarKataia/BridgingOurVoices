import type { Locale } from "@/i18n/config";
import type { AgendaContent } from "@/content/agenda";
import { eventHref, eventIsos, eventSlugs, seriesSlug } from "@/content/agenda";
import { btn } from "@/components/ui";
import { ContentImage } from "../ContentImage";
import { AgendaRow } from "./AgendaRow";
import { chipParts } from "./dates";

/** Brand file's second Agenda block: featured webinar series card + the full list of upcoming events. Every title opens its own page. */
export function Upcoming({ a, loc, locale }: { a: AgendaContent; loc: string; locale: Locale }) {
  const seriesHref = eventHref(locale, seriesSlug);
  return (
    <section aria-labelledby="upcoming-title">
      <h2 id="upcoming-title" className="sr-only">{a.upcomingTitle}</h2>
      <div className="container-site grid items-start gap-10 pt-12 pb-16 md:pt-[72px] md:pb-24 lg:grid-cols-2">
        <article className="flex flex-col overflow-hidden rounded-bov bg-navy text-on-dark">
          <div aria-hidden className="bg-stripes-dark relative aspect-video">
            {a.featured.image && <ContentImage src={a.featured.image} alt="" sizes="(min-width: 1024px) 600px, 100vw" />}
          </div>
          <div className="flex flex-col gap-3.5 border-t-[3px] border-gold p-6 sm:p-7">
            <p className="m-0 font-mono text-tag tracking-label text-sky uppercase rtl:font-sans rtl:tracking-normal">{a.featured.kind}</p>
            <h3 className="font-display text-[1.75rem] leading-[1.3] font-normal">
              <a href={seriesHref} className="hover:text-gold">{a.featured.title}</a>
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-4">
              <span className="font-display text-xl text-gold">{a.featured.dates}</span>
              <a href={seriesHref} className={btn.gold}>{a.featured.register}</a>
            </div>
          </div>
        </article>

        <div>
          <ul className="border-t-[1.5px] border-navy">
            {a.events.map((e, i) => {
              const { day, month } = chipParts(eventIsos[i], loc);
              return (
                <li key={e.title}>
                  <AgendaRow
                    size="lg"
                    day={day}
                    month={month}
                    kind={e.kind}
                    title={e.title}
                    place={e.place}
                    tone="event"
                    dateTime={eventIsos[i]}
                    href={eventHref(locale, eventSlugs[i])}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
