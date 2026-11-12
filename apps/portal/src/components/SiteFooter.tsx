import Image from "next/image";
import type { Locale } from "@/i18n/config";
import { localizeHref, type SiteContent } from "@/content/site";
import { NewsletterForm } from "./NewsletterForm";

type Props = { locale: Locale; current: string; site: SiteContent };

export function SiteFooter({ locale, current, site }: Props) {
  const { footer } = site;
  const nav = site.nav.filter((item) => !(item.key === "home" && current === "home"));

  return (
    <footer id="contact" className="bg-navy-deep text-on-dark-muted">
      <div className="bg-rule h-1" />
      <div className="container-site grid gap-10 pt-12 pb-10 md:grid-cols-3">
        <div>
          <Image src="/logo-dark.jpg" alt={site.brandName} width={103} height={96} className="mb-5 h-24 w-[103px] object-cover" />
          <p className="max-w-[260px] font-display text-h4 leading-snug text-on-dark">{footer.tagline}</p>
        </div>

        <nav aria-label={site.a11y.footerNav}>
          <ul className="flex flex-col gap-2">
            {nav.map((item) => (
              <li key={item.key}>
                <a href={localizeHref(locale, item.href)} className="text-sm text-on-dark-soft hover:text-gold">{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-[15px] font-semibold text-on-dark">{footer.newsletter}</h2>
          <NewsletterForm
            placeholder={footer.emailPlaceholder}
            label={footer.subscribe}
            messages={{ done: footer.subscribed, error: footer.error }}
          />
        </div>
      </div>
      <div className="container-site flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-5 pb-8 text-label text-on-dark-faint">
        <p>{footer.copyright}</p>
        <a href={localizeHref(locale, "/privacy")} aria-current={current === "privacy" ? "page" : undefined} className="hover:text-gold">
          {site.privacy.label}
        </a>
      </div>
    </footer>
  );
}
