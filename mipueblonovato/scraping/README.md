# Mi Pueblo Novato — Scraping & Activos

Resultado del workflow de scraping definido por `skill.md` aplicado a <https://eatmipueblonovato.com/>.

## Stack detectado

**SpotHopper SaaS** (`<!-- wcache -->`, `static.spotapps.co`, `tmt.spotapps.co`).
`spot_id 544706` = Novato · `spot_id 601128` = Petaluma.
HTML server-rendered con menú completo **sin precios**. Online ordering en SPA externa de Clover (out-of-scope).

## Documentos

| Archivo | Contenido |
|---|---|
| [00-diagnostico-stack.md](00-diagnostico-stack.md) | Análisis del stack SpotHopper, sitemap, limitaciones. |
| [01-informacion-general.md](01-informacion-general.md) | Sucursales Novato + Petaluma, horarios, contacto, promos. |
| [02-menu-completo.md](02-menu-completo.md) | **~165 platillos sin precios** en 17 categorías. |
| [03-analisis-ux-actual.md](03-analisis-ux-actual.md) | 10 issues UX (sin precios, placeholders, accesibilidad…). |
| [05-activos-digitales.md](05-activos-digitales.md) | Inventario URL ↔ archivo local de los 47 assets descargados. |

## Estructura de carpetas

```
mipueblonovato/
├── scraping/
│   ├── 00-diagnostico-stack.md
│   ├── 01-informacion-general.md
│   ├── 02-menu-completo.md
│   ├── 03-analisis-ux-actual.md
│   ├── 05-activos-digitales.md
│   ├── README.md  ← este archivo
│   └── output/
│       ├── home.html
│       ├── food-menu.html
│       ├── locations.html
│       └── spotapps-image-urls.txt
├── scripts/
│   └── download-assets.ps1        (descarga idempotente)
└── assets/                        (47 archivos · 7.08 MB)
    ├── logos/         (2)
    ├── hero/          (5)
    ├── icons/         (5 favicons)
    ├── gallery/       (34: 21 con caption + 13 untitled)
    └── placeholders/  (1)
```

## Reproducir

```powershell
cd mipueblonovato
powershell -ExecutionPolicy Bypass -File scripts\download-assets.ps1
```

Salida esperada:
```
== COMPLETADO: 47 archivos, 7.08 MB ==
```

## Observaciones críticas

- **Menú sin precios**: SpotHopper no expone precios estructurados. Para una PWA real debe cruzarse con el PDF oficial de Cotati (`mipueblocotati/assets/menu/menu-oficial.pdf`) — ambas locaciones pertenecen a la misma cadena.
- **Galería parcial**: sólo ~21 platillos con foto real; el resto usa el placeholder genérico de SpotHopper. Sesión fotográfica recomendada.
- **13 fotos untitled**: descargadas como `untitled-01..13.jpg`; requieren clasificación visual o consulta al cliente.
- **Confusión Novato/Petaluma**: la web del dominio Novato muestra ambas sucursales sin separación clara. La PWA debe diferenciarlas visiblemente.
- **Online ordering Clover SPA**: no scrapeable. Requiere integración por API o iframe.
