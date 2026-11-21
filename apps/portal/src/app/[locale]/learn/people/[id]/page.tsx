import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isPublishedLocale } from "@/i18n/config";
import { getActivitiesContent } from "@/content/activities";
import { learnerGet, type Participant } from "@/lib/learn";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";

/**
 * A participant's profile (owner, 2026-11-21): visible to learners who share a course with them, and only if
 * they chose to show it. Never indexed.
 */
type Params = { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ from?: string }> };

export const metadata: Metadata = { robots: { index: false } };

export default async function PersonPage({ params, searchParams }: Params) {
  const { locale, id } = await params;
  if (!isPublishedLocale(locale) || !/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { from } = await searchParams;
  const res = await learnerGet<{ profile: Participant }>(`/people/${id}`);
  if (res.status === 401) redirect(`/${locale}/learn/login?next=/${locale}/learn/people/${id}`);
  if (!res.data) notFound();
  const p = res.data.profile;
  const st = (await getActivitiesContent(locale)).elearning.learn.study;
  const countries = new Intl.DisplayNames([locale], { type: "region" });
  const back = from && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(from) ? `/${locale}/learn/course/${from}?tab=people` : `/${locale}/learn`;

  return (
    <PageShell locale={locale} path={`/learn/people/${id}`} current="activities">
      <PageHeader eyebrow={st.people} title={p.name} lead={[p.job, p.org].filter(Boolean).join(" · ") || undefined} />
      <section className="bg-sand">
        <div className="container-site flex flex-col gap-6 py-12 md:py-20">
          <Link href={back} className="self-start text-sm font-semibold text-blue hover:text-navy">
            <span aria-hidden className="me-1 inline-block rtl:-scale-x-100">←</span>
            {st.personBack}
          </Link>
          <article className="flex max-w-[760px] flex-col gap-4 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-6 md:p-8">
            <p className="m-0 text-sm text-ink-soft">{countries.of(p.country) ?? p.country}</p>
            {p.bio &&
              p.bio
                .split(/\n+/)
                .filter(Boolean)
                .map((line, i) => (
                  <p key={i} className="m-0 leading-relaxed text-ink">{line}</p>
                ))}
            {p.me && (
              <Link href={`/${locale}/learn/profile`} className="self-start text-sm font-semibold text-blue underline underline-offset-4 hover:text-navy">
                {st.profileLink}
              </Link>
            )}
          </article>
        </div>
      </section>
    </PageShell>
  );
}
