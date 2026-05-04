CREATE TYPE "public"."blog_post_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled');--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title_es" varchar(300) NOT NULL,
	"title_en" varchar(300) NOT NULL,
	"excerpt_es" text,
	"excerpt_en" text,
	"body_es" text NOT NULL,
	"body_en" text,
	"cover_image" varchar(400),
	"category" varchar(60) DEFAULT 'news' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "blog_post_status" DEFAULT 'draft' NOT NULL,
	"ai_generated" boolean DEFAULT false NOT NULL,
	"meta_title_es" varchar(160),
	"meta_title_en" varchar(160),
	"meta_description_es" varchar(320),
	"meta_description_en" varchar(320),
	"author_id" integer,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"subject_es" varchar(200) NOT NULL,
	"subject_en" varchar(200) NOT NULL,
	"preview_text_es" varchar(200),
	"preview_text_en" varchar(200),
	"body_html_es" text NOT NULL,
	"body_html_en" text,
	"blog_post_id" integer,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"mailjet_campaign_id" varchar(80),
	"scheduled_at" timestamp,
	"sent_at" timestamp,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_blog_post_id_blog_posts_id_fk" FOREIGN KEY ("blog_post_id") REFERENCES "public"."blog_posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blog_posts_status_idx" ON "blog_posts" USING btree ("status");