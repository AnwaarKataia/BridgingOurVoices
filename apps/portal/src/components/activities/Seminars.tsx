import type { ActivitiesContent } from "@/content/activities";
import { ContentImage } from "../ContentImage";

/** Seminars page body: seminar cards with photo placeholders. */
export function Seminars({ seminars, registerHref }: { seminars: ActivitiesContent["seminars"]; registerHref: string }) {
  return (
    <section className="bg-sand">
      <div className="container-site py-12 md:py-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seminars.items.map((s) => (
            <li key={s.title}>
              <article className="flex h-full flex-col overflow-hidden rounded-bov border border-line bg-white">
                <div aria-hidden className="bg-stripes-light relative aspect-video">
                  {s.image && <ContentImage src={s.image} alt="" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />}
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-[22px]">
                  <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">{s.meta}</p>
                  <h2 className="font-display text-[1.3125rem] leading-snug font-normal text-ink">{s.title}</h2>
                  <p className="m-0 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                  <a href={registerHref} className="mt-auto pt-1.5 text-sm font-semibold text-blue hover:text-navy">{s.cta}</a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
