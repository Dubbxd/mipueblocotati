<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMenuStore } from '@/stores'
import { computed } from 'vue'
const route = useRoute()
const { locale } = useI18n()
const menu = useMenuStore()
const item = computed(() => menu.all.find(m => m.slug === route.params.slug))
</script>

<template>
  <main class="container-page pb-12">
    <RouterLink to="/menu" class="text-secondary hover:text-brand text-sm">← Menú</RouterLink>
    <div v-if="item" class="mt-6">
      <h1 class="font-display text-4xl font-bold text-secondary-dark">{{ locale === 'es' ? item.name.es : item.name.en }}</h1>
      <p v-if="item.description" class="text-ink-muted mt-3">{{ locale === 'es' ? item.description.es : item.description.en }}</p>
      <p class="text-3xl font-bold text-brand mt-5">${{ item.price?.toFixed(2) }}</p>
    </div>
    <p v-else class="text-ink-muted py-10">Platillo no encontrado.</p>
  </main>
</template>
