<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore, useSiteStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const menu = useMenuStore()
const site = useSiteStore()
const main = computed(() => site.mainRestaurant)

const todayPromo = computed(() => site.promotions.find(p => p.active) ?? null)

// Plato estrella: el primer popular con foto
const star = computed(() => menu.popular.find(m => m.photo) ?? menu.popular[0])

const fmt = (p: number | null) => p == null ? '' : `$${p.toFixed(2)}`
const tt = (txt: { es: string; en: string }) => locale.value === 'es' ? txt.es : txt.en
</script>

<template>
  <section class="section bg-sand-50">
    <div class="container-page">
      <!-- Sin eyebrow — el headline solo es suficiente -->
      <h2 class="section-header">{{ t('home.today.title') }}</h2>
      <p class="section-sub">{{ t('home.today.sub') }}</p>

      <!-- Layout asimétrico: promo ocupa 2/3 del ancho, plato estrella y reserva comparten 1/3 apiladas -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">

        <!-- Promo del día — ocupa 2 columnas en desktop -->
        <article
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500 } }"
          class="card group flex flex-col md:col-span-2 bg-gradient-to-br from-brand to-brand-dark text-white !shadow-elev min-h-[280px]"
        >
          <div class="p-7 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-display text-3xl md:text-4xl font-extrabold mb-3 leading-tight text-white">
                <template v-if="todayPromo">{{ tt(todayPromo.title) }}</template>
                <template v-else>{{ t('home.today.promoLabel') }}</template>
              </h3>
              <p v-if="todayPromo" class="text-white/85 text-base mb-6 max-w-md leading-relaxed">{{ tt(todayPromo.description) }}</p>
            </div>
            <RouterLink v-if="todayPromo?.cta" :to="todayPromo.cta.href"
              class="btn-light !py-3 self-start inline-flex items-center gap-2 active:scale-[0.98]">
              <span>{{ tt(todayPromo.cta.label) }}</span>
              <Icon name="ArrowRight" :size="16" />
            </RouterLink>
          </div>
        </article>

        <!-- Columna derecha: plato estrella + reserva apilados -->
        <div class="flex flex-col gap-5">
          <!-- Plato estrella -->
          <article
            v-if="star"
            v-motion
            :initial="{ opacity: 0, x: 16 }"
            :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 500, delay: 100 } }"
            class="card group overflow-hidden flex-1"
          >
            <div class="aspect-[4/3] overflow-hidden bg-sand-200">
              <img v-if="star.photo" :src="star.photo.replace('.webp', '.jpg')" :alt="tt(star.name)"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
            </div>
            <div class="p-4">
              <h3 class="font-display font-bold text-secondary-dark text-base mb-1 leading-snug">{{ tt(star.name) }}</h3>
              <div class="flex items-center justify-between">
                <span class="text-xl font-extrabold text-brand">{{ fmt(star.price) }}</span>
                <RouterLink to="/menu" class="text-secondary font-bold text-sm hover:text-brand transition-colors">
                  {{ t('cta.viewMenu') }} →
                </RouterLink>
              </div>
            </div>
          </article>

          <!-- Reserva express -->
          <article
            v-motion
            :initial="{ opacity: 0, x: 16 }"
            :visibleOnce="{ opacity: 1, x: 0, transition: { duration: 500, delay: 200 } }"
            class="card overflow-hidden bg-secondary-dark text-white relative"
          >
            <picture class="absolute inset-0 w-full h-full">
              <source srcset="/assets/hero/cotati-interior.webp" type="image/webp" />
              <img src="/assets/hero/cotati-interior.jpg" alt="" class="w-full h-full object-cover opacity-50" loading="eager" />
            </picture>
            <div class="absolute inset-0 bg-gradient-to-t from-secondary-dark via-secondary-dark/60 to-transparent"></div>
            <div class="relative p-5 pt-16">
              <h3 class="font-display font-bold text-white text-lg mb-3 leading-tight">{{ t('home.today.reserveTitle') }}</h3>
              <RouterLink to="/reservar" class="btn-accent w-full !justify-center active:scale-[0.98]">
                {{ t('cta.reserve') }}
              </RouterLink>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
