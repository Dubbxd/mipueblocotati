<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const props = defineProps<{
  terms: boolean
  data: boolean
  marketing?: boolean
  showMarketing?: boolean
}>()

const emit = defineEmits<{
  'update:terms': [value: boolean]
  'update:data': [value: boolean]
  'update:marketing': [value: boolean]
}>()
</script>

<template>
  <div class="space-y-3 pt-2 border-t border-sand-200">
    <!-- Terms & Conditions — required -->
    <label class="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        :checked="terms"
        required
        @change="emit('update:terms', ($event.target as HTMLInputElement).checked)"
        class="mt-0.5 h-4 w-4 shrink-0 rounded border-sand-300 text-brand focus:ring-brand/40 cursor-pointer"
      />
      <span class="text-xs text-ink-muted leading-relaxed">
        {{ t('consent.terms') }}
        <a href="/legal/terminos" target="_blank" class="text-brand underline underline-offset-2 hover:text-brand-dark">
          {{ t('consent.termsLink') }}
        </a>
        {{ t('consent.and') }}
        <a href="/legal/privacidad" target="_blank" class="text-brand underline underline-offset-2 hover:text-brand-dark">
          {{ t('consent.privacyLink') }}
        </a>.
        <span class="text-brand font-semibold">*</span>
      </span>
    </label>

    <!-- Data collection — required -->
    <label class="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        :checked="data"
        required
        @change="emit('update:data', ($event.target as HTMLInputElement).checked)"
        class="mt-0.5 h-4 w-4 shrink-0 rounded border-sand-300 text-brand focus:ring-brand/40 cursor-pointer"
      />
      <span class="text-xs text-ink-muted leading-relaxed">
        {{ t('consent.data') }}
        <span class="text-brand font-semibold">*</span>
      </span>
    </label>

    <!-- Marketing — optional -->
    <label v-if="showMarketing" class="flex items-start gap-3 cursor-pointer group">
      <input
        type="checkbox"
        :checked="marketing"
        @change="emit('update:marketing', ($event.target as HTMLInputElement).checked)"
        class="mt-0.5 h-4 w-4 shrink-0 rounded border-sand-300 text-brand focus:ring-brand/40 cursor-pointer"
      />
      <span class="text-xs text-ink-muted leading-relaxed">
        {{ t('consent.marketing') }}
      </span>
    </label>

    <p class="text-[10px] text-ink-muted/60">{{ t('consent.required') }}</p>
  </div>
</template>
