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
  if (main.value?.openHour != null && main.value?.closeHour != null)
    return h >= main.value.openHour && h < main.value.closeHour
  return h >= 11 && h < 21 // fallback
})
</script>

<template>
  <section class="relative overflow-hidden bg-night text-sand-100">
    <!-- Foto de fondo (cocina con flameado) — más visible -->
    <img src="/assets/gallery/chef-flames.jpg" alt=""
         class="absolute inset-0 w-full h-full object-cover opacity-70" loading="eager" />
    <!-- Gradiente lateral para que el texto resalte sobre la foto -->
    <div class="absolute inset-0 bg-gradient-to-r from-night/85 via-night/50 to-night/10 pointer-events-none"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-night/60 via-night/10 to-transparent pointer-events-none"></div>

    <!-- Wordmark semi-transparente como marca de agua -->
    <span class="absolute top-1/2 -translate-y-1/2 right-[-4%] brand-script text-[18rem] md:text-[26rem] text-accent/10 leading-none select-none pointer-events-none whitespace-nowrap">
      Mi&nbsp;Pueblo
    </span>

    <div class="relative z-10 container-page pt-8 pb-24 md:pt-12 md:pb-32 min-h-[92vh] flex flex-col justify-center">
      <!-- Pills de confianza -->
      <div class="flex flex-wrap items-center gap-2 mb-8 animate-fadeIn">
        <span class="pill !bg-night-soft !text-sand-100 !border-night-light">
          <span class="pill-dot" :class="{ '!bg-rose-500': !isOpen }"></span>
          {{ isOpen ? t('home.hero.open') : t('home.hero.closed') }}
        </span>
        <span class="pill !bg-night-soft !text-sand-100 !border-night-light inline-flex items-center gap-1.5">
          <Icon name="Star1" type="Bold" :size="14" class="text-amber-300" />
          {{ t('home.hero.reviews') }}
        </span>
        <span class="pill !bg-night-soft !text-sand-100 !border-night-light inline-flex items-center gap-1.5">
          <Icon name="Location" :size="14" />
          {{ main?.city ? `${main.city}, CA` : t('home.hero.location') }}
        </span>
      </div>

      <!-- Headline impacto -->
      <h1 class="headline-impact text-[15vw] sm:text-8xl md:text-[9rem] lg:text-[11rem] mb-6 max-w-5xl animate-fadeIn">
        <span class="block text-sand-50">{{ t('home.hero.line1') }}</span>
        <span class="block text-sand-50">{{ t('home.hero.line2') }}</span>
        <span class="block text-accent">{{ t('home.hero.line3') }}</span>
      </h1>

      <p class="font-body text-base md:text-xl text-sand-100/80 max-w-xl mb-8 leading-relaxed animate-fadeIn">
        {{ t('home.heroSubtitle') }}
      </p>

      <div class="flex flex-wrap items-center gap-3 animate-fadeIn">
        <a :href="main?.links.pickup ?? '#'" target="_blank" rel="noopener" class="btn-accent !px-8 !py-4 !text-base shadow-elev inline-flex items-center gap-2">
          <Icon name="Truck" :size="22" />
          {{ t('cta.orderOnline') }}
        </a>
        <RouterLink to="/menu" class="btn-light !text-base inline-flex items-center gap-2">
          {{ t('cta.viewMenu') }}
          <Icon name="ArrowRight" :size="18" />
        </RouterLink>
        <RouterLink to="/reservar" class="text-sand-100 hover:text-accent text-sm font-bold underline underline-offset-4 ml-2">
          {{ t('cta.reserve') }}
        </RouterLink>
      </div>
    </div>

    <!-- Foto de chiles decorativos a la derecha -->
    <img src="/assets/decor/chilles.png" alt="" aria-hidden="true"
         class="hidden md:block absolute right-[-6%] lg:right-[-2%] top-[-6%] h-[115%] w-auto opacity-55 pointer-events-none select-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]" />
    <!-- Gradiente extra izquierda para limpiar el área del headline -->
    <div class="absolute inset-0 bg-gradient-to-r from-night/85 via-night/50 to-transparent pointer-events-none"></div>
  </section>
</template>
