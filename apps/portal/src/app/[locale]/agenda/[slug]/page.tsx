import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPublishedLocale, publishedLocales } from "@/i18n/config";
import { agendaEntry, agendaItems, agendaSlugs, dateLocale, eventHref, getAgendaContent } from "@/content/agenda";
import { getSiteContent } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { AgendaRow } from "@/components/agenda/AgendaRow";
import { chipParts } from "@/components/agenda/dates";
import { btn } from "@/components/ui";

type Params = { params: Promise<{ locale: string; slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.flatMap((locale) => agendaSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPublishedLocale(locale)) return {};
  const a = await getAgendaContent(locale);
  const e = agendaEntry(a, slug);
  if (!e) return {};
  return pageMetadata(locale, `/agenda/${slug}`, { title: e.title, description: [e.kind, e.place, e.body].filter(Boolean).join(" · ") });
}

/** Google Calendar "add event" link for an all-day event. */
function googleCalendarUrl(title: string, iso: string, place: string, details: string) {
  const day = iso.replaceAll("-", "");
  const next = new Date(`${iso}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const end = next.toISOString().slice(0, 10).replaceAll("-", "");
  const q = new URLSearchParams({ action: "TEMPLATE", text: title, dates: `${day}/${end}`, location: place, details });
  return `https://calendar.google.com/calendar/render?${q}`;
}

export default async function AgendaEventPage({ params }: Params) {
  const { locale, slug } = await params;
  if (!isPublishedLocale(locale)) notFound();
  const a = await getAgendaContent(locale);
  const e = agendaEntry(a, slug);
  if (!e) notFound();
  const site = await getSiteContent(locale);
  const loc = dateLocale(locale);
  const longDate = (iso: string) =>
    new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T12:00:00`));
  const pageUrl = `${siteUrl}${eventHref(locale, slug)}`;
  const agendaLabel = site.nav.find((n) => n.key === "agenda")?.label ?? a.meta.title;
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;

  // Other dated items, without this one (the series shows once)
  const others = agendaItems(a, locale)
    .filter((item) => item.href !== eventHref(locale, slug) && item.tone !== "deadline")
    .filter((item, i, all) => all.findIndex((x) => x.href === item.href) === i);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": e.isos.length > 1 ? "EventSeries" : "Event",
        name: e.title,
        startDate: e.isos[0],
        ...(e.isos.length > 1 ? { endDate: e.isos[e.isos.length - 1] } : {}),
        inLanguage: locale,
        location: { "@type": "Place", name: e.place },
        organizer: { "@id": `${siteUrl}/#organization` },
        url: pageUrl,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: homeLabel, item: `${siteUrl}/${locale}` },
          { "@type": "ListItem", position: 2, name: agendaLabel, item: `${siteUrl}/${locale}/agenda` },
          { "@type": "ListItem", position: 3, name: e.title, item: pageUrl },
        ],
      },
    ],
  };

  const p = a.eventPage;
  return (
    <PageShell locale={locale} path={`/agenda/${slug}`} current="agenda">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHeader eyebrow={e.kind} title={e.title} lead={e.body} />
      <section>
        <div className="container-site grid grid-cols-1 items-start gap-x-16 gap-y-12 pt-12 pb-16 md:pt-[72px] md:pb-24 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-8">
            <dl className="grid gap-px overflow-hidden rounded-bov border border-t-4 border-line border-t-gold bg-line sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 bg-white p-5 sm:col-span-2">
                <dt className="eyebrow text-gold-deep">{e.isos.length > 1 ? p.sessions : p.date}</dt>
                <dd>
                  <ul className="flex flex-col gap-1.5 font-display text-xl text-ink">
                    {e.isos.map((iso) => (
                      <li key={iso}>
                        <time dateTime={iso}>{longDate(iso)}</time>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className="flex flex-col gap-1.5 bg-white p-5">
                <dt className="eyebrow text-gold-deep">{p.place}</dt>
                <dd className="text-[17px] font-semibold text-ink">{e.place}</dd>
              </div>
              <div className="flex flex-col gap-1.5 bg-white p-5">
                <dt className="eyebrow text-gold-deep">{p.type}</dt>
                <dd className="text-[17px] font-semibold text-ink">{e.kind}</dd>
              </div>
            </dl>

            <p className="text-body text-ink-soft">{p.details}</p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <a href={`/${locale}/contact`} className={btn.gold}>{p.register}</a>
              <a
                href={googleCalendarUrl(e.title, e.isos[0], e.place, `${pageUrl}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue underline underline-offset-4 hover:text-navy"
              >
                {p.addToCalendar}
              </a>
            </div>

            <a href={`/${locale}/agenda`} className="self-start text-sm font-semibold text-blue hover:text-navy">
              <span aria-hidden className="me-1 inline-block rtl:-scale-x-100">←</span>
              {p.back}
            </a>
          </div>

          <aside aria-labelledby="others-title" className="flex flex-col gap-4">
            <h2 id="others-title" className="font-display text-h3 font-normal text-ink">{p.others}</h2>
            <ul className="border-t-[1.5px] border-navy">
              {others.map((item) => {
                const { day, month } = chipParts(item.iso, loc);
                return (
                  <li key={item.href}>
                    <AgendaRow day={day} month={month} kind={item.kind} title={item.title} place={item.place} tone={item.tone} dateTime={item.iso} href={item.href} />
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
