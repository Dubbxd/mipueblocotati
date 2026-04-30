/**
 * Importa el menú completo (140+ platillos) desde
 * `app/src/data/menu.ts` hacia Postgres.
 *
 * Estrategia: TRUNCATE + INSERT (idempotente, fuente de verdad = archivo TS).
 *
 *   bun run scripts/import-menu.ts
 *
 * Nota: `app/src/data/menu.ts` solo usa `import type`, que Bun elimina en
 * runtime → podemos importarlo directo aunque viva fuera del paquete server.
 */
import { sql, db } from '../src/db/client'
import { menuCategories, menuItems } from '../src/db/schema'
import { categories, menuItems as items } from '../../app/src/data/menu'

async function main() {
  console.log(`📥 Importando ${categories.length} categorías y ${items.length} platillos...`)

  // Limpia tablas (cascade borra items)
  await sql`TRUNCATE TABLE menu_categories RESTART IDENTITY CASCADE`
  console.log('🧹 Tablas menu_* limpiadas')

  // Inserta categorías
  const catRows = categories.map((c) => ({
    slug: c.slug,
    nameEs: c.name.es,
    nameEn: c.name.en,
    sortOrder: c.order,
    isActive: true,
  }))
  const insertedCats = await db.insert(menuCategories).values(catRows).returning()
  console.log(`✅ ${insertedCats.length} categorías insertadas`)

  // Map slug → id
  const slugToId = new Map(insertedCats.map((c) => [c.slug, c.id]))

  // Inserta items
  const itemRows = items.map((it, i) => {
    const catId = slugToId.get(it.categoryId)
    if (!catId) throw new Error(`Categoría no encontrada: ${it.categoryId} (item ${it.slug})`)
    return {
      categoryId: catId,
      slug: it.slug,
      nameEs: it.name.es,
      nameEn: it.name.en,
      descriptionEs: it.description?.es ?? null,
      descriptionEn: it.description?.en ?? null,
      price: it.price != null ? String(it.price) : null,
      photo: it.photo ?? null,
      tags: (it.tags ?? []) as string[],
      isAvailable: true,
      sortOrder: i,
    }
  })

  // Batch insert (postgres-js soporta arrays grandes sin problema)
  const insertedItems = await db.insert(menuItems).values(itemRows).returning({ id: menuItems.id })
  console.log(`✅ ${insertedItems.length} platillos insertados`)

  // Resumen por categoría
  const byCat = new Map<string, number>()
  for (const it of items) byCat.set(it.categoryId, (byCat.get(it.categoryId) ?? 0) + 1)
  console.log('\n📊 Resumen:')
  for (const c of categories) {
    console.log(`   ${String(byCat.get(c.id) ?? 0).padStart(3)} · ${c.name.es}`)
  }

  await sql.end()
  console.log('\n✨ Import completo')
}

main().catch(async (e) => {
  console.error('❌ Import falló:', e)
  await sql.end()
  process.exit(1)
})
