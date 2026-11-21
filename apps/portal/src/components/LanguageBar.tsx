import Link from "next/link";
import { locales, localeLabels, publishedLocales, type Locale } from "@/i18n/config";
import type { SiteContent } from "@/content/site";
import { AccountLink } from "./AccountLink";

type Props = { locale: Locale; path: string; site: SiteContent };

/**
 * Thin bar above the main header (scrolls away; only the main header is sticky).
 * At its start: the sign-in link (2026-11-21). At its end: a language icon and the EN · FR · AR switcher.
 * The project name is not translated, so it is not repeated here.
 */
export function LanguageBar({ locale, path, site }: Props) {
  return (
    <div className="border-b border-navy-line/40 bg-navy-deep">
      <div className="container-site flex h-10 items-center justify-between gap-3">
        <AccountLink locale={locale} signIn={site.account.signIn} />
        <div role="group" aria-label={site.a11y.language} className="flex items-center gap-1.5">
          <svg aria-hidden viewBox="0 0 24 24" className="size-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z" />
          </svg>
          {locales.map((l) => {
            const published = publishedLocales.includes(l);
            const active = l === locale;
            const cls = `flex h-7 items-center rounded-bov px-2 text-label font-semibold ${
              active ? "bg-gold text-navy" : published ? "text-on-dark-soft hover:text-on-dark" : "cursor-not-allowed text-on-dark-faint"
            }`;
            return published ? (
              <Link key={l} href={`/${l}${path}`} hrefLang={l} lang={l} aria-current={active ? "true" : undefined} className={cls}>
                {localeLabels[l]}
              </Link>
            ) : (
              <span key={l} title={site.comingSoon} aria-disabled="true" className={cls}>
                {localeLabels[l]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
