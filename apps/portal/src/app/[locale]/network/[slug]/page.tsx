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
import { MembershipForm } from "@/components/network/MembershipForm";
import { PublishedVoices } from "@/components/network/PublishedVoices";
import { PublishedMembers } from "@/components/network/PublishedMembers";
import { getPublishedMembers, getPublishedVoices, type PublishedMember, type PublishedVoice } from "@/lib/published";
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
type Published = { voices: PublishedVoice[]; members: PublishedMember[] };

function page(slug: Slug, c: NetworkContent, locale: Locale, site: SiteContent, pub: Published = { voices: [], members: [] }) {
  switch (slug) {
    case "membership":
      // Owner, 2026-11-14: the membership application form sits under the three cards. It is NOT the
      // "Add your voice to ours" form (that one stays on the Join page) and doesn't use its title.
      return {
        title: c.membership.title,
        lead: c.header.lead,
        meta: c.membership.meta,
        body: (
          <>
            <Membership membership={c.membership} />
            <section id="apply" aria-labelledby="apply-title" className="bg-sand">
              <div className="container-site flex flex-col gap-6 py-12 md:py-20">
                <div className="flex max-w-[760px] flex-col gap-2.5">
                  <h2 id="apply-title" className="font-display text-h2 font-normal text-ink">{c.membership.form.title}</h2>
                  <p className="text-body text-ink-soft">{c.membership.form.lead}</p>
                </div>
                <div className="max-w-[920px]">
                  <MembershipForm locale={locale} join={c.join} form={c.membership.form} countries={countryOptions(locale)} privacy={site.privacy} forms={site.forms} />
                </div>
              </div>
            </section>
          </>
        ),
      };
    case "join":
      return {
        title: c.join.title,
        lead: c.join.lead,
        meta: c.join.meta,
        body: (
          <>
            <section>
              <div className="container-site py-12 md:py-20">
                <div className="max-w-[920px]">
                  <JoinForm locale={locale} join={c.join} countries={countryOptions(locale)} privacy={site.privacy} forms={site.forms} />
                </div>
              </div>
            </section>
            {/* Statements published from the dashboard */}
            <PublishedVoices voices={pub.voices} title={c.join.voicesTitle} readArticle={c.join.readArticle} locale={locale} />
          </>
        ),
      };
    case "members":
      return {
        title: c.members.title,
        lead: c.header.lead,
        meta: c.members.meta,
        body: (
          <Members
            members={c.members}
            joinHref={`/${locale}/network/join`}
            published={<PublishedMembers members={pub.members} title={c.members.networkMembersTitle} locale={locale} />}
          />
        ),
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
  // Published submissions, only on the pages that show them
  const pub: Published = {
    voices: slug === "join" ? await getPublishedVoices() : [],
    members: slug === "members" ? await getPublishedMembers() : [],
  };
  const p = page(slug, c, locale, site, pub);
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
