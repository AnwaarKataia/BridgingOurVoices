import type { Locale } from "@/i18n/config";
import type { AgendaItem } from "@/content/agenda";
import { eventHref } from "@/content/agenda";
import { apiGetJson } from "@/lib/preview";
import { pick, type I18n } from "@/lib/courses";

/**
 * Agenda events (owner, 2026-11-21), managed from the dashboard calendar. The public sees published events;
 * the team's preview also shows drafts.
 */
export type AgendaEvent = {
  slug: string;
  status: "draft" | "published";
  tone: "event" | "series" | "deadline";
  dates: string[];
  time: string;
  kind: I18n;
  title: I18n;
  body: I18n;
  place: I18n;
  image: string;
  registrationOpen: boolean;
};

export async function getEvents(): Promise<AgendaEvent[]> {
  return (await apiGetJson<{ items: AgendaEvent[] }>("/public/events"))?.items ?? [];
}

export async function getEvent(slug: string): Promise<AgendaEvent | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return (await apiGetJson<{ event: AgendaEvent }>(`/public/events/${slug}`))?.event ?? null;
}

/** One calendar/list item per date (a series shows on each session day), sorted by date. */
export function eventItems(events: AgendaEvent[], locale: Locale): AgendaItem[] {
  return events
    .flatMap((e) =>
      e.dates.map((iso) => ({
        iso,
        kind: pick(e.kind, locale),
        title: pick(e.title, locale),
        place: pick(e.place, locale) || undefined,
        tone: e.tone,
        href: eventHref(locale, e.slug),
      })),
    )
    .sort((a, b) => a.iso.localeCompare(b.iso));
}
