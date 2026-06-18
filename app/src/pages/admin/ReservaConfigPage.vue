<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import { useToast } from '@/composables/useToast'
import Icon from '@/components/ui/Icon.vue'

const toast = useToast()

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
]

interface Settings {
  isActive: boolean
  autoConfirm: boolean
  availableDays: number[]
  timeSlots: string[]
  minPartySize: number
  maxPartySize: number
  slotCapacity: number
  minAdvanceHours: number
  maxAdvanceDays: number
  closedMessage: { es: string; en: string } | null
}

interface BlockedDate {
  id: number
  date: string
  reason: string | null
}

const loading = ref(true)
const saving = ref(false)
const settings = ref<Settings>({
  isActive: true,
  autoConfirm: false,
  availableDays: [1, 2, 3, 4, 5, 6],
  timeSlots: ['12:00', '13:00', '14:00', '18:00', '19:00', '20:00', '21:00'],
  minPartySize: 1,
  maxPartySize: 8,
  slotCapacity: 30,
  minAdvanceHours: 2,
  maxAdvanceDays: 60,
  closedMessage: null,
})
const blockedDates = ref<BlockedDate[]>([])

// New time slot input
const newSlot = ref('')
const newBlockDate = ref('')
const newBlockReason = ref('')
const addingBlock = ref(false)
const closedMsgEs = ref('')
const closedMsgEn = ref('')

onMounted(async () => {
  await load()
})

async function load() {
  loading.value = true
  try {
    const [s, bd] = await Promise.all([
      api<Settings>('/api/admin/reservation-settings'),
      api<BlockedDate[]>('/api/admin/blocked-dates'),
    ])
    if (s) {
      settings.value = s
      closedMsgEs.value = s.closedMessage?.es ?? ''
      closedMsgEn.value = s.closedMessage?.en ?? ''
    }
    blockedDates.value = bd ?? []
  } catch (e: any) {
    toast.error('Error al cargar configuración', e?.message)
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    const payload = {
      ...settings.value,
      closedMessage: (closedMsgEs.value || closedMsgEn.value)
        ? { es: closedMsgEs.value, en: closedMsgEn.value }
        : null,
    }
    await api('/api/admin/reservation-settings', { method: 'PATCH', body: payload })
    toast.success('¡Configuración guardada!')
  } catch (e: any) {
    toast.error('Error al guardar', e?.message)
  } finally {
    saving.value = false
  }
}

function toggleDay(day: number) {
  const idx = settings.value.availableDays.indexOf(day)
  if (idx >= 0) settings.value.availableDays.splice(idx, 1)
  else settings.value.availableDays.push(day)
}

function addSlot() {
  const slot = newSlot.value.trim()
  if (!slot || !/^\d{2}:\d{2}$/.test(slot)) {
    toast.error('Formato inválido', 'Usa HH:mm — ej: 19:30')
    return
  }
  if (settings.value.timeSlots.includes(slot)) {
    toast.error('Ese horario ya existe')
    return
  }
  settings.value.timeSlots = [...settings.value.timeSlots, slot].sort()
  newSlot.value = ''
}

function removeSlot(slot: string) {
  settings.value.timeSlots = settings.value.timeSlots.filter(s => s !== slot)
}

async function addBlockedDate() {
  if (!newBlockDate.value) return
  addingBlock.value = true
  try {
    const row = await api<BlockedDate>('/api/admin/blocked-dates', {
      method: 'POST',
      body: { date: newBlockDate.value, reason: newBlockReason.value || undefined },
    })
    blockedDates.value = [...blockedDates.value, row].sort((a, b) => a.date.localeCompare(b.date))
    newBlockDate.value = ''
    newBlockReason.value = ''
    toast.success('Fecha bloqueada')
  } catch (e: any) {
    toast.error('Error', e?.message ?? 'Esa fecha ya está bloqueada')
  } finally {
    addingBlock.value = false
  }
}

async function removeBlockedDate(id: number) {
  try {
    await api(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' })
    blockedDates.value = blockedDates.value.filter(d => d.id !== id)
    toast.success('Fecha desbloqueada')
  } catch (e: any) {
    toast.error('Error', e?.message)
  }
}

function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8 pb-16">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Configuración de Reservas</h1>
        <p class="text-sm text-gray-500 mt-1">Horarios, capacidad y fechas bloqueadas</p>
      </div>
      <button @click="save" :disabled="saving || loading"
        class="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand/90 disabled:opacity-60 transition-colors">
        <Icon v-if="!saving" name="TickCircle" type="Bold" :size="18" />
        <svg v-else class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20" />
        </svg>
        {{ saving ? 'Guardando…' : 'Guardar cambios' }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-20 text-gray-400">Cargando…</div>

    <template v-else>
      <!-- Status toggle -->
      <section class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-gray-900">Estado de reservaciones</h2>
            <p class="text-sm text-gray-500 mt-0.5">Cuando está desactivado, los clientes ven un mensaje de no disponibilidad</p>
          </div>
          <button @click="settings.isActive = !settings.isActive"
            :class="settings.isActive ? 'bg-emerald-500' : 'bg-gray-300'"
            class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors">
            <span :class="settings.isActive ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" />
          </button>
        </div>

        <!-- Closed message (shown when isActive=false) -->
        <div v-if="!settings.isActive" class="mt-4 grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div>
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mensaje (español)</label>
            <input v-model="closedMsgEs" type="text" placeholder="Por el momento no tenemos disponibilidad"
              class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Message (English)</label>
            <input v-model="closedMsgEn" type="text" placeholder="Reservations are currently unavailable"
              class="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
          </div>
        </div>
      </section>

      <!-- Auto-confirm -->
      <section class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-semibold text-gray-900">Confirmación automática</h2>
            <p class="text-sm text-gray-500 mt-0.5">Las reservas se confirman al instante y el cliente recibe el email de confirmación inmediato</p>
          </div>
          <button @click="settings.autoConfirm = !settings.autoConfirm"
            :class="settings.autoConfirm ? 'bg-emerald-500' : 'bg-gray-300'"
            class="relative inline-flex h-7 w-12 items-center rounded-full transition-colors">
            <span :class="settings.autoConfirm ? 'translate-x-6' : 'translate-x-1'"
              class="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform" />
          </button>
        </div>
        <div v-if="settings.autoConfirm" class="mt-3 flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <Icon name="TickCircle" type="Bold" :size="16" class="text-emerald-500 shrink-0 mt-0.5" />
          <p class="text-xs text-emerald-700">Activo — todas las reservas nuevas se confirman automáticamente. No necesitas confirmar manualmente.</p>
        </div>
        <div v-else class="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <Icon name="Clock" type="Bold" :size="16" class="text-amber-500 shrink-0 mt-0.5" />
          <p class="text-xs text-amber-700">Desactivado — las reservas llegan como "pendientes" y deben ser confirmadas manualmente desde el panel de reservas.</p>
        </div>
      </section>

      <!-- Days of week -->
      <section class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 class="font-semibold text-gray-900 mb-4">Días disponibles</h2>
        <div class="flex gap-2 flex-wrap">
          <button v-for="day in DAYS" :key="day.value"
            @click="toggleDay(day.value)"
            :class="settings.availableDays.includes(day.value)
              ? 'bg-brand text-white border-brand'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand/50'"
            class="w-14 h-14 rounded-xl border-2 font-semibold text-sm transition-all">
            {{ day.label }}
          </button>
        </div>
      </section>

      <!-- Time slots -->
      <section class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 class="font-semibold text-gray-900 mb-4">Horarios disponibles</h2>
        <div class="flex flex-wrap gap-2 mb-4">
          <span v-for="slot in settings.timeSlots" :key="slot"
            class="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg px-3 py-1.5 text-sm font-medium">
            <Icon name="Clock" type="Bold" :size="14" />
            {{ slot }}
            <button @click="removeSlot(slot)" class="ml-0.5 hover:text-red-500 transition-colors">
              <Icon name="CloseCircle" type="Bold" :size="14" />
            </button>
          </span>
        </div>
        <div class="flex gap-2 items-center">
          <input v-model="newSlot" type="time" step="1800"
            class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
          <button @click="addSlot"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-brand/10 text-brand border border-brand/20 rounded-lg text-sm font-semibold hover:bg-brand/20 transition-colors">
            <Icon name="Add" type="Bold" :size="16" /> Agregar
          </button>
        </div>
      </section>

      <!-- Party size & capacity -->
      <section class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 class="font-semibold text-gray-900 mb-5">Capacidad y personas</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="field in [
            { key: 'minPartySize', label: 'Mín. personas', min: 1, max: 20 },
            { key: 'maxPartySize', label: 'Máx. personas', min: 1, max: 50 },
            { key: 'slotCapacity', label: 'Cap. por horario', min: 1, max: 999 },
          ]" :key="field.key" class="space-y-1">
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide">{{ field.label }}</label>
            <div class="flex items-center gap-1">
              <button @click="(settings as any)[field.key] = Math.max(field.min, (settings as any)[field.key] - 1)"
                class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center transition-colors">−</button>
              <input v-model.number="(settings as any)[field.key]" type="number"
                :min="field.min" :max="field.max"
                class="w-16 text-center rounded-lg border border-gray-200 py-1.5 text-sm font-bold focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
              <button @click="(settings as any)[field.key] = Math.min(field.max, (settings as any)[field.key] + 1)"
                class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 flex items-center justify-center transition-colors">+</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Advance booking window -->
      <section class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 class="font-semibold text-gray-900 mb-5">Ventana de reservas</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Anticipación mínima (horas)
            </label>
            <div class="flex items-center gap-2">
              <input v-model.number="settings.minAdvanceHours" type="range" min="0" max="72" step="1"
                class="w-full accent-brand" />
              <span class="w-16 text-center font-bold text-sm bg-gray-50 border border-gray-200 rounded-lg py-1.5 text-gray-800">
                {{ settings.minAdvanceHours }}h
              </span>
            </div>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Reserva máxima anticipada (días)
            </label>
            <div class="flex items-center gap-2">
              <input v-model.number="settings.maxAdvanceDays" type="range" min="7" max="365" step="1"
                class="w-full accent-brand" />
              <span class="w-16 text-center font-bold text-sm bg-gray-50 border border-gray-200 rounded-lg py-1.5 text-gray-800">
                {{ settings.maxAdvanceDays }}d
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Blocked dates -->
      <section class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 class="font-semibold text-gray-900 mb-4">Fechas bloqueadas</h2>
        <p class="text-sm text-gray-500 mb-4">En estas fechas no se aceptarán reservaciones (festivos, cierre temporal, etc.)</p>

        <!-- Add new blocked date -->
        <div class="flex flex-wrap gap-2 mb-5 items-end">
          <div>
            <label class="text-xs font-semibold text-gray-500 block mb-1">Fecha</label>
            <input v-model="newBlockDate" type="date"
              class="rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
          </div>
          <div class="flex-1 min-w-40">
            <label class="text-xs font-semibold text-gray-500 block mb-1">Razón (opcional)</label>
            <input v-model="newBlockReason" type="text" placeholder="Día festivo, cierre especial…"
              class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
          </div>
          <button @click="addBlockedDate" :disabled="!newBlockDate || addingBlock"
            class="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors">
            <Icon name="Calendar" type="Bold" :size="16" />
            Bloquear fecha
          </button>
        </div>

        <!-- List -->
        <div v-if="blockedDates.length === 0" class="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl">
          No hay fechas bloqueadas
        </div>
        <ul v-else class="space-y-2">
          <li v-for="bd in blockedDates" :key="bd.id"
            class="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <div class="flex items-center gap-3">
              <Icon name="CalendarRemove" type="Bold" :size="18" class="text-red-500" />
              <div>
                <span class="font-semibold text-sm text-gray-800">{{ formatDate(bd.date) }}</span>
                <span class="text-xs text-gray-400 ml-2">{{ bd.date }}</span>
                <p v-if="bd.reason" class="text-xs text-gray-500 mt-0.5">{{ bd.reason }}</p>
              </div>
            </div>
            <button @click="removeBlockedDate(bd.id)"
              class="text-gray-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-100">
              <Icon name="Trash" type="Bold" :size="18" />
            </button>
          </li>
        </ul>
      </section>

      <!-- Save button bottom -->
      <div class="flex justify-end">
        <button @click="save" :disabled="saving"
          class="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand/90 disabled:opacity-60 transition-colors">
          <Icon v-if="!saving" name="TickCircle" type="Bold" :size="18" />
          <svg v-else class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20" />
          </svg>
          {{ saving ? 'Guardando…' : 'Guardar configuración' }}
        </button>
      </div>
    </template>
  </div>
</template>
