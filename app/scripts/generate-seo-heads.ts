import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const DIST = join(process.cwd(), 'dist')
const SITE_URL = 'https://www.mipueblocotati.com'

type RouteSeo = {
  path: string
  title: string
  description: string
  heading: string
  robots?: string
}

const routes: RouteSeo[] = [
  {
    path: '/',
    title: 'Mi Pueblo Cotati · Auténtica comida mexicana desde 1997',
    description: 'Restaurante mexicano familiar en Cotati, California. Consulta el menú, reserva una mesa u ordena en línea.',
    heading: 'Restaurante mexicano en Cotati, California',
  },
  {
    path: '/menu',
    title: 'Menú · Mi Pueblo Cotati',
    description: 'Explora el menú de Mi Pueblo Cotati: tacos, burritos, fajitas, mariscos y especialidades mexicanas.',
    heading: 'Menú de Mi Pueblo Cotati',
  },
  {
    path: '/sucursales',
    title: 'Sucursales · Mi Pueblo Cotati',
    description: 'Información, dirección y horario de Mi Pueblo Cotati y las ubicaciones activas de la familia Mi Pueblo.',
    heading: 'Ubicaciones de Mi Pueblo',
  },
  {
    path: '/reservar',
    title: 'Reservar mesa · Mi Pueblo Cotati',
    description: 'Solicita una reservación en Mi Pueblo Cotati, 7384 Commerce Blvd, Cotati, California.',
    heading: 'Reserva una mesa en Mi Pueblo Cotati',
  },
  {
    path: '/promociones',
    title: 'Promociones · Mi Pueblo Cotati',
    description: 'Consulta las promociones vigentes publicadas por Mi Pueblo Cotati.',
    heading: 'Promociones vigentes',
  },
  {
    path: '/catering',
    title: 'Catering mexicano · Mi Pueblo Cotati',
    description: 'Solicita información sobre catering de Mi Pueblo Cotati para eventos en Sonoma County y alrededores.',
    heading: 'Catering mexicano para tu evento',
  },
  {
    path: '/food-truck',
    title: 'Food Truck · Mi Pueblo Cotati',
    description: 'Consulta disponibilidad del food truck de Mi Pueblo Cotati para eventos.',
    heading: 'Food truck de Mi Pueblo Cotati',
  },
  {
    path: '/resenas',
    title: 'Reseñas · Mi Pueblo Cotati',
    description: 'Consulta opiniones de clientes y encuentra el perfil público de Mi Pueblo Cotati.',
    heading: 'Opiniones sobre Mi Pueblo Cotati',
  },
  {
    path: '/contacto',
    title: 'Contacto · Mi Pueblo Cotati',
    description: 'Visita Mi Pueblo Cotati en 7384 Commerce Blvd o llama al (707) 792-4380.',
    heading: 'Contacto y ubicación',
  },
  {
    path: '/blog',
    title: 'Blog · Mi Pueblo Cotati',
    description: 'Historias, noticias y contenidos publicados por Mi Pueblo Cotati.',
    heading: 'Blog de Mi Pueblo Cotati',
  },
  {
    path: '/encuesta',
    title: 'Encuesta · Mi Pueblo Cotati',
    description: 'Comparte tu experiencia con el equipo de Mi Pueblo Cotati.',
    heading: 'Encuesta de satisfacción',
    robots: 'noindex, nofollow',
  },
]

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function setMeta(html: string, selector: string, content: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`(<meta\\s+${escapedSelector}\\s+content=")[^"]*("\\s*\\/?>)`, 'i')
  return pattern.test(html)
    ? html.replace(pattern, `$1${escapeHtml(content)}$2`)
    : html.replace('</head>', `    <meta ${selector} content="${escapeHtml(content)}" />\n  </head>`)
}

function render(baseHtml: string, route: RouteSeo) {
  const canonical = `${SITE_URL}${route.path === '/' ? '/' : route.path}`
  let html = baseHtml
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`)

  html = setMeta(html, 'name="description"', route.description)
  html = setMeta(html, 'name="robots"', route.robots ?? 'index, follow, max-image-preview:large')
  html = setMeta(html, 'property="og:title"', route.title)
  html = setMeta(html, 'property="og:description"', route.description)
  html = setMeta(html, 'property="og:url"', canonical)
  html = setMeta(html, 'name="twitter:title"', route.title)
  html = setMeta(html, 'name="twitter:description"', route.description)

  const fallback = [
    '<div id="app">',
    '  <main style="max-width:72rem;margin:0 auto;padding:2rem;font-family:system-ui,sans-serif">',
    `    <h1>${escapeHtml(route.heading)}</h1>`,
    `    <p>${escapeHtml(route.description)}</p>`,
    '    <address>7384 Commerce Blvd, Cotati, CA 94931 · <a href="tel:+17077924380">(707) 792-4380</a></address>',
    '    <nav aria-label="Navegación principal"><a href="/menu">Menú</a> · <a href="/reservar">Reservar</a> · <a href="/contacto">Contacto</a></nav>',
    '  </main>',
    '</div>',
  ].join('\n')
  return html.replace('<div id="app"></div>', fallback)
}

const baseHtml = await readFile(join(DIST, 'index.html'), 'utf8')

for (const route of routes) {
  const output = route.path === '/'
    ? join(DIST, 'index.html')
    : join(DIST, `${route.path.slice(1)}.html`)
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, render(baseHtml, route), 'utf8')
}

console.log(`SEO shells generated for ${routes.length} public routes`)
