import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isPublishedLocale, type Locale } from "@/i18n/config";
import { getActivitiesContent } from "@/content/activities";
import { pick } from "@/lib/courses";
import { learnerGet, type Participant, type PlayerCourse } from "@/lib/learn";
import { PageShell } from "@/components/PageShell";
import { LessonGate } from "@/components/learn/LessonGate";
import { QuizForm } from "@/components/learn/QuizForm";

/**
 * The course player (e-learning, 2026-11-21): the learner's name and links to their profile and the
 * participants; units with their lessons (in order, ✓ when done, 🔒 until the previous step is finished)
 * and unit quizzes; the chosen lesson (watch / read / open, then "Mark as done"), a quiz, or the participants.
 * The team sees it through Preview (nothing locked, no progress).
 */
type Params = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<{ lesson?: string; quiz?: string; tab?: string }> };

export const metadata: Metadata = { robots: { index: false } };

type Step = { kind: "lesson"; id: string; moduleIndex: number; locked: boolean; done: boolean } | { kind: "quiz"; id: string; moduleIndex: number; locked: boolean; done: boolean };

export default async function CoursePlayerPage({ params, searchParams }: Params) {
  const { locale: rawLocale, slug } = await params;
  if (!isPublishedLocale(rawLocale) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const locale = rawLocale as Locale;
  const { lesson: lessonId, quiz: quizId, tab } = await searchParams;
  const res = await learnerGet<{ course: PlayerCourse; learner: { name: string } | null }>(`/courses/${slug}`);
  const here = `/${locale}/learn/course/${slug}`;
  if (res.status === 401) redirect(`/${locale}/learn/login?next=${encodeURIComponent(here)}`);
  if (res.status === 403) redirect(`/${locale}/e-learning/${slug}`);
  if (!res.data) notFound();
  const { course, learner } = res.data;
  const signedIn = !!learner;
  const c = await getActivitiesContent(locale);
  const t = c.elearning.learn;
  const st = t.study;
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale);
  const minutesFmt = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : locale, { style: "unit", unit: "minute", unitDisplay: "long" });

  // Every step in order: lessons, then the unit's quiz
  const steps: Step[] = course.modules.flatMap((m, mi) => [
    ...m.lessons.map((l) => ({ kind: "lesson" as const, id: l.id, moduleIndex: mi, locked: l.locked, done: l.done })),
    ...(m.quiz ? [{ kind: "quiz" as const, id: m.id, moduleIndex: mi, locked: m.quiz.locked, done: !!m.quiz.best?.passed }] : []),
  ]);
  const hrefOf = (s: Step) => (s.kind === "lesson" ? `${here}?lesson=${s.id}` : `${here}?quiz=${s.id}`);
  const lessons = course.modules.flatMap((m) => m.lessons);
  const pct = course.progress.total ? Math.round((course.progress.done / course.progress.total) * 100) : 0;

  // What to show: participants, a quiz, the chosen lesson, or the first step not done yet
  let view: "people" | "quiz" | "lesson" = tab === "people" && signedIn ? "people" : quizId ? "quiz" : "lesson";
  let stepIndex = view === "quiz" ? steps.findIndex((s) => s.kind === "quiz" && s.id === quizId) : lessonId ? steps.findIndex((s) => s.kind === "lesson" && s.id === lessonId) : -1;
  if (view !== "people" && stepIndex < 0) {
    stepIndex = Math.max(0, steps.findIndex((s) => !s.done && !s.locked));
    if (steps[stepIndex]?.kind === "quiz") view = "quiz";
    else view = "lesson";
  }
  const step = steps[stepIndex];
  const prev = steps[stepIndex - 1];
  const next = steps[stepIndex + 1];
  const lesson = view === "lesson" && step?.kind === "lesson" ? lessons.find((l) => l.id === step.id) : undefined;
  const unit = step ? course.modules[step.moduleIndex] : undefined;
  const lessonNumber = lesson ? lessons.findIndex((l) => l.id === lesson.id) + 1 : 0;
  const people = view === "people" ? ((await learnerGet<{ items: Participant[] }>(`/courses/${slug}/people`)).data?.items ?? []) : [];
  const countries = new Intl.DisplayNames([locale], { type: "region" });
  // Is this step locked because a previous unit's quiz isn't passed?
  const lockedByQuiz = step ? steps.slice(0, stepIndex).some((s) => s.kind === "quiz" && !s.done) : false;

  const navLink = (active: boolean) =>
    `flex items-start gap-2 rounded-bov px-2 py-1.5 text-sm ${active ? "bg-navy text-on-dark" : "text-ink-soft hover:bg-sand hover:text-ink"}`;
  const mark = (done: boolean, locked: boolean, active: boolean) => (
    <span
      aria-hidden
      className={`mt-0.5 flex size-4 flex-none items-center justify-center rounded-full border text-[10px] ${
        done ? "border-gold bg-gold text-navy" : locked ? "border-transparent" : active ? "border-on-dark" : "border-line-input"
      }`}
    >
      {done ? "✓" : locked ? "🔒" : ""}
    </span>
  );

  return (
    <PageShell locale={locale} path={`/learn/course/${slug}`} current="activities">
      <section className="bg-navy">
        <div className="container-site flex flex-col gap-3 py-8 md:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link href={`/${locale}/learn`} className="text-sm font-semibold text-gold hover:text-on-dark">
              <span aria-hidden className="me-1 inline-block rtl:-scale-x-100">←</span>
              {t.myTitle}
            </Link>
            {learner && (
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="font-semibold text-on-dark">{st.hello.replace("{name}", learner.name)}</span>
                <Link href={`/${locale}/learn/profile`} className="text-on-dark-soft underline underline-offset-4 hover:text-gold">{st.profileLink}</Link>
                <Link href={`${here}?tab=people`} className="text-on-dark-soft underline underline-offset-4 hover:text-gold">{st.people}</Link>
              </span>
            )}
          </div>
          <h1 className="font-display text-h2 font-normal text-on-dark">{pick(course.title, locale)}</h1>
          <div className="flex max-w-[520px] flex-col gap-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
            </div>
            <p className="m-0 text-sm text-on-dark-muted">{t.progress.replace("{done}", nf.format(course.progress.done)).replace("{total}", nf.format(course.progress.total))}</p>
          </div>
        </div>
      </section>

      <section className="bg-sand">
        <div className="container-site grid gap-6 py-8 md:py-12 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
          {/* Course outline */}
          <nav aria-label={t.contents} className="flex flex-col gap-3 rounded-bov border border-line bg-white p-4 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-normal text-ink">{t.contents}</h2>
            <ol className="m-0 flex list-none flex-col gap-4 p-0">
              {course.modules.map((m) => (
                <li key={m.id} className="flex flex-col gap-1.5">
                  <p className="m-0 text-sm font-semibold text-ink">{pick(m.title, locale)}</p>
                  <ul className="m-0 flex list-none flex-col p-0">
                    {m.lessons.map((l) => {
                      const active = view === "lesson" && l.id === lesson?.id;
                      return (
                        <li key={l.id}>
                          <Link href={`${here}?lesson=${l.id}`} aria-current={active ? "page" : undefined} className={navLink(active)}>
                            {mark(l.done, l.locked, active)}
                            <span>
                              {pick(l.title, locale)}
                              {l.done && <span className="sr-only"> ({t.done})</span>}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                    {m.quiz && (
                      <li>
                        <Link href={`${here}?quiz=${m.id}`} aria-current={view === "quiz" && step?.id === m.id ? "page" : undefined} className={navLink(view === "quiz" && step?.id === m.id)}>
                          {mark(!!m.quiz.best?.passed, m.quiz.locked, view === "quiz" && step?.id === m.id)}
                          <span className="font-semibold">📝 {st.quizTitle}</span>
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ol>
          </nav>

          {/* Main panel */}
          <article className="flex min-w-0 flex-col gap-5 rounded-bov border border-line bg-white p-5 md:p-8">
            {view === "people" ? (
              <>
                <h2 className="font-display text-h3 font-normal text-ink">{st.people}</h2>
                <p className="m-0 text-ink-soft">{st.peopleLead}</p>
                {people.filter((p) => !p.me).length === 0 && <p className="m-0 rounded-bov bg-paper p-4 text-ink-soft">{st.peopleEmpty}</p>}
                <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2">
                  {people.map((p) => (
                    <li key={p.id}>
                      <Link href={`/${locale}/learn/people/${p.id}?from=${slug}`} className="flex h-full flex-col gap-1 rounded-bov border border-line p-4 hover:border-navy">
                        <span className="font-semibold text-ink">
                          {p.name} {p.me && <span className="font-normal text-ink-soft">{st.you}</span>}
                        </span>
                        {(p.job || p.org) && <span className="text-sm text-ink-soft">{[p.job, p.org].filter(Boolean).join(" · ")}</span>}
                        <span className="text-sm text-ink-soft">{countries.of(p.country) ?? p.country}</span>
                        {p.bio && <span className="text-sm text-ink">{p.bio}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : !step ? (
              <p className="m-0 text-ink-soft">{t.noContent}</p>
            ) : step.locked ? (
              <>
                <h2 className="font-display text-h3 font-normal text-ink">🔒 {step.kind === "quiz" ? st.quizTitle : pick(lesson?.title ?? { en: "", fr: "", ar: "" }, locale)}</h2>
                <p className="m-0 rounded-bov bg-paper p-4 text-ink">{step.kind === "quiz" ? st.quizLocked : lockedByQuiz ? st.lockedUnit : st.locked}</p>
              </>
            ) : view === "quiz" && unit?.quiz ? (
              <>
                <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">{pick(unit.title, locale)}</p>
                <h2 className="font-display text-h3 font-normal text-ink">📝 {st.quizTitle}</h2>
                <p className="m-0 text-ink-soft">{st.quizLead.replace("{mark}", nf.format(unit.quiz.passMark))}</p>
                {unit.quiz.best?.passed && (
                  <p className="m-0 rounded-bov bg-gold/20 p-3 font-semibold text-ink">
                    ✓ {st.passedBefore.replace("{score}", nf.format(unit.quiz.best.score)).replace("{total}", nf.format(unit.quiz.best.total))}
                  </p>
                )}
                {signedIn ? (
                  <QuizForm
                    key={unit.id}
                    moduleId={unit.id}
                    locale={locale}
                    nextHref={next ? hrefOf(next) : null}
                    questions={unit.quiz.questions.map((q) => ({ id: q.id, text: pick(q.text, locale), options: q.options.map((o) => ({ id: o.id, text: pick(o.text, locale) })) }))}
                    t={{ submit: st.submit, answerAll: st.answerAll, result: st.result, passed: st.passed, failed: st.failed, retry: st.retry, wrong: st.wrong, nextUnit: st.nextUnit, error: t.errors.generic }}
                  />
                ) : (
                  // Team preview: the questions only
                  <ol className="m-0 flex flex-col gap-3 ps-5">
                    {unit.quiz.questions.map((q) => (
                      <li key={q.id}>
                        <p className="m-0 font-semibold">{pick(q.text, locale)}</p>
                        <ul className="m-0 list-disc ps-5 text-ink-soft">
                          {q.options.map((o) => (
                            <li key={o.id}>{pick(o.text, locale)}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            ) : lesson ? (
              <>
                <p className="m-0 font-mono text-tag tracking-label text-blue uppercase rtl:font-sans rtl:tracking-normal">
                  {t.lessonOf.replace("{n}", nf.format(lessonNumber)).replace("{total}", nf.format(lessons.length))}
                  {lesson.minutes > 0 && ` · ${minutesFmt.format(lesson.minutes)}`}
                </p>
                <h2 className="font-display text-h3 font-normal text-ink">{pick(lesson.title, locale)}</h2>
                <LessonGate
                  key={lesson.id}
                  lessonId={lesson.id}
                  type={lesson.type}
                  title={pick(lesson.title, locale)}
                  videoUrl={lesson.videoUrl}
                  fileUrl={lesson.fileUrl}
                  linkUrl={lesson.linkUrl}
                  paragraphs={pick(lesson.body, locale).split(/\n+/).filter(Boolean)}
                  done={lesson.done}
                  waitSeconds={lesson.waitSeconds}
                  signedIn={signedIn}
                  nextHref={next ? hrefOf(next) : null}
                  locale={locale}
                  t={{
                    markDone: t.markDone,
                    done: t.done,
                    undo: t.undo,
                    error: t.errors.generic,
                    watchToEnd: st.watchToEnd,
                    readToEnd: st.readToEnd,
                    openFirst: st.openFirst,
                    openLinkFirst: st.openLinkFirst,
                    waitFor: st.waitFor,
                    openFile: t.openFile,
                    openLink: t.openLink,
                    noVideo: t.noVideo,
                    noContent: t.noContent,
                  }}
                />
              </>
            ) : null}

            {view !== "people" && step && (
              <div className="flex flex-wrap justify-between gap-2 border-t border-line pt-5">
                {prev ? (
                  <Link href={hrefOf(prev)} className="rounded-bov border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:border-navy">
                    {t.prev}
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link href={hrefOf(next)} className="rounded-bov bg-navy px-4 py-2.5 text-sm font-semibold text-on-dark hover:bg-navy-hover">
                    {next.kind === "quiz" ? st.quizTitle : t.next}
                  </Link>
                )}
              </div>
            )}
            {course.progress.total > 0 && course.progress.done === course.progress.total && (
              <p role="status" className="m-0 rounded-bov bg-gold/20 p-4 font-semibold text-ink">
                {t.allDone} {course.certificate && t.certificateSoon}
              </p>
            )}
          </article>
        </div>
      </section>
    </PageShell>
  );
}
