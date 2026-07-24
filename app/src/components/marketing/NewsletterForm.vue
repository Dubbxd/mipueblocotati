<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ConsentCheckboxes from '@/components/ui/ConsentCheckboxes.vue'
import { api } from '@/lib/api'

const { t } = useI18n()
const email = ref('')
const consentTerms = ref(false)
const consentData = ref(false)
const consentMarketing = ref(false)
const hp = ref('')
const status = ref<'idle' | 'ok' | 'already' | 'err'>('idle')
const errorDetail = ref('')

const submit = async () => {
  if (!email.value || !email.value.includes('@')) { status.value = 'err'; errorDetail.value = ''; return }
  try {
    const res = await api<{ ok: boolean; isNew: boolean }>('/api/public/newsletter', {
      method: 'POST',
      auth: false,
      body: {
        email: email.value,
        consentTerms: consentTerms.value,
        consentData: consentData.value,
        consentMarketing: consentMarketing.value,
        website: hp.value,
      },
    })
    status.value = res.isNew ? 'ok' : 'already'
    email.value = ''
    consentTerms.value = false
    consentData.value = false
    consentMarketing.value = false
  } catch (e: any) {
    status.value = 'err'
    errorDetail.value = e?.message && !String(e.message).startsWith('HTTP') ? e.message : ''
  }
}
</script>

<template>
  <div id="newsletter">
    <h4 class="font-display text-lg mb-2 text-white">{{ t('newsletter.title') }}</h4>
    <p class="text-xs text-sand-200 mb-3">{{ t('newsletter.sub') }}</p>
    <form @submit.prevent="submit" class="flex flex-col gap-3">
      <div class="flex flex-col sm:flex-row gap-2">
        <input v-model="email" type="email" required inputmode="email" autocomplete="email" :placeholder="t('newsletter.placeholder')"
          class="flex-1 min-w-0 px-3 py-2.5 rounded-md text-ink text-sm bg-white" />
        <button :disabled="!consentTerms || !consentData" class="btn-primary text-xs whitespace-nowrap !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">{{ t('cta.subscribe') }}</button>
      </div>
      <!-- Consent checkboxes — dark footer variant -->
      <div class="space-y-2 pt-1 border-t border-white/20">
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" v-model="consentTerms" required
            class="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/40 text-brand cursor-pointer" />
          <span class="text-[11px] text-sand-200 leading-relaxed">
            {{ t('consent.terms') }}
            <a href="/legal/terminos" target="_blank" class="text-sand-100 underline">{{ t('consent.termsLink') }}</a>
            {{ t('consent.and') }}
            <a href="/legal/privacidad" target="_blank" class="text-sand-100 underline">{{ t('consent.privacyLink') }}</a>. *
          </span>
        </label>
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" v-model="consentData" required
            class="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/40 text-brand cursor-pointer" />
          <span class="text-[11px] text-sand-200 leading-relaxed">{{ t('consent.data') }} *</span>
        </label>
        <label class="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" v-model="consentMarketing"
            class="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/40 text-brand cursor-pointer" />
          <span class="text-[11px] text-sand-200 leading-relaxed">{{ t('consent.marketing') }}</span>
        </label>
      </div>
      <input v-model="hp" type="text" name="website" autocomplete="off" tabindex="-1" class="absolute opacity-0 h-0 w-0 pointer-events-none" aria-hidden="true" />
    </form>
    <p v-if="status === 'ok'" class="mt-2 text-xs text-green-300">{{ t('newsletter.success') }}</p>
    <p v-if="status === 'already'" class="mt-2 text-xs text-amber-300">{{ t('newsletter.already') }}</p>
    <p v-if="status === 'err'" class="mt-2 text-xs text-red-300">{{ errorDetail || t('newsletter.error') }}</p>
  </div>
</template>
