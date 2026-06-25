-- Coupon status enum
DO $$ BEGIN
  CREATE TYPE coupon_status AS ENUM ('active', 'redeemed', 'expired');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Coupons table
CREATE TABLE IF NOT EXISTS "coupons" (
  "id" serial PRIMARY KEY,
  "code" varchar(20) NOT NULL,
  "type" varchar(20) NOT NULL DEFAULT 'welcome',
  "discount_type" varchar(10) NOT NULL DEFAULT 'fixed',
  "discount_value" decimal(8,2) NOT NULL,
  "min_purchase" decimal(8,2),
  "description" varchar(200),
  "subscriber_email" varchar(200),
  "contact_id" integer REFERENCES "contacts"("id") ON DELETE SET NULL,
  "status" coupon_status NOT NULL DEFAULT 'active',
  "expires_at" timestamp,
  "redeemed_at" timestamp,
  "redeemed_by" varchar(120),
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "coupons_code_idx" ON "coupons" ("code");
CREATE INDEX IF NOT EXISTS "coupons_status_idx" ON "coupons" ("status");
CREATE INDEX IF NOT EXISTS "coupons_email_idx" ON "coupons" ("subscriber_email");
