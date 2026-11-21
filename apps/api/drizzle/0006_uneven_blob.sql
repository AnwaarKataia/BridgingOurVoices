CREATE TABLE "course_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" uuid NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"type" text DEFAULT 'video' NOT NULL,
	"title" json NOT NULL,
	"body" json NOT NULL,
	"video_url" text DEFAULT '' NOT NULL,
	"file_url" text DEFAULT '' NOT NULL,
	"link_url" text DEFAULT '' NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"title" json NOT NULL,
	"summary" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"country" text NOT NULL,
	"locale" text DEFAULT 'en' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"kind" text DEFAULT 'course' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"title" json NOT NULL,
	"summary" json NOT NULL,
	"description" json NOT NULL,
	"format" text DEFAULT 'self-paced' NOT NULL,
	"programme_area" json NOT NULL,
	"duration" json NOT NULL,
	"learning_time" json NOT NULL,
	"fees" json NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"start_date" text,
	"deadline" text,
	"certificate" boolean DEFAULT true NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"flyer" text DEFAULT '' NOT NULL,
	"registration_open" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_registrations" ADD CONSTRAINT "course_registrations_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_lessons_module_idx" ON "course_lessons" USING btree ("module_id");--> statement-breakpoint
CREATE INDEX "course_modules_course_idx" ON "course_modules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "course_registrations_course_idx" ON "course_registrations" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "courses_status_idx" ON "courses" USING btree ("status");