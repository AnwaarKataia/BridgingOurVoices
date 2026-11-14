ALTER TABLE "applications" ALTER COLUMN "quote" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "experience" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "motivation" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "activities" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "cv" text;