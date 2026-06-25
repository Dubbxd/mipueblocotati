import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { users } from '../db/schema'
import { authPlugin, requireAuth } from '../lib/auth'
import { verifyPassword } from '../lib/password'

// ─── In-memory login rate limiter ──────────────────────────────
// 10 attempts per 15 minutes per IP; cleared automatically on window expiry.
const RATE_WINDOW_MS = 15 * 60 * 1000 // 15 min
const RATE_MAX = 10
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

function checkLoginRate(ip: string): boolean {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_MAX) return false
  entry.count++
  return true
}
// ───────────────────────────────────────────────────────────────

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authPlugin)
  .post(
    '/login',
    async ({ body, jwt, set, request }) => {
      // Rate-limit by IP (X-Forwarded-For set by nginx proxy)
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
        request.headers.get('x-real-ip') ??
        'unknown'
      if (!checkLoginRate(ip)) {
        set.status = 429
        return { error: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' }
      }

      const { email, password } = body
      const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1)
      if (!u || !u.isActive) {
        set.status = 401
        return { error: 'Credenciales inválidas' }
      }
      const ok = await verifyPassword(password, u.passwordHash)
      if (!ok) {
        set.status = 401
        return { error: 'Credenciales inválidas' }
      }
      await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, u.id))
      const token = await jwt.sign({ sub: u.id })
      return {
        token,
        user: { id: u.id, email: u.email, name: u.name, role: u.role, allowedModules: u.allowedModules ?? [] },
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
      }),
    }
  )
  .get('/me', ({ user }) => user, { beforeHandle: requireAuth })
