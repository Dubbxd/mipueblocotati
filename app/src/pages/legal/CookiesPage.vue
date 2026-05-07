<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const isEn = () => locale.value === 'en'
</script>

<template>
  <main class="container-page pb-16 max-w-3xl">
    <h1 class="font-display text-4xl font-bold text-secondary-dark mt-8 mb-2">
      {{ isEn() ? 'Cookie Policy' : 'Política de Cookies' }}
    </h1>
    <p class="text-ink-muted text-sm mb-8">
      {{ isEn() ? 'Last updated: May 2026' : 'Última actualización: Mayo 2026' }}
    </p>

    <div class="prose prose-stone max-w-none">
      <template v-if="isEn()">
        <h2>What are cookies?</h2>
        <p>Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and improve your experience.</p>

        <h2>How we use cookies</h2>
        <p>Mi Pueblo Cotati uses the following types of cookies:</p>

        <h3>1. Essential / Strictly Necessary</h3>
        <p>These cookies are required for the site to function. They cannot be disabled.</p>
        <table>
          <thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead>
          <tbody>
            <tr><td><code>mp_cookie_consent</code></td><td>Stores your cookie preference</td><td>1 year</td></tr>
            <tr><td><code>mp_admin_token</code></td><td>Admin session JWT (admin users only)</td><td>7 days</td></tr>
          </tbody>
        </table>

        <h3>2. Analytics</h3>
        <p>We may use analytics tools to understand how visitors use our site. No personally identifiable information is collected. Currently no third-party analytics are active.</p>

        <h3>3. Marketing / Third-party embeds</h3>
        <p>Our delivery partner buttons (DoorDash, Uber Eats, Grubhub) and map embeds may set their own cookies when you interact with them. We have no control over these cookies — please review each provider's privacy policy.</p>

        <h2>Your choices</h2>
        <p>You can manage cookies through the banner shown on your first visit, or through your browser settings. Disabling essential cookies may break parts of the site.</p>
        <p>To clear your saved preference and re-show the banner, you can delete the <code>mp_cookie_consent</code> key from your browser's local storage.</p>

        <h2>California residents (CCPA)</h2>
        <p>We do not sell your personal information. For more information see our <RouterLink to="/legal/privacidad">Privacy Policy</RouterLink>.</p>

        <h2>Contact</h2>
        <p>Questions? Email us at <a href="mailto:info@mipueblocotati.com">info@mipueblocotati.com</a>.</p>
      </template>

      <template v-else>
        <h2>¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Ayudan al sitio a recordar tus preferencias y mejorar tu experiencia.</p>

        <h2>Cómo usamos las cookies</h2>
        <p>Mi Pueblo Cotati utiliza los siguientes tipos de cookies:</p>

        <h3>1. Esenciales / Estrictamente necesarias</h3>
        <p>Estas cookies son necesarias para que el sitio funcione correctamente. No pueden desactivarse.</p>
        <table>
          <thead><tr><th>Nombre</th><th>Propósito</th><th>Duración</th></tr></thead>
          <tbody>
            <tr><td><code>mp_cookie_consent</code></td><td>Guarda tu preferencia de cookies</td><td>1 año</td></tr>
            <tr><td><code>mp_admin_token</code></td><td>Sesión JWT para administradores</td><td>7 días</td></tr>
          </tbody>
        </table>

        <h3>2. Analíticas</h3>
        <p>Podemos usar herramientas de análisis para entender cómo los visitantes usan nuestro sitio. No se recopila información de identificación personal. Actualmente no hay analytics de terceros activos.</p>

        <h3>3. Marketing / Incrustaciones de terceros</h3>
        <p>Los botones de nuestros socios de delivery (DoorDash, Uber Eats, Grubhub) y los mapas integrados pueden establecer sus propias cookies cuando interactúas con ellos. No tenemos control sobre estas cookies; consulta la política de privacidad de cada proveedor.</p>

        <h2>Tus opciones</h2>
        <p>Puedes gestionar las cookies a través del banner que aparece en tu primera visita, o mediante la configuración de tu navegador. Desactivar las cookies esenciales puede afectar el funcionamiento del sitio.</p>
        <p>Para borrar tu preferencia guardada y volver a mostrar el banner, elimina la clave <code>mp_cookie_consent</code> del almacenamiento local de tu navegador.</p>

        <h2>Residentes de California (CCPA)</h2>
        <p>No vendemos tu información personal. Para más información consulta nuestra <RouterLink to="/legal/privacidad">Política de Privacidad</RouterLink>.</p>

        <h2>Contacto</h2>
        <p>¿Preguntas? Escríbenos a <a href="mailto:info@mipueblocotati.com">info@mipueblocotati.com</a>.</p>
      </template>
    </div>
  </main>
</template>
