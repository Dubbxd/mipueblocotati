<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/lib/api'
import Icon from '@/components/ui/Icon.vue'
import ConsentCheckboxes from '@/components/ui/ConsentCheckboxes.vue'
import { useToast } from '@/composables/useToast'

const { locale } = useI18n()
const toast = useToast()

const submitted = ref(false)
const loading = ref(false)
const error = ref('')

const rating = ref(5)
const comment = ref('')
const name = ref('')
const email = ref('')
const consentTerms = ref(false)
const consentData = ref(false)
const hp = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await api('/api/public/surveys', {
      method: 'POST',
      auth: false,
      body: {
        rating: rating.value,
        comment: comment.value || undefined,
        name: name.value || undefined,
        email: email.value || undefined,
        locale: locale.value,
        consentTerms: consentTerms.value,
        consentData: consentData.value,
        website: hp.value,
      },
    })
    submitted.value = true
    toast.success(
      locale.value === 'es' ? '¡Gracias por tu opinión!' : 'Thank you for your feedback!',
      locale.value === 'es' ? 'Recibimos tu encuesta correctamente.' : 'We received your survey.'
    )
  } catch {
    const msg = locale.value === 'es'
      ? 'Ocurrió un error. Por favor intenta de nuevo.'
      : 'Something went wrong. Please try again.'
    error.value = msg
    toast.error(
      locale.value === 'es' ? 'No pudimos enviar la encuesta' : 'Could not submit survey',
      msg
    )
  } finally {
    loading.value = false
  }
}

const STARS = [1, 2, 3, 4, 5]
const labels: Record<number, { es: string; en: string }> = {
  1: { es: 'Muy malo', en: 'Very bad' },
  2: { es: 'Malo', en: 'Bad' },
  3: { es: 'Regular', en: 'Average' },
  4: { es: 'Bueno', en: 'Good' },
  5: { es: '¡Excelente!', en: 'Excellent!' },
}
const txt = (o: { es: string; en: string }) => locale.value === 'es' ? o.es : o.en
</script>

<template>
  <main class="container-page pb-16 max-w-2xl">

    <!-- Header -->
    <header class="pt-10 pb-6 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 mb-4">
        <Icon name="Star1" type="Bold" :size="32" class="text-brand" />
      </div>
      <h1 class="font-display text-3xl md:text-4xl font-bold text-secondary-dark">
        {{ locale === 'es' ? 'Encuesta de satisfacción' : 'Satisfaction survey' }}
      </h1>
      <p class="text-ink-muted mt-2">
        {{ locale === 'es' ? 'Tu opinión nos ayuda a mejorar cada día.' : 'Your feedback helps us improve every day.' }}
      </p>
    </header>

    <!-- Success state -->
    <div v-if="submitted" class="card p-10 text-center space-y-3">
      <div class="text-5xl">🌮</div>
      <h2 class="font-display text-2xl font-bold text-secondary-dark">
        {{ locale === 'es' ? '¡Gracias!' : 'Thank you!' }}
      </h2>
      <p class="text-ink-muted">
        {{ locale === 'es' ? 'Recibimos tu retroalimentación. ¡Nos vemos pronto!' : 'We received your feedback. See you soon!' }}
      </p>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="submit" class="card p-6 md:p-8 space-y-6">

      <!-- Star rating -->
      <div>
        <p class="text-sm font-semibold text-secondary mb-3">
          {{ locale === 'es' ? 'Calificación *' : 'Rating *' }}
        </p>
        <div class="flex gap-2 justify-center">
          <button
            v-for="s in STARS" :key="s"
            type="button"
            @click="rating = s"
            class="text-4xl transition-transform hover:scale-110 focus:outline-none"
            :class="s <= rating ? 'text-yellow-400' : 'text-sand-300'"
            :aria-label="`${s} estrella${s > 1 ? 's' : ''}`"
          >★</button>
        </div>
        <p class="text-center text-sm font-semibold mt-2"
          :class="rating >= 4 ? 'text-green-600' : rating >= 3 ? 'text-yellow-600' : 'text-red-500'">
          {{ txt(labels[rating]) }}
        </p>
      </div>

      <!-- Comment -->
      <label class="block">
        <span class="text-sm font-semibold text-secondary">
          {{ locale === 'es' ? 'Comentarios' : 'Comments' }}
        </span>
        <textarea
          v-model="comment"
          rows="4"
          :placeholder="locale === 'es' ? '¿Qué podemos mejorar? ¿Qué te gustó más?' : 'What can we improve? What did you enjoy most?'"
          class="w-full mt-1 px-3 py-2 rounded-xl border border-sand-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none resize-none text-sm"
        ></textarea>
      </label>

      <!-- Optional name + email -->
      <div class="grid sm:grid-cols-2 gap-4">
        <label class="block">
          <span class="text-sm font-semibold text-secondary">
            {{ locale === 'es' ? 'Nombre (opcional)' : 'Name (optional)' }}
          </span>
          <input
            v-model="name"
            type="text"
            :placeholder="locale === 'es' ? 'Tu nombre' : 'Your name'"
            class="w-full mt-1 px-3 py-2 rounded-xl border border-sand-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
          />
        </label>
        <label class="block">
          <span class="text-sm font-semibold text-secondary">
            {{ locale === 'es' ? 'Email (opcional)' : 'Email (optional)' }}
          </span>
          <input
            v-model="email"
            type="email"
            :placeholder="locale === 'es' ? 'tu@email.com' : 'you@email.com'"
            class="w-full mt-1 px-3 py-2 rounded-xl border border-sand-300 focus:border-brand focus:ring-1 focus:ring-brand outline-none text-sm"
          />
        </label>
      </div>

      <!-- Error -->
      <p v-if="error" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{{ error }}</p>

      <ConsentCheckboxes
        v-model:terms="consentTerms"
        v-model:data="consentData"
      />
      <input v-model="hp" type="text" name="website" autocomplete="off" tabindex="-1" class="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />

      <button
        type="submit"
        :disabled="loading || !consentTerms || !consentData"
        class="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span v-if="loading" class="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2"></span>
        {{ locale === 'es' ? (loading ? 'Enviando…' : 'Enviar encuesta') : (loading ? 'Sending…' : 'Submit survey') }}
      </button>
    </form>

  </main>
</template>
