<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { menuItems } from '@/data/menu'
import { computed } from 'vue'
const route = useRoute()
const { locale } = useI18n()
const item = computed(() => menuItems.find(m => m.slug === route.params.slug))
</script>

<template>
  <main class="container-page py-12">
    <RouterLink to="/menu" class="text-secondary hover:text-brand text-sm">← Menú</RouterLink>
    <div v-if="item" class="grid md:grid-cols-2 gap-10 mt-6">
      <img v-if="item.photo" :src="item.photo.replace('.webp','.jpg')" :alt="item.name.es" class="w-full rounded-2xl shadow-elev" />
      <div>
        <h1 class="font-display text-4xl font-bold text-secondary-dark">{{ locale === 'es' ? item.name.es : item.name.en }}</h1>
        <p v-if="item.description" class="text-ink-muted mt-3">{{ locale === 'es' ? item.description.es : item.description.en }}</p>
        <p class="text-3xl font-bold text-brand mt-5">${{ item.price?.toFixed(2) }}</p>
      </div>
    </div>
    <p v-else class="text-ink-muted py-10">Platillo no encontrado.</p>
  </main>
</template>
