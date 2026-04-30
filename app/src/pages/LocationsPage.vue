<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import LocationCard from '@/components/sections/LocationCard.vue'
import MapLeaflet from '@/components/sections/MapLeaflet.vue'
const { t } = useI18n()
const site = useSiteStore()
</script>

<template>
  <main class="pt-6">
    <header class="container-page py-8 text-center">
      <h1 class="font-display text-4xl md:text-6xl font-bold text-secondary-dark">{{ t('locations.title') }}</h1>
      <p class="text-ink-muted mt-2">{{ t('locations.sub') }}</p>
    </header>

    <section class="container-page mb-10">
      <MapLeaflet height="480px" />
    </section>

    <section class="container-page grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-16">
      <LocationCard v-for="r in site.restaurants" :key="r.id" :r="r" />
    </section>
  </main>
</template>
