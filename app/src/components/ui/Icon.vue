<script setup lang="ts">
/**
 * Wrapper sobre `vue-iconsax` (Iconsax https://app.iconsax.io/).
 * Uso:
 *   <Icon name="Home" />
 *   <Icon name="Calendar" type="Bold" :size="20" class="text-brand" />
 *
 * Tipos disponibles: Linear · Outline · TwoTone · Bulk · Broken · Bold
 * Por defecto usa 'Linear'. El color hereda de `currentColor`,
 * así que basta con pintar el contenedor con `text-…` de Tailwind.
 */
import { computed } from 'vue'
import { VsxIcon } from 'vue-iconsax'

const props = defineProps<{
  name: string
  type?: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold'
    | 'linear' | 'outline' | 'twotone' | 'bulk' | 'broken' | 'bold'
  size?: number | string
  color?: string
}>()

// vue-iconsax internamente espera variantes en minúscula:
// linear · outline · twotone · bulk · broken · bold
const variant = computed(() => (props.type || 'linear').toLowerCase())
</script>

<template>
  <VsxIcon
    :iconName="name"
    :type="variant"
    :size="size || 20"
    :color="color || 'currentColor'"
    class="inline-block shrink-0 align-[-0.15em]"
  />
</template>
