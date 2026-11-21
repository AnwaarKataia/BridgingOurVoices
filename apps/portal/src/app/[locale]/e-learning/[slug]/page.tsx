import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPublishedLocale, type Locale } from "@/i18n/config";
import { getActivitiesContent } from "@/content/activities";
import { getCourse, pick } from "@/lib/courses";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { ContentImage } from "@/components/ContentImage";
import { JoinCourse } from "@/components/learn/JoinCourse";
import { learnerGet } from "@/lib/learn";
import { isPreview } from "@/lib/preview";
import { btn } from "@/components/ui";

/** One published course or webinar (owner, 2026-11-21): details like the KAICIID course pages, units, registration. */
type Params = { params: Promise<{ locale: string; slug: string }> };

const clip = (s: string, n = 158) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

async function resolve(params: Params["params"]) {
  const { locale, slug } = await params;
  if (!isPublishedLocale(locale)) return null;
  const course = await getCourse(slug);
  return course ? { locale: locale as Locale, slug, course } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  return pageMetadata(r.locale, `/e-learning/${r.slug}`, { title: pick(r.course.title, r.locale), description: clip(pick(r.course.summary, r.locale)) });
}

export default async function CoursePage({ params }: Params) {
  const r = await resolve(params);
  if (!r) notFound();
  const { locale, slug, course } = r;
  const [c, status, preview] = await Promise.all([
    getActivitiesContent(locale),
    learnerGet<{ joined: boolean; removed: boolean }>(`/courses/${slug}/status`),
    isPreview(),
  ]);
  const e = c.elearning;
  const intlLocale = locale === "ar" ? "ar-EG" : locale;
  const nf = new Intl.NumberFormat(intlLocale);
  // "1 minute" / "12 minutes" / «٥ دقائق»: plural forms come from Intl
  const minutes = new Intl.NumberFormat(intlLocale, { style: "unit", unit: "minute", unitDisplay: "long" });
  const date = (d: string | null) => (d ? new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`)) : "");
  const langNames = new Intl.DisplayNames([locale], { type: "language" });
  const path = `/e-learning/${slug}`;
  const title = pick(course.title, locale);
  const description = pick(course.description, locale);

  const info: [string, string][] = (
    [
      [e.info.type, e.kinds[course.kind]],
      [e.info.format, e.formats[course.format]],
      [e.info.fees, pick(course.fees, locale)],
      [e.info.units, course.modules.length ? nf.format(course.modules.length) : ""],
      [e.info.programmeArea, pick(course.programmeArea, locale)],
      [e.info.duration, pick(course.duration, locale)],
      [e.info.learningTime, pick(course.learningTime, locale)],
      [e.info.startDate, date(course.startDate)],
      [e.info.deadline, date(course.deadline)],
      [e.info.certificate, course.certificate ? e.info.yes : e.info.no],
      [e.info.languages, course.languages.map((l) => langNames.of(l) ?? l).join(" · ")],
    ] as [string, string][]
  ).filter(([, v]) => v);

  const graph = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description: pick(course.summary, locale),
    url: `${siteUrl}/${locale}${path}`,
    inLanguage: course.languages,
    provider: { "@id": `${siteUrl}/#organization` },
  };

  return (
    <PageShell locale={locale} path={path} current="activities">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <PageHeader eyebrow={e.kinds[course.kind]} title={title} lead={pick(course.summary, locale)} />

      <section className="bg-sand">
        <div className="container-site flex flex-col gap-8 py-10 md:py-16">
          <Link href={`/${locale}/activities/e-learning`} className="self-start text-sm font-semibold text-blue hover:text-navy">
            <span aria-hidden>{locale === "ar" ? "→" : "←"}</span> {e.back}
          </Link>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-start">
            {/* Details first on small screens: image + info + register */}
            <aside className="flex min-w-0 flex-col gap-4 lg:order-2">
              <div className="bg-stripes-light relative aspect-video overflow-hidden rounded-bov border border-line">
                {course.image && <ContentImage src={course.image} alt="" sizes="(min-width: 1024px) 420px, 100vw" priority />}
              </div>
              <dl className="m-0 divide-y divide-line rounded-bov border border-line bg-white">
                {info.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 px-4 py-3 text-[15px]">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="m-0 font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              {(course.registrationOpen || status.data?.joined) && (
                <a href="#register" className={`${btn.gold} w-full`}>
                  {status.data?.joined ? e.learn.goToCourse : e.learn.join}
                </a>
              )}
              {course.flyer && (
                <a href={course.flyer} target="_blank" rel="noopener" className={`${btn.outlineDark.replace("whitespace-nowrap", "")} h-auto min-h-[52px] w-full py-2.5 text-center`}>
                  {e.flyer}
                </a>
              )}
            </aside>

            <div className="flex min-w-0 flex-col gap-8 lg:order-1">
              {description && (
                <div className="flex flex-col gap-3 rounded-bov border border-line bg-white p-6 md:p-8">
                  <h2 className="font-display text-h3 font-normal text-ink">{e.aboutTitle}</h2>
                  {description.split(/\n+/).map((p) => (
                    <p key={p} className="m-0 leading-relaxed text-ink-soft">{p}</p>
                  ))}
                </div>
              )}
              {course.modules.length > 0 && (
                <div className="flex flex-col gap-4">
                  <h2 className="font-display text-h3 font-normal text-ink">{e.contentTitle}</h2>
                  <ol className="m-0 flex list-none flex-col gap-3 p-0">
                    {course.modules.map((m, i) => (
                      <li key={i} className="rounded-bov border border-line bg-white p-5">
                        <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">
                          {e.unit.replace("{n}", nf.format(i + 1))}
                        </p>
                        <h3 className="mt-1.5 font-display text-[1.25rem] leading-snug font-normal text-ink">{pick(m.title, locale)}</h3>
                        {pick(m.summary, locale) && <p className="m-0 mt-1.5 text-sm leading-relaxed text-ink-soft">{pick(m.summary, locale)}</p>}
                        {m.lessons.length > 0 && (
                          <ul className="m-0 mt-3 flex list-none flex-col divide-y divide-line border-t border-line p-0">
                            {m.lessons.map((l, j) => (
                              <li key={j} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-[15px]">
                                <span className="text-ink">{pick(l.title, locale)}</span>
                                <span className="text-sm text-ink-soft">
                                  {e.lessonTypes[l.type]}
                                  {l.minutes > 0 && ` · ${minutes.format(l.minutes)}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="register" className="scroll-mt-24 bg-white" aria-labelledby="register-title">
        <div className="container-site py-12 md:py-20">
          <div className="mx-auto flex max-w-[720px] flex-col gap-4">
            <h2 id="register-title" className="font-display text-h2 font-normal text-ink">{e.register.title}</h2>
            <JoinCourse
              slug={slug}
              locale={locale}
              state={{
                signedIn: status.status !== 401 && status.status !== 503,
                joined: !!status.data?.joined,
                removed: !!status.data?.removed,
                open: course.registrationOpen,
              }}
              t={e.learn}
              closed={e.register.closed}
            />
            {preview && (
              // Team preview: open the lessons without an account
              <Link href={`/${locale}/learn/course/${slug}`} className="self-start text-sm font-semibold text-blue underline underline-offset-4 hover:text-navy">
                👁 {e.learn.goToCourse}
              </Link>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
