<script setup lang="ts">
defineProps<{
  label?: string
  hint?: string
  required?: boolean
  error?: string
}>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="block text-xs uppercase tracking-wider text-white/60 mb-1.5">
      {{ label }}<span v-if="required" class="text-accent">*</span>
    </span>
    <slot />
    <span v-if="hint && !error" class="block text-xs text-white/40 mt-1">{{ hint }}</span>
    <span v-if="error" class="block text-xs text-accent mt-1">{{ error }}</span>
  </label>
</template>
