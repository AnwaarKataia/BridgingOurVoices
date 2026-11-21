import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";

export const metadata: Metadata = { title: "Participant" };

type I18n = { en: string; fr: string; ar: string };
type Data = {
  learner: {
    id: string;
    name: string;
    email: string;
    country: string;
    locale: string;
    job: string;
    org: string;
    bio: string;
    showProfile: boolean;
    hasPhoto: boolean;
    createdAt: string;
    lastLoginAt: string | null;
  };
  courses: {
    courseId: string;
    title: I18n;
    status: "new" | "accepted" | "rejected";
    joinedAt: string;
    progress: { done: number; total: number };
    units: {
      title: I18n;
      lessonsDone: number;
      lessons: number;
      quiz: { passMark: number; attempts: number; passed: boolean; best: { score: number; total: number } | null } | null;
    }[];
  }[];
};

/** One e-learning participant (owner, 2026-11-21): profile, courses, progress and quiz results. */
export default async function LearnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [{ lang, t }, { data, status }] = await Promise.all([getDict(), apiGet<Data>(`/admin/learners/${id}`)]);
  if (status === 404) notFound();
  const L = t.learner;
  const intl = lang === "ar" ? "ar-EG" : "en-GB";
  const nf = new Intl.NumberFormat(intl);
  const fmt = new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric" });
  const countries = new Intl.DisplayNames([lang], { type: "region" });
  const title = (x: I18n) => (lang === "ar" ? x.ar || x.en || x.fr : x.en || x.ar || x.fr);

  if (!data) return <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>;
  const l = data.learner;
  const rows: [string, string][] = [
    [L.email, l.email],
    [L.country, countries.of(l.country) ?? l.country],
    [L.job, l.job || L.empty],
    [L.org, l.org || L.empty],
    [L.joinedSite, fmt.format(new Date(l.createdAt))],
    [L.lastLogin, l.lastLoginAt ? fmt.format(new Date(l.lastLoginAt)) : L.empty],
  ];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/registrations?type=course" className="self-start text-sm font-semibold text-blue hover:text-navy">
        {lang === "ar" ? "→" : "←"} {L.back}
      </Link>
      <div className="flex flex-wrap items-center gap-5">
        <span className="relative flex size-24 flex-none items-center justify-center overflow-hidden rounded-full border-[1.6px] border-gold bg-navy font-display text-2xl text-on-dark">
          {l.hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element -- private photo through the dashboard's /api proxy
            <img src={`/api/admin/learners/${l.id}/photo`} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            l.name.slice(0, 1).toUpperCase()
          )}
        </span>
        <div>
          <p className="eyebrow mb-2 text-gold-deep">{L.title}</p>
          <h1 className="font-display text-h2 font-normal" dir="auto">{l.name}</h1>
          <p className={`mt-1 text-sm font-semibold ${l.showProfile ? "text-blue-deep" : "text-ink-soft"}`}>{l.showProfile ? L.visible : L.hidden}</p>
        </div>
      </div>

      <dl className="m-0 grid gap-px overflow-hidden rounded-bov border border-line bg-line sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 bg-white p-4">
            <dt className="text-xs font-semibold text-ink-soft">{k}</dt>
            <dd className="m-0 text-[15px] text-ink" dir="auto">{k === L.email ? <a href={`mailto:${v}`} className="text-blue hover:text-navy">{v}</a> : v}</dd>
          </div>
        ))}
        <div className="flex flex-col gap-1 bg-white p-4 sm:col-span-2">
          <dt className="text-xs font-semibold text-ink-soft">{L.bio}</dt>
          <dd className="m-0 whitespace-pre-line text-[15px] leading-relaxed text-ink" dir="auto">{l.bio || L.empty}</dd>
        </div>
      </dl>

      <section className="flex flex-col gap-4" aria-labelledby="learner-courses">
        <h2 id="learner-courses" className="font-display text-h3 font-normal">{L.courses}</h2>
        {data.courses.map((c) => {
          const pct = c.progress.total ? Math.round((c.progress.done / c.progress.total) * 100) : 0;
          return (
            <article key={c.courseId} className="flex flex-col gap-3 rounded-bov border border-line bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/courses/${c.courseId}`} className="font-display text-lg hover:text-blue" dir="auto">{title(c.title)}</Link>
                <span className={`rounded-bov px-2 py-0.5 text-xs font-semibold ${c.status === "rejected" ? "bg-danger/10 text-danger" : "bg-sand text-ink-soft"}`}>{t.courses.regStatus[c.status]}</span>
              </div>
              <p className="m-0 text-sm text-ink-soft">{L.joined} {fmt.format(new Date(c.joinedAt))}</p>
              <div className="flex items-center gap-3">
                <span className="h-2 w-40 overflow-hidden rounded-full bg-sand" aria-hidden>
                  <span className="block h-full bg-gold" style={{ width: `${pct}%` }} />
                </span>
                <span className="text-sm text-ink">{L.progress.replace("{done}", nf.format(c.progress.done)).replace("{total}", nf.format(c.progress.total))}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-line text-start text-xs text-ink-soft">
                      <th className="py-2 text-start font-semibold">{L.unit}</th>
                      <th className="py-2 text-start font-semibold">{L.lessons}</th>
                      <th className="py-2 text-start font-semibold">{L.quiz}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.units.map((u, i) => (
                      <tr key={i} className="border-b border-line last:border-0">
                        <td className="py-2 pe-3" dir="auto">{title(u.title)}</td>
                        <td className="py-2 pe-3">{nf.format(u.lessonsDone)} / {nf.format(u.lessons)}</td>
                        <td className="py-2">
                          {u.quiz ? (
                            <span className="flex flex-wrap gap-x-3 gap-y-1">
                              <span className={`font-semibold ${u.quiz.passed ? "text-blue-deep" : "text-gold-deep"}`}>{u.quiz.passed ? L.passed : L.notPassed}</span>
                              {u.quiz.best && <span>{L.best.replace("{score}", nf.format(u.quiz.best.score)).replace("{total}", nf.format(u.quiz.best.total))}</span>}
                              <span className="text-ink-soft">{L.attempts.replace("{n}", nf.format(u.quiz.attempts))}</span>
                            </span>
                          ) : (
                            <span className="text-ink-soft">{L.noQuiz}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
