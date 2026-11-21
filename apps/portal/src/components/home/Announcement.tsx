import type { HomeContent } from "@/content/home";
import { ContentImage } from "../ContentImage";
import { btn, textLink } from "../ui";

export function Announcement({ a, detailsHref, primaryHref }: { a: HomeContent["announcement"]; detailsHref: string; primaryHref: string }) {
  return (
    <section id="announcement" className="pt-[72px] pb-6" aria-labelledby="announcement-title">
      <div className="container-site">
        {/* Banner from the content (dashboard); kept at the original banner's 2400×1580 proportion */}
        {a.image && (
          <figure className="relative aspect-[2400/1580] overflow-hidden rounded-bov bg-navy shadow-bov">
            <ContentImage src={a.image} alt={a.bannerAlt} sizes="(min-width: 1280px) 1216px, 100vw" className="object-contain" />
          </figure>
        )}

        <div className="mt-6 mb-3 flex flex-wrap items-center gap-3">
          <span className="rounded-bov bg-gold px-2.5 py-1 font-mono text-tag font-semibold tracking-label text-navy uppercase rtl:font-sans rtl:tracking-normal">
            {a.badge}
          </span>
          <span className="text-sm font-semibold text-gold-deep">{a.deadline}</span>
        </div>

        <h2 id="announcement-title" className="mb-3 font-display text-h3 font-normal">{a.title}</h2>
        <p className="max-w-[960px] text-ink-soft">{a.body}</p>

        <ul className="mt-5 mb-7 flex flex-wrap gap-2">
          {a.chips.map((chip) => (
            <li key={chip} className="flex h-8 items-center rounded-full bg-sky-tint px-3 text-label font-medium text-blue-deep">
              {chip}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center gap-6">
          <a href={primaryHref} className={`${btn.navy.replace("whitespace-nowrap", "")} h-auto min-h-[52px] max-w-full py-2.5 text-center`}>{a.primary}</a>
          <a href={detailsHref} className={textLink}>{a.secondary}</a>
        </div>
      </div>
    </section>
  );
}
