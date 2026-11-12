import type { Locale } from "@/i18n/config";
import type { SiteContent } from "@/content/site";

/** "How we use and protect your data: privacy policy" line shown under forms that collect personal data. */
export function PrivacyNote({ locale, privacy }: { locale: Locale; privacy: SiteContent["privacy"] }) {
  return (
    <p className="m-0 text-[13px] text-ink-soft">
      {privacy.formNote}{" "}
      <a href={`/${locale}/privacy`} target="_blank" rel="noopener" className="font-semibold text-blue underline underline-offset-4 hover:text-navy">
        {privacy.formLink}
      </a>
    </p>
  );
}
