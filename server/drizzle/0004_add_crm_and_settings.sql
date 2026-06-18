-- CRM: contacts
CREATE TABLE IF NOT EXISTS "contacts" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(200),
  "phone" varchar(40),
  "name" varchar(160),
  "locale" varchar(5) NOT NULL DEFAULT 'es',
  "tags" jsonb NOT NULL DEFAULT '[]',
  "notes" text,
  "consent_terms" boolean NOT NULL DEFAULT false,
  "consent_data" boolean NOT NULL DEFAULT false,
  "consent_marketing" boolean NOT NULL DEFAULT false,
  "consented_at" timestamp,
  "is_subscriber" boolean NOT NULL DEFAULT false,
  "first_seen" timestamp NOT NULL DEFAULT now(),
  "last_seen" timestamp NOT NULL DEFAULT now(),
  "visit_count" integer NOT NULL DEFAULT 1,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "contacts_email_idx" ON "contacts" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "contacts_phone_idx" ON "contacts" ("phone");

-- CRM: contact interactions
CREATE TABLE IF NOT EXISTS "contact_interactions" (
  "id" serial PRIMARY KEY NOT NULL,
  "contact_id" integer NOT NULL REFERENCES "contacts"("id") ON DELETE CASCADE,
  "type" varchar(40) NOT NULL,
  "ref_table" varchar(60),
  "ref_id" integer,
  "summary" text,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "contact_interactions_contact_idx" ON "contact_interactions" ("contact_id");
CREATE INDEX IF NOT EXISTS "contact_interactions_type_idx" ON "contact_interactions" ("type");

-- CRM: contact messages
CREATE TABLE IF NOT EXISTS "contact_messages" (
  "id" serial PRIMARY KEY NOT NULL,
  "contact_id" integer REFERENCES "contacts"("id") ON DELETE SET NULL,
  "name" varchar(160) NOT NULL,
  "email" varchar(200),
  "phone" varchar(40),
  "subject" varchar(200),
  "message" text NOT NULL,
  "consent_terms" boolean NOT NULL DEFAULT false,
  "consent_data" boolean NOT NULL DEFAULT false,
  "status" varchar(40) NOT NULL DEFAULT 'new',
  "admin_notes" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- Reservation settings (single-row config)
CREATE TABLE IF NOT EXISTS "reservation_settings" (
  "id" serial PRIMARY KEY NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "available_days" jsonb NOT NULL DEFAULT '[1,2,3,4,5,6]',
  "time_slots" jsonb NOT NULL DEFAULT '["12:00","13:00","14:00","18:00","19:00","20:00","21:00"]',
  "min_party_size" integer NOT NULL DEFAULT 1,
  "max_party_size" integer NOT NULL DEFAULT 8,
  "slot_capacity" integer NOT NULL DEFAULT 30,
  "min_advance_hours" integer NOT NULL DEFAULT 2,
  "max_advance_days" integer NOT NULL DEFAULT 60,
  "closed_message" jsonb,
  "updated_at" timestamp NOT NULL DEFAULT now()
);
INSERT INTO "reservation_settings" ("id") VALUES (1) ON CONFLICT DO NOTHING;

-- Blocked dates
CREATE TABLE IF NOT EXISTS "blocked_dates" (
  "id" serial PRIMARY KEY NOT NULL,
  "date" varchar(10) NOT NULL UNIQUE,
  "reason" text,
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Surveys: add consent columns (missed in 0002)
ALTER TABLE "surveys" ADD COLUMN IF NOT EXISTS "consent_terms" boolean NOT NULL DEFAULT false;
ALTER TABLE "surveys" ADD COLUMN IF NOT EXISTS "consent_data" boolean NOT NULL DEFAULT false;
