import type { MetadataRoute } from "next";
import { publishedLocales } from "@/i18n/config";
import { siteUrl } from "@/lib/site";
import { getEvents } from "@/lib/events";

/** Page paths without locale. Add each new page here. */
const pages: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/about/who-we-are", priority: 0.8 },
  { path: "/about/vision", priority: 0.7 },
  { path: "/about/mission", priority: 0.7 },
  { path: "/about/goals", priority: 0.7 },
  { path: "/activities/training", priority: 0.9 },
  { path: "/activities/seminars", priority: 0.8 },
  { path: "/activities/conferences", priority: 0.8 },
  { path: "/activities/fellowship", priority: 0.8 },
  { path: "/activities/e-learning", priority: 0.8 },
  { path: "/activities/news", priority: 0.8 },
  { path: "/agenda", priority: 0.8 },
  { path: "/network/membership", priority: 0.7 },
  { path: "/network/join", priority: 0.8 },
  { path: "/network/members", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/privacy", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Published agenda events only (the sitemap is never built in preview)
  const events = (await getEvents()).filter((e) => e.status === "published").map((e) => ({ path: `/agenda/${e.slug}`, priority: 0.6 }));
  return [...pages, ...events].flatMap(({ path, priority }) => {
    const languages = Object.fromEntries(publishedLocales.map((l) => [l, `${siteUrl}/${l}${path}`]));
    return publishedLocales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
      alternates: { languages },
    }));
  });
}
