<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const menu = useMenuStore()

const featured = computed(() => menu.popular.slice(0, 8))
const fmt = (p: number | null) => p == null ? '' : `$${p.toFixed(2)}`

const categoryName = (catId: string) => {
  const cat = menu.categories.find(c => c.id === catId)
  if (!cat) return ''
  return locale.value === 'es' ? cat.name.es : cat.name.en
}
</script>

<template>
  <section class="section bg-sand-100 relative overflow-hidden">
    <div class="container-page relative z-10">
      <p class="section-kicker">{{ t('home.carousel.kicker') }}</p>
      <h2 class="section-header">{{ t('home.carousel.title') }}</h2>
      <p class="section-sub">{{ t('home.carousel.sub') }}</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
        <RouterLink
          v-for="m in featured" :key="m.id"
          :to="`/menu#${m.categoryId}`"
          class="group bg-white rounded-2xl border border-sand-200 p-5 hover:border-brand/40 hover:shadow-lg transition-all duration-300"
        >
          <div class="flex items-start justify-between gap-3 mb-3">
            <span class="inline-flex items-center gap-1 bg-brand/10 text-brand text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full">
              <Icon name="Star1" type="Bold" :size="10" />
              {{ t('menu.tags.popular') }}
            </span>
            <Icon name="ArrowRight" :size="14" class="text-sand-400 group-hover:text-brand group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
          </div>
          <h3 class="font-display text-base font-bold text-secondary-dark leading-snug mb-1 group-hover:text-brand transition-colors line-clamp-2">
            {{ locale === 'es' ? m.name.es : m.name.en }}
          </h3>
          <p class="text-xs text-ink-muted mb-3">{{ categoryName(m.categoryId) }}</p>
          <p v-if="m.price" class="text-xl font-extrabold text-brand">{{ fmt(m.price) }}</p>
        </RouterLink>
      </div>

      <div class="text-center mt-10">
        <RouterLink to="/menu" class="btn-primary !text-base !px-8 !py-3.5">
          {{ t('cta.viewMenu') }} ({{ menu.all.length }} {{ t('menu.dishes') }})
        </RouterLink>
      </div>
    </div>
  </section>
</template>
