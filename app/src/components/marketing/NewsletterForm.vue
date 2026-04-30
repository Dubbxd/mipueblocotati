<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const email = ref('')
const status = ref<'idle' | 'ok' | 'err'>('idle')

const submit = async () => {
  if (!email.value || !email.value.includes('@')) { status.value = 'err'; return }
  // TODO: hook to Elyza /api/subscribers (POST)
  await new Promise(r => setTimeout(r, 400))
  status.value = 'ok'
  email.value = ''
}
</script>

<template>
  <div id="newsletter">
    <h4 class="font-display text-lg mb-2 text-white">{{ t('newsletter.title') }}</h4>
    <p class="text-xs text-sand-200 mb-3">{{ t('newsletter.sub') }}</p>
    <form @submit.prevent="submit" class="flex flex-col sm:flex-row gap-2">
      <input v-model="email" type="email" required inputmode="email" autocomplete="email" :placeholder="t('newsletter.placeholder')"
        class="flex-1 min-w-0 px-3 py-2.5 rounded-md text-ink text-sm bg-white" />
      <button class="btn-primary text-xs whitespace-nowrap !py-2.5">{{ t('cta.subscribe') }}</button>
    </form>
    <p v-if="status === 'ok'" class="mt-2 text-xs text-green-300">{{ t('newsletter.success') }}</p>
    <p v-if="status === 'err'" class="mt-2 text-xs text-red-300">{{ t('newsletter.error') }}</p>
  </div>
</template>
