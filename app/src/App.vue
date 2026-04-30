<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import MobileBottomNav from '@/components/layout/MobileBottomNav.vue'
import PromoBar from '@/components/marketing/PromoBar.vue'
const PwaUpdatePrompt = defineAsyncComponent(() => import('@/components/system/PwaUpdatePrompt.vue'))

const route = useRoute()
const isAdmin = computed(() => (route.meta?.layout === 'admin') || (route.meta?.layout === 'blank') || route.path.startsWith('/admin'))
</script>

<template>
  <!-- Admin / blank layout: solo RouterView, el layout admin ya trae su shell -->
  <RouterView v-if="isAdmin" />

  <!-- Layout público -->
  <template v-else>
    <PromoBar />
    <AppNavbar />
    <main class="min-h-screen pb-20 md:pb-0">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="r.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
    <MobileBottomNav />
    <PwaUpdatePrompt />
  </template>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
