# Diagnóstico técnico — Mi Pueblo Novato (& Petaluma)

- **URL fuente**: https://eatmipueblonovato.com/
- **Fecha auditoría**: 2026-04-28
- **Plataforma detectada**: **SpotHopper** (plataforma SaaS de sitios web para restaurantes)
  - HTML server-rendered, sin meta `generator`.
  - Comentario inline `<!-- wcache YYYY-MM-DD ... -->` (cache de SpotHopper).
  - Footer: "Powered by SpotHopper" (`https://www.spothopperapp.com/`).
  - Subdominios: `tmt.spotapps.co`, `static.spotapps.co`.
- **CDN de imágenes**: `static.spotapps.co/spots/...` y `static.spotapps.co/website_images/ab_websites/544706_website_v1/...` (spot_id 544706 = Novato, 601128 = Petaluma).
- **Integraciones detectadas**:
  - **Clover** (online ordering pickup): `clover.com/online-ordering/mi-pueblo-novato-novato` y `mi-pueblo-petaluma-petaluma` — **SPA, no scrapeable directo**.
  - **DoorDash** (delivery): tiendas 288630 (Novato) y 275634 (Petaluma).
  - **Square** (referenced in HTML).
- **JS framework**: ninguno detectable (HTML clásico server-rendered con jQuery posiblemente). `fetch_webpage` directo basta.
- **Anti-bot**: ninguno.
- **Sitemap**: `/sitemap.xml` con 9 URLs (specials, petaluma, /, party, events, catering, locations, food-menu, accessibility-page-01).
- **Endpoint útil clave**: `/food-menu` devuelve TODAS las categorías y platillos en HTML (¡sin precios visibles en el HTML, los precios viven en Clover!).
- **Estrategia elegida**:
  1. `fetch_webpage` sobre todas las URLs del sitemap → extraer info, menú estructurado, sucursales, horarios, contacto.
  2. PowerShell `Invoke-WebRequest` para descargar imágenes de `static.spotapps.co` (URLs identificadas en el HTML de la home: la galería pública lista platillos individuales con `/full` suffix).
  3. Documentar en `02-menu-completo.md` la lista exhaustiva de platillos por categoría (~150 ítems) con la advertencia de que **los precios solo viven en el menú de Clover** y deben actualizarse contra ese sistema.
- **Riesgos**:
  - Sin precios en el sitio público — para una rebuilds completo hay que pedir export de Clover al cliente o aceptar que los precios se obtienen on-demand desde Clover.
  - Algunas imágenes del carrusel "ONLINE ORDERING" son placeholders (`web/placeholder.png`) porque Clover sirve esas imágenes después.
- **Cobertura del scraping**:
  - ✅ Información general, contacto, redes, horarios (Novato + Petaluma)
  - ✅ Menú completo (categorías + nombres + descripciones cuando existen) — **sin precios**
  - ✅ Imágenes de galería de comida (10+ fotos reales en `static.spotapps.co/spots/...`)
  - ✅ Specials del día
  - ⚠️ Precios → requieren export de Clover por el cliente
