<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const site = useSiteStore()
const main = computed(() => site.mainRestaurant)

const isOpen = computed(() => {
  const h = new Date().getHours()
  return h >= 11 && h < 21
})

const headline = computed(() =>
  locale.value === 'es'
    ? ['Descubre', 'el sabor', 'de México']
    : ['Discover', 'the taste', 'of México']
)
</script>

<template>
  <section class="relative overflow-hidden bg-night text-sand-100">
    <!-- Foto de fondo (cocina con flameado), tintada -->
    <img src="/assets/gallery/chef-flames.jpg" alt=""
         class="absolute inset-0 w-full h-full object-cover opacity-55" loading="eager" />
    <div class="absolute inset-0 bg-gradient-to-r from-night via-night/70 to-night/10"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent"></div>

    <!-- Wordmark gigante semi-transparente como marca de agua -->
    <span class="absolute top-1/2 -translate-y-1/2 right-[-4%] brand-script text-[18rem] md:text-[26rem] text-accent/10 leading-none select-none pointer-events-none whitespace-nowrap">
      Mi&nbsp;Pueblo
    </span>



    <div class="relative z-10 container-page pt-8 pb-24 md:pt-12 md:pb-32 min-h-[92vh] flex flex-col justify-center">
      <!-- Pills de confianza -->
      <div class="flex flex-wrap items-center gap-2 mb-8 animate-fadeIn">
        <span class="pill !bg-night-soft !text-sand-100 !border-night-light">
          <span class="pill-dot" :class="{ '!bg-rose-500': !isOpen }"></span>
          {{ isOpen ? 'Abierto · cierra 9 PM' : 'Cerrado · abre 11 AM' }}
        </span>
        <span class="pill !bg-night-soft !text-sand-100 !border-night-light inline-flex items-center gap-1.5">
          <Icon name="Star1" type="Bold" :size="14" class="text-amber-300" />
          <span>4.7 · 2,1k reseñas</span>
        </span>
        <span class="pill !bg-night-soft !text-sand-100 !border-night-light inline-flex items-center gap-1.5">
          <Icon name="Location" :size="14" />
          <span>{{ main?.city ?? 'Cotati' }}, CA</span>
        </span>
      </div>

      <!-- Headline impacto -->
      <h1 class="headline-impact text-[15vw] sm:text-8xl md:text-[9rem] lg:text-[11rem] mb-6 max-w-5xl animate-fadeIn">
        <span class="block text-sand-50">{{ headline[0] }}</span>
        <span class="block text-sand-50">{{ headline[1] }}</span>
        <span class="block text-accent">{{ headline[2] }}</span>
      </h1>

      <p class="font-body text-base md:text-xl text-sand-100/80 max-w-xl mb-8 leading-relaxed animate-fadeIn">
        {{ t('home.heroSubtitle') }}
      </p>

      <div class="flex flex-wrap items-center gap-3 animate-fadeIn">
        <a :href="main?.links.pickup ?? '#'" target="_blank" rel="noopener" class="btn-accent !px-8 !py-4 !text-base shadow-elev inline-flex items-center gap-2">
          <Icon name="Truck" :size="22" />
          <span>{{ t('cta.orderOnline') }}</span>
        </a>
        <RouterLink to="/menu" class="btn-light !text-base inline-flex items-center gap-2">
          <span>{{ t('cta.viewMenu') }}</span>
          <Icon name="ArrowRight" :size="18" />
        </RouterLink>
        <RouterLink to="/reservar" class="text-sand-100 hover:text-accent text-sm font-bold underline underline-offset-4 ml-2">
          {{ t('cta.reserve') }}
        </RouterLink>
      </div>
    </div>

    <!-- Foto real de chiles secos cayendo en el lado derecho -->
    <img src="/assets/decor/chilles.png" alt="" aria-hidden="true"
         class="hidden md:block absolute right-[-6%] lg:right-[-2%] top-[-6%] h-[115%] w-auto opacity-55 pointer-events-none select-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]" />
    <!-- Gradiente extra para que el lado izquierdo (donde va el headline) quede limpio -->
    <div class="absolute inset-0 bg-gradient-to-r from-night via-night/70 to-transparent pointer-events-none"></div>

    <!-- Cinta papel picado inferior (invertida) -->
    <div class="papel-strip absolute bottom-0 inset-x-0 z-20 rotate-180"></div>
  </section>
</template>
