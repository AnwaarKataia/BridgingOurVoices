import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { ActivitiesContent } from "@/content/activities";
import { getCourses, pick } from "@/lib/courses";
import { ContentImage } from "../ContentImage";
import { btn } from "../ui";

/** E-learning page body: published course cards, or "coming soon" while nothing is published. */
export async function ELearning({ e, locale }: { e: ActivitiesContent["elearning"]; locale: Locale }) {
  const courses = await getCourses();
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale);

  if (!courses.length) {
    return (
      <section className="bg-sand">
        <div className="container-site py-12 md:py-20">
          <div className="mx-auto flex max-w-[720px] flex-col items-center gap-4 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white px-6 py-12 text-center md:px-12">
            <h2 className="font-display text-h2 font-normal text-ink">{e.soonTitle}</h2>
            <p className="m-0 text-lead leading-relaxed text-ink-soft">{e.soonBody}</p>
            <Link href={`/${locale}/activities/news`} className={`${btn.outlineDark} mt-2`}>
              {e.soonCta}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-sand">
      <div className="container-site py-12 md:py-20">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <li key={c.slug}>
              <article className="relative flex h-full flex-col overflow-hidden rounded-bov border border-line bg-white">
                <div aria-hidden className="bg-stripes-light relative aspect-video">
                  {c.image && <ContentImage src={c.image} alt="" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />}
                </div>
                <div className="flex flex-1 flex-col gap-2.5 p-[22px]">
                  <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">
                    {e.kinds[c.kind]} · {e.formats[c.format]}
                  </p>
                  <h2 className="font-display text-[1.3125rem] leading-snug font-normal text-ink">
                    <Link href={`/${locale}/e-learning/${c.slug}`} className="after:absolute after:inset-0 hover:text-blue">
                      {pick(c.title, locale)}
                    </Link>
                  </h2>
                  <p className="m-0 text-sm leading-relaxed text-ink-soft">{pick(c.summary, locale)}</p>
                  <p className="m-0 mt-auto flex flex-wrap gap-x-3 pt-1.5 text-sm text-ink-soft">
                    {c.modules > 0 && <span>{e.units.replace("{n}", nf.format(c.modules))}</span>}
                    {c.certificate && <span>✓ {e.certificate}</span>}
                  </p>
                  <span aria-hidden className="text-sm font-semibold text-blue">{e.view}</span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
