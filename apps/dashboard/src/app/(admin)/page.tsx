import { apiGet, getCurrentUser } from "@/lib/api";
import { getDict } from "@/lib/i18n";

type Stats = { newMessages: number; pendingApplications: number; subscribers: number };

/** Overview: welcome + the three numbers from /admin/stats. */
export default async function OverviewPage() {
  const [{ lang, t }, user, { data, status }] = await Promise.all([getDict(), getCurrentUser(), apiGet<{ stats: Stats }>("/admin/stats")]);
  const nf = new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB");
  const cards: { key: keyof Stats; label: string }[] = [
    { key: "newMessages", label: t.stats.newMessages },
    { key: "pendingApplications", label: t.stats.pendingApplications },
    { key: "subscribers", label: t.stats.subscribers },
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
        <ul className="grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <li key={c.key} className="flex flex-col gap-2 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5">
              <span className="font-display text-[2.5rem] leading-none text-navy">{nf.format(data.stats[c.key])}</span>
              <span className="text-sm text-ink-soft">{c.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>
      )}
    </div>
  );
}
