import type { Locale } from "@/i18n/config";
import type { ActivitiesContent } from "@/content/activities";
import type { HomeContent } from "@/content/home";
import { ContentImage } from "../ContentImage";

const clip = (s: string, n = 150) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/**
 * Latest news on the home page (owner, 2026-11-21): a photo, the date, the title and a few words for each
 * of the newest items; "Read more" opens the item on the News page.
 */
export function LatestNews({ locale, labels, items }: { locale: Locale; labels: HomeContent["news"]; items: ActivitiesContent["news"]["items"] }) {
  const news = items.slice(0, 3);
  if (!news.length) return null;
  const page = `/${locale}/activities/news`;
  return (
    <section aria-labelledby="latest-news" className="bg-sand">
      <div className="container-site flex flex-col gap-8 py-16 md:py-[88px]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="latest-news" className="font-display text-h2 font-normal text-ink">{labels.title}</h2>
          <a href={page} className="text-[15px] font-semibold text-blue hover:text-navy">{labels.all}</a>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <li key={n.id}>
              <article className="relative flex h-full flex-col overflow-hidden rounded-bov border border-line bg-white">
                <div className="bg-stripes-light relative aspect-[3/2]">
                  {n.images[0] && <ContentImage src={n.images[0]} alt={n.imageAlt} sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />}
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-[22px]">
                  <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">{n.date}</p>
                  <h3 className="font-display text-[1.3125rem] leading-snug font-normal text-ink">
                    <a href={`${page}#${n.id}`} className="after:absolute after:inset-0 hover:text-blue">{n.title}</a>
                  </h3>
                  <p className="m-0 text-sm leading-relaxed text-ink-soft">{clip(n.paragraphs[0] ?? "")}</p>
                  <span aria-hidden className="mt-auto pt-1.5 text-sm font-semibold text-blue">{labels.more}</span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
