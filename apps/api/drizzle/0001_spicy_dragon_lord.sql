CREATE TABLE "content" (
	"key" text NOT NULL,
	"locale" text NOT NULL,
	"published" jsonb NOT NULL,
	"draft" jsonb,
	"draft_updated_at" timestamp with time zone,
	"draft_updated_by" uuid,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_by" uuid,
	CONSTRAINT "content_key_locale_pk" PRIMARY KEY("key","locale")
);
--> statement-breakpoint
CREATE TABLE "content_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"locale" text NOT NULL,
	"data" jsonb NOT NULL,
	"note" text DEFAULT 'publish' NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY NOT NULL,
	"file" text NOT NULL,
	"original_name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_file_unique" UNIQUE("file")
);
--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_draft_updated_by_users_id_fk" FOREIGN KEY ("draft_updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_revisions_key_idx" ON "content_revisions" USING btree ("key","created_at");