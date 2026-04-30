import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it.')
}

// Railway uses TLS; postgres-js handles it automatically when ssl=require is set or via URL.
export const sql = postgres(connectionString, {
  max: 10,
  ssl: connectionString.includes('railway') ? 'require' : undefined,
})

export const db = drizzle(sql, { schema })
export type DB = typeof db
