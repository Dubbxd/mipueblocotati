/** SEO centralizado para rutas públicas y contenido cargado desde el CMS. */

export const SITE_URL = 'https://www.mipueblocotati.com'
export const SITE_NAME = 'Mi Pueblo Cotati'
export const DEFAULT_IMAGE = `${SITE_URL}/assets/hero/hero-restaurante-interior.jpg`

export type JsonLd = Record<string, unknown>

export interface SeoMeta {
  title?: string
  description?: string
  image?: string
  path?: string
  url?: string
  type?: string
  robots?: string
  locale?: 'es_US' | 'en_US'
  jsonLd?: JsonLd[]
}

export function absoluteUrl(value = '/') {
  if (/^https?:\/\//i.test(value)) return value
  return new URL(value, `${SITE_URL}/`).toString()
}

function setMeta(property: string, content: string, attr: 'property' | 'name' = 'property') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, property)
    document.head.appendChild(el)
  }
  el.content = content
}

function setJsonLd(schemas: JsonLd[]) {
  document.querySelectorAll('script[data-seo-jsonld]').forEach((node) => node.remove())
  for (const schema of schemas) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.seoJsonld = 'true'
    script.textContent = JSON.stringify(schema).replace(/</g, '\\u003c')
    document.head.appendChild(script)
  }
}

export function restaurantSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: 'Mi Pueblo Cotati',
    url: `${SITE_URL}/`,
    image: DEFAULT_IMAGE,
    telephone: '+1-707-792-4380',
    email: 'mipueblocotati1@gmail.com',
    servesCuisine: ['Mexican', 'Seafood'],
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '7384 Commerce Blvd',
      addressLocality: 'Cotati',
      addressRegion: 'CA',
      postalCode: '94931',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.3266,
      longitude: -122.7094,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '11:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '21:00',
      },
    ],
    hasMenu: `${SITE_URL}/menu`,
    acceptsReservations: `${SITE_URL}/reservar`,
    sameAs: [
      'https://www.facebook.com/MiPuebloCotati',
      'https://www.instagram.com/mipueblocotati/',
    ],
  }
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    inLanguage: ['es-US', 'en-US'],
    publisher: { '@id': `${SITE_URL}/#restaurant` },
  }
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function applySeo(meta: SeoMeta) {
  const title = meta.title ?? SITE_NAME
  const description = meta.description
    ?? 'Restaurante mexicano familiar en Cotati, California. Consulta el menú, reserva una mesa u ordena en línea.'
  const image = absoluteUrl(meta.image ?? DEFAULT_IMAGE)
  const url = absoluteUrl(meta.url ?? meta.path ?? '/')
  const type = meta.type ?? 'website'
  const locale = meta.locale ?? 'es_US'

  document.title = title
  document.documentElement.lang = locale === 'en_US' ? 'en' : 'es'

  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url

  setMeta('description', description, 'name')
  setMeta('robots', meta.robots ?? 'index, follow, max-image-preview:large', 'name')

  setMeta('og:title', title)
  setMeta('og:description', description)
  setMeta('og:image', image)
  setMeta('og:image:alt', `${SITE_NAME} en Cotati, California`)
  setMeta('og:url', url)
  setMeta('og:type', type)
  setMeta('og:site_name', SITE_NAME)
  setMeta('og:locale', locale)

  setMeta('twitter:card', 'summary_large_image', 'name')
  setMeta('twitter:title', title, 'name')
  setMeta('twitter:description', description, 'name')
  setMeta('twitter:image', image, 'name')

  setJsonLd(meta.jsonLd ?? [restaurantSchema(), websiteSchema()])
}
