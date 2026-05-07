import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { users } from '../db/schema'

const _JWT_SECRET_RAW = process.env.JWT_SECRET
const _IS_PROD = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT != null
if (!_JWT_SECRET_RAW || _JWT_SECRET_RAW.length < 32) {
  if (_IS_PROD) {
    throw new Error('[auth] JWT_SECRET must be set to a random string of at least 32 characters in production.')
  }
  console.warn('[auth] ⚠️  JWT_SECRET not set or too short. Using insecure default — DO NOT use in production.')
}
const JWT_SECRET = (_JWT_SECRET_RAW && _JWT_SECRET_RAW.length >= 32) ? _JWT_SECRET_RAW : 'dev-secret-change-me-32-chars-min'
const JWT_EXP = process.env.JWT_EXPIRES_IN ?? '7d'

/**
 * Plugin: registra el JWT y un guard `requireAuth` (y `requireAdmin`).
 * Uso:
 *   app.use(authPlugin).get('/me', ({ user }) => user, { beforeHandle: requireAuth })
 */
export const authPlugin = new Elysia({ name: 'auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET,
      exp: JWT_EXP,
    })
  )
  .derive({ as: 'global' }, async ({ headers, jwt }) => {
    const auth = headers.authorization
    if (!auth?.startsWith('Bearer ')) return { user: null }
    const token = auth.slice(7)
    const payload = (await jwt.verify(token)) as { sub?: number } | false
    if (!payload || !payload.sub) return { user: null }
    const [u] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1)
    if (!u || !u.isActive) return { user: null }
    return {
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
      },
    }
  })

/** Macro: usar como `beforeHandle: requireAuth` */
export const requireAuth = ({ user, set }: any) => {
  if (!user) {
    set.status = 401
    return { error: 'Unauthorized' }
  }
}

export const requireRole =
  (...roles: Array<'superadmin' | 'admin' | 'editor'>) =>
  ({ user, set }: any) => {
    if (!user) {
      set.status = 401
      return { error: 'Unauthorized' }
    }
    if (!roles.includes(user.role)) {
      set.status = 403
      return { error: 'Forbidden' }
    }
  }
