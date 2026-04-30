# Diagnóstico técnico — Mi Pueblo Cotati

- **URL fuente**: https://www.mipueblocotati.com/
- **Fecha auditoría**: 2026-04-28
- **Plataforma detectada**: Wix.com Website Builder (server-rendered + Wix runtime)
  - `<meta name="generator" content="Wix.com Website Builder">`
  - `Server: Pepyaka` (proxy de Wix)
  - CDN de imágenes: `static.wixstatic.com/media/302d76_*`
- **Theme / template**: plantilla "Restaurants" de Wix (la página `/menu` muestra contenido demo de la plantilla, no es el menú real).
- **JS framework**: Wix runtime (no es un SPA puro; el HTML inicial sí incluye contenido).
- **Anti-bot**: ninguno (filtro UA básico). PowerShell `Invoke-WebRequest` con UA Mozilla funciona.
- **Sitemaps disponibles**:
  - `/sitemap.xml` → índice
  - `/pages-sitemap.xml` → 9 URLs (home, menu, menu-test, blog, lead-collection, reservations-online, contáctanos, experiences, experience-details)
  - `/restaurants-menu-sitemap.xml` → solo `?menu=dinner-menu` (demo)
- **Endpoints útiles encontrados**:
  - `/sitemap.xml` y subsitemaps
  - PDF oficial del menú alojado en Google Drive: `https://drive.google.com/file/d/1yySEviBLR8ZMpMLQcHVfbEkh6bmQGSJv/view` (descargado vía `?export=download&id=...`)
  - Pickup orders externos: `https://mi-pueblo-real-mex-cotati.cloveronline.com/menu/all` (Clover, **SPA** — no scrapeable directo)
  - Reservas externas: `https://www.doordash.com/store/taqueria-mi-pueblo-cotati-275565/`
- **Estrategia elegida**:
  1. `fetch_webpage` sobre HTML (home, contacto, experiences, reservations) para extraer info general, contacto, horario, redes y URLs de imágenes Wix.
  2. **Menú real**: descargar el PDF de Google Drive, renderizar las 5 páginas a PNG con `pymupdf`, hacer OCR con `easyocr` (tesseract no estaba instalado). Texto extraído: 11 KB con todas las categorías, platillos y precios.
  3. PowerShell `Invoke-WebRequest` (idempotente con `Test-Path`) para descargar imágenes de `static.wixstatic.com` con UA realista.
- **Riesgos**:
  - El PDF tenía marca de agua `QPS PROOF` — texto vectorial inexistente, OCR obligatorio.
  - URLs de Wix incluyen transformaciones (`/v1/fill/w_...`); se descargan eliminando esos parámetros para obtener el original.
  - El "Cotati" en la sucursales del PDF dice `Commerce Blvd Cotati CA 94928` pero la dirección real (de Wix contacto) es **7384 Commerce Blvd, Cotati, CA 94931**.
- **Cobertura del scraping**:
  - ✅ Información general, contacto, redes, horarios
  - ✅ Menú completo con precios (vía OCR del PDF oficial)
  - ✅ Awards / certificados
  - ✅ Imágenes de comida del sitio Wix
  - ⚠️ Menú online "live" de Clover (precios pueden variar) → fuera de alcance: requiere Playwright
