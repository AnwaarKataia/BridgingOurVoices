CREATE TABLE "learner_password_resets" (
	"id" text PRIMARY KEY NOT NULL,
	"learner_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "learner_password_resets" ADD CONSTRAINT "learner_password_resets_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "learner_password_resets_learner_idx" ON "learner_password_resets" USING btree ("learner_id");