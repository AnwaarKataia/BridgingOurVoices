import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { RegistrationStatus } from "@/components/RegistrationStatus";

export const metadata: Metadata = { title: "Registrations" };

type I18n = { en: string; fr: string; ar: string };
type Reg = {
  id: string;
  type: "course" | "event";
  itemId: string;
  item: I18n;
  name: string;
  email: string;
  country: string;
  locale: string;
  status: "new" | "accepted" | "rejected";
  createdAt: string;
  learnerId: string | null;
};

/** Every registration from the site (owner, 2026-11-21): online courses and agenda events. */
export default async function RegistrationsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type: raw } = await searchParams;
  const type = raw === "course" || raw === "event" ? raw : "all";
  const [{ lang, t }, { data, status }] = await Promise.all([getDict(), apiGet<{ items: Reg[] }>("/admin/registrations")]);
  const r = t.registrations;
  const intl = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric" });
  const nf = new Intl.NumberFormat(intl);
  const countries = new Intl.DisplayNames([lang], { type: "region" });
  const title = (x: I18n) => (lang === "ar" ? x.ar || x.en || x.fr : x.en || x.ar || x.fr);
  const items = (data?.items ?? []).filter((i) => type === "all" || i.type === type);
  const count = (k: "all" | "course" | "event") => (data?.items ?? []).filter((i) => k === "all" || i.type === k).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{r.nav}</p>
        <h1 className="font-display text-h2 font-normal">{r.title}</h1>
        <p className="mt-2 max-w-[720px] text-ink-soft">{r.lead}</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={r.title}>
          <ul className="flex flex-wrap gap-2">
            {(["all", "course", "event"] as const).map((k) => (
              <li key={k}>
                <Link
                  href={`/registrations?type=${k}`}
                  aria-current={type === k ? "page" : undefined}
                  className={`flex h-10 items-center gap-2 rounded-bov border px-4 text-sm font-semibold ${
                    type === k ? "border-navy bg-navy text-on-dark" : "border-line bg-white text-ink hover:border-navy"
                  }`}
                >
                  {r.types[k]}
                  <span className="rounded-bov bg-white/20 px-1.5 text-xs">{nf.format(count(k))}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <a href="/api/admin/registrations.csv" className="inline-flex h-10 items-center rounded-bov border border-navy px-4 text-sm font-semibold text-navy hover:bg-navy hover:text-on-dark">
          {r.export}
        </a>
      </div>
      {!data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>
      ) : items.length === 0 ? (
        <p className="rounded-bov border border-line bg-white p-6 text-ink-soft">{r.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
          {items.map((i) => (
            <li key={i.id} className="grid gap-x-4 gap-y-1 p-4 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_auto] md:items-center">
              <span className="flex min-w-0 flex-col">
                {i.learnerId ? (
                  <Link href={`/learners/${i.learnerId}`} className="truncate font-semibold text-ink underline-offset-4 hover:text-blue hover:underline">{i.name}</Link>
                ) : (
                  <span className="truncate font-semibold text-ink">{i.name}</span>
                )}
                <a href={`mailto:${i.email}`} dir="ltr" className="truncate text-sm text-blue hover:text-navy md:text-start rtl:text-end">{i.email}</a>
              </span>
              <span className="flex min-w-0 flex-col text-sm">
                <Link href={i.type === "course" ? `/courses/${i.itemId}` : `/agenda?event=${i.itemId}`} className="truncate font-semibold text-ink hover:text-blue" dir="auto">
                  {r.types[i.type]} · {title(i.item)}
                </Link>
                <span className="text-ink-soft">
                  {countries.of(i.country) ?? i.country} · {fmt.format(new Date(i.createdAt))}
                </span>
              </span>
              <RegistrationStatus id={i.id} type={i.type} status={i.status} learnerId={i.learnerId} t={{ label: r.statusLabel, status: r.status, error: t.error, viewPage: r.viewPage }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
