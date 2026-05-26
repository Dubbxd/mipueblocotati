<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/lib/api'
import ConsentCheckboxes from '@/components/ui/ConsentCheckboxes.vue'
import Icon from '@/components/ui/Icon.vue'
import { useToast } from '@/composables/useToast'

const { locale } = useI18n()
const toast = useToast()

// ─── Config from server ──────────────────────────────────────────
interface ReserveConfig {
  settings: {
    isActive: boolean
    availableDays: number[]
    timeSlots: string[]
    minPartySize: number
    maxPartySize: number
    slotCapacity: number
    minAdvanceHours: number
    maxAdvanceDays: number
    closedMessage: { es: string; en: string } | null
  }
  blockedDates: string[]
}

const config = ref<ReserveConfig | null>(null)
const configLoading = ref(true)

onMounted(async () => {
  try {
    config.value = await api<ReserveConfig>('/api/public/reservation-config', { auth: false })
  } catch {
    config.value = {
      settings: {
        isActive: true,
        availableDays: [1, 2, 3, 4, 5, 6],
        timeSlots: ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'],
        minPartySize: 1, maxPartySize: 8, slotCapacity: 30,
        minAdvanceHours: 2, maxAdvanceDays: 60, closedMessage: null,
      },
      blockedDates: [],
    }
  } finally {
    configLoading.value = false
  }
})

// ─── Step state ──────────────────────────────────────────────────
const step = ref<1 | 2 | 3 | 4>(1)
const submitted = ref(false)
const submitting = ref(false)

const partySize = ref(2)
const selectedDate = ref('')
const selectedTime = ref('')
const name = ref('')
const phone = ref('')
const email = ref('')
const notes = ref('')
const consentTerms = ref(false)
const consentData = ref(false)

// ─── Calendar logic ──────────────────────────────────────────────
const today = new Date()
today.setHours(0, 0, 0, 0)
const calendarMonth = ref(new Date(today.getFullYear(), today.getMonth(), 1))

const calendarTitle = computed(() =>
  calendarMonth.value.toLocaleDateString(locale.value === 'es' ? 'es-MX' : 'en-US', { month: 'long', year: 'numeric' })
)

const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: Array<{ date: Date; iso: string; disabled: boolean } | null> = []

  for (let i = 0; i < firstDay; i++) days.push(null)

  const cfg = config.value?.settings
  const minDate = new Date(today.getTime() + (cfg?.minAdvanceHours ?? 2) * 3600000)
  minDate.setHours(0, 0, 0, 0)
  const maxDate = new Date(today.getTime() + (cfg?.maxAdvanceDays ?? 60) * 86400000)

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const disabled =
      !(cfg?.availableDays.includes(date.getDay()) ?? true) ||
      (config.value?.blockedDates.includes(iso) ?? false) ||
      date < minDate || date > maxDate
    days.push({ date, iso, disabled })
  }
  return days
})

function prevMonth() {
  const d = new Date(calendarMonth.value)
  d.setMonth(d.getMonth() - 1)
  if (d >= new Date(today.getFullYear(), today.getMonth(), 1)) calendarMonth.value = d
}
function nextMonth() {
  const d = new Date(calendarMonth.value)
  d.setMonth(d.getMonth() + 1)
  calendarMonth.value = d
}
function selectDate(iso: string) {
  selectedDate.value = iso
  step.value = 3
}

// ─── Time slots ──────────────────────────────────────────────────
const timeSlots = computed(() => config.value?.settings.timeSlots ?? [])

function formatSlot(slot: string) {
  const [h, m] = slot.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

// ─── Party size ──────────────────────────────────────────────────
const minParty = computed(() => config.value?.settings.minPartySize ?? 1)
const maxParty = computed(() => config.value?.settings.maxPartySize ?? 8)
function changeParty(delta: number) {
  partySize.value = Math.min(maxParty.value, Math.max(minParty.value, partySize.value + delta))
}

const displayDate = computed(() => {
  if (!selectedDate.value) return ''
  return new Date(selectedDate.value + 'T12:00:00').toLocaleDateString(
    locale.value === 'es' ? 'es-MX' : 'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' }
  )
})

// ─── Submit ──────────────────────────────────────────────────────
async function submit() {
  submitting.value = true
  try {
    await api('/api/public/reservations', {
      method: 'POST', auth: false,
      body: {
        name: name.value, phone: phone.value,
        email: email.value || undefined,
        partySize: partySize.value,
        date: selectedDate.value, time: selectedTime.value,
        notes: notes.value || undefined,
        consentTerms: consentTerms.value, consentData: consentData.value,
      },
    })
    submitted.value = true
  } catch (e: any) {
    toast.error(
      locale.value === 'es' ? 'No pudimos enviar tu reserva' : 'Could not send your reservation',
      e?.message && !e.message.startsWith('HTTP') ? e.message : (locale.value === 'es' ? 'Revisa los datos e inténtalo de nuevo.' : 'Check your info and try again.')
    )
  } finally {
    submitting.value = false
  }
}

const WEEK_LABELS = {
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}
const weekLabels = computed(() => WEEK_LABELS[locale.value as 'es' | 'en'] ?? WEEK_LABELS.es)
</script>

<template>
  <main class="container-page pb-16 max-w-2xl">
    <div class="mb-8">
      <h1 class="font-display text-3xl sm:text-4xl font-bold text-secondary-dark">
        {{ locale === 'es' ? 'Reservar mesa' : 'Reserve a table' }}
      </h1>
      <p class="text-ink-muted mt-1 text-sm">
        {{ locale === 'es' ? 'Asegura tu lugar — confirmación inmediata' : 'Secure your spot — instant confirmation' }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="configLoading" class="flex items-center justify-center py-20">
      <svg class="w-8 h-8 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20" />
      </svg>
    </div>

    <!-- Reservations closed -->
    <div v-else-if="config && !config.settings.isActive"
      class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
      <Icon name="CalendarRemove" type="Bold" :size="40" class="text-amber-500 mx-auto mb-3" />
      <h2 class="font-display text-xl font-bold text-amber-800 mb-2">
        {{ locale === 'es' ? 'Reservaciones no disponibles' : 'Reservations unavailable' }}
      </h2>
      <p class="text-amber-700 text-sm">
        {{ locale === 'es'
          ? (config.settings.closedMessage?.es || 'Por el momento no tenemos disponibilidad. Puedes llamarnos directamente.')
          : (config.settings.closedMessage?.en || 'Reservations are currently unavailable. Please call us directly.') }}
      </p>
    </div>

    <!-- Success -->
    <div v-else-if="submitted" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-3">
      <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
        <Icon name="TickCircle" type="Bold" :size="36" class="text-emerald-600" />
      </div>
      <h2 class="font-display text-2xl font-bold text-emerald-800">
        {{ locale === 'es' ? '¡Reservación recibida!' : 'Reservation received!' }}
      </h2>
      <p class="text-emerald-700 text-sm">
        {{ locale === 'es' ? 'Te confirmaremos pronto a' : 'We\'ll confirm shortly at' }}
        <strong>{{ email || phone }}</strong>
      </p>
      <div class="bg-white rounded-xl border border-emerald-100 p-4 text-left mt-4 space-y-2 text-sm max-w-xs mx-auto">
        <div class="flex items-center gap-2 text-gray-700 capitalize">
          <Icon name="Calendar" type="Bold" :size="16" class="text-emerald-500 shrink-0" />
          {{ displayDate }}
        </div>
        <div class="flex items-center gap-2 text-gray-700">
          <Icon name="Clock" type="Bold" :size="16" class="text-emerald-500 shrink-0" />
          {{ formatSlot(selectedTime) }}
        </div>
        <div class="flex items-center gap-2 text-gray-700">
          <Icon name="People" type="Bold" :size="16" class="text-emerald-500 shrink-0" />
          {{ partySize }} {{ locale === 'es' ? 'personas' : 'guests' }}
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

      <!-- STEP 1: Party size -->
      <div v-if="step === 1" class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ locale === 'es' ? '¿Cuántas personas?' : 'How many guests?' }}</h2>
          <p class="text-sm text-gray-500 mt-1">{{ locale === 'es' ? `Mín. ${minParty} · Máx. ${maxParty} personas` : `Min ${minParty} · Max ${maxParty} guests` }}</p>
        </div>
        <div class="flex items-center justify-center gap-6 py-8">
          <button @click="changeParty(-1)" :disabled="partySize <= minParty"
            class="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center text-3xl font-bold transition-all active:scale-95">−</button>
          <div class="text-center">
            <div class="text-7xl font-black text-brand leading-none">{{ partySize }}</div>
            <div class="text-sm text-gray-400 mt-2 font-medium">{{ locale === 'es' ? 'personas' : 'guests' }}</div>
          </div>
          <button @click="changeParty(1)" :disabled="partySize >= maxParty"
            class="w-14 h-14 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40 flex items-center justify-center text-3xl font-bold transition-all active:scale-95">+</button>
        </div>
        <div class="flex gap-2 flex-wrap justify-center">
          <button v-for="n in maxParty" :key="n" @click="partySize = n"
            :class="partySize === n ? 'bg-brand text-white border-brand shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-brand/50'"
            class="w-11 h-11 rounded-xl border-2 font-semibold text-sm transition-all">{{ n }}</button>
        </div>
        <button @click="step = 2" class="w-full btn-primary mt-4 flex items-center justify-center gap-2">
          {{ locale === 'es' ? 'Elegir fecha' : 'Choose date' }}
          <Icon name="ArrowRight2" type="Bold" :size="18" />
        </button>
      </div>

      <!-- STEP 2: Calendar -->
      <div v-else-if="step === 2" class="space-y-4">
        <h2 class="text-xl font-bold text-gray-900">{{ locale === 'es' ? '¿Qué día?' : 'Which day?' }}</h2>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <button @click="prevMonth" class="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Icon name="ArrowLeft2" type="Bold" :size="18" class="text-gray-500" />
            </button>
            <span class="font-semibold text-gray-800 capitalize">{{ calendarTitle }}</span>
            <button @click="nextMonth" class="w-9 h-9 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Icon name="ArrowRight2" type="Bold" :size="18" class="text-gray-500" />
            </button>
          </div>
          <div class="grid grid-cols-7 px-3 pt-3 pb-1">
            <div v-for="label in weekLabels" :key="label" class="text-center text-xs font-bold text-gray-400 uppercase tracking-wide py-1">{{ label }}</div>
          </div>
          <div class="grid grid-cols-7 gap-0.5 px-3 pb-4">
            <template v-for="(day, idx) in calendarDays" :key="idx">
              <div v-if="!day" />
              <button v-else @click="!day.disabled && selectDate(day.iso)"
                :class="[
                  'aspect-square rounded-xl text-sm font-semibold transition-all flex items-center justify-center mx-auto w-full max-w-[2.5rem]',
                  day.iso === selectedDate ? 'bg-brand text-white shadow-sm scale-110' :
                  day.disabled ? 'text-gray-200 cursor-not-allowed' :
                  'hover:bg-brand/10 text-gray-700 hover:text-brand cursor-pointer active:scale-95',
                ]"
                :disabled="day.disabled">
                {{ day.date.getDate() }}
              </button>
            </template>
          </div>
          <div class="px-4 pb-3 flex gap-4 text-xs text-gray-400 border-t border-gray-50 pt-2">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-gray-100 border border-gray-200" />{{ locale === 'es' ? 'No disponible' : 'Unavailable' }}</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-brand" />{{ locale === 'es' ? 'Seleccionado' : 'Selected' }}</span>
          </div>
        </div>
        <button @click="step = 1" class="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
          <Icon name="ArrowLeft2" type="Bold" :size="14" />{{ locale === 'es' ? 'Cambiar personas' : 'Change guests' }}
        </button>
      </div>

      <!-- STEP 3: Time slot -->
      <div v-else-if="step === 3" class="space-y-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ locale === 'es' ? '¿A qué hora?' : 'What time?' }}</h2>
          <p class="text-sm text-gray-500 mt-1 capitalize">{{ displayDate }}</p>
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
          <button v-for="slot in timeSlots" :key="slot" @click="selectedTime = slot; step = 4"
            :class="selectedTime === slot ? 'bg-brand text-white border-brand shadow-sm scale-105' : 'bg-white text-gray-700 border-gray-200 hover:border-brand/50 hover:text-brand'"
            class="border-2 rounded-xl py-4 font-bold text-sm transition-all active:scale-95 flex flex-col items-center gap-1">
            <Icon name="Clock" type="Bold" :size="18" :class="selectedTime === slot ? 'text-white/80' : 'text-gray-400'" />
            {{ formatSlot(slot) }}
          </button>
        </div>
        <button @click="step = 2" class="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
          <Icon name="ArrowLeft2" type="Bold" :size="14" />{{ locale === 'es' ? 'Cambiar fecha' : 'Change date' }}
        </button>
      </div>

      <!-- STEP 4: Contact info -->
      <div v-else-if="step === 4" class="space-y-5">
        <!-- Summary chips -->
        <div class="flex flex-wrap gap-2">
          <button @click="step = 1" class="inline-flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-sm font-medium hover:bg-brand/20 transition-colors">
            <Icon name="People" type="Bold" :size="13" />{{ partySize }} {{ locale === 'es' ? 'personas' : 'guests' }}
          </button>
          <button @click="step = 2" class="inline-flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-sm font-medium hover:bg-brand/20 transition-colors capitalize">
            <Icon name="Calendar" type="Bold" :size="13" />{{ displayDate }}
          </button>
          <button @click="step = 3" class="inline-flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/20 rounded-full px-3 py-1 text-sm font-medium hover:bg-brand/20 transition-colors">
            <Icon name="Clock" type="Bold" :size="13" />{{ formatSlot(selectedTime) }}
          </button>
        </div>

        <h2 class="text-xl font-bold text-gray-900">{{ locale === 'es' ? 'Tus datos' : 'Your info' }}</h2>

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
              <span class="font-normal text-gray-400 ml-1">{{ locale === 'es' ? '(para confirmación)' : '(for confirmation)' }}</span>
            </span>
            <input v-model="email" type="email" autocomplete="email"
              class="w-full mt-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none transition-shadow" />
          </label>
          <label class="block">
            <span class="text-sm font-semibold text-gray-600">{{ locale === 'es' ? 'Notas especiales (opcional)' : 'Special requests (optional)' }}</span>
            <textarea v-model="notes" rows="2" autocomplete="off"
              :placeholder="locale === 'es' ? 'Alergias, ocasión especial, silla para bebé…' : 'Allergies, special occasion, high chair…'"
              class="w-full mt-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none resize-none transition-shadow" />
          </label>
          <ConsentCheckboxes v-model:terms="consentTerms" v-model:data="consentData" />
          <button type="submit" :disabled="submitting || !consentTerms || !consentData || !name || !phone"
            class="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            <svg v-if="submitting" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20" />
            </svg>
            <Icon v-else name="CalendarTick" type="Bold" :size="20" />
            {{ submitting ? (locale === 'es' ? 'Enviando…' : 'Sending…') : (locale === 'es' ? 'Confirmar reservación' : 'Confirm reservation') }}
          </button>
        </form>
      </div>
    </template>
  </main>
</template>
