<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'
import Icon from '@/components/ui/Icon.vue'

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
  { v: 'pending', l: 'Pendiente', cls: 'bg-amber-500/20 text-amber-300' },
  { v: 'confirmed', l: 'Confirmada', cls: 'bg-emerald-500/20 text-emerald-300' },
  { v: 'completed', l: 'Completada', cls: 'bg-white/10 text-white/60' },
  { v: 'cancelled', l: 'Cancelada', cls: 'bg-accent/20 text-accent' },
  { v: 'no_show', l: 'No-show', cls: 'bg-purple-500/20 text-purple-300' }
]

const rows = ref<Reservation[]>([])
const loading = ref(true)
const filterStatus = ref<string>('all')
const filterDate = ref<string>('')

const open = ref(false)
const editing = ref<Reservation | null>(null)
const saving = ref(false)

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/reservations') } finally { loading.value = false }
}

const filtered = computed(() => rows.value.filter(r => {
  if (filterStatus.value !== 'all' && r.status !== filterStatus.value) return false
  if (filterDate.value && r.date !== filterDate.value) return false
  return true
}))

function openEdit(r: Reservation) { editing.value = { ...r }; open.value = true }
async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await api(`/api/admin/reservations/${editing.value.id}`, { method: 'PATCH', body: {
      status: editing.value.status,
      adminNotes: editing.value.adminNotes || undefined,
      partySize: editing.value.partySize,
      date: editing.value.date,
      time: editing.value.time
    }})
    open.value = false
    await load()
  } finally { saving.value = false }
}
async function remove(r: Reservation) {
  if (!confirm(`¿Borrar reserva de ${r.name}?`)) return
  await api(`/api/admin/reservations/${r.id}`, { method: 'DELETE' })
  await load()
}
async function quickStatus(r: Reservation, status: Reservation['status']) {
  await api(`/api/admin/reservations/${r.id}`, { method: 'PATCH', body: { status } })
  await load()
}

function statusBadge(s: string) {
  const found = STATUS.find(x => x.v === s)
  return `<span class="text-[10px] uppercase px-2 py-1 rounded-full ${found?.cls || 'bg-white/10'}">${found?.l || s}</span>`
}

const columns = [
  { key: 'date', label: 'Fecha · Hora', render: (r: Reservation) => `<div class="font-medium">${r.date}</div><div class="text-xs text-white/50">${r.time}</div>` },
  { key: 'name', label: 'Cliente', render: (r: Reservation) => `<div>${r.name}</div><div class="text-xs text-white/50">${r.phone}${r.email ? ' · ' + r.email : ''}</div>` },
  { key: 'partySize', label: 'Personas', width: '90px', render: (r: Reservation) => `<span class="text-base font-semibold">${r.partySize}</span>` },
  { key: 'notes', label: 'Notas', render: (r: Reservation) => r.notes ? `<span class="text-xs text-white/60">${r.notes}</span>` : '—' },
  { key: 'status', label: 'Estado', render: statusBadge }
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl">Reservas</h1>
        <p class="text-white/50 text-sm">{{ filtered.length }} de {{ rows.length }}</p>
      </div>
      <div class="ml-auto flex gap-2">
        <input v-model="filterDate" type="date" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm" />
        <select v-model="filterStatus" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm">
          <option value="all">Todos los estados</option>
          <option v-for="s in STATUS" :key="s.v" :value="s.v">{{ s.l }}</option>
        </select>
      </div>
    </header>

    <!-- Acciones rápidas: solo pendientes -->
    <div v-if="rows.some(r => r.status === 'pending')" class="mb-4 flex flex-wrap gap-2">
      <span class="text-xs text-white/60 self-center mr-2">Acción rápida:</span>
      <button v-for="r in rows.filter(x => x.status === 'pending').slice(0, 4)" :key="r.id" @click="quickStatus(r, 'confirmed')" class="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25">
        <Icon name="TickCircle" :size="12" />
        <span>Confirmar {{ r.name }} ({{ r.date }} {{ r.time }})</span>
      </button>
    </div>

    <DataTable :rows="filtered" :columns="columns as any" :loading="loading" empty="Sin reservas" @edit="openEdit" @delete="remove" />

    <AdminModal :open="open && !!editing" :title="`Reserva · ${editing?.name}`" size="md" @close="open = false">
      <div v-if="editing" class="grid sm:grid-cols-2 gap-4">
        <FormField label="Estado">
          <select v-model="editing.status" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option v-for="s in STATUS" :key="s.v" :value="s.v">{{ s.l }}</option>
          </select>
        </FormField>
        <FormField label="Personas"><input v-model.number="editing.partySize" type="number" min="1" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Fecha"><input v-model="editing.date" type="date" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Hora"><input v-model="editing.time" type="time" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Notas del cliente" class="sm:col-span-2">
          <div class="text-sm text-white/70 bg-night rounded-lg p-3 border border-white/10">{{ editing.notes || '—' }}</div>
        </FormField>
        <FormField label="Notas internas" class="sm:col-span-2">
          <textarea v-model="editing.adminNotes" rows="3" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea>
        </FormField>
      </div>
      <template #footer>
        <button @click="open = false" class="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">Cerrar</button>
        <button @click="save" :disabled="saving" class="text-sm px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      </template>
    </AdminModal>
  </div>
</template>
