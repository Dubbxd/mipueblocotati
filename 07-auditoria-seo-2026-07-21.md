# Auditoría inicial de SEO — Mi Pueblo Cotati

**Fecha:** 2026-07-21

**Alcance:** repositorio local + comprobación pública del dominio en producción.

**Objetivo:** mejorar el posicionamiento local utilizando solamente información comprobable del restaurante.

## Resumen ejecutivo

El proyecto ya tiene una aplicación funcional y contenido suficiente para construir una estrategia SEO local sólida: Vue 3/Vite, API y CMS propios, menú estructurado, páginas de ubicación, blog, reservas, promociones, reseñas y 154 activos visuales. Sin embargo, la versión publicada funciona como una SPA sin renderizado previo. El HTML que recibe inicialmente un buscador contiene `0` encabezados H1, `0` bloques JSON-LD y un `<div id="app"></div>` vacío.

El problema más urgente es la identidad canónica. La web pública responde en `https://www.mipueblocotati.com/`, pero sus canonical, Open Graph, robots y sitemap apuntan a `https://mipueblocotati.easypage.mx/`. Esto puede hacer que Google atribuya las señales y páginas al subdominio equivocado.

También existen afirmaciones no suficientemente sustentadas, datos contradictorios y contenido sembrado como demostración. Antes de añadir schema de reseñas, premios, eventos o promociones, se debe establecer una fuente de verdad aprobada por el restaurante.

## Estado del proyecto

| Área | Estado | Observación |
|---|---|---|
| Repositorio | Limpio | Rama `main`, sincronizada visualmente con `origin/main`, sin cambios locales al comenzar la auditoría. |
| Frontend | Implementado | Vue 3, Vue Router, Pinia, i18n ES/EN, Tailwind y PWA. |
| Backend/CMS | Implementado | Bun/Elysia, PostgreSQL/Drizzle, administración de menú, ubicaciones, blog, reseñas, promociones y reservas. |
| Contenido de menú | Disponible | Archivo estático con 13 categorías y 149 platillos; producción consume el menú desde la API/CMS. |
| Imágenes | Amplio inventario | 154 archivos bajo `app/public/assets`; parte proviene de Cotati y parte de Novato. La procedencia/licencia y correspondencia por platillo deben documentarse. |
| Compilación local | No verificada | `pnpm build:web` no pudo ejecutarse porque `node_modules` no está instalado; no se encontró un error de código, sino dependencias locales ausentes. |
| Producción | Activa | `https://www.mipueblocotati.com/` responde HTTP 200 y parece corresponder a este frontend. |

## Hallazgos prioritarios

### P0 — Dominio canónico incorrecto

- La producción vive en `www.mipueblocotati.com`.
- `app/index.html`, `app/src/lib/seo.ts`, `app/src/router/index.ts`, `robots.txt` y `sitemap.xml` apuntan a `mipueblocotati.easypage.mx`.
- El `robots.txt` publicado en el dominio oficial declara el sitemap del subdominio EasyPage.
- El sitemap publicado contiene exclusivamente URLs del subdominio EasyPage.

**Impacto:** duplicidad de dominio, consolidación incorrecta de autoridad, indexación del host secundario y señales sociales inconsistentes.

**Acción:** definir `https://www.mipueblocotati.com` como origen único, actualizar todas las URLs absolutas y aplicar redirección 301 desde cualquier host alternativo.

### P0 — HTML inicial vacío para SEO

La aplicación actual es una SPA servida por Nginx. Los títulos y metadatos por ruta se cambian en el navegador mediante `router.afterEach()`. El contenido principal, los H1, el menú y los datos del restaurante no están presentes en el HTML inicial.

**Impacto:** Google puede renderizar JavaScript, pero la indexación es más lenta y frágil. Otros crawlers, redes sociales y algunos directorios no ejecutan la aplicación. Las páginas dinámicas de platillos, ubicaciones y blog quedan especialmente expuestas.

**Acción recomendada:** incorporar SSR o prerender/SSG para las rutas públicas. El HTML servido debe incluir el título, descripción, canonical, H1, contenido principal y JSON-LD específicos de cada URL.

### P0 — No existe structured data

No se encontró ningún bloque `application/ld+json` ni referencia a `schema.org` en el frontend.

**Acción:** implementar inicialmente:

1. `Restaurant` o `FoodEstablishment` para Cotati, con NAP, geocoordenadas, horarios, teléfono, menú y perfiles oficiales.
2. `Menu`, `MenuSection`, `MenuItem` y `Offer` con precio y moneda en las páginas indexables.
3. `BreadcrumbList` en menú, platillos, blog y ubicaciones.
4. `Article` para posts reales del blog.

No publicar todavía `AggregateRating`, `Review`, `Event` ni premios hasta validar su procedencia y vigencia.

### P0 — Imágenes sociales rotas

- `/og-image.jpg` se referencia en HTML y SEO dinámico, pero no existe y devuelve HTTP 404 en producción.
- `/assets/hero/hero-menu.jpg`, usada como imagen social del menú, tampoco existe en el repositorio.
- Las rutas relativas de imágenes OG deberían resolverse a URLs absolutas.

**Acción:** producir una imagen real 1200×630 del restaurante o de un platillo propio, agregarla al proyecto y usar su URL absoluta.

### P1 — Sitemap incompleto y con URLs de baja utilidad

El sitemap incluye páginas generales y legales, pero no incluye:

- las páginas dinámicas de platillos;
- la página de cada ubicación;
- posts publicados del blog;
- páginas de categorías del menú, que actualmente tampoco existen como URLs independientes.

En cambio, incluye `/encuesta`, una ruta transaccional que normalmente no aporta valor de búsqueda.

**Acción:** generar el sitemap desde el CMS durante build o desde el servidor, incluyendo solamente URLs públicas, canónicas e indexables. Marcar admin, login, encuesta, formularios de éxito y rutas sin contenido como `noindex`.

### P1 — Implementación bilingüe sin URLs indexables separadas

El idioma cambia del lado del cliente, pero español e inglés comparten la misma URL. El sitemap declara `hreflang="es"` y `hreflang="en"` hacia exactamente la misma página.

**Impacto:** Google no dispone de versiones diferenciadas para consultas en inglés y español.

**Acción:** elegir entre `/es/...` y `/en/...`, o mantener un único idioma indexable y retirar `hreflang` hasta implementar URLs independientes. Añadir también `x-default` cuando corresponda.

### P1 — Rutas dinámicas sin metadatos propios

`/menu/:slug`, `/sucursales/:slug` y `/blog/:slug` no definen metadatos específicos en el router ni actualizan SEO después de cargar sus datos. Por tanto, heredan títulos genéricos y canonical insuficientes.

Además, `MenuItemPage.vue` muestra siempre el nombre y la descripción en inglés, independientemente del idioma activo.

### P1 — Fuentes de datos duplicadas

Hay tres capas distintas:

- datos estáticos completos (`app/src/data/menu.ts` y `restaurants.ts`);
- seed demostrativo de base de datos (6 platillos y 1 ubicación);
- contenido real que producción obtiene mediante API.

El frontend no usa como respaldo el menú estático cuando falla la API. Esto dificulta saber qué contenido se publica y puede dejar páginas vacías si el backend falla.

**Acción:** declarar al CMS como fuente canónica, crear exportaciones/versionado de contenido y eliminar o etiquetar claramente fixtures/demo.

## Datos reales: estado de verificación

### Comprobados en más de una fuente pública reciente

| Dato | Valor | Evidencia pública |
|---|---|---|
| Nombre | Mi Pueblo / Mi Pueblo Cotati | Sitio oficial y directorios públicos. |
| Dirección | 7384 Commerce Blvd, Cotati, CA 94931 | Sitio oficial, `mipuebloca.com` y Restaurantji. |
| Teléfono | (707) 792-4380 | Sitio oficial, `mipuebloca.com` y Restaurantji. |
| Horario habitual | L–V 11:00–21:00; S–D 10:00–21:00 | Coincide entre la web publicada, `mipuebloca.com` y Restaurantji actualizado en junio de 2026. Debe confirmarse con el gerente para festivos. |
| Tipo de cocina | Mexicana; aparecen también mariscos y opciones vegetarianas | Menú propio y directorios públicos. |

### Publicados por el negocio, pero requieren respaldo interno

| Afirmación | Situación |
|---|---|
| “Desde 1997” | Repetida en la web y marca; solicitar historia breve, nombres/familia autorizados y una fotografía histórica para convertirla en contenido E-E-A-T. |
| Seis sucursales | El archivo estático enumera seis, pero el CMS inicial solo siembra Cotati y producción muestra señales contradictorias (“6 sucursales” y “1 sucursales”). Confirmar relación comercial y cuáles pueden representarse desde este dominio. |
| Más de 170 platillos | El archivo estático contiene 149 y producción muestra también “147+” y “más de 130”. Sustituir por un número calculado desde ítems activos o evitar la cifra. |
| Rating 4.4 / 969 reseñas | Visible en producción y replicado por agregadores, pero está codificado como fallback. Conectar una fuente autorizada o mostrar “consulta Google” sin schema de rating. |
| Jueves de burrito por $10 | Hay variantes contradictorias: “Super Burrito”, “cualquier burrito”, “regular burrito” y condiciones diferentes sobre la bebida. Confirmar producto, horario, bebida, sucursal y vigencia. |
| Taco Tuesday | El gap analysis lo asocia a Novato, mientras el seed lo publica para el sitio de Cotati. No usar en Cotati sin confirmación. |
| Premios “Best…” | Existen badges gráficos, pero faltan URL de la entidad otorgante, categoría exacta, año y permiso/alcance de uso. |
| Catering 20–500, 500+ eventos/año | Afirmaciones visibles en producción sin fuente interna documentada. Confirmar o retirar. |
| Salón con capacidad 120, mariachi | Confirmar capacidad autorizada, disponibilidad, costos y condiciones. |
| “Familia Beatriz” | Aparece en producción, pero no está documentado en el material fuente. Solicitar redacción aprobada por propietarios. |

### Datos inconsistentes o no aptos para publicar todavía

- La página legal usa `info@mipueblocotati.com` y `(707) 992-7684`, distintos del Gmail y `(707) 792-4380` usados en todo el sitio.
- La antigua página de reservas todavía muestra cierre a las 8:00 PM, mientras el sitio actual y fuentes recientes indican 9:00 PM.
- Las tres reseñas iniciales de `server/src/db/seed.ts` tienen nombres y textos promocionales sin URL, fecha, ID externo o captura de procedencia. Deben tratarse como fixtures, no como reseñas reales.
- `server/scripts/seed-real-reviews.ts` contiene reseñas plausiblemente reales, pero tampoco conserva URL, ID de Google, fecha, idioma original ni evidencia de importación. Antes de publicarlas se debe guardar la procedencia.
- La política de reservas, tiempos de respuesta, depósitos y otras condiciones legales parecen valores editoriales no vinculados a una política operativa confirmada.

## Fortalezas aprovechables

- Menú bilingüe estructurado con nombres, descripciones, precios, categorías, tags y slugs.
- Páginas individuales previstas para platillos y ubicaciones.
- Dirección, teléfono y CTAs móviles ya forman parte de la interfaz.
- Banco visual amplio con formatos WebP y fotografías de ambiente/comida.
- Blog y CMS ya modelados, útiles para contenido local verdadero.
- Buen punto de partida para PWA, cache de imágenes y experiencia móvil.
- Robots y sitemap ya existen, aunque deben corregirse.

## Plan recomendado

### Fase 1 — Corrección técnica inmediata

1. Cambiar el origen SEO a `https://www.mipueblocotati.com` y redirigir hosts alternativos.
2. Corregir robots, sitemap, canonical y OG/Twitter.
3. Crear la imagen OG real faltante.
4. Incorporar prerender/SSR para home, menú, contacto, catering, promociones y cada página pública con contenido.
5. Añadir `noindex` a rutas administrativas, encuesta y páginas transaccionales.

### Fase 2 — Fuente de verdad del restaurante

Solicitar una hoja de validación al propietario/gerente con:

- NAP oficial y enlace exacto de Google Business Profile;
- horarios ordinarios y especiales;
- historia aprobada del negocio;
- sucursales realmente vinculadas a la marca;
- menú vigente y fecha de actualización;
- promociones vigentes y condiciones;
- catering, food truck, salón privado y capacidades reales;
- perfiles sociales oficiales;
- premios con fuente y año;
- autorización/procedencia de fotografías y reseñas.

### Fase 3 — SEO local y contenido útil

1. Crear una página canónica fuerte para Cotati orientada a intención local, no a repetición artificial de keywords.
2. Publicar páginas de categorías con introducción real: burritos, tacos, mariscos, fajitas y opciones vegetarianas.
3. Publicar páginas de platillos únicamente cuando tengan contenido distintivo, precio vigente y foto correcta; evitar 149 páginas delgadas.
4. Desarrollar contenido original: historia del restaurante, guía de catering en Sonoma County, salón para eventos y artículos sobre platillos propios.
5. Agregar schema validado y breadcrumbs.
6. Conectar Search Console, Google Business Profile y analítica para medir consultas, llamadas, rutas, reservas y pedidos.

## Criterio editorial

Toda afirmación debe incluir en el CMS un campo de procedencia o aprobación. Para datos cambiantes conviene almacenar `verifiedAt`, `verifiedBy` y `sourceUrl`. Los números de reseñas, horarios, precios y promociones no deben quedar codificados como fallback publicitario.

La oportunidad SEO principal no es fabricar más texto: es convertir el menú, la historia, las fotografías, los servicios y la reputación auténtica de Cotati en páginas renderizadas, consistentes y verificables.
