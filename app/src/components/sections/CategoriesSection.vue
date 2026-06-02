<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const menu = useMenuStore()

interface CatCard {
  id: string
  slug: string
  photo: string
  bestSeller?: boolean
  rotation: string
}

const cards: CatCard[] = [
  { id: 'burritos',    slug: 'burritos',    photo: '/assets/gallery/burrito-served.jpg',           bestSeller: true,  rotation: '-rotate-2' },
  { id: 'tacos',       slug: 'tacos',       photo: '/assets/gallery/quesa-birria-taco-closeup.jpg', rotation: 'rotate-1' },
  { id: 'specialties', slug: 'specialties', photo: '/assets/gallery/chile-relleno.jpg',            rotation: '-rotate-1' },
  { id: 'meats',       slug: 'meats',       photo: '/assets/gallery/molcajete-bowl.jpg',           bestSeller: true, rotation: 'rotate-2' },
  { id: 'seafood',     slug: 'seafood',     photo: '/assets/gallery/camarones-con-steak.jpg',      rotation: '-rotate-2' },
  { id: 'appetizers',  slug: 'appetizers',  photo: '/assets/gallery/super-nachos.jpg',             rotation: 'rotate-1' }
]

const labels = computed<Record<string, { es: string; en: string }>>(() => ({
  burritos:    { es: 'Burritos',          en: 'Burritos' },
  tacos:       { es: 'Tacos',             en: 'Tacos' },
  specialties: { es: 'Especialidades',    en: 'Specialties' },
  meats:       { es: 'Carnes & Fajitas',  en: 'Meats & Fajitas' },
  seafood:     { es: 'Mariscos',          en: 'Seafood' },
  appetizers:  { es: 'Antojitos',         en: 'Starters' }
}))

const label = (id: string) => labels.value[id]?.[locale.value as 'es'|'en'] ?? id
</script>

<template>
  <section class="relative section-dark overflow-hidden pt-20 md:pt-28 pb-24 md:pb-32">
    <!-- Patrón fiesta de fondo -->
    <div class="absolute inset-0 bg-fiesta-pattern opacity-[0.08] pointer-events-none"></div>
    <div class="absolute inset-0 bg-gradient-to-b from-night via-transparent to-night pointer-events-none"></div>

    <!-- Cascada de cebollas (izquierda, sobre fondo oscuro brilla) -->
    <img src="/assets/decor/cebollas.png" alt="" aria-hidden="true"
         class="hidden xl:block absolute -left-20 top-10 h-[90%] max-h-[680px] w-auto opacity-25 -rotate-12 pointer-events-none select-none z-0" />
    <!-- Cascada de tomate (derecha) -->
    <img src="/assets/decor/tomate.png" alt="" aria-hidden="true"
         class="hidden xl:block absolute -right-24 bottom-10 h-[85%] max-h-[640px] w-auto opacity-25 rotate-12 pointer-events-none select-none z-0" />

    <div class="relative container-page z-10">
      <div
        class="text-center max-w-3xl mx-auto"
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      >
        <p class="section-kicker !text-accent inline-flex items-center justify-center gap-2">
          <Icon name="MenuBoard" :size="14" />
          <span>{{ t('home.categories.kicker') }}</span>
        </p>
        <h2 class="headline-impact text-5xl md:text-7xl text-white mb-4">{{ t('home.categories.title') }}</h2>
        <p class="section-sub !text-sand-200 mx-auto">{{ t('home.categories.sub') }}</p>
      </div>

      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="c in cards" :key="c.id"
          :to="`/menu#${c.slug}`"
          class="group relative block bg-sand-50 text-night overflow-hidden rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-2xl rounded-bl-2xl shadow-elev hover:scale-[1.03] hover:-translate-y-1 transition-all duration-300"
        >
          <div class="aspect-[4/3] overflow-hidden">
            <img :src="c.photo" :alt="label(c.id)"
                 :class="['w-full h-full object-cover group-hover:scale-110 transition-transform duration-700', c.rotation]"
                 loading="lazy" />
          </div>
          <div class="p-5 flex items-center justify-between">
            <h3 class="headline-impact text-2xl md:text-3xl text-brand">{{ label(c.id) }}</h3>
            <span class="text-accent group-hover:translate-x-1 transition-transform">
              <Icon name="ArrowRight" :size="24" />
            </span>
          </div>

          <span v-if="c.bestSeller"
                class="absolute top-4 right-4 bg-accent text-white font-impact uppercase text-xs tracking-wider px-3 py-1.5 rounded-full -rotate-6 shadow-lg ring-2 ring-white inline-flex items-center gap-1">
            <Icon name="Star1" type="Bold" :size="12" />
            <span>{{ t('home.categories.bestSeller') }}</span>
          </span>
        </RouterLink>
      </div>

      <!-- CTA bottom block: más presencia para no quedar solitario -->
      <div class="relative mt-16 md:mt-20">
        <div class="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-transparent via-night-light to-transparent" aria-hidden="true"></div>
        <div class="relative mx-auto max-w-3xl text-center bg-night-soft/60 backdrop-blur-sm border border-night-light rounded-3xl px-6 py-10 md:px-12 md:py-12 shadow-elev">
          <p class="font-script text-accent-light text-2xl md:text-3xl mb-2">{{ t('home.menuPreview.title') }}</p>
          <h3 class="headline-impact text-3xl md:text-5xl text-white mb-3">
            {{ menu.all.length }}+ {{ t('menu.dishes') }}
          </h3>
          <p class="text-sand-200 text-sm md:text-base mb-6 max-w-xl mx-auto">{{ t('menu.sub') }}</p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
            <RouterLink to="/menu" class="btn-accent !px-8 !py-4 !text-base inline-flex items-center gap-2">
              <span>{{ t('home.categories.viewMenu') }}</span>
              <Icon name="ArrowRight" :size="18" />
            </RouterLink>
            <RouterLink to="/reservar" class="btn-outline !border-sand-200 !text-sand-100 hover:!bg-sand-100 hover:!text-night !px-8 !py-4 !text-base inline-flex items-center gap-2">
              <Icon name="Calendar" :size="18" />
              <span>{{ t('cta.reserve') }}</span>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
