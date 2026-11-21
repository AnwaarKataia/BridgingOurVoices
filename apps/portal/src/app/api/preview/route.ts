import { createHmac, timingSafeEqual } from "node:crypto";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { previewSecret } from "@/lib/preview";

/**
 * /api/preview?token=…&to=/ar/activities/seminars — switches preview on for this browser (team only).
 * The token comes from the API (/admin/preview-token, signed-in dashboard users) and is valid for 2 hours.
 * /api/preview?exit=1&to=… switches it off.
 */
function validToken(token: string) {
  const [exp, sig] = token.split(".");
  if (!previewSecret || !exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", previewSecret).update(`preview:${exp}`).digest("hex");
  return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

/** Only paths on this site (never another domain). */
const safePath = (to: string | null) => (to && /^\/(en|fr|ar)(\/[\w\-/]*)?$/.test(to) ? to : "/en");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const to = safePath(url.searchParams.get("to"));
  const dm = await draftMode();
  if (url.searchParams.get("exit")) {
    dm.disable();
    redirect(to);
  }
  if (!validToken(url.searchParams.get("token") ?? "")) return new Response("Invalid or expired preview link.", { status: 401 });
  dm.enable();
  redirect(to);
}
