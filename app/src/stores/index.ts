import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/api'
import { restaurants } from '@/data/restaurants'
import { gallery } from '@/data/gallery'
import { awards, promotions } from '@/data/marketing'
import type { MenuCategory, MenuItem, MenuTag } from '@/types/domain'

// ── Tipos del response del servidor ──────────────────────────────
interface DbCategory {
  id: number
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  sortOrder: number
}
interface DbItem {
  id: number
  categoryId: number
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs: string | null
  descriptionEn: string | null
  price: string | null
  photo: string | null
  tags: string[]
}

function mapCategory(c: DbCategory): MenuCategory {
  return {
    id: c.slug,
    slug: c.slug,
    name: { es: c.nameEs, en: c.nameEn },
    order: c.sortOrder,
    ...(c.descriptionEs || c.descriptionEn
      ? { description: { es: c.descriptionEs ?? c.nameEs, en: c.descriptionEn ?? c.nameEn } }
      : {}),
  }
}

function mapItem(item: DbItem, catSlugById: Map<number, string>): MenuItem {
  return {
    id: item.slug,
    slug: item.slug,
    categoryId: catSlugById.get(item.categoryId) ?? String(item.categoryId),
    name: { es: item.nameEs, en: item.nameEn },
    ...(item.descriptionEs || item.descriptionEn
      ? { description: { es: item.descriptionEs ?? item.nameEs, en: item.descriptionEn ?? item.nameEn } }
      : {}),
    price: item.price != null ? parseFloat(item.price) : null,
    photo: item.photo ?? undefined,
    tags: item.tags as MenuTag[],
  }
}

export const useMenuStore = defineStore('menu', () => {
  const search = ref('')
  const activeTag = ref<MenuTag | 'all'>('all')
  const loading = ref(false)
  const error = ref<string | null>(null)
  const all = ref<MenuItem[]>([])
  const categories = ref<MenuCategory[]>([])

  async function init() {
    if (all.value.length) return
    loading.value = true
    error.value = null
    try {
      const data = await api<{ categories: DbCategory[]; items: DbItem[] }>(
        '/api/public/menu',
        { auth: false },
      )
      const catSlugById = new Map<number, string>(data.categories.map((c) => [c.id, c.slug]))
      categories.value = data.categories.map(mapCategory)
      all.value = data.items.map((item) => mapItem(item, catSlugById))
    } catch (e: any) {
      error.value = e?.message ?? 'Error cargando menú'
    } finally {
      loading.value = false
    }
  }

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return all.value.filter((m) => {
      if (activeTag.value !== 'all' && !m.tags.includes(activeTag.value)) return false
      if (!q) return true
      return (
        m.name.es.toLowerCase().includes(q) ||
        m.name.en.toLowerCase().includes(q) ||
        (m.description?.es ?? '').toLowerCase().includes(q) ||
        (m.description?.en ?? '').toLowerCase().includes(q)
      )
    })
  })

  const grouped = computed(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of filtered.value) {
      if (!map.has(item.categoryId)) map.set(item.categoryId, [])
      map.get(item.categoryId)!.push(item)
    }
    return categories.value
      .filter((c) => map.has(c.id))
      .map((c) => ({ category: c, items: map.get(c.id)! }))
  })

  const popular = computed(() => all.value.filter((m) => m.tags.includes('popular')))

  return { search, activeTag, loading, error, all, categories, filtered, grouped, popular, init }
})

export const useSiteStore = defineStore('site', () => {
  const promoBarDismissed = ref(localStorage.getItem('promoBarDismissed') === '1')
  const dismissPromoBar = () => {
    promoBarDismissed.value = true
    localStorage.setItem('promoBarDismissed', '1')
  }
  return { restaurants, gallery, awards, promotions, promoBarDismissed, dismissPromoBar }
})
