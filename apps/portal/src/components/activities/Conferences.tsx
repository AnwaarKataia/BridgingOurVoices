import type { ActivitiesContent } from "@/content/activities";
import { ContentImage } from "../ContentImage";

/** Conferences page body: featured video + session list (video placeholders until recordings are published). */
export function Conferences({ conferences }: { conferences: ActivitiesContent["conferences"] }) {
  const { featured, sessions } = conferences;

  return (
    <section>
      <div className="container-site grid gap-8 py-12 md:py-20 lg:grid-cols-2">
        <a href="#featured" id="featured" className="group flex flex-col gap-3.5">
          <div className="bg-stripes-dark relative flex aspect-video items-center justify-center overflow-hidden rounded-bov">
            {featured.image && <ContentImage src={featured.image} alt="" sizes="(min-width: 1024px) 600px, 100vw" />}
            <span
              role="img"
              aria-label={conferences.playLabel}
              className="relative flex size-14 items-center justify-center rounded-full bg-gold ps-1 text-[22px] text-navy transition group-hover:scale-105"
            >
              ▶
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-blue">{featured.kind}</span>
            <h2 className="font-display text-2xl leading-snug font-normal text-ink">{featured.title}</h2>
          </div>
        </a>

        <ul className="border-t border-navy">
          {sessions.map((s, i) => (
            <li key={i}>
              <a href="#featured" className="grid grid-cols-[96px_1fr] items-center gap-4 border-b border-line py-3.5 sm:grid-cols-[112px_1fr]">
                <div aria-hidden className="bg-stripes-dark relative aspect-video overflow-hidden rounded-bov">
                  {s.image && <ContentImage src={s.image} alt="" sizes="112px" />}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-label font-semibold text-blue">{s.kind}</span>
                  <span className="text-[15px] leading-snug text-ink">{s.title}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
