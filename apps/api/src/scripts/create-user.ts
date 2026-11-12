/**
 * Creates a dashboard account, or resets its password if the email already exists.
 *
 *   pnpm --filter @bov/api user:create -- --email you@example.org --name "Your Name" --role admin
 *
 * Locally, stop the API first: the embedded database allows one process at a time.
 * The password is typed (hidden) twice in the terminal, or add --random to generate a temporary one
 * (saved to apps/api/data/<email>.password.local.txt, never printed). For automated tests only, it can come
 * from BOV_PASSWORD. Rule: 12+ characters with letters, numbers and symbols.
 * Roles: admin (everything) or editor (review and reply).
 */
import { createInterface } from "node:readline";
import { Writable } from "node:stream";
import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { closeDb, dataDir, db, runMigrations, schema } from "../db/client.js";
import { hashPassword, MIN_PASSWORD, passwordProblem, randomPassword } from "../auth/password.js";

const { values } = parseArgs({
  options: {
    email: { type: "string" },
    name: { type: "string" },
    role: { type: "string", default: "editor" },
    // Generate a temporary password and save it to apps/api/data/<email>.password.local.txt (not printed)
    random: { type: "boolean", default: false },
  },
});

function fail(message: string): never {
  console.error(`✗ ${message}`);
  process.exit(1);
}

/** Reads a line without echoing it. */
function askHidden(question: string): Promise<string> {
  let muted = false;
  const output = new Writable({
    write(chunk, _enc, cb) {
      if (!muted) process.stdout.write(chunk);
      cb();
    },
  });
  const rl = createInterface({ input: process.stdin, output, terminal: true });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
    muted = true;
  });
}

const email = values.email?.trim().toLowerCase();
const role = values.role;
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Give a valid --email");
if (role !== "admin" && role !== "editor") fail("--role must be admin or editor");

// The embedded local database can only be opened by one process: refuse while the API is running
if (!process.env.DATABASE_URL) {
  const running = await fetch(`http://localhost:${process.env.PORT ?? 4000}/health`, { signal: AbortSignal.timeout(1500) })
    .then(() => true)
    .catch(() => false);
  if (running) fail("Stop the API first (it holds the local database open), then run this again.");
}

await runMigrations();
const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
const name = values.name?.trim() || existing?.name;
if (!name) fail("Give a --name for a new account");

let password = values.random ? randomPassword() : (process.env.BOV_PASSWORD ?? "");
if (!password) {
  password = await askHidden(`Password for ${email} (${MIN_PASSWORD}+ characters, with letters, numbers and symbols): `);
  const again = await askHidden("Repeat the password: ");
  if (password !== again) fail("The passwords don't match");
}
const problem = passwordProblem(password);
if (problem) fail(`The password needs ${problem === "length" ? `at least ${MIN_PASSWORD} characters` : `at least one ${problem}`}`);
let savedTo = "";
if (values.random) {
  // Written to the gitignored data folder; the user reads it once, signs in, changes it, and deletes the file
  savedTo = join(dataDir, `${email}.password.local.txt`);
  await mkdir(dataDir, { recursive: true });
  await writeFile(savedTo, `${password}\n`, { mode: 0o600 });
}

const passwordHash = await hashPassword(password);
if (existing) {
  await db.update(schema.users).set({ name, role, passwordHash, disabled: false }).where(eq(schema.users.id, existing.id));
  // A password reset signs the account out everywhere
  await db.delete(schema.sessions).where(eq(schema.sessions.userId, existing.id));
  console.log(`✓ Updated ${email} (${role}); all its sessions were signed out.`);
} else {
  await db.insert(schema.users).values({ email, name, role, passwordHash });
  console.log(`✓ Created ${email} (${role}).`);
}
if (savedTo) console.log(`  Temporary password saved in: ${savedTo}\n  Sign in, change it under "My account", then delete that file.`);
await closeDb();
