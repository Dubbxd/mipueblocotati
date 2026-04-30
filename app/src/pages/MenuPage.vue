<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores'
import type { MenuTag } from '@/types/domain'

const { t, locale } = useI18n()
const menu = useMenuStore()

const filters: { id: MenuTag | 'all'; label: string }[] = [
  { id: 'all', label: t('menu.filters.all') },
  { id: 'popular', label: t('menu.tags.popular') },
  { id: 'vegetarian', label: t('menu.filters.vegetarian') },
  { id: 'seafood', label: t('menu.filters.seafood') },
  { id: 'spicy', label: t('menu.filters.spicy') },
  { id: 'kids', label: t('menu.filters.kids') }
]

const fmt = (p: number | null) => p == null ? '—' : `$${p.toFixed(2)}`
const groups = computed(() => menu.grouped)
</script>

<template>
  <main class="pt-6">
    <header class="container-page py-8 text-center">
      <h1 class="font-display text-4xl md:text-6xl font-bold text-secondary-dark">{{ t('menu.title') }}</h1>
      <p class="text-ink-muted mt-2">{{ t('menu.sub') }}</p>
    </header>

    <div class="sticky top-16 md:top-20 z-20 bg-sand-100/95 backdrop-blur border-y border-sand-200 shadow-soft">
      <div class="container-page py-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <input v-model="menu.search" :placeholder="t('menu.search')" type="search" inputmode="search" autocomplete="off"
          class="w-full sm:flex-1 sm:min-w-[200px] px-3 py-2.5 rounded-md border border-sand-300 bg-white text-sm" />
        <div class="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
          <div class="flex gap-2 w-max sm:w-auto sm:flex-wrap">
            <button v-for="f in filters" :key="f.id"
              @click="menu.activeTag = f.id"
              class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border transition-colors min-h-[36px]"
              :class="menu.activeTag === f.id ? 'bg-brand text-white border-brand' : 'border-secondary/30 text-secondary hover:border-brand hover:text-brand bg-white'"
            >{{ f.label }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="container-page py-10">
      <p v-if="!groups.length" class="text-center text-ink-muted py-10">{{ t('menu.noResults') }}</p>

      <section v-for="g in groups" :key="g.category.id" :id="g.category.id" class="mb-12 scroll-mt-32">
        <h2 class="font-display text-2xl md:text-3xl font-bold text-brand border-b-2 border-sand-200 pb-2 mb-5">
          {{ locale === 'es' ? g.category.name.es : g.category.name.en }}
        </h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <article v-for="m in g.items" :key="m.id" class="card p-4 flex gap-3">
            <div v-if="m.photo" class="w-24 h-24 rounded-lg bg-sand-200 overflow-hidden flex-shrink-0">
              <img :src="m.photo.replace('.webp', '.jpg')" :alt="locale === 'es' ? m.name.es : m.name.en"
                   class="w-full h-full object-cover" loading="lazy" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-2">
                <h3 class="font-display font-bold text-secondary-dark leading-tight">{{ locale === 'es' ? m.name.es : m.name.en }}</h3>
                <span class="text-brand font-bold whitespace-nowrap">{{ fmt(m.price) }}</span>
              </div>
              <p v-if="m.description" class="text-xs text-ink-muted mt-1 line-clamp-2">
                {{ locale === 'es' ? m.description.es : m.description.en }}
              </p>
              <div v-if="m.tags.length" class="flex flex-wrap gap-1 mt-2">
                <span v-for="tg in m.tags" :key="tg"
                  class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-sand-200 text-secondary">{{ t(`menu.tags.${tg}`) }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
