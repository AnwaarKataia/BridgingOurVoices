import type { ActivitiesContent } from "@/content/activities";
import { ContentImage } from "../ContentImage";

/**
 * News items of one page (owner, 2026-11-21: no separate News tab), one article per post from the
 * Bridging Our Voices Facebook page, newest first. The home page's "Read more" links to #<id> here.
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
      <div className="container-site flex flex-col gap-8 py-12 md:gap-12 md:py-20">
        <div className="flex flex-col gap-3">
          <h2 id="programme-news-title" className="font-display text-h2 font-normal text-ink">{heading?.title ?? news.title}</h2>
          <p className="m-0 max-w-[680px] text-lead text-ink-soft">{heading?.lead ?? news.lead}</p>
        </div>
        {items.map((n) => {
          const [cover, ...rest] = n.images.filter(Boolean);
          return (
            <article key={n.title} id={n.id} className="scroll-mt-28 overflow-hidden rounded-bov border border-line bg-white lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <div className="flex flex-col gap-1.5 p-1.5">
                <div className="bg-stripes-light relative aspect-[3/2] overflow-hidden">
                  {cover && <ContentImage src={cover} alt={n.imageAlt} sizes="(min-width: 1024px) 560px, 100vw" />}
                </div>
                {rest.length > 0 && (
                  <ul aria-label={news.photosLabel} className="grid grid-cols-4 gap-1.5">
                    {rest.map((src) => (
                      <li key={src} className="relative aspect-square overflow-hidden">
                        <ContentImage src={src} alt="" sizes="(min-width: 1024px) 140px, 25vw" />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex flex-col gap-3 p-[22px] md:p-8">
                <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">
                  {n.date} · {n.place}
                </p>
                <h2 className="font-display text-[1.5rem] leading-snug font-normal text-ink">{n.title}</h2>
                {n.paragraphs.map((p) => (
                  <p key={p} className="m-0 leading-relaxed text-ink-soft">{p}</p>
                ))}
                {n.points.length > 0 && (
                  <ul className="m-0 flex list-disc flex-col gap-1.5 ps-5 leading-relaxed text-ink-soft marker:text-blue">
                    {n.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                )}
                {n.after.map((p) => (
                  <p key={p} className="m-0 leading-relaxed text-ink-soft">{p}</p>
                ))}
                {n.link && (
                  <a href={n.link} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm font-semibold text-blue hover:text-navy">
                    {news.source} <span aria-hidden>↗</span>
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
