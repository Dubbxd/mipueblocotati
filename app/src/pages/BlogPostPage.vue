<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/lib/api'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const route = useRoute()
const router = useRouter()

type Post = {
  id: number
  slug: string
  titleEs: string; titleEn: string
  excerptEs?: string | null; excerptEn?: string | null
  bodyEs?: string | null; bodyEn?: string | null
  coverImage?: string | null
  category: string
  tags?: string[] | null
  metaTitleEs?: string | null; metaTitleEn?: string | null
  metaDescriptionEs?: string | null; metaDescriptionEn?: string | null
  publishedAt?: string | null
}

const post = ref<Post | null>(null)
const loading = ref(true)
const notFound = ref(false)

const title = computed(() => post.value ? (locale.value === 'en' ? post.value.titleEn : post.value.titleEs) : '')
const body = computed(() => post.value ? (locale.value === 'en' ? post.value.bodyEn : post.value.bodyEs) : '')
const excerpt = computed(() => post.value ? (locale.value === 'en' ? post.value.excerptEn : post.value.excerptEs) : '')

async function load() {
  loading.value = true
  try {
    post.value = await api(`/api/public/blog/${route.params.slug}`, { auth: false })
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="min-h-screen bg-sand-50">
    <div v-if="loading" class="flex justify-center py-40">
      <div class="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
    </div>

    <div v-else-if="notFound" class="text-center py-40 text-night/40">
      <p class="text-2xl font-display text-night mb-3">Artículo no encontrado</p>
      <button @click="router.push('/blog')" class="text-brand hover:underline text-sm">← Volver al blog</button>
    </div>

    <article v-else-if="post">
      <!-- Hero -->
      <div class="relative bg-night text-white">
        <div v-if="post.coverImage" class="absolute inset-0 overflow-hidden">
          <img :src="post.coverImage" :alt="title" class="w-full h-full object-cover opacity-30" />
          <div class="absolute inset-0 bg-gradient-to-t from-night to-night/50"></div>
        </div>
        <div class="relative container mx-auto px-4 max-w-3xl py-20">
          <button @click="router.push('/blog')" class="text-white/50 hover:text-white text-sm mb-6 inline-flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Blog
          </button>
          <span class="text-xs font-medium text-accent uppercase tracking-wide">{{ post.category }}</span>
          <h1 class="font-display text-3xl md:text-4xl mt-2 leading-tight">{{ title }}</h1>
          <p v-if="excerpt" class="text-white/60 mt-3 text-lg">{{ excerpt }}</p>
          <p v-if="post.publishedAt" class="text-white/40 text-sm mt-4">
            {{ new Date(post.publishedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </p>
        </div>
      </div>

      <!-- Body -->
      <div class="container mx-auto px-4 max-w-3xl py-12">
        <div
          v-if="body"
          class="prose prose-lg prose-stone max-w-none"
          v-html="body"
        ></div>
        <p v-else class="text-night/40 text-center py-10">Sin contenido disponible en este idioma.</p>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length" class="mt-10 pt-6 border-t border-night/10 flex flex-wrap gap-2">
          <span
            v-for="tag in post.tags"
            :key="tag"
            class="text-xs bg-secondary/10 text-secondary px-3 py-1 rounded-full"
          ># {{ tag }}</span>
        </div>

        <!-- Back -->
        <div class="mt-10">
          <button @click="router.push('/blog')" class="inline-flex items-center gap-1 text-brand hover:underline text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Todos los artículos
          </button>
        </div>
      </div>
    </article>
  </div>
</template>
