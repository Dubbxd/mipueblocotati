<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { promotions } from '@/data/marketing'
const { locale } = useI18n()
</script>

<template>
  <main class="container-page py-12">
    <h1 class="font-display text-4xl md:text-5xl font-bold text-secondary-dark text-center">Promociones</h1>
    <p class="text-ink-muted text-center mt-2">Ofertas activas en nuestras sucursales</p>

    <div class="grid gap-6 md:grid-cols-3 mt-10">
      <article v-for="p in promotions" :key="p.id" class="card p-6">
        <h2 class="font-display text-2xl text-brand">{{ locale === 'es' ? p.title.es : p.title.en }}</h2>
        <p class="text-ink-muted mt-2">{{ locale === 'es' ? p.description.es : p.description.en }}</p>
        <p class="text-xs uppercase tracking-wider text-secondary mt-4">{{ p.recurrence }}</p>
        <a v-if="p.cta" :href="p.cta.href" class="btn-outline text-xs mt-4 inline-block">{{ locale === 'es' ? p.cta.label.es : p.cta.label.en }}</a>
      </article>
    </div>
  </main>
</template>
