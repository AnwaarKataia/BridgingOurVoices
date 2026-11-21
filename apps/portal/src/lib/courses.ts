import type { Locale } from "@/i18n/config";
import { apiGetJson } from "@/lib/preview";

/**
 * Published e-learning courses and webinars (owner, 2026-11-21), built in the dashboard. Drafts only show in
 * the team's preview. Cached with the page content and refreshed when the team publishes or edits a published course.
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

const get = <T,>(path: string) => apiGetJson<T>(path);

export async function getCourses(): Promise<CourseCard[]> {
  return (await get<{ items: CourseCard[] }>("/public/courses"))?.items ?? [];
}

export async function getCourse(slug: string): Promise<CourseDetail | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return (await get<{ course: CourseDetail }>(`/public/courses/${slug}`))?.course ?? null;
}

/** The text in the page language; falls back to the other languages so a half-translated course still shows. */
export const pick = (v: I18n, locale: Locale) => v[locale] || v.en || v.ar || v.fr;
