import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPublishedLocale } from "@/i18n/config";
import { contactEmail, getContactContent, socialLinks } from "@/content/contact";
import { getSiteContent } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  return pageMetadata(locale, "/contact", (await getContactContent(locale)).meta);
}

export default async function ContactPage({ params }: Params) {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) notFound();
  const c = await getContactContent(locale);
  const site = await getSiteContent(locale);
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;
  const pageUrl = `${siteUrl}/${locale}/contact`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        url: pageUrl,
        name: c.meta.title,
        inLanguage: locale,
        about: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "NGO",
        "@id": `${siteUrl}/#organization`,
        name: site.brandName,
        email: contactEmail,
        sameAs: socialLinks.map((s) => s.href),
        contactPoint: { "@type": "ContactPoint", contactType: "general enquiries", email: contactEmail, availableLanguage: ["English", "French", "Arabic"] },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel, item: `${siteUrl}/${locale}` },
          { "@type": "ListItem", position: 2, name: c.meta.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <PageShell locale={locale} path="/contact" current="contact">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow={c.header.eyebrow} title={c.header.title} lead={c.header.lead} />
      <section>
        <div className="container-site grid gap-x-[72px] gap-y-12 pt-12 pb-16 md:pt-[72px] md:pb-24 lg:grid-cols-[1.35fr_1fr]">
          <ContactForm locale={locale} form={c.form} privacy={site.privacy} />
          <ContactInfo info={c.info} />
        </div>
      </section>
    </PageShell>
  );
}
