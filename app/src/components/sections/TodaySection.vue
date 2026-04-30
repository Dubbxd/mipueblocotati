<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { promotions } from '@/data/marketing'
import { useMenuStore } from '@/stores'
import { restaurants } from '@/data/restaurants'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const menu = useMenuStore()
const main = restaurants[0]

const todayDow = new Date().getDay()
const todayPromo = computed(() =>
  promotions.find(p => p.recurrence === 'weekly' && p.dayOfWeek === todayDow && p.active)
  ?? promotions.find(p => p.active)!
)

// Plato estrella: el primer popular con foto
const star = computed(() => menu.popular.find(m => m.photo) ?? menu.popular[0])

const fmt = (p: number | null) => p == null ? '' : `$${p.toFixed(2)}`
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
        <article class="card group flex flex-col bg-gradient-to-br from-brand to-brand-dark text-white !shadow-elev">
          <div class="p-6 flex-1 flex flex-col">
            <span class="text-xs font-bold uppercase tracking-widest text-white/80 mb-3 inline-flex items-center gap-1.5">
              <Icon name="Gift" :size="14" />
              <span>{{ t('home.today.promoLabel') }}</span>
            </span>
            <h3 class="display-serif text-2xl md:text-3xl mb-3 leading-tight text-white">{{ tt(todayPromo.title) }}</h3>
            <p class="text-white/90 text-sm mb-6 flex-1">{{ tt(todayPromo.description) }}</p>
            <RouterLink v-if="todayPromo.cta" :to="todayPromo.cta.href" class="btn-light !py-2.5 self-start inline-flex items-center gap-2">
              <span>{{ tt(todayPromo.cta.label) }}</span>
              <Icon name="ArrowRight" :size="16" />
            </RouterLink>
          </div>
        </article>

        <!-- Plato estrella -->
        <article v-if="star" class="card group overflow-hidden">
          <div class="aspect-[4/3] overflow-hidden bg-sand-200">
            <img v-if="star.photo" :src="star.photo.replace('.webp', '.jpg')" :alt="tt(star.name)"
                 class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
          </div>
          <div class="p-5">
            <span class="text-xs font-bold uppercase tracking-widest text-accent mb-2 inline-flex items-center gap-1.5">
              <Icon name="Star1" type="Bold" :size="14" />
              <span>{{ t('home.today.starLabel') }}</span>
            </span>
            <h3 class="display-serif text-xl text-secondary-dark mb-1">{{ tt(star.name) }}</h3>
            <div class="flex items-center justify-between mt-3">
              <span class="text-2xl font-extrabold text-brand">{{ fmt(star.price) }}</span>
              <RouterLink to="/menu" class="text-secondary font-bold text-sm hover:text-brand">
                {{ t('cta.viewMenu') }} →
              </RouterLink>
            </div>
          </div>
        </article>

        <!-- Reserva express -->
        <article class="card overflow-hidden bg-secondary-dark text-white">
          <div class="aspect-[16/9] relative overflow-hidden">
            <img src="/assets/hero/cotati-interior.jpg" alt="" class="w-full h-full object-cover opacity-60" loading="lazy" />
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
