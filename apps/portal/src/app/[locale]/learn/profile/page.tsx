import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { isPublishedLocale } from "@/i18n/config";
import { getActivitiesContent } from "@/content/activities";
import { countryOptions } from "@/content/countries";
import { learnerGet, type Profile } from "@/lib/learn";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { ProfileForm } from "@/components/learn/ProfileForm";

/** The learner's own profile (owner, 2026-11-21): shown to the other participants of their courses. */
type Params = { params: Promise<{ locale: string }> };

export const metadata: Metadata = { robots: { index: false } };

export default async function ProfilePage({ params }: Params) {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) notFound();
  const res = await learnerGet<{ profile: Profile }>("/profile");
  if (!res.data) redirect(`/${locale}/learn/login?next=/${locale}/learn/profile`);
  const c = await getActivitiesContent(locale);
  const t = c.elearning.learn;
  return (
    <PageShell locale={locale} path="/learn/profile" current="activities">
      <PageHeader eyebrow={res.data.profile.name} title={t.study.profileTitle} lead={t.study.profileLead} />
      <section className="bg-sand">
        <div className="container-site py-12 md:py-20">
          <div className="mx-auto max-w-[640px]">
            <ProfileForm profile={res.data.profile} countries={countryOptions(locale)} t={t} />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
