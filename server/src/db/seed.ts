/**
 * Seed inicial: crea usuario admin + sucursal Cotati + categorías y platillos básicos
 * + promoción "Burrito Thursday" + 3 reseñas destacadas.
 *
 * Idempotente: si ya existen, no duplica.
 */
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db, sql } from './client'
import {
  users,
  locations,
  menuCategories,
  menuItems,
  promotions,
  reviews,
} from './schema'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@mipueblocotati.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'changeme123!'

async function seedAdmin() {
  const existing = await db.select().from(users).where(eq(users.email, ADMIN_EMAIL))
  if (existing.length) {
    console.log(`👤 Admin ya existe: ${ADMIN_EMAIL}`)
    return
  }
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await db.insert(users).values({
    email: ADMIN_EMAIL,
    passwordHash,
    name: 'Super Admin',
    role: 'superadmin',
  })
  console.log(`✅ Admin creado: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
}

async function seedLocation() {
  const existing = await db.select().from(locations).where(eq(locations.slug, 'cotati'))
  if (existing.length) {
    console.log('📍 Sucursal Cotati ya existe')
    return existing[0]
  }
  const [loc] = await db
    .insert(locations)
    .values({
      slug: 'cotati',
      name: 'Mi Pueblo Cotati',
      city: 'Cotati',
      state: 'CA',
      addressLine: '7384 Commerce Blvd',
      postalCode: '94931',
      phone: '+1-707-792-4380',
      email: 'mipueblocotati1@gmail.com',
      lat: '38.3266' as any,
      lng: '-122.7094' as any,
      hours: [
        { day: 'mon', open: '11:00', close: '21:00' },
        { day: 'tue', open: '11:00', close: '21:00' },
        { day: 'wed', open: '11:00', close: '21:00' },
        { day: 'thu', open: '11:00', close: '21:00' },
        { day: 'fri', open: '11:00', close: '21:00' },
        { day: 'sat', open: '10:00', close: '21:00' },
        { day: 'sun', open: '10:00', close: '21:00' },
      ],
      links: {
        doordash: 'https://www.doordash.com/store/taqueria-mi-pueblo-cotati-275565/',
        clover: 'https://mi-pueblo-real-mex-cotati.cloveronline.com/menu/all',
        facebook: 'https://www.facebook.com/MiPuebloCotati',
        instagram: 'https://www.instagram.com/mipueblocotati/',
        googleMaps: 'https://maps.google.com/?q=7384+Commerce+Blvd+Cotati+CA',
      },
      sortOrder: 1,
    })
    .returning()
  console.log(`✅ Sucursal creada: ${loc.name}`)
  return loc
}

async function seedMenu() {
  const existingCats = await db.select().from(menuCategories)
  if (existingCats.length) {
    console.log(`🌮 Menú ya tiene ${existingCats.length} categorías, skip`)
    return
  }

  const categoriesData = [
    { slug: 'burritos', nameEs: 'Burritos', nameEn: 'Burritos', emoji: '🌯', isBestSeller: true, sortOrder: 1 },
    { slug: 'tacos', nameEs: 'Tacos', nameEn: 'Tacos', emoji: '🌮', sortOrder: 2 },
    { slug: 'quesadillas', nameEs: 'Quesadillas', nameEn: 'Quesadillas', emoji: '🧀', sortOrder: 3 },
    { slug: 'platillos', nameEs: 'Platillos', nameEn: 'Plates', emoji: '🍽️', isBestSeller: true, sortOrder: 4 },
    { slug: 'mariscos', nameEs: 'Mariscos', nameEn: 'Seafood', emoji: '🦐', sortOrder: 5 },
    { slug: 'antojitos', nameEs: 'Antojitos', nameEn: 'Appetizers', emoji: '🌶️', sortOrder: 6 },
  ]

  const insertedCats = await db.insert(menuCategories).values(categoriesData).returning()
  console.log(`✅ ${insertedCats.length} categorías creadas`)

  const burritos = insertedCats.find((c) => c.slug === 'burritos')!
  const tacos = insertedCats.find((c) => c.slug === 'tacos')!
  const platillos = insertedCats.find((c) => c.slug === 'platillos')!

  const itemsData = [
    {
      categoryId: burritos.id,
      slug: 'super-burrito',
      nameEs: 'Súper Burrito',
      nameEn: 'Super Burrito',
      descriptionEs: 'Frijoles, arroz, carne a elegir, queso, crema, guacamole y pico de gallo.',
      descriptionEn: 'Beans, rice, choice of meat, cheese, sour cream, guacamole and pico de gallo.',
      price: '13.95',
      tags: ['popular'],
      photo: '/assets/gallery/burrito-served.jpg',
    },
    {
      categoryId: burritos.id,
      slug: 'burrito-mojado',
      nameEs: 'Burrito Mojado',
      nameEn: 'Wet Burrito',
      descriptionEs: 'Burrito bañado en salsa roja, queso derretido y crema.',
      descriptionEn: 'Burrito smothered in red sauce with melted cheese and sour cream.',
      price: '14.95',
      tags: ['spicy'],
    },
    {
      categoryId: tacos.id,
      slug: 'taco-al-pastor',
      nameEs: 'Taco al Pastor',
      nameEn: 'Al Pastor Taco',
      descriptionEs: 'Tortilla doble de maíz, pastor adobado, cebolla, cilantro y piña.',
      descriptionEn: 'Double corn tortilla, marinated pork, onion, cilantro and pineapple.',
      price: '4.50',
      tags: ['popular'],
    },
    {
      categoryId: tacos.id,
      slug: 'taco-birria',
      nameEs: 'Taco de Birria',
      nameEn: 'Birria Taco',
      descriptionEs: 'Birria de res deshebrada, queso Oaxaca y consomé para dippear.',
      descriptionEn: 'Shredded beef birria, Oaxaca cheese and consommé for dipping.',
      price: '5.25',
      tags: ['popular', 'new'],
      photo: '/assets/gallery/quesa-birria-taco-closeup.jpg',
    },
    {
      categoryId: platillos.id,
      slug: 'molcajete',
      nameEs: 'Molcajete Mi Pueblo',
      nameEn: 'Mi Pueblo Molcajete',
      descriptionEs: 'Carne asada, pollo, camarón, chorizo, nopal y queso fundido.',
      descriptionEn: 'Carne asada, chicken, shrimp, chorizo, nopal and melted cheese.',
      price: '28.95',
      tags: ['popular', 'chefchoice'],
      photo: '/assets/gallery/molcajete-bowl.jpg',
    },
    {
      categoryId: platillos.id,
      slug: 'chile-relleno',
      nameEs: 'Chile Relleno',
      nameEn: 'Stuffed Pepper',
      descriptionEs: 'Poblano relleno de queso, capeado, salsa ranchera, arroz y frijoles.',
      descriptionEn: 'Battered poblano stuffed with cheese, ranchera sauce, rice and beans.',
      price: '15.95',
      tags: ['vegetarian'],
      photo: '/assets/gallery/chile-relleno.jpg',
    },
  ]

  await db.insert(menuItems).values(itemsData)
  console.log(`✅ ${itemsData.length} platillos creados`)
}

async function seedPromotions() {
  const existing = await db.select().from(promotions)
  if (existing.length) {
    console.log(`🎉 Promociones ya existen (${existing.length}), skip`)
    return
  }
  await db.insert(promotions).values([
    {
      slug: 'burrito-thursday',
      titleEs: 'Jueves de Burrito',
      titleEn: 'Burrito Thursday',
      bodyEs: 'Cualquier burrito + bebida por solo $10 todos los jueves.',
      bodyEn: 'Any burrito + drink for only $10 every Thursday.',
      barTextEs: '🌯 Jueves de Burrito · $10 con cualquier bebida',
      barTextEn: '🌯 Burrito Thursday · $10 with any drink',
      emoji: '🌯',
      ctaUrl: '/promociones',
      ctaLabelEs: 'Ver promo',
      ctaLabelEn: 'View deal',
      showInBar: true,
      sortOrder: 1,
    },
    {
      slug: 'taco-tuesday',
      titleEs: 'Martes de Taco',
      titleEn: 'Taco Tuesday',
      bodyEs: '3 tacos al pastor por $9 cada martes de 5 PM a 8 PM.',
      bodyEn: '3 al pastor tacos for $9 every Tuesday 5–8 PM.',
      emoji: '🌮',
      sortOrder: 2,
    },
  ])
  console.log('✅ 2 promociones creadas')
}

async function seedReviews() {
  const existing = await db.select().from(reviews)
  if (existing.length) {
    console.log(`⭐ Reseñas ya existen (${existing.length}), skip`)
    return
  }
  await db.insert(reviews).values([
    {
      authorName: 'María G.',
      authorCity: 'Cotati, CA',
      rating: 5,
      bodyEs: 'El mejor mole de la zona, la familia siempre nos hace sentir como en casa.',
      bodyEn: 'Best mole around — the family always makes us feel right at home.',
      source: 'google',
      status: 'approved',
      isFeatured: true,
      sortOrder: 1,
    },
    {
      authorName: 'Jonathan R.',
      authorCity: 'Petaluma, CA',
      rating: 5,
      bodyEs: 'Porciones enormes, sabor real y precios justos. Mi lugar favorito de Sonoma County.',
      bodyEn: 'Huge portions, authentic flavors, fair prices. My go-to in Sonoma County.',
      source: 'yelp',
      status: 'approved',
      isFeatured: true,
      sortOrder: 2,
    },
    {
      authorName: 'Daniela P.',
      authorCity: 'Rohnert Park, CA',
      rating: 5,
      bodyEs: 'Las quesabirrias con consomé son de otro nivel. Volvemos cada semana.',
      bodyEn: 'The quesabirrias with consommé are next level. We come back every week.',
      source: 'google',
      status: 'approved',
      isFeatured: true,
      sortOrder: 3,
    },
  ])
  console.log('✅ 3 reseñas destacadas creadas')
}

async function main() {
  console.log('🌱 Seeding database...\n')
  await seedAdmin()
  await seedLocation()
  await seedMenu()
  await seedPromotions()
  await seedReviews()
  console.log('\n✨ Seed complete')
  await sql.end()
}

main().catch(async (e) => {
  console.error('❌ Seed failed:', e)
  await sql.end()
  process.exit(1)
})
