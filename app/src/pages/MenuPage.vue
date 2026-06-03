<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, onActivated, onDeactivated, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'
import type { MenuTag } from '@/types/domain'

defineOptions({ name: 'MenuPage' })

const { t } = useI18n()
const menu = useMenuStore()
onMounted(() => menu.init())

// ── Notas de categoría (tal como aparecen en el menú físico) ────
const CAT_NOTES: Record<string, string> = {
  'small-combos':   'Served with rice & refried beans.',
  'large-combos':   'Served with rice & refried beans.',
  'seafood-combos': 'Additional charge for seafood.',
  'burritos':       'Choice of tortilla: spinach, flour, sun-dried tomato, or wheat.',
  'meats':          'Served with rice & refried beans.',
}
const catNote = (slug: string) => CAT_NOTES[slug] ?? null

// ── Iconos por categoría ─────────────────────────────────────────
const CAT_ICONS: Record<string, string> = {
  'appetizers':     'Cake',
  'sides':          'Add',
  'a-la-carte':     'Note',
  'healthy':        'Heart',
  'specialties':    'Crown',
  'soups':          'Cup',
  'tacos':          'MenuBoard',
  'burritos':       'Bag2',
  'small-combos':   'Tag',
  'large-combos':   'Award',
  'seafood-combos': 'Drop',
  'meats':          'Flash',
  'seafood':        'Filter',
  'breakfast':      'Sun1',
  'kids':           'Gift',
  'desserts':       'Star1',
}
const catIcon = (slug: string) => CAT_ICONS[slug] ?? 'MenuBoard'

// ── Tags: icono + color ──────────────────────────────────────────
const TAG_META: Record<string, { icon: string; cls: string }> = {
  popular:    { icon: 'Star1', cls: 'text-amber-600 bg-amber-50 border-amber-200' },
  seafood:    { icon: 'Drop', cls: 'text-sky-700 bg-sky-50 border-sky-200' },
  spicy:      { icon: 'Flash', cls: 'text-red-600 bg-red-50 border-red-200' },
  kids:       { icon: 'Gift', cls: 'text-purple-600 bg-purple-50 border-purple-200' },
  chefchoice: { icon: 'Crown', cls: 'text-brand bg-brand/10 border-brand/30' },
}
const tagMeta = (tag: string) => TAG_META[tag] ?? { icon: 'Tag', cls: 'text-secondary bg-sand-100 border-sand-200' }

// ── Filtros ──────────────────────────────────────────────────────
const FILTERS = computed<{ id: MenuTag | 'all'; icon: string; label: string }[]>(() => [
  { id: 'all',     icon: 'MenuBoard', label: t('menu.filters.all') },
  { id: 'popular', icon: 'Star1',     label: t('menu.tags.popular') },
  { id: 'seafood', icon: 'Drop',      label: t('menu.filters.seafood') },
  { id: 'spicy',   icon: 'Flash',     label: t('menu.filters.spicy') },
  { id: 'kids',    icon: 'Gift',      label: t('menu.filters.kids') },
])

const fmt = (p: number | null) => p == null ? '' : `$${p.toFixed(2)}`
const groups = computed(() => menu.grouped)

// ── Sección activa (IntersectionObserver) ────────────────────────
const activeSection = ref<string>('')
let observer: IntersectionObserver | null = null

function setupObserver() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { activeSection.value = e.target.id; break }
      }
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  )
  setTimeout(() => {
    document.querySelectorAll('[data-menu-section]').forEach(el => observer?.observe(el))
  }, 250)
}

onMounted(() => {
  const stop = watch(() => menu.loading, (val) => {
    if (!val && menu.categories.length) { setupObserver(); stop() }
  }, { immediate: true })
})
onActivated(() => {
  // vuelve del cache — reconectar observer sin re-fetch
  if (!menu.loading && menu.categories.length) setupObserver()
})
onDeactivated(() => observer?.disconnect())
onUnmounted(() => observer?.disconnect())

function scrollToCategory(slug: string) {
  const el = document.getElementById(slug)
  if (el) { el.scrollIntoView({ behavior: 'smooth' }); activeSection.value = slug }
}

function clearFilters() {
  menu.search = ''
  menu.activeTag = 'all'
}
</script>

<template>
  <main>
    <!-- Cabecera de la página -->
    <header class="container-page pt-8 pb-6 text-center">
      <p class="section-kicker mb-2">
        <Icon name="MenuBoard" :size="13" class="mr-1" />{{ t('menu.kicker') }}
      </p>
      <h1 class="font-display text-4xl md:text-5xl font-bold text-secondary-dark">{{ t('menu.title') }}</h1>
      <p class="text-ink-muted mt-2 text-sm">{{ t('menu.sub') }}</p>
    </header>

    <!-- Barra de búsqueda + filtros (sticky) -->
    <div class="sticky top-32 z-20 bg-sand-50/95 backdrop-blur-sm border-y border-sand-200 shadow-soft">
      <div class="container-page py-2.5 space-y-2">
        <!-- Búsqueda -->
        <div class="flex items-center gap-2">
          <div class="relative flex-1">
            <Icon name="SearchNormal1" :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              v-model="menu.search"
              :placeholder="t('menu.search')"
              type="search" inputmode="search" autocomplete="off"
              class="w-full pl-9 pr-4 py-2 rounded-full border border-sand-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-shadow"
            />
          </div>
          <span v-if="!menu.loading && groups.length" class="hidden sm:block text-xs text-ink-muted shrink-0 tabular-nums">
            {{ menu.filtered.length }} {{ t('menu.dishes') }}
          </span>
        </div>
        <!-- Tags filtro -->
        <div class="-mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scrollbar-hide">
          <div class="flex gap-1.5 w-max sm:w-auto sm:flex-wrap pb-0.5">
            <button
              v-for="f in FILTERS" :key="f.id"
              @click="menu.activeTag = f.id"
              class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
              :class="menu.activeTag === f.id
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white border-sand-200 text-secondary hover:border-brand/50 hover:text-brand'"
            >
              <Icon :name="f.icon" :size="11" type="Bold" />
              {{ f.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout principal: sidebar + contenido -->
    <div class="container-page py-8 flex gap-8 items-start">

      <!-- Sidebar de categorías (solo desktop) -->
      <aside class="hidden lg:block w-52 shrink-0">
        <div class="sticky top-[14.5rem]">
          <p class="text-[10px] uppercase tracking-widest text-ink-muted font-bold mb-3 px-2">
            {{ t('menu.categoriesLabel') }}
          </p>
          <nav class="space-y-0.5">
            <template v-if="menu.loading">
              <div v-for="n in 10" :key="n" class="h-9 rounded-xl bg-sand-200 animate-pulse mb-1" />
            </template>
            <button
              v-else
              v-for="g in groups" :key="g.category.id"
              @click="scrollToCategory(g.category.id)"
              class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left group"
              :class="activeSection === g.category.id
                ? 'bg-brand text-white shadow-sm'
                : 'text-secondary hover:bg-sand-100 hover:text-brand'"
            >
              <Icon
                :name="catIcon(g.category.id)"
                :size="16"
                :type="activeSection === g.category.id ? 'Bold' : 'Linear'"
                class="shrink-0"
              />
              <span class="flex-1 leading-tight">{{ g.category.name.en }}</span>
              <span class="text-[10px] opacity-50 shrink-0 tabular-nums">{{ g.items.length }}</span>
            </button>
          </nav>
        </div>
      </aside>

      <!-- Área de contenido -->
      <div class="flex-1 min-w-0">

        <!-- Scroll horizontal de categorías (solo mobile/tablet) -->
        <div v-if="!menu.loading && groups.length" class="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide mb-6">
          <div class="flex gap-2 w-max pb-1">
            <button
              v-for="g in groups" :key="g.category.id"
              @click="scrollToCategory(g.category.id)"
              class="shrink-0 flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl border transition-all min-w-[72px]"
              :class="activeSection === g.category.id
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-white border-sand-100 text-secondary shadow-soft hover:border-brand/40'"
            >
              <Icon
                :name="catIcon(g.category.id)"
                :size="22"
                :type="activeSection === g.category.id ? 'Bold' : 'Linear'"
              />
              <span class="text-[10px] font-semibold leading-tight text-center line-clamp-2 max-w-[64px]">
                {{ g.category.name.en }}
              </span>
            </button>
          </div>
        </div>

        <!-- Skeleton de carga -->
        <template v-if="menu.loading">
          <div v-for="n in 4" :key="n" class="mb-12">
            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-sand-200 animate-pulse" />
              <div class="h-6 w-40 rounded-lg bg-sand-200 animate-pulse" />
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <div v-for="i in 4" :key="i" class="p-4 rounded-2xl bg-white border border-sand-100 animate-pulse">
                <div class="space-y-2 py-1">
                  <div class="h-4 bg-sand-200 rounded w-3/4" />
                  <div class="h-3 bg-sand-200 rounded w-1/2" />
                  <div class="h-3 bg-sand-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Error -->
        <div v-else-if="menu.error" class="text-center py-20">
          <Icon name="Warning2" :size="44" class="text-brand/60 mx-auto mb-4" />
          <p class="font-bold text-secondary-dark mb-1">{{ t('menu.errorLoad') }}</p>
          <button @click="menu.init()" class="btn-outline text-sm mt-3 inline-flex items-center gap-2">
            <Icon name="Refresh" :size="15" />
            {{ t('menu.retry') }}
          </button>
        </div>

        <!-- Sin resultados -->
        <div v-else-if="!groups.length" class="text-center py-20">
          <Icon name="SearchNormal1" :size="44" class="text-ink-muted/50 mx-auto mb-4" />
          <p class="text-secondary-dark font-semibold mb-1">{{ t('menu.noResults') }}</p>
          <button @click="clearFilters()" class="btn-ghost text-sm mt-3 inline-flex items-center gap-1.5">
            <Icon name="CloseCircle" :size="14" />
            {{ t('menu.clearFilters') }}
          </button>
        </div>

        <!-- Secciones del menú -->
        <template v-else>
          <section
            v-for="g in groups" :key="g.category.id"
            :id="g.category.id"
            data-menu-section
            class="mb-14 scroll-mt-56"
          >
            <!-- Cabecera de categoría -->
            <div class="flex items-center gap-3 mb-5 pb-3 border-b-2 border-sand-100">
              <span class="w-11 h-11 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                <Icon :name="catIcon(g.category.id)" :size="22" type="Bold" class="text-brand" />
              </span>
              <div>
                <h2 class="font-display text-xl md:text-2xl font-bold text-secondary-dark leading-tight">
                  {{ g.category.name.en }}
                </h2>
                <p v-if="catNote(g.category.id)" class="text-[11px] text-ink-muted italic mt-0.5">{{ catNote(g.category.id) }}</p>
                <p class="text-[11px] text-ink-muted tabular-nums">
                  {{ g.items.length }} {{ t('menu.dishes') }}
                </p>
              </div>
            </div>

            <!-- Grid de platillos -->
            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article
                v-for="m in g.items" :key="m.id"
                class="p-3.5 rounded-2xl bg-white border border-sand-100 hover:border-brand/25 hover:shadow-soft transition-all duration-200"
              >
                <div class="flex items-start justify-between gap-2 mb-1">
                  <h3 class="font-bold text-secondary-dark text-sm leading-snug">
                    {{ m.name.en }}
                  </h3>
                  <span v-if="m.price" class="text-brand font-bold text-sm shrink-0 whitespace-nowrap tabular-nums">
                    {{ fmt(m.price) }}
                  </span>
                </div>
                <p v-if="m.description" class="text-[11px] text-ink-muted leading-relaxed line-clamp-2">
                  {{ m.description.en }}
                </p>
                <div v-if="m.tags.filter(tg => tg !== 'popular').length" class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="tg in m.tags.filter(tg => tg !== 'popular')" :key="tg"
                    class="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border"
                    :class="tagMeta(tg).cls"
                  >
                    <Icon :name="tagMeta(tg).icon" :size="9" type="Bold" />
                    {{ t(`menu.tags.${tg}`) }}
                  </span>
                </div>
              </article>
            </div>
          </section>
        </template>

      </div><!-- /content -->
    </div><!-- /layout -->
  </main>
</template>
