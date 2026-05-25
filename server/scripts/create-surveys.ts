import { sql } from '../src/db/client.ts'

await sql`CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  rating INTEGER NOT NULL,
  comment TEXT,
  name VARCHAR(120),
  email VARCHAR(200),
  locale VARCHAR(10) DEFAULT 'es',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
)`
console.log('✅ surveys table created (or already exists)')
await sql.end()
