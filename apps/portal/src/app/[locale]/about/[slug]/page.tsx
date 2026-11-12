import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPublishedLocale, publishedLocales, type Locale } from "@/i18n/config";
import { getAboutContent, type AboutContent } from "@/content/about";
import { getSiteContent, sectionTabs } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { NextPage } from "@/components/NextPage";
import { WhoWeAre } from "@/components/about/WhoWeAre";
import { Statement } from "@/components/about/Statement";
import { Goals } from "@/components/about/Goals";

/** About section: each dropdown item is its own page. Order = tab order. */
const slugs = ["who-we-are", "vision", "mission", "goals"] as const;
type Slug = (typeof slugs)[number];

type Params = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

const clip = (s: string, n = 158) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Title, description and body for one About page. */
function page(slug: Slug, c: AboutContent) {
  switch (slug) {
    case "who-we-are":
      return { title: c.header.title, lead: c.header.lead, description: c.meta.description, body: <WhoWeAre who={c.who} /> };
    case "vision":
      return { title: c.vision.eyebrow, description: clip(c.vision.text), body: <Statement text={c.vision.text} /> };
    case "mission":
      return { title: c.mission.eyebrow, description: clip(c.mission.text), body: <Statement text={c.mission.text} /> };
    case "goals":
      return {
        title: c.goals.title,
        description: clip(c.goals.items.map((g) => g.title).join(" · ")),
        body: <Goals goals={c.goals} />,
      };
  }
}

async function resolve(params: Params["params"]) {
  const { locale, slug } = await params;
  if (!isPublishedLocale(locale) || !(slugs as readonly string[]).includes(slug)) return null;
  return { locale: locale as Locale, slug: slug as Slug };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = await resolve(params);
  if (!r) return {};
  const p = page(r.slug, await getAboutContent(r.locale));
  return pageMetadata(r.locale, `/about/${r.slug}`, { title: p.title, description: p.description });
}

export default async function AboutSubPage({ params }: Params) {
  const r = await resolve(params);
  if (!r) notFound();
  const { locale, slug } = r;
  const c = await getAboutContent(locale);
  const site = await getSiteContent(locale);
  const p = page(slug, c);
  const path = `/about/${slug}`;
  const tabs = sectionTabs(site, locale, "about", path);
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;
  const sectionLabel = site.nav.find((n) => n.key === "about")?.label ?? c.header.eyebrow;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        url: `${siteUrl}/${locale}${path}`,
        name: p.title,
        description: p.description,
        inLanguage: locale,
        about: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel, item: `${siteUrl}/${locale}` },
          { "@type": "ListItem", position: 2, name: sectionLabel, item: `${siteUrl}/${locale}/about/${slugs[0]}` },
          { "@type": "ListItem", position: 3, name: p.title, item: `${siteUrl}/${locale}${path}` },
        ],
      },
    ],
  };

  return (
    <PageShell locale={locale} path={path} current="about">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow={c.header.eyebrow} title={p.title} lead={p.lead} tabs={tabs} tabsLabel={site.a11y.sectionNav} />
      {p.body}
      <NextPage tabs={tabs} label={site.next} />
    </PageShell>
  );
}
