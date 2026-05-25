/**
 * CRM tables migration — Sprint B
 * Creates: contacts, contact_interactions, contact_messages
 * Also adds consent columns to existing surveys table.
 *
 * Run: bun scripts/create-crm-tables.ts
 */

import { sql } from 'drizzle-orm'
import { db } from '../src/db/client'

async function main() {
  console.log('⏳  Running CRM migration…\n')

  await db.execute(sql`
    -- ─── contacts ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS contacts (
      id               SERIAL PRIMARY KEY,
      email            VARCHAR(200),
      phone            VARCHAR(40),
      name             VARCHAR(160),
      locale           VARCHAR(5)   NOT NULL DEFAULT 'es',
      tags             JSONB        NOT NULL DEFAULT '[]',
      notes            TEXT,
      consent_terms    BOOLEAN      NOT NULL DEFAULT FALSE,
      consent_data     BOOLEAN      NOT NULL DEFAULT FALSE,
      consent_marketing BOOLEAN     NOT NULL DEFAULT FALSE,
      consented_at     TIMESTAMPTZ,
      is_subscriber    BOOLEAN      NOT NULL DEFAULT FALSE,
      first_seen       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      last_seen        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      visit_count      INTEGER      NOT NULL DEFAULT 1,
      created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    -- Partial unique indexes allow multiple NULLs but enforce uniqueness
    -- on non-null values (standard PostgreSQL behavior for UNIQUE columns
    -- already allows multiple NULLs, so plain unique index is fine)
    CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_idx ON contacts(email);
    CREATE UNIQUE INDEX IF NOT EXISTS contacts_phone_idx ON contacts(phone);

    -- ─── contact_interactions ────────────────────────────────────
    CREATE TABLE IF NOT EXISTS contact_interactions (
      id          SERIAL PRIMARY KEY,
      contact_id  INTEGER      NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      type        VARCHAR(40)  NOT NULL,
      ref_table   VARCHAR(60),
      ref_id      INTEGER,
      summary     TEXT,
      metadata    JSONB        DEFAULT '{}',
      created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS contact_interactions_contact_idx ON contact_interactions(contact_id);
    CREATE INDEX IF NOT EXISTS contact_interactions_type_idx    ON contact_interactions(type);

    -- ─── contact_messages ────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS contact_messages (
      id           SERIAL PRIMARY KEY,
      contact_id   INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      name         VARCHAR(160)  NOT NULL,
      email        VARCHAR(200),
      phone        VARCHAR(40),
      subject      VARCHAR(200),
      message      TEXT          NOT NULL,
      consent_terms BOOLEAN      NOT NULL DEFAULT FALSE,
      consent_data  BOOLEAN      NOT NULL DEFAULT FALSE,
      status       VARCHAR(40)   NOT NULL DEFAULT 'new',
      admin_notes  TEXT,
      created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
    );

    -- ─── surveys — add consent columns if missing ────────────────
    ALTER TABLE surveys
      ADD COLUMN IF NOT EXISTS consent_terms BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS consent_data  BOOLEAN NOT NULL DEFAULT FALSE;
  `)

  console.log('✅  Migration complete.\n')
  console.log('Tables created / updated:')
  console.log('  • contacts')
  console.log('  • contact_interactions')
  console.log('  • contact_messages')
  console.log('  • surveys (added consent_terms, consent_data columns)\n')
  process.exit(0)
}

main().catch(err => {
  console.error('❌  Migration failed:', err)
  process.exit(1)
})
