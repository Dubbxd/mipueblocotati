ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "allowed_modules" jsonb NOT NULL DEFAULT '[]'::jsonb;
