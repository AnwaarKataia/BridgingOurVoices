import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { MessageActions } from "@/components/MessageActions";
import { NoteEditor } from "@/components/NoteEditor";
import { msgTone } from "@/lib/status";

export const metadata: Metadata = { title: "Message" };

type Status = "new" | "review" | "hold" | "replied" | "archived";
type Message = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  locale: string;
  status: Status;
  note: string;
  handlerName: string | null;
  updatedAt: string | null;
  createdAt: string;
};
const langNames: Record<string, string> = { en: "English", fr: "Français", ar: "العربية" };

/** One contact message in full: reply by email, status buttons, internal note. */
export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ lang, t }, { data, status }] = await Promise.all([getDict(), apiGet<{ message: Message }>(`/admin/messages/${encodeURIComponent(id)}`)]);
  if (status === 404) notFound();
  const m = t.msgs;
  if (!data) return <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>;
  const msg = data.message;
  const loc = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = new Intl.DateTimeFormat(loc, { dateStyle: "long", timeStyle: "short" });
  const topic = m.topics[msg.topic as keyof typeof m.topics] ?? msg.topic;
  // A ready reply in the mail app: "Re: <subject>" and the original message quoted
  const mailto = `mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${topic} — Bridging Our Voices`)}&body=${encodeURIComponent(
    `\n\n---\n${msg.name}:\n${msg.message}`,
  )}`;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/messages" className="self-start text-sm font-semibold text-blue hover:text-navy">
        <span aria-hidden className="me-1 inline-block rtl:-scale-x-100">←</span>
        {m.back}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-h2 font-normal">{msg.name}</h1>
        <span className={`rounded-bov px-2 py-1 text-xs font-semibold ${msgTone[msg.status]}`}>{m.status[msg.status]}</span>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <dl className="grid gap-px overflow-hidden rounded-bov border border-line bg-line sm:grid-cols-2">
            {[
              { k: m.from, v: msg.email, ltr: true },
              { k: m.topic, v: topic },
              { k: m.received, v: fmt.format(new Date(msg.createdAt)) },
              { k: m.language, v: langNames[msg.locale] ?? msg.locale },
            ].map((f) => (
              <div key={f.k} className="flex min-w-0 flex-col gap-1 bg-white p-4">
                <dt className="text-xs font-semibold text-ink-soft">{f.k}</dt>
                <dd dir={f.ltr ? "ltr" : undefined} className="break-words font-medium text-ink rtl:text-end">{f.v}</dd>
              </div>
            ))}
          </dl>
          <section className="rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5">
            <p dir="auto" className="whitespace-pre-line leading-relaxed text-ink">{msg.message}</p>
          </section>
          <section className="rounded-bov border border-line bg-white p-5">
            <NoteEditor endpoint={`/api/admin/messages/${msg.id}`} initial={msg.note} t={{ ...t.apps, error: t.error }} />
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
          <section className="flex flex-col gap-3 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5">
            <a href={mailto} className="flex h-11 items-center justify-center rounded-bov bg-gold px-4 text-sm font-semibold text-navy hover:bg-gold-hover">
              {m.reply}
            </a>
            <p className="text-xs text-ink-soft">{m.replyHint}</p>
          </section>
          <section className="flex flex-col gap-3 rounded-bov border border-line bg-white p-5">
            <h2 className="text-sm font-semibold text-ink">{t.apps.decision}</h2>
            <MessageActions id={msg.id} status={msg.status} t={{ actions: m.actions, saved: t.apps.saved, error: t.error }} />
            {msg.handlerName && msg.updatedAt && (
              <p className="text-xs text-ink-soft">
                {m.lastAction} {msg.handlerName} · {fmt.format(new Date(msg.updatedAt))}
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
