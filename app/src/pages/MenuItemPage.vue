<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'
import { useMenuStore } from '@/stores'
import { computed, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { applySeo, absoluteUrl, breadcrumbSchema, restaurantSchema, SITE_URL } from '@/lib/seo'
const route = useRoute()
const menu = useMenuStore()
const { locale } = useI18n()
const item = computed(() => menu.all.find(m => m.slug === route.params.slug))
const category = computed(() => menu.categories.find(c => c.id === item.value?.categoryId))
const text = (value?: { es: string; en: string }) => value ? (locale.value === 'en' ? value.en : value.es) : ''

watchEffect(() => {
  const dish = item.value
  if (!dish) {
    if (!menu.loading) {
      applySeo({
        title: 'Platillo no encontrado · Mi Pueblo Cotati',
        path: route.path,
        robots: 'noindex, nofollow',
      })
    }
    return
  }
  const name = text(dish.name)
  const description = text(dish.description) || `${name} en Mi Pueblo Cotati.`
  const path = `/menu/${dish.slug}`
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MenuItem',
    '@id': `${SITE_URL}${path}#menu-item`,
    name,
    description,
    url: `${SITE_URL}${path}`,
    image: dish.photo ? absoluteUrl(dish.photo) : undefined,
    menuAddOn: [],
    offers: dish.price != null ? {
      '@type': 'Offer',
      price: dish.price.toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    } : undefined,
  }
  applySeo({
    title: `${name} · Menú de Mi Pueblo Cotati`,
    description,
    path,
    image: dish.photo,
    locale: locale.value === 'en' ? 'en_US' : 'es_US',
    jsonLd: [
      restaurantSchema(),
      schema,
      breadcrumbSchema([
        { name: 'Mi Pueblo Cotati', path: '/' },
        { name: locale.value === 'en' ? 'Menu' : 'Menú', path: '/menu' },
        { name, path },
      ]),
    ],
  })
})
</script>

<template>
  <main class="container-page pb-12">
    <RouterLink to="/menu" class="text-secondary hover:text-brand text-sm">← Menú</RouterLink>
    <div v-if="item" class="grid md:grid-cols-2 gap-8 mt-6 items-start">
      <img v-if="item.photo" :src="item.photo" :alt="text(item.name)" class="w-full aspect-[4/3] rounded-2xl object-cover" />
      <div>
        <p v-if="category" class="text-sm font-semibold uppercase tracking-wide text-brand">{{ text(category.name) }}</p>
        <h1 class="font-display text-4xl font-bold text-secondary-dark mt-1">{{ text(item.name) }}</h1>
        <p v-if="item.description" class="text-ink-muted mt-3">{{ text(item.description) }}</p>
        <p v-if="item.price !== null" class="text-2xl font-bold text-brand mt-5">${{ item.price.toFixed(2) }}</p>
        <RouterLink to="/menu" class="btn-primary inline-flex mt-7">{{ locale === 'en' ? 'See full menu' : 'Ver menú completo' }}</RouterLink>
      </div>
    </div>
    <p v-else class="text-ink-muted py-10">Platillo no encontrado.</p>
  </main>
</template>
