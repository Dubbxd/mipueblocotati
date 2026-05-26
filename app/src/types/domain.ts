// Tipos canónicos del dominio Mi Pueblo. Espejo del esquema Elyza.
export type LocaleText = { es: string; en: string }

export interface Restaurant {
  id: string
  slug: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  email?: string
  lat: number
  lng: number
  hours: { mon_fri: string; sat_sun: string }
  isMain?: boolean
  photo?: string
  links: {
    pickup?: string
    delivery?: string
    reservations?: string
    facebook?: string
    instagram?: string
    googleMaps?: string
  }
}

export interface MenuCategory {
  id: string
  slug: string
  name: LocaleText
  order: number
  description?: LocaleText
}

export type MenuTag = 'popular' | 'new' | 'spicy' | 'vegetarian' | 'seafood' | 'kids' | 'gluten_free'

export interface MenuItem {
  id: string
  slug: string
  categoryId: string
  name: LocaleText
  description?: LocaleText
  price: number | null  // USD; null = "market price" o "with combo"
  photo?: string        // ruta /assets/gallery/xxx.webp o externa
  tags: MenuTag[]
  modifiers?: string[]  // ids de modificadores
  availableAt?: string[] // restaurant ids; vacío = todas
}

export interface GalleryImage {
  id: string
  src: string
  alt: LocaleText
  width?: 1 | 2  // masonry width
  dishSlug?: string
}

export interface Award {
  id: string
  title: LocaleText
  year?: number
  badge: string  // ruta a imagen
}

export interface Promotion {
  id: string
  title: LocaleText
  description: LocaleText
  recurrence: 'weekly' | 'one_time'
  dayOfWeek?: number // 0..6 (sólo si weekly)
  validAt?: string[] // restaurant ids
  active: boolean
  photo?: string
  cta?: { label: LocaleText; href: string }
}

export interface Review {
  id: string
  author: string
  rating: number // 1..5
  text: LocaleText
  date: string // ISO
  source: 'google' | 'yelp' | 'internal'
  restaurantId?: string
}

export interface ReservationDraft {
  restaurantId: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  partySize: number
  customer: { name: string; phone: string; email: string; notes?: string }
}
