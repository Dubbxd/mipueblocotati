<script setup lang="ts">
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'

const { t, locale } = useI18n()

const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(swUrl: string) {
    // Re-check every hour for updates while the tab stays open
    if ('serviceWorker' in navigator) {
      setInterval(async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration(swUrl)
          await reg?.update()
        } catch {
          /* ignore */
        }
      }, 60 * 60 * 1000)
    }
  }
})

function dismiss() {
  offlineReady.value = false
  needRefresh.value = false
}

const labels = {
  es: {
    update: '¡Hay una nueva versión!',
    updateBody: 'Recarga para ver lo último del menú y promociones.',
    reload: 'Actualizar',
    later: 'Después',
    offline: 'Listo para usar sin internet',
    offlineBody: 'Ya puedes navegar el menú aunque pierdas señal en el restaurante.'
  },
  en: {
    update: 'A new version is available!',
    updateBody: 'Reload to see the latest menu and promotions.',
    reload: 'Update',
    later: 'Later',
    offline: 'Ready to use offline',
    offlineBody: 'You can browse the menu even without signal at the restaurant.'
  }
} as const

function L<K extends keyof typeof labels.es>(k: K): string {
  return labels[(locale.value as 'es' | 'en') in labels ? (locale.value as 'es' | 'en') : 'es'][k]
}
// keep t referenced (avoid unused warning, allows future keying)
void t
</script>

<template>
  <Teleport to="body">
    <Transition name="pwa-toast">
      <div
        v-if="needRefresh || offlineReady"
        role="status"
        aria-live="polite"
        class="fixed left-1/2 -translate-x-1/2 z-[60] w-[min(92vw,420px)]
               bottom-[calc(env(safe-area-inset-bottom,0px)+5.5rem)] md:bottom-6
               bg-white border border-sand-200 rounded-2xl shadow-elev p-4 flex gap-3 items-start"
      >
        <span
          class="grid place-items-center w-10 h-10 rounded-xl shrink-0"
          :class="needRefresh ? 'bg-accent text-white' : 'bg-green-100 text-green-700'"
        >
          <Icon :name="needRefresh ? 'Refresh' : 'TickCircle'" :size="22" />
        </span>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-secondary-dark text-sm leading-tight">
            {{ needRefresh ? L('update') : L('offline') }}
          </p>
          <p class="text-xs text-ink-muted mt-1 leading-snug">
            {{ needRefresh ? L('updateBody') : L('offlineBody') }}
          </p>
          <div v-if="needRefresh" class="flex gap-2 mt-3">
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-bold uppercase tracking-wider hover:bg-brand-dark"
              @click="updateServiceWorker(true)"
            >{{ L('reload') }}</button>
            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-ink-muted hover:text-secondary-dark"
              @click="dismiss"
            >{{ L('later') }}</button>
          </div>
        </div>
        <button
          v-if="!needRefresh"
          type="button"
          class="text-ink-muted hover:text-secondary-dark shrink-0"
          aria-label="Cerrar"
          @click="dismiss"
        >
          <Icon name="CloseCircle" :size="18" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pwa-toast-enter-active, .pwa-toast-leave-active { transition: all .3s ease; }
.pwa-toast-enter-from, .pwa-toast-leave-to { opacity: 0; transform: translate(-50%, 12px); }
</style>
