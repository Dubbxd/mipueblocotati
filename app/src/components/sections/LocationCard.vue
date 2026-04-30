<script setup lang="ts">
import type { Restaurant } from '@/types/domain'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
defineProps<{ r: Restaurant }>()
const { t } = useI18n()
</script>

<template>
  <article class="card p-6 flex flex-col gap-3">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-display font-bold text-xl text-brand">{{ r.name }}</h3>
        <p class="text-sm text-ink-muted">{{ r.city }}, {{ r.state }}</p>
      </div>
      <span v-if="r.isMain" class="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-brand text-white">Principal</span>
    </header>

    <a :href="`https://maps.google.com/?q=${encodeURIComponent(r.address + ', ' + r.city + ', ' + r.state)}`"
       target="_blank" rel="noopener" class="text-sm text-secondary hover:text-brand inline-flex items-center gap-1.5">
      <Icon name="Location" :size="14" />
      <span>{{ r.address }}, {{ r.zip }}</span>
    </a>
    <a :href="`tel:${r.phone}`" class="text-sm text-secondary hover:text-brand inline-flex items-center gap-1.5">
      <Icon name="Call" :size="14" />
      <span>{{ r.phone }}</span>
    </a>

    <div class="text-sm text-ink-muted">
      <p>L-V · {{ r.hours.mon_fri }}</p>
      <p>S-D · {{ r.hours.sat_sun }}</p>
    </div>

    <div class="grid grid-cols-2 gap-2 mt-2">
      <a v-if="r.links.pickup" :href="r.links.pickup" target="_blank" rel="noopener" class="btn-primary text-xs py-2">{{ t('locations.actions.pickup') }}</a>
      <a v-if="r.links.delivery" :href="r.links.delivery" target="_blank" rel="noopener" class="btn-outline text-xs py-2">{{ t('locations.actions.delivery') }}</a>
      <RouterLink :to="`/reservar?branch=${r.id}`" class="btn-outline text-xs py-2">{{ t('cta.reserve') }}</RouterLink>
      <RouterLink to="/catering" class="btn-outline text-xs py-2">{{ t('locations.actions.catering') }}</RouterLink>
    </div>
  </article>
</template>
