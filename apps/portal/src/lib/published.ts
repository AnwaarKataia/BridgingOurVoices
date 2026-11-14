import { apiUrl } from "@/lib/site";
import { CONTENT_TAG } from "@/lib/content";

/**
 * Submissions the team published from the dashboard (owner, 2026-11-14): "Add your voice to ours"
 * statements (Join page) and accepted members (Our members page). Only submissions whose sender ticked
 * "may be published" can be published. Cached with the page content and refreshed when the team publishes.
 */
export type PublishedVoice = { id: string; name: string; job: string; org: string; country: string; quote: string; article: string; photo: string | null };
export type PublishedMember = { id: string; name: string; job: string; org: string; country: string; experience: string; photo: string | null };

async function load<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${apiUrl}${path}`, { next: { revalidate: 300, tags: [CONTENT_TAG] }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return [];
    return ((await res.json()) as { items?: T[] }).items ?? [];
  } catch {
    // API down: the section simply doesn't show
    return [];
  }
}

export const getPublishedVoices = () => load<PublishedVoice>("/public/voices");
export const getPublishedMembers = () => load<PublishedMember>("/public/members");
