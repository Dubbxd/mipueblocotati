import { Elysia, t } from 'elysia'
import { eq, desc, asc, and } from 'drizzle-orm'
import { db } from '../db/client'
import {
  menuCategories,
  menuItems,
  promotions,
  locations,
  reviews,
  gallery,
  reservations,
  cateringRequests,
  newsletterSubscribers,
} from '../db/schema'
import { authPlugin, requireAuth, requireRole } from '../lib/auth'

/* ─── PUBLIC ROUTES (sin auth, leen solo activos) ─────────────── */
export const publicRoutes = new Elysia({ prefix: '/public' })
  .get('/menu', async () => {
    const cats = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.isActive, true))
      .orderBy(asc(menuCategories.sortOrder))
    const items = await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isAvailable, true))
      .orderBy(asc(menuItems.sortOrder))
    return { categories: cats, items }
  })
  .get('/promotions', async () => {
    return db
      .select()
      .from(promotions)
      .where(eq(promotions.isActive, true))
      .orderBy(asc(promotions.sortOrder))
  })
  .get('/locations', async () => {
    return db
      .select()
      .from(locations)
      .where(eq(locations.isActive, true))
      .orderBy(asc(locations.sortOrder))
  })
  .get('/reviews', async () => {
    return db
      .select()
      .from(reviews)
      .where(and(eq(reviews.status, 'approved'), eq(reviews.isFeatured, true)))
      .orderBy(asc(reviews.sortOrder))
  })
  .get('/gallery', async () => {
    return db
      .select()
      .from(gallery)
      .where(eq(gallery.isActive, true))
      .orderBy(asc(gallery.sortOrder))
  })
  // Formularios públicos (cualquier visitante puede crear)
  .post(
    '/reservations',
    async ({ body }) => {
      const [r] = await db.insert(reservations).values(body).returning()
      return { ok: true, id: r.id }
    },
    {
      body: t.Object({
        locationId: t.Optional(t.Number()),
        name: t.String({ minLength: 2 }),
        phone: t.String({ minLength: 7 }),
        email: t.Optional(t.String({ format: 'email' })),
        partySize: t.Number({ minimum: 1, maximum: 50 }),
        date: t.String(),
        time: t.String(),
        notes: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/catering',
    async ({ body }) => {
      const [r] = await db.insert(cateringRequests).values(body).returning()
      return { ok: true, id: r.id }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        phone: t.String({ minLength: 7 }),
        email: t.String({ format: 'email' }),
        eventType: t.Optional(t.String()),
        eventDate: t.Optional(t.String()),
        guests: t.Optional(t.Number()),
        budget: t.Optional(t.String()),
        message: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/newsletter',
    async ({ body, set }) => {
      try {
        const [r] = await db
          .insert(newsletterSubscribers)
          .values(body)
          .onConflictDoNothing({ target: newsletterSubscribers.email })
          .returning()
        return { ok: true, id: r?.id }
      } catch (e) {
        set.status = 500
        return { ok: false }
      }
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        name: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        source: t.Optional(t.String()),
      }),
    }
  )

/* ─── ADMIN: helper genérico CRUD ─────────────────────────────── */
function adminCrud<T extends { id: any }>(opts: {
  prefix: string
  table: any
  schema: any
  orderBy?: any
  requireRoles?: Array<'superadmin' | 'admin' | 'editor'>
}) {
  const { prefix, table, schema, orderBy } = opts
  const guardWrite = requireRole(...(opts.requireRoles ?? ['superadmin', 'admin', 'editor']))

  return new Elysia({ prefix })
    .use(authPlugin)
    .get('/', async () => db.select().from(table).orderBy(orderBy ?? desc(table.id)), {
      beforeHandle: requireAuth,
    })
    .get(
      '/:id',
      async ({ params, set }) => {
        const [r] = await db.select().from(table).where(eq(table.id, Number(params.id))).limit(1)
        if (!r) {
          set.status = 404
          return { error: 'Not found' }
        }
        return r
      },
      { beforeHandle: requireAuth }
    )
    .post(
      '/',
      async ({ body }) => {
        const [r] = await db.insert(table).values(body as any).returning()
        return r
      },
      { body: schema, beforeHandle: guardWrite }
    )
    .patch(
      '/:id',
      async ({ params, body, set }) => {
        const [r] = await db
          .update(table)
          .set({ ...(body as any), updatedAt: new Date() })
          .where(eq(table.id, Number(params.id)))
          .returning()
        if (!r) {
          set.status = 404
          return { error: 'Not found' }
        }
        return r
      },
      { body: t.Partial(schema as any), beforeHandle: guardWrite }
    )
    .delete(
      '/:id',
      async ({ params, set }) => {
        const [r] = await db.delete(table).where(eq(table.id, Number(params.id))).returning()
        if (!r) {
          set.status = 404
          return { error: 'Not found' }
        }
        return { ok: true }
      },
      { beforeHandle: requireRole('superadmin', 'admin') }
    )
}

/* ─── SCHEMAS DE ENTRADA ──────────────────────────────────────── */
const categoryBody = t.Object({
  slug: t.String(),
  nameEs: t.String(),
  nameEn: t.String(),
  descriptionEs: t.Optional(t.String()),
  descriptionEn: t.Optional(t.String()),
  emoji: t.Optional(t.String()),
  photo: t.Optional(t.String()),
  isFeatured: t.Optional(t.Boolean()),
  isBestSeller: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
})

const itemBody = t.Object({
  categoryId: t.Number(),
  slug: t.String(),
  nameEs: t.String(),
  nameEn: t.String(),
  descriptionEs: t.Optional(t.String()),
  descriptionEn: t.Optional(t.String()),
  price: t.Optional(t.String()),
  photo: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
  isAvailable: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

const promoBody = t.Object({
  slug: t.String(),
  titleEs: t.String(),
  titleEn: t.String(),
  bodyEs: t.Optional(t.String()),
  bodyEn: t.Optional(t.String()),
  barTextEs: t.Optional(t.String()),
  barTextEn: t.Optional(t.String()),
  emoji: t.Optional(t.String()),
  photo: t.Optional(t.String()),
  ctaUrl: t.Optional(t.String()),
  ctaLabelEs: t.Optional(t.String()),
  ctaLabelEn: t.Optional(t.String()),
  showInBar: t.Optional(t.Boolean()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

const locationBody = t.Object({
  slug: t.String(),
  name: t.String(),
  city: t.String(),
  state: t.Optional(t.String()),
  addressLine: t.String(),
  postalCode: t.Optional(t.String()),
  phone: t.Optional(t.String()),
  email: t.Optional(t.String()),
  lat: t.Optional(t.String()),
  lng: t.Optional(t.String()),
  hours: t.Optional(t.Any()),
  links: t.Optional(t.Any()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

const reviewBody = t.Object({
  authorName: t.String(),
  authorCity: t.Optional(t.String()),
  rating: t.Optional(t.Number()),
  bodyEs: t.String(),
  bodyEn: t.Optional(t.String()),
  source: t.Optional(t.String()),
  status: t.Optional(t.Union([t.Literal('pending'), t.Literal('approved'), t.Literal('hidden')])),
  isFeatured: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

const galleryBody = t.Object({
  url: t.String(),
  thumbUrl: t.Optional(t.String()),
  alt: t.Optional(t.String()),
  category: t.Optional(t.String()),
  width: t.Optional(t.Number()),
  height: t.Optional(t.Number()),
  isActive: t.Optional(t.Boolean()),
  sortOrder: t.Optional(t.Number()),
})

const reservationBody = t.Object({
  locationId: t.Optional(t.Number()),
  name: t.String(),
  phone: t.String(),
  email: t.Optional(t.String()),
  partySize: t.Number(),
  date: t.String(),
  time: t.String(),
  notes: t.Optional(t.String()),
  status: t.Optional(t.String()),
  adminNotes: t.Optional(t.String()),
})

const cateringBody = t.Object({
  name: t.String(),
  phone: t.String(),
  email: t.String(),
  eventType: t.Optional(t.String()),
  eventDate: t.Optional(t.String()),
  guests: t.Optional(t.Number()),
  budget: t.Optional(t.String()),
  message: t.Optional(t.String()),
  status: t.Optional(t.String()),
  adminNotes: t.Optional(t.String()),
})

const newsletterBody = t.Object({
  email: t.String({ format: 'email' }),
  name: t.Optional(t.String()),
  locale: t.Optional(t.String()),
  source: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
})

/* ─── ADMIN ROUTES ────────────────────────────────────────────── */
export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(adminCrud({ prefix: '/menu/categories', table: menuCategories, schema: categoryBody, orderBy: asc(menuCategories.sortOrder) }))
  .use(adminCrud({ prefix: '/menu/items', table: menuItems, schema: itemBody, orderBy: asc(menuItems.sortOrder) }))
  .use(adminCrud({ prefix: '/promotions', table: promotions, schema: promoBody, orderBy: asc(promotions.sortOrder) }))
  .use(adminCrud({ prefix: '/locations', table: locations, schema: locationBody, orderBy: asc(locations.sortOrder) }))
  .use(adminCrud({ prefix: '/reviews', table: reviews, schema: reviewBody, orderBy: asc(reviews.sortOrder) }))
  .use(adminCrud({ prefix: '/gallery', table: gallery, schema: galleryBody, orderBy: asc(gallery.sortOrder) }))
  .use(adminCrud({ prefix: '/reservations', table: reservations, schema: reservationBody, orderBy: desc(reservations.createdAt) }))
  .use(adminCrud({ prefix: '/catering', table: cateringRequests, schema: cateringBody, orderBy: desc(cateringRequests.createdAt) }))
  .use(adminCrud({ prefix: '/newsletter', table: newsletterSubscribers, schema: newsletterBody, orderBy: desc(newsletterSubscribers.createdAt) }))
