<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'

const { t } = useI18n()
const route = useRoute()
const scrolled = ref(false)
const open = ref(false)
const onScroll = () => { scrolled.value = window.scrollY > 40 }
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }) })
onUnmounted(() => window.removeEventListener('scroll', onScroll))

// Solo Home tiene hero oscuro full-bleed; en las demás siempre sólido oscuro.
const transparent = computed(() => route.path === '/' && !scrolled.value && !open.value)

const links = [
  { to: '/', key: 'nav.home' },
  { to: '/menu', key: 'nav.menu' },
  { to: '/sucursales', key: 'nav.locations' },
  { to: '/promociones', key: 'nav.promotions' },
  { to: '/catering', key: 'nav.catering' },
  { to: '/contacto', key: 'nav.contact' }
]
</script>

<template>
  <header
    class="relative transition-all duration-300 border-b bg-[#FFFCF0] border-sand-200"
    :class="scrolled ? 'py-1 shadow-soft' : 'py-2'"
  >
    <div class="container-page flex items-center justify-between gap-4">
      <RouterLink to="/" class="flex items-center gap-3 shrink-0">
        <img src="/logo.png" alt="Mi Pueblo Cotati · Est. 1997"
             class="h-12 md:h-14 w-auto transition-all" />
      </RouterLink>

      <nav class="hidden lg:flex items-center gap-6">
        <RouterLink
          v-for="l in links" :key="l.to" :to="l.to"
          class="text-sm font-bold uppercase tracking-wider transition-colors text-secondary-dark hover:text-brand"
          active-class="!text-brand"
        >{{ t(l.key) }}</RouterLink>
        <RouterLink to="/reservar"
          class="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border-2 transition-all whitespace-nowrap border-brand text-brand hover:bg-brand hover:text-white"
        >{{ t('cta.reserve') }}</RouterLink>
        <a href="https://mi-pueblo-real-mex-cotati.cloveronline.com/menu/all"
           target="_blank" rel="noopener"
           class="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-brand text-white hover:bg-brand-dark shadow-md whitespace-nowrap transition-colors">{{ t('cta.orderOnline') }}</a>
        <LanguageSwitcher />
      </nav>

      <button
        class="lg:hidden p-2 transition-colors text-secondary-dark"
        :aria-expanded="open" aria-label="Menu"
        @click="open = !open"
      >
        <svg v-if="!open" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <Transition name="slide">
      <nav v-if="open" class="lg:hidden bg-sand-50 border-t border-sand-200">
        <div class="container-page py-4 flex flex-col gap-3">
          <RouterLink v-for="l in links" :key="l.to" :to="l.to" @click="open = false"
            class="py-2 text-secondary-dark font-bold uppercase text-sm tracking-wider hover:text-brand"
            active-class="!text-brand">{{ t(l.key) }}</RouterLink>
          <RouterLink to="/reservar" class="btn-outline text-xs" @click="open = false">{{ t('cta.reserve') }}</RouterLink>
          <a href="https://mi-pueblo-real-mex-cotati.cloveronline.com/menu/all" target="_blank" rel="noopener" class="btn-primary text-xs">{{ t('cta.orderOnline') }}</a>
          <div class="pt-2"><LanguageSwitcher /></div>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: max-height .3s ease, opacity .2s ease; overflow: hidden; }
.slide-enter-from, .slide-leave-to { max-height: 0; opacity: 0; }
.slide-enter-to, .slide-leave-from { max-height: 600px; opacity: 1; }
</style>
