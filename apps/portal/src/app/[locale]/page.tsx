import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPublishedLocale } from "@/i18n/config";
import { getHomeContent } from "@/content/home";
import { getSiteContent } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteName, siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { Hero } from "@/components/home/Hero";
import { Ticker } from "@/components/home/Ticker";
import { Announcement } from "@/components/home/Announcement";
import { Vision } from "@/components/home/Vision";
import { Pathway } from "@/components/home/Pathway";
import { Activities } from "@/components/home/Activities";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  return pageMetadata(locale, "", (await getHomeContent(locale)).meta, { absoluteTitle: true });
}

export default async function HomePage({ params }: Params) {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) notFound();
  const c = await getHomeContent(locale);
  const { brandName } = await getSiteContent(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NGO",
        "@id": `${siteUrl}/#organization`,
        name: siteName,
        alternateName: ["BOV", "أصواتنا جسور", "Women's Platform for Dialogue and Peacebuilding"],
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        description: c.meta.description,
        areaServed: ["Arab region", "Africa"],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/${locale}`,
        name: brandName,
        inLanguage: locale,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <PageShell locale={locale} path="" current="home">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero hero={c.hero} activitiesHref={`/${locale}/activities/training`} contactHref={`/${locale}/contact`} />
      <Ticker ticker={c.ticker} />
      <Announcement a={c.announcement} detailsHref={`/${locale}/activities/training#course`} />
      <Vision vision={c.vision} aboutHref={`/${locale}/about/who-we-are`} />
      <Pathway pathway={c.pathway} />
      <Activities locale={locale} activities={c.activities} />
    </PageShell>
  );
}
