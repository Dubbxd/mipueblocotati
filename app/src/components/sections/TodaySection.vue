<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const site = useSiteStore()
const main = computed(() => site.mainRestaurant)

const todayPromo = computed(() => site.promotions.find(p => p.active) ?? null)

const tt = (txt: { es: string; en: string }) => locale.value === 'es' ? txt.es : txt.en
</script>

<template>
  <section class="section bg-sand-50">
    <div class="container-page">
      <p class="section-kicker">{{ t('home.today.kicker') }}</p>
      <h2 class="section-header">{{ t('home.today.title') }}</h2>
      <p class="section-sub">{{ t('home.today.sub') }}</p>

      <div class="grid md:grid-cols-3 gap-6">
        <!-- Promo del día -->
        <article
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500 } }"
          class="card group flex flex-col bg-gradient-to-br from-brand to-brand-dark text-white !shadow-elev"
        >
          <div class="p-6 flex-1 flex flex-col">
            <span class="text-xs font-bold uppercase tracking-widest text-white/80 mb-3 inline-flex items-center gap-1.5">
              <Icon name="Gift" :size="14" />
              <span>{{ t('home.today.promoLabel') }}</span>
            </span>
            <template v-if="todayPromo">
              <h3 class="display-serif text-2xl md:text-3xl mb-3 leading-tight text-white">{{ tt(todayPromo.title) }}</h3>
              <p class="text-white/90 text-sm mb-6 flex-1">{{ tt(todayPromo.description) }}</p>
              <RouterLink v-if="todayPromo.cta" :to="todayPromo.cta.href" class="btn-light !py-2.5 self-start inline-flex items-center gap-2">
                <span>{{ tt(todayPromo.cta.label) }}</span>
                <Icon name="ArrowRight" :size="16" />
              </RouterLink>
            </template>
            <p v-else class="text-white/70 text-sm">{{ t('home.today.promoLabel') }}…</p>
          </div>
        </article>

        <!-- Reseña destacada -->
        <article
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500, delay: 100 } }"
          class="card group flex flex-col !shadow-elev relative overflow-hidden"
        >
          <Icon name="QuoteUp" type="Bold" :size="110"
                class="absolute -top-4 -right-4 text-accent/10 pointer-events-none" aria-hidden="true" />
          <div class="p-6 flex-1 flex flex-col relative">
            <span class="text-xs font-bold uppercase tracking-widest text-accent mb-3 inline-flex items-center gap-1.5">
              <Icon name="Star1" type="Bold" :size="14" />
              <span>{{ t('home.today.reviewLabel') }}</span>
            </span>
            <div class="flex items-center gap-1 text-accent mb-3" aria-hidden="true">
              <Icon v-for="i in 5" :key="i" name="Star1" type="Bold" :size="16" />
            </div>
            <p class="display-serif text-lg md:text-xl text-secondary-dark leading-snug flex-1 mb-6">
              "{{ t('home.today.reviewQuote') }}"
            </p>
            <div class="flex items-center justify-between border-t border-sand-200 pt-4">
              <div>
                <p class="font-bold text-secondary-dark text-sm">{{ t('home.today.reviewAuthor') }}</p>
                <p class="text-[11px] text-ink-muted uppercase tracking-wider">{{ t('home.today.reviewSource') }}</p>
              </div>
              <a href="#resenas" class="text-secondary font-bold text-sm hover:text-brand inline-flex items-center gap-1 shrink-0">
                {{ t('home.today.reviewCta') }} →
              </a>
            </div>
          </div>
        </article>

        <!-- Reserva express -->
        <article
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 500, delay: 200 } }"
          class="card overflow-hidden bg-secondary-dark text-white"
        >
          <div class="aspect-[16/9] relative overflow-hidden">
            <picture class="w-full h-full">
              <source srcset="/assets/gallery/mesa-reserva-margaritas.webp" type="image/webp" />
              <img src="/assets/gallery/mesa-reserva-margaritas.jpg" alt="" class="w-full h-full object-cover opacity-60" loading="eager" fetchpriority="high" />
            </picture>
            <div class="absolute inset-0 bg-gradient-to-t from-secondary-dark via-secondary-dark/40 to-transparent"></div>
          </div>
          <div class="p-6 -mt-12 relative">
            <span class="text-xs font-bold uppercase tracking-widest text-accent-light mb-2 inline-flex items-center gap-1.5">
              <Icon name="Calendar" :size="14" />
              <span>{{ t('home.today.reserveLabel') }}</span>
            </span>
            <h3 class="display-serif text-2xl text-white mb-2 leading-tight">{{ t('home.today.reserveTitle') }}</h3>
            <p class="text-sand-100/80 text-sm mb-5">{{ t('home.today.reserveBody') }}</p>
            <RouterLink to="/reservar" class="btn-accent w-full !justify-center">
              {{ t('cta.reserve') }}
            </RouterLink>
            <a :href="`tel:${main.phone}`" class="block text-center mt-3 text-xs text-sand-200 hover:text-white">
              {{ t('home.today.orCall') }}: <strong>{{ main.phone }}</strong>
            </a>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
