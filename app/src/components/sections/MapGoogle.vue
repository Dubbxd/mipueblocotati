<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ src?: string; q?: string; height?: string; title?: string }>(),
  { height: '420px', title: 'Google Maps' }
)

const embedSrc = computed(() => {
  if (props.src) return props.src
  if (props.q) return `https://maps.google.com/maps?q=${encodeURIComponent(props.q)}&output=embed`
  return ''
})
</script>

<template>
  <iframe
    v-if="embedSrc"
    :src="embedSrc"
    :title="title"
    :style="{ height: props.height }"
    class="w-full border-0"
    allowfullscreen
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
</template>
