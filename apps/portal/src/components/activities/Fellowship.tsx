import type { ActivitiesContent } from "@/content/activities";
import { btn } from "../ui";

/** Fellowship page body: apply button and four benefit cards. */
export function Fellowship({ fellowship }: { fellowship: ActivitiesContent["fellowship"] }) {
  return (
    <section>
      <div className="container-site flex flex-col gap-10 py-12 md:py-20">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a href="#apply" className={btn.navy}>{fellowship.cta}</a>
          <span className="text-sm font-semibold text-blue">{fellowship.status}</span>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fellowship.benefits.map((b) => (
            <li key={b.title} className="flex flex-col gap-2 rounded-bov border-t-[2.4px] border-sky bg-navy-raised p-[22px]">
              <h2 className="text-[17px] font-semibold text-on-dark">{b.title}</h2>
              <p className="m-0 text-sm leading-relaxed text-on-dark-muted">{b.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
