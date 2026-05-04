<script setup lang="ts">
import { ref } from 'vue'
const submitted = ref(false)
const rating = ref(5)
const comment = ref('')
const submit = async () => { await new Promise(r => setTimeout(r, 400)); submitted.value = true }
</script>

<template>
  <main class="container-page pb-12 max-w-2xl">
    <h1 class="font-display text-4xl font-bold text-secondary-dark">Encuesta de satisfacción</h1>
    <p class="text-ink-muted mt-2">Tu opinión nos ayuda a mejorar.</p>

    <div v-if="submitted" class="card p-8 mt-8 text-center bg-green-50">
      <p class="text-green-800 font-semibold">¡Gracias por tu retroalimentación!</p>
    </div>
    <form v-else @submit.prevent="submit" class="card p-6 mt-8 space-y-4">
      <label class="block">
        <span class="text-sm font-semibold text-secondary">Calificación</span>
        <input v-model.number="rating" type="range" min="1" max="5" class="w-full mt-2" />
        <p class="text-center text-2xl text-yellow-500">{{ '★'.repeat(rating) }}{{ '☆'.repeat(5 - rating) }}</p>
      </label>
      <label class="block">
        <span class="text-sm font-semibold text-secondary">Comentarios</span>
        <textarea v-model="comment" rows="5" required class="w-full mt-1 px-3 py-2 rounded-md border border-sand-300"></textarea>
      </label>
      <button class="btn-primary w-full">Enviar encuesta</button>
    </form>
  </main>
</template>
