<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const site = useSiteStore()

// Día actual (0=dom, 1=lun … 6=sab)
const today = new Date().getDay()

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAYS_FULL_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DAYS_FULL_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function dayShort(d: number) { return locale.value === 'es' ? DAYS_ES[d] : DAYS_EN[d] }
function dayFull(d: number) { return locale.value === 'es' ? DAYS_FULL_ES[d] : DAYS_FULL_EN[d] }

// Fecha de los 7 días de la semana actual (dom→sab)
const weekDates = computed(() => {
  const now = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() - now.getDay() + i)
    return d.getDate()
  })
})

// Intenta extraer el día de la semana de un promo (fallback desde el ID)
const ID_DAY: Record<string, number> = {
  'taco-tuesday': 2,
  'burrito-thursday': 4,
}
function promoDay(p: typeof site.promotions[0]): number | null {
  if (p.dayOfWeek != null) return p.dayOfWeek
  for (const [key, val] of Object.entries(ID_DAY)) {
    if (p.id === key || p.id.includes(key)) return val
  }
  return null
}

const isActiveToday = (p: typeof site.promotions[0]) => {
  if (!p.active) return false
  const day = promoDay(p)
  return p.recurrence === 'one_time' || day === today
}

// Extrae el precio de la descripción: "$10", "$9", etc.
function extractPrice(desc: string): string | null {
  const m = desc.match(/\$\d+(\.\d+)?/)
  return m ? m[0] : null
}

const txt = (o: { es: string; en: string }) => locale.value === 'es' ? o.es : o.en

const activeToday = computed(() => site.promotions.filter(p => isActiveToday(p)))
const others = computed(() => site.promotions.filter(p => !isActiveToday(p) && p.active))

// Paleta por promo
const COLORS: Record<string, { bg: string; border: string; badge: string; icon: string; iconName: string; headerFrom: string; headerTo: string }> = {
  'burrito-thursday': {
    bg: 'from-orange-50 to-amber-50/30',
    border: 'border-brand/20',
    badge: 'bg-brand text-white',
    icon: 'text-white',
    iconName: 'Bag2',
    headerFrom: '#C8501C',
    headerTo: '#3D1A08',
  },
  'taco-tuesday': {
    bg: 'from-amber-50 to-yellow-50/30',
    border: 'border-accent/30',
    badge: 'bg-accent text-night',
    icon: 'text-white',
    iconName: 'MenuBoard',
    headerFrom: '#F09828',
    headerTo: '#8A5A38',
  },
  'newsletter-5off': {
    bg: 'from-stone-50 to-sand-50',
    border: 'border-secondary/20',
    badge: 'bg-secondary text-white',
    icon: 'text-white',
    iconName: 'Sms',
    headerFrom: '#8A5A38',
    headerTo: '#3D1A08',
  },
}
function colors(id: string) {
  return COLORS[id] ?? {
    bg: 'from-sand-100 to-sand-50',
    border: 'border-sand-200',
    badge: 'bg-secondary text-white',
    icon: 'text-white',
    iconName: 'Tag',
    headerFrom: '#8A5A38',
    headerTo: '#3D1A08',
  }
}
</script>

<template>
  <main>

    <!-- ═══════════════════════ HERO ═══════════════════════ -->
    <header class="relative overflow-hidden bg-night text-white">
      <!-- Dot grid pattern -->
      <div class="absolute inset-0 opacity-40"
        style="background-image: radial-gradient(circle, rgba(240,152,40,0.25) 1.5px, transparent 1.5px); background-size: 28px 28px;"></div>
      <!-- Color glow blobs -->
      <div class="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-brand/30 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-16 -left-12 w-56 h-56 rounded-full bg-accent/20 blur-2xl pointer-events-none"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-night/40 via-transparent to-night/70"></div>

      <div class="relative z-10 container-page py-16 md:py-24 text-center">
        <!-- Kicker -->
        <p class="section-kicker mb-4 !text-accent justify-center">
          <Icon name="Tag" :size="13" class="mr-1.5" />{{ t('promos.kicker') }}
        </p>
        <!-- Title -->
        <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tight">
          {{ t('promos.title') }}
        </h1>
        <!-- Sub -->
        <p class="text-sand-300 mt-4 text-base md:text-lg max-w-md mx-auto leading-relaxed">
          {{ t('promos.sub') }}
        </p>
        <!-- Live deal count -->
        <div class="mt-8 inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span v-if="activeToday.length">
            {{ activeToday.length }} {{ activeToday.length === 1 ? (locale === 'es' ? 'promoción activa hoy' : 'active deal today') : (locale === 'es' ? 'promociones activas hoy' : 'active deals today') }}
          </span>
          <span v-else>{{ locale === 'es' ? 'Revisa nuestras próximas ofertas' : 'Check upcoming deals' }}</span>
        </div>
      </div>

      <!-- Curved bottom edge -->
      <div class="relative h-10 -mb-1">
        <svg viewBox="0 0 1440 40" preserveAspectRatio="none" class="absolute inset-0 w-full h-full" fill="#F9F5EE">
          <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z"/>
        </svg>
      </div>
    </header>

    <div class="container-page py-12 space-y-16">

      <!-- ═══════════════════════ ACTIVAS HOY ═══════════════════════ -->
      <section v-if="activeToday.length">
        <!-- Section header -->
        <div class="flex items-center gap-4 mb-8">
          <div class="flex items-center gap-2 shrink-0">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span class="font-bold text-sm md:text-base text-ink uppercase tracking-widest">{{ t('promos.activeToday') }}</span>
          </div>
          <div class="h-px flex-1 bg-gradient-to-r from-sand-300 to-transparent"></div>
        </div>

        <!-- Cards grid -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="p in activeToday" :key="p.id"
            class="group relative rounded-3xl border overflow-hidden flex flex-col shadow-soft hover:shadow-elev hover:-translate-y-1.5 transition-all duration-300"
            :class="colors(p.id).border"
          >
            <!-- Card header -->
            <div class="relative h-52 shrink-0 overflow-hidden">
              <img v-if="p.photo" :src="p.photo" :alt="txt(p.title)"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />

              <!-- Gradient placeholder when no photo -->
              <div v-else class="relative w-full h-full flex items-center justify-center"
                :style="{ background: `linear-gradient(145deg, ${colors(p.id).headerFrom} 0%, ${colors(p.id).headerTo} 100%)` }">
                <!-- Large decorative background icon -->
                <Icon :name="colors(p.id).iconName" :size="160" type="Bold"
                  class="absolute opacity-[0.07] text-white -right-6 -bottom-4 rotate-[-12deg]" />
                <!-- Main icon in glass card -->
                <div class="relative z-10 w-24 h-24 rounded-[22px] bg-white/15 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/25 shadow-2xl group-hover:scale-105 group-hover:ring-white/40 transition-all duration-300">
                  <Icon :name="colors(p.id).iconName" :size="48" type="Bold" class="text-white drop-shadow-lg" />
                </div>
              </div>

              <!-- Gradient scrim for badge readability -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

              <!-- Bottom badges -->
              <div class="absolute bottom-3.5 left-3.5 right-3.5 flex items-end justify-between gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-lg"
                  :class="colors(p.id).badge">
                  <Icon name="Calendar1" :size="11" type="Bold" />
                  {{ promoDay(p) != null ? dayFull(promoDay(p)!) : (locale === 'es' ? 'Especial' : 'Special') }}
                </span>
                <span class="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-green-500 px-3 py-1.5 rounded-full shadow-lg">
                  <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {{ t('promos.today') }}
                </span>
              </div>

              <!-- Floating price badge -->
              <div v-if="extractPrice(txt(p.description))"
                class="absolute top-3.5 right-3.5 bg-white text-night font-display font-black text-2xl leading-none px-3.5 py-2.5 rounded-2xl shadow-xl ring-1 ring-black/5">
                {{ extractPrice(txt(p.description)) }}
              </div>
            </div>

            <!-- Card body -->
            <div class="p-6 flex flex-col gap-4 flex-1 bg-gradient-to-br" :class="colors(p.id).bg">
              <div>
                <h2 class="font-display text-xl font-bold text-night leading-tight">{{ txt(p.title) }}</h2>
                <p class="text-sm text-ink-muted mt-2 leading-relaxed">{{ txt(p.description) }}</p>
              </div>

              <!-- Location chips -->
              <div v-if="p.validAt?.length" class="flex flex-wrap gap-1.5">
                <span v-for="loc in p.validAt" :key="loc"
                  class="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-sand-200 text-secondary capitalize">
                  {{ loc.replace(/-/g, ' ') }}
                </span>
              </div>
              <p v-else class="text-[11px] text-ink-muted inline-flex items-center gap-1.5">
                <Icon name="Location" :size="11" />{{ t('promos.allLocations') }}
              </p>

              <!-- CTA -->
              <a v-if="p.cta" :href="p.cta.href"
                class="mt-auto btn-primary text-sm py-3 inline-flex items-center justify-center gap-2 w-full rounded-2xl">
                {{ txt(p.cta.label) }}
                <Icon name="ArrowRight2" :size="14" type="Bold" />
              </a>
            </div>
          </article>
        </div>
      </section>

      <!-- ═══════════════════════ PRÓXIMAS ═══════════════════════ -->
      <section v-if="others.length">
        <div class="flex items-center gap-4 mb-8">
          <h2 class="text-sm font-bold uppercase tracking-widest text-ink-muted shrink-0">{{ t('promos.upcoming') }}</h2>
          <div class="h-px flex-1 bg-gradient-to-r from-sand-300 to-transparent"></div>
        </div>
        <div class="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="p in others" :key="p.id"
            class="group relative rounded-3xl border bg-white overflow-hidden flex flex-col shadow-soft hover:shadow-elev hover:-translate-y-1 transition-all duration-200"
          >
            <div class="relative h-44 shrink-0 overflow-hidden">
              <img v-if="p.photo" :src="p.photo" :alt="txt(p.title)"
                class="w-full h-full object-cover grayscale-[20%]" loading="lazy" />
              <div v-else class="relative w-full h-full flex items-center justify-center"
                :style="{ background: `linear-gradient(145deg, ${colors(p.id).headerFrom}bb, ${colors(p.id).headerTo})` }">
                <Icon :name="colors(p.id).iconName" :size="120" type="Bold" class="absolute opacity-[0.07] text-white -right-4 -bottom-3" />
                <div class="w-18 h-18 rounded-2xl bg-white/15 flex items-center justify-center ring-2 ring-white/20 relative z-10">
                  <Icon :name="colors(p.id).iconName" :size="38" type="Bold" class="text-white" />
                </div>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div class="absolute bottom-3 left-3 flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow"
                  :class="colors(p.id).badge">
                  <Icon name="Calendar1" :size="11" type="Bold" />
                  {{ promoDay(p) != null ? dayFull(promoDay(p)!) : (locale === 'es' ? 'Especial' : 'Special') }}
                </span>
              </div>
              <div v-if="extractPrice(txt(p.description))"
                class="absolute top-3 right-3 bg-white text-night font-display font-black text-xl leading-none px-3 py-2 rounded-xl shadow-lg">
                {{ extractPrice(txt(p.description)) }}
              </div>
            </div>
            <div class="p-5 flex flex-col gap-3 flex-1">
              <div>
                <h3 class="font-display text-xl font-bold text-night leading-tight">{{ txt(p.title) }}</h3>
                <p class="text-sm text-ink-muted mt-1.5 leading-relaxed">{{ txt(p.description) }}</p>
              </div>
              <p v-if="!p.validAt?.length" class="text-[11px] text-ink-muted inline-flex items-center gap-1.5">
                <Icon name="Location" :size="11" />{{ t('promos.allLocations') }}
              </p>
              <a v-if="p.cta" :href="p.cta.href"
                class="mt-auto btn-outline text-sm py-2.5 inline-flex items-center justify-center gap-2 w-full rounded-2xl">
                {{ txt(p.cta.label) }}<Icon name="ArrowRight2" :size="14" />
              </a>
            </div>
          </article>
        </div>
      </section>

      <!-- ═══════════════════════ CALENDARIO SEMANAL ═══════════════════════ -->
      <section class="rounded-3xl overflow-hidden border border-night/10 shadow-elev">
        <!-- Header bar -->
        <div class="bg-night px-6 py-5 flex items-center justify-between">
          <div>
            <p class="text-accent text-xs font-bold uppercase tracking-widest mb-0.5">{{ locale === 'es' ? 'Especiales' : 'Weekly deals' }}</p>
            <h2 class="font-display text-xl font-bold text-white">{{ t('promos.weeklyTitle') }}</h2>
          </div>
          <div class="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-1.5">
            <Icon name="Calendar" :size="14" class="text-accent" />
            <span class="text-xs font-semibold text-sand-300">
              {{ new Date().toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US', { month: 'long', year: 'numeric' }) }}
            </span>
          </div>
        </div>

        <!-- Day columns -->
        <div class="bg-sand-50 grid grid-cols-7 divide-x divide-sand-200">
          <div
            v-for="(_, i) in 7" :key="i"
            class="flex flex-col items-center gap-2 py-5 px-1"
            :class="i === today ? 'bg-brand/5' : ''"
          >
            <!-- Day name -->
            <span class="text-[10px] md:text-xs font-bold uppercase tracking-wider"
              :class="i === today ? 'text-brand' : 'text-ink-muted'">
              {{ dayShort(i) }}
            </span>

            <!-- Date number -->
            <div class="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
              :class="i === today
                ? 'bg-brand text-white shadow-md shadow-brand/40 ring-2 ring-brand/30 ring-offset-1 ring-offset-sand-50'
                : 'text-ink bg-white border border-sand-200'">
              {{ weekDates[i] }}
            </div>

            <!-- Promo slot(s) -->
            <div class="flex flex-col items-center gap-1.5 mt-0.5 w-full px-1">
              <template v-for="p in site.promotions.filter(pr => promoDay(pr) === i)" :key="p.id">
                <div class="flex flex-col items-center gap-0.5">
                  <div class="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm"
                    :class="colors(p.id).badge">
                    <Icon :name="colors(p.id).iconName" :size="15" type="Bold" />
                  </div>
                  <span class="hidden md:block text-[8px] font-semibold text-center leading-tight text-ink-muted max-w-[52px] truncate">
                    {{ txt(p.title).split(' ').slice(0, 2).join(' ') }}
                  </span>
                </div>
              </template>
              <span v-if="!site.promotions.some(pr => promoDay(pr) === i)" class="text-sand-300 text-xl leading-none mt-0.5">·</span>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div v-if="site.promotions.length" class="bg-white border-t border-sand-200 px-6 py-4 flex flex-wrap gap-4">
          <div v-for="p in site.promotions" :key="p.id" class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" :class="colors(p.id).badge">
              <Icon :name="colors(p.id).iconName" :size="12" type="Bold" />
            </div>
            <span class="text-xs font-semibold text-ink">{{ txt(p.title) }}</span>
          </div>
        </div>
      </section>

    </div>

    <!-- ═══════════════════════ CTA BOTTOM ═══════════════════════ -->
    <div class="bg-gradient-to-r from-brand via-brand to-accent/90 text-white">
      <div class="container-page py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <p class="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
            {{ locale === 'es' ? '¿No quieres perderte nada?' : "Don't miss a deal" }}
          </p>
          <h2 class="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
            {{ locale === 'es' ? 'Síguenos para más ofertas' : 'Follow us for more deals' }}
          </h2>
        </div>
        <div class="flex items-center gap-3 shrink-0">
          <a href="https://www.instagram.com/mipueblocotati/" target="_blank" rel="noopener"
            class="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all">
            <Icon name="Instagram" :size="16" type="Bold" />Instagram
          </a>
          <a href="https://www.facebook.com/mipueblocotati" target="_blank" rel="noopener"
            class="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl transition-all">
            <Icon name="Facebook" :size="16" type="Bold" />Facebook
          </a>
        </div>
      </div>
    </div>

  </main>
</template>