<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import LocationCard from '@/components/sections/LocationCard.vue'
import MapLeaflet from '@/components/sections/MapLeaflet.vue'
import Icon from '@/components/ui/Icon.vue'
const { t } = useI18n()
const site = useSiteStore()
</script>

<template>
  <main>

    <!-- Hero de sucursales -->
    <section class="relative overflow-hidden bg-night text-white">
      <img
        src="/assets/gallery/dining-room-tables-set.jpg"
        alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-40"
        loading="eager"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30"></div>
      <div class="relative z-10 container-page py-16 md:py-20 flex flex-col md:flex-row md:items-center gap-8">
        <div class="flex-1">
          <p class="section-kicker text-left mb-2 !text-accent">
            <Icon name="Location" :size="13" class="mr-1" />{{ t('locations.kicker') }}
          </p>
          <h1 class="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-3">
            {{ t('locations.title') }}
          </h1>
          <p class="text-sand-200 text-base max-w-md">{{ t('locations.sub') }}</p>
        </div>
        <!-- Stats rápidos -->
        <div class="flex gap-6 shrink-0">
          <div class="text-center">
            <p class="font-impact text-5xl text-accent leading-none">6</p>
            <p class="text-sand-300 text-xs mt-1 uppercase tracking-widest">{{ t('locations.statsLocations') }}</p>
          </div>
          <div class="text-center">
            <p class="font-impact text-5xl text-accent leading-none">3</p>
            <p class="text-sand-300 text-xs mt-1 uppercase tracking-widest">{{ t('locations.statsCities') }}</p>
          </div>
          <div class="text-center">
            <p class="font-impact text-5xl text-accent leading-none">28<span class="text-2xl">+</span></p>
            <p class="text-sand-300 text-xs mt-1 uppercase tracking-widest">{{ t('locations.statsYears') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mapa interactivo -->
    <section class="container-page py-8">
      <div class="rounded-3xl overflow-hidden shadow-elev border border-sand-200">
        <MapLeaflet height="420px" />
      </div>
    </section>

    <!-- Grid de tarjetas -->
    <section class="container-page pb-16">
      <div class="flex items-center justify-between gap-4 mb-6">
        <h2 class="font-display text-2xl font-bold text-secondary-dark">
          {{ t('locations.allLocations') }}
        </h2>
        <span class="text-sm text-ink-muted tabular-nums">{{ site.restaurants.length }} {{ t('locations.statsLocations') }}</span>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <LocationCard v-for="r in site.restaurants" :key="r.id" :r="r" />
      </div>
    </section>

  </main>
</template>
