import { Elysia } from 'elysia'
import { and, eq, isNotNull } from 'drizzle-orm'
import { db } from '../db/client'
import { blogPosts, locations, menuItems } from '../db/schema'

const SITE_URL = 'https://www.mipueblocotati.com'

type SitemapEntry = {
  path: string
  lastmod?: Date | null
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly'
  priority: number
}

const staticEntries: SitemapEntry[] = [
  { path: '/', changefreq: 'weekly', priority: 1 },
  { path: '/menu', changefreq: 'weekly', priority: 0.9 },
  { path: '/sucursales', changefreq: 'monthly', priority: 0.8 },
  { path: '/reservar', changefreq: 'monthly', priority: 0.8 },
  { path: '/promociones', changefreq: 'weekly', priority: 0.8 },
  { path: '/catering', changefreq: 'monthly', priority: 0.8 },
  { path: '/food-truck', changefreq: 'monthly', priority: 0.7 },
  { path: '/resenas', changefreq: 'weekly', priority: 0.6 },
  { path: '/contacto', changefreq: 'monthly', priority: 0.7 },
  { path: '/blog', changefreq: 'weekly', priority: 0.7 },
]

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function renderUrl(entry: SitemapEntry) {
  const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod.toISOString()}</lastmod>` : ''
  return [
    '<url>',
    `<loc>${escapeXml(`${SITE_URL}${entry.path}`)}</loc>`,
    lastmod,
    `<changefreq>${entry.changefreq}</changefreq>`,
    `<priority>${entry.priority.toFixed(1)}</priority>`,
    '</url>',
  ].filter(Boolean).join('')
}

export const seoRoutes = new Elysia()
  .get('/sitemap.xml', async ({ set }) => {
    const [activeLocations, availableItems, publishedPosts] = await Promise.all([
      db.select({ slug: locations.slug, updatedAt: locations.updatedAt })
        .from(locations)
        .where(eq(locations.isActive, true)),
      db.select({ slug: menuItems.slug, updatedAt: menuItems.updatedAt })
        .from(menuItems)
        .where(eq(menuItems.isAvailable, true)),
      db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
        .from(blogPosts)
        .where(and(eq(blogPosts.status, 'published'), isNotNull(blogPosts.publishedAt))),
    ])

    const entries: SitemapEntry[] = [
      ...staticEntries,
      ...activeLocations.map((row) => ({
        path: `/sucursales/${row.slug}`,
        lastmod: row.updatedAt,
        changefreq: 'monthly' as const,
        priority: 0.8,
      })),
      ...availableItems.map((row) => ({
        path: `/menu/${row.slug}`,
        lastmod: row.updatedAt,
        changefreq: 'monthly' as const,
        priority: 0.6,
      })),
      ...publishedPosts.map((row) => ({
        path: `/blog/${row.slug}`,
        lastmod: row.updatedAt,
        changefreq: 'monthly' as const,
        priority: 0.6,
      })),
    ]

    set.headers['content-type'] = 'application/xml; charset=utf-8'
    set.headers['cache-control'] = 'public, max-age=900, stale-while-revalidate=3600'
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map(renderUrl).join('')}</urlset>`
  })
