import { Elysia, t } from 'elysia'
import { eq, desc, asc, and, inArray, lt } from 'drizzle-orm'
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
  blogPosts,
  emailCampaigns,
  surveys,
  contacts,
  contactInteractions,
  contactMessages,
  reservationSettings,
  blockedDates,
  coupons,
  users,
} from '../db/schema'
import { authPlugin, requireAuth, requireRole, requireModule, ALL_MODULES } from '../lib/auth'
import { verifyUnsubToken, verifyCancelReservationToken } from '../lib/hmac'
import { upsertContact } from '../lib/crm'
import { hashPassword } from '../lib/password'

// ─── Public-form rate limiter ──────────────────────────────────
// Limits: 8 submissions per 15 min per IP per endpoint type.
// In-memory; resets on server restart (sufficient for abuse deterrence).
const PUBLIC_RATE_WINDOW_MS = 15 * 60 * 1000 // 15 min
const PUBLIC_RATE_MAX = 8
const publicRateMap = new Map<string, { count: number; resetAt: number }>()

function checkPublicRate(ip: string, type: string): boolean {
  const key = `${type}:${ip}`
  const now = Date.now()
  const entry = publicRateMap.get(key)
  if (!entry || now > entry.resetAt) {
    publicRateMap.set(key, { count: 1, resetAt: now + PUBLIC_RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= PUBLIC_RATE_MAX) return false
  entry.count++
  return true
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}
import {
  sendReservationConfirmation,
  sendReservationCancellation,
  notifyAdminReservation,
  sendCateringConfirmation,
  notifyAdminCatering,
  sendContactAutoReply,
  notifyAdminContact,
  sendCampaign,
  notifyAdminSurvey,
  sendNewsletterWelcome,
  notifyAdminNewsletter,
} from '../lib/mailjet'
import { generateCouponCode, createWelcomeCoupon } from '../lib/coupons'

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
    async ({ body, request, set }) => {
      if (!checkPublicRate(getClientIp(request), 'reservations')) {
        set.status = 429
        return { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
      }
      const { consentTerms, consentData, consentMarketing, ...values } = body
      // Check auto-confirm setting
      const [cfg] = await db.select({ autoConfirm: reservationSettings.autoConfirm }).from(reservationSettings).where(eq(reservationSettings.id, 1)).limit(1)
      const status = cfg?.autoConfirm ? 'confirmed' : 'pending'
      const rows = await db.insert(reservations).values({ ...values, status }).returning()
      const r = rows[0]!
      // CRM — fire-and-forget
      upsertContact({
        email: body.email,
        phone: body.phone,
        name: body.name,
        consentTerms,
        consentData,
        consentMarketing,
        interaction: {
          type: 'reservation',
          refTable: 'reservations',
          refId: r.id,
          summary: `Reservación · ${body.date} ${body.time} · ${body.partySize} personas`,
          metadata: { date: body.date, time: body.time, partySize: body.partySize },
        },
      }).catch(e => console.error('[crm] reservation:', e))
      // Send emails in background
      if (body.email) {
        sendReservationConfirmation({
          id: r.id,
          name: body.name,
          email: body.email,
          date: body.date,
          time: body.time,
          partySize: body.partySize,
          notes: body.notes,
        }).catch(e => console.error('[mail] reservation confirmation:', e))
      }
      notifyAdminReservation({
        name: body.name,
        email: body.email ?? 'no-email',
        phone: body.phone,
        date: body.date,
        time: body.time,
        partySize: body.partySize,
        notes: body.notes,
      }).catch(e => console.error('[mail] admin reservation notify:', e))
      return { ok: true, id: r.id }
    },
    {
      body: t.Object({
        locationId: t.Optional(t.Number()),
        name: t.String({ minLength: 2 }),
        phone: t.String({ minLength: 7 }),
        email: t.Optional(t.String({ pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' })),
        partySize: t.Number({ minimum: 1, maximum: 50 }),
        date: t.String(),
        time: t.String(),
        notes: t.Optional(t.String()),
        consentTerms: t.Boolean(),
        consentData: t.Boolean(),
        consentMarketing: t.Optional(t.Boolean()),
      }),
    }
  )
  .get(
    '/reservations/cancel',
    async ({ query, set }) => {
      const id = Number(query.id)
      const email = query.email as string
      const token = query.token as string
      if (!id || !email || !token) { set.status = 400; return { error: 'Parámetros faltantes' } }
      if (!verifyCancelReservationToken(id, email, token)) {
        set.status = 403
        return { error: 'Token inválido' }
      }
      const [r] = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1)
      if (!r) { set.status = 404; return { error: 'Reserva no encontrada' } }
      if (r.status === 'cancelled') {
        set.headers['Content-Type'] = 'text/html; charset=utf-8'
        const pubUrl = process.env.PUBLIC_URL ?? 'https://mipueblocotati.com'
        return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reserva cancelada</title><style>body{font-family:Arial,sans-serif;max-width:500px;margin:80px auto;text-align:center;color:#3A2010;background:#FFFCF0;}h1{color:#C8501C;}a{color:#C8501C;}.btn{display:inline-block;background:#C8501C;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;margin-top:20px;}</style></head><body><h1>Mi Pueblo Cotati</h1><p>Esta reserva ya fue cancelada anteriormente.</p><a href="${pubUrl}/reservar" class="btn">Hacer nueva reserva</a></body></html>`
      }
      if (r.status === 'completed') {
        set.headers['Content-Type'] = 'text/html; charset=utf-8'
        return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reserva completada</title><style>body{font-family:Arial,sans-serif;max-width:500px;margin:80px auto;text-align:center;color:#3A2010;background:#FFFCF0;}h1{color:#C8501C;}</style></head><body><h1>Mi Pueblo Cotati</h1><p>Esta reserva ya fue completada y no puede cancelarse.</p></body></html>`
      }
      await db.update(reservations)
        .set({ status: 'cancelled', adminNotes: 'Cancelada por el cliente', updatedAt: new Date() })
        .where(eq(reservations.id, id))
      if (r.email) {
        sendReservationCancellation({
          name: r.name, email: r.email,
          date: r.date, time: r.time,
          partySize: r.partySize,
          reason: 'Cancelada por el cliente',
        }).catch(e => console.error('[mail] self-cancel:', e))
      }
      set.headers['Content-Type'] = 'text/html; charset=utf-8'
      const pubUrl = process.env.PUBLIC_URL ?? 'https://mipueblocotati.com'
      return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reserva cancelada</title><style>body{font-family:Arial,sans-serif;max-width:500px;margin:80px auto;text-align:center;color:#3A2010;background:#FFFCF0;}h1{color:#C8501C;}a{color:#C8501C;}.detail{background:#fff;border-left:4px solid #C8501C;padding:16px 20px;margin:20px auto;text-align:left;max-width:300px;border-radius:0 8px 8px 0;}.detail p{margin:4px 0;font-size:14px;}.btn{display:inline-block;background:#C8501C;color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:bold;margin-top:20px;}</style></head><body><h1>Mi Pueblo Cotati</h1><p>Tu reserva ha sido cancelada correctamente.</p><div class="detail"><p><strong>Fecha:</strong> ${r.date}</p><p><strong>Hora:</strong> ${r.time}</p><p><strong>Personas:</strong> ${r.partySize}</p></div><p>Esperamos verte pronto.</p><a href="${pubUrl}/reservar" class="btn">Hacer nueva reserva</a></body></html>`
    },
    {
      query: t.Object({
        id: t.String(),
        email: t.String(),
        token: t.String({ minLength: 32, maxLength: 32 }),
      }),
    }
  )
  .post(
    '/catering',
    async ({ body, request, set }) => {
      if (!checkPublicRate(getClientIp(request), 'catering')) {
        set.status = 429
        return { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
      }
      const { consentTerms, consentData, consentMarketing, ...values } = body
      const rows2 = await db.insert(cateringRequests).values(values).returning()
      const r = rows2[0]!
      // CRM
      upsertContact({
        email: body.email,
        phone: body.phone,
        name: body.name,
        consentTerms,
        consentData,
        consentMarketing,
        interaction: {
          type: 'catering',
          refTable: 'catering_requests',
          refId: r.id,
          summary: `Catering · ${body.eventType ?? 'evento'} · ${body.guests ?? '?'} invitados`,
          metadata: { eventType: body.eventType, eventDate: body.eventDate, guests: body.guests },
        },
      }).catch(e => console.error('[crm] catering:', e))
      // Send emails in background
      if (body.email) {
        sendCateringConfirmation({
          name: body.name,
          email: body.email,
          eventType: body.eventType,
          eventDate: body.eventDate,
          guests: body.guests,
          budget: body.budget,
        }).catch(e => console.error('[mail] catering confirmation:', e))
      }
      notifyAdminCatering({
        name: body.name,
        email: body.email ?? 'no-email',
        phone: body.phone,
        eventType: body.eventType,
        eventDate: body.eventDate,
        guests: body.guests,
        budget: body.budget,
        message: body.message,
      }).catch(e => console.error('[mail] admin catering notify:', e))
      return { ok: true, id: r.id }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        phone: t.String({ minLength: 7 }),
        email: t.Optional(t.String({ pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' })),
        eventType: t.Optional(t.String()),
        eventDate: t.Optional(t.String()),
        guests: t.Optional(t.Number()),
        budget: t.Optional(t.String()),
        message: t.Optional(t.String()),
        consentTerms: t.Boolean(),
        consentData: t.Boolean(),
        consentMarketing: t.Optional(t.Boolean()),
      }),
    }
  )
  .post(
    '/contact',
    async ({ body, request, set }) => {
      if (!checkPublicRate(getClientIp(request), 'contact')) {
        set.status = 429
        return { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
      }
      const { consentTerms, consentData, ...rest } = body
      // Save message to DB
      const [msg] = await db.insert(contactMessages).values({
        name: body.name,
        email: body.email,
        phone: body.phone ?? undefined,
        subject: body.subject ?? undefined,
        message: body.message,
        consentTerms,
        consentData,
      }).returning({ id: contactMessages.id })
      // CRM
      upsertContact({
        email: body.email,
        phone: body.phone,
        name: body.name,
        consentTerms,
        consentData,
        interaction: {
          type: 'contact_msg',
          refTable: 'contact_messages',
          refId: msg?.id,
          summary: body.subject
            ? `Mensaje · ${body.subject}`
            : `Mensaje · ${body.message.slice(0, 60)}${body.message.length > 60 ? '…' : ''}`,
          metadata: { subject: body.subject },
        },
      }).catch(e => console.error('[crm] contact:', e))
      // Send emails in background
      sendContactAutoReply({
        name: body.name,
        email: body.email,
        message: body.message,
      }).catch(e => console.error('[mail] contact auto-reply:', e))
      notifyAdminContact({
        name: body.name,
        email: body.email,
        phone: body.phone,
        subject: body.subject,
        message: body.message,
      }).catch(e => console.error('[mail] admin contact notify:', e))
      return { ok: true }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$' }),
        phone: t.Optional(t.String()),
        subject: t.Optional(t.String()),
        message: t.String({ minLength: 10 }),
        consentTerms: t.Boolean(),
        consentData: t.Boolean(),
      }),
    }
  )
  .post(
    '/newsletter',
    async ({ body, set, request }) => {
      if (!checkPublicRate(getClientIp(request), 'newsletter')) {
        set.status = 429
        return { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
      }
      const { consentTerms, consentData, consentMarketing, ...subValues } = body
      try {
        const [r] = await db
          .insert(newsletterSubscribers)
          .values(subValues)
          .onConflictDoNothing({ target: newsletterSubscribers.email })
          .returning()
        // Only send welcome + coupon for new subscribers (r is null on conflict)
        if (r) {
          // CRM
          const contactId = await upsertContact({
            email: body.email,
            name: body.name,
            locale: body.locale,
            consentTerms: consentTerms ?? false,
            consentData: consentData ?? false,
            consentMarketing: consentMarketing ?? true,
            interaction: {
              type: 'newsletter_sub',
              refTable: 'newsletter_subscribers',
              refId: r.id,
              summary: 'Newsletter · suscripción',
              metadata: { source: body.source },
            },
          }).catch(e => { console.error('[crm] newsletter:', e); return null })
          // Generate welcome coupon & send emails
          createWelcomeCoupon(body.email, contactId).then(couponCode => {
            sendNewsletterWelcome({
              email: body.email,
              name: body.name,
              couponCode,
            }).catch(e => console.error('[mail] newsletter welcome:', e))
            notifyAdminNewsletter({
              email: body.email,
              name: body.name,
              couponCode,
            }).catch(e => console.error('[mail] admin newsletter:', e))
          }).catch(e => console.error('[coupon] welcome:', e))
        }
        return { ok: true, id: r?.id, isNew: !!r }
      } catch (e) {
        set.status = 500
        return { ok: false }
      }
    },
    {
      body: t.Object({
        email: t.String(),
        name: t.Optional(t.String()),
        locale: t.Optional(t.String()),
        source: t.Optional(t.String()),
        consentTerms: t.Optional(t.Boolean()),
        consentData: t.Optional(t.Boolean()),
        consentMarketing: t.Optional(t.Boolean()),
      }),
    }
  )
  .get(
    '/newsletter/unsubscribe',
    async ({ query, set }) => {
      const email = query.email as string | undefined
      const token = query.token as string | undefined
      if (!email || !token) { set.status = 400; return { error: 'Parámetros faltantes' } }
      // Verify HMAC token to prevent mass-unsubscribe by guessing emails
      if (!verifyUnsubToken(email, token)) {
        set.status = 403
        return { error: 'Token inválido' }
      }
      await db.update(newsletterSubscribers)
        .set({ isActive: false, unsubscribedAt: new Date() })
        .where(eq(newsletterSubscribers.email, email))
      // Sync CRM contact subscriber status
      upsertContact({
        email,
        consentTerms: false,
        consentData: false,
        interaction: {
          type: 'newsletter_unsub',
          refTable: 'newsletter_subscribers',
          summary: 'Newsletter · baja',
        },
      }).catch(e => console.error('[crm] unsub:', e))
      // Return simple HTML confirmation page
      set.headers['Content-Type'] = 'text/html; charset=utf-8'
      const pubUrl = process.env.PUBLIC_URL ?? 'https://mipueblocotati.com'
      return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Cancelar suscripción</title><style>body{font-family:Arial,sans-serif;max-width:500px;margin:80px auto;text-align:center;color:#3A2010;background:#FFFCF0;}h1{color:#C8501C;}a{color:#C8501C;}</style></head><body><h1>🌮 Mi Pueblo Cotati</h1><p>Tu suscripción fue cancelada correctamente.</p><p><a href="${pubUrl}">Volver al sitio</a></p></body></html>`
    },
    {
      query: t.Object({
        email: t.String(),
        token: t.String({ minLength: 32, maxLength: 32 }),
      }),
    }
  )
  .post(
    '/surveys',
    async ({ body, set }) => {
      if (body.rating < 1 || body.rating > 5) {
        set.status = 400
        return { ok: false, error: 'Rating must be between 1 and 5' }
      }
      const { consentTerms, consentData, ...surveyValues } = body
      const [r] = await db.insert(surveys).values({ ...surveyValues, consentTerms, consentData }).returning()
      // CRM
      upsertContact({
        email: body.email,
        name: body.name,
        locale: body.locale,
        consentTerms: consentTerms ?? false,
        consentData: consentData ?? false,
        interaction: {
          type: 'survey',
          refTable: 'surveys',
          refId: r!.id,
          summary: `Encuesta · ${body.rating}★${body.comment ? ' · ' + body.comment.slice(0, 60) : ''}`,
          metadata: { rating: body.rating },
        },
      }).catch(e => console.error('[crm] survey:', e))
      // fire-and-forget — don't block the response
      notifyAdminSurvey(body).catch(e => console.error('[survey notify]', e))
      return { ok: true, id: r!.id }
    },
    {
      body: t.Object({
        rating: t.Number({ minimum: 1, maximum: 5 }),
        comment: t.Optional(t.String({ maxLength: 2000 })),
        name: t.Optional(t.String({ maxLength: 120 })),
        email: t.Optional(t.String()),
        locale: t.Optional(t.String({ maxLength: 10 })),
        consentTerms: t.Optional(t.Boolean()),
        consentData: t.Optional(t.Boolean()),
      }),
    }
  )
  // Config pública de reservaciones (horarios, capacidad, días bloqueados)
  .get('/reservation-config', async () => {
    const [settings] = await db.select().from(reservationSettings).where(eq(reservationSettings.id, 1)).limit(1)
    const blocked = await db.select({ date: blockedDates.date }).from(blockedDates)
    return {
      settings: settings ?? {
        isActive: true,
        availableDays: [1, 2, 3, 4, 5, 6],
        timeSlots: ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'],
        minPartySize: 1,
        maxPartySize: 8,
        slotCapacity: 30,
        minAdvanceHours: 2,
        maxAdvanceDays: 60,
        closedMessage: null,
      },
      blockedDates: blocked.map(r => r.date),
    }
  })
  .get('/blog', async () => {
    return db.select().from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt))
  })
  .get('/blog/:slug', async ({ params, set }) => {
    const [post] = await db.select().from(blogPosts)
      .where(and(eq(blogPosts.slug, params.slug), eq(blogPosts.status, 'published')))
      .limit(1)
    if (!post) { set.status = 404; return { error: 'Not found' } }
    return post
  })

/* ─── ADMIN: helper genérico CRUD ─────────────────────────────── */
function adminCrud<T extends { id: any }>(opts: {
  prefix: string
  table: any
  schema: any
  orderBy?: any
  module?: import('../lib/auth').ModuleName
  requireRoles?: Array<'superadmin' | 'admin' | 'editor'>
  beforeList?: () => Promise<void>
}) {
  const { prefix, table, schema, orderBy, beforeList } = opts
  const guardWrite = requireRole(...(opts.requireRoles ?? ['superadmin', 'admin', 'editor']))
  const guardModule = opts.module ? requireModule(opts.module) : null
  const readGuards = guardModule ? [requireAuth, guardModule] : [requireAuth]
  const writeGuards = guardModule ? [guardWrite, guardModule] : [guardWrite]

  return new Elysia({ prefix })
    .use(authPlugin)
    .get('/', async () => {
      if (beforeList) await beforeList()
      return db.select().from(table).orderBy(orderBy ?? desc(table.id))
    }, {
      beforeHandle: readGuards,
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
      { beforeHandle: readGuards }
    )
    .post(
      '/',
      async ({ body }) => {
        const [r] = await db.insert(table).values(body as any).returning()
        return r
      },
      { body: schema, beforeHandle: writeGuards }
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
      { body: t.Partial(schema as any), beforeHandle: writeGuards }
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
  /** Precio mostrado como badge: "$10", "$9.99", etc. */
  price: t.Optional(t.String()),
  /** Día de la semana: 0=dom … 6=sab. Null = sin día fijo. */
  dayOfWeek: t.Optional(t.Union([t.Number(), t.Null()])),
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
  email: t.Optional(t.String()),
  eventType: t.Optional(t.String()),
  eventDate: t.Optional(t.String()),
  guests: t.Optional(t.Number()),
  budget: t.Optional(t.String()),
  message: t.Optional(t.String()),
  status: t.Optional(t.String()),
  adminNotes: t.Optional(t.String()),
})

const newsletterBody = t.Object({
  email: t.String(),
  name: t.Optional(t.String()),
  locale: t.Optional(t.String()),
  source: t.Optional(t.String()),
  isActive: t.Optional(t.Boolean()),
})

const blogPostBody = t.Object({
  slug: t.String(),
  titleEs: t.String(),
  titleEn: t.String(),
  excerptEs: t.Optional(t.String()),
  excerptEn: t.Optional(t.String()),
  bodyEs: t.String(),
  bodyEn: t.Optional(t.String()),
  coverImage: t.Optional(t.String()),
  category: t.Optional(t.String()),
  tags: t.Optional(t.Array(t.String())),
  status: t.Optional(t.Union([t.Literal('draft'), t.Literal('published'), t.Literal('archived')])),
  aiGenerated: t.Optional(t.Boolean()),
  metaTitleEs: t.Optional(t.String()),
  metaTitleEn: t.Optional(t.String()),
  metaDescriptionEs: t.Optional(t.String()),
  metaDescriptionEn: t.Optional(t.String()),
  publishedAt: t.Optional(t.String()),
})

const campaignBody = t.Object({
  name: t.String(),
  subjectEs: t.String(),
  subjectEn: t.String(),
  previewTextEs: t.Optional(t.String()),
  previewTextEn: t.Optional(t.String()),
  bodyHtmlEs: t.String(),
  bodyHtmlEn: t.Optional(t.String()),
  blogPostId: t.Optional(t.Number()),
  status: t.Optional(t.Union([t.Literal('draft'), t.Literal('scheduled'), t.Literal('sending'), t.Literal('sent'), t.Literal('cancelled')])),
  scheduledAt: t.Optional(t.String()),
})

/* ─── ADMIN ROUTES ────────────────────────────────────────────── */
export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(adminCrud({ prefix: '/menu/categories', table: menuCategories, schema: categoryBody, module: 'menu', orderBy: asc(menuCategories.sortOrder) }))
  .use(adminCrud({ prefix: '/menu/items', table: menuItems, schema: itemBody, module: 'menu', orderBy: asc(menuItems.sortOrder) }))
  .use(adminCrud({ prefix: '/promotions', table: promotions, schema: promoBody, module: 'promotions', orderBy: asc(promotions.sortOrder) }))
  .use(adminCrud({ prefix: '/locations', table: locations, schema: locationBody, module: 'locations', orderBy: asc(locations.sortOrder) }))
  .use(adminCrud({ prefix: '/reviews', table: reviews, schema: reviewBody, module: 'reviews', orderBy: asc(reviews.sortOrder) }))
  .use(adminCrud({ prefix: '/gallery', table: gallery, schema: galleryBody, module: 'gallery', orderBy: asc(gallery.sortOrder) }))
  .use(adminCrud({
    prefix: '/reservations',
    table: reservations,
    schema: reservationBody,
    module: 'reservations',
    orderBy: desc(reservations.createdAt),
    beforeList: async () => {
      const today = new Date().toISOString().slice(0, 10)
      await db.update(reservations)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(and(
          inArray(reservations.status, ['confirmed', 'pending']),
          lt(reservations.date, today)
        ))
    },
  }))
  // Cancel reservation — sends cancellation email
  .use(authPlugin)
  .post(
    '/reservations/:id/cancel',
    async ({ params, body, set }) => {
      const [r] = await db.select().from(reservations).where(eq(reservations.id, Number(params.id))).limit(1)
      if (!r) { set.status = 404; return { error: 'Not found' } }
      if (r.status === 'cancelled') { set.status = 400; return { error: 'Already cancelled' } }
      await db.update(reservations)
        .set({ status: 'cancelled', adminNotes: body.reason || r.adminNotes, updatedAt: new Date() })
        .where(eq(reservations.id, r.id))
      if (r.email) {
        sendReservationCancellation({
          name: r.name, email: r.email,
          date: r.date, time: r.time,
          partySize: r.partySize,
          reason: body.reason,
        }).catch(e => console.error('[mail] reservation cancel:', e))
      }
      return { ok: true, id: r.id }
    },
    { beforeHandle: requireRole('superadmin', 'admin'), body: t.Object({ reason: t.Optional(t.String()) }) }
  )
  .use(adminCrud({ prefix: '/catering', table: cateringRequests, schema: cateringBody, module: 'catering', orderBy: desc(cateringRequests.createdAt) }))
  .use(adminCrud({ prefix: '/newsletter', table: newsletterSubscribers, schema: newsletterBody, module: 'newsletter', orderBy: desc(newsletterSubscribers.createdAt) }))
  .use(adminCrud({ prefix: '/blog', table: blogPosts, schema: blogPostBody, module: 'blog', orderBy: desc(blogPosts.createdAt) }))
  .use(adminCrud({ prefix: '/campaigns', table: emailCampaigns, schema: campaignBody, module: 'campaigns', orderBy: desc(emailCampaigns.createdAt) }))
  // Surveys — solo lectura para admin (el POST es público)
  .use(authPlugin)
  .get('/surveys', async () => db.select().from(surveys).orderBy(desc(surveys.createdAt)), {
    beforeHandle: [requireAuth, requireModule('reviews')],
  })
  // Contact messages — guardados desde POST /public/contact
  .use(authPlugin)
  .get('/contact-messages', async () =>
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)), {
    beforeHandle: [requireAuth, requireModule('messages')],
  })
  .patch('/contact-messages/:id', async ({ params, body }) => {
    await db.update(contactMessages)
      .set({ status: body.status, adminNotes: body.adminNotes, updatedAt: new Date() })
      .where(eq(contactMessages.id, Number(params.id)))
    return { ok: true }
  }, { beforeHandle: [requireAuth, requireModule('messages')], body: t.Object({ status: t.Optional(t.String()), adminNotes: t.Optional(t.String()) }) })
  // CRM Contacts
  .use(authPlugin)
  .get('/contacts', async ({ query }) => {
    const rows = await db.select().from(contacts).orderBy(desc(contacts.lastSeen))
    return rows
  }, { beforeHandle: [requireAuth, requireModule('contacts')] })
  .get('/contacts/:id', async ({ params, set }) => {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, Number(params.id))).limit(1)
    if (!contact) { set.status = 404; return { error: 'Not found' } }
    const interactions = await db.select().from(contactInteractions)
      .where(eq(contactInteractions.contactId, Number(params.id)))
      .orderBy(desc(contactInteractions.createdAt))
    return { ...contact, interactions }
  }, { beforeHandle: [requireAuth, requireModule('contacts')] })
  .patch('/contacts/:id', async ({ params, body }) => {
    await db.update(contacts)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(contacts.id, Number(params.id)))
    return { ok: true }
  }, {
    beforeHandle: [requireAuth, requireModule('contacts')],
    body: t.Object({
      name: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      tags: t.Optional(t.Array(t.String())),
    }),
  })
  // ── AI generation endpoint ──────────────────────────────────────
  .use(authPlugin)
  .post(
    '/ai/generate',
    async ({ body, set }) => {
      const { generateBlogPost, generateCampaign, improveText } = await import('../lib/ai')
      try {
        if (body.type === 'blog_post') {
          const result = await generateBlogPost(body.topic, body.category ?? 'news')
          return { ok: true, result }
        }
        if (body.type === 'campaign') {
          const result = await generateCampaign(body.topic, body.promotion)
          return { ok: true, result }
        }
        if (body.type === 'improve') {
          const result = await improveText(body.topic, body.instruction ?? 'Mejora este texto', body.lang as 'es' | 'en' ?? 'es')
          return { ok: true, result }
        }
        set.status = 400
        return { error: 'Unknown type. Use: blog_post | campaign | improve' }
      } catch (e: any) {
        set.status = 500
        return { error: e?.message ?? 'AI generation failed' }
      }
    },
    {
      beforeHandle: [requireAuth, requireRole('admin', 'superadmin')],
      body: t.Object({
        type: t.String(),
        topic: t.String(),
        category: t.Optional(t.String()),
        promotion: t.Optional(t.String()),
        instruction: t.Optional(t.String()),
        lang: t.Optional(t.String()),
      }),
    }
  )
  // ── Send campaign endpoint ─────────────────────────────────────
  .post(
    '/campaigns/:id/send',
    async ({ params, set, user }) => {
      const [campaign] = await db.select().from(emailCampaigns).where(eq(emailCampaigns.id, Number(params.id))).limit(1)
      if (!campaign) { set.status = 404; return { error: 'Campaign not found' } }
      if (campaign.status === 'sent') { set.status = 400; return { error: 'Campaign already sent' } }

      // Get active subscribers
      const subs = await db.select().from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.isActive, true))

      if (!subs.length) { set.status = 400; return { error: 'No active subscribers' } }

      // Mark as sending
      await db.update(emailCampaigns).set({ status: 'sending', updatedAt: new Date() }).where(eq(emailCampaigns.id, campaign.id))

      // Send in background
      sendCampaign({
        subjectEs: campaign.subjectEs,
        subjectEn: campaign.subjectEn,
        bodyHtmlEs: campaign.bodyHtmlEs,
        bodyHtmlEn: campaign.bodyHtmlEn,
        subscribers: subs.map(s => ({ email: s.email, name: s.name, locale: s.locale })),
      }).then(async ({ sent, errors }) => {
        await db.update(emailCampaigns).set({
          status: 'sent',
          sentCount: sent,
          sentAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(emailCampaigns.id, campaign.id))
        console.log(`[campaign] sent=${sent} errors=${errors}`)
      }).catch(async (e) => {
        console.error('[campaign] send error', e)
        await db.update(emailCampaigns).set({ status: 'draft', updatedAt: new Date() }).where(eq(emailCampaigns.id, campaign.id))
      })

      return { ok: true, subscribers: subs.length, message: `Enviando a ${subs.length} suscriptores…` }
    },
    { beforeHandle: requireRole('superadmin', 'admin') }
  )
  // ── Reservation Settings ───────────────────────────────────────
  .use(authPlugin)
  .get('/reservation-settings', async () => {
    const [row] = await db.select().from(reservationSettings).where(eq(reservationSettings.id, 1)).limit(1)
    return row ?? null
  }, { beforeHandle: [requireAuth, requireModule('reservations')] })
  .patch('/reservation-settings', async ({ body }) => {
    await db.update(reservationSettings)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(reservationSettings.id, 1))
    const [row] = await db.select().from(reservationSettings).where(eq(reservationSettings.id, 1)).limit(1)
    return row
  }, {
    beforeHandle: [requireRole('superadmin', 'admin'), requireModule('reservations')],
    body: t.Object({
      isActive: t.Optional(t.Boolean()),
      availableDays: t.Optional(t.Array(t.Number())),
      timeSlots: t.Optional(t.Array(t.String())),
      minPartySize: t.Optional(t.Number()),
      maxPartySize: t.Optional(t.Number()),
      slotCapacity: t.Optional(t.Number()),
      minAdvanceHours: t.Optional(t.Number()),
      maxAdvanceDays: t.Optional(t.Number()),
      closedMessage: t.Optional(t.Any()),
      autoConfirm: t.Optional(t.Boolean()),
    }),
  })
  // ── Blocked Dates ──────────────────────────────────────────────
  .use(authPlugin)
  .get('/blocked-dates', async () => {
    return db.select().from(blockedDates).orderBy(asc(blockedDates.date))
  }, { beforeHandle: requireAuth })
  .post('/blocked-dates', async ({ body, set }) => {
    try {
      const [row] = await db.insert(blockedDates).values(body).returning()
      return row
    } catch {
      set.status = 409
      return { error: 'Esa fecha ya está bloqueada' }
    }
  }, {
    beforeHandle: requireRole('superadmin', 'admin'),
    body: t.Object({
      date: t.String({ minLength: 10, maxLength: 10 }),
      reason: t.Optional(t.String()),
    }),
  })
  .delete('/blocked-dates/:id', async ({ params, set }) => {
    const [row] = await db.delete(blockedDates).where(eq(blockedDates.id, Number(params.id))).returning()
    if (!row) { set.status = 404; return { error: 'Not found' } }
    return { ok: true }
  }, { beforeHandle: requireRole('superadmin', 'admin') })
  // ── Coupons ────────────────────────────────────────────────────
  .use(authPlugin)
  .get('/coupons', async () => {
    return db.select().from(coupons).orderBy(desc(coupons.createdAt))
  }, { beforeHandle: [requireAuth, requireModule('coupons')] })
  .get('/coupons/validate/:code', async ({ params, set }) => {
    const [coupon] = await db.select().from(coupons)
      .where(eq(coupons.code, params.code.toUpperCase().trim()))
      .limit(1)
    if (!coupon) { set.status = 404; return { error: 'Cupón no encontrado', valid: false } }
    if (coupon.status === 'redeemed') {
      return { valid: false, error: 'Este cupón ya fue canjeado', coupon }
    }
    if (coupon.status === 'expired' || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())) {
      return { valid: false, error: 'Este cupón ha expirado', coupon }
    }
    return { valid: true, coupon }
  }, { beforeHandle: [requireAuth, requireModule('coupons')] })
  .post('/coupons/redeem/:code', async ({ params, body, set }) => {
    const code = params.code.toUpperCase().trim()
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1)
    if (!coupon) { set.status = 404; return { error: 'Cupón no encontrado' } }
    if (coupon.status === 'redeemed') { set.status = 400; return { error: 'Este cupón ya fue canjeado' } }
    if (coupon.status === 'expired' || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())) {
      set.status = 400; return { error: 'Este cupón ha expirado' }
    }
    const [updated] = await db.update(coupons)
      .set({ status: 'redeemed', redeemedAt: new Date(), redeemedBy: body.redeemedBy || 'staff' })
      .where(eq(coupons.id, coupon.id))
      .returning()
    return { ok: true, coupon: updated }
  }, {
    beforeHandle: [requireAuth, requireModule('coupons')],
    body: t.Object({ redeemedBy: t.Optional(t.String()) }),
  })
  // ── User Management (superadmin only) ─────────────────────────
  .use(authPlugin)
  .get('/users', async () => {
    const rows = await db.select({
      id: users.id, email: users.email, name: users.name,
      role: users.role, allowedModules: users.allowedModules,
      isActive: users.isActive, lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    }).from(users).orderBy(desc(users.createdAt))
    return rows
  }, { beforeHandle: requireRole('superadmin') })
  .post('/users', async ({ body, set }) => {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email.toLowerCase())).limit(1)
    if (existing.length) { set.status = 409; return { error: 'Ya existe un usuario con ese email' } }
    const passwordHash = await hashPassword(body.password)
    const [u] = await db.insert(users).values({
      email: body.email.toLowerCase(),
      passwordHash,
      name: body.name,
      role: body.role ?? 'editor',
      allowedModules: body.allowedModules ?? [],
      isActive: true,
    }).returning({ id: users.id, email: users.email, name: users.name, role: users.role })
    return u
  }, {
    beforeHandle: requireRole('superadmin'),
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String({ minLength: 8 }),
      name: t.String({ minLength: 2 }),
      role: t.Optional(t.Union([t.Literal('superadmin'), t.Literal('admin'), t.Literal('editor')])),
      allowedModules: t.Optional(t.Array(t.String())),
    }),
  })
  .patch('/users/:id', async ({ params, body, user, set }) => {
    const id = Number(params.id)
    if (user && id === user.id && body.role && body.role !== user.role) {
      set.status = 400; return { error: 'No puedes cambiar tu propio rol' }
    }
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (body.name) updates.name = body.name
    if (body.role) updates.role = body.role
    if (body.allowedModules !== undefined) updates.allowedModules = body.allowedModules
    if (body.isActive !== undefined) updates.isActive = body.isActive
    if (body.password) updates.passwordHash = await hashPassword(body.password)
    const [r] = await db.update(users).set(updates).where(eq(users.id, id)).returning({
      id: users.id, email: users.email, name: users.name, role: users.role,
      allowedModules: users.allowedModules, isActive: users.isActive,
    })
    if (!r) { set.status = 404; return { error: 'Not found' } }
    return r
  }, {
    beforeHandle: requireRole('superadmin'),
    body: t.Object({
      name: t.Optional(t.String()),
      role: t.Optional(t.Union([t.Literal('superadmin'), t.Literal('admin'), t.Literal('editor')])),
      allowedModules: t.Optional(t.Array(t.String())),
      isActive: t.Optional(t.Boolean()),
      password: t.Optional(t.String({ minLength: 8 })),
    }),
  })
  .get('/modules', () => ALL_MODULES, { beforeHandle: requireAuth })