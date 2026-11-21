import { cookies } from "next/headers";
import { apiUrl } from "@/lib/site";
import { isPreview, previewSecret } from "@/lib/preview";
import type { I18n } from "@/lib/courses";

/**
 * Learner side of e-learning (phase 2, 2026-11-21). Server pages call the API with the visitor's own learner
 * cookie (never cached); the browser reaches the same routes at /learn-api/*.
 */
export const LEARNER_COOKIE = "bov_learner";

export type Learner = { id: string; name: string; email: string; country: string; hasPhoto: boolean };
export type LessonType = "video" | "file" | "text" | "link";
export type PlayerLesson = {
  id: string;
  type: LessonType;
  title: I18n;
  body: I18n;
  videoUrl: string;
  fileUrl: string;
  linkUrl: string;
  minutes: number;
  done: boolean;
  /** Opens once the previous step is finished (owner, 2026-11-21). */
  locked: boolean;
  /** Seconds still needed on the lesson before "Mark as done". */
  waitSeconds: number;
};
export type PlayerQuiz = {
  passMark: number;
  locked: boolean;
  best: { score: number; total: number; passed: boolean } | null;
  questions: { id: string; text: I18n; options: { id: string; text: I18n }[] }[];
};
export type PlayerCourse = {
  slug: string;
  kind: "course" | "webinar";
  title: I18n;
  certificate: boolean;
  progress: { done: number; total: number };
  modules: { id: string; title: I18n; summary: I18n; lessons: PlayerLesson[]; quiz: PlayerQuiz | null }[];
};
export type Participant = { id: string; name: string; country: string; job: string; org: string; bio: string; me: boolean; hasPhoto: boolean; email?: string };
export type Profile = { id: string; name: string; email: string; country: string; job: string; org: string; bio: string; showProfile: boolean; hasPhoto: boolean };
export type MyCourse = { slug: string; kind: "course" | "webinar"; title: I18n; image: string; certificate: boolean; progress: { done: number; total: number } };

export async function learnerGet<T>(path: string): Promise<{ status: number; data: T | null }> {
  const token = (await cookies()).get(LEARNER_COOKIE)?.value;
  const headers: Record<string, string> = {};
  if (token) headers.cookie = `${LEARNER_COOKIE}=${token}`;
  if ((await isPreview()) && previewSecret) headers["x-preview-secret"] = previewSecret;
  try {
    const res = await fetch(`${apiUrl}/learn${path}`, { headers, cache: "no-store", signal: AbortSignal.timeout(4000) });
    return { status: res.status, data: res.ok ? ((await res.json()) as T) : null };
  } catch {
    return { status: 503, data: null };
  }
}

/** Embeddable player address for a YouTube or Vimeo link (privacy-enhanced YouTube), or null. */
export function embedUrl(url: string): string | null {
  const yt = /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([\w-]{6,})/.exec(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0`;
  const vm = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}
