import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPublishedLocale, publishedLocales, type Locale } from "@/i18n/config";
import { getNetworkContent, type NetworkContent } from "@/content/network";
import { countryOptions } from "@/content/countries";
import { getSiteContent, sectionTabs, type SiteContent } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { NextPage } from "@/components/NextPage";
import { Membership } from "@/components/network/Membership";
import { JoinForm } from "@/components/network/JoinForm";
import { Members } from "@/components/network/Members";

/** Network section: each dropdown item is its own page. Order = tab order. */
const slugs = ["membership", "join", "members"] as const;
type Slug = (typeof slugs)[number];

type Params = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

/** Title, lead, meta and body for one Network page. */
function page(slug: Slug, c: NetworkContent, locale: Locale, site: SiteContent) {
  switch (slug) {
    case "membership":
      return { title: c.membership.title, lead: c.header.lead, meta: c.membership.meta, body: <Membership membership={c.membership} /> };
    case "join":
      return {
        title: c.join.title,
        lead: c.join.lead,
        meta: c.join.meta,
        body: (
          <section>
            <div className="container-site py-12 md:py-20">
              <div className="max-w-[920px]">
                <JoinForm locale={locale} join={c.join} countries={countryOptions(locale)} privacy={site.privacy} />
              </div>
            </div>
          </section>
        ),
      };
    case "members":
      return {
        title: c.members.title,
        lead: c.header.lead,
        meta: c.members.meta,
        body: <Members members={c.members} joinHref={`/${locale}/network/join`} />,
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
  const p = page(r.slug, await getNetworkContent(r.locale), r.locale, await getSiteContent(r.locale));
  return pageMetadata(r.locale, `/network/${r.slug}`, p.meta);
}

export default async function NetworkSubPage({ params }: Params) {
  const r = await resolve(params);
  if (!r) notFound();
  const { locale, slug } = r;
  const c = await getNetworkContent(locale);
  const site = await getSiteContent(locale);
  const p = page(slug, c, locale, site);
  const path = `/network/${slug}`;
  const pageUrl = `${siteUrl}/${locale}${path}`;
  const tabs = sectionTabs(site, locale, "network", path);
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;

  const graph: object[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: homeLabel, item: `${siteUrl}/${locale}` },
        { "@type": "ListItem", position: 2, name: c.header.eyebrow, item: `${siteUrl}/${locale}/network/${slugs[0]}` },
        { "@type": "ListItem", position: 3, name: p.meta.title, item: pageUrl },
      ],
    },
  ];
  if (slug === "members") {
    for (const m of c.members.people) {
      graph.push({
        "@type": "Person",
        name: m.name,
        jobTitle: m.role,
        ...(m.image ? { image: `${siteUrl}${m.image}` } : {}),
        worksFor: { "@id": `${siteUrl}/#organization` },
      });
    }
  }

  return (
    <PageShell locale={locale} path={path} current="network">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }} />
      <PageHeader eyebrow={c.header.eyebrow} title={p.title} lead={p.lead} tabs={tabs} tabsLabel={site.a11y.sectionNav} />
      {p.body}
      <NextPage tabs={tabs} label={site.next} />
    </PageShell>
  );
}
