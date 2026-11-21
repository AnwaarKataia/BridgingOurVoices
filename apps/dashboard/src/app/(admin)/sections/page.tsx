import type { Metadata } from "next";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { PreviewButton } from "@/components/PreviewButton";
import { SectionToggle } from "@/components/SectionToggle";

export const metadata: Metadata = { title: "Sections" };

const KEYS = ["seminars", "conferences", "fellowship"] as const;

/** Undecided sections show "Coming soon" to the public until switched on here (owner, 2026-11-21). */
export default async function SectionsPage() {
  const [{ lang, t }, { data, status }] = await Promise.all([getDict(), apiGet<{ sections: Record<(typeof KEYS)[number], boolean> }>("/admin/sections")]);
  const s = t.sections;
  const portalUrl = process.env.PORTAL_URL ?? "http://localhost:3000";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow mb-2 text-gold-deep">{s.nav}</p>
        <h1 className="font-display text-h2 font-normal">{s.title}</h1>
        <p className="mt-2 max-w-[720px] text-ink-soft">{s.lead}</p>
      </div>
      {!data ? (
        <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-bov border border-line bg-white">
          {KEYS.map((k) => (
            <li key={k} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
              <span className="flex flex-col gap-1">
                <span className="font-display text-xl">{s.names[k]}</span>
                <span className={`text-sm font-semibold ${data.sections[k] ? "text-blue-deep" : "text-gold-deep"}`}>{data.sections[k] ? s.shown : s.hidden}</span>
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <PreviewButton portalUrl={portalUrl} path={`/${lang}/activities/${k}`} t={t.preview} />
                <Link href="/content/activities" className="inline-flex h-10 items-center rounded-bov border border-line px-4 text-sm font-semibold text-ink hover:border-navy">
                  {s.editContent}
                </Link>
                <SectionToggle sectionKey={k} visible={data.sections[k]} t={{ show: s.show, hide: s.hide, error: t.error }} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
