import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/lib/api'
import { awards } from '@/data/marketing'
import type { MenuCategory, MenuItem, MenuTag, Restaurant, GalleryImage, Promotion } from '@/types/domain'

// ── DB response types ─────────────────────────────────────────────
interface DbLocation {
  id: number; slug: string; name: string; city: string; state: string
  addressLine: string; postalCode: string | null; phone: string | null
  email: string | null; lat: string | null; lng: string | null
  hours: Array<{ day: string; open: string; close: string }> | null
  links: Record<string, string> | null
}
interface DbPromotion {
  id: number; slug: string; titleEs: string; titleEn: string
  bodyEs: string | null; bodyEn: string | null; photo: string | null
  ctaUrl: string | null; ctaLabelEs: string | null; ctaLabelEn: string | null
  isActive: boolean
}
interface DbGalleryItem {
  id: number; url: string; alt: string | null; width: number | null; height: number | null
}

// ── Mappers ───────────────────────────────────────────────────────
function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour}:${String(m).padStart(2, '0')} ${period}`
}
function mapHours(arr: DbLocation['hours']): Restaurant['hours'] {
  if (!arr?.length) return { mon_fri: '11:00 AM – 9:00 PM', sat_sun: '10:00 AM – 9:00 PM' }
  const wd = arr.find(h => ['mon', 'tue', 'wed', 'thu', 'fri'].includes(h.day))
  const we = arr.find(h => ['sat', 'sun'].includes(h.day))
  return {
    mon_fri: wd ? `${fmtTime(wd.open)} – ${fmtTime(wd.close)}` : '11:00 AM – 9:00 PM',
    sat_sun: we ? `${fmtTime(we.open)} – ${fmtTime(we.close)}` : '10:00 AM – 9:00 PM',
  }
}
function mapLocation(loc: DbLocation): Restaurant {
  return {
    id: loc.slug, slug: loc.slug, name: loc.name,
    address: loc.addressLine, city: loc.city, state: loc.state, zip: loc.postalCode ?? '',
    phone: loc.phone ?? '', email: loc.email ?? undefined,
    lat: loc.lat ? parseFloat(loc.lat) : 0,
    lng: loc.lng ? parseFloat(loc.lng) : 0,
    hours: mapHours(loc.hours),
    links: {
      pickup: loc.links?.clover ?? loc.links?.pickup ?? undefined,
      delivery: loc.links?.doordash ?? loc.links?.delivery ?? undefined,
      reservations: loc.links?.reservations ?? undefined,
      facebook: loc.links?.facebook ?? undefined,
      instagram: loc.links?.instagram ?? undefined,
    },
  }
}
function mapPromotion(p: DbPromotion): Promotion {
  return {
    id: p.slug,
    title: { es: p.titleEs, en: p.titleEn },
    description: { es: p.bodyEs ?? p.titleEs, en: p.bodyEn ?? p.titleEn },
    recurrence: 'one_time', active: p.isActive,
    photo: p.photo ?? undefined,
    ...(p.ctaUrl ? { cta: { label: { es: p.ctaLabelEs ?? 'Ver más', en: p.ctaLabelEn ?? 'See more' }, href: p.ctaUrl } } : {}),
  }
}
function mapGalleryItem(g: DbGalleryItem): GalleryImage {
  return {
    id: String(g.id), src: g.url,
    alt: { es: g.alt ?? '', en: g.alt ?? '' },
    width: g.width && g.height && g.width / g.height > 1.5 ? 2 : 1,
  }
}

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
  const loading = ref(false)
  const error = ref<string | null>(null)
  const restaurants = ref<Restaurant[]>([])
  const gallery = ref<GalleryImage[]>([])
  const promotions = ref<Promotion[]>([])
  const promoBarDismissed = ref(localStorage.getItem('promoBarDismissed') === '1')

  const mainRestaurant = computed(() => restaurants.value[0] ?? null)

  async function init() {
    if (restaurants.value.length) return
    loading.value = true
    error.value = null
    try {
      const [locs, promos, gal] = await Promise.all([
        api<DbLocation[]>('/api/public/locations', { auth: false }),
        api<DbPromotion[]>('/api/public/promotions', { auth: false }),
        api<DbGalleryItem[]>('/api/public/gallery', { auth: false }),
      ])
      restaurants.value = locs.map(mapLocation)
      promotions.value = promos.map(mapPromotion)
      gallery.value = gal.map(mapGalleryItem)
    } catch (e: any) {
      error.value = e?.message ?? 'Error cargando datos del sitio'
    } finally {
      loading.value = false
    }
  }

  const dismissPromoBar = () => {
    promoBarDismissed.value = true
    localStorage.setItem('promoBarDismissed', '1')
  }

  return { restaurants, gallery, promotions, awards, loading, error, promoBarDismissed, dismissPromoBar, mainRestaurant, init }
})
