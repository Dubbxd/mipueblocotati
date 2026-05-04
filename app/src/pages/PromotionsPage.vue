<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { promotions } from '@/data/marketing'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()

// Día actual (0=dom, 1=lun … 6=sab)
const today = new Date().getDay()

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_FULL_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DAYS_FULL_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function dayLabel(d: number) {
  return locale.value === 'es' ? DAYS_ES[d] : DAYS_EN[d]
}
function dayFull(d: number) {
  return locale.value === 'es' ? DAYS_FULL_ES[d] : DAYS_FULL_EN[d]
}

const isActiveToday = (p: typeof promotions[0]) =>
  p.active && (p.recurrence === 'one_time' || p.dayOfWeek === today)

// Paleta por promo
const COLORS: Record<string, { bg: string; border: string; badge: string; icon: string; iconName: string }> = {
  'burrito-thursday': {
    bg: 'from-brand/10 to-accent/5',
    border: 'border-brand/20',
    badge: 'bg-brand text-white',
    icon: 'text-brand',
    iconName: 'Bag2',
  },
  'taco-tuesday': {
    bg: 'from-accent/15 to-accent/5',
    border: 'border-accent/30',
    badge: 'bg-accent text-night',
    icon: 'text-accent',
    iconName: 'MenuBoard',
  },
  'newsletter-5off': {
    bg: 'from-secondary/10 to-secondary/5',
    border: 'border-secondary/20',
    badge: 'bg-secondary text-white',
    icon: 'text-secondary',
    iconName: 'Sms',
  },
}
function colors(id: string) {
  return COLORS[id] ?? {
    bg: 'from-sand-100 to-sand-50',
    border: 'border-sand-200',
    badge: 'bg-secondary text-white',
    icon: 'text-secondary',
    iconName: 'Tag',
  }
}

const txt = (o: { es: string; en: string }) => locale.value === 'es' ? o.es : o.en

const activeToday = computed(() => promotions.filter(p => isActiveToday(p)))
const others = computed(() => promotions.filter(p => !isActiveToday(p) && p.active))
</script>

<template>
  <main>
    <!-- Hero -->
    <header class="relative overflow-hidden bg-night text-white">
      <div class="absolute inset-0 bg-[url('/assets/gallery/restaurantmx.jpg')] bg-cover bg-center opacity-20"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-night/80 to-night"></div>
      <div class="relative z-10 container-page py-14 text-center">
        <p class="section-kicker mb-3 !text-accent justify-center">
          <Icon name="Tag" :size="13" class="mr-1" />{{ t('promos.kicker') }}
        </p>
        <h1 class="font-display text-4xl md:text-5xl font-bold text-white">{{ t('promos.title') }}</h1>
        <p class="text-sand-300 mt-3 text-base max-w-md mx-auto">{{ t('promos.sub') }}</p>
      </div>
    </header>

    <div class="container-page py-12 space-y-14">

      <!-- Activas hoy -->
      <section v-if="activeToday.length">
        <div class="flex items-center gap-3 mb-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold shadow">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            {{ t('promos.activeToday') }}
          </span>
          <div class="h-px flex-1 bg-sand-200"></div>
        </div>
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="p in activeToday" :key="p.id"
            class="relative rounded-3xl border overflow-hidden flex flex-col shadow-soft hover:shadow-elev transition-shadow"
            :class="colors(p.id).border"
          >
            <!-- Foto de portada -->
            <div class="relative h-44 bg-sand-200 shrink-0">
              <img v-if="p.photo" :src="p.photo" :alt="txt(p.title)"
                class="w-full h-full object-cover" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-night/70 via-night/20 to-transparent"></div>
              <!-- Badge encima de la foto -->
              <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow"
                  :class="colors(p.id).badge">
                  <Icon name="Calendar" :size="11" type="Bold" />
                  {{ p.dayOfWeek != null ? dayFull(p.dayOfWeek) : t('promos.oneTime') }}
                </span>
                <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-green-500 px-2 py-1 rounded-full shadow">
                  <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {{ t('promos.today') }}
                </span>
              </div>
            </div>

            <!-- Cuerpo -->
            <div class="p-5 flex flex-col gap-3 flex-1 bg-gradient-to-br" :class="colors(p.id).bg">

            <!-- Icono + título -->
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-2xl bg-white/60 flex items-center justify-center shrink-0 shadow-sm">
                <Icon :name="colors(p.id).iconName" :size="28" type="Bold" :class="colors(p.id).icon" />
              </div>
              <div>
                <h2 class="font-display text-xl font-bold text-secondary-dark leading-tight">{{ txt(p.title) }}</h2>
                <p class="text-sm text-ink-muted mt-1 leading-relaxed">{{ txt(p.description) }}</p>
              </div>
            </div>

            <!-- Sucursales -->
            <div v-if="p.validAt?.length" class="flex flex-wrap gap-1.5">
              <span v-for="loc in p.validAt" :key="loc"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 border border-sand-200 text-secondary capitalize">
                {{ loc.replace('-', ' ') }}
              </span>
            </div>
            <p v-else class="text-[11px] text-ink-muted">{{ t('promos.allLocations') }}</p>

            <!-- CTA -->
            <a v-if="p.cta" :href="p.cta.href"
               class="mt-auto btn-primary text-sm py-2.5 inline-flex items-center justify-center gap-2 w-full">
              <Icon name="ArrowRight2" :size="14" type="Bold" />
              {{ txt(p.cta.label) }}
            </a>
            </div><!-- /cuerpo -->
          </article>
        </div>
      </section>

      <!-- Próximas / otras -->
      <section v-if="others.length">
        <div class="flex items-center gap-3 mb-6">
          <h2 class="text-sm font-bold uppercase tracking-widest text-ink-muted">{{ t('promos.upcoming') }}</h2>
          <div class="h-px flex-1 bg-sand-200"></div>
        </div>
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="p in others" :key="p.id"
            class="relative rounded-3xl border bg-white overflow-hidden flex flex-col shadow-soft hover:shadow-elev transition-shadow opacity-80 hover:opacity-100"
          >
            <!-- Foto -->
            <div class="relative h-40 bg-sand-100 shrink-0">
              <img v-if="p.photo" :src="p.photo" :alt="txt(p.title)"
                class="w-full h-full object-cover grayscale-[30%]" loading="lazy" />
              <div class="absolute inset-0 bg-gradient-to-t from-night/50 to-transparent"></div>
              <div class="absolute bottom-3 left-3">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow"
                  :class="colors(p.id).badge">
                  <Icon name="Calendar" :size="11" type="Bold" />
                  {{ p.dayOfWeek != null ? dayFull(p.dayOfWeek) : t('promos.oneTime') }}
                </span>
              </div>
            </div>
            <div class="p-5 flex flex-col gap-3 flex-1">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-2xl bg-sand-100 flex items-center justify-center shrink-0">
                <Icon :name="colors(p.id).iconName" :size="28" type="Bold" :class="colors(p.id).icon" />
              </div>
              <div>
                <h3 class="font-display text-xl font-bold text-secondary-dark leading-tight">{{ txt(p.title) }}</h3>
                <p class="text-sm text-ink-muted mt-1 leading-relaxed">{{ txt(p.description) }}</p>
              </div>
            </div>
            <div v-if="p.validAt?.length" class="flex flex-wrap gap-1.5">
              <span v-for="loc in p.validAt" :key="loc"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sand-100 border border-sand-200 text-secondary capitalize">
                {{ loc.replace('-', ' ') }}
              </span>
            </div>
            <p v-else class="text-[11px] text-ink-muted">{{ t('promos.allLocations') }}</p>
            <a v-if="p.cta" :href="p.cta.href"
               class="mt-auto btn-outline text-sm py-2.5 inline-flex items-center justify-center gap-2 w-full">
              <Icon name="ArrowRight2" :size="14" />
              {{ txt(p.cta.label) }}
            </a>
            </div><!-- /p-5 -->
          </article>
        </div>
      </section>

      <!-- Calendario semanal -->
      <section class="rounded-3xl bg-night text-white p-8">
        <h2 class="font-display text-2xl font-bold mb-6 text-center">{{ t('promos.weeklyTitle') }}</h2>
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(d, i) in (locale === 'es' ? DAYS_ES : DAYS_EN)" :key="i"
            class="flex flex-col items-center gap-2 rounded-2xl py-3 px-1 transition-all"
            :class="i === today ? 'bg-brand/30 ring-2 ring-brand' : 'bg-white/5'"
          >
            <span class="text-[10px] font-bold uppercase tracking-wider"
              :class="i === today ? 'text-accent' : 'text-sand-400'">{{ d }}</span>
            <template v-for="p in promotions.filter(pr => pr.dayOfWeek === i)" :key="p.id">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center"
                :class="colors(p.id).badge">
                <Icon :name="colors(p.id).iconName" :size="15" type="Bold" />
              </div>
            </template>
            <span v-if="!promotions.find(pr => pr.dayOfWeek === i)" class="text-sand-700 text-lg leading-none">·</span>
          </div>
        </div>
      </section>

    </div>
  </main>
</template>
