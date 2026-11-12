import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dir, isPublishedLocale } from "@/i18n/config";
import { agendaItems, dateLocale, eventHref, eventIsos, eventSlugs, getAgendaContent } from "@/content/agenda";
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
  const a = await getAgendaContent(locale);
  const site = await getSiteContent(locale);
  const loc = dateLocale(locale);
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;
  const pageUrl = `${siteUrl}/${locale}/agenda`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...a.events.map((e, i) => ({
        "@type": "Event",
        name: e.title,
        startDate: eventIsos[i],
        inLanguage: locale,
        location: { "@type": "Place", name: e.place },
        organizer: { "@id": `${siteUrl}/#organization` },
        url: `${siteUrl}${eventHref(locale, eventSlugs[i])}`,
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
            items={agendaItems(a, locale)}
            observances={a.observances.items}
            observanceKind={a.observances.kind}
            initialIso={new Date().toISOString().slice(0, 10)}
          />
        </div>
      </section>
      <Upcoming a={a} loc={loc} locale={locale} />
      <Observances o={a.observances} loc={loc} />
    </PageShell>
  );
}
