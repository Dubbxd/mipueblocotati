<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AboutSection from '@/components/sections/AboutSection.vue'
const { t } = useI18n()
</script>

<template>
  <main>
    <AboutSection
      :kicker="t('home.catering.kicker')"
      :title="t('home.catering.title')"
      :body="t('home.catering.body')"
      :cta-label="t('home.catering.cta')"
      cta-href="mailto:info@mipueblocotati.com"
      image="/assets/gallery/catering-buffet-setup.jpg"
      image-alt="Catering Mi Pueblo"
      bg="white"
    />
    <section class="section bg-sand-100">
      <div class="container-page max-w-3xl">
        <h2 class="section-header">{{ t('catering.howTitle') }}</h2>
        <ul class="space-y-3 text-ink-muted mt-6">
          <li>{{ t('catering.step1') }}</li>
          <li>{{ t('catering.step2') }}</li>
          <li>{{ t('catering.step3') }}</li>
        </ul>
      </div>
    </section>
  </main>
</template>
