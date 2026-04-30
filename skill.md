---
description: WORKFLOW SKILL — Scrape a small business website (restaurant, café, shop) to extract complete content (menu, prices, contact, hours) and download all media assets (logo, hero, dish photos, icons) in one pass on Windows. USE FOR; cloning a client's existing website to rebuild it as a modern PWA/Next.js app; auditing what assets exist before a redesign; building a structured content inventory (menu items with images, prices, descriptions, categories) from an unstructured WordPress/Wix/page-builder site. PRODUCES; a `scraping/` folder with markdown docs (general info, full menu, UX audit, design tokens, asset inventory) AND an `assets/` folder mirroring the source CDN with semantic filenames. INVOKES; fetch_webpage for HTML/CSS extraction, run_in_terminal for PowerShell `Invoke-WebRequest` downloads, file system tools for inventory. DO NOT USE FOR; sites requiring login/JavaScript-rendered SPAs (use Playwright instead); copyrighted media beyond fair-use redesign of a client you represent; bulk-scraping unrelated competitor sites.
---

# Web Scraping de Sitio de Restaurante/Negocio Local (Windows / PowerShell)

Workflow probado y completado en producción para `rutasietetrescuartos.com` (WordPress + plugin de menú).
Output: 7 documentos markdown estructurados + assets descargados con script idempotente.

> 🔑 **Regla de oro**: NUNCA empieces a descargar nada sin completar primero el **Paso 0 (Detección de Stack)**. La táctica de extracción cambia radicalmente entre WordPress, Shopify, Wix, SPA pura, etc. Saltarse este paso es la causa #1 de scrapers rotos.

---

## Cuándo usar este skill

✅ El cliente te entrega su sitio actual y quieres rebuildearlo desde cero
✅ Necesitas inventario completo de menú/productos con fotos y precios
✅ El sitio es estático o WordPress (HTML server-rendered)
✅ Trabajas en Windows con PowerShell

❌ NO usar si: el sitio requiere login, los datos llegan por API/JS (`fetch` post-render), hay anti-bot agresivo (Cloudflare challenge, reCAPTCHA), o si vas a publicar contenido sin permiso del dueño.

---

## Estructura de carpetas que produce

```
proyecto/
├── scraping/
│   ├── README.md                     # índice + resumen ejecutivo
│   ├── 00-diagnostico-stack.md       # plataforma detectada, endpoints, estrategia
│   ├── 01-informacion-general.md     # nombre, dirección, contacto, redes, horario
│   ├── 02-menu-completo.md           # 100% del menú con precios y descripciones
│   ├── 03-analisis-ux-actual.md      # problemas UX/SEO/perf del sitio original
│   ├── 04-plan-rebranding-pwa.md     # propuesta técnica + roadmap
│   ├── 05-activos-digitales.md       # tabla de URLs originales ↔ archivos locales
│   └── 06-sistema-diseno.md          # tokens, paleta, tipografía sugerida
├── assets/                            # MIRROR del CDN del cliente (no se sirve)
│   ├── logos/
│   ├── hero/
│   ├── menu/                          # ← una imagen por platillo, nombre semántico
│   ├── gallery/
│   ├── icons/
│   └── placeholders/
└── scripts/
    └── download-assets.ps1            # script idempotente reutilizable
```

> ⚠️ El `scraping/output/` (HTML crudo) se ignora en `.gitignore`. Los `.md` curados SÍ se commitean.
> ⚠️ `assets/` se commitea como source-of-truth, pero **NO** se sirve directo: las imágenes finales se copian a `app/public/assets/` ya optimizadas.

---

## Flujo de 6 pasos

### Paso 0 — DETECCIÓN DE STACK (obligatorio antes de scrapear)

**No avances sin completar este paso.** Diferentes stacks requieren tácticas distintas. Sin este diagnóstico vas a perder tiempo o descargar basura.

#### 0.1 — Inspección de huellas en el HTML raíz

Usa `fetch_webpage` con la home y busca señales:

| Señal en HTML / headers | Stack probable | Táctica de extracción |
|---|---|---|
| `/wp-content/`, `/wp-includes/`, `wp-json` | **WordPress** | Server-rendered. Scraping HTML directo + endpoint REST `/wp-json/wp/v2/media`, `/wp-json/wp/v2/pages`. Ideal. |
| `<meta name="generator" content="WordPress X.Y">` | WordPress confirmado | Idem. Bonus: revisar `?rest_route=/` |
| `cdn.shopify.com`, `Shopify.theme`, `/products.json` | **Shopify** | API pública: `https://tienda.com/products.json` devuelve TODO el catálogo en JSON. |
| `static.wixstatic.com`, `wix-code` | **Wix** | SPA. Usa `fetch_webpage` con render JS o Playwright. Datos en `<script id="wix-warmup-data">` JSON. |
| `squarespace.com`, `static1.squarespace.com` | **Squarespace** | Append `?format=json` a cualquier URL → devuelve el JSON crudo de la página. |
| `cdn.webflow.com` | **Webflow** | Server-rendered HTML limpio. Scraping directo. CSS muy bueno para tokens. |
| `_next/static/`, `__NEXT_DATA__` | **Next.js** | Buscar `<script id="__NEXT_DATA__">` → JSON con todo el data layer. |
| `_nuxt/`, `__NUXT__` | **Nuxt** | Idem con `window.__NUXT__`. |
| `data-reactroot`, sin contenido server-side | **React SPA** | Necesitas Playwright o `fetch_webpage` con execution. |
| Solo `<div id="root"></div>` vacío | SPA pura | Playwright obligatorio. |
| `Server: cloudflare` + challenge page | **Cloudflare anti-bot** | Posible bloqueo. Usa Playwright con UA real o pide acceso al dueño. |

#### 0.2 — Comandos rápidos de detección (Windows)

```powershell
# Ver headers de respuesta y meta generator
$r = Invoke-WebRequest -Uri "https://cliente.com/" -UserAgent "Mozilla/5.0"
$r.Headers          # Server, X-Powered-By
$r.Content -match 'meta name="generator" content="([^"]+)"' ; $matches[1]

# Detectar plataforma por patrones en HTML
"wp-content","cdn.shopify","wixstatic","squarespace","webflow","__NEXT_DATA__","__NUXT__" |
  ForEach-Object { if ($r.Content -match $_) { Write-Host "Match: $_" } }

# Probar endpoints públicos típicos
@("/wp-json/wp/v2/posts?per_page=1",
  "/products.json?limit=1",
  "/sitemap.xml",
  "/robots.txt") | ForEach-Object {
    try {
      $u = "https://cliente.com$_"
      $code = (Invoke-WebRequest -Uri $u -Method Head -UserAgent "Mozilla/5.0" -ErrorAction Stop).StatusCode
      Write-Host "[$code] $u"
    } catch { Write-Host "[FAIL] $u" }
}
```

#### 0.3 — Decidir táctica de extracción según el stack

| Stack detectado | Estrategia primaria | Estrategia secundaria |
|---|---|---|
| **WordPress** | `fetch_webpage` página por página + `/wp-json/wp/v2/media?per_page=100` para catálogo de imágenes | Si hay plugin de menú: inspeccionar su REST namespace (`/wp-json/{plugin}/v1/`) |
| **Shopify** | `GET /products.json` → parsear precios, variantes, imágenes | `/collections/{handle}/products.json` para categorías |
| **Wix / SPA** | Playwright headless → esperar `networkidle` → extraer DOM | Buscar `wix-warmup-data` JSON inline |
| **Squarespace** | Sufijo `?format=json` en cada URL pública | Sitemap.xml para descubrir URLs |
| **Webflow / static** | `fetch_webpage` directo + parsing HTML con regex/cheerio mental | Sitemap.xml para descubrir todas las páginas |
| **Custom server-rendered** | `fetch_webpage` directo | Inspeccionar `Network tab` manualmente para encontrar API JSON oculto |
| **SPA sin SSR** | Playwright obligatorio | Si tiene API GraphQL/REST, llamarla directo |

#### 0.4 — Documentar el diagnóstico

Crea **`scraping/00-diagnostico-stack.md`** con:

```markdown
# Diagnóstico técnico del sitio fuente

- URL: https://cliente.com/
- Fecha auditoría: YYYY-MM-DD
- **Plataforma detectada**: WordPress 6.5 + plugin "HP Magic Menu v13"
- **Theme**: Astra child theme
- **CDN**: WordPress uploads en `/wp-content/uploads/YYYY/MM/`
- **JS framework**: jQuery 3.7 (no SPA, server-rendered)
- **Anti-bot**: ninguno (solo UA filter básico)
- **Endpoints útiles encontrados**:
  - `/wp-json/wp/v2/media?per_page=100` → catálogo de imágenes
  - Sin endpoint de menú estructurado, hay que parsear HTML
- **Estrategia elegida**: `fetch_webpage` página por página + script PowerShell para descargar imágenes con URLs explícitas extraídas del DOM
- **Riesgos**: hosting compartido lento → timeouts ocasionales (mitigar con script idempotente)
```

Este documento justifica todo lo que viene después y permite que cualquier agente futuro entienda **por qué** se eligió un script PowerShell vs Playwright vs llamar API.

### Paso 1 — Mapeo de URLs y descubrimiento de contenido

Una vez confirmado el stack, lista todas las URLs relevantes:

```powershell
# Sitemap es la forma más confiable de descubrir páginas
(Invoke-WebRequest "https://cliente.com/sitemap.xml").Content |
  Select-String -Pattern "<loc>([^<]+)</loc>" -AllMatches |
  ForEach-Object { $_.Matches.Value -replace '<.?loc>','' }
```

Si no hay sitemap, navega manualmente: home → menú → contacto → reservas → about. Anota cada URL en una lista para procesar en el Paso 2.

### Paso 2 — Crear los `.md` de contenido (manualmente curados)

Estos archivos son **el output principal**: estructuras la información cruda en markdown navegable.

Plantillas mínimas:

**`01-informacion-general.md`** — bloque de datos del negocio:
```markdown
## Contacto
- Dirección: ...
- Teléfono / WhatsApp: ...
- Horario: ...
- Redes: IG, FB, TikTok, Google Maps URL
## Plataforma actual
- CMS detectado, theme, plugins relevantes
- Performance (Lighthouse score si lo corriste)
```

**`02-menu-completo.md`** — tabla por categoría:
```markdown
## Categoría: Desayunos
| Platillo | Descripción | Precio | Imagen |
|---|---|---|---|
| ... | ... | $XXX | logo-... |
```

**`03-analisis-ux-actual.md`** — bullets de problemas críticos para justificar el rebuild.

**`05-activos-digitales.md`** — el más importante para el script: tabla URL original ↔ nombre local semántico.

### Paso 3 — Generar `scripts/download-assets.ps1`

Script PowerShell **idempotente** (saltar si ya existe), con User-Agent realista y manejo de errores:

```powershell
param()

$base = "https://cliente.com/wp-content/uploads"
$root = Join-Path $PSScriptRoot "..\assets"
$root = (New-Item -ItemType Directory -Path $root -Force).FullName

# Crear subcarpetas
@("logos","hero","menu","gallery","icons","placeholders") | ForEach-Object {
    New-Item -ItemType Directory -Path (Join-Path $root $_) -Force | Out-Null
}

function Get-Asset {
    param([string]$Url, [string]$Folder, [string]$FileName)
    $dest = Join-Path $root (Join-Path $Folder $FileName)
    if (Test-Path $dest) { Write-Host "  [SKIP] $FileName"; return }
    try {
        $h = @{ "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        Invoke-WebRequest -Uri $Url -OutFile $dest -Headers $h -TimeoutSec 30 -ErrorAction Stop
        $sz = [math]::Round((Get-Item $dest).Length/1KB, 1)
        Write-Host "  [OK] $FileName ($sz KB)"
    } catch {
        Write-Host "  [ERR] $FileName - $($_.Exception.Message)"
    }
}

# Descargas explícitas con NOMBRE LOCAL SEMÁNTICO (no el hash original)
Write-Host "--- LOGOS ---"
Get-Asset "$base/2025/11/logo-photoroom.png" "logos" "logo-full.png"

Write-Host "--- MENU ---"
# Patrón: array de "slug=URL" para platillos masivos
$items = @(
  "tarro-mantequilla=$base/2025/12/WhatsApp-Image-XXX.jpeg",
  "elixir-gryffindor=$base/2025/12/WhatsApp-Image-YYY.jpeg"
)
foreach ($entry in $items) {
    $p = $entry.Split("=", 2)
    $ext = [System.IO.Path]::GetExtension($p[1])
    Get-Asset $p[1] "menu" "$($p[0])$ext"
}

# Resumen final
$tc = (Get-ChildItem $root -Recurse -File).Count
$ts = [math]::Round((Get-ChildItem $root -Recurse -File | Measure-Object Length -Sum).Sum/1MB, 2)
Write-Host ""
Write-Host "== COMPLETADO: $tc archivos, $ts MB =="
```

**Reglas críticas del script**:

1. **Nombres semánticos**, NO los hashes/UUIDs del CDN. `tarro-mantequilla.jpeg` no `WhatsApp-Image-2025-12-19-at-4.51.13-PM-4-768x1151.jpeg`.
2. **Idempotente**: `Test-Path` + `[SKIP]` permite re-ejecutar sin re-descargar.
3. **User-Agent header**: muchos servidores (WordPress hosts, CloudFront) bloquean `Invoke-WebRequest` con UA por defecto.
4. **Try/catch por archivo**: si una imagen falla (404, timeout) el resto continúa.
5. **Reporte final**: total de archivos + MB para validar contra lo esperado.

### Paso 4 — Ejecutar y validar

```powershell
cd c:\ruta\al\proyecto
powershell -ExecutionPolicy Bypass -File "scripts\download-assets.ps1"
```

Si una descarga falla con `Anulada la solicitud: La conexión ha terminado de forma inesperada`:
- Re-ejecuta el script (idempotente, solo intenta los faltantes)
- Si persiste, prueba con `curl.exe` directo o aumenta `-TimeoutSec 60`
- Verifica el path exacto en el browser primero (a veces el CDN cambió la fecha en la URL)

### Paso 5 — Copiar a `app/public/`

Las imágenes finales que servirá la PWA deben estar en `app/public/assets/`. NO sirvas directo de `assets/` raíz.

```powershell
Copy-Item -Path "assets\*" -Destination "app\public\assets\" -Recurse -Force
```

Opcional (recomendado para producción): optimizar con `sharp` o `squoosh` antes de copiar (convertir JPEGs grandes a WebP, generar variants 768/1024/1536).

---

## Errores y soluciones encontradas en producción

| Problema | Causa | Solución |
|---|---|---|
| `WebException: 403 Forbidden` | User-Agent bloqueado | Agregar header `Mozilla/5.0` |
| `Anulada la solicitud` random | TLS/keepalive flaky en WordPress shared hosting | Re-ejecutar script (idempotente) |
| Imagen descarga 0 KB | Hotlink protection o URL caducada | Verificar URL en browser, copiar la real |
| Encoding raro en .md (¶, Γ£ô) | Salida PowerShell a archivo sin `-Encoding UTF8` | `Out-File -Encoding UTF8` siempre |
| Rutas con espacios fallan | PowerShell sin quotes | `"$path"` con dobles comillas |
| Script no se ejecuta | ExecutionPolicy restringida | `powershell -ExecutionPolicy Bypass -File ...` |

---

## Checklist post-scraping (antes de empezar a codear la PWA)

- [ ] `assets/logos/logo-full.png` existe y abre correctamente
- [ ] `assets/menu/` tiene una imagen por cada platillo del `02-menu-completo.md`
- [ ] El total `== COMPLETADO: N archivos, X MB ==` coincide con lo esperado
- [ ] `scraping/05-activos-digitales.md` lista cada archivo local con su URL original (trazabilidad)
- [ ] `.gitignore` excluye `scraping/output/` (HTML crudo) pero permite los `.md` curados
- [ ] Tienes permiso del dueño del negocio para usar/republicar las imágenes

---

## Entregable final

Cuando termines, el agente debería poder:

1. **Construir el data layer** del nuevo sitio leyendo solo los `.md` (ej. `app/src/data/menu.ts` con 55 items se generó parseando `02-menu-completo.md`).
2. **Referenciar imágenes** con paths predecibles (`/assets/menu/{slug}.jpeg`).
3. **Justificar decisiones de diseño** citando el `03-analisis-ux-actual.md` (qué problemas estás resolviendo).
4. **Re-ejecutar** `download-assets.ps1` en cualquier máquina nueva del equipo y obtener el mismo resultado.
