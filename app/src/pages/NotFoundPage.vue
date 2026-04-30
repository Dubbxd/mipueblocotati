<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
<template>
  <main class="container-page py-24 text-center">
    <p class="font-display text-9xl font-bold text-brand">404</p>
    <p class="text-ink-muted mt-4">Esta página no existe.</p>
    <RouterLink to="/" class="btn-primary mt-8 inline-block">Volver al inicio</RouterLink>
  </main>
</template>
