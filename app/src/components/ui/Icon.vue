<script setup lang="ts">
import { computed } from 'vue'
import { iconRegistry } from '@/lib/icons'

const props = defineProps<{
  name: string
  type?: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold'
    | 'linear' | 'outline' | 'twotone' | 'bulk' | 'broken' | 'bold'
  size?: number | string
  color?: string
}>()

const icon = computed(() => iconRegistry[props.name])
const variant = computed(() => (props.type || 'linear').toLowerCase())
</script>

<template>
  <component
    :is="icon"
    :type="variant"
    :size="size || 20"
    :color="color || 'currentColor'"
    class="inline-block shrink-0 align-[-0.15em]"
  />
</template>
