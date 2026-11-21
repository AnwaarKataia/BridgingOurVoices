import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isPublishedLocale } from "@/i18n/config";
import { getActivitiesContent } from "@/content/activities";
import { pick } from "@/lib/courses";
import { embedUrl, learnerGet, type PlayerCourse } from "@/lib/learn";
import { PageShell } from "@/components/PageShell";
import { MarkDoneButton } from "@/components/learn/MarkDoneButton";

/**
 * The course player (e-learning phase 2, 2026-11-21): units and lessons on one side, the chosen lesson
 * (video, PDF, text or link) on the other, "Mark as done" and previous / next. For learners who joined;
 * the team sees it through Preview.
 */
type Params = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<{ lesson?: string }> };

export const metadata: Metadata = { robots: { index: false } };

export default async function CoursePlayerPage({ params, searchParams }: Params) {
  const { locale, slug } = await params;
  if (!isPublishedLocale(locale) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const { lesson: lessonId } = await searchParams;
  const res = await learnerGet<{ course: PlayerCourse }>(`/courses/${slug}`);
  const here = `/${locale}/learn/course/${slug}`;
  if (res.status === 401) redirect(`/${locale}/learn/login?next=${encodeURIComponent(here)}`);
  if (res.status === 403) redirect(`/${locale}/e-learning/${slug}`);
  if (!res.data) notFound();
  const course = res.data.course;
  // The team's preview has no learner account: no progress buttons then
  const signedIn = (await learnerGet("/me")).status === 200;
  const t = (await getActivitiesContent(locale)).elearning.learn;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale);
  const minutesFmt = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale, { style: "unit", unit: "minute", unitDisplay: "long" });

  const all = course.modules.flatMap((m) => m.lessons);
  const doneCount = all.filter((l) => l.done).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;
  // The chosen lesson, or the first one not done yet
  const index = Math.max(0, lessonId ? all.findIndex((l) => l.id === lessonId) : all.findIndex((l) => !l.done));
  const lesson = all[index];
  const prev = all[index - 1];
  const next = all[index + 1];
  const href = (id: string) => `${here}?lesson=${id}`;
  const video = lesson?.type === "video" && lesson.videoUrl ? embedUrl(lesson.videoUrl) : null;
  const body = lesson ? pick(lesson.body, locale) : "";

  return (
    <PageShell locale={locale} path={`/learn/course/${slug}`} current="activities">
      <section className="bg-navy">
        <div className="container-site flex flex-col gap-3 py-8 md:py-10">
          <Link href={`/${locale}/learn`} className="self-start text-sm font-semibold text-gold hover:text-on-dark">
            <span aria-hidden className="me-1 inline-block rtl:-scale-x-100">←</span>
            {t.myTitle}
          </Link>
          <h1 className="font-display text-h2 font-normal text-on-dark">{pick(course.title, locale)}</h1>
          <div className="flex max-w-[520px] flex-col gap-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
            </div>
            <p className="m-0 text-sm text-on-dark-muted">{t.progress.replace("{done}", nf.format(doneCount)).replace("{total}", nf.format(all.length))}</p>
          </div>
        </div>
      </section>

      <section className="bg-sand">
        <div className="container-site grid gap-6 py-8 md:py-12 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
          {/* Lesson list */}
          <nav aria-label={t.contents} className="flex flex-col gap-3 rounded-bov border border-line bg-white p-4 lg:sticky lg:top-24 lg:order-1">
            <h2 className="font-display text-xl font-normal text-ink">{t.contents}</h2>
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {course.modules.map((m) => (
                <li key={m.id} className="flex flex-col gap-1.5">
                  <p className="m-0 text-sm font-semibold text-ink">{pick(m.title, locale)}</p>
                  <ul className="m-0 flex list-none flex-col p-0">
                    {m.lessons.map((l) => {
                      const current = l.id === lesson?.id;
                      return (
                        <li key={l.id}>
                          <Link
                            href={href(l.id)}
                            aria-current={current ? "page" : undefined}
                            className={`flex items-start gap-2 rounded-bov px-2 py-1.5 text-sm ${current ? "bg-navy text-on-dark" : "text-ink-soft hover:bg-sand hover:text-ink"}`}
                          >
                            <span aria-hidden className={`mt-0.5 flex size-4 flex-none items-center justify-center rounded-full border text-[10px] ${l.done ? "border-gold bg-gold text-navy" : current ? "border-on-dark" : "border-line-input"}`}>
                              {l.done ? "✓" : ""}
                            </span>
                            <span>
                              {pick(l.title, locale)}
                              {l.done && <span className="sr-only"> ({t.done})</span>}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ol>
          </nav>

          {/* Lesson */}
          {lesson ? (
            <article className="flex min-w-0 flex-col gap-5 rounded-bov border border-line bg-white p-5 md:p-8 lg:order-2">
              <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">
                {t.lessonOf.replace("{n}", nf.format(index + 1)).replace("{total}", nf.format(all.length))}
                {lesson.minutes > 0 && ` · ${minutesFmt.format(lesson.minutes)}`}
              </p>
              <h2 className="font-display text-h3 font-normal text-ink">{pick(lesson.title, locale)}</h2>

              {lesson.type === "video" &&
                (video ? (
                  <div className="relative aspect-video overflow-hidden rounded-bov bg-navy">
                    <iframe
                      src={video}
                      title={pick(lesson.title, locale)}
                      className="absolute inset-0 size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                ) : (
                  <p className="m-0 rounded-bov border border-dashed border-line-input bg-paper p-5 text-ink-soft">{t.noVideo}</p>
                ))}
              {body &&
                body
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((p, i) => (
                    <p key={i} className="m-0 leading-relaxed text-ink">{p}</p>
                  ))}
              {lesson.type === "file" &&
                (lesson.fileUrl ? (
                  <a href={lesson.fileUrl} target="_blank" rel="noopener" className="self-start rounded-bov border border-navy px-5 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark">
                    📄 {t.openFile}
                  </a>
                ) : (
                  <p className="m-0 rounded-bov border border-dashed border-line-input bg-paper p-5 text-ink-soft">{t.noContent}</p>
                ))}
              {lesson.type === "link" &&
                (lesson.linkUrl ? (
                  <a href={lesson.linkUrl} target="_blank" rel="noopener noreferrer" className="self-start rounded-bov border border-navy px-5 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark">
                    🔗 {t.openLink}
                  </a>
                ) : (
                  <p className="m-0 rounded-bov border border-dashed border-line-input bg-paper p-5 text-ink-soft">{t.noContent}</p>
                ))}
              {lesson.type === "text" && !body && <p className="m-0 rounded-bov border border-dashed border-line-input bg-paper p-5 text-ink-soft">{t.noContent}</p>}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                {signedIn ? (
                  <MarkDoneButton lessonId={lesson.id} done={lesson.done} nextHref={next ? href(next.id) : null} t={{ markDone: t.markDone, done: t.done, undo: t.undo, error: t.errors.generic }} />
                ) : (
                  <span />
                )}
                <div className="flex flex-wrap gap-2">
                  {prev && (
                    <Link href={href(prev.id)} className="rounded-bov border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:border-navy">
                      {t.prev}
                    </Link>
                  )}
                  {next && (
                    <Link href={href(next.id)} className="rounded-bov bg-navy px-4 py-2.5 text-sm font-semibold text-on-dark hover:bg-navy-hover">
                      {t.next}
                    </Link>
                  )}
                </div>
              </div>
              {all.length > 0 && doneCount === all.length && (
                <p role="status" className="m-0 rounded-bov bg-gold/20 p-4 font-semibold text-ink">
                  {t.allDone} {course.certificate && t.certificateSoon}
                </p>
              )}
            </article>
          ) : (
            <p className="rounded-bov border border-line bg-white p-6 text-ink-soft lg:order-2">{t.noContent}</p>
          )}
        </div>
      </section>
    </PageShell>
  );
}
