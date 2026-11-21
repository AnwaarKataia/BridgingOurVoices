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
    /** new → review (being looked at) / hold (later) → replied → archived. */
    status: text("status", { enum: ["new", "review", "hold", "replied", "archived"] }).notNull().default("new"),
    /** Internal note from the team (never shown to the sender). */
    note: text("note").notNull().default(""),
    handledBy: uuid("handled_by").references(() => users.id, { onDelete: "set null" }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("contact_messages_status_idx").on(t.status)],
);

/**
 * Submissions from the two network forms (owner, 2026-11-14):
 *  - kind "voice": "Add your voice to ours" (Join page): details + statement (quote) + optional article,
 *    which may be published on the site;
 *  - kind "member": membership application (Membership page): details + experience, CV, motivation,
 *    activities, organisations they could connect us with.
 */
export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey(),
    kind: text("kind", { enum: ["voice", "member"] }).notNull().default("voice"),
    name: text("name").notNull(),
    gender: text("gender").notNull(),
    job: text("job").notNull(),
    org: text("org").notNull().default(""),
    country: text("country").notNull(),
    email: text("email").notNull(),
    religion: text("religion").notNull(),
    subreligion: text("subreligion").notNull().default(""),
    fields: jsonb("fields").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    /** "voice" only: statement of support and optional article. */
    quote: text("quote").notNull().default(""),
    article: text("article").notNull().default(""),
    /** "member" only: experience summary (max 150 words), motivation, activities, organisations they could connect us with. */
    experience: text("experience").notNull().default(""),
    motivation: text("motivation").notNull().default(""),
    activities: text("activities").notNull().default(""),
    connections: text("connections").notNull().default(""),
    /** Private files in apps/api/data/uploads (served only to signed-in dashboard users). */
    photo: text("photo"),
    cv: text("cv"),
    locale: text("locale").notNull().default("en"),
    /** pending (new) → review / hold (later) → approved / rejected. */
    status: text("status", { enum: ["pending", "review", "hold", "approved", "rejected"] }).notNull().default("pending"),
    /** Internal note from the team (never shown to the applicant). */
    note: text("note").notNull().default(""),
    /** The applicant ticked "may be published" on the form; publishing on the site needs it. */
    publishConsent: boolean("publish_consent").notNull().default(false),
    /** Shown on the site: "voice" on the Join page, "member" on Our members. Only when approved + consent. */
    published: boolean("published").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("applications_status_idx").on(t.status), index("applications_kind_idx").on(t.kind)],
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

/**
 * E-learning (owner, 2026-11-21): online courses and webinars built in the dashboard. A course is hidden
 * from the public until published (the site shows "coming soon" meanwhile).
 * Text fields hold the three languages: { en, fr, ar }.
 */
export type I18n = { en: string; fr: string; ar: string };

export const courses = pgTable(
  "courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Address on the site: /<lang>/e-learning/<slug>. */
    slug: text("slug").notNull().unique(),
    /** course = e-learning course · webinar = online seminar. */
    kind: text("kind", { enum: ["course", "webinar"] }).notNull().default("course"),
    status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
    title: json("title").$type<I18n>().notNull(),
    summary: json("summary").$type<I18n>().notNull(),
    description: json("description").$type<I18n>().notNull(),
    /** self-paced · instructor-led · live (webinars). */
    format: text("format", { enum: ["self-paced", "instructor-led", "live"] }).notNull().default("self-paced"),
    programmeArea: json("programme_area").$type<I18n>().notNull(),
    duration: json("duration").$type<I18n>().notNull(),
    learningTime: json("learning_time").$type<I18n>().notNull(),
    fees: json("fees").$type<I18n>().notNull(),
    /** Languages the course is taught in: "ar", "en", "fr". */
    languages: jsonb("languages").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    startDate: text("start_date"),
    deadline: text("deadline"),
    certificate: boolean("certificate").notNull().default(true),
    /** Site image path ("" = striped placeholder) and course flyer (PDF in the media store). */
    image: text("image").notNull().default(""),
    flyer: text("flyer").notNull().default(""),
    /** Registrations open on the published course page. */
    registrationOpen: boolean("registration_open").notNull().default(true),
    sort: integer("sort").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [index("courses_status_idx").on(t.status)],
);

/** Units of a course, in order. */
export const courseModules = pgTable(
  "course_modules",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    sort: integer("sort").notNull().default(0),
    title: json("title").$type<I18n>().notNull(),
    summary: json("summary").$type<I18n>().notNull(),
  },
  (t) => [index("course_modules_course_idx").on(t.courseId)],
);

/** Lessons of a unit: a video (YouTube / Vimeo link), a file (PDF), a text, or an external link. */
export const courseLessons = pgTable(
  "course_lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    moduleId: uuid("module_id").notNull().references(() => courseModules.id, { onDelete: "cascade" }),
    sort: integer("sort").notNull().default(0),
    type: text("type", { enum: ["video", "file", "text", "link"] }).notNull().default("video"),
    title: json("title").$type<I18n>().notNull(),
    body: json("body").$type<I18n>().notNull(),
    videoUrl: text("video_url").notNull().default(""),
    fileUrl: text("file_url").notNull().default(""),
    linkUrl: text("link_url").notNull().default(""),
    minutes: integer("minutes").notNull().default(0),
  },
  (t) => [index("course_lessons_module_idx").on(t.moduleId)],
);

/** "Register" on a published course page (phase 1: the team follows up; learner accounts come later). */
export const courseRegistrations = pgTable(
  "course_registrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    country: text("country").notNull(),
    locale: text("locale").notNull().default("en"),
    status: text("status", { enum: ["new", "accepted", "rejected"] }).notNull().default("new"),
    createdAt: createdAt(),
  },
  (t) => [index("course_registrations_course_idx").on(t.courseId)],
);
