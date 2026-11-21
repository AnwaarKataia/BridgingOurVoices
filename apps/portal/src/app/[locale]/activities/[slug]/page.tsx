import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPublishedLocale, publishedLocales, type Locale } from "@/i18n/config";
import { getActivitiesContent, type ActivitiesContent } from "@/content/activities";
import { getSiteContent, sectionTabs } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { NextPage } from "@/components/NextPage";
import { Training } from "@/components/activities/Training";
import { Seminars } from "@/components/activities/Seminars";
import { Conferences } from "@/components/activities/Conferences";
import { Fellowship } from "@/components/activities/Fellowship";
import { News } from "@/components/activities/News";
import { ELearning } from "@/components/activities/ELearning";
import { ComingSoon } from "@/components/ComingSoon";
import { hiddenSections } from "@/lib/preview";

/** Activities section: each dropdown item is its own page. Order = tab order. */
const slugs = ["training", "seminars", "conferences", "fellowship", "e-learning"] as const;
type Slug = (typeof slugs)[number];

type Params = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

const clip = (s: string, n = 158) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Title, lead, description and body for one Activities page. */
function page(slug: Slug, c: ActivitiesContent, locale: Locale) {
  switch (slug) {
    case "training":
      return {
        title: c.training.title,
        lead: c.header.lead,
        description: clip(c.course.body),
        body: (
          <>
            <Training course={c.course} flagship={c.flagship} tracks={c.tracks} ctaHref={`/${locale}/activities/e-learning`} newsHref={`/${locale}/activities/seminars#training-launch`} />
            <News news={c.news} items={c.news.items.filter((n) => n.href === "/activities/training")} />
          </>
        ),
      };
    case "seminars":
      return { title: c.seminars.title, lead: c.seminars.lead, description: clip(c.seminars.lead), body: <Seminars seminars={c.seminars} registerHref={`/${locale}/agenda`} /> };
    case "conferences":
      return {
        title: c.conferences.title,
        lead: c.conferences.lead,
        description: clip(c.conferences.lead),
        body: <Conferences conferences={c.conferences} />,
      };
    case "fellowship":
      return {
        title: c.fellowship.title,
        lead: c.fellowship.lead,
        description: clip(c.fellowship.lead),
        body: <Fellowship fellowship={c.fellowship} applyHref={`/${locale}/network/membership#apply`} />,
      };
    case "e-learning":
      return {
        title: c.elearning.title,
        lead: c.elearning.lead,
        description: clip(c.elearning.lead),
        body: <ELearning e={c.elearning} locale={locale} />,
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
  const p = page(r.slug, await getActivitiesContent(r.locale), r.locale);
  return pageMetadata(r.locale, `/activities/${r.slug}`, { title: p.title, description: p.description });
}

export default async function ActivitiesSubPage({ params }: Params) {
  const r = await resolve(params);
  if (!r) notFound();
  const { locale, slug } = r;
  const c = await getActivitiesContent(locale);
  const site = await getSiteContent(locale);
  const p = page(slug, c, locale);
  // Undecided sections show "Coming soon" to the public (switched on in the dashboard; visible in preview)
  const hidden = await hiddenSections();
  const isHidden = (slug === "seminars" || slug === "conferences" || slug === "fellowship") && hidden[slug];
  // Seminars already held (news items that belong to the Seminars page), shown even while the section is hidden
  const heldSeminars = c.news.items.filter((n) => n.href === "/activities/seminars");
  const path = `/activities/${slug}`;
  const pageUrl = `${siteUrl}/${locale}${path}`;
  const tabs = sectionTabs(site, locale, "activities", path);
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;

  const graph: object[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: homeLabel, item: `${siteUrl}/${locale}` },
        { "@type": "ListItem", position: 2, name: c.header.eyebrow, item: `${siteUrl}/${locale}/activities/${slugs[0]}` },
        { "@type": "ListItem", position: 3, name: p.title, item: pageUrl },
      ],
    },
  ];
  if (slug === "training") {
    graph.push({
      "@type": "Course",
      name: c.course.title,
      description: c.course.body,
      inLanguage: "ar",
      isAccessibleForFree: true,
      url: `${pageUrl}#course`,
      provider: { "@id": `${siteUrl}/#organization` },
      hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "P1M" },
    });
  }

  return (
    <PageShell locale={locale} path={path} current="activities">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }} />
      <PageHeader eyebrow={c.header.eyebrow} title={p.title} lead={p.lead} tabs={tabs} tabsLabel={site.a11y.sectionNav} />
      {slug === "seminars" && heldSeminars.length > 0 && (
        <News news={c.news} items={heldSeminars} heading={{ title: c.seminars.heldTitle, lead: c.seminars.heldLead }} />
      )}
      {isHidden ? (
        slug === "seminars" && heldSeminars.length > 0 ? (
          <p className="container-site m-0 pb-12 text-center text-lead text-ink-soft md:pb-20">{c.seminars.moreSoon}</p>
        ) : (
          <ComingSoon title={c.soon.title} body={c.soon.body} cta={c.soon.cta} href={`/${locale}#latest-news`} />
        )
      ) : (
        p.body
      )}
      <NextPage tabs={tabs} label={site.next} />
    </PageShell>
  );
}
