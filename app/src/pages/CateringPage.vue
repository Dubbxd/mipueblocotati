<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import ConsentCheckboxes from '@/components/ui/ConsentCheckboxes.vue'
import { api } from '@/lib/api'

const { t, locale } = useI18n()

// ── Form state ────────────────────────────────────────────────────
const form = reactive({
  name: '',
  phone: '',
  email: '',
  eventType: '',
  eventDate: '',
  guests: '' as string | number,
  budget: '',
  serviceStyle: '',
  dietary: [] as string[],
  message: '',
})
const consentTerms = ref(false)
const consentData = ref(false)
const consentMarketing = ref(false)

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMsg = ref('')

const EVENT_TYPES = [
  { value: 'wedding',     icon: 'Heart',   es: 'Boda',                en: 'Wedding' },
  { value: 'corporate',   icon: 'Building', es: 'Corporativo',        en: 'Corporate' },
  { value: 'quinceanera', icon: 'Crown',   es: 'Quinceañera',         en: 'Quinceañera' },
  { value: 'birthday',    icon: 'Gift',    es: 'Cumpleaños',          en: 'Birthday' },
  { value: 'graduation',  icon: 'Award',   es: 'Graduación',          en: 'Graduation' },
  { value: 'other',       icon: 'MenuBoard', es: 'Otro evento',       en: 'Other event' },
]

const BUDGET_OPTIONS = [
  { value: 'under-500',     es: 'Menos de $500',        en: 'Under $500' },
  { value: '500-1000',      es: '$500 – $1,000',         en: '$500 – $1,000' },
  { value: '1000-2500',     es: '$1,000 – $2,500',       en: '$1,000 – $2,500' },
  { value: '2500-5000',     es: '$2,500 – $5,000',       en: '$2,500 – $5,000' },
  { value: 'over-5000',     es: 'Más de $5,000',         en: 'Over $5,000' },
]

const SERVICE_STYLES = [
  { value: 'buffet',   icon: 'TableBar',   es: 'Buffet',        en: 'Buffet' },
  { value: 'plated',   icon: 'Cup',        es: 'Platos servidos', en: 'Plated' },
  { value: 'stations', icon: 'MenuBoard',  es: 'Estaciones',    en: 'Stations' },
  { value: 'taco-bar', icon: 'Bag2',       es: 'Taco bar',      en: 'Taco bar' },
]

const DIETARY = [
  { value: 'vegetarian', icon: 'Heart',      es: 'Vegetariano', en: 'Vegetarian' },
  { value: 'vegan',      icon: 'Leaf',       es: 'Vegano',      en: 'Vegan' },
  { value: 'gluten-free',icon: 'TickCircle', es: 'Sin gluten',  en: 'Gluten-free' },
  { value: 'halal',      icon: 'Star1',      es: 'Halal',       en: 'Halal' },
  { value: 'kids',       icon: 'Gift',       es: 'Menú niños',  en: 'Kids menu' },
]

function toggleDietary(v: string) {
  const i = form.dietary.indexOf(v)
  if (i === -1) form.dietary.push(v)
  else form.dietary.splice(i, 1)
}

function txt(o: { es: string; en: string }) {
  return locale.value === 'es' ? o.es : o.en
}

async function submit() {
  if (status.value === 'loading') return
  status.value = 'loading'
  errorMsg.value = ''
  try {
    const dietary = form.dietary.length ? form.dietary.join(', ') : undefined
    const notes = [
      form.serviceStyle ? `Servicio: ${form.serviceStyle}` : '',
      dietary ? `Dieta: ${dietary}` : '',
      form.message,
    ].filter(Boolean).join('\n')

    await api('/api/public/catering', {
      method: 'POST',
      auth: false,
      body: {
        name: form.name,
        phone: form.phone,
        email: form.email,
        eventType: form.eventType || undefined,
        eventDate: form.eventDate || undefined,
        guests: form.guests ? Number(form.guests) : undefined,
        budget: form.budget || undefined,
        message: notes || undefined,
        consentTerms: consentTerms.value,
        consentData: consentData.value,
        consentMarketing: consentMarketing.value,
      },
    })
    status.value = 'success'
  } catch (e: any) {
    status.value = 'error'
    errorMsg.value = e?.message ?? 'Error al enviar'
  }
}
</script>

<template>
  <main>

    <!-- Hero -->
    <section class="relative overflow-hidden bg-night text-white">
      <img src="/assets/gallery/catering-buffet-setup.jpg" alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-30" loading="eager" />
      <div class="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/30"></div>
      <div class="relative z-10 container-page py-16 md:py-24">
        <p class="section-kicker !text-accent text-left mb-3">
          <Icon name="Star1" :size="13" class="mr-1" />{{ t('catering.kicker') }}
        </p>
        <h1 class="font-display text-4xl md:text-6xl font-bold text-white leading-tight mb-4 max-w-2xl">
          {{ t('catering.heroTitle') }}
        </h1>
        <p class="text-sand-300 text-base max-w-lg mb-8">{{ t('catering.heroSub') }}</p>
        <div class="flex flex-col sm:flex-row flex-wrap gap-3">
          <a href="#quote-form"
             class="btn-primary px-6 py-3 text-base inline-flex items-center justify-center gap-2 w-full sm:w-auto">
            <Icon name="Send2" :size="16" type="Bold" />
            {{ t('catering.ctaForm') }}
          </a>
          <a href="tel:+17077924380"
             class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-white/30 text-white hover:bg-white/10 transition-colors text-base font-semibold w-full sm:w-auto">
            <Icon name="Call" :size="16" />
            +1 (707) 792-4380
          </a>
        </div>
      </div>
    </section>

    <!-- Servicios incluidos -->
    <section class="bg-sand-50 border-b border-sand-200 py-12">
      <div class="container-page">
        <div class="grid sm:grid-cols-3 gap-6">
          <div v-for="item in [
            { icon: 'MenuBoard', es: 'Menú personalizado', en: 'Custom menu', bodyEs: 'Adaptamos el menú a tu evento y preferencias gastronómicas.', bodyEn: 'We tailor the menu to your event and culinary preferences.' },
            { icon: 'Truck',     es: 'Entrega y montaje', en: 'Delivery & setup', bodyEs: 'Llegamos a tu locación y montamos todo listo para servir.', bodyEn: 'We arrive at your venue and set everything up ready to serve.' },
            { icon: 'People',    es: 'Servicio completo', en: 'Full service', bodyEs: 'Personal de servicio disponible para eventos de mayor escala.', bodyEn: 'Service staff available for larger-scale events.' },
          ]" :key="item.icon"
            class="flex gap-4 items-start bg-white rounded-2xl p-5 shadow-soft"
          >
            <div class="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
              <Icon :name="item.icon" :size="22" type="Bold" class="text-brand" />
            </div>
            <div>
              <p class="font-bold text-secondary-dark">{{ locale === 'es' ? item.es : item.en }}</p>
              <p class="text-sm text-ink-muted mt-0.5 leading-relaxed">{{ locale === 'es' ? item.bodyEs : item.bodyEn }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Formulario de cotización -->
    <section id="quote-form" class="container-page py-14 scroll-mt-32">
      <div class="max-w-3xl mx-auto">

        <div class="text-center mb-10">
          <p class="section-kicker justify-center mb-2">
            <Icon name="Send2" :size="13" class="mr-1" />{{ t('catering.formKicker') }}
          </p>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-secondary-dark">{{ t('catering.formTitle') }}</h2>
          <p class="text-ink-muted mt-2">{{ t('catering.formSub') }}</p>
        </div>

        <!-- Éxito -->
        <div v-if="status === 'success'"
          class="rounded-3xl bg-green-50 border border-green-200 p-10 text-center flex flex-col items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Icon name="TickCircle" :size="36" type="Bold" class="text-green-500" />
          </div>
          <h3 class="font-display text-2xl font-bold text-secondary-dark">{{ t('catering.successTitle') }}</h3>
          <p class="text-ink-muted max-w-sm">{{ t('catering.successBody') }}</p>
        </div>

        <!-- Formulario -->
        <form v-else @submit.prevent="submit" class="space-y-8">

          <fieldset class="rounded-2xl border border-sand-200 bg-white p-4 sm:p-6 shadow-soft space-y-4">
            <legend class="text-xs font-bold uppercase tracking-widest text-ink-muted px-1">
              {{ t('catering.sectionEvent') }}
            </legend>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="et in EVENT_TYPES" :key="et.value" type="button"
                @click="form.eventType = et.value"
                class="flex items-center gap-2 px-3 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all text-left leading-tight"
                :class="form.eventType === et.value
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'border-sand-200 text-secondary hover:border-brand/40 hover:text-brand bg-sand-50'"
              >
                <Icon :name="et.icon" :size="15" :type="form.eventType === et.value ? 'Bold' : 'Linear'" class="shrink-0" />
                <span class="line-clamp-2">{{ txt(et) }}</span>
              </button>
            </div>
          </fieldset>

          <!-- Sección 2: Fecha + invitados -->
          <fieldset class="rounded-2xl border border-sand-200 bg-white p-4 sm:p-6 shadow-soft space-y-4">
            <legend class="text-xs font-bold uppercase tracking-widest text-ink-muted px-1">
              {{ t('catering.sectionDetails') }}
            </legend>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">{{ t('catering.fieldDate') }}</label>
                <input v-model="form.eventDate" type="date"
                  class="form-input" />
              </div>
              <div>
                <label class="form-label">{{ t('catering.fieldGuests') }}</label>
                <div class="flex items-center gap-2">
                  <button type="button" @click="form.guests = Math.max(1, Number(form.guests) - 10)"
                    class="w-9 h-9 rounded-lg border border-sand-200 flex items-center justify-center text-secondary hover:bg-sand-100 transition-colors shrink-0">
                    <Icon name="Minus" :size="14" />
                  </button>
                  <input v-model="form.guests" type="number" min="1" max="2000"
                    :placeholder="t('catering.guestsPlaceholder')"
                    class="form-input text-center flex-1" />
                  <button type="button" @click="form.guests = Number(form.guests) + 10"
                    class="w-9 h-9 rounded-lg border border-sand-200 flex items-center justify-center text-secondary hover:bg-sand-100 transition-colors shrink-0">
                    <Icon name="Add" :size="14" />
                  </button>
                </div>
              </div>
            </div>
            <!-- Presupuesto -->
            <div>
              <label class="form-label">{{ t('catering.fieldBudget') }}</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="b in BUDGET_OPTIONS" :key="b.value" type="button"
                  @click="form.budget = b.value"
                  class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                  :class="form.budget === b.value
                    ? 'bg-brand text-white border-brand'
                    : 'border-sand-200 text-secondary hover:border-brand/40'"
                >{{ txt(b) }}</button>
              </div>
            </div>
          </fieldset>

          <!-- Sección 3: Estilo de servicio -->
          <fieldset class="rounded-2xl border border-sand-200 bg-white p-4 sm:p-6 shadow-soft space-y-4">
            <legend class="text-xs font-bold uppercase tracking-widest text-ink-muted px-1">
              {{ t('catering.sectionService') }}
            </legend>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="ss in SERVICE_STYLES" :key="ss.value" type="button"
                @click="form.serviceStyle = ss.value"
                class="flex flex-col items-center gap-2 py-4 rounded-xl border text-xs font-semibold transition-all"
                :class="form.serviceStyle === ss.value
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'border-sand-200 text-secondary hover:border-brand/40 bg-sand-50'"
              >
                <Icon :name="ss.icon" :size="22" :type="form.serviceStyle === ss.value ? 'Bold' : 'Linear'" />
                {{ txt(ss) }}
              </button>
            </div>
          </fieldset>

          <!-- Sección 4: Datos de contacto -->
          <fieldset class="rounded-2xl border border-sand-200 bg-white p-4 sm:p-6 shadow-soft space-y-4">
            <legend class="text-xs font-bold uppercase tracking-widest text-ink-muted px-1">
              {{ t('catering.sectionContact') }}
            </legend>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">{{ t('catering.fieldName') }} *</label>
                <input v-model="form.name" type="text" required :placeholder="t('catering.namePlaceholder')"
                  class="form-input" />
              </div>
              <div>
                <label class="form-label">{{ t('catering.fieldPhone') }} *</label>
                <input v-model="form.phone" type="tel" required :placeholder="t('catering.phonePlaceholder')"
                  class="form-input" />
              </div>
              <div class="sm:col-span-2">
                <label class="form-label">{{ t('catering.fieldEmail') }} *</label>
                <input v-model="form.email" type="email" required :placeholder="t('catering.emailPlaceholder')"
                  class="form-input" />
              </div>
            </div>
            <div>
              <label class="form-label">{{ t('catering.fieldMessage') }}</label>
              <textarea v-model="form.message" rows="4" :placeholder="t('catering.messagePlaceholder')"
                class="form-input resize-none"></textarea>
            </div>
          </fieldset>

          <!-- Error -->
          <p v-if="status === 'error'" class="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-xl p-3">
            {{ errorMsg || t('catering.errorMsg') }}
          </p>

          <!-- Consent -->
          <ConsentCheckboxes
            v-model:terms="consentTerms"
            v-model:data="consentData"
            v-model:marketing="consentMarketing"
            :showMarketing="true"
          />

          <!-- Submit -->
          <button type="submit" :disabled="status === 'loading' || !consentTerms || !consentData"
            class="w-full btn-primary py-4 text-base font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            <Icon v-if="status !== 'loading'" name="Send2" :size="18" type="Bold" />
            <svg v-else class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20" />
            </svg>
            {{ status === 'loading' ? t('catering.sending') : t('catering.submitBtn') }}
          </button>

        </form>
      </div>
    </section>

    <!-- Cómo funciona -->
    <section class="bg-sand-100 border-t border-sand-200 py-14">
      <div class="container-page max-w-2xl mx-auto text-center">
        <h2 class="font-display text-2xl font-bold text-secondary-dark mb-8">{{ t('catering.howTitle') }}</h2>
        <div class="grid sm:grid-cols-3 gap-6">
          <div v-for="(step, i) in [
            { icon: 'Send2',      es: t('catering.step1'), en: t('catering.step1') },
            { icon: 'MessageText', es: t('catering.step2'), en: t('catering.step2') },
            { icon: 'TickCircle', es: t('catering.step3'), en: t('catering.step3') },
          ]" :key="i" class="flex flex-col items-center gap-3 text-center">
            <div class="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center shadow-md">
              <Icon :name="step.icon" :size="20" type="Bold" />
            </div>
            <p class="text-sm text-ink-muted leading-relaxed">{{ step.es }}</p>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>
