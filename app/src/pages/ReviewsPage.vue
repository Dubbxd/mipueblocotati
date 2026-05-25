<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/lib/api'

const { locale } = useI18n()

type DbReview = {
  id: number; authorName: string; authorCity: string | null
  rating: number; bodyEs: string; bodyEn: string | null
  source: string | null
}

const reviews = ref<DbReview[]>([])
const loading = ref(true)

onMounted(async () => {
  try { reviews.value = await api<DbReview[]>('/api/public/reviews', { auth: false }) }
  finally { loading.value = false }
})

function stars(n: number) { return '\u2605'.repeat(n) + '\u2606'.repeat(5 - n) }
function body(r: DbReview) { return locale.value === 'en' && r.bodyEn ? r.bodyEn : r.bodyEs }
</script>

<template>
  <main class="container-page pb-16">
    <h1 class="font-display text-4xl md:text-5xl font-bold text-secondary-dark text-center">Reseñas</h1>
    <p class="text-ink-muted text-center mt-2">Lo que opinan nuestros clientes</p>

    <div v-if="loading" class="flex justify-center py-20">
      <div class="w-10 h-10 border-4 border-brand/30 border-t-brand rounded-full animate-spin"></div>
    </div>

    <div v-else-if="!reviews.length" class="text-center py-20 text-ink-muted">
      <p>Aún no hay reseñas disponibles.</p>
    </div>

    <div v-else class="grid md:grid-cols-3 gap-6 mt-10">
      <article v-for="r in reviews" :key="r.id" class="card p-6">
        <p class="text-yellow-500 text-lg">{{ stars(r.rating) }}</p>
        <p class="text-ink-muted mt-3 italic">&ldquo;{{ body(r) }}&rdquo;</p>
        <p class="text-sm font-semibold text-secondary mt-4">
          — {{ r.authorName }}<span v-if="r.authorCity" class="font-normal text-ink-muted">, {{ r.authorCity }}</span>
        </p>
      </article>
    </div>
  </main>
</template>
