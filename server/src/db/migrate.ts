import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { db, sql } from './client'

console.log('🗄️  Running migrations...')
await migrate(db, { migrationsFolder: './drizzle' })
console.log('✅ Migrations complete')
await sql.end()
