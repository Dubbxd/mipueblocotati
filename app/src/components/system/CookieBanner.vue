<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const STORAGE_KEY = 'mp_cookie_consent'

type ConsentChoice = 'all' | 'essential' | null

const visible = ref(false)
const showDetails = ref(false)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) visible.value = true
})

function accept(choice: ConsentChoice) {
  localStorage.setItem(STORAGE_KEY, choice ?? 'essential')
  visible.value = false
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="visible"
      role="dialog"
      aria-modal="false"
      :aria-label="t('cookies.bannerLabel')"
      class="fixed inset-x-0 z-50 bg-night text-sand-100 shadow-2xl border-t-2 border-brand bottom-[calc(env(safe-area-inset-bottom,0px)+3.5rem)] md:bottom-0"
    >
      <div class="container-page py-5 flex flex-col gap-4">
        <!-- Main row -->
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Icon + Text -->
          <div class="flex items-start gap-3 flex-1">
            <span class="text-2xl mt-0.5" aria-hidden="true">🍪</span>
            <div>
              <p class="font-semibold text-sm text-sand-50">{{ t('cookies.title') }}</p>
              <p class="text-xs text-sand-300 mt-0.5 leading-relaxed">
                {{ t('cookies.desc') }}
                <RouterLink to="/legal/cookies" class="underline hover:text-accent ml-1">{{ t('cookies.learnMore') }}</RouterLink>
              </p>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex flex-wrap items-center gap-2 shrink-0">
            <button
              class="text-xs px-3 py-1.5 rounded-md border border-sand-300/30 text-sand-300 hover:text-sand-100 hover:border-sand-100 transition"
              @click="showDetails = !showDetails"
            >
              {{ t('cookies.customize') }}
            </button>
            <button
              class="text-xs px-4 py-1.5 rounded-md bg-night-light text-sand-200 hover:bg-night-soft transition"
              @click="accept('essential')"
            >
              {{ t('cookies.essential') }}
            </button>
            <button
              class="text-xs px-4 py-1.5 rounded-md bg-brand text-white font-semibold hover:bg-accent transition"
              @click="accept('all')"
            >
              {{ t('cookies.acceptAll') }}
            </button>
          </div>
        </div>

        <!-- Expandable detail -->
        <Transition name="fade">
          <div v-if="showDetails" class="border-t border-night-light pt-4 grid sm:grid-cols-3 gap-4">
            <div class="bg-night-soft rounded-lg p-3">
              <p class="text-xs font-semibold text-sand-100 mb-1">🔒 {{ t('cookies.cat.essential') }}</p>
              <p class="text-xs text-sand-300">{{ t('cookies.cat.essentialDesc') }}</p>
              <span class="mt-2 inline-block text-xs text-green-400 font-medium">{{ t('cookies.alwaysOn') }}</span>
            </div>
            <div class="bg-night-soft rounded-lg p-3">
              <p class="text-xs font-semibold text-sand-100 mb-1">📊 {{ t('cookies.cat.analytics') }}</p>
              <p class="text-xs text-sand-300">{{ t('cookies.cat.analyticsDesc') }}</p>
            </div>
            <div class="bg-night-soft rounded-lg p-3">
              <p class="text-xs font-semibold text-sand-100 mb-1">🎯 {{ t('cookies.cat.marketing') }}</p>
              <p class="text-xs text-sand-300">{{ t('cookies.cat.marketingDesc') }}</p>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform .35s ease, opacity .35s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
.fade-enter-active, .fade-leave-active { transition: opacity .2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
