ALTER TABLE "applications" ADD COLUMN "kind" text DEFAULT 'voice' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "connections" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX "applications_kind_idx" ON "applications" USING btree ("kind");