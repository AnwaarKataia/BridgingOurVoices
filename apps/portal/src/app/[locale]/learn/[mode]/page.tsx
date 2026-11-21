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
import { LearnerForgotForm, LearnerResetForm } from "@/components/learn/LearnerRecovery";

/**
 * Learner account pages, e-learning phase 2 (2026-11-21): sign-up (/learn/signup), sign-in (/learn/login),
 * forgot password (/learn/forgot) and the new password from the emailed link (/learn/reset?token=…).
 */
type Params = { params: Promise<{ locale: string; mode: string }>; searchParams: Promise<{ next?: string; token?: string }> };

const MODES = ["signup", "login", "forgot", "reset"] as const;
/** Only paths on this site after signing in. */
const safeNext = (locale: Locale, next?: string) => (next && /^\/(en|fr|ar)(\/[\w\-/]*)?$/.test(next) ? next : `/${locale}/learn`);

// Not indexed; the reset page sends no referrer so the token in its address never leaks
export const metadata: Metadata = { robots: { index: false }, referrer: "no-referrer" };

export default async function LearnerAuthPage({ params, searchParams }: Params) {
  const { locale, mode } = await params;
  if (!isPublishedLocale(locale) || !(MODES as readonly string[]).includes(mode)) notFound();
  const { next: rawNext, token = "" } = await searchParams;
  const next = safeNext(locale, rawNext);
  const [c, site] = await Promise.all([getActivitiesContent(locale), getSiteContent(locale)]);
  const t = c.elearning.learn;
  const signup = mode === "signup";

  if (mode === "forgot" || mode === "reset") {
    const forgot = mode === "forgot";
    const validToken = /^[\w-]{20,200}$/.test(token);
    return (
      <PageShell locale={locale} path={`/learn/${mode}`} current="activities">
        <PageHeader
          eyebrow={c.elearning.eyebrow}
          title={forgot ? t.forgot.title : t.forgot.resetTitle}
          lead={forgot ? t.forgot.lead : validToken ? t.forgot.resetLead : t.forgot.expired}
        />
        <section className="bg-sand">
          <div className="container-site py-12 md:py-20">
            <div className="mx-auto flex max-w-[560px] flex-col gap-4">
              {forgot ? (
                <LearnerForgotForm locale={locale} t={t} />
              ) : validToken ? (
                <LearnerResetForm locale={locale} token={token} t={t} />
              ) : null}
              <Link href={`/${locale}/learn/${forgot || validToken ? "login" : "forgot"}`} className="self-start text-sm font-semibold text-blue hover:text-navy">
                {forgot || validToken ? t.forgot.back : t.forgot.newLink}
              </Link>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

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
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-2">
              <Link href={other} className="text-sm font-semibold text-blue hover:text-navy">
                {signup ? t.haveAccount : t.noAccount}
              </Link>
              {!signup && (
                <Link href={`/${locale}/learn/forgot`} className="text-sm font-semibold text-blue hover:text-navy">
                  {t.forgot.link}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
