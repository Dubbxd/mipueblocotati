CREATE TABLE "surveys" (
	"id" serial PRIMARY KEY NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"name" varchar(120),
	"email" varchar(200),
	"locale" varchar(10) DEFAULT 'es',
	"created_at" timestamp DEFAULT now() NOT NULL
);
