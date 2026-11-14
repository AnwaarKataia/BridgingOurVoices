import Link from "next/link";
import { apiGet, getCurrentUser } from "@/lib/api";
import { getDict } from "@/lib/i18n";

type Stats = { newMessages: number; pendingMembers: number; pendingVoices: number; subscribers: number };
type FeedItem = { type: "message" | "member" | "voice" | "subscriber"; id: string; name: string; status: string; createdAt: string };

/** Where each kind of item opens in the dashboard. */
const hrefFor = (i: FeedItem) =>
  i.type === "message" ? `/messages/${i.id}` : i.type === "subscriber" ? "/subscribers" : `/applications/${i.id}`;

/** Overview: the four numbers (each opens its list) + the latest submissions of every kind. */
export default async function OverviewPage() {
  const [{ lang, t }, user, { data, status }, { data: feed }] = await Promise.all([
    getDict(),
    getCurrentUser(),
    apiGet<{ stats: Stats }>("/admin/stats"),
    apiGet<{ items: FeedItem[] }>("/admin/recent"),
  ]);
  const loc = lang === "ar" ? "ar-EG" : "en-GB";
  const nf = new Intl.NumberFormat(loc);
  const fmt = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const cards: { key: keyof Stats; label: string; href: string }[] = [
    { key: "newMessages", label: t.stats.newMessages, href: "/messages?status=new" },
    { key: "pendingMembers", label: t.stats.pendingMembers, href: "/applications?kind=member&status=pending" },
    { key: "pendingVoices", label: t.stats.pendingVoices, href: "/applications?kind=voice&status=pending" },
    { key: "subscribers", label: t.stats.subscribers, href: "/subscribers" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{t.nav.overview}</p>
        <h1 className="font-display text-h2 font-normal">
          {t.welcome} {user?.name}
        </h1>
        <p className="mt-2 text-ink-soft">{t.overviewLead}</p>
      </div>
      {data ? (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <li key={c.key}>
              <Link
                href={c.href}
                className="flex h-full flex-col gap-2 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5 transition hover:border-navy hover:border-t-gold"
              >
                <span className="font-display text-[2.5rem] leading-none text-navy">{nf.format(data.stats[c.key])}</span>
                <span className="text-sm text-ink-soft">{c.label}</span>
                <span className="mt-auto text-sm font-semibold text-blue">
                  {t.feed.seeAll} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>
      )}

      <section aria-labelledby="feed-title" className="flex flex-col gap-3">
        <h2 id="feed-title" className="font-display text-h3 font-normal">{t.feed.title}</h2>
        {!feed?.items.length ? (
          <p className="rounded-bov border border-line bg-white p-6 text-ink-soft">{t.feed.empty}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
            {feed.items.map((i) => (
              <li key={`${i.type}-${i.id}`}>
                <Link href={hrefFor(i)} className="flex flex-wrap items-center gap-x-3 gap-y-1 p-4 hover:bg-sand/50">
                  <span className="rounded-bov bg-sand px-2 py-0.5 text-xs font-semibold text-ink">{t.feed.types[i.type]}</span>
                  <span dir="auto" className="min-w-0 break-all font-semibold text-ink">{i.name}</span>
                  <span className="ms-auto text-xs text-ink-soft">{fmt.format(new Date(i.createdAt))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
