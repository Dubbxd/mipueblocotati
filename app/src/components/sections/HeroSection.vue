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
  if (main.value?.openHour != null && main.value?.closeHour != null)
    return h >= main.value.openHour && h < main.value.closeHour
  return h >= 11 && h < 21
})

function fmtHour(h: number) {
  if (h === 0)  return '12 AM'
  if (h < 12)   return `${h} AM`
  if (h === 12) return '12 PM'
  return `${h - 12} PM`
}

const openClosedPill = computed(() => {
  const r = main.value
  const es = locale.value === 'es'
  if (isOpen.value && r?.closeHour != null)
    return es ? `Abierto · cierra ${fmtHour(r.closeHour)}` : `Open · closes ${fmtHour(r.closeHour)}`
  if (!isOpen.value && r?.openHour != null)
    return es ? `Cerrado · abre ${fmtHour(r.openHour)}` : `Closed · opens ${fmtHour(r.openHour)}`
  return isOpen.value ? t('home.hero.open') : t('home.hero.closed')
})

const reviewPill = computed(() => {
  const r = main.value
  if (r?.googleRating && r?.googleReviewCount) {
    const count = r.googleReviewCount >= 1000
      ? `${(r.googleReviewCount / 1000).toFixed(1)}k`
      : String(r.googleReviewCount)
    return `${r.googleRating.toFixed(1)} · ${count} ${locale.value === 'es' ? 'reseñas' : 'reviews'}`
  }
  return t('home.hero.reviews')
})
</script>

<template>
  <section class="relative min-h-[100dvh] flex items-end overflow-hidden bg-night">
    <!-- Background photo -->
    <picture class="absolute inset-0 w-full h-full">
      <source srcset="/assets/gallery/chef-flames.webp" type="image/webp" />
      <img src="/assets/gallery/chef-flames.jpg" alt=""
           class="w-full h-full object-cover" loading="eager" fetchpriority="high" />
    </picture>

    <!-- Clean gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-night/10 pointer-events-none" />

    <!-- Content -->
    <div class="relative z-10 container-page pb-12 md:pb-20 pt-32 w-full">

      <!-- Headline -->
      <h1
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 600, delay: 200 } }"
        class="headline-impact text-[15vw] sm:text-8xl md:text-[9rem] lg:text-[11rem] mb-6 max-w-5xl"
      >
        <span class="block text-sand-50">{{ t('home.hero.line1') }}</span>
        <span class="block text-sand-50">{{ t('home.hero.line2') }}</span>
        <span class="block text-accent">{{ t('home.hero.line3') }}</span>
      </h1>

      <p
        v-motion
        :initial="{ opacity: 0, y: 16 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 350 } }"
        class="text-sand-200 text-base md:text-lg max-w-lg mb-8 leading-relaxed"
      >
        {{ t('home.heroSubtitle') }}
      </p>

      <!-- CTAs -->
      <div
        v-motion
        :initial="{ opacity: 0, y: 12 }"
        :enter="{ opacity: 1, y: 0, transition: { duration: 500, delay: 450 } }"
        class="flex flex-wrap items-center gap-3 mb-10"
      >
        <RouterLink to="/menu" class="btn-primary !px-7 !py-3.5 !text-base inline-flex items-center gap-2">
          <Icon name="MenuBoard" :size="20" type="Bold" />
          {{ t('cta.viewMenu') }}
        </RouterLink>
        <RouterLink to="/reservar" class="btn-light !text-base inline-flex items-center gap-2">
          <Icon name="Calendar" :size="18" />
          {{ t('cta.reserve') }}
        </RouterLink>
        <a v-if="main?.links.pickup" :href="main.links.pickup" target="_blank" rel="noopener"
           class="text-sand-100 hover:text-white text-sm font-semibold underline underline-offset-4 decoration-sand-100/40 hover:decoration-white transition-colors ml-1">
          {{ t('cta.orderOnline') }}
        </a>
      </div>

      <!-- Info pills -->
      <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1, transition: { duration: 500, delay: 600 } }"
        class="flex flex-wrap items-center gap-2"
      >
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-sand-100">
          <span class="w-1.5 h-1.5 rounded-full" :class="isOpen ? 'bg-emerald-400' : 'bg-rose-400'" />
          {{ openClosedPill }}
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-sand-100">
          <Icon name="Star1" type="Bold" :size="12" class="text-amber-300" />
          {{ reviewPill }}
        </span>
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-sand-100">
          <Icon name="Location" :size="12" />
          {{ main?.city ? `${main.city}, CA` : t('home.hero.location') }}
        </span>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-50">
      <div class="w-5 h-8 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
        <div class="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
      </div>
    </div>
  </section>
</template>
