<script setup lang="ts">
/**
 * Wrapper sobre `vue3-lottie`.
 * Sirve animaciones Lottie (descargadas de Finsweet LottieFlow https://finsweet.com/lottieflow,
 * LottieFiles, etc.) ya sea por URL o por JSON importado.
 *
 * Uso:
 *   <LottiePlayer src="/lottie/empty-state.json" :width="220" />
 *   <LottiePlayer :animation-data="empty" loop autoplay />
 */
import { Vue3Lottie } from 'vue3-lottie'

defineProps<{
  src?: string
  animationData?: object
  loop?: boolean
  autoplay?: boolean
  width?: number | string
  height?: number | string
  speed?: number
}>()
</script>

<template>
  <Vue3Lottie
    :animation-data="animationData"
    :animation-link="src"
    :loop="loop !== false"
    :auto-play="autoplay !== false"
    :width="width || '100%'"
    :height="height || 'auto'"
    :speed="speed || 1"
  />
</template>
