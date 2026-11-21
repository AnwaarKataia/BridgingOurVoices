import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dir, isPublishedLocale } from "@/i18n/config";
import { dateLocale, eventHref, getAgendaContent } from "@/content/agenda";
import { eventItems, getEvents } from "@/lib/events";
import { pick } from "@/lib/courses";
import { getSiteContent } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { Calendar } from "@/components/agenda/Calendar";
import { Upcoming } from "@/components/agenda/Upcoming";
import { Observances } from "@/components/agenda/Observances";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) return {};
  return pageMetadata(locale, "/agenda", (await getAgendaContent(locale)).meta);
}

export default async function AgendaPage({ params }: Params) {
  const { locale } = await params;
  if (!isPublishedLocale(locale)) notFound();
  const [a, site, events] = await Promise.all([getAgendaContent(locale), getSiteContent(locale), getEvents()]);
  const items = eventItems(events, locale);
  const loc = dateLocale(locale);
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;
  const pageUrl = `${siteUrl}/${locale}/agenda`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...events
        .filter((e) => e.status === "published" && e.tone !== "deadline")
        .map((e) => ({
          "@type": e.dates.length > 1 ? "EventSeries" : "Event",
          name: pick(e.title, locale),
          startDate: e.dates[0],
          inLanguage: locale,
          location: { "@type": "Place", name: pick(e.place, locale) },
          organizer: { "@id": `${siteUrl}/#organization` },
          url: `${siteUrl}${eventHref(locale, e.slug)}`,
        })),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel, item: `${siteUrl}/${locale}` },
          { "@type": "ListItem", position: 2, name: a.meta.title, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <PageShell locale={locale} path="/agenda" current="agenda">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow={a.header.eyebrow} title={a.header.title} lead={a.header.lead} />
      <section id="calendar" aria-label={a.header.title}>
        <div className="container-site pt-12 md:pt-[72px]">
          <Calendar
            loc={loc}
            rtl={dir(locale) === "rtl"}
            labels={a.calendar}
            items={items}
            observances={a.observances.items}
            observanceKind={a.observances.kind}
            initialIso={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </section>
      <Upcoming title={a.upcomingTitle} items={items} loc={loc} />
      <Observances o={a.observances} loc={loc} />
    </PageShell>
  );
}
