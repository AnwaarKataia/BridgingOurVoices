import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { SubscriberActions } from "@/components/SubscriberActions";

export const metadata: Metadata = { title: "Subscribers" };

type Item = { id: string; email: string; createdAt: string; unsubscribedAt: string | null };

/** Newsletter subscribers: search, Excel (CSV) download, unsubscribe or delete. */
export default async function SubscribersPage({ searchParams }: { searchParams: Promise<{ q?: string; show?: string }> }) {
  const { q = "", show } = await searchParams;
  const unsub = show === "unsubscribed";
  const params = new URLSearchParams({ ...(q ? { q } : {}), ...(unsub ? { show: "unsubscribed" } : {}) });
  const [{ lang, t }, { data, status }] = await Promise.all([
    getDict(),
    apiGet<{ items: Item[]; counts: { active: number; unsubscribed: number } }>(`/admin/subscribers${params.size ? `?${params}` : ""}`),
  ]);
  const s = t.subs;
  const loc = lang === "ar" ? "ar-EG" : "en-GB";
  const nf = new Intl.NumberFormat(loc);
  const fmt = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", year: "numeric" });
  const tabs = [
    { key: "active", label: s.active, n: data?.counts.active ?? 0, href: "/subscribers" },
    { key: "unsubscribed", label: s.unsubscribed, n: data?.counts.unsubscribed ?? 0, href: "/subscribers?show=unsubscribed" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{t.nav.subscribers}</p>
        <h1 className="font-display text-h2 font-normal">{s.title}</h1>
        <p className="mt-2 max-w-[720px] text-ink-soft">{s.lead}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={s.title}>
          <ul className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const current = (tab.key === "unsubscribed") === unsub;
              return (
                <li key={tab.key}>
                  <Link
                    href={tab.href}
                    aria-current={current ? "page" : undefined}
                    className={`flex h-10 items-center gap-2 rounded-bov border px-4 text-sm font-semibold ${current ? "border-navy bg-navy text-on-dark" : "border-line bg-white text-ink hover:border-navy"}`}
                  >
                    {tab.label}
                    <span className="rounded-bov bg-white/20 px-1.5 text-xs">{nf.format(tab.n)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex flex-col items-start gap-1">
          <a href="/api/admin/subscribers.csv" className="flex h-10 items-center rounded-bov bg-gold px-4 text-sm font-semibold text-navy hover:bg-gold-hover">
            {s.export}
          </a>
          <span className="text-xs text-ink-soft">{s.exportHint}</span>
        </div>
      </div>

      <form method="get" className="flex max-w-[420px] gap-2" role="search">
        {unsub && <input type="hidden" name="show" value="unsubscribed" />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={s.search}
          aria-label={s.search}
          dir="ltr"
          className="h-10 min-w-0 flex-1 rounded-bov border border-line-input bg-white px-3 text-[15px] text-ink focus:border-sky focus:outline-2 focus:outline-sky rtl:text-end"
        />
        <button type="submit" className="h-10 rounded-bov border border-navy px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark">
          ⌕
        </button>
      </form>

      {!data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>
      ) : data.items.length === 0 ? (
        <p className="rounded-bov border border-line bg-white p-6 text-ink-soft">{s.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
          {data.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 p-4">
              <span dir="ltr" className="min-w-0 break-all font-medium text-ink">{item.email}</span>
              <span className="text-sm text-ink-soft">
                {s.subscribedOn}: {fmt.format(new Date(item.createdAt))}
              </span>
              <span className="ms-auto">
                <SubscriberActions id={item.id} active={!item.unsubscribedAt} t={s} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
