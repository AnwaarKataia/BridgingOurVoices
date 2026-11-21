import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPublishedLocale, type Locale } from "@/i18n/config";
import { dateLocale, eventHref, getAgendaContent } from "@/content/agenda";
import { countryOptions } from "@/content/countries";
import { eventItems, getEvent, getEvents } from "@/lib/events";
import { pick } from "@/lib/courses";
import { ContentImage } from "@/components/ContentImage";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { getSiteContent } from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { AgendaRow } from "@/components/agenda/AgendaRow";
import { chipParts } from "@/components/agenda/dates";
import { btn } from "@/components/ui";

type Params = { params: Promise<{ locale: string; slug: string }> };

/** One event from the dashboard (owner, 2026-11-21): published events, or drafts in the team's preview. */
async function load(locale: Locale, slug: string) {
  const ev = await getEvent(slug);
  if (!ev) return null;
  return {
    ev,
    kind: pick(ev.kind, locale),
    title: pick(ev.title, locale),
    place: pick(ev.place, locale),
    body: pick(ev.body, locale),
    isos: ev.dates,
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPublishedLocale(locale)) return {};
  const e = await load(locale, slug);
  if (!e) return {};
  return pageMetadata(locale, `/agenda/${slug}`, { title: e.title, description: [e.kind, e.place, e.body].filter(Boolean).join(" · ").slice(0, 158) });
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
  const e = await load(locale, slug);
  if (!e) notFound();
  const [a, site, events] = await Promise.all([getAgendaContent(locale), getSiteContent(locale), getEvents()]);
  const loc = dateLocale(locale);
  const longDate = (iso: string) =>
    new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${iso}T12:00:00`));
  const pageUrl = `${siteUrl}${eventHref(locale, slug)}`;
  const agendaLabel = site.nav.find((n) => n.key === "agenda")?.label ?? a.meta.title;
  const homeLabel = site.nav.find((n) => n.key === "home")?.label ?? site.brandName;

  // Other dated items, without this one (the series shows once)
  const today = new Date().toISOString().slice(0, 10);
  const others = eventItems(events, locale)
    .filter((item) => item.href !== eventHref(locale, slug) && item.tone !== "deadline" && item.iso >= today)
    .filter((item, i, all) => all.findIndex((x) => x.href === item.href) === i);
  const canRegister = e.ev.registrationOpen && e.ev.tone !== "deadline";

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
      <PageHeader eyebrow={e.kind} title={e.title} />
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
              {e.ev.time && (
                <div className="flex flex-col gap-1.5 bg-white p-5 sm:col-span-2">
                  <dt className="eyebrow text-gold-deep">{p.time}</dt>
                  <dd className="text-[17px] font-semibold text-ink">{e.ev.time}</dd>
                </div>
              )}
              {e.place && (
                <div className="flex flex-col gap-1.5 bg-white p-5">
                  <dt className="eyebrow text-gold-deep">{p.place}</dt>
                  <dd className="text-[17px] font-semibold text-ink">{e.place}</dd>
                </div>
              )}
              {e.kind && (
                <div className="flex flex-col gap-1.5 bg-white p-5">
                  <dt className="eyebrow text-gold-deep">{p.type}</dt>
                  <dd className="text-[17px] font-semibold text-ink">{e.kind}</dd>
                </div>
              )}
            </dl>

            {e.ev.image && (
              <div className="relative aspect-video overflow-hidden rounded-bov border border-line">
                <ContentImage src={e.ev.image} alt="" sizes="(min-width: 1024px) 700px, 100vw" />
              </div>
            )}
            {e.body
              .split(/\n+/)
              .filter(Boolean)
              .map((para) => (
                <p key={para} className="m-0 text-body leading-relaxed text-ink-soft">{para}</p>
              ))}
            {canRegister && <p className="m-0 text-body text-ink-soft">{p.details}</p>}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              {canRegister ? (
                <a href="#register" className={btn.gold}>{p.register}</a>
              ) : (
                e.ev.tone !== "deadline" && <span className="text-sm font-semibold text-danger">{p.closed}</span>
              )}
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

          {others.length > 0 && (
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
          )}
        </div>
      </section>
      {canRegister && (
        <section id="register" className="scroll-mt-24 bg-sand" aria-labelledby="register-title">
          <div className="container-site py-12 md:py-20">
            <div className="mx-auto flex max-w-[720px] flex-col gap-4">
              <h2 id="register-title" className="font-display text-h2 font-normal text-ink">{a.register.title}</h2>
              <p className="m-0 text-ink-soft">{a.register.lead}</p>
              <RegisterForm
                locale={locale}
                endpoint={`/public/events/${slug}/register`}
                t={a.register}
                countries={countryOptions(locale)}
                privacy={site.privacy}
                forms={site.forms}
              />
            </div>
          </div>
        </section>
      )}
    </PageShell>
  );
}
