/**
 * Asks the portal to drop its cached data (page content, published voices and members) so changes made in
 * the dashboard show on the site within seconds. Without it the portal still refreshes every 5 minutes.
 */
const portalUrl = process.env.PORTAL_URL ?? "http://localhost:3000";
// The development default is public (the code is on GitHub); production must set REVALIDATE_SECRET
const revalidateSecret = process.env.REVALIDATE_SECRET ?? (process.env.NODE_ENV === "production" ? "" : "dev-revalidate-secret");

export async function revalidatePortal(log: (msg: string) => void) {
  if (!revalidateSecret) return log("REVALIDATE_SECRET is not set: the portal refreshes on its 5-minute timer");
  try {
    const res = await fetch(`${portalUrl}/api/revalidate`, {
      method: "POST",
      headers: { "x-revalidate-secret": revalidateSecret },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) log(`portal revalidate answered ${res.status}`);
  } catch (err) {
    log(`portal revalidate failed: ${(err as Error).message}`);
  }
}
