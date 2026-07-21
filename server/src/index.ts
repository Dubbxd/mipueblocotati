import 'dotenv/config'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import { authRoutes } from './routes/auth'
import { publicRoutes, adminRoutes } from './routes/crud'
import { uploadRoutes } from './routes/upload'
import { seoRoutes } from './routes/seo'
import { getStorage } from './lib/storage'

const PORT = Number(process.env.PORT ?? 3001)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'
const STORAGE_DRIVER = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase()
const IS_PROD = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT != null
// Set SWAGGER_ENABLED=true in env to expose /docs in production (off by default in prod)
const SWAGGER_ENABLED = IS_PROD ? process.env.SWAGGER_ENABLED === 'true' : true

// Initialize storage (creates bucket on MinIO if needed)
await getStorage()

const app = new Elysia({ serve: { maxRequestBodySize: 5 * 1024 * 1024 } })
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

// Only mount Swagger docs when enabled (always on in dev, off by default in prod)
if (SWAGGER_ENABLED) {
  app.use(
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
}

app
  .get('/health', () => ({ ok: true, time: new Date().toISOString(), storage: STORAGE_DRIVER }))
  .use(seoRoutes)
  .group('/api', (a) => a.use(authRoutes).use(publicRoutes).use(adminRoutes).use(uploadRoutes))
  .listen(PORT)

console.log(`🌶️  API ready → http://localhost:${PORT}  ·  docs: ${SWAGGER_ENABLED ? '/docs' : '(disabled)'}  ·  storage: ${STORAGE_DRIVER}`)
