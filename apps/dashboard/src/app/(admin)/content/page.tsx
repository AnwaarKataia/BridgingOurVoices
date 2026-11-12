import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";

export const metadata: Metadata = { title: "Content" };

type PageRow = { key: string; locales: { locale: string; hasDraft: boolean; publishedAt: string; draftUpdatedAt: string | null }[] };

/** Website content: one card per page document, with its draft / published status. */
export default async function ContentListPage() {
  const [{ lang, t }, { data, status }] = await Promise.all([getDict(), apiGet<{ pages: PageRow[] }>("/admin/content")]);
  const c = t.content;
  const fmt = new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{c.nav}</p>
        <h1 className="font-display text-h2 font-normal">{c.title}</h1>
        <p className="mt-2 max-w-[720px] text-ink-soft">{c.lead}</p>
      </div>
      {!data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.pages.map((p) => {
            const draft = p.locales.some((l) => l.hasDraft);
            const last = p.locales.map((l) => l.publishedAt).sort().at(-1);
            const name = c.pages[p.key as keyof typeof c.pages] ?? p.key;
            return (
              <li key={p.key}>
                <Link
                  href={`/content/${p.key}`}
                  className="flex h-full flex-col gap-3 rounded-bov border border-t-[2.4px] border-line border-t-gold bg-white p-5 transition hover:border-navy hover:border-t-gold"
                >
                  <span className="font-display text-xl text-ink">{name}</span>
                  <span
                    className={`self-start rounded-bov px-2 py-0.5 text-xs font-semibold ${draft ? "bg-gold/20 text-gold-deep" : "bg-sky-tint text-blue-deep"}`}
                  >
                    {draft ? c.draftPending : c.upToDate}
                  </span>
                  {last && (
                    <span className="mt-auto text-xs text-ink-soft">
                      {c.lastPublished} {fmt.format(new Date(last))}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
