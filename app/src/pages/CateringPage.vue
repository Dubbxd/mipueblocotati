<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/ui/Icon.vue'
import ConsentCheckboxes from '@/components/ui/ConsentCheckboxes.vue'
import { api } from '@/lib/api'
import { useToast } from '@/composables/useToast'

const { t, locale } = useI18n()
const toast = useToast()

// ── Wizard step ───────────────────────────────────────────────────
const step = ref<1 | 2 | 3 | 4>(1)
const submitted = ref(false)
const submitting = ref(false)

// ── Form state ────────────────────────────────────────────────────
const eventType = ref('')
const eventDate = ref('')
const guests = ref(50)
const budget = ref('')
const serviceStyle = ref('')
const dietary = ref<string[]>([])
const name = ref('')
const phone = ref('')
const email = ref('')
const message = ref('')
const consentTerms = ref(false)
const consentData = ref(false)
const consentMarketing = ref(false)

// ── Constants ─────────────────────────────────────────────────────
const EVENT_TYPES = [
  { value: 'wedding',     icon: 'Heart',     es: 'Boda',          en: 'Wedding' },
  { value: 'corporate',   icon: 'Building',  es: 'Corporativo',   en: 'Corporate' },
  { value: 'quinceanera', icon: 'Crown',     es: 'Quinceañera',   en: 'Quinceañera' },
  { value: 'birthday',    icon: 'Gift',      es: 'Cumpleaños',    en: 'Birthday' },
  { value: 'graduation',  icon: 'Award',     es: 'Graduación',    en: 'Graduation' },
  { value: 'other',       icon: 'MenuBoard', es: 'Otro evento',   en: 'Other event' },
]

const BUDGET_OPTIONS = [
  { value: 'under-500',  es: 'Menos de $500',  en: 'Under $500' },
  { value: '500-1000',   es: '$500 – $1,000',  en: '$500 – $1,000' },
  { value: '1000-2500',  es: '$1,000 – $2,500', en: '$1,000 – $2,500' },
  { value: '2500-5000',  es: '$2,500 – $5,000', en: '$2,500 – $5,000' },
  { value: 'over-5000',  es: 'Más de $5,000',   en: 'Over $5,000' },
]

const SERVICE_STYLES = [
  { value: 'buffet',   icon: 'Coffee',     es: 'Buffet',          en: 'Buffet' },
  { value: 'plated',   icon: 'Cup',        es: 'Platos servidos', en: 'Plated service' },
  { value: 'stations', icon: 'MenuBoard',  es: 'Estaciones',      en: 'Stations' },
  { value: 'taco-bar', icon: 'Bag2',       es: 'Taco bar',        en: 'Taco bar' },
]

const DIETARY = [
  { value: 'vegetarian',  icon: 'Heart',      es: 'Vegetariano', en: 'Vegetarian' },
  { value: 'vegan',       icon: 'Tree',       es: 'Vegano',      en: 'Vegan' },
  { value: 'gluten-free', icon: 'TickCircle', es: 'Sin gluten',  en: 'Gluten-free' },
  { value: 'halal',       icon: 'Star1',      es: 'Halal',       en: 'Halal' },
  { value: 'kids',        icon: 'Gift',       es: 'Menú niños',  en: 'Kids menu' },
]

function txt(o: { es: string; en: string }) {
  return locale.value === 'es' ? o.es : o.en
}

function toggleDietary(v: string) {
  const i = dietary.value.indexOf(v)
  if (i === -1) dietary.value.push(v)
  else dietary.value.splice(i, 1)
}

function changeGuests(delta: number) {
  guests.value = Math.max(1, guests.value + delta)
}

// ── Computed labels for summary chips ────────────────────────────
const eventTypeLabel = computed(() => EVENT_TYPES.find(e => e.value === eventType.value))
const budgetLabel = computed(() => BUDGET_OPTIONS.find(b => b.value === budget.value))
const serviceLabel = computed(() => SERVICE_STYLES.find(s => s.value === serviceStyle.value))
const displayDate = computed(() => {
  if (!eventDate.value) return ''
  return new Date(eventDate.value + 'T12:00:00').toLocaleDateString(
    locale.value === 'es' ? 'es-MX' : 'en-US',
    { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }
  )
})

const todayISO = new Date().toISOString().slice(0, 10)

// ── Submit ────────────────────────────────────────────────────────
async function submit() {
  submitting.value = true
  try {
    const dietaryStr = dietary.value.length ? dietary.value.join(', ') : undefined
    const notes = [
      serviceStyle.value ? `Servicio: ${serviceStyle.value}` : '',
      dietaryStr ? `Dieta: ${dietaryStr}` : '',
      message.value,
    ].filter(Boolean).join('\n')

    await api('/api/public/catering', {
      method: 'POST',
      auth: false,
      body: {
        name: name.value,
        phone: phone.value,
        email: email.value || undefined,
        eventType: eventType.value || undefined,
        eventDate: eventDate.value || undefined,
        guests: guests.value || undefined,
        budget: budget.value || undefined,
        message: notes || undefined,
        consentTerms: consentTerms.value,
        consentData: consentData.value,
        consentMarketing: consentMarketing.value,
      },
    })
    submitted.value = true
  } catch (e: any) {
    toast.error(
      locale.value === 'es' ? 'No pudimos enviar tu solicitud' : 'Could not send your request',
      e?.message && !e.message.startsWith('HTTP') ? e.message : undefined
    )
  } finally {
    submitting.value = false
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
      <div class="max-w-2xl mx-auto">

        <div class="text-center mb-10">
          <p class="section-kicker justify-center mb-2">
            <Icon name="Send2" :size="13" class="mr-1" />{{ t('catering.formKicker') }}
          </p>
          <h2 class="font-display text-3xl md:text-4xl font-bold text-secondary-dark">{{ t('catering.formTitle') }}</h2>
          <p class="text-ink-muted mt-2">{{ t('catering.formSub') }}</p>
        </div>

        <!-- Éxito -->
        <div v-if="submitted"
          class="rounded-3xl bg-green-50 border border-green-200 p-10 text-center flex flex-col items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Icon name="TickCircle" :size="36" type="Bold" class="text-green-500" />
          </div>
          <h3 class="font-display text-2xl font-bold text-secondary-dark">{{ t('catering.successTitle') }}</h3>
          <p class="text-ink-muted max-w-sm">{{ t('catering.successBody') }}</p>
          <div v-if="eventTypeLabel || displayDate || guests" class="bg-white rounded-2xl border border-green-100 p-5 text-left w-full max-w-xs space-y-2 text-sm mt-2">
            <div v-if="eventTypeLabel" class="flex items-center gap-2 text-gray-700">
              <Icon :name="eventTypeLabel.icon" type="Bold" :size="16" class="text-green-500 shrink-0" />
              {{ txt(eventTypeLabel) }}
            </div>
            <div v-if="displayDate" class="flex items-center gap-2 text-gray-700 capitalize">
              <Icon name="Calendar" type="Bold" :size="16" class="text-green-500 shrink-0" />
              {{ displayDate }}
            </div>
            <div class="flex items-center gap-2 text-gray-700">
              <Icon name="People" type="Bold" :size="16" class="text-green-500 shrink-0" />
              {{ guests }} {{ locale === 'es' ? 'invitados' : 'guests' }}
            </div>
          </div>
        </div>

        <!-- Wizard -->
        <template v-else>
          <!-- Step dots -->
          <div class="flex items-center gap-1 mb-8">
            <template v-for="n in 4" :key="n">
              <button @click="n < step ? (step = n as 1|2|3|4) : undefined"
                :class="[
                  'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all',
                  step === n ? 'bg-brand text-white shadow-md scale-110' :
                  n < step ? 'bg-brand/20 text-brand cursor-pointer hover:bg-brand/30' :
                  'bg-gray-100 text-gray-400 cursor-default'
                ]">
                <Icon v-if="n < step" name="TickCircle" type="Bold" :size="16" />
                <span v-else>{{ n }}</span>
              </button>
              <div v-if="n < 4" :class="['flex-1 h-1 rounded-full transition-colors', n < step ? 'bg-brand/30' : 'bg-gray-100']" />
            </template>
          </div>

          <!-- STEP 1: Tipo de evento -->
          <div v-if="step === 1" class="space-y-5">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ locale === 'es' ? '¿Qué tipo de evento?' : 'What type of event?' }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ locale === 'es' ? 'Selecciona la categoría que mejor describe tu celebración.' : 'Select the category that best describes your event.' }}</p>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button v-for="et in EVENT_TYPES" :key="et.value" type="button"
                @click="eventType = et.value; step = 2"
                :class="[
                  'flex flex-col items-center gap-3 py-6 rounded-2xl border-2 font-semibold text-sm transition-all active:scale-95',
                  eventType === et.value
                    ? 'bg-brand text-white border-brand shadow-md scale-105'
                    : 'border-gray-200 text-gray-600 hover:border-brand/50 hover:text-brand bg-white'
                ]">
                <Icon :name="et.icon" :size="28" :type="eventType === et.value ? 'Bold' : 'Linear'" />
                {{ txt(et) }}
              </button>
            </div>
          </div>

          <!-- STEP 2: Fecha, invitados, presupuesto -->
          <div v-else-if="step === 2" class="space-y-6">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ locale === 'es' ? 'Detalles del evento' : 'Event details' }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ locale === 'es' ? 'Cuéntanos un poco más sobre tu evento.' : 'Tell us a bit more about your event.' }}</p>
            </div>

            <!-- Fecha -->
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-2">
                {{ locale === 'es' ? 'Fecha del evento' : 'Event date' }}
                <span class="font-normal text-gray-400 ml-1">({{ locale === 'es' ? 'opcional' : 'optional' }})</span>
              </label>
              <input v-model="eventDate" type="date" :min="todayISO"
                class="rounded-xl border border-gray-200 px-4 py-3 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none w-full sm:w-auto" />
            </div>

            <!-- Invitados -->
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-2">{{ locale === 'es' ? 'Número de invitados' : 'Number of guests' }}</label>
              <div class="flex items-center gap-4">
                <button type="button" @click="changeGuests(-10)" :disabled="guests <= 10"
                  class="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center text-2xl font-bold transition-all active:scale-95">−</button>
                <div class="text-center min-w-[5rem]">
                  <div class="text-5xl font-black text-brand leading-none">{{ guests }}</div>
                  <div class="text-xs text-gray-400 mt-1">{{ locale === 'es' ? 'personas' : 'guests' }}</div>
                </div>
                <button type="button" @click="changeGuests(10)"
                  class="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-2xl font-bold transition-all active:scale-95">+</button>
              </div>
              <div class="flex gap-2 flex-wrap mt-3">
                <button v-for="n in [25, 50, 75, 100, 150, 200, 300, 500]" :key="n" type="button"
                  @click="guests = n"
                  :class="guests === n ? 'bg-brand text-white border-brand' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/50'"
                  class="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all">{{ n }}</button>
              </div>
            </div>

            <!-- Presupuesto -->
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-2">
                {{ locale === 'es' ? 'Presupuesto estimado' : 'Estimated budget' }}
                <span class="font-normal text-gray-400 ml-1">({{ locale === 'es' ? 'opcional' : 'optional' }})</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button v-for="b in BUDGET_OPTIONS" :key="b.value" type="button"
                  @click="budget = budget === b.value ? '' : b.value"
                  :class="budget === b.value ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/50'"
                  class="px-4 py-2 rounded-full border text-sm font-semibold transition-all">
                  {{ txt(b) }}
                </button>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="step = 1"
                class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                <Icon name="ArrowLeft2" type="Bold" :size="14" />{{ locale === 'es' ? 'Atrás' : 'Back' }}
              </button>
              <button type="button" @click="step = 3" class="btn-primary flex-1 flex items-center justify-center gap-2">
                {{ locale === 'es' ? 'Continuar' : 'Continue' }}
                <Icon name="ArrowRight2" type="Bold" :size="18" />
              </button>
            </div>
          </div>

          <!-- STEP 3: Estilo de servicio + dieta -->
          <div v-else-if="step === 3" class="space-y-6">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ locale === 'es' ? 'Preferencias de servicio' : 'Service preferences' }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ locale === 'es' ? 'Elige el estilo y cualquier requerimiento dietético.' : 'Choose your service style and any dietary requirements.' }}</p>
            </div>

            <!-- Estilo de servicio -->
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-3">
                {{ locale === 'es' ? 'Estilo de servicio' : 'Service style' }}
                <span class="font-normal text-gray-400 ml-1">({{ locale === 'es' ? 'opcional' : 'optional' }})</span>
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button v-for="ss in SERVICE_STYLES" :key="ss.value" type="button"
                  @click="serviceStyle = serviceStyle === ss.value ? '' : ss.value"
                  :class="[
                    'flex flex-col items-center gap-2 py-5 rounded-2xl border-2 text-xs font-semibold transition-all active:scale-95',
                    serviceStyle === ss.value
                      ? 'bg-brand text-white border-brand shadow-md'
                      : 'border-gray-200 text-gray-600 hover:border-brand/50 bg-white'
                  ]">
                  <Icon :name="ss.icon" :size="24" :type="serviceStyle === ss.value ? 'Bold' : 'Linear'" />
                  {{ txt(ss) }}
                </button>
              </div>
            </div>

            <!-- Requerimientos dietéticos -->
            <div>
              <label class="text-sm font-semibold text-gray-600 block mb-3">
                {{ locale === 'es' ? 'Requerimientos dietéticos' : 'Dietary requirements' }}
                <span class="font-normal text-gray-400 ml-1">({{ locale === 'es' ? 'selecciona todos los que apliquen' : 'select all that apply' }})</span>
              </label>
              <div class="flex flex-wrap gap-2">
                <button v-for="d in DIETARY" :key="d.value" type="button"
                  @click="toggleDietary(d.value)"
                  :class="dietary.includes(d.value) ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/50'"
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-all">
                  <Icon :name="d.icon" :size="14" :type="dietary.includes(d.value) ? 'Bold' : 'Linear'" />
                  {{ txt(d) }}
                </button>
              </div>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" @click="step = 2"
                class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                <Icon name="ArrowLeft2" type="Bold" :size="14" />{{ locale === 'es' ? 'Atrás' : 'Back' }}
              </button>
              <button type="button" @click="step = 4" class="btn-primary flex-1 flex items-center justify-center gap-2">
                {{ locale === 'es' ? 'Continuar' : 'Continue' }}
                <Icon name="ArrowRight2" type="Bold" :size="18" />
              </button>
            </div>
          </div>

          <!-- STEP 4: Datos de contacto -->
          <div v-else-if="step === 4" class="space-y-5">
            <!-- Summary chips -->
            <div class="flex flex-wrap gap-2">
              <button type="button" @click="step = 1"
                class="inline-flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-sm font-medium hover:bg-brand/20 transition-colors">
                <Icon :name="eventTypeLabel?.icon || 'Star1'" type="Bold" :size="13" />
                {{ eventTypeLabel ? txt(eventTypeLabel) : (locale === 'es' ? 'Evento' : 'Event') }}
              </button>
              <button v-if="displayDate" type="button" @click="step = 2"
                class="inline-flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-sm font-medium hover:bg-brand/20 transition-colors capitalize">
                <Icon name="Calendar" type="Bold" :size="13" />{{ displayDate }}
              </button>
              <button type="button" @click="step = 2"
                class="inline-flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-sm font-medium hover:bg-brand/20 transition-colors">
                <Icon name="People" type="Bold" :size="13" />{{ guests }} {{ locale === 'es' ? 'invitados' : 'guests' }}
              </button>
              <button v-if="serviceLabel" type="button" @click="step = 3"
                class="inline-flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-sm font-medium hover:bg-brand/20 transition-colors">
                <Icon :name="serviceLabel.icon" type="Bold" :size="13" />{{ txt(serviceLabel) }}
              </button>
            </div>

            <h3 class="text-xl font-bold text-gray-900">{{ locale === 'es' ? 'Tus datos' : 'Your info' }}</h3>

            <form @submit.prevent="submit" class="space-y-4" novalidate>
              <div class="grid sm:grid-cols-2 gap-4">
                <label class="block">
                  <span class="text-sm font-semibold text-gray-600">{{ locale === 'es' ? 'Nombre completo *' : 'Full name *' }}</span>
                  <input v-model="name" type="text" required autocomplete="name"
                    class="w-full mt-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-shadow" />
                </label>
                <label class="block">
                  <span class="text-sm font-semibold text-gray-600">{{ locale === 'es' ? 'Teléfono *' : 'Phone *' }}</span>
                  <input v-model="phone" type="tel" required autocomplete="tel" placeholder="(707) 555-1234"
                    class="w-full mt-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-shadow" />
                </label>
              </div>
              <label class="block">
                <span class="text-sm font-semibold text-gray-600">
                  {{ locale === 'es' ? 'Correo electrónico' : 'Email address' }}
                  <span class="font-normal text-gray-400 ml-1">({{ locale === 'es' ? 'para recibir cotización' : 'to receive your quote' }})</span>
                </span>
                <input v-model="email" type="email" autocomplete="email"
                  class="w-full mt-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-shadow" />
              </label>
              <label class="block">
                <span class="text-sm font-semibold text-gray-600">{{ locale === 'es' ? 'Mensaje adicional (opcional)' : 'Additional message (optional)' }}</span>
                <textarea v-model="message" rows="3" autocomplete="off"
                  :placeholder="locale === 'es' ? 'Cuéntanos más detalles, preguntas, o requerimientos especiales…' : 'Tell us more details, questions, or special requirements…'"
                  class="w-full mt-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none resize-none transition-shadow" />
              </label>
              <ConsentCheckboxes
                v-model:terms="consentTerms"
                v-model:data="consentData"
                v-model:marketing="consentMarketing"
                :showMarketing="true"
              />
              <div class="flex gap-3 pt-1">
                <button type="button" @click="step = 3"
                  class="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                  <Icon name="ArrowLeft2" type="Bold" :size="14" />{{ locale === 'es' ? 'Atrás' : 'Back' }}
                </button>
                <button type="submit" :disabled="submitting || !consentTerms || !consentData || !name || !phone"
                  class="btn-primary flex-1 py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                  <svg v-if="submitting" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20" />
                  </svg>
                  <Icon v-else name="Send2" type="Bold" :size="20" />
                  {{ submitting ? (locale === 'es' ? 'Enviando…' : 'Sending…') : t('catering.submitBtn') }}
                </button>
              </div>
            </form>
          </div>
        </template>

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
