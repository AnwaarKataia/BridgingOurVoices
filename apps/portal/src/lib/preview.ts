import { draftMode } from "next/headers";
import { apiUrl } from "@/lib/site";
import { CONTENT_TAG } from "@/lib/content";

/**
 * Preview (owner, 2026-11-21): the team opens the site from the dashboard with a signed link; Next's draft
 * mode is switched on for their browser only, and pages then also show hidden sections and draft courses
 * and events. The API trusts the shared REVALIDATE_SECRET sent in `x-preview-secret`.
 */
// The development default is public (the code is on GitHub), so production requires REVALIDATE_SECRET
export const previewSecret = process.env.REVALIDATE_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "dev-revalidate-secret");

export async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

/** GET from the API: cached with the page content, or fresh with drafts in preview. Null when unreachable. */
export async function apiGetJson<T>(path: string): Promise<T | null> {
  const preview = await isPreview();
  try {
    const res = await fetch(
      `${apiUrl}${path}`,
      preview && previewSecret
        ? { cache: "no-store", headers: { "x-preview-secret": previewSecret }, signal: AbortSignal.timeout(4000) }
        : { next: { revalidate: 300, tags: [CONTENT_TAG] }, signal: AbortSignal.timeout(4000) },
    );
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Sections that stay "Coming soon" until the team switches them on in the dashboard. */
export type SectionKey = "seminars" | "conferences" | "fellowship";

export async function hiddenSections(): Promise<Record<SectionKey, boolean>> {
  const preview = await isPreview();
  const data = await apiGetJson<{ sections: Record<SectionKey, boolean> }>("/public/sections");
  const visible = data?.sections ?? { seminars: false, conferences: false, fellowship: false };
  // In preview everything shows; otherwise hidden unless switched on (also when the API is down)
  return {
    seminars: !preview && !visible.seminars,
    conferences: !preview && !visible.conferences,
    fellowship: !preview && !visible.fellowship,
  };
}
