import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { count } from "drizzle-orm";
import { apiRoot, db, schema } from "./db/client.js";
import type { I18n } from "./db/schema.js";

type SeedEvent = { slug: string; tone: "event" | "series" | "deadline"; dates: string[]; kind: I18n; title: I18n; place: I18n; body: I18n };

/**
 * The agenda's sample events from the brand file (owner, 2026-11-21: not decided yet), inserted once as
 * DRAFTS when there are no events: the team sees them in the dashboard calendar, the public doesn't.
 */
export async function seedEvents(log: (m: string) => void) {
  const [{ n }] = await db.select({ n: count() }).from(schema.events);
  if (n > 0) return;
  const items = JSON.parse(await readFile(join(apiRoot, "seed", "events.json"), "utf8")) as SeedEvent[];
  for (const e of items) {
    await db.insert(schema.events).values({ ...e, status: "draft", registrationOpen: e.tone !== "deadline" });
  }
  log(`agenda: seeded ${items.length} draft events`);
}
