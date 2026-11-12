import { revalidateTag } from "next/cache";
import { CONTENT_TAG } from "@/lib/content";

/**
 * Called by the API after content is published in the dashboard: expires the cached content at once,
 * so the next visit to any page shows the new text and images.
 */
// The development default is public (the code is on GitHub), so production requires REVALIDATE_SECRET
const secret = process.env.REVALIDATE_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "dev-revalidate-secret");

export async function POST(request: Request) {
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ ok: true });
}
