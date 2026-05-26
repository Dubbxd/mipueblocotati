/**
 * Migration: create reservation_settings and blocked_dates tables
 * Run: cd server && bun scripts/create-reservation-config.ts
 */
import 'dotenv/config'
import { sql } from '../src/db/client'

console.log('🗄️  Creating reservation config tables...')

await sql`
  CREATE TABLE IF NOT EXISTS reservation_settings (
    id                SERIAL PRIMARY KEY,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    available_days    JSONB   NOT NULL DEFAULT '[1,2,3,4,5,6]',
    time_slots        JSONB   NOT NULL DEFAULT '["12:00","13:00","14:00","18:00","19:00","20:00","21:00"]',
    min_party_size    INTEGER NOT NULL DEFAULT 1,
    max_party_size    INTEGER NOT NULL DEFAULT 8,
    slot_capacity     INTEGER NOT NULL DEFAULT 30,
    min_advance_hours INTEGER NOT NULL DEFAULT 2,
    max_advance_days  INTEGER NOT NULL DEFAULT 60,
    closed_message    JSONB,
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS blocked_dates (
    id         SERIAL PRIMARY KEY,
    date       VARCHAR(10) NOT NULL UNIQUE,
    reason     TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`

// Insert default settings row if it doesn't exist
await sql`
  INSERT INTO reservation_settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING
`

console.log('✅ reservation_settings + blocked_dates created')
await sql.end()
