<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { restaurants } from '@/data/restaurants'
import MapLeaflet from '@/components/sections/MapLeaflet.vue'
const { t } = useI18n()
const main = restaurants[0]
</script>

<template>
  <main class="container-page py-12">
    <h1 class="font-display text-4xl md:text-5xl font-bold text-secondary-dark">{{ t('contact.title') }}</h1>

    <div class="grid md:grid-cols-2 gap-10 mt-8">
      <div class="card p-6 space-y-3">
        <p><strong>{{ t('contact.address') }}:</strong> {{ main.address }}, {{ main.city }}, {{ main.state }} {{ main.zip }}</p>
        <p><strong>{{ t('contact.phone') }}:</strong> <a :href="`tel:${main.phone}`" class="text-brand">{{ main.phone }}</a></p>
        <p><strong>{{ t('contact.email') }}:</strong> <a :href="`mailto:${main.email}`" class="text-brand">{{ main.email }}</a></p>
        <p><strong>{{ t('contact.hours') }}:</strong></p>
        <ul class="text-sm text-ink-muted ml-4">
          <li>{{ t('contact.weekdays') }} · {{ main.hours.mon_fri }}</li>
          <li>{{ t('contact.weekend') }} · {{ main.hours.sat_sun }}</li>
        </ul>
      </div>
      <MapLeaflet only="cotati" height="100%" />
    </div>
  </main>
</template>
