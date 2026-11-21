import type { Locale } from "@/i18n/config";
import { apiUrl } from "@/lib/site";
import { CONTENT_TAG } from "@/lib/content";

/**
 * Published e-learning courses and webinars (owner, 2026-11-21), built in the dashboard. Drafts never reach
 * the site. Cached with the page content and refreshed when the team publishes or edits a published course.
 */
export type I18n = { en: string; fr: string; ar: string };
export type CourseKind = "course" | "webinar";
export type CourseFormat = "self-paced" | "instructor-led" | "live";
export type CourseCard = {
  slug: string;
  kind: CourseKind;
  title: I18n;
  summary: I18n;
  format: CourseFormat;
  image: string;
  certificate: boolean;
  languages: string[];
  modules: number;
};
export type CourseDetail = Omit<CourseCard, "modules"> & {
  description: I18n;
  programmeArea: I18n;
  duration: I18n;
  learningTime: I18n;
  fees: I18n;
  startDate: string | null;
  deadline: string | null;
  flyer: string;
  registrationOpen: boolean;
  modules: { title: I18n; summary: I18n; lessons: { title: I18n; type: "video" | "file" | "text" | "link"; minutes: number }[] }[];
};

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiUrl}${path}`, { next: { revalidate: 300, tags: [CONTENT_TAG] }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getCourses(): Promise<CourseCard[]> {
  return (await get<{ items: CourseCard[] }>("/public/courses"))?.items ?? [];
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return (await get<{ course: CourseDetail }>(`/public/courses/${slug}`))?.course ?? null;
}

/** The text in the page language; falls back to the other languages so a half-translated course still shows. */
export const pick = (v: I18n, locale: Locale) => v[locale] || v.en || v.ar || v.fr;
