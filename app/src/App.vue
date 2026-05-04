<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import PromoBar from '@/components/marketing/PromoBar.vue'
import { useMenuStore } from '@/stores'
const PwaUpdatePrompt = defineAsyncComponent(() => import('@/components/system/PwaUpdatePrompt.vue'))

const route = useRoute()
const isAdmin = computed(() => (route.meta?.layout === 'admin') || (route.meta?.layout === 'blank') || route.path.startsWith('/admin'))

const menu = useMenuStore()
onMounted(() => menu.init())
</script>

<template>
  <!-- Admin / blank layout: solo RouterView, el layout admin ya trae su shell -->
  <RouterView v-if="isAdmin" />

  <!-- Layout público -->
  <template v-else>
    <div class="fixed top-0 inset-x-0 z-40 flex flex-col bg-[#FFFCF0]">
      <PromoBar />
      <AppNavbar />
    </div>
    <main class="min-h-screen pt-32">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="fade" mode="out-in">
          <KeepAlive :include="['MenuPage']">
            <component :is="Component" :key="r.fullPath" />
          </KeepAlive>
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
    <PwaUpdatePrompt />
  </template>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
