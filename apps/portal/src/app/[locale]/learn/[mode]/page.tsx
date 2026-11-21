import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPublishedLocale, type Locale } from "@/i18n/config";
import { getActivitiesContent } from "@/content/activities";
import { getSiteContent } from "@/content/site";
import { countryOptions } from "@/content/countries";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { LearnerAuthForm } from "@/components/learn/LearnerAuthForm";

/** Learner sign-up (/learn/signup) and sign-in (/learn/login), e-learning phase 2 (2026-11-21). */
type Params = { params: Promise<{ locale: string; mode: string }>; searchParams: Promise<{ next?: string }> };

const MODES = ["signup", "login"] as const;
/** Only paths on this site after signing in. */
const safeNext = (locale: Locale, next?: string) => (next && /^\/(en|fr|ar)(\/[\w\-/]*)?$/.test(next) ? next : `/${locale}/learn`);

export const metadata: Metadata = { robots: { index: false } };

export default async function LearnerAuthPage({ params, searchParams }: Params) {
  const { locale, mode } = await params;
  if (!isPublishedLocale(locale) || !(MODES as readonly string[]).includes(mode)) notFound();
  const { next: rawNext } = await searchParams;
  const next = safeNext(locale, rawNext);
  const [c, site] = await Promise.all([getActivitiesContent(locale), getSiteContent(locale)]);
  const t = c.elearning.learn;
  const signup = mode === "signup";
  const other = `/${locale}/learn/${signup ? "login" : "signup"}?next=${encodeURIComponent(next)}`;

  return (
    <PageShell locale={locale} path={`/learn/${mode}`} current="activities">
      <PageHeader eyebrow={c.elearning.eyebrow} title={signup ? t.signupTitle : t.loginTitle} lead={signup ? t.signupLead : t.loginLead} />
      <section className="bg-sand">
        <div className="container-site py-12 md:py-20">
          <div className="mx-auto flex max-w-[560px] flex-col gap-4">
            <LearnerAuthForm
              mode={signup ? "signup" : "login"}
              locale={locale}
              next={next}
              t={t}
              countries={countryOptions(locale)}
              privacy={site.privacy}
              forms={site.forms}
            />
            <Link href={other} className="self-start text-sm font-semibold text-blue hover:text-navy">
              {signup ? t.haveAccount : t.noAccount}
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
