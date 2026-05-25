import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['superadmin', 'admin', 'editor'])
export const reservationStatusEnum = pgEnum('reservation_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
])
export const cateringStatusEnum = pgEnum('catering_status', [
  'new',
  'contacted',
  'quoted',
  'won',
  'lost',
])
export const reviewStatusEnum = pgEnum('review_status', ['pending', 'approved', 'hidden'])
export const blogPostStatusEnum = pgEnum('blog_post_status', ['draft', 'published', 'archived'])
export const campaignStatusEnum = pgEnum('campaign_status', ['draft', 'scheduled', 'sending', 'sent', 'cancelled'])

// ─────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    role: userRoleEnum('role').notNull().default('editor'),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_idx').on(t.email),
  })
)

// ─────────────────────────────────────────────────────────────────
// SUCURSALES
// ─────────────────────────────────────────────────────────────────
export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  name: varchar('name', { length: 160 }).notNull(),
  city: varchar('city', { length: 80 }).notNull(),
  state: varchar('state', { length: 40 }).notNull().default('CA'),
  addressLine: varchar('address_line', { length: 200 }).notNull(),
  postalCode: varchar('postal_code', { length: 20 }),
  phone: varchar('phone', { length: 40 }),
  email: varchar('email', { length: 200 }),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  /** [{ day: 'mon', open: '11:00', close: '21:00' }, ...] */
  hours: jsonb('hours').$type<Array<{ day: string; open: string; close: string }>>(),
  /** { doordash, ubereats, grubhub, clover, googleMaps, ... } */
  links: jsonb('links').$type<Record<string, string>>(),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// MENÚ
// ─────────────────────────────────────────────────────────────────
export const menuCategories = pgTable('menu_categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 80 }).notNull().unique(),
  nameEs: varchar('name_es', { length: 120 }).notNull(),
  nameEn: varchar('name_en', { length: 120 }).notNull(),
  descriptionEs: text('description_es'),
  descriptionEn: text('description_en'),
  emoji: varchar('emoji', { length: 12 }),
  photo: varchar('photo', { length: 400 }),
  isFeatured: boolean('is_featured').notNull().default(false),
  isBestSeller: boolean('is_best_seller').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const menuItems = pgTable(
  'menu_items',
  {
    id: serial('id').primaryKey(),
    categoryId: integer('category_id')
      .notNull()
      .references(() => menuCategories.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 120 }).notNull(),
    nameEs: varchar('name_es', { length: 200 }).notNull(),
    nameEn: varchar('name_en', { length: 200 }).notNull(),
    descriptionEs: text('description_es'),
    descriptionEn: text('description_en'),
    price: decimal('price', { precision: 8, scale: 2 }),
    photo: varchar('photo', { length: 400 }),
    /** ['popular','spicy','vegetarian','glutenfree','new','chefchoice'] */
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    isAvailable: boolean('is_available').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    catSlugIdx: uniqueIndex('menu_items_cat_slug_idx').on(t.categoryId, t.slug),
    availIdx: index('menu_items_avail_idx').on(t.isAvailable),
  })
)

// ─────────────────────────────────────────────────────────────────
// PROMOCIONES
// ─────────────────────────────────────────────────────────────────
export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  titleEs: varchar('title_es', { length: 200 }).notNull(),
  titleEn: varchar('title_en', { length: 200 }).notNull(),
  bodyEs: text('body_es'),
  bodyEn: text('body_en'),
  /** Texto corto que aparece en el PromoBar superior */
  barTextEs: varchar('bar_text_es', { length: 200 }),
  barTextEn: varchar('bar_text_en', { length: 200 }),
  emoji: varchar('emoji', { length: 12 }),
  photo: varchar('photo', { length: 400 }),
  ctaUrl: varchar('cta_url', { length: 400 }),
  ctaLabelEs: varchar('cta_label_es', { length: 80 }),
  ctaLabelEn: varchar('cta_label_en', { length: 80 }),
  /** Si está marcada como 'topBar', se muestra en el PromoBar (solo una activa a la vez recomendado) */
  showInBar: boolean('show_in_bar').notNull().default(false),
  startsAt: timestamp('starts_at'),
  endsAt: timestamp('ends_at'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// RESERVAS
// ─────────────────────────────────────────────────────────────────
export const reservations = pgTable(
  'reservations',
  {
    id: serial('id').primaryKey(),
    locationId: integer('location_id').references(() => locations.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 160 }).notNull(),
    phone: varchar('phone', { length: 40 }).notNull(),
    email: varchar('email', { length: 200 }),
    partySize: integer('party_size').notNull(),
    date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
    time: varchar('time', { length: 5 }).notNull(), // HH:mm
    notes: text('notes'),
    status: reservationStatusEnum('status').notNull().default('pending'),
    adminNotes: text('admin_notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    dateIdx: index('reservations_date_idx').on(t.date),
    statusIdx: index('reservations_status_idx').on(t.status),
  })
)

// ─────────────────────────────────────────────────────────────────
// CATERING (formularios entrantes)
// ─────────────────────────────────────────────────────────────────
export const cateringRequests = pgTable('catering_requests', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 40 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  eventType: varchar('event_type', { length: 80 }), // boda, corporativo, fiesta...
  eventDate: varchar('event_date', { length: 10 }),
  guests: integer('guests'),
  budget: decimal('budget', { precision: 10, scale: 2 }),
  message: text('message'),
  status: cateringStatusEnum('status').notNull().default('new'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// RESEÑAS / TESTIMONIOS
// ─────────────────────────────────────────────────────────────────
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  authorName: varchar('author_name', { length: 160 }).notNull(),
  authorCity: varchar('author_city', { length: 120 }),
  rating: integer('rating').notNull().default(5),
  bodyEs: text('body_es').notNull(),
  bodyEn: text('body_en'),
  source: varchar('source', { length: 40 }), // google, yelp, manual
  status: reviewStatusEnum('status').notNull().default('pending'),
  /** Si está marcada como featured aparece en el ReviewsBand del home */
  isFeatured: boolean('is_featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// GALERÍA
// ─────────────────────────────────────────────────────────────────
export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 400 }).notNull(),
  thumbUrl: varchar('thumb_url', { length: 400 }),
  alt: varchar('alt', { length: 200 }),
  /** food, interior, team, events */
  category: varchar('category', { length: 40 }).notNull().default('food'),
  width: integer('width'),
  height: integer('height'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// NEWSLETTER
// ─────────────────────────────────────────────────────────────────
export const newsletterSubscribers = pgTable(
  'newsletter_subscribers',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 200 }).notNull(),
    name: varchar('name', { length: 160 }),
    locale: varchar('locale', { length: 5 }).notNull().default('es'),
    source: varchar('source', { length: 40 }).default('home_footer'),
    isActive: boolean('is_active').notNull().default(true),
    unsubscribedAt: timestamp('unsubscribed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex('newsletter_email_idx').on(t.email),
  })
)

// ─────────────────────────────────────────────────────────────────
// MEDIA (uploads tracking)
// ─────────────────────────────────────────────────────────────────
export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 200 }).notNull(),
  url: varchar('url', { length: 400 }).notNull(),
  mime: varchar('mime', { length: 80 }).notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  uploadedById: integer('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// BLOG POSTS
// ─────────────────────────────────────────────────────────────────
export const blogPosts = pgTable(
  'blog_posts',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 160 }).notNull().unique(),
    titleEs: varchar('title_es', { length: 300 }).notNull(),
    titleEn: varchar('title_en', { length: 300 }).notNull(),
    excerptEs: text('excerpt_es'),
    excerptEn: text('excerpt_en'),
    bodyEs: text('body_es').notNull(),
    bodyEn: text('body_en'),
    coverImage: varchar('cover_image', { length: 400 }),
    /** food, culture, recipes, news, promotions */
    category: varchar('category', { length: 60 }).notNull().default('news'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    status: blogPostStatusEnum('status').notNull().default('draft'),
    /** true si el contenido fue generado / asistido por IA */
    aiGenerated: boolean('ai_generated').notNull().default(false),
    /** SEO */
    metaTitleEs: varchar('meta_title_es', { length: 160 }),
    metaTitleEn: varchar('meta_title_en', { length: 160 }),
    metaDescriptionEs: varchar('meta_description_es', { length: 320 }),
    metaDescriptionEn: varchar('meta_description_en', { length: 320 }),
    authorId: integer('author_id').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex('blog_posts_slug_idx').on(t.slug),
    statusIdx: index('blog_posts_status_idx').on(t.status),
  })
)

// ─────────────────────────────────────────────────────────────────
// EMAIL CAMPAIGNS (newsletter)
// ─────────────────────────────────────────────────────────────────
export const emailCampaigns = pgTable('email_campaigns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  subjectEs: varchar('subject_es', { length: 200 }).notNull(),
  subjectEn: varchar('subject_en', { length: 200 }).notNull(),
  previewTextEs: varchar('preview_text_es', { length: 200 }),
  previewTextEn: varchar('preview_text_en', { length: 200 }),
  /** HTML completo del correo */
  bodyHtmlEs: text('body_html_es').notNull(),
  bodyHtmlEn: text('body_html_en'),
  /** ID del blog post vinculado (opcional) */
  blogPostId: integer('blog_post_id').references(() => blogPosts.id, { onDelete: 'set null' }),
  status: campaignStatusEnum('status').notNull().default('draft'),
  /** cuántos correos se enviaron */
  sentCount: integer('sent_count').notNull().default(0),
  /** Mailjet bulk campaign ID (para tracking de aperturas) */
  mailjetCampaignId: varchar('mailjet_campaign_id', { length: 80 }),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  createdById: integer('created_by_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// ENCUESTAS DE SATISFACCIÓN
// ─────────────────────────────────────────────────────────────────
export const surveys = pgTable('surveys', {
  id: serial('id').primaryKey(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  name: varchar('name', { length: 120 }),
  email: varchar('email', { length: 200 }),
  locale: varchar('locale', { length: 10 }).default('es'),
  consentTerms: boolean('consent_terms').notNull().default(false),
  consentData: boolean('consent_data').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// CRM — CONTACTOS UNIFICADOS
// Identificador primario: email O teléfono (ambos opcionales pero
// al menos uno debe estar presente). PostgreSQL UNIQUE permite
// múltiples NULL, por lo que ambas columnas pueden ser opcionales.
// ─────────────────────────────────────────────────────────────────
export const contacts = pgTable(
  'contacts',
  {
    id: serial('id').primaryKey(),
    /** Identificador A — email normalizado a minúsculas */
    email: varchar('email', { length: 200 }),
    /** Identificador B — teléfono normalizado (solo dígitos + leading +) */
    phone: varchar('phone', { length: 40 }),
    name: varchar('name', { length: 160 }),
    locale: varchar('locale', { length: 5 }).notNull().default('es'),
    /** ['vip','frecuente','catering','newsletter'] */
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    /** Notas internas del admin */
    notes: text('notes'),
    /** Consintió términos y condiciones */
    consentTerms: boolean('consent_terms').notNull().default(false),
    /** Consintió recopilación de datos */
    consentData: boolean('consent_data').notNull().default(false),
    /** Consintió recibir marketing */
    consentMarketing: boolean('consent_marketing').notNull().default(false),
    consentedAt: timestamp('consented_at'),
    /** Está activo en newsletter */
    isSubscriber: boolean('is_subscriber').notNull().default(false),
    firstSeen: timestamp('first_seen').notNull().defaultNow(),
    lastSeen: timestamp('last_seen').notNull().defaultNow(),
    visitCount: integer('visit_count').notNull().default(1),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex('contacts_email_idx').on(t.email),
    phoneIdx: uniqueIndex('contacts_phone_idx').on(t.phone),
  })
)

// ─────────────────────────────────────────────────────────────────
// CRM — HISTORIAL DE INTERACCIONES
// Cada vez que un contacto interactúa (reserva, encuesta, mensaje,
// newsletter, catering) se registra una fila aquí.
// ─────────────────────────────────────────────────────────────────
export const contactInteractions = pgTable(
  'contact_interactions',
  {
    id: serial('id').primaryKey(),
    contactId: integer('contact_id')
      .notNull()
      .references(() => contacts.id, { onDelete: 'cascade' }),
    /** reservation | catering | survey | contact_msg | newsletter_sub | newsletter_unsub */
    type: varchar('type', { length: 40 }).notNull(),
    /** Nombre de la tabla origen (reservations, surveys, etc.) */
    refTable: varchar('ref_table', { length: 60 }),
    /** ID del registro en la tabla origen */
    refId: integer('ref_id'),
    /** Texto corto para mostrar en la línea de tiempo */
    summary: text('summary'),
    /** Datos extra (rating, status, partySize, etc.) */
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => ({
    contactIdx: index('contact_interactions_contact_idx').on(t.contactId),
    typeIdx: index('contact_interactions_type_idx').on(t.type),
  })
)

// ─────────────────────────────────────────────────────────────────
// CRM — MENSAJES DE CONTACTO (antes solo se mandaban por email)
// ─────────────────────────────────────────────────────────────────
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  contactId: integer('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 200 }),
  phone: varchar('phone', { length: 40 }),
  subject: varchar('subject', { length: 200 }),
  message: text('message').notNull(),
  consentTerms: boolean('consent_terms').notNull().default(false),
  consentData: boolean('consent_data').notNull().default(false),
  /** new | read | replied | archived */
  status: varchar('status', { length: 40 }).notNull().default('new'),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─────────────────────────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────────────────────────
export const menuCategoriesRelations = relations(menuCategories, ({ many }) => ({
  items: many(menuItems),
}))

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
}))

export const reservationsRelations = relations(reservations, ({ one }) => ({
  location: one(locations, {
    fields: [reservations.locationId],
    references: [locations.id],
  }),
}))

// ─────────────────────────────────────────────────────────────────
// TYPES (re-export para usar en routes y en el web vía generateRouteTypes)
// ─────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Location = typeof locations.$inferSelect
export type MenuCategory = typeof menuCategories.$inferSelect
export type MenuItem = typeof menuItems.$inferSelect
export type Promotion = typeof promotions.$inferSelect
export type Reservation = typeof reservations.$inferSelect
export type CateringRequest = typeof cateringRequests.$inferSelect
export type Review = typeof reviews.$inferSelect
export type GalleryItem = typeof gallery.$inferSelect
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect
export type Media = typeof media.$inferSelect
export type BlogPost = typeof blogPosts.$inferSelect
export type EmailCampaign = typeof emailCampaigns.$inferSelect
export type Survey = typeof surveys.$inferSelect
export type Contact = typeof contacts.$inferSelect
export type ContactInteraction = typeof contactInteractions.$inferSelect
export type ContactMessage = typeof contactMessages.$inferSelect
