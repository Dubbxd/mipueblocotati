<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'
defineProps<{ open: boolean; title?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto bg-black/60 backdrop-blur-sm" @click.self="emit('close')">
        <div
          class="w-full bg-night-dark text-white rounded-2xl border border-white/10 shadow-elev mt-4"
          :class="{
            'max-w-md': size === 'sm' || !size,
            'max-w-2xl': size === 'md',
            'max-w-3xl': size === 'lg',
            'max-w-5xl': size === 'xl'
          }"
        >
          <div class="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h3 class="font-display text-lg">{{ title }}</h3>
            <button @click="emit('close')" class="w-8 h-8 grid place-items-center rounded hover:bg-white/10 text-white/70 hover:text-white" aria-label="Cerrar">
              <Icon name="CloseCircle" :size="20" />
            </button>
          </div>
          <div class="p-5">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-5 py-4 border-t border-white/10 flex justify-end gap-2">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
