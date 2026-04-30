import { Elysia, t } from 'elysia'
import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { users } from '../db/schema'
import { authPlugin, requireAuth } from '../lib/auth'
import { verifyPassword } from '../lib/password'

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authPlugin)
  .post(
    '/login',
    async ({ body, jwt, set }) => {
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
        user: { id: u.id, email: u.email, name: u.name, role: u.role },
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
      }),
    }
  )
  .get('/me', ({ user }) => ({ user }), { beforeHandle: requireAuth })
