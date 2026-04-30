# 05 — Inventario de Activos Digitales (Mi Pueblo Cotati)

Mapa trazable URL original (Wix CDN) ↔ archivo local descargado por `scripts/download-assets.ps1`.

> **Base CDN:** `https://static.wixstatic.com/media/`
> **Carpeta destino:** `assets/`
> **Total descargado:** 22 archivos · 33.67 MB

---

## Logos

| Archivo local | Origen (Wix media key) | Notas |
|---|---|---|
| `assets/logos/logo-mi-pueblo.png` | `302d76_9e488716ce1947aca988479479171c72~mv2.png` | Logo principal "Mi Pueblo" (encabezado/footer). Nombre Wix: `logo (1)_edited.png`. |
| `assets/logos/logo-secondary.png` | `302d76_7330664f382f4ffda7beea7e692eae60~mv2.png` | Variante secundaria del logo. |

## Hero / Imágenes principales

| Archivo local | Origen | Uso |
|---|---|---|
| `assets/hero/hero-restaurante-interior.jpg` | `302d76_afe4c7b0bc9a4b0dbbdc9caae96b56ea~mv2.jpg` | Hero del home (interior del restaurante). 12.6 MB — requerirá **compresión a < 300 KB en WebP/AVIF** para PWA. |
| `assets/hero/hero-avocado-bowl.jpg` | `11062b_975703e074c740e8b0d99568f870d239~mv2_d_4256_2832_s_4_2.jpg` | Bowl con aguacate (sección destacada). 5.6 MB — comprimir. |
| `assets/hero/hero-fajitas.jpg` | `302d76_a090c3dccca7477698ad3118c9782ba1~mv2.jpg` | Fajitas (sección "Specials"). 9.3 MB — comprimir. |
| `assets/hero/hero-platillo-1.jpeg` | `302d76_b3ad7976c8be4079b20022d723e4e45a~mv2.jpeg` | Galería platillos. |
| `assets/hero/hero-platillo-2.jpeg` | `302d76_e6863ad2771f4a7abd25c3a1975a1439~mv2.jpeg` | Galería platillos. |
| `assets/hero/hero-platillo-3.jpeg` | `302d76_adc6133fd6114ad08aa9e46cbf654e1d~mv2.jpeg` | Galería platillos. |

## Awards / Reconocimientos

| Archivo local | Origen | Reconocimiento |
|---|---|---|
| `assets/gallery/award-best-burrito-restaurant.png` | `302d76_2ff1917d2ac34a609698ff7b8caec4df~mv2.png` | "Best Burrito Restaurant in Sonoma County". |
| `assets/gallery/award-best-mexican-sonoma.png` | `302d76_a07b2c57b50f4393a6e11a52e8c3a984~mv2.png` | "Best Mexican Restaurant in Sonoma County". |
| `assets/gallery/award-best-steaks-sonoma.png` | `302d76_46250abffb4b4ab587c6896ee174ebab~mv2.png` | "Best Steaks in Sonoma County". |
| `assets/gallery/award-restaurant-guru-certificate.png` | `302d76_b22e695c930a4c8ebec76431940cbffb~mv2.png` | Certificado Restaurant Guru. |
| `assets/gallery/award-mi-pueblo-badge.png` | `302d76_af86e9ec5ef84a48bdb71bed67ce47bd~mv2.png` | Badge institucional Mi Pueblo. |

## Iconos / Badges de servicios

| Archivo local | Origen | Función |
|---|---|---|
| `assets/icons/icon-mexican-restaurant.png` | `302d76_a46f99a9bb274695840d1d148e62ab0b~mv2.png` | Icono "Mexican Restaurant". |
| `assets/icons/icon-mexican-restaurant-2.png` | `302d76_103de8a80872441a8d4689d4b4d6cb16~mv2.png` | Variante. |
| `assets/icons/icon-doordash.png` | `302d76_828a1004eb0d482286c69b4dc64d23a0~mv2.png` | Icono delivery DoorDash. |
| `assets/icons/icon-foodtruck.png` | `302d76_c862e196681f4cb9a160e4a00b399bc3~mv2.png` | Icono Food Truck (`camion-de-comida.png`). |
| `assets/icons/icon-misc.png` | `302d76_ec41adf81adc47fbb24d7d3763c17142~mv2.png` | Sin etiqueta clara — revisar antes de usar. |
| `assets/icons/icon-generic-1.png` | `01c3aff52f2a4dffa526d7a9843d46ea.png` | Icono genérico Wix (probable plantilla). |
| `assets/icons/icon-generic-2.png` | `0fdef751204647a3bbd7eaa2827ed4f9.png` | Icono genérico Wix. |
| `assets/icons/icon-generic-3.png` | `23fd2a2be53141ed810f4d3dcdcd01fa.png` | Icono genérico Wix. |

## Menú oficial (PDF)

| Archivo local | Origen | Notas |
|---|---|---|
| `assets/menu/menu-oficial.pdf` | `https://drive.google.com/uc?export=download&id=1yySEviBLR8ZMpMLQcHVfbEkh6bmQGSJv` | Menú PDF rasterizado con marca de agua "QPS PROOF". 5 páginas, 3.5 MB. **Fuente de verdad para precios** — extracción OCR en `scraping/output/menu-ocr.txt` y consolidación legible en `02-menu-completo.md`. |

## Renders intermedios (no copiar a `public/`)

Generados por `ocr.py` para extracción de texto, viven en `scraping/output/`:

- `menu-original.pdf` (copia de trabajo)
- `menu-page-1.png` … `menu-page-5.png` (150 dpi)
- `menu-ocr.txt` (texto extraído con easyocr)

---

## Pendientes / Calidad

1. **Optimización requerida** antes de producción: 3 imágenes hero superan 5 MB. Convertir a WebP/AVIF, generar `srcset` responsive (480/768/1280/1920).
2. **Sustituir** `icon-misc.png` y `icon-generic-*` si no aportan valor (probables restos de plantilla Wix).
3. **Re-fotografiar menú**: el PDF actual tiene marca de agua "QPS PROOF" (proof de imprenta). Solicitar al cliente versión limpia o producir digital nativo.
4. **Faltantes**: no se encontraron fotos individuales por categoría de menú (la página Wix usa un PDF, no galería). Para PWA sería ideal capturar al menos 1 foto por categoría (15+ fotos nuevas).
