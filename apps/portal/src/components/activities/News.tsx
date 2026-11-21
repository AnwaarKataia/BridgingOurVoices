import type { ActivitiesContent } from "@/content/activities";
import { ContentImage } from "../ContentImage";
import { OpenFromHash } from "./OpenFromHash";

const clip = (s: string, n = 170) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/**
 * News items of one page (owner, 2026-11-21): at the TOP of the page they belong to, as a tidy grid of cards
 * (photo, date, title, first lines). "Read the full story" opens the card across the full width with every
 * photo and paragraph. The home page's "Read more" links to #<id>, which opens that card.
 */
export function News({
  news,
  items,
  heading,
}: {
  news: ActivitiesContent["news"];
  items: ActivitiesContent["news"]["items"];
  /** Section heading when the items sit on another page than Training (e.g. Seminars). */
  heading?: { title: string; lead: string };
}) {
  if (!items.length) return null;
  return (
    <section id="programme-news" aria-labelledby="programme-news-title" className="scroll-mt-24 bg-sand">
      <OpenFromHash />
      <div className="container-site flex flex-col gap-6 py-10 md:gap-8 md:py-14">
        <div className="flex flex-col gap-2">
          <h2 id="programme-news-title" className="font-display text-h2 font-normal text-ink">{heading?.title ?? news.title}</h2>
          <p className="m-0 max-w-[680px] text-lead text-ink-soft">{heading?.lead ?? news.lead}</p>
        </div>
        <ul className="grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => {
            const [cover, ...rest] = n.images.filter(Boolean);
            return (
              <li key={n.id} id={n.id} className="scroll-mt-28 [&:has(details[open])]:col-span-full">
                <details className="group overflow-hidden rounded-bov border border-line bg-white open:border-t-[2.4px] open:border-t-gold">
                  <summary className="flex cursor-pointer list-none flex-col group-open:md:grid group-open:md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] [&::-webkit-details-marker]:hidden">
                    <div className="bg-stripes-light relative aspect-[3/2]">
                      {cover && <ContentImage src={cover} alt={n.imageAlt} sizes="(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw" />}
                    </div>
                    <div className="flex flex-col gap-2.5 p-[22px] md:group-open:p-8">
                      <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">
                        {n.date} · {n.place}
                      </p>
                      <h3 className="font-display text-[1.3125rem] leading-snug font-normal text-ink group-open:md:text-[1.5rem]">{n.title}</h3>
                      <p className="m-0 text-sm leading-relaxed text-ink-soft group-open:hidden">{clip(n.paragraphs[0] ?? "")}</p>
                      <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-blue">
                        <span className="group-open:hidden">{news.readMore}</span>
                        <span className="hidden group-open:inline">{news.readLess}</span>
                        <svg aria-hidden viewBox="0 0 12 12" className="size-3 transition group-open:rotate-180">
                          <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    </div>
                  </summary>

                  {/* The full story */}
                  <div className="flex flex-col gap-4 border-t border-line p-[22px] md:p-8">
                    {n.paragraphs.map((p) => (
                      <p key={p} className="m-0 leading-relaxed text-ink">{p}</p>
                    ))}
                    {n.points.length > 0 && (
                      <ul className="m-0 flex list-disc flex-col gap-1.5 ps-5 leading-relaxed text-ink marker:text-blue">
                        {n.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    )}
                    {n.after.map((p) => (
                      <p key={p} className="m-0 leading-relaxed text-ink">{p}</p>
                    ))}
                    {rest.length > 0 && (
                      <ul aria-label={news.photosLabel} className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                        {rest.map((src) => (
                          <li key={src} className="relative aspect-[4/3] overflow-hidden rounded-bov">
                            <ContentImage src={src} alt="" sizes="(min-width: 640px) 25vw, 50vw" />
                          </li>
                        ))}
                      </ul>
                    )}
                    {n.link && (
                      <a href={n.link} target="_blank" rel="noopener noreferrer" className="self-start text-sm font-semibold text-blue hover:text-navy">
                        {news.source} <span aria-hidden>↗</span>
                      </a>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
