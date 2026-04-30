# Mi Pueblo Cotati — Scraping & Activos

Resultado del workflow de scraping definido por `skill.md` aplicado a <https://www.mipueblocotati.com/>.

## Stack detectado

**Wix.com Website Builder** (`Server: Pepyaka`, `meta generator=Wix.com`, CDN `static.wixstatic.com`).
Menú real servido como **PDF rasterizado** (`QPS PROOF`) en Google Drive.
Online ordering en SPA externa de Clover (out-of-scope).

## Documentos

| Archivo | Contenido |
|---|---|
| [00-diagnostico-stack.md](00-diagnostico-stack.md) | Análisis del stack Wix, sitemap y restricciones técnicas. |
| [01-informacion-general.md](01-informacion-general.md) | Dirección, teléfono, horarios, sucursales hermanas, redes sociales. |
| [02-menu-completo.md](02-menu-completo.md) | **~135 platillos con precios** en 13 categorías (extraído del PDF vía easyocr). |
| [03-analisis-ux-actual.md](03-analisis-ux-actual.md) | 10 problemas críticos de UX/SEO/performance. |
| [05-activos-digitales.md](05-activos-digitales.md) | Inventario URL ↔ archivo local de los 22 assets descargados. |

## Estructura de carpetas

```
mipueblocotati/
├── scraping/
│   ├── 00-diagnostico-stack.md
│   ├── 01-informacion-general.md
│   ├── 02-menu-completo.md
│   ├── 03-analisis-ux-actual.md
│   ├── 05-activos-digitales.md
│   ├── README.md  ← este archivo
│   └── output/
│       ├── home.html
│       ├── menu-original.pdf
│       ├── menu-page-{1..5}.png   (150 dpi renders)
│       ├── menu-ocr.txt           (texto extraído easyocr)
│       ├── ocr.py                 (script de extracción)
│       └── wix-image-urls.txt     (41 URLs únicas)
├── scripts/
│   └── download-assets.ps1        (descarga idempotente)
└── assets/                        (22 archivos · 33.67 MB)
    ├── logos/        (2)
    ├── hero/         (6)
    ├── icons/        (8)
    ├── gallery/      (5 awards)
    ├── menu/         (1 PDF)
    └── placeholders/ (vacío)
```

## Reproducir

```powershell
cd mipueblocotati
powershell -ExecutionPolicy Bypass -File scripts\download-assets.ps1
```

Salida esperada:
```
== COMPLETADO: 22 archivos, 33.67 MB ==
```

## Observaciones críticas

- **Menú-as-PDF**: el menú no existe como datos estructurados; sólo como PDF con marca de agua. Cualquier rebrand requiere transcripción manual (ya hecha en `02-menu-completo.md`) y luego un sistema de menú nativo (JSON/CMS).
- **Hero pesado**: 3 imágenes superan 5 MB cada una. Bloqueante para Lighthouse mobile — comprimir antes de migrar.
- **Inconsistencia de horarios**: footer (cierre 8pm) vs. hero (cierre 9pm). Confirmar con cliente; recomendación documentada en `01-informacion-general.md`.
- **Online ordering Clover SPA**: no scrapeable. Requiere integración por API o iframe controlado.
