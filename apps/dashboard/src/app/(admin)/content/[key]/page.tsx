import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import { getDict } from "@/lib/i18n";
import { ContentEditor } from "@/components/content/ContentEditor";
import type { Json, Locale } from "@/components/content/paths";

export const metadata: Metadata = { title: "Edit content" };

type LocaleRow = { published: Json; draft: Json | null };

/** Where each content document is visible on the portal (for "View page on site"). */
const viewPaths: Record<string, string> = {
  site: "",
  home: "",
  about: "/about/who-we-are",
  activities: "/activities/training",
  agenda: "/agenda",
  network: "/network/membership",
  contact: "/contact",
  privacy: "/privacy",
};

export default async function EditContentPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const [{ lang, t }, { data, status }] = await Promise.all([
    getDict(),
    apiGet<{ locales: Record<Locale, LocaleRow> }>(`/admin/content/${encodeURIComponent(key)}`),
  ]);
  if (status === 404) notFound();
  if (!data || !data.locales.en || !data.locales.fr || !data.locales.ar) {
    return <p role="alert" className="rounded-bov border border-danger/40 bg-white p-4 text-danger">{status === 503 ? t.apiDown : t.error}</p>;
  }
  const { en, fr, ar } = data.locales;
  const published = { en: en.published, fr: fr.published, ar: ar.published };
  const initial = { en: en.draft ?? en.published, fr: fr.draft ?? fr.published, ar: ar.draft ?? ar.published };

  return (
    <ContentEditor
      key={key}
      pageKey={key}
      pageName={t.content.pages[key as keyof typeof t.content.pages] ?? key}
      published={published}
      initial={initial}
      hasDraft={!!(en.draft || fr.draft || ar.draft)}
      t={t.content}
      uiLang={lang}
      portalUrl={process.env.PORTAL_URL ?? "http://localhost:3000"}
      viewPath={viewPaths[key] ?? ""}
    />
  );
}
