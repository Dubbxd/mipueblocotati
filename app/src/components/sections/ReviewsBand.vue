<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import { api } from '@/lib/api'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const site = useSiteStore()

// ─────────────────────────────────────────────────────────────────────────────
// Google Maps · Mi Pueblo Cotati — URL desde el store si está disponible
// Fallback: CID estático = 5466729018176324884
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_MAPS_URL = 'https://www.google.com/maps?cid=5466729018176324884'
const GOOGLE_MAPS_URL  = computed(() => site.mainRestaurant?.links?.googleMaps ?? FALLBACK_MAPS_URL)
const WRITE_REVIEW_URL = computed(() => `${GOOGLE_MAPS_URL.value}&hl=${locale.value === 'es' ? 'es' : 'en'}`)

// Rating y conteo: del store si ya se sincronizó desde Google; fallback estático
const googleRating = computed(() => site.mainRestaurant?.googleRating      ?? 4.4)
const googleCount  = computed(() => site.mainRestaurant?.googleReviewCount ?? 969)

// ─────────────────────────────────────────────────────────────────────────────
// Reseñas: cargadas desde la API (isFeatured=true, status=approved)
// Fallback a las 3 curadas si la API falla o no hay datos aún.
// ─────────────────────────────────────────────────────────────────────────────
interface Review {
  id: string | number
  author: string
  source: string
  initial: string
  rating: number
  text: { es: string; en: string }
}

const FALLBACK_REVIEWS: Review[] = [
  {
    id: 'r1', author: 'María G.', source: 'Google · Cotati', initial: 'M', rating: 5,
    text: {
      es: 'El mejor mole que he probado fuera de México. La carne asada es jugosa y las margaritas — ¡increíbles! Vinimos en familia y nos atendieron como en casa.',
      en: 'Best mole I have ever had outside of Mexico. The carne asada is juicy and the margaritas — amazing! We came as a family and were treated like home.'
    }
  },
  {
    id: 'r2', author: 'Jonathan R.', source: 'Google · Sonoma County', initial: 'J', rating: 5,
    text: {
      es: 'Vengo cada jueves por el burrito de $10 y nunca me decepciona. Porciones enormes, precios honestos y staff súper amable. Es mi spot favorito de toda la zona.',
      en: 'I come every Thursday for the $10 burrito and it never disappoints. Huge portions, honest prices and super friendly staff. My favorite spot in the area.'
    }
  },
  {
    id: 'r3', author: 'Daniela P.', source: 'Google · Catering', initial: 'D', rating: 5,
    text: {
      es: 'Pedimos el catering para la boda de mi hermana y todos los invitados nos preguntaron de dónde era la comida. Los tacos al pastor — para llorar de felicidad.',
      en: 'We hired their catering for my sister\'s wedding and every guest asked where the food was from. The al pastor tacos — cry-of-joy good.'
    }
  }
]

const reviews = ref<Review[]>(FALLBACK_REVIEWS)

onMounted(async () => {
  try {
    const data = await api('/public/reviews') as any[]
    if (data?.length) {
      reviews.value = data.map(r => ({
        id: r.id,
        author: r.authorName,
        source: `Google · ${r.authorCity ?? 'Sonoma County'}`,
        initial: (r.authorName?.[0] ?? 'G').toUpperCase(),
        rating: r.rating,
        text: { es: r.bodyEs, en: r.bodyEn ?? r.bodyEs },
      }))
    }
  } catch {
    // mantiene el fallback
  }
})

const idx  = ref(0)
const next = () => (idx.value = (idx.value + 1) % reviews.value.length)
const prev = () => (idx.value = (idx.value - 1 + reviews.value.length) % reviews.value.length)

const ratingFmt = computed(() =>
  googleRating.value.toLocaleString(locale.value === 'es' ? 'es-MX' : 'en-US', {
    minimumFractionDigits: 1, maximumFractionDigits: 1,
  })
)
const countFmt = computed(() =>
  googleCount.value.toLocaleString(locale.value === 'es' ? 'es-MX' : 'en-US')
)
</script>

<template>
  <section class="relative bg-brand text-white overflow-hidden py-20 md:py-28">
    <!-- Patrón sutil -->
    <div class="absolute inset-0 bg-fiesta-pattern opacity-[0.06] pointer-events-none"></div>
    <!-- Decoración -->
    <img src="/assets/decor/chile.svg" alt="" aria-hidden="true"
         class="absolute -top-6 left-8 w-24 rotate-12 opacity-70 pointer-events-none select-none" />
    <!-- Limones cayendo (foto real) — esquina superior derecha, contrasta con el rojo -->
    <img src="/assets/decor/lime.png" alt="" aria-hidden="true"
         class="hidden md:block absolute -top-10 -right-8 lg:-right-4 w-56 lg:w-72 -rotate-12 opacity-90 pointer-events-none select-none drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)] floaty" style="--r: -12deg" />
    <!-- Cluster pequeño esquina inferior izquierda para balance -->
    <img src="/assets/decor/lime.png" alt="" aria-hidden="true"
         class="hidden lg:block absolute -bottom-12 -left-10 w-44 rotate-[25deg] opacity-80 pointer-events-none select-none drop-shadow-[0_10px_25px_rgba(0,0,0,0.3)] floaty-2" style="--r: 25deg" />
    <!-- Lime SVG pequeño que ya estaba (mantengo para llenar) -->
    <img src="/assets/decor/lime.svg" alt="" aria-hidden="true"
         class="absolute bottom-8 right-12 w-16 -rotate-12 opacity-50 pointer-events-none hidden md:block" />

    <div class="relative container-page text-center">
      <h2
        class="headline-impact text-4xl md:text-6xl text-white mb-8 max-w-3xl mx-auto drop-shadow"
        v-motion
        :initial="{ opacity: 0, y: 24 }"
        :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
      >
        {{ t('home.reviews.title') }}
      </h2>

      <!-- Aggregate badge Google -->
      <a :href="GOOGLE_MAPS_URL" target="_blank" rel="noopener"
         class="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white text-night px-6 sm:px-8 py-5 rounded-2xl shadow-elev hover:scale-[1.02] transition-transform mb-12 group">
        <!-- Google G logo (oficial multicolor) -->
        <svg viewBox="0 0 24 24" class="w-10 h-10 shrink-0" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
        </svg>

        <div class="text-left">
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-extrabold">{{ ratingFmt }}</span>
            <div class="flex text-accent" aria-hidden="true">
              <Icon v-for="i in 5" :key="i" name="Star1" type="Bold" :size="18" />
            </div>
          </div>
          <p class="text-xs text-ink-muted uppercase tracking-wider mt-1">
            {{ countFmt }} {{ t('home.reviews.googleReviews') }}
          </p>
        </div>

        <span class="hidden sm:inline-flex items-center gap-1.5 ml-2 text-brand font-bold text-sm group-hover:translate-x-1 transition-transform">
          {{ t('home.reviews.viewOnMaps') }}
          <Icon name="ExportSquare" :size="16" />
        </span>
      </a>

      <!-- Desktop grid -->
      <div class="hidden md:grid gap-6 md:grid-cols-3">
        <article v-for="r in reviews" :key="r.id"
                 class="relative bg-sand-50 text-night p-7 pt-9 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-2xl rounded-bl-2xl shadow-elev text-left flex flex-col">
          <span class="absolute -top-5 left-7 bg-accent text-white w-12 h-12 rounded-full grid place-items-center font-display font-black text-lg shadow-lg ring-2 ring-white">{{ r.initial }}</span>
          <p class="font-body text-base leading-relaxed mb-6 text-ink flex-1">{{ r.text[locale as 'es'|'en'] }}</p>
          <div class="border-t border-sand-200 pt-4 flex items-center justify-between">
            <div>
              <p class="font-bold text-night text-sm">{{ r.author }}</p>
              <p class="text-[11px] text-ink-muted uppercase tracking-wider">{{ r.source }}</p>
            </div>
            <!-- Mini Google G en cada card -->
            <svg viewBox="0 0 24 24" class="w-5 h-5 shrink-0 opacity-80" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
            </svg>
          </div>
        </article>
      </div>

      <!-- Mobile carousel -->
      <div class="md:hidden">
        <article class="relative bg-sand-50 text-night p-7 pt-9 rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-2xl rounded-bl-2xl shadow-elev text-left">
          <span class="absolute -top-5 left-7 bg-accent text-white w-12 h-12 rounded-full grid place-items-center font-display font-black text-lg shadow-lg ring-2 ring-white">
            {{ reviews[idx].initial }}
          </span>
          <div class="flex items-center gap-1 text-accent mb-3">
            <Icon v-for="i in reviews[idx].rating" :key="i" name="Star1" type="Bold" :size="16" />
          </div>
          <p class="font-body text-base leading-relaxed mb-6 text-ink">{{ reviews[idx].text[locale as 'es'|'en'] }}</p>
          <div class="border-t border-sand-200 pt-4">
            <p class="font-bold text-night text-sm">{{ reviews[idx].author }}</p>
            <p class="text-[11px] text-ink-muted uppercase tracking-wider">{{ reviews[idx].source }}</p>
          </div>
        </article>
        <div class="flex justify-center items-center gap-3 mt-6">
          <button @click="prev" :aria-label="t('common.prev')"
                  class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur grid place-items-center">
            <Icon name="ArrowLeft2" :size="20" />
          </button>
          <button v-for="(_, i) in reviews" :key="i" @click="idx = i"
                  :class="['h-3 rounded-full self-center transition-all', idx === i ? 'bg-accent w-8' : 'bg-white/40 w-3']"
                  :aria-label="`${t('common.review')} ${i+1}`"></button>
          <button @click="next" :aria-label="t('common.next')"
                  class="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur grid place-items-center">
            <Icon name="ArrowRight2" :size="20" />
          </button>
        </div>
      </div>

      <!-- CTAs -->
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a :href="GOOGLE_MAPS_URL" target="_blank" rel="noopener"
           class="btn-light !py-3 !px-6 inline-flex items-center gap-2">
          <Icon name="Map1" :size="18" />
          <span>{{ t('home.reviews.viewAll') }}</span>
        </a>
        <a :href="WRITE_REVIEW_URL" target="_blank" rel="noopener"
           class="btn-accent !py-3 !px-6 inline-flex items-center gap-2">
          <Icon name="Edit2" :size="18" />
          <span>{{ t('home.reviews.writeReview') }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
