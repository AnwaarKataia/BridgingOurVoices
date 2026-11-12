import { sql } from "drizzle-orm";
import { boolean, index, integer, json, jsonb, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

/**
 * Database schema (Postgres). Locally the API runs an embedded Postgres (PGlite) in apps/api/data/db;
 * in production it connects to DATABASE_URL. After changing this file run `pnpm --filter @bov/api db:generate`
 * — migrations in apps/api/drizzle are applied automatically when the API starts.
 */

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** Dashboard accounts. admin = everything (incl. users); editor = review and reply. */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
  passwordHash: text("password_hash").notNull(),
  disabled: boolean("disabled").notNull().default(false),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/** Login sessions. Only the SHA-256 of the cookie token is stored. */
export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Newsletter (portal footer). */
export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/** Contact form (portal /contact). */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    topic: text("topic").notNull(),
    message: text("message").notNull(),
    locale: text("locale").notNull().default("en"),
    status: text("status", { enum: ["new", "read", "replied", "archived"] }).notNull().default("new"),
    createdAt: createdAt(),
  },
  (t) => [index("contact_messages_status_idx").on(t.status)],
);

/** Membership applications (portal /network/join). */
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey(),
    name: text("name").notNull(),
    gender: text("gender").notNull(),
    job: text("job").notNull(),
    org: text("org").notNull().default(""),
    country: text("country").notNull(),
    email: text("email").notNull(),
    religion: text("religion").notNull(),
    subreligion: text("subreligion").notNull().default(""),
    fields: jsonb("fields").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    quote: text("quote").notNull(),
    article: text("article").notNull().default(""),
    /** File name in the uploads store, or null. */
    photo: text("photo"),
    locale: text("locale").notNull().default("en"),
    status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("applications_status_idx").on(t.status)],
);

/**
 * Website content, one row per page document and language (keys: site, home, about, activities, agenda,
 * network, contact, privacy). `published` is what the portal shows; `draft` is unpublished edits (or null).
 * Seeded from apps/api/seed/content.json (exported from the portal's content files).
 */
export const content = pgTable(
  "content",
  {
    key: text("key").notNull(),
    locale: text("locale").notNull(),
    // json (not jsonb) keeps the key order, so the editor shows fields in page order
    published: json("published").notNull(),
    draft: json("draft"),
    draftUpdatedAt: timestamp("draft_updated_at", { withTimezone: true }),
    draftUpdatedBy: uuid("draft_updated_by").references(() => users.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    publishedBy: uuid("published_by").references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [primaryKey({ columns: [t.key, t.locale] })],
);

/** Every published version (and the seed), for history and restore. */
export const contentRevisions = pgTable(
  "content_revisions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    locale: text("locale").notNull(),
    data: json("data").notNull(),
    note: text("note").notNull().default("publish"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (t) => [index("content_revisions_key_idx").on(t.key, t.createdAt)],
);

/** Images uploaded from the dashboard; served publicly at /media/<file>. */
export const media = pgTable("media", {
  id: uuid("id").primaryKey(),
  file: text("file").notNull().unique(),
  originalName: text("original_name").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: createdAt(),
});

export type User = typeof users.$inferSelect;
export type Role = User["role"];
