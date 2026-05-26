<script setup lang="ts">
import type { Restaurant } from '@/types/domain'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import Icon from '@/components/ui/Icon.vue'

const props = defineProps<{ r: Restaurant }>()
const { t } = useI18n()

const isOpen = computed(() => {
  const h = new Date().getHours()
  if (props.r.openHour != null && props.r.closeHour != null)
    return h >= props.r.openHour && h < props.r.closeHour
  return h >= 11 && h < 21 // fallback
})

const mapsUrl = computed(() =>
  `https://maps.google.com/?q=${encodeURIComponent(`${props.r.address}, ${props.r.city}, ${props.r.state}`)}`
)
</script>

<template>
  <article class="group rounded-3xl overflow-hidden bg-white border border-sand-100 shadow-soft hover:shadow-elev transition-all duration-300 flex flex-col">

    <!-- Foto de portada -->
    <div class="relative h-48 overflow-hidden bg-sand-200">
      <img
        v-if="r.photo"
        :src="r.photo"
        :alt="r.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div v-else class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-sand-100 to-sand-200 gap-2">
        <Icon name="Buildings2" :size="52" class="text-secondary/40" type="Bold" />
        <span class="text-xs text-secondary/50 font-medium tracking-wide uppercase">{{ r.city }}</span>
      </div>
      <!-- Gradiente inferior -->
      <div class="absolute inset-0 bg-gradient-to-t from-night/60 via-night/20 to-transparent"></div>

      <!-- Badge Principal / ciudad -->
      <div class="absolute top-3 left-3 flex gap-2 items-center">
        <span v-if="r.isMain" class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-brand text-white shadow">
          <Icon name="Star1" :size="9" type="Bold" />
          Principal
        </span>
      </div>

      <!-- Estado abierto/cerrado -->
      <div class="absolute top-3 right-3">
        <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow"
          :class="isOpen ? 'bg-green-500 text-white' : 'bg-sand-800/80 text-sand-100'">
          <span class="w-1.5 h-1.5 rounded-full" :class="isOpen ? 'bg-white' : 'bg-sand-300'"></span>
          {{ isOpen ? t('common.open') : t('common.closed') }}
        </span>
      </div>

      <!-- Nombre sobre la foto -->
      <div class="absolute bottom-3 left-4 right-4">
        <h3 class="font-display font-bold text-white text-lg leading-tight drop-shadow">{{ r.name }}</h3>
        <p class="text-sand-200 text-xs mt-0.5">{{ r.city }}, {{ r.state }}</p>
      </div>
    </div>

    <!-- Info del card -->
    <div class="flex flex-col gap-3 p-4 flex-1">

      <!-- Dirección + teléfono -->
      <div class="space-y-1.5">
        <a :href="mapsUrl" target="_blank" rel="noopener"
           class="flex items-start gap-2 text-sm text-secondary hover:text-brand transition-colors group/link">
          <Icon name="Location" :size="15" class="text-brand shrink-0 mt-0.5" />
          <span class="group-hover/link:underline underline-offset-2">{{ r.address }}, {{ r.city }} {{ r.zip }}</span>
        </a>
        <a :href="`tel:${r.phone}`"
           class="flex items-center gap-2 text-sm text-secondary hover:text-brand transition-colors">
          <Icon name="Call" :size="15" class="text-brand shrink-0" />
          <span>{{ r.phone }}</span>
        </a>
        <a v-if="r.email" :href="`mailto:${r.email}`"
           class="flex items-center gap-2 text-sm text-secondary hover:text-brand transition-colors">
          <Icon name="Sms" :size="15" class="text-brand shrink-0" />
          <span class="truncate">{{ r.email }}</span>
        </a>
      </div>

      <!-- Horarios -->
      <div class="rounded-xl bg-sand-50 px-3 py-2.5 space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-ink-muted flex items-center gap-1.5">
            <Icon name="Clock" :size="12" class="text-brand" />
            {{ t('contact.weekdays') }}
          </span>
          <span class="font-semibold text-secondary-dark">{{ r.hours.mon_fri }}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-ink-muted flex items-center gap-1.5">
            <Icon name="Clock" :size="12" class="text-accent" />
            {{ t('contact.weekend') }}
          </span>
          <span class="font-semibold text-secondary-dark">{{ r.hours.sat_sun }}</span>
        </div>
      </div>

      <!-- Redes sociales -->
      <div v-if="r.links.facebook || r.links.instagram" class="flex gap-2">
        <a v-if="r.links.facebook" :href="r.links.facebook" target="_blank" rel="noopener"
           class="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-secondary hover:bg-brand hover:text-white transition-colors">
          <Icon name="Global" :size="14" />
        </a>
        <a v-if="r.links.instagram" :href="r.links.instagram" target="_blank" rel="noopener"
           class="w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-secondary hover:bg-brand hover:text-white transition-colors">
          <Icon name="Camera" :size="14" />
        </a>
      </div>

      <!-- Acción principal -->
      <div class="mt-auto pt-1">
        <a :href="mapsUrl" target="_blank" rel="noopener"
           class="w-full btn-primary text-sm py-3 inline-flex items-center justify-center gap-2">
          <Icon name="Map1" :size="15" type="Bold" />
          {{ t('locations.viewMap') }}
        </a>
      </div>
    </div>
  </article>
</template>
