# 06 — Análisis de brechas para la app Elyza + Vue

> **Marca rectora**: Mi Pueblo Cotati (identidad, info, menú con precios)
> **Banco visual**: Mi Pueblo Novato (fotografía de platillos)
> **Stack objetivo**: Backend Elyza (CMS/headless) · Frontend Vue 3 · PWA instalable
> **Fecha**: 2026-04-28

Este documento es el puente entre **lo ya scrapeado** (carpetas `mipueblocotati/` y `mipueblonovato/`) y **lo que aún hace falta** para entregar las 6 mejoras proyectadas: menú dinámico, reservaciones, reseñas, encuestas, cupones y email marketing.

---

## 1. Estado actual del scraping (resumen ejecutivo)

| Dominio de datos | Cotati | Novato | Suficiente para v1? |
|---|---|---|---|
| Stack técnico fuente | ✅ Wix | ✅ SpotHopper | Sí |
| Información NAP (nombre/dirección/teléfono) | ✅ | ✅ (×2 sucursales) | Sí |
| Horarios | ⚠️ inconsistencia footer/hero | ✅ | **NO** — confirmar con cliente |
| Sucursales del grupo (6 totales) | ✅ | ✅ | Sí |
| Menú estructurado | ✅ ~135 items **con precios** | ✅ ~165 items **sin precios** | **NO** — falta unificar |
| Fotografía de platillos | ❌ (sólo PDF) | ✅ 21 con caption · 13 untitled | Parcial |
| Identidad visual (color, tipografía) | ❌ | ❌ | **NO** — Paso 6 del skill pendiente |
| Logo vectorial | ❌ sólo PNG | ❌ sólo PNG | **NO** |
| Reseñas (Google/Yelp/TripAdvisor) | ❌ | ❌ | **NO** |
| Reservaciones (datos operativos) | ❌ | ❌ | **NO** |
| Promos/cupones documentados | ✅ Burrito Thursday, $5 newsletter | ✅ Taco Tuesday | Parcial |
| Páginas internas Wix (About/Catering/Experiences) | ❌ no fetched | n/a | **NO** |

---

## 2. Brechas por feature de la nueva app

### 2.1 Menú digital con imágenes y administración dinámica

**Lo que tenemos**
- 135 platillos con precios (Cotati, OCR del PDF) → [02-menu-completo.md](mipueblocotati/scraping/02-menu-completo.md)
- 165 platillos sin precios (Novato) → [02-menu-completo.md](mipueblonovato/scraping/02-menu-completo.md)
- 21 fotografías con caption + 13 untitled → [05-activos-digitales.md](mipueblonovato/scraping/05-activos-digitales.md)

**Lo que falta**
- [ ] **Cross-reference menú Cotati ↔ Novato** para detectar items exclusivos de cada uno y evitar duplicados.
- [ ] **JSON canónico** (esquema Elyza) por cada item con campos:
  - `id`, `slug`, `name_es`, `name_en`, `description_es`, `description_en`
  - `category_id`, `subcategory`, `price_usd`, `currency`
  - `photo_url`, `gallery[]`, `placeholder_used: bool`
  - `tags[]` (vegano, sin gluten, picante 1-3, popular, nuevo, kids)
  - `allergens[]` (mariscos, lácteo, gluten, huevo, fruto seco)
  - `modifiers[]` (choice of meat, side options, salsa level)
  - `availability` (lunch only, weekends, etc.)
- [ ] **Mapeo foto Novato → ítem del menú Cotati** (21 fotos con caption ⇒ ¿a qué item del PDF corresponden?). Ej.: `quesa-birria.jpg` → ¿`Quesa Birria` aparece en menú Cotati o sólo en Novato?
- [ ] **Clasificar las 13 fotos `untitled-XX.jpg`** (inspección visual o consulta al cliente).
- [ ] **Descripciones**: el menú PDF tiene descripciones cortas en algunas categorías; otras no. Se necesita redactar 1-2 líneas por platillo (~135 redacciones) para SEO/UX.
- [ ] **Modificadores estructurados**: el menú dice "Choice of meat: chicken, beef, pork, …" — esto debe ser un sistema de opciones reutilizable, no texto libre.
- [ ] **Multilenguaje ES/EN**: el menú original está 100% en inglés. Si se quiere bilingüe (target: hispanos en CA + anglos), traducir nombres y descripciones.
- [ ] **Sesión fotográfica nueva**: ~114 platillos sin foto. Mínimo viable: 1 foto por categoría (~17 fotos nuevas). Ideal: foto por platillo top-30.

**Bloqueante para CMS**: definir el esquema final con el cliente antes de cargar Elyza.

---

### 2.2 Sistema de reservaciones

**Lo que tenemos**
- Confirmación de que existe módulo Wix Reservations actual.
- 6 sucursales con dirección y teléfono (necesario para multi-locación).

**Lo que falta**
- [ ] **Aforo por sucursal** (capacidad de mesas / total de cubiertos).
- [ ] **Tipos de mesa** (2/4/6/8 personas) y disposición.
- [ ] **Slots de reserva** (¿cada 15 min? ¿30? ¿hora?). Tiempo promedio de comida.
- [ ] **Política de no-show** (depósito, tarjeta requerida, ventana de cancelación).
- [ ] **Días bloqueados** (festivos US: Thanksgiving, Christmas, etc.) y eventos privados.
- [ ] **Confirmación**: ¿SMS, email, ambos? Twilio/SendGrid creds requeridos.
- [ ] **Migración de histórico Wix** (si el cliente quiere conservar reservas pasadas y clientes recurrentes).
- [ ] **Listas de espera** (waitlist) — feature común en restaurantes californianos.

---

### 2.3 Reseñas y gestión de retroalimentación

**Lo que tenemos**
- Awards visibles (Best Burrito, Best Mexican, Best Steaks Sonoma, Restaurant Guru).

**Lo que falta**
- [ ] **Scrapear o conectar APIs de**:
  - Google Business Profile (rating + reseñas) — vía Google Places API
  - Yelp Fusion API (rating + reseñas)
  - TripAdvisor (sin API pública gratuita; scraping con permiso)
  - Facebook Page reviews
- [ ] **URLs exactas de los perfiles** de las 6 sucursales en cada plataforma.
- [ ] **Política de moderación**: ¿reseñas internas se aprueban antes de publicar? ¿se permiten anónimas?
- [ ] **Respuesta del negocio**: workflow para que el manager responda desde el CMS.
- [ ] **Integración bidireccional**: ¿reseñas internas se cross-postean a Google? (raro, normalmente no).
- [ ] **Schema.org `Review` + `AggregateRating`** para SEO local.

---

### 2.4 Encuesta de satisfacción post-visita

**Lo que tenemos**
- Nada. Feature 100% nueva.

**Lo que falta**
- [ ] **Trigger de envío**:
  - QR en mesa / recibo (anónimo, sin email)
  - Email post-reserva (24h después, requiere reservación)
  - SMS post-pickup (Clover webhook)
- [ ] **Diseño del cuestionario** (5–10 preguntas máximo): comida, servicio, ambiente, NPS, comentario libre.
- [ ] **Identificación opcional** del cliente (mesa, mesero, fecha, sucursal) para análisis interno.
- [ ] **Dashboard de resultados** en el admin (promedios, tendencias, alertas si baja calificación).
- [ ] **Acción ante calificaciones bajas** (1–2 estrellas): notificación inmediata al gerente.

---

### 2.5 Cupones, dinámicas y promociones

**Lo que tenemos**
- 🌯 **Burrito Thursday**: regular burrito $10 con bebida (Cotati).
- 🌮 **Taco Tuesday** (Novato).
- **$5 off al consumir $40** post-suscripción al newsletter (Cotati).

**Lo que falta**
- [ ] **Catálogo completo de promos recurrentes** (¿hay Lunch Special diario? ¿Happy Hour? ¿descuento estudiantes/militares?). El menú PDF menciona "Lunch Special" pero sin precio.
- [ ] **Mecánica técnica**:
  - Códigos únicos vs. códigos compartidos
  - Límite de canjes / fecha de expiración
  - Combinable con otras promos: sí/no
  - Aplicable a dine-in/pickup/delivery
- [ ] **Canjeo**: ¿se imprime QR? ¿código alfanumérico? ¿integración con POS Clover?
- [ ] **Promos por sucursal** (ej.: Taco Tuesday sólo en Novato).
- [ ] **Promos automáticas por trigger** (cumpleaños, primera reserva, retorno tras X días).

---

### 2.6 Email marketing y mensajes personalizados

**Lo que tenemos**
- Email genérico: `mipueblocotati1@gmail.com` (no transaccional).
- Mención del newsletter Wix con incentivo de $5 off.

**Lo que falta**
- [ ] **Lista actual del newsletter Wix**: exportar suscriptores existentes (CSV) y migrar respetando consentimiento.
- [ ] **Proveedor**: ¿Mailchimp, SendGrid, Resend, Brevo? Decisión + creds + dominio verificado (`mail.mipueblocotati.com` con SPF/DKIM/DMARC).
- [ ] **Compliance**:
  - CAN-SPAM (US): unsubscribe en cada email, dirección física, no engañar en subject.
  - California CCPA: derecho a borrado y exportación.
  - Doble opt-in recomendado.
- [ ] **Segmentos**: clientes frecuentes vs. nuevos, por sucursal, por preferencia (catering/familiar/eventos).
- [ ] **Plantillas iniciales**: bienvenida, cumpleaños, reactivación, promo semanal, encuesta.
- [ ] **Mensajes personalizados (1:1)**: ¿chat web? ¿WhatsApp Business API? ¿SMS bidireccional?

---

## 3. Brechas transversales (no feature-específicas)

### 3.1 Identidad visual / Design tokens — **CRÍTICO**

El **Paso 6** del skill (`06-sistema-diseno.md`) NO se ejecutó. Necesitamos:

- [ ] **Paleta de color** Cotati (extraer de CSS Wix con DevTools / cssstats):
  - Primario, secundario, acento
  - Fondos (light/dark), texto (primary/muted)
  - Estado (success, warning, error, info)
- [ ] **Tipografía** (font-family + pesos + escala):
  - Display / Heading / Body / Caption
  - Si es web font, identificar proveedor (Google Fonts, Wix custom)
- [ ] **Espaciado y radios**: escala 4/8/12/16/24/32/48/64 + radius 4/8/16/full
- [ ] **Sombras y elevaciones** (4 niveles)
- [ ] **Iconografía**: Lucide / Phosphor / Heroicons + iconos custom mexicanos (chile, taco, etc.)

> **Acción inmediata**: ejecutar Paso 6 del skill sobre el HTML guardado de Cotati.

### 3.2 Branding completo (assets de marca)

- [ ] **Logo SVG** (sólo tenemos PNG raster, escala mal en pantallas grandes).
- [ ] **Logo en blanco** sobre fondo oscuro.
- [ ] **Logo monocromo** (impresión, favicon).
- [ ] **Maskable icon 512×512** y 192×192 para PWA.
- [ ] **Splash screens** iOS (10+ resoluciones) y Android.
- [ ] **OG image** social share 1200×630 con branding nuevo (no la genérica de SpotHopper).
- [ ] **Patrón / textura** mexicana opcional para fondos secundarios.

### 3.3 SEO local + Schema.org

- [ ] **Coordenadas exactas (lat/long)** de las 6 sucursales (Google Maps Geocoding API).
- [ ] **Google Business Profile**: ID de cada sucursal, URLs canónicas, fotos verificadas.
- [ ] **Schema.org JSON-LD**:
  - `Restaurant` por sucursal
  - `Menu` + `MenuSection` + `MenuItem` con precios
  - `OpeningHoursSpecification`
  - `AggregateRating` (cuando haya datos)
  - `Event` para Burrito Thursday / Taco Tuesday recurrentes
- [ ] **Sitemap.xml + robots.txt** propios.
- [ ] **hreflang** si se publica bilingüe.
- [ ] **Open Graph + Twitter Cards** por página.

### 3.4 Páginas internas Cotati no scrapeadas

El sitemap Wix lista 9 URLs; sólo extrajimos home + contacto. Faltan:

- [ ] `/menu` (ya identificado como demo de plantilla — confirmar que no aporta)
- [ ] `/blog` (¿hay posts? ¿historias? ¿migrar?)
- [ ] `/lead-collection`
- [ ] `/reservations-online` (extraer reglas del módulo Wix)
- [ ] `/contáctanos` (ya parcial)
- [ ] `/experiences` y `/experience-details` (¿catering? ¿food truck? ¿eventos privados?)

> Recomendación: fetch en lote y archivar como `output/cotati-{slug}.html` antes de decidir migración.

### 3.5 Datos legales y operativos

- [ ] **Razón social, EIN/Tax ID** (footer legal de la app).
- [ ] **Política de privacidad** (requerida por CCPA/GDPR si captamos email).
- [ ] **Términos y condiciones** de reservas, cupones, gift cards.
- [ ] **Aviso de accesibilidad ADA** (California es estricta).
- [ ] **Licencia de venta de alcohol** (la galería Novato muestra `served-drinks.jpg` y `camarones-con-steak.jpg` — confirmar que la app puede mostrarlas).
- [ ] **Catering**: precios, mínimos, distancia de servicio, lead time.
- [ ] **Food Truck**: zonas atendidas, costo por evento, requisitos.
- [ ] **Eventos privados / fiestas**: capacidad, paquetes, depósito.

### 3.6 Integraciones técnicas pendientes de decisión

| Sistema actual | Decisión nueva app |
|---|---|
| **Online ordering** Clover SPA | ¿Mantener Clover (iframe/API)? ¿Migrar a Toast? ¿Construir propio? |
| **Reservas** Wix Reservations | Reemplazar con módulo propio en Elyza. |
| **Delivery** DoorDash | Mantener link externo (no construir delivery). |
| **POS** Clover | API para sync de inventory/precios → Elyza. |
| **Newsletter** Wix Email Marketing | Migrar a Mailchimp/Resend/SendGrid. |
| **Pagos online** (cupones, depósitos reserva) | Stripe (recomendado US) vs. Square. |
| **Analítica** Wix Analytics | GA4 + Plausible (privacy-friendly). |

### 3.7 PWA-specific

- [ ] **manifest.webmanifest** propio (no reutilizar el de SpotHopper).
- [ ] **Service Worker** strategy (Workbox): cache-first para menú e imágenes, network-first para reservas/menú live.
- [ ] **Offline page** con info de contacto y horarios.
- [ ] **Install prompt** UX (banner, dismiss persistente).
- [ ] **Push notifications** (¿avisos de promo? requiere VAPID keys + permiso).

### 3.8 Optimización de assets descargados

- [ ] **Hero Cotati** (3 imágenes >5 MB): convertir a WebP/AVIF, generar `srcset` 480/768/1280/1920.
- [ ] **Galería Novato**: convertir 34 JPG a WebP responsive (objetivo: <80 KB cada uno).
- [ ] **PDF menú** (3.5 MB con marca de agua "QPS PROOF"): pedir al cliente versión limpia O usar el menú estructurado JSON y descontinuar el PDF.

---

## 4. Plan recomendado de cierre (orden sugerido)

### Sprint A — Cerrar scraping/recolección (1 ciclo)

1. ✅ ~~Stack, info, menú, UX, assets~~ (hecho)
2. [ ] **Ejecutar Paso 6** del skill: extraer design tokens del HTML Wix Cotati.
3. [ ] **Fetch páginas Wix faltantes** (`/experiences`, `/blog`, `/reservations-online`).
4. [ ] **Conectar Google Places API** para reseñas y rating de las 6 sucursales (1 request/sucursal, gratis).
5. [ ] **Mapeo foto Novato → ítem Cotati**: tabla en `06-mapping-fotos.md` (manual, 21 entradas).
6. [ ] **Clasificar `untitled-01..13.jpg`** (consulta al cliente o vista visual).
7. [ ] **Pedir al cliente**:
   - Logo SVG y variantes (blanco/monocromo)
   - Versión limpia del PDF (sin "QPS PROOF") o el archivo Illustrator/InDesign original
   - Confirmación de horarios reales
   - Datos legales (razón social, EIN, dirección fiscal)
   - Capacidad/aforo y reglas de reserva por sucursal
   - Lista de promos vigentes y mecánicas
   - Acceso a Wix Newsletter / lista de suscriptores actual

### Sprint B — Modelado de datos (1 ciclo)

1. [ ] Diseñar **esquema Elyza** (collections): `restaurants`, `categories`, `menu_items`, `modifiers`, `promotions`, `reservations`, `reviews`, `surveys`, `subscribers`, `coupons`.
2. [ ] **Cargar menú normalizado** (JSON → Elyza vía script).
3. [ ] **Subir assets optimizados** a Elyza Media Library (WebP responsive).
4. [ ] **Definir roles**: super-admin, gerente sucursal, mesero (para encuestas).

### Sprint C — Frontend Vue 3 (varios ciclos)

1. [ ] Setup Vite + Vue 3 + Pinia + Vue Router + Tailwind/UnoCSS con tokens.
2. [ ] PWA con Workbox.
3. [ ] Páginas: Home, Menú, Sucursales, Reservar, Reseñas, Catering, Food Truck, Contacto, Cupones.
4. [ ] i18n (vue-i18n) ES/EN.
5. [ ] Encuesta post-visita (ruta `/encuesta?token=...`).
6. [ ] Suscripción al newsletter (formulario + integración).

### Sprint D — Marketing + admin (1-2 ciclos)

1. [ ] Conectar Mailchimp/Resend, importar lista, crear plantillas.
2. [ ] Dashboard de reseñas y encuestas en Elyza.
3. [ ] Sistema de cupones canjeables (códigos + tracking).
4. [ ] Integración Stripe para depósitos de reserva (opcional v1.5).

---

## 5. Lo que NO requiere scrapeo adicional (ya cubierto)

- Estructura general del menú y categorías ✅
- Precios base (Cotati) ✅
- Identidad de las 6 sucursales del grupo ✅
- Banco fotográfico inicial (34 fotos Novato) ✅
- Awards y diferenciadores de marca ✅
- Stack técnico actual (saber de qué migramos) ✅
- Promociones recurrentes principales (Burrito Thursday, Taco Tuesday) ✅

---

## 6. Resumen visual de prioridades

```
🔴 BLOQUEANTE (sin esto no se puede empezar):
  · Design tokens de Cotati (Paso 6 skill)
  · Logo SVG + variantes
  · Confirmación de horarios reales
  · Esquema de menú JSON canónico aprobado por cliente
  · Decisión sobre online ordering (Clover sí/no)

🟡 IMPORTANTE (sin esto v1 sale incompleta):
  · Mapeo foto Novato → ítem Cotati
  · Reseñas vía Google Places API
  · Datos operativos de reservas (aforo, slots, política)
  · Proveedor de email marketing elegido + dominio verificado
  · Páginas Wix faltantes scrapeadas

🟢 DESEABLE (puede ir en v1.1):
  · Sesión fotográfica de los ~114 platillos sin foto
  · Push notifications
  · Pagos Stripe (depósitos de reserva)
  · Schema.org Event para promos recurrentes
  · Migración de blog Wix
```
