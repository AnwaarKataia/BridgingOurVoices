import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { appTone, type AppStatus } from "@/lib/status";

export const metadata: Metadata = { title: "Applications" };

type Status = AppStatus;
type Kind = "member" | "voice";
type Item = { id: string; kind: Kind; name: string; email: string; country: string; job: string; status: Status; published: boolean; hasNote: boolean; createdAt: string };
type Data = { kind: Kind; items: Item[]; counts: Record<Status, number>; pending: Record<Kind, number> };
const STATUSES: Status[] = ["pending", "review", "hold", "approved", "rejected"];

/**
 * Two kinds of submissions, each with status tabs (owner, 2026-11-14):
 * membership applications (Membership page) and "Add your voice to ours" (Join page).
 */
export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<{ status?: string; kind?: string }> }) {
  const { status: rawStatus, kind: rawKind } = await searchParams;
  const kind: Kind = rawKind === "voice" ? "voice" : "member";
  const status = (STATUSES as string[]).includes(rawStatus ?? "") || rawStatus === "all" ? (rawStatus as Status | "all") : "pending";
  const [{ lang, t }, { data, status: code }] = await Promise.all([
    getDict(),
    apiGet<Data>(`/admin/applications?kind=${kind}${status === "all" ? "" : `&status=${status}`}`),
  ]);
  const a = t.apps;
  const loc = lang === "ar" ? "ar-EG" : "en-GB";
  const nf = new Intl.NumberFormat(loc);
  const fmt = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", year: "numeric" });
  const countries = new Intl.DisplayNames([lang], { type: "region" });
  const total = data ? STATUSES.reduce((a, s) => a + data.counts[s], 0) : 0;
  const tabs: { key: Status | "all"; n: number }[] = [...STATUSES.map((s) => ({ key: s, n: data?.counts[s] ?? 0 })), { key: "all", n: total }];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{t.nav.applications}</p>
        <h1 className="font-display text-h2 font-normal">{a.title}</h1>
        <p className="mt-2 max-w-[720px] text-ink-soft">{a.lead}</p>
      </div>

      {/* The two kinds of submissions */}
      <nav aria-label={a.title} className="border-b border-line">
        <ul className="-mb-px flex flex-wrap gap-x-6">
          {(["member", "voice"] as const).map((k) => (
            <li key={k}>
              <Link
                href={`/applications?kind=${k}`}
                aria-current={kind === k ? "page" : undefined}
                className={`flex items-center gap-2 border-b-2 py-3 font-display text-lg ${kind === k ? "border-gold text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}
              >
                {a.kinds[k]}
                {!!data?.pending[k] && <span className="rounded-full bg-gold px-2 text-xs font-semibold text-navy">{nf.format(data.pending[k])}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label={a.kinds[kind]}>
        <ul className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <li key={tab.key}>
              <Link
                href={`/applications?kind=${kind}&status=${tab.key}`}
                aria-current={status === tab.key ? "page" : undefined}
                className={`flex h-10 items-center gap-2 rounded-bov border px-4 text-sm font-semibold ${
                  status === tab.key ? "border-navy bg-navy text-on-dark" : "border-line bg-white text-ink hover:border-navy"
                }`}
              >
                {a.tabs[tab.key]}
                <span className="rounded-bov bg-white/20 px-1.5 text-xs">{nf.format(tab.n)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {!data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{code === 503 ? t.apiDown : t.error}</p>
      ) : data.items.length === 0 ? (
        <p className="rounded-bov border border-line bg-white p-6 text-ink-soft">{a.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
          {data.items.map((item) => (
            <li key={item.id}>
              <Link href={`/applications/${item.id}`} className="grid gap-x-4 gap-y-1 p-4 hover:bg-sand/50 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_auto] sm:items-center">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-ink">{item.name}</span>
                  <span className="truncate text-sm text-ink-soft">{item.job}</span>
                </span>
                <span className="text-sm text-ink-soft">
                  {countries.of(item.country) ?? item.country} · {fmt.format(new Date(item.createdAt))}
                </span>
                <span className="flex flex-wrap items-center gap-1.5 justify-self-start sm:justify-self-end">
                  {item.hasNote && <span title={a.note}>📝</span>}
                  {item.published && <span className="rounded-bov bg-gold px-2 py-0.5 text-xs font-semibold text-navy">{a.published}</span>}
                  <span className={`rounded-bov px-2 py-0.5 text-xs font-semibold ${appTone[item.status]}`}>{a.status[item.status]}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
