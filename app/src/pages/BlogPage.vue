<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/lib/api'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const router = useRouter()

type Post = {
  id: number
  slug: string
  titleEs: string; titleEn: string
  excerptEs?: string | null; excerptEn?: string | null
  coverImage?: string | null
  category: string
  tags?: string[] | null
  publishedAt?: string | null
}

const posts = ref<Post[]>([])
const loading = ref(true)

function title(p: Post) { return locale.value === 'en' ? p.titleEn : p.titleEs }
function excerpt(p: Post) { return locale.value === 'en' ? p.excerptEn : p.excerptEs }

async function load() {
  loading.value = true
  try { posts.value = await api('/api/public/blog', { auth: false }) } finally { loading.value = false }
}

onMounted(load)
</script>

<template>
  <section class="min-h-screen bg-sand-50">
    <!-- Header -->
    <div class="bg-night text-white py-20 text-center">
      <h1 class="font-display text-4xl md:text-5xl mb-3">Blog</h1>
      <p class="text-white/60 text-lg">Cultura, recetas y tradición mexicana</p>
    </div>

    <div class="container mx-auto px-4 py-16 max-w-5xl">
      <div v-if="loading" class="flex justify-center py-20">
        <div class="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
      </div>

      <div v-else-if="!posts.length" class="text-center py-20 text-night/40">
        <p class="text-lg">Próximamente…</p>
        <p class="text-sm mt-2">Estamos preparando contenido para ti.</p>
      </div>

      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="post in posts"
          :key="post.id"
          @click="router.push(`/blog/${post.slug}`)"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div class="aspect-video bg-secondary/10 overflow-hidden">
            <img
              v-if="post.coverImage"
              :src="post.coverImage"
              :alt="title(post)"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-secondary/40">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            </div>
          </div>
          <div class="p-5">
            <span class="text-xs font-medium text-brand uppercase tracking-wide">{{ post.category }}</span>
            <h2 class="font-display text-lg text-night mt-1 leading-snug group-hover:text-brand transition-colors">{{ title(post) }}</h2>
            <p v-if="excerpt(post)" class="text-night/60 text-sm mt-2 line-clamp-3">{{ excerpt(post) }}</p>
            <p v-if="post.publishedAt" class="text-night/40 text-xs mt-3">
              {{ new Date(post.publishedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
