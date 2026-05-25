<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import Icon from '@/components/ui/Icon.vue'

const { toasts, remove } = useToast()

const ICONS: Record<string, string> = {
  success: 'TickCircle',
  error:   'CloseCircle',
  info:    'InfoCircle',
  warning: 'Warning2',
}

const COLORS: Record<string, { bar: string; icon: string; bg: string; border: string }> = {
  success: { bar: 'bg-emerald-500', icon: 'text-emerald-500', bg: 'bg-white', border: 'border-emerald-100' },
  error:   { bar: 'bg-red-500',     icon: 'text-red-500',     bg: 'bg-white', border: 'border-red-100' },
  info:    { bar: 'bg-sky-500',     icon: 'text-sky-500',     bg: 'bg-white', border: 'border-sky-100' },
  warning: { bar: 'bg-amber-400',   icon: 'text-amber-500',   bg: 'bg-white', border: 'border-amber-100' },
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto relative flex overflow-hidden rounded-2xl border shadow-xl shadow-black/10"
          :class="[COLORS[t.type].bg, COLORS[t.type].border]"
          role="alert"
        >
          <!-- Color bar left -->
          <div class="w-1 shrink-0" :class="COLORS[t.type].bar"></div>

          <!-- Content -->
          <div class="flex items-start gap-3 px-4 py-3.5 flex-1 min-w-0">
            <Icon
              :name="ICONS[t.type]"
              type="Bold"
              :size="20"
              class="shrink-0 mt-0.5"
              :class="COLORS[t.type].icon"
            />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 leading-snug">{{ t.title }}</p>
              <p v-if="t.message" class="text-xs text-gray-500 mt-0.5 leading-relaxed">{{ t.message }}</p>
            </div>
            <button
              @click="remove(t.id)"
              class="shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition rounded-lg p-0.5"
              aria-label="Cerrar notificación"
            >
              <Icon name="CloseCircle" :size="16" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.25s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(110%);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
