<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()
const site = useSiteStore()

const lightboxIndex = ref<number | null>(null)
const open = (i: number) => { lightboxIndex.value = i }
const close = () => { lightboxIndex.value = null }
const next = () => { if (lightboxIndex.value !== null) lightboxIndex.value = (lightboxIndex.value + 1) % site.gallery.length }
const prev = () => { if (lightboxIndex.value !== null) lightboxIndex.value = (lightboxIndex.value - 1 + site.gallery.length) % site.gallery.length }

const onKey = (e: KeyboardEvent) => {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}
</script>

<template>
  <section class="section bg-sand-50" @keydown="onKey" tabindex="-1">
    <div class="container-page">
      <h2 class="section-header">{{ t('home.gallery.title') }}</h2>
      <p class="section-sub">{{ t('home.gallery.sub') }}</p>

      <div class="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-rows:200px] md:[grid-auto-rows:240px]">
        <button
          v-for="(img, i) in site.gallery" :key="img.id"
          class="group relative overflow-hidden rounded-xl shadow-soft hover:shadow-elev transition-all"
          :class="img.width === 2 ? 'col-span-2 row-span-2' : ''"
          @click="open(i)"
        >
          <img :src="img.src.replace('.webp', '.jpg')" :alt="locale === 'es' ? img.alt.es : img.alt.en"
               loading="lazy" decoding="async"
               class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <span class="text-white text-sm font-semibold">{{ locale === 'es' ? img.alt.es : img.alt.en }}</span>
          </div>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="lightboxIndex !== null"
           class="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
           @click.self="close">
        <button @click="close" class="absolute top-4 right-4 text-white hover:text-brand-light" aria-label="Cerrar">
          <Icon name="CloseCircle" :size="32" />
        </button>
        <button @click="prev" class="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-brand-light px-3" aria-label="Anterior">
          <Icon name="ArrowLeft2" :size="36" />
        </button>
        <button @click="next" class="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-brand-light px-3" aria-label="Siguiente">
          <Icon name="ArrowRight2" :size="36" />
        </button>
        <figure class="max-w-5xl w-full">
          <img :src="site.gallery[lightboxIndex].src.replace('.webp', '.jpg')"
               :alt="locale === 'es' ? site.gallery[lightboxIndex].alt.es : site.gallery[lightboxIndex].alt.en"
               class="w-full max-h-[80vh] object-contain rounded-lg" />
          <figcaption class="text-center text-sand-200 mt-3 text-sm">
            {{ locale === 'es' ? site.gallery[lightboxIndex].alt.es : site.gallery[lightboxIndex].alt.en }}
          </figcaption>
        </figure>
      </div>
    </Teleport>
  </section>
</template>
