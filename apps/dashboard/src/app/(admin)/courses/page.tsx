import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { NewCourseButtons } from "@/components/courses/NewCourseButtons";

export const metadata: Metadata = { title: "E-learning" };

type I18n = { en: string; fr: string; ar: string };
type Item = {
  id: string;
  slug: string;
  kind: "course" | "webinar";
  status: "draft" | "published";
  title: I18n;
  image: string;
  updatedAt: string;
  modules: number;
  lessons: number;
  registrations: number;
};

/** E-learning (owner, 2026-11-21): every course and webinar, drafts included. */
export default async function CoursesPage() {
  const [{ lang, t }, { data, status }] = await Promise.all([getDict(), apiGet<{ items: Item[] }>("/admin/courses")]);
  const c = t.courses;
  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB");
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const title = (x: I18n) => (lang === "ar" ? x.ar || x.en || x.fr : x.en || x.ar || x.fr) || c.untitled;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{c.nav}</p>
        <h1 className="font-display text-h2 font-normal">{c.title}</h1>
        <p className="mt-2 max-w-[720px] text-ink-soft">{c.lead}</p>
      </div>

      <NewCourseButtons t={{ newCourse: c.newCourse, newWebinar: c.newWebinar, creating: c.creating, error: t.error }} />

      {!data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>
      ) : data.items.length === 0 ? (
        <p className="rounded-bov border border-line bg-white p-6 text-ink-soft">{c.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
          {data.items.map((item) => (
            <li key={item.id}>
              <Link href={`/courses/${item.id}`} className="grid gap-x-4 gap-y-1 p-4 hover:bg-sand/50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-xs font-semibold text-gold-deep">{c.kinds[item.kind]}</span>
                  <span className="font-semibold text-ink" dir="auto">{title(item.title)}</span>
                  <span className="text-sm text-ink-soft">
                    {c.counts.replace("{m}", nf.format(item.modules)).replace("{l}", nf.format(item.lessons)).replace("{r}", nf.format(item.registrations))}
                    {" · "}
                    {fmt.format(new Date(item.updatedAt))}
                  </span>
                </span>
                <span
                  className={`justify-self-start rounded-bov px-2 py-0.5 text-xs font-semibold sm:justify-self-end ${
                    item.status === "published" ? "bg-gold text-navy" : "bg-sand text-ink-soft"
                  }`}
                >
                  {c.status[item.status]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
