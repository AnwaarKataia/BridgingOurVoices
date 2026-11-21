CREATE TABLE "lesson_opens" (
	"learner_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lesson_opens_learner_id_lesson_id_pk" PRIMARY KEY("learner_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learner_id" uuid NOT NULL,
	"module_id" uuid NOT NULL,
	"score" integer NOT NULL,
	"total" integer NOT NULL,
	"passed" boolean NOT NULL,
	"answers" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"text" json NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"correct" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_modules" ADD COLUMN "pass_mark" integer DEFAULT 70 NOT NULL;--> statement-breakpoint
ALTER TABLE "learners" ADD COLUMN "job" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "learners" ADD COLUMN "org" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "learners" ADD COLUMN "bio" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "learners" ADD COLUMN "show_profile" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "lesson_opens" ADD CONSTRAINT "lesson_opens_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_opens" ADD CONSTRAINT "lesson_opens_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_learner_id_learners_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."learners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "quiz_attempts_learner_idx" ON "quiz_attempts" USING btree ("learner_id","module_id");--> statement-breakpoint
CREATE INDEX "quiz_questions_module_idx" ON "quiz_questions" USING btree ("module_id");