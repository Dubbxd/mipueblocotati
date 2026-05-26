<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { t } = useI18n()
const site = useSiteStore()
const main = computed(() => site.mainRestaurant)

const isOpen = computed(() => {
  const h = new Date().getHours()
  return h >= 11 && h < 21
})
</script>

<template>
  <section class="relative overflow-hidden min-h-screen flex flex-col">
    <!-- Foto fondo full-bleed -->
    <img
      src="/assets/gallery/chef-flames.jpg"
      alt=""
      class="absolute inset-0 w-full h-full object-cover object-center"
      loading="eager"
    />

    <!-- Vignette: fuerte desde abajo + gradiente desde izquierda -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 pointer-events-none"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent pointer-events-none"></div>

    <!-- Contenido anclado abajo-izquierda -->
    <div class="relative z-10 container-page flex flex-col justify-end flex-1 pb-20 md:pb-24 pt-32">

      <!-- Badge MP -->
      <div class="mb-5 animate-fadeIn" style="animation-delay:.05s">
        <span class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand text-white font-impact text-2xl tracking-wider shadow-elev select-none">
          MP
        </span>
      </div>

      <!-- Nombre del restaurante -->
      <h1
        class="font-display font-bold text-white leading-[1.05] tracking-tight mb-4 animate-fadeIn"
        style="font-size: clamp(2.8rem, 9vw, 7rem); animation-delay:.1s"
      >
        Mi Pueblo<br>Cotati
      </h1>

      <!-- Tagline -->
      <p class="font-body text-white/75 text-base md:text-lg mb-2 animate-fadeIn" style="animation-delay:.15s">
        {{ t('home.heroSubtitle') }}
      </p>

      <!-- Ubicación con guión -->
      <p class="flex items-center gap-3 text-white/45 text-sm font-body mb-8 animate-fadeIn" style="animation-delay:.2s">
        <span class="inline-block w-8 h-px bg-white/35 flex-shrink-0"></span>
        Sonoma County, California
      </p>

      <!-- Pills de estado + reseñas -->
      <div class="flex flex-wrap items-center gap-2 mb-8 animate-fadeIn" style="animation-delay:.25s">
        <span class="pill !bg-white/10 !text-white !border-white/20 backdrop-blur-sm">
          <span class="pill-dot" :class="{ '!bg-rose-500': !isOpen }"></span>
          {{ isOpen ? 'Abierto · cierra 9 PM' : 'Cerrado · abre 11 AM' }}
        </span>
        <span class="pill !bg-white/10 !text-white !border-white/20 backdrop-blur-sm inline-flex items-center gap-1.5">
          <Icon name="Star1" type="Bold" :size="13" class="text-amber-300" />
          4.7 · 2,1k reseñas
        </span>
      </div>

      <!-- CTAs -->
      <div class="flex flex-wrap items-center gap-3 animate-fadeIn" style="animation-delay:.3s">
        <a
          :href="main?.links.pickup ?? '#'"
          target="_blank"
          rel="noopener"
          class="btn-accent !px-7 !py-3.5 !text-sm shadow-elev"
        >
          <Icon name="Truck" :size="18" />
          {{ t('cta.orderOnline') }}
        </a>
        <RouterLink to="/menu" class="btn bg-white/15 text-white border border-white/25 hover:bg-white/25 backdrop-blur-sm !text-sm">
          {{ t('cta.viewMenu') }}
          <Icon name="ArrowRight" :size="16" />
        </RouterLink>
        <RouterLink
          to="/reservar"
          class="text-white/75 hover:text-white text-sm font-bold underline underline-offset-4 ml-1 transition-colors"
        >
          {{ t('cta.reserve') }}
        </RouterLink>
      </div>
    </div>

    <!-- Cinta papel picado inferior -->
    <div class="papel-strip absolute bottom-0 inset-x-0 z-20 rotate-180"></div>
  </section>
</template>
