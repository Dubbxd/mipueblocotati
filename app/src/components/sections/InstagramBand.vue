<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'

const { locale } = useI18n()

const INSTAGRAM_URL = 'https://www.instagram.com/mipueblocotati/'
const HANDLE = '@mipueblocotati'

const photos = [
  '/assets/gallery/molcajete-bowl.jpg',
  '/assets/gallery/catering-buffet-setup.jpg',
  '/assets/gallery/quesa-birria-taco-closeup.jpg',
  '/assets/gallery/parrillada-especial.jpg',
  '/assets/gallery/chile-relleno.jpg',
  '/assets/gallery/burrito-served.jpg',
  '/assets/gallery/restaurantmx.jpg',
  '/assets/gallery/clientes-brindis-patio.jpg',
]

const visible = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})
</script>

<template>
  <section class="section bg-white overflow-hidden">
    <div class="container-page">

      <div class="text-center mb-10">
        <p class="section-kicker justify-center mb-2">
          <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Instagram
        </p>
        <h2 class="section-header">
          {{ locale === 'es' ? 'Siguenos en Instagram' : 'Follow us on Instagram' }}
        </h2>
        <p class="section-sub">
          {{ locale === 'es'
            ? 'Platillos, eventos y momentos de nuestra cocina. No te pierdas nada.'
            : 'Dishes, events and moments from our kitchen. Don\'t miss a thing.' }}
        </p>
      </div>

      <!-- Photo grid -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-8">
        <a v-for="(photo, i) in photos" :key="i"
          :href="INSTAGRAM_URL" target="_blank" rel="noopener"
          class="group relative aspect-square rounded-xl overflow-hidden bg-sand-100"
          :class="{ 'opacity-0 translate-y-4': !visible, 'opacity-100 translate-y-0': visible }"
          :style="{ transitionDelay: `${i * 80}ms`, transitionDuration: '600ms', transitionProperty: 'opacity, transform' }">
          <img :src="photo" alt="" loading="lazy"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
            <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
        </a>
      </div>

      <!-- Follow CTA -->
      <div class="flex flex-col items-center gap-4">
        <a :href="INSTAGRAM_URL" target="_blank" rel="noopener"
          class="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold text-base shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-100"
          style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          {{ locale === 'es' ? 'Seguir' : 'Follow' }} {{ HANDLE }}
        </a>
        <p class="text-xs text-ink-muted">
          {{ locale === 'es' ? 'Comparte tus fotos con' : 'Share your photos with' }}
          <span class="font-semibold text-brand">#MiPuebloCotati</span>
        </p>
      </div>

    </div>
  </section>
</template>
