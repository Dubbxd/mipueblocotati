<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const isEn = () => locale.value === 'en'
</script>

<template>
  <main class="container-page pb-16 max-w-3xl">
    <h1 class="font-display text-4xl font-bold text-secondary-dark mt-8 mb-2">
      {{ isEn() ? 'Privacy Policy' : 'Política de Privacidad' }}
    </h1>
    <p class="text-ink-muted text-sm mb-8">
      {{ isEn() ? 'Last updated: May 2026' : 'Última actualización: Mayo 2026' }}
    </p>

    <div class="prose prose-stone max-w-none">
      <template v-if="isEn()">
        <h2>Who we are</h2>
        <p>Mi Pueblo Cotati operates the website <strong>mipueblocotati.com</strong>. Our main location is at 7384 Commerce Blvd, Cotati, CA 94931. You can reach us at <a href="mailto:mipueblocotati1@gmail.com">mipueblocotati1@gmail.com</a>.</p>

        <h2>Information we collect</h2>
        <ul>
          <li><strong>Reservations &amp; Catering:</strong> name, phone, email, party size, date/time, and notes you provide.</li>
          <li><strong>Newsletter:</strong> email address and optional name.</li>
          <li><strong>Contact form:</strong> name, email, phone, and message.</li>
          <li><strong>Usage data:</strong> browser type, pages visited, and approximate location (via IP) for site analytics.</li>
        </ul>

        <h2>How we use your information</h2>
        <ul>
          <li>To confirm and manage your reservations or catering requests.</li>
          <li>To send you our newsletter (only if you subscribed — unsubscribe at any time).</li>
          <li>To respond to your contact inquiries.</li>
          <li>To improve our website and services.</li>
        </ul>
        <p>We do <strong>not</strong> sell, trade, or rent your personal information to third parties.</p>

        <h2>Data retention</h2>
        <p>We keep reservation and contact data for up to 3 years for operational purposes. Newsletter subscribers' data is kept until you unsubscribe. You may request deletion at any time.</p>

        <h2>Cookies</h2>
        <p>We use cookies to remember your preferences and for site analytics. See our <RouterLink to="/legal/cookies">Cookie Policy</RouterLink> for full details.</p>

        <h2>Third-party services</h2>
        <p>Our website may link to or embed services from DoorDash, Uber Eats, Grubhub, Google Maps, and Mailjet (email). Each has its own privacy policy.</p>

        <h2>California residents — CCPA rights</h2>
        <p>If you are a California resident, you have the right to:</p>
        <ul>
          <li>Know what personal information we collect and how it is used.</li>
          <li>Request deletion of your personal information.</li>
          <li>Opt out of the sale of personal information (we do <em>not</em> sell data).</li>
          <li>Non-discrimination for exercising these rights.</li>
        </ul>
        <p>To exercise your rights, email <a href="mailto:mipueblocotati1@gmail.com">mipueblocotati1@gmail.com</a> with the subject line "CCPA Request".</p>

        <h2>Security</h2>
        <p>We protect your data with industry-standard measures including HTTPS, hashed passwords, and access controls. However, no transmission over the internet is 100% secure.</p>

        <h2>Children's privacy</h2>
        <p>Our website is not directed at children under 13. We do not knowingly collect data from minors.</p>

        <h2>Changes to this policy</h2>
        <p>We may update this policy periodically. We will post the revised date at the top of this page.</p>

        <h2>Contact</h2>
        <p>Questions about this policy? Contact us at <a href="mailto:mipueblocotati1@gmail.com">mipueblocotati1@gmail.com</a> or call <a href="tel:+17077924380">(707) 792-4380</a>.</p>
      </template>

      <template v-else>
        <h2>Quiénes somos</h2>
        <p>Mi Pueblo Cotati opera el sitio web <strong>mipueblocotati.com</strong>. Nuestra ubicación principal es 7384 Commerce Blvd, Cotati, CA 94931. Puedes contactarnos en <a href="mailto:mipueblocotati1@gmail.com">mipueblocotati1@gmail.com</a>.</p>

        <h2>Información que recopilamos</h2>
        <ul>
          <li><strong>Reservaciones y Catering:</strong> nombre, teléfono, correo, tamaño del grupo, fecha/hora y notas que proporcionas.</li>
          <li><strong>Newsletter:</strong> dirección de correo electrónico y nombre opcional.</li>
          <li><strong>Formulario de contacto:</strong> nombre, correo, teléfono y mensaje.</li>
          <li><strong>Datos de uso:</strong> tipo de navegador, páginas visitadas y ubicación aproximada (por IP) para análisis del sitio.</li>
        </ul>

        <h2>Cómo usamos tu información</h2>
        <ul>
          <li>Para confirmar y gestionar tus reservaciones o solicitudes de catering.</li>
          <li>Para enviarte nuestro newsletter (solo si te suscribiste — puedes darte de baja en cualquier momento).</li>
          <li>Para responder tus consultas de contacto.</li>
          <li>Para mejorar nuestro sitio web y servicios.</li>
        </ul>
        <p>No vendemos, intercambiamos ni rentamos tu información personal a terceros.</p>

        <h2>Retención de datos</h2>
        <p>Guardamos los datos de reservaciones y contacto hasta 3 años con fines operativos. Los datos de suscriptores al newsletter se conservan hasta que te des de baja. Puedes solicitar la eliminación en cualquier momento.</p>

        <h2>Cookies</h2>
        <p>Usamos cookies para recordar tus preferencias y para análisis del sitio. Consulta nuestra <RouterLink to="/legal/cookies">Política de Cookies</RouterLink> para más detalles.</p>

        <h2>Servicios de terceros</h2>
        <p>Nuestro sitio puede enlazar o incrustar servicios de DoorDash, Uber Eats, Grubhub, Google Maps y Mailjet (correo electrónico). Cada uno tiene su propia política de privacidad.</p>

        <h2>Derechos CCPA (residentes de California)</h2>
        <p>Si eres residente de California, tienes derecho a:</p>
        <ul>
          <li>Saber qué información personal recopilamos y cómo se usa.</li>
          <li>Solicitar la eliminación de tu información personal.</li>
          <li>Optar por no participar en la venta de información personal (nosotros <em>no</em> vendemos datos).</li>
          <li>No ser discriminado por ejercer estos derechos.</li>
        </ul>
        <p>Para ejercer tus derechos, envía un correo a <a href="mailto:mipueblocotati1@gmail.com">mipueblocotati1@gmail.com</a> con el asunto "CCPA Request".</p>

        <h2>Seguridad</h2>
        <p>Protegemos tus datos con medidas estándar de la industria que incluyen HTTPS, contraseñas cifradas y controles de acceso. Sin embargo, ninguna transmisión por Internet es 100% segura.</p>

        <h2>Privacidad de menores</h2>
        <p>Nuestro sitio no está dirigido a menores de 13 años. No recopilamos intencionalmente datos de menores.</p>

        <h2>Cambios a esta política</h2>
        <p>Podemos actualizar esta política periódicamente. Publicaremos la fecha de revisión al inicio de esta página.</p>

        <h2>Contacto</h2>
        <p>¿Preguntas sobre esta política? Contáctanos en <a href="mailto:mipueblocotati1@gmail.com">mipueblocotati1@gmail.com</a> o llama al <a href="tel:+17077924380">(707) 792-4380</a>.</p>
      </template>
    </div>
  </main>
</template>
