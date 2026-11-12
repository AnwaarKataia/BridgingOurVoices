import type { Locale } from "@/i18n/config";
import { getSiteContent } from "@/content/site";
import { LanguageBar } from "./LanguageBar";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

type Props = {
  locale: Locale;
  /** Page path without locale: "" for home, "/about", ... */
  path: string;
  /** Nav key of this page, highlights it in the menu. */
  current: string;
  children: React.ReactNode;
};

/** Skip link + language bar + sticky header + <main> + footer, shared by every portal page. */
export async function PageShell({ locale, path, current, children }: Props) {
  const site = await getSiteContent(locale);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[60] focus:bg-gold focus:px-4 focus:py-2 focus:text-navy"
      >
        {site.a11y.skipToContent}
      </a>
      <LanguageBar locale={locale} path={path} site={site} />
      <SiteHeader locale={locale} current={current} site={site} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} current={current} site={site} />
    </>
  );
}
