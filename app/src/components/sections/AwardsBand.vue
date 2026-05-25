<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { awards } from '@/data/marketing'
import Icon from '@/components/ui/Icon.vue'
const { t, locale } = useI18n()

// Metadatos de display (año + fuente) por id de award
const meta: Record<string, { year: string; source: string }> = {
  a1: { year: '2023', source: 'Press Democrat' },
  a2: { year: '2022', source: 'Press Democrat' },
  a3: { year: '2023', source: 'Restaurant Guru' },
  a4: { year: '2023', source: 'Restaurant Guru' },
  a5: { year: '2023', source: 'RestaurantJi' }
}

const trust = [
  { icon: 'Calendar',  value: '28+', label: { es: 'Años', en: 'Years' } },
  { icon: 'Star1',     value: '4.7', label: { es: 'Google', en: 'Google' } },
  { icon: 'Location',  value: '6',   label: { es: 'Sucursales', en: 'Locations' } },
  { icon: 'Award',     value: '5',   label: { es: 'Premios', en: 'Awards' } }
]
</script>

<template>
  <section class="section relative bg-gradient-to-b from-sand-100 via-sand-50 to-sand-100 border-y border-sand-200 overflow-hidden">
    <!-- Decoración sutil -->
    <div class="absolute inset-0 bg-fiesta-pattern opacity-[0.04] pointer-events-none"></div>
    <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60"></div>

    <div class="relative container-page">
      <!-- HEADER -->
      <div class="text-center max-w-3xl mx-auto mb-12">
        <p class="section-kicker inline-flex items-center justify-center gap-2">
          <Icon name="Award" :size="14" />
          <span>{{ t('home.awards.kicker') }}</span>
        </p>
        <h2 class="section-header !mb-4">{{ t('home.awards.title') }}</h2>
        <p class="section-sub mx-auto !mb-0">
          {{ locale === 'es'
            ? 'Reconocidos por la prensa, los críticos y — sobre todo — por nuestros clientes desde 1997.'
            : 'Recognized by the press, critics and — most importantly — our guests since 1997.' }}
        </p>
      </div>

      <!-- TRUST STRIP -->
      <div class="max-w-4xl mx-auto mb-14 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div v-for="m in trust" :key="m.icon"
             class="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-sm ring-1 ring-sand-200">
          <span class="grid place-items-center w-10 h-10 rounded-xl bg-accent/10 text-accent shrink-0">
            <Icon :name="m.icon" type="Bold" :size="20" />
          </span>
          <span class="leading-tight">
            <span class="block font-display font-extrabold text-2xl text-secondary-dark">{{ m.value }}</span>
            <span class="block text-[10px] uppercase tracking-widest text-ink-muted">{{ m.label[locale as 'es'|'en'] }}</span>
          </span>
        </div>
      </div>

      <!-- AWARDS GRID -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6">
        <article v-for="a in awards" :key="a.id"
          class="group relative bg-white rounded-2xl ring-1 ring-sand-200 hover:ring-accent/40 hover:shadow-elev hover:-translate-y-1 transition-all duration-300 px-4 pt-8 pb-5 flex flex-col items-center text-center">
          <!-- Ribbon de año -->
          <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-impact uppercase tracking-widest px-3 py-1 rounded-full shadow-md ring-2 ring-white">
            {{ meta[a.id]?.year }}
          </span>

          <div class="h-44 md:h-48 w-full grid place-items-center mb-4 px-2 rounded-xl bg-sand-50/60">
            <img :src="a.badge" :alt="locale === 'es' ? a.title.es : a.title.en"
                 class="max-h-full max-w-full w-auto object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_2px_10px_rgba(0,0,0,0.12)]"
                 loading="lazy" />
          </div>

          <p class="mt-auto pt-3 border-t border-sand-200 w-full text-[10px] uppercase tracking-widest text-ink-muted">
            {{ meta[a.id]?.source }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
