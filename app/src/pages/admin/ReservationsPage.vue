<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import { useToast } from '@/composables/useToast'
import Icon from '@/components/ui/Icon.vue'

const toast = useToast()

type Reservation = {
  id: number
  locationId?: number | null
  name: string
  phone: string
  email?: string | null
  partySize: number
  date: string
  time: string
  notes?: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  adminNotes?: string | null
  createdAt: string
}

const STATUS = [
  { v: 'pending',   l: 'Pendiente',  icon: 'Clock',      cls: 'bg-amber-500/20 text-amber-300',   dot: 'bg-amber-400' },
  { v: 'confirmed', l: 'Confirmada', icon: 'TickCircle', cls: 'bg-emerald-500/20 text-emerald-300', dot: 'bg-emerald-400' },
  { v: 'completed', l: 'Completada', icon: 'TickSquare', cls: 'bg-white/10 text-white/50',         dot: 'bg-white/40' },
  { v: 'cancelled', l: 'Cancelada',  icon: 'CloseCircle', cls: 'bg-red-500/20 text-red-300',       dot: 'bg-red-400' },
  { v: 'no_show',   l: 'No-show',    icon: 'InfoCircle', cls: 'bg-purple-500/20 text-purple-300',  dot: 'bg-purple-400' },
]

const rows = ref<Reservation[]>([])
const loading = ref(true)
const filterStatus = ref('all')
const filterDate = ref('')
const selected = ref<Reservation | null>(null)
const saving = ref(false)
const cancelReason = ref('')
const showCancelConfirm = ref(false)
const editStatus = ref('')
const editNotes = ref('')

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/reservations') } finally { loading.value = false }
}

const filtered = computed(() => rows.value.filter(r => {
  if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false
  if (filterDate.value && r.date !== filterDate.value) return false
  return true
}))

const pendingCount = computed(() => rows.value.filter(r => r.status === 'pending').length)
const todayCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return rows.value.filter(r => r.date === today && ['pending', 'confirmed'].includes(r.status)).length
})

function statusInfo(s: string) {
  return STATUS.find(x => x.v === s) ?? STATUS[0]
}

function selectRow(r: Reservation) {
  selected.value = { ...r }
  editStatus.value = r.status
  editNotes.value = r.adminNotes ?? ''
  showCancelConfirm.value = false
  cancelReason.value = ''
}

function closeDetail() {
  selected.value = null
}

function fmtDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
}

function fmtTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtCreated(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

async function saveChanges() {
  if (!selected.value) return
  saving.value = true
  try {
    await api(`/api/admin/reservations/${selected.value.id}`, {
      method: 'PATCH',
      body: { status: editStatus.value, adminNotes: editNotes.value || undefined },
    })
    toast.success('Reserva actualizada')
    closeDetail()
    await load()
  } catch (e: any) {
    toast.error('Error al guardar', e?.message)
  } finally {
    saving.value = false
  }
}

async function confirmReservation(r: Reservation) {
  await api(`/api/admin/reservations/${r.id}`, { method: 'PATCH', body: { status: 'confirmed' } })
  toast.success(`${r.name} confirmada`)
  await load()
  if (selected.value?.id === r.id) selected.value.status = 'confirmed'
}

async function cancelReservation() {
  if (!selected.value) return
  saving.value = true
  try {
    await api(`/api/admin/reservations/${selected.value.id}/cancel`, {
      method: 'POST',
      body: { reason: cancelReason.value || undefined },
    })
    toast.success('Reserva cancelada — email enviado al cliente')
    closeDetail()
    await load()
  } catch (e: any) {
    toast.error('Error al cancelar', e?.message)
  } finally {
    saving.value = false
  }
}

async function deleteReservation(r: Reservation) {
  if (!confirm(`¿Eliminar permanentemente la reserva de ${r.name}?`)) return
  await api(`/api/admin/reservations/${r.id}`, { method: 'DELETE' })
  toast.success('Reserva eliminada')
  if (selected.value?.id === r.id) closeDetail()
  await load()
}

onMounted(load)
</script>

<template>
  <div class="flex gap-0 h-full">

    <!-- LEFT: List -->
    <div :class="selected ? 'hidden lg:block lg:w-1/2 xl:w-3/5' : 'w-full'" class="space-y-4">

      <!-- Header -->
      <header class="flex flex-wrap items-center gap-3">
        <div>
          <h1 class="font-display text-2xl">Reservas</h1>
          <p class="text-white/50 text-sm">
            {{ filtered.length }} reservas
            <span v-if="pendingCount" class="text-amber-300"> · {{ pendingCount }} pendientes</span>
            <span v-if="todayCount" class="text-emerald-300"> · {{ todayCount }} hoy</span>
          </p>
        </div>
        <div class="ml-auto flex gap-2">
          <input v-model="filterDate" type="date" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm" />
          <select v-model="filterStatus" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option value="all">Todos</option>
            <option v-for="s in STATUS" :key="s.v" :value="s.v">{{ s.l }}</option>
          </select>
        </div>
      </header>

      <!-- Quick confirm pending -->
      <div v-if="pendingCount && filterStatus === 'all'" class="flex flex-wrap gap-2">
        <button v-for="r in rows.filter(x => x.status === 'pending').slice(0, 5)" :key="r.id"
          @click="confirmReservation(r)"
          class="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25 transition-colors">
          <Icon name="TickCircle" :size="12" />
          Confirmar {{ r.name }}
        </button>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-white/40">Cargando…</div>

      <!-- Empty -->
      <div v-else-if="!filtered.length" class="text-center py-20 text-white/30">
        <Icon name="Calendar" :size="40" class="mx-auto mb-3 opacity-40" />
        <p>Sin reservas</p>
      </div>

      <!-- Reservation cards -->
      <div v-else class="space-y-2">
        <button v-for="r in filtered" :key="r.id"
          @click="selectRow(r)"
          :class="selected?.id === r.id ? 'ring-2 ring-brand bg-white/10' : 'bg-white/5 hover:bg-white/8'"
          class="w-full text-left rounded-xl p-4 border border-white/10 transition-all">
          <div class="flex items-start gap-4">
            <!-- Date block -->
            <div class="shrink-0 w-14 text-center">
              <div class="text-2xl font-bold text-white leading-tight">{{ r.date.split('-')[2] }}</div>
              <div class="text-[10px] uppercase text-white/50 font-semibold">{{ fmtDate(r.date).split(' ').slice(0, 2).join(' ') }}</div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-white truncate">{{ r.name }}</span>
                <span :class="statusInfo(r.status).cls"
                  class="text-[10px] uppercase px-2 py-0.5 rounded-full font-bold shrink-0">
                  {{ statusInfo(r.status).l }}
                </span>
              </div>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/50">
                <span class="inline-flex items-center gap-1"><Icon name="Clock" :size="11" />{{ fmtTime(r.time) }}</span>
                <span class="inline-flex items-center gap-1"><Icon name="People" :size="11" />{{ r.partySize }} personas</span>
                <span class="inline-flex items-center gap-1"><Icon name="Call" :size="11" />{{ r.phone }}</span>
              </div>
              <p v-if="r.notes" class="text-xs text-white/40 mt-1 truncate">{{ r.notes }}</p>
            </div>

            <!-- Arrow -->
            <Icon name="ArrowRight2" :size="16" class="text-white/20 shrink-0 mt-2" />
          </div>
        </button>
      </div>
    </div>

    <!-- RIGHT: Detail panel -->
    <div v-if="selected"
      :class="selected ? 'w-full lg:w-1/2 xl:w-2/5' : ''"
      class="lg:border-l border-white/10 lg:pl-6 space-y-5">

      <!-- Back button (mobile) -->
      <button @click="closeDetail" class="lg:hidden inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-2">
        <Icon name="ArrowLeft2" :size="14" /> Volver a la lista
      </button>

      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-xl font-bold text-white">{{ selected.name }}</h2>
          <p class="text-sm text-white/50">Reserva #{{ selected.id }} · {{ fmtCreated(selected.createdAt) }}</p>
        </div>
        <button @click="closeDetail" class="hidden lg:block text-white/30 hover:text-white p-1">
          <Icon name="CloseCircle" :size="20" />
        </button>
      </div>

      <!-- Status badge -->
      <div class="flex items-center gap-2">
        <span :class="statusInfo(selected.status).cls"
          class="inline-flex items-center gap-1.5 text-xs uppercase px-3 py-1.5 rounded-full font-bold">
          <Icon :name="statusInfo(selected.status).icon" type="Bold" :size="14" />
          {{ statusInfo(selected.status).l }}
        </span>
      </div>

      <!-- Detail cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white/5 rounded-xl p-4 border border-white/10">
          <p class="text-[10px] uppercase text-white/40 font-bold tracking-wide mb-1">Fecha</p>
          <p class="text-white font-semibold">{{ fmtDate(selected.date) }}</p>
          <p class="text-xs text-white/50">{{ selected.date }}</p>
        </div>
        <div class="bg-white/5 rounded-xl p-4 border border-white/10">
          <p class="text-[10px] uppercase text-white/40 font-bold tracking-wide mb-1">Hora</p>
          <p class="text-white font-semibold">{{ fmtTime(selected.time) }}</p>
        </div>
        <div class="bg-white/5 rounded-xl p-4 border border-white/10">
          <p class="text-[10px] uppercase text-white/40 font-bold tracking-wide mb-1">Personas</p>
          <p class="text-2xl font-bold text-white">{{ selected.partySize }}</p>
        </div>
        <div class="bg-white/5 rounded-xl p-4 border border-white/10">
          <p class="text-[10px] uppercase text-white/40 font-bold tracking-wide mb-1">Contacto</p>
          <p class="text-white text-sm truncate">{{ selected.phone }}</p>
          <p v-if="selected.email" class="text-xs text-white/50 truncate">{{ selected.email }}</p>
        </div>
      </div>

      <!-- Notes -->
      <div v-if="selected.notes" class="bg-white/5 rounded-xl p-4 border border-white/10">
        <p class="text-[10px] uppercase text-white/40 font-bold tracking-wide mb-2">Notas del cliente</p>
        <p class="text-sm text-white/70">{{ selected.notes }}</p>
      </div>

      <!-- Edit section -->
      <div class="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
        <p class="text-[10px] uppercase text-white/40 font-bold tracking-wide">Gestionar reserva</p>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-white/50 block mb-1">Estado</label>
            <select v-model="editStatus" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
              <option v-for="s in STATUS" :key="s.v" :value="s.v">{{ s.l }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="text-xs text-white/50 block mb-1">Notas internas</label>
          <textarea v-model="editNotes" rows="2" placeholder="Notas visibles solo para el staff…"
            class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm resize-none" />
        </div>
        <button @click="saveChanges" :disabled="saving"
          class="w-full py-2 rounded-lg bg-brand hover:bg-brand-light text-white text-sm font-semibold transition-colors disabled:opacity-60">
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </div>

      <!-- Actions -->
      <div class="space-y-2">
        <!-- Confirm -->
        <button v-if="selected.status === 'pending'" @click="confirmReservation(selected!); selected!.status = 'confirmed'"
          class="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors">
          <Icon name="TickCircle" type="Bold" :size="16" /> Confirmar reserva
        </button>

        <!-- Cancel -->
        <div v-if="!showCancelConfirm && !['cancelled', 'completed'].includes(selected.status)">
          <button @click="showCancelConfirm = true"
            class="w-full py-2.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors">
            <Icon name="CloseCircle" type="Bold" :size="16" /> Cancelar reserva
          </button>
        </div>

        <!-- Cancel confirmation -->
        <div v-if="showCancelConfirm" class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
          <p class="text-sm text-red-200 font-semibold">
            <Icon name="Danger" type="Bold" :size="14" class="inline mr-1" />
            {{ selected.email ? 'Se enviara un email de cancelacion al cliente.' : 'El cliente no tiene email — no recibirá notificación.' }}
          </p>
          <div>
            <label class="text-xs text-white/50 block mb-1">Razón (opcional — se incluye en el email)</label>
            <input v-model="cancelReason" type="text" placeholder="Ej: Cierre por evento privado"
              class="w-full bg-night border border-red-500/30 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div class="flex gap-2">
            <button @click="showCancelConfirm = false"
              class="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">
              No, volver
            </button>
            <button @click="cancelReservation" :disabled="saving"
              class="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60">
              {{ saving ? 'Cancelando…' : 'Confirmar cancelación' }}
            </button>
          </div>
        </div>

        <!-- Delete -->
        <button @click="deleteReservation(selected!)"
          class="w-full py-2 rounded-lg text-white/30 hover:text-red-400 text-xs transition-colors">
          Eliminar permanentemente
        </button>
      </div>
    </div>
  </div>
</template>
