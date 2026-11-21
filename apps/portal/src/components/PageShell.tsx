import type { Locale } from "@/i18n/config";
import { getSiteContent } from "@/content/site";
import { LanguageBar } from "./LanguageBar";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { isPreview } from "@/lib/preview";

/** Team-only notice while preview is on (not part of the public site, so it isn't in the content files). */
const previewText = {
  en: { note: "Preview: you also see hidden sections and drafts. Visitors don’t.", exit: "Exit preview" },
  fr: { note: "Aperçu : vous voyez aussi les sections masquées et les brouillons. Pas les visiteurs.", exit: "Quitter l’aperçu" },
  ar: { note: "معاينة: ترى/ين الأقسام المخفية والمسودات أيضًا، والزوار لا يرونها.", exit: "إنهاء المعاينة" },
} as const;

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
  const preview = await isPreview();
  const pt = previewText[locale];

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
      {preview && (
        <div role="status" className="sticky bottom-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-gold px-4 py-2.5 text-center text-sm font-semibold text-navy">
          <span>{pt.note}</span>
          <a href={`/api/preview?exit=1&to=/${locale}${path}`} className="underline underline-offset-4 hover:text-navy-hover">{pt.exit}</a>
        </div>
      )}
    </>
  );
}
