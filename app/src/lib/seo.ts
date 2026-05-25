/** Actualiza <title> y las meta tags OG/Twitter en el <head> del documento. */

const BASE_URL = 'https://mipueblocotati.easypage.mx'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`
const SITE_NAME = 'Mi Pueblo Cotati'

export interface SeoMeta {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
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

export function applySeo(meta: SeoMeta) {
  const title = meta.title ?? SITE_NAME
  const description = meta.description ?? 'Auténtica comida mexicana en Sonoma County desde 1997. Más de 170 platillos, 6 sucursales.'
  const image = meta.image ?? DEFAULT_IMAGE
  const url = meta.url ?? BASE_URL
  const type = meta.type ?? 'website'

  document.title = title

  // Canonical
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = url

  // Description
  setMeta('description', description, 'name')

  // Open Graph
  setMeta('og:title', title)
  setMeta('og:description', description)
  setMeta('og:image', image)
  setMeta('og:url', url)
  setMeta('og:type', type)
  setMeta('og:site_name', SITE_NAME)

  // Twitter
  setMeta('twitter:title', title, 'name')
  setMeta('twitter:description', description, 'name')
  setMeta('twitter:image', image, 'name')
}
