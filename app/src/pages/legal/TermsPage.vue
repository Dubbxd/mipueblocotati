<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const isEn = () => locale.value === 'en'
</script>

<template>
  <main class="container-page pb-16 max-w-3xl">
    <h1 class="font-display text-4xl font-bold text-secondary-dark mt-8 mb-2">
      {{ isEn() ? 'Terms &amp; Conditions' : 'Términos y Condiciones' }}
    </h1>
    <p class="text-ink-muted text-sm mb-8">
      {{ isEn() ? 'Last updated: May 2026' : 'Última actualización: Mayo 2026' }}
    </p>

    <div class="prose prose-stone max-w-none">
      <template v-if="isEn()">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using the Mi Pueblo Cotati website (<strong>mipueblocotati.com</strong>), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use this site.</p>

        <h2>2. Use of the Website</h2>
        <p>You agree to use this website only for lawful purposes. You must not:</p>
        <ul>
          <li>Attempt to gain unauthorized access to any part of the site or its servers.</li>
          <li>Use automated tools to scrape or harvest data without our written permission.</li>
          <li>Submit false or misleading information in forms.</li>
        </ul>

        <h2>3. Reservations</h2>
        <p>Online reservation requests are subject to availability. Confirmation is sent by email. We reserve the right to cancel or modify reservations due to capacity or operational constraints. Please notify us at least 2 hours in advance if you need to cancel.</p>

        <h2>4. Promotions and Pricing</h2>
        <p>Prices and promotions displayed on this website are subject to change without notice. Promotions apply while supplies last and cannot be combined unless otherwise stated. Final pricing is confirmed at the point of sale.</p>

        <h2>5. Catering Services</h2>
        <p>Catering requests submitted through the website are inquiries only and do not constitute a confirmed booking. A formal agreement and deposit may be required to secure your event date.</p>

        <h2>6. Intellectual Property</h2>
        <p>All content on this website — including text, images, logos, and graphics — is owned by Mi Pueblo Cotati or used with permission. You may not reproduce, distribute, or create derivative works without our express written consent.</p>

        <h2>7. Third-party Links</h2>
        <p>Our site may contain links to third-party services (DoorDash, Uber Eats, etc.). We are not responsible for the content or practices of those sites.</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>This website is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.</p>

        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Mi Pueblo Cotati shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website.</p>

        <h2>10. Governing Law</h2>
        <p>These terms are governed by the laws of the State of California, USA. Any disputes shall be resolved in the courts of Sonoma County, California.</p>

        <h2>11. Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the site after changes are posted constitutes acceptance of the new terms.</p>

        <h2>12. Contact</h2>
        <p>Questions? Email <a href="mailto:info@mipueblocotati.com">info@mipueblocotati.com</a>.</p>
      </template>

      <template v-else>
        <h2>1. Aceptación de términos</h2>
        <p>Al acceder o usar el sitio web de Mi Pueblo Cotati (<strong>mipueblocotati.com</strong>), aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo, por favor no uses este sitio.</p>

        <h2>2. Uso del sitio web</h2>
        <p>Aceptas usar este sitio únicamente para fines lícitos. No debes:</p>
        <ul>
          <li>Intentar acceder de manera no autorizada a ninguna parte del sitio o sus servidores.</li>
          <li>Usar herramientas automatizadas para extraer datos sin nuestro permiso por escrito.</li>
          <li>Enviar información falsa o engañosa en los formularios.</li>
        </ul>

        <h2>3. Reservaciones</h2>
        <p>Las solicitudes de reservación en línea están sujetas a disponibilidad. La confirmación se envía por correo electrónico. Nos reservamos el derecho de cancelar o modificar reservaciones por razones de capacidad u operación. Por favor notifícanos con al menos 2 horas de anticipación si necesitas cancelar.</p>

        <h2>4. Promociones y precios</h2>
        <p>Los precios y promociones mostrados en este sitio están sujetos a cambios sin previo aviso. Las promociones aplican mientras dure el inventario y no pueden combinarse a menos que se indique lo contrario. El precio final se confirma en el punto de venta.</p>

        <h2>5. Servicios de catering</h2>
        <p>Las solicitudes de catering enviadas a través del sitio son solo consultas y no constituyen una reservación confirmada. Puede requerirse un acuerdo formal y un depósito para asegurar la fecha de tu evento.</p>

        <h2>6. Propiedad intelectual</h2>
        <p>Todo el contenido de este sitio web — incluyendo textos, imágenes, logotipos y gráficos — es propiedad de Mi Pueblo Cotati o se usa con permiso. No puedes reproducir, distribuir ni crear obras derivadas sin nuestro consentimiento expreso por escrito.</p>

        <h2>7. Enlaces de terceros</h2>
        <p>Nuestro sitio puede contener enlaces a servicios de terceros (DoorDash, Uber Eats, etc.). No somos responsables del contenido ni de las prácticas de esos sitios.</p>

        <h2>8. Descargo de garantías</h2>
        <p>Este sitio web se proporciona "tal como está" sin garantías de ningún tipo. No garantizamos un servicio ininterrumpido ni libre de errores.</p>

        <h2>9. Limitación de responsabilidad</h2>
        <p>En la medida máxima permitida por la ley, Mi Pueblo Cotati no será responsable de daños indirectos, incidentales o consecuentes derivados del uso de este sitio web.</p>

        <h2>10. Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes del Estado de California, EE. UU. Cualquier disputa se resolverá en los tribunales del Condado de Sonoma, California.</p>

        <h2>11. Cambios a los términos</h2>
        <p>Podemos actualizar estos términos en cualquier momento. El uso continuo del sitio después de publicar los cambios constituye la aceptación de los nuevos términos.</p>

        <h2>12. Contacto</h2>
        <p>¿Preguntas? Escríbenos a <a href="mailto:info@mipueblocotati.com">info@mipueblocotati.com</a>.</p>
      </template>
    </div>
  </main>
</template>
