import { defineConfig } from "drizzle-kit";

// Generates SQL migrations from src/db/schema.ts into ./drizzle (no database connection needed).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
});
