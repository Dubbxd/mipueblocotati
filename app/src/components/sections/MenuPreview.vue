<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'
import { dishPhoto } from '@/data/categoryPhotos'

const { t, locale } = useI18n()
const menu = useMenuStore()
// Hasta 10 platillos populares — usan su foto propia o una de respaldo por categoría
const featured = computed(() => menu.popular.slice(0, 10))
const fmt = (p: number | null) => p == null ? '—' : `$${p.toFixed(2)}`

const scroller = ref<HTMLElement | null>(null)
const scrollBy = (dir: 1 | -1) => {
  if (!scroller.value) return
  scroller.value.scrollBy({ left: dir * scroller.value.clientWidth * 0.8, behavior: 'smooth' })
}
</script>

<template>
  <section class="section bg-sand-100 relative overflow-hidden">
    <!-- Decoración de fondo: papel picado tenue -->
    <div class="papel-strip absolute top-0 inset-x-0 opacity-25 pointer-events-none"></div>

    <!-- Cascada de tomate (izquierda) -->
    <img src="/assets/decor/tomate.png" alt="" aria-hidden="true"
         class="hidden lg:block absolute -left-16 top-1/2 -translate-y-1/2 h-[110%] max-h-[720px] w-auto opacity-25 -rotate-6 pointer-events-none select-none z-0" />
    <!-- Cascada de cebollas (derecha) -->
    <img src="/assets/decor/cebollas.png" alt="" aria-hidden="true"
         class="hidden lg:block absolute -right-20 top-1/2 -translate-y-1/2 h-[110%] max-h-[720px] w-auto opacity-30 rotate-6 pointer-events-none select-none z-0" />

    <div class="container-page relative z-10">
      <p class="section-kicker">{{ t('home.carousel.kicker') }}</p>
      <h2 class="section-header">{{ t('home.carousel.title') }}</h2>
      <p class="section-sub">{{ t('home.carousel.sub') }}</p>

      <div class="relative">
        <!-- Botones nav (desktop) -->
        <button @click="scrollBy(-1)"
                class="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-elev items-center justify-center text-brand hover:bg-brand hover:text-white transition"
                aria-label="Anterior">
          <Icon name="ArrowLeft2" :size="22" />
        </button>
        <button @click="scrollBy(1)"
                class="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-white shadow-elev items-center justify-center text-brand hover:bg-brand hover:text-white transition"
                aria-label="Siguiente">
          <Icon name="ArrowRight2" :size="22" />
        </button>

        <!-- Scroller horizontal con snap -->
        <div ref="scroller"
             class="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <RouterLink v-for="m in featured" :key="m.id" :to="`/menu#${m.categoryId}`"
                      class="card group shrink-0 w-[78%] sm:w-[46%] md:w-[31%] lg:w-[23%] snap-start">
            <div class="aspect-[3/4] bg-sand-200 overflow-hidden relative">
              <img :src="dishPhoto(m)" :alt="locale === 'es' ? m.name.es : m.name.en"
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                   loading="lazy" />
              <div class="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
              <span class="absolute top-3 left-3 bg-brand text-white text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-soft inline-flex items-center gap-1">
                <Icon name="Star1" type="Bold" :size="10" />
                <span>{{ t('menu.tags.popular') }}</span>
              </span>
              <div class="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 class="display-serif text-lg leading-tight mb-1 line-clamp-2 text-white drop-shadow-md">{{ locale === 'es' ? m.name.es : m.name.en }}</h3>
                <div class="flex items-end justify-between">
                  <span class="text-2xl font-extrabold text-accent-light drop-shadow">{{ fmt(m.price) }}</span>
                  <span class="text-xs uppercase tracking-wider opacity-90 inline-flex items-center gap-1">{{ t('menu.viewShort') }} <Icon name="ArrowRight" :size="12" /></span>
                </div>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="text-center mt-10">
        <RouterLink to="/menu" class="btn-primary !text-base !px-8 !py-3.5">{{ t('cta.viewMenu') }} ({{ menu.all.length }} {{ t('menu.dishes') }})</RouterLink>
      </div>
    </div>
  </section>
</template>
