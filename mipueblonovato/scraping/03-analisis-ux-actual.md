# Mi Pueblo Novato — Análisis UX del sitio actual

> Auditoría del sitio SpotHopper `https://eatmipueblonovato.com/` (abril 2026).

## Problemas críticos

### 1. Menú sin precios visibles
- `/food-menu` lista ~165 platillos por categoría pero **sin precio**.
- Los precios solo viven en Clover (modal SPA al hacer click "ORDER").
- Para un cliente que quiere "ver cuánto cuesta" antes de pedir, esto rompe el flujo.

### 2. Imágenes placeholder en sección clave
- "ONLINE ORDERING" usa `static.spotapps.co/web/placeholder.png` para los thumbnails de los platillos del carrusel.
- Esto da la impresión de que el sitio está incompleto / sin mantenimiento.

### 3. Carrusel inaccesible
- "On previous/next button activation, the carousel moves for 1 menu item" — control verbose pero el carrusel no anuncia ítem actual de forma clara.
- "Start stop menu items carousel" como única affordance — confuso para screen readers.

### 4. Confusión Novato vs Petaluma
- El dominio es `eatmipueblonovato.com` pero el sitio cubre Petaluma también.
- Hay una `/petaluma` aparte y dos sets de botones (Novato vs Petaluma) en cada CTA.
- Riesgo: cliente de Petaluma busca "mi pueblo petaluma", encuentra el dominio Novato, se confunde y abandona.

### 5. SEO genérico de plantilla SpotHopper
- Meta description copia/pega ("celebration of culture, family, community...") sin keywords locales fuertes.
- Sin schema.org `Restaurant`/`Menu`/`MenuItem` en el HTML.
- Sin páginas individuales por platillo.

### 6. Performance moderada
- HTML inicial ~200 KB, no extremo.
- Pero Clover modal carga reCAPTCHA + bundle React grande al primer click → first interaction lento.
- Imágenes de SpotHopper se sirven sin AVIF/WebP modernos.

### 7. Branding "powered by SpotHopper"
- Footer dice "Website design, Social Media marketing, and Email marketing provided by SpotHopper" → percepción de plantilla, no de marca propia.
- Logo y paleta vienen de la plantilla genérica.

### 8. Newsletter sin claim
- Form al pie con "Sign up for our newsletter & get exclusive offers and invites!" pero sin lead magnet específico.
- Ya existe un voucher de cumpleaños — debería ser el gancho principal.

### 9. Catering / Party flow fragmentado
- Novato: form interno (`/catering`, `/party`).
- Petaluma: form externo en `tmt.spotapps.co/catering/?spot_id=601128` (subdominio diferente, UX distinta).
- Friction extra para el cliente de Petaluma.

### 10. Mobile experience
- Maps embebidos (Leaflet/OSM) cargan tiles externos → bloqueo visual mientras carga.
- Botones "ORDER" abren Clover en mismo tab → si el usuario regresa pierde estado.

---

## Datos positivos a preservar en el rebuild

- **Story**: "Tradition served with passion" — buena narrativa, mantenerla.
- **Catering**: hay una propuesta clara y formularios. Conservar el flujo, rediseñar UI.
- **Specials del día por día de la semana**: gran feature, hacerlo más visual.
- **Voucher de cumpleaños**: convertirlo en lead magnet del newsletter.

---

## Oportunidades para el rebuild

| Área | Estado actual | Propuesta |
|---|---|---|
| Menú | 165 ítems sin precio | Importar precios de Clover, agregar foto por categoría, filtros (vegan/seafood/breakfast) |
| Multi-sucursal | Dominio por restaurante | Un dominio único `mipueblo.com` con selector de sucursal (ahorra SEO compartido) |
| SEO | Schema básico | LocalBusiness/Restaurant + Menu schema + páginas por platillo destacado |
| Performance | SpotHopper template | Next.js + ISR; Lighthouse 90+ mobile |
| Online ordering | Clover modal SPA | Mantener Clover como backend, embebed en página propia con header consistente |
| Reviews | Lista estática de Google | Pull live de Google Places API |
| Newsletter | Form genérico | Voucher de cumpleaños como gancho principal + segmentación por sucursal |
| Mobile | Sitio responsive | PWA instalable, "Order again" con persistencia |
| Branding | Plantilla SpotHopper | Sistema de diseño propio con identidad mexicana auténtica |
