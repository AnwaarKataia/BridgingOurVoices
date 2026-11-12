import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import * as schema from "./schema.js";

/** apps/api (same depth from src/db and dist/db). */
export const apiRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
/** Local data folder (gitignored): embedded database + uploaded photos. */
export const dataDir = join(apiRoot, "data");
const migrationsFolder = join(apiRoot, "drizzle");

/**
 * DATABASE_URL set → real Postgres (production, e.g. Neon).
 * Not set → embedded Postgres (PGlite) stored in apps/api/data/db, so local development needs no install.
 * Only the API opens the database; the dashboard and portal talk to the API.
 */
function connect() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = new pg.Pool({ connectionString: url });
    const db = drizzlePg(pool, { schema });
    return { db, migrate: () => migratePg(db, { migrationsFolder }), close: () => pool.end() };
  }
  mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(join(dataDir, "db"));
  const db = drizzlePglite(client, { schema });
  return { db, migrate: () => migratePglite(db, { migrationsFolder }), close: () => client.close() };
}

const conn = connect();

/** Typed query builder. Both drivers share the Postgres dialect, so one type is used. */
export const db = conn.db as unknown as ReturnType<typeof drizzlePg<typeof schema>>;
export const runMigrations = conn.migrate;
export const closeDb = conn.close;
export { schema };
