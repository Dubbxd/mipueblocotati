import { Elysia, t } from 'elysia'
import { extname } from 'node:path'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { media } from '../db/schema'
import { authPlugin, requireAuth } from '../lib/auth'
import { getStorage } from '../lib/storage'

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
])
const MAX_BYTES = 8 * 1024 * 1024 // 8 MB

export const uploadRoutes = new Elysia({ prefix: '/upload' })
  .use(authPlugin)
  .post(
    '/',
    async ({ body, user, set, query }) => {
      const file = body.file as File
      if (!ALLOWED_MIME.has(file.type)) {
        set.status = 415
        return { error: 'Tipo de archivo no permitido' }
      }
      if (file.size > MAX_BYTES) {
        set.status = 413
        return { error: 'Archivo demasiado grande (máx 8 MB)' }
      }
      const ext = extname(file.name) || `.${file.type.split('/')[1] ?? 'bin'}`
      const prefix = (query?.prefix as string | undefined)?.replace(/[^a-z0-9/_-]/gi, '') || 'menu'
      const storage = await getStorage()
      const buf = Buffer.from(await file.arrayBuffer())
      const stored = await storage.put(buf, { mime: file.type, ext, prefix })
      const [m] = await db
        .insert(media)
        .values({
          filename: stored.key,
          url: stored.url,
          mime: stored.mime,
          size: stored.size,
          uploadedById: user!.id,
        })
        .returning()
      return m
    },
    {
      body: t.Object({ file: t.File() }),
      query: t.Optional(t.Object({ prefix: t.Optional(t.String()) })),
      beforeHandle: requireAuth,
    }
  )
  .delete(
    '/:id',
    async ({ params, set }) => {
      const id = Number(params.id)
      if (!Number.isFinite(id)) {
        set.status = 400
        return { error: 'id inválido' }
      }
      const [row] = await db.select().from(media).where(eq(media.id, id)).limit(1)
      if (!row) {
        set.status = 404
        return { error: 'no encontrado' }
      }
      const storage = await getStorage()
      await storage.remove(row.filename)
      await db.delete(media).where(eq(media.id, id))
      return { ok: true }
    },
    { beforeHandle: requireAuth }
  )
