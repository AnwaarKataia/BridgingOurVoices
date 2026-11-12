import type { AgendaContent } from "@/content/agenda";
import { AgendaRow } from "./AgendaRow";
import { observanceParts } from "./dates";

/** International days for dialogue and peacebuilding (owner's request), in calendar order. They recur every year. */
export function Observances({ o, loc }: { o: AgendaContent["observances"]; loc: string }) {
  return (
    <section id="international-days" aria-labelledby="observances-title" className="bg-sand">
      <div className="container-site flex flex-col gap-4 py-12 md:py-20">
        <p className="eyebrow text-gold-deep">{o.eyebrow}</p>
        <h2 id="observances-title" className="font-display text-h2 font-normal text-ink">{o.title}</h2>
        <p className="max-w-[680px] text-body text-ink-soft">{o.lead}</p>
        {/* Columns (not a grid) so the dates read down the first column, then the second */}
        <ul className="mt-4 gap-x-10 border-t-[1.5px] border-navy md:columns-2">
          {o.items.map((item) => {
            const { day, month, range } = observanceParts(item, loc);
            return (
              <li key={`${item.start}-${item.title}`} className="break-inside-avoid">
                <AgendaRow day={day} month={month} kind={o.kind} title={item.title} place={range} tone="observance" href={item.url} external />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
