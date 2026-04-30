# Mi Pueblo Cotati — Análisis UX del sitio actual

> Auditoría heurística del sitio Wix `https://www.mipueblocotati.com/` (abril 2026).

## Problemas críticos

### 1. El menú real NO está en el sitio
- El link "Menu" del header apunta a un **PDF en Google Drive** (`drive.google.com/file/d/1yyS...`).
- El PDF está marcado como `QPS PROOF` (preview de imprenta, no versión final).
- El texto del PDF es **rasterizado** (imagen, no texto) → cero accesibilidad y cero SEO.
- La página `/menu` del sitio es la **plantilla demo de Wix Restaurants** ("Bread & dips $4.50", "Tofu skewers $7.50") — no tiene relación con el restaurante.
- Resultado: usuarios deben descargar un PDF lento para ver lo que se vende.

### 2. SEO prácticamente nulo
- Sin precios indexables (todo en PDF imagen).
- Sin schema.org `Restaurant`/`Menu`/`MenuItem`.
- Sin meta descriptions específicas por página.
- Página principal cuenta con texto mínimo ("we've been putting out an authentic product since 1997").

### 3. Inconsistencia de horarios
- Footer (todas las páginas internas): cierra **8:00 PM**.
- Hero de homepage: cierra **9:00 PM**.
- El cliente pierde reservas porque no sabe cuándo abre realmente.

### 4. Información de contacto fragmentada
- Email aparece a veces como `mailto:` y a veces como texto plano.
- Teléfono está formateado como `mailto:` (bug en el HTML).
- Sin botón "click to call" prominente en mobile.
- Sin botón directo a Google Maps (solo lista la dirección como texto).

### 5. Demasiados sistemas de terceros con UX inconsistente
- Reservas: módulo nativo de Wix
- Pickup: Clover (link externo a `cloveronline.com`)
- Delivery: DoorDash (link externo)
- Catering / food truck: solo formularios de contacto

### 6. Performance esperable de Wix
- Carga >1.5 MB de HTML inicial + Wix runtime JS pesado.
- Imágenes servidas vía `static.wixstatic.com` con transformaciones AVIF (bien) pero sin lazy-loading explícito en hero.

### 7. Accesibilidad
- PDF como única fuente de menú = cero compatibilidad con lectores de pantalla para precios.
- Hero "video decorativo" sin transcripción.
- Botones tipo "Click here" sin contexto descriptivo.

### 8. Mobile UX
- Header sticky de Wix consume mucho espacio vertical.
- Botón "Pick Up Orders" lleva fuera del sitio en lugar de tener menú nativo.
- Embed de Instagram no se carga rápido en 4G.

### 9. Branding débil
- El logo aparece como `_edited.png` (nombre genérico de Wix).
- Falta consistencia de paleta entre awards (PNGs externos), hero (foto natural) y fondo (color sólido).
- Sin manual de marca.

### 10. Conversiones faltantes
- Sin captura de email visible al inicio (existe `lead-collection` pero no está promovida).
- Sin programa de fidelidad / cumpleaños / referidos en el sitio.
- Sin promo "Burrito Thursday" en home (solo en Instagram).

---

## Oportunidades para el rebuild

| Área | Estado actual | Propuesta |
|---|---|---|
| Menú | PDF rasterizado en Drive | Menú nativo con búsqueda, filtros (vegan/picante/seafood) y schema.org |
| Pickup | Redirección a Clover SPA | Embed/integración nativa o botón claro con CTA único |
| Reservas | Wix nativo | Mantener pero mejorar diseño, integrar con WhatsApp/Calendar |
| SEO | Score bajo | Agregar páginas por categoría, blog activo, structured data |
| Performance | Wix overhead | Next.js + ISR, imágenes WebP/AVIF optimizadas, Lighthouse 90+ |
| Mobile | Wix responsive | PWA instalable, "Add to Home Screen", offline menu |
| Loyalty | Solo Instagram | Newsletter destacado, cumpleaños automatizado, refer-a-friend |
| i18n | Sólo inglés/spanglish | ES/EN con detección automática |
| Branding | Logo genérico | Sistema de diseño completo + assets de redes |
