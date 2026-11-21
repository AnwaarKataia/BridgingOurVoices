import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { AgendaBoard, type EventItem } from "@/components/agenda/AgendaBoard";

export const metadata: Metadata = { title: "Agenda" };

/** Agenda (owner, 2026-11-21): click a day to add an event; drafts stay in the dashboard until published. */
export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  const { event } = await searchParams;
  const [{ lang, t }, { data, status }] = await Promise.all([getDict(), apiGet<{ items: EventItem[] }>("/admin/events")]);
  const portalUrl = process.env.PORTAL_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{t.agenda.nav}</p>
        <h1 className="font-display text-h2 font-normal">{t.agenda.title}</h1>
        <p className="mt-2 max-w-[760px] text-ink-soft">{t.agenda.lead}</p>
      </div>
      {!data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>
      ) : (
        <AgendaBoard
          events={data.items}
          lang={lang}
          portalUrl={portalUrl}
          t={t.agenda}
          courses={t.courses}
          image={t.content.image}
          previewT={t.preview}
          error={t.error}
          initialEvent={event ?? null}
        />
      )}
    </div>
  );
}
