/**
 * Sincroniza reseñas de Google Places API a la BD local.
 *
 * Prerequisito: tener en .env:
 *   GOOGLE_PLACES_API_KEY  (API key con Places API habilitada)
 *
 * Uso:
 *   bun scripts/sync-google-reviews.ts
 *
 * ¿Qué hace?
 *   - Busca Mi Pueblo Cotati via Places Text Search
 *   - Obtiene rating, total de reseñas y hasta 5 reseñas recientes
 *   - Inserta reseñas nuevas en la tabla `reviews` (source='google', status='approved')
 *   - Marca como isFeatured las reseñas de 5 estrellas con texto ≥ 80 chars
 *   - Guarda el rating promedio y total de reseñas en locations.links
 */

import { db } from '../src/db/client'
import { reviews, locations } from '../src/db/schema'
import { eq, and } from 'drizzle-orm'

const API_KEY = process.env.GOOGLE_PLACES_API_KEY

if (!API_KEY) {
  console.error('❌ Falta GOOGLE_PLACES_API_KEY en el .env')
  process.exit(1)
}

const BASE = 'https://places.googleapis.com/v1'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function findPlaceId(query: string): Promise<string | null> {
  const res  = await fetch(`${BASE}/places:searchText`, {
    method:  'POST',
    headers: {
      'Content-Type':    'application/json',
      'X-Goog-Api-Key':  API_KEY!,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify({ textQuery: query }),
  })
  const data = await res.json() as any
  if (data.error) throw new Error(`Places search error: ${JSON.stringify(data.error)}`)
  return data?.places?.[0]?.id ?? null
}

async function getPlaceDetails(placeId: string) {
  const res  = await fetch(`${BASE}/places/${placeId}`, {
    headers: {
      'X-Goog-Api-Key':  API_KEY!,
      'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews',
    },
  })
  const data = await res.json() as any
  if (data.error) throw new Error(`Places details error: ${JSON.stringify(data.error)}`)
  return data as {
    rating?: number
    userRatingCount?: number
    reviews?: Array<{
      name: string
      rating: number
      text?: { text: string; languageCode: string }
      authorAttribution?: { displayName: string }
      relativePublishTimeDescription: string
    }>
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Sincronizando reseñas via Google Places API...\n')

  // 1. Encontrar place_id
  const placeId = await findPlaceId('Mi Pueblo Cotati CA')
  if (!placeId) throw new Error('No se encontró el lugar en Google Places')
  console.log(`📍 Place ID: ${placeId}`)

  // 2. Obtener detalles
  const place = await getPlaceDetails(placeId)
  const avgRating  = place.rating ?? 0
  const totalCount = place.userRatingCount ?? 0
  const gReviews   = place.reviews ?? []

  console.log(`⭐ Rating: ${avgRating} · ${totalCount} reseñas totales en Google`)
  console.log(`📝 ${gReviews.length} reseñas descargadas\n`)

  // 3. Guardar rating en la BD (en locations.links)
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

  // 4. Insertar reseñas nuevas
  let inserted = 0
  let skipped  = 0

  for (const r of gReviews) {
    const body   = (r.text?.text ?? '').trim()
    const rating = r.rating ?? 0

    // Solo reseñas de 4+ estrellas con texto útil
    if (rating < 4 || body.length < 20) { skipped++; continue }

    const authorName = r.authorAttribution?.displayName ?? 'Google User'

    // Evitar duplicados (mismo autor)
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
      rating,
      bodyEs:      body,
      bodyEn:      body,
      source:      'google',
      status:      'approved',
      isFeatured:  rating === 5 && body.length >= 80,
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
