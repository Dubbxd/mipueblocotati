ALTER TABLE "reservation_settings" ADD COLUMN IF NOT EXISTS "auto_confirm" boolean NOT NULL DEFAULT false;
