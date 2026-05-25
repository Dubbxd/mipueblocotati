<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useSiteStore } from '@/stores'
import MapLeaflet from '@/components/sections/MapLeaflet.vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const route = useRoute()
const site = useSiteStore()
const r = computed(() => site.restaurants.find(x => x.id === route.params.slug))
</script>

<template>
  <main class="container-page pb-10">
    <RouterLink to="/sucursales" class="text-secondary hover:text-brand text-sm">← {{ t('locations.backToList') }}</RouterLink>
    <div v-if="r" class="grid md:grid-cols-2 gap-10 mt-6">
      <div>
        <h1 class="font-display text-4xl font-bold text-brand">{{ r.name }}</h1>
        <p class="text-ink-muted mt-2">{{ r.address }}, {{ r.city }}, {{ r.state }} {{ r.zip }}</p>
        <a :href="`tel:${r.phone}`" class="block mt-2 text-secondary">{{ r.phone }}</a>
        <a :href="`mailto:${r.email}`" class="block text-secondary">{{ r.email }}</a>
        <div class="mt-4 text-sm">
          <p>L-V · {{ r.hours.mon_fri }}</p>
          <p>S-D · {{ r.hours.sat_sun }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2 mt-6 max-w-sm">
          <a v-if="r.links.pickup" :href="r.links.pickup" target="_blank" rel="noopener" class="btn-primary text-sm">{{ t('cta.orderOnline') }}</a>
          <RouterLink :to="`/reservar?branch=${r.id}`" class="btn-outline text-sm">{{ t('cta.reserve') }}</RouterLink>
        </div>
      </div>
      <MapLeaflet :only="r.id" height="420px" />
    </div>
  </main>
</template>
