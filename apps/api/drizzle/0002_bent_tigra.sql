ALTER TABLE "content" ALTER COLUMN "published" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "content" ALTER COLUMN "draft" SET DATA TYPE json;--> statement-breakpoint
ALTER TABLE "content_revisions" ALTER COLUMN "data" SET DATA TYPE json;