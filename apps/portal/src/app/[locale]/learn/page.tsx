import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isPublishedLocale } from "@/i18n/config";
import { getActivitiesContent } from "@/content/activities";
import { pick } from "@/lib/courses";
import { learnerGet, type Learner, type MyCourse } from "@/lib/learn";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { ContentImage } from "@/components/ContentImage";
import { LearnerSignOut } from "@/components/learn/LearnerSignOut";
import { btn } from "@/components/ui";

/** "My learning" (e-learning phase 2, 2026-11-21): the learner's courses and progress. */
type Params = { params: Promise<{ locale: string }> };

export const metadata: Metadata = { robots: { index: false } };

export default async function MyLearningPage({ params }: Params) {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) notFound();
  const me = await learnerGet<{ learner: Learner }>("/me");
  if (!me.data) redirect(`/${locale}/learn/login?next=/${locale}/learn`);
  const [c, my] = await Promise.all([getActivitiesContent(locale), learnerGet<{ items: MyCourse[] }>("/my")]);
  const t = c.elearning.learn;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale);
  const items = my.data?.items ?? [];

  return (
    <PageShell locale={locale} path="/learn" current="activities">
      <PageHeader eyebrow={me.data.learner.name} title={t.myTitle} lead={t.myLead} />
      <section className="bg-sand">
        <div className="container-site flex flex-col gap-6 py-12 md:py-20">
          {items.length === 0 ? (
            <div className="flex flex-col items-start gap-4 rounded-bov border border-line bg-white p-6">
              <p className="m-0 text-ink-soft">{t.myEmpty}</p>
              <Link href={`/${locale}/activities/e-learning`} className={btn.outlineDark}>
                {t.browse}
              </Link>
            </div>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((course) => {
                const { done, total } = course.progress;
                const pct = total ? Math.round((done / total) * 100) : 0;
                return (
                  <li key={course.slug}>
                    <article className="relative flex h-full flex-col overflow-hidden rounded-bov border border-line bg-white">
                      <div aria-hidden className="bg-stripes-light relative aspect-video">
                        {course.image && <ContentImage src={course.image} alt="" sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" />}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-[22px]">
                        <h2 className="font-display text-[1.3125rem] leading-snug font-normal text-ink">
                          <Link href={`/${locale}/learn/course/${course.slug}`} className="after:absolute after:inset-0 hover:text-blue">
                            {pick(course.title, locale)}
                          </Link>
                        </h2>
                        <div className="mt-auto flex flex-col gap-1.5">
                          <div className="h-2 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                            <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="m-0 text-sm text-ink-soft">{t.progress.replace("{done}", nf.format(done)).replace("{total}", nf.format(total))}</p>
                        </div>
                        <span aria-hidden className="text-sm font-semibold text-blue">{done ? t.continue : t.start}</span>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href={`/${locale}/learn/people/${me.data.learner.id}`} className="text-sm font-semibold text-blue underline underline-offset-4 hover:text-navy">
              👁 {t.study.viewProfile}
            </Link>
            <Link href={`/${locale}/learn/profile`} className="text-sm font-semibold text-blue underline underline-offset-4 hover:text-navy">
              {t.study.profileLink}
            </Link>
            <LearnerSignOut label={t.signOut} to={`/${locale}/activities/e-learning`} />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
