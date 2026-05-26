/**
 * Sincroniza reseñas de Google Business Profile a la BD local.
 *
 * Prerequisito: tener en .env:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 * (generados con setup-google-oauth.ts)
 *
 * Uso:
 *   bun scripts/sync-google-reviews.ts
 *
 * ¿Qué hace?
 *   - Obtiene un access_token fresco usando el refresh_token
 *   - Lista las cuentas y localiza Mi Pueblo Cotati
 *   - Descarga hasta 50 reseñas recientes (4+ estrellas)
 *   - Inserta reseñas nuevas en la tabla `reviews` (source='google', status='approved')
 *   - Marca como isFeatured las reseñas de 5 estrellas con texto ≥ 80 chars
 *   - Guarda el rating promedio y total de reseñas en locations.links
 */

import { db } from '../src/db/client'
import { reviews, locations } from '../src/db/schema'
import { eq, and } from 'drizzle-orm'

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('❌ Faltan variables de entorno:')
  console.error('   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN')
  console.error('   → Ejecuta primero: bun scripts/setup-google-oauth.ts')
  process.exit(1)
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_id:     CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      refresh_token: REFRESH_TOKEN!,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json() as any
  if (data.error) throw new Error(`❌ Token error: ${data.error_description}`)
  return data.access_token
}

async function gmbGet(token: string, path: string) {
  const res = await fetch(`https://mybusiness.googleapis.com/v4/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json() as any
  if (json.error) throw new Error(`API error: ${JSON.stringify(json.error)}`)
  return json
}

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Sincronizando reseñas de Google Business Profile...\n')

  const token = await getAccessToken()
  console.log('✅ Access token obtenido')

  // 1. Listar cuentas
  const accountsData = await gmbGet(token, 'accounts')
  const accounts: any[] = accountsData.accounts ?? []
  if (!accounts.length) throw new Error('No se encontraron cuentas de Google Business Profile.')

  // Buscar la cuenta que contenga el negocio
  const account = accounts[0]
  console.log(`📁 Cuenta: ${account.accountName} (${account.name})`)

  // 2. Listar locations de la cuenta
  const locData = await gmbGet(token, `${account.name}/locations?readMask=name,title,storeCode`)
  const gLocations: any[] = locData.locations ?? []
  if (!gLocations.length) throw new Error('No se encontraron sucursales en esta cuenta.')

  console.log('\n📍 Sucursales encontradas:')
  gLocations.forEach((l: any) => console.log(`   • ${l.title ?? l.name}`))

  // Buscar Cotati (o la primera si solo hay una)
  const gLoc = gLocations.find((l: any) =>
    (l.title ?? '').toLowerCase().includes('cotati')
  ) ?? gLocations[0]
  console.log(`\n🏠 Sincronizando: ${gLoc.title ?? gLoc.name}`)

  // 3. Obtener reseñas (hasta 50 por llamada)
  const reviewsData = await gmbGet(token, `${gLoc.name}/reviews?pageSize=50`)
  const gReviews: any[] = reviewsData.reviews ?? []
  const avgRating: number = reviewsData.averageRating ?? 0
  const totalCount: number = reviewsData.totalReviewCount ?? 0

  console.log(`⭐ Rating: ${avgRating} · ${totalCount} reseñas totales en Google`)
  console.log(`📝 ${gReviews.length} reseñas descargadas\n`)

  // 4. Guardar rating en la BD (en locations.links)
  const [cotatiLoc] = await db.select().from(locations).where(eq(locations.slug, 'cotati'))
  if (cotatiLoc) {
    await db.update(locations)
      .set({
        links: {
          ...(cotatiLoc.links as object ?? {}),
          googleRating: avgRating,
          googleReviewCount: totalCount,
        },
      })
      .where(eq(locations.id, cotatiLoc.id))
    console.log(`✅ Rating guardado en BD: ${avgRating} (${totalCount} reseñas)`)
  }

  // 5. Insertar reseñas nuevas
  let inserted = 0
  let skipped  = 0

  for (const r of gReviews) {
    const body      = (r.comment ?? '').trim()
    const starRating = STAR_MAP[r.starRating] ?? 0

    // Solo reseñas de 4+ estrellas con texto útil
    if (starRating < 4 || body.length < 20) { skipped++; continue }

    const authorName = r.reviewer?.displayName ?? 'Google User'

    // Evitar duplicados (mismo autor + texto)
    const existing = await db.select()
      .from(reviews)
      .where(and(
        eq(reviews.source, 'google'),
        eq(reviews.authorName, authorName),
      ))
      .limit(1)

    if (existing.length) { skipped++; continue }

    await db.insert(reviews).values({
      authorName,
      authorCity:  'Sonoma County',
      rating:      starRating,
      bodyEs:      body,
      bodyEn:      body,
      source:      'google',
      status:      'approved',
      isFeatured:  starRating === 5 && body.length >= 80,
      sortOrder:   0,
    })
    inserted++
  }

  console.log(`\n🎉 Listo — ${inserted} reseñas nuevas | ${skipped} omitidas (duplicadas o cortas)`)
  console.log('\n💡 Las reseñas isFeatured=true aparecerán automáticamente en el ReviewsBand del home.')
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
