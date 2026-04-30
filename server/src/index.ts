import 'dotenv/config'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import { authRoutes } from './routes/auth'
import { publicRoutes, adminRoutes } from './routes/crud'
import { uploadRoutes } from './routes/upload'
import { getStorage } from './lib/storage'

const PORT = Number(process.env.PORT ?? 3001)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'
const STORAGE_DRIVER = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase()

// Initialize storage (creates bucket on MinIO if needed)
await getStorage()

const app = new Elysia()
  .use(
    cors({
      origin: CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    })
  )

// Only mount /uploads static when using local driver
if (STORAGE_DRIVER === 'local') {
  app.use(
    staticPlugin({
      assets: UPLOAD_DIR,
      prefix: '/uploads',
    })
  )
}

app
  .use(
    swagger({
      path: '/docs',
      documentation: {
        info: {
          title: 'Mi Pueblo Cotati API',
          version: '0.1.0',
          description: 'Backend Elysia + Drizzle (Postgres). Auth: `Authorization: Bearer <jwt>`.',
        },
      },
    })
  )
  .get('/health', () => ({ ok: true, time: new Date().toISOString(), storage: STORAGE_DRIVER }))
  .group('/api', (a) => a.use(authRoutes).use(publicRoutes).use(adminRoutes).use(uploadRoutes))
  .listen(PORT)

console.log(`🌶️  API ready → http://localhost:${PORT}  ·  docs: /docs  ·  storage: ${STORAGE_DRIVER}`)
