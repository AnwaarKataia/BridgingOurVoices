import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { msgTone, type MsgStatus } from "@/lib/status";

export const metadata: Metadata = { title: "Messages" };

type Status = MsgStatus;
type Item = { id: string; name: string; email: string; topic: string; preview: string; status: Status; hasNote: boolean; createdAt: string };

/** Contact messages by status, each opening the full message. */
export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status: raw } = await searchParams;
  const statuses: Status[] = ["new", "review", "hold", "replied", "archived"];
  const status = (statuses as string[]).includes(raw ?? "") || raw === "all" ? (raw as Status | "all") : "new";
  const [{ lang, t }, { data, status: code }] = await Promise.all([
    getDict(),
    apiGet<{ items: Item[]; counts: Record<Status, number> }>(`/admin/messages${status === "all" ? "" : `?status=${status}`}`),
  ]);
  const m = t.msgs;
  const loc = lang === "ar" ? "ar-EG" : "en-GB";
  const nf = new Intl.NumberFormat(loc);
  const fmt = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const total = data ? Object.values(data.counts).reduce((a, b) => a + b, 0) : 0;
  const tabs: { key: Status | "all"; n: number }[] = [...statuses.map((s) => ({ key: s, n: data?.counts[s] ?? 0 })), { key: "all", n: total }];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{t.nav.messages}</p>
        <h1 className="font-display text-h2 font-normal">{m.title}</h1>
        <p className="mt-2 max-w-[720px] text-ink-soft">{m.lead}</p>
      </div>

      <nav aria-label={m.title}>
        <ul className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <li key={tab.key}>
              <Link
                href={`/messages?status=${tab.key}`}
                aria-current={status === tab.key ? "page" : undefined}
                className={`flex h-10 items-center gap-2 rounded-bov border px-4 text-sm font-semibold ${
                  status === tab.key ? "border-navy bg-navy text-on-dark" : "border-line bg-white text-ink hover:border-navy"
                }`}
              >
                {m.tabs[tab.key]}
                <span className="rounded-bov bg-white/20 px-1.5 text-xs">{nf.format(tab.n)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {!data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{code === 503 ? t.apiDown : t.error}</p>
      ) : data.items.length === 0 ? (
        <p className="rounded-bov border border-line bg-white p-6 text-ink-soft">{m.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
          {data.items.map((item) => (
            <li key={item.id}>
              <Link href={`/messages/${item.id}`} className={`flex flex-col gap-1.5 p-4 hover:bg-sand/50 ${item.status === "new" ? "border-s-4 border-gold" : ""}`}>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className={`text-ink ${item.status === "new" ? "font-bold" : "font-semibold"}`}>{item.name}</span>
                  <span className="text-sm text-ink-soft">{m.topics[item.topic as keyof typeof m.topics] ?? item.topic}</span>
                  <span className={`ms-auto rounded-bov px-2 py-0.5 text-xs font-semibold ${msgTone[item.status]}`}>{m.status[item.status]}</span>
                </span>
                <span dir="auto" className="line-clamp-2 text-sm text-ink-soft">{item.preview}</span>
                <span className="text-xs text-ink-soft">
                  {fmt.format(new Date(item.createdAt))}
                  {item.hasNote && <span className="ms-2">📝</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
