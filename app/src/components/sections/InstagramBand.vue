<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import img1 from '@/newimages/492329884_1221306036673428_4219020819468303765_n.jpg'
import img2 from '@/newimages/492381093_1228167192653979_6397371103519838411_n.jpg'
import img3 from '@/newimages/493123974_1223504709786894_1318860153922132709_n.jpg'
import img4 from '@/newimages/493322978_1222099666594065_7037526391163655909_n.jpg'
import img5 from '@/newimages/493808205_1225969919540373_2181102379598483657_n.jpg'
import img6 from '@/newimages/493916205_1223504636453568_5605877025446183823_n.jpg'

const { locale } = useI18n()

const INSTAGRAM_URL = 'https://www.instagram.com/mipueblocotati/'
const HANDLE = 'mipueblocotati'

const photos = [img1, img2, img3, img4, img5, img6]

const visible = ref(false)
onMounted(() => {
  requestAnimationFrame(() => { visible.value = true })
})
</script>

<template>
  <section class="section bg-sand-50 border-y border-sand-200 overflow-hidden">
    <div class="container-page max-w-3xl">

      <!-- Profile card -->
      <div class="bg-white rounded-3xl shadow-soft border border-sand-100 overflow-hidden">

        <!-- Header -->
        <div class="flex items-center gap-3 px-5 py-3 border-b border-sand-100">
          <svg class="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          <span class="text-sm font-semibold text-gray-800">Instagram</span>
        </div>

        <!-- Profile info -->
        <div class="px-5 pt-5 pb-4">
          <div class="flex items-center gap-5">
            <!-- Avatar -->
            <a :href="INSTAGRAM_URL" target="_blank" rel="noopener"
              class="shrink-0 w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
              <img src="/assets/logos/logo-cotati.png" alt="Mi Pueblo Cotati"
                class="w-full h-full rounded-full border-[3px] border-white object-cover bg-white" />
            </a>

            <!-- Stats -->
            <div class="flex-1 flex justify-around text-center">
              <div>
                <div class="text-lg font-bold text-gray-900 leading-tight">200+</div>
                <div class="text-xs text-gray-500">{{ locale === 'es' ? 'publicaciones' : 'posts' }}</div>
              </div>
              <div>
                <div class="text-lg font-bold text-gray-900 leading-tight">1.2K</div>
                <div class="text-xs text-gray-500">{{ locale === 'es' ? 'seguidores' : 'followers' }}</div>
              </div>
              <div>
                <div class="text-lg font-bold text-gray-900 leading-tight">350+</div>
                <div class="text-xs text-gray-500">{{ locale === 'es' ? 'siguiendo' : 'following' }}</div>
              </div>
            </div>
          </div>

          <!-- Name & bio -->
          <div class="mt-4">
            <p class="font-bold text-sm text-gray-900">Mi Pueblo Cotati</p>
            <p class="text-sm text-gray-500 mt-0.5">{{ locale === 'es'
              ? 'Autentica comida mexicana en Sonoma County desde 1997'
              : 'Authentic Mexican food in Sonoma County since 1997' }}</p>
            <a :href="INSTAGRAM_URL" target="_blank" rel="noopener"
              class="text-xs text-blue-900 font-semibold mt-1 inline-block hover:underline">
              {{ INSTAGRAM_URL }}
            </a>
          </div>

          <!-- Follow button -->
          <a :href="INSTAGRAM_URL" target="_blank" rel="noopener"
            class="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#0095f6] hover:bg-[#1877f2] text-white text-sm font-semibold transition-colors">
            {{ locale === 'es' ? 'Seguir' : 'Follow' }}
          </a>
        </div>

        <!-- Photo grid -->
        <div class="grid grid-cols-3 gap-[2px] border-t border-sand-100">
          <a v-for="(photo, i) in photos" :key="i"
            :href="INSTAGRAM_URL" target="_blank" rel="noopener"
            class="group relative aspect-square overflow-hidden bg-sand-100"
            :class="{ 'opacity-0 scale-95': !visible, 'opacity-100 scale-100': visible }"
            :style="{ transitionDelay: `${i * 60}ms`, transitionDuration: '500ms', transitionProperty: 'opacity, transform' }">
            <img :src="photo" alt="" loading="lazy"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
          </a>
        </div>

        <!-- Footer -->
        <a :href="INSTAGRAM_URL" target="_blank" rel="noopener"
          class="flex items-center justify-center gap-2 py-3 border-t border-sand-100 text-sm text-blue-500 font-semibold hover:bg-sand-50 transition-colors">
          {{ locale === 'es' ? 'Ver mas en Instagram' : 'View more on Instagram' }}
        </a>
      </div>

      <!-- Hashtag -->
      <p class="text-center text-xs text-ink-muted mt-5">
        {{ locale === 'es' ? 'Comparte tus fotos con' : 'Share your photos with' }}
        <a :href="INSTAGRAM_URL" target="_blank" rel="noopener"
          class="font-semibold text-brand hover:underline">#MiPuebloCotati</a>
      </p>

    </div>
  </section>
</template>
