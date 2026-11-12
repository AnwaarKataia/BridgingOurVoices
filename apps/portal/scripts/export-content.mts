/**
 * Writes the built-in copy of every content file to apps/api/seed/content.json.
 * The API inserts it into the database the first time it starts, and adds new fields from it later
 * (existing text in the database is never overwritten).
 *
 *   pnpm --filter @bov/portal content:export
 *
 * Run it after adding or changing fields in src/content/*.ts, then restart the API.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defaults as site } from "../src/content/site";
import { defaults as home } from "../src/content/home";
import { defaults as about } from "../src/content/about";
import { defaults as activities } from "../src/content/activities";
import { defaults as agenda } from "../src/content/agenda";
import { defaults as network } from "../src/content/network";
import { defaults as contact } from "../src/content/contact";
import { defaults as privacy } from "../src/content/privacy";

const all = { site, home, about, activities, agenda, network, contact, privacy };
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "api", "seed", "content.json");
await mkdir(dirname(out), { recursive: true });
await writeFile(out, JSON.stringify(all, null, 2) + "\n");
console.log(`✓ Exported ${Object.keys(all).length} pages × 3 languages to ${out}`);
