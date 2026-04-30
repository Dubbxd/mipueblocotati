<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'

type Catering = {
  id: number
  name: string; phone: string; email: string
  eventType?: string | null
  eventDate?: string | null
  guests?: number | null
  budget?: string | null
  message?: string | null
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
  adminNotes?: string | null
  createdAt: string
}

const STATUS = [
  { v: 'new', l: 'Nueva', cls: 'bg-amber-500/20 text-amber-300' },
  { v: 'contacted', l: 'Contactado', cls: 'bg-sky-500/20 text-sky-300' },
  { v: 'quoted', l: 'Cotizado', cls: 'bg-purple-500/20 text-purple-300' },
  { v: 'won', l: 'Ganado', cls: 'bg-emerald-500/20 text-emerald-300' },
  { v: 'lost', l: 'Perdido', cls: 'bg-white/10 text-white/50' }
]

const rows = ref<Catering[]>([])
const loading = ref(true)
const filterStatus = ref('all')
const open = ref(false)
const editing = ref<Catering | null>(null)
const saving = ref(false)

async function load() { loading.value = true; try { rows.value = await api('/api/admin/catering') } finally { loading.value = false } }
const filtered = computed(() => filterStatus.value === 'all' ? rows.value : rows.value.filter(r => r.status === filterStatus.value))

function openEdit(r: Catering) { editing.value = { ...r }; open.value = true }
async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await api(`/api/admin/catering/${editing.value.id}`, { method: 'PATCH', body: {
      status: editing.value.status,
      adminNotes: editing.value.adminNotes || undefined
    }})
    open.value = false; await load()
  } finally { saving.value = false }
}
async function remove(r: Catering) {
  if (!confirm(`¿Borrar solicitud de ${r.name}?`)) return
  await api(`/api/admin/catering/${r.id}`, { method: 'DELETE' })
  await load()
}

function statusBadge(s: string) {
  const f = STATUS.find(x => x.v === s)
  return `<span class="text-[10px] uppercase px-2 py-1 rounded-full ${f?.cls || ''}">${f?.l || s}</span>`
}

const columns = [
  { key: 'createdAt', label: 'Fecha', render: (r: Catering) => `<div class="text-xs">${new Date(r.createdAt).toLocaleDateString()}</div>` },
  { key: 'name', label: 'Cliente', render: (r: Catering) => `<div class="font-medium">${r.name}</div><div class="text-xs text-white/50">${r.phone} · ${r.email}</div>` },
  { key: 'eventType', label: 'Evento', render: (r: Catering) => `<div>${r.eventType || '—'}</div><div class="text-xs text-white/50">${r.eventDate || ''} · ${r.guests || '?'} pers</div>` },
  { key: 'budget', label: 'Presupuesto', render: (r: Catering) => r.budget ? `$${r.budget}` : '—' },
  { key: 'status', label: 'Estado', render: statusBadge }
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl">Catering</h1>
        <p class="text-white/50 text-sm">{{ filtered.length }} solicitudes</p>
      </div>
      <select v-model="filterStatus" class="ml-auto bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm">
        <option value="all">Todos los estados</option>
        <option v-for="s in STATUS" :key="s.v" :value="s.v">{{ s.l }}</option>
      </select>
    </header>

    <DataTable :rows="filtered" :columns="columns as any" :loading="loading" empty="Sin solicitudes" @edit="openEdit" @delete="remove" />

    <AdminModal :open="open && !!editing" :title="`Catering · ${editing?.name}`" size="md" @close="open = false">
      <div v-if="editing" class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-4 text-sm">
          <div><div class="text-xs text-white/50">Cliente</div><div>{{ editing.name }}</div></div>
          <div><div class="text-xs text-white/50">Contacto</div><div>{{ editing.phone }}<br><span class="text-xs text-white/60">{{ editing.email }}</span></div></div>
          <div><div class="text-xs text-white/50">Evento</div><div>{{ editing.eventType || '—' }} · {{ editing.eventDate || '?' }}</div></div>
          <div><div class="text-xs text-white/50">Personas / Presupuesto</div><div>{{ editing.guests || '?' }} pers · ${{ editing.budget || '?' }}</div></div>
        </div>
        <FormField label="Mensaje del cliente">
          <div class="text-sm bg-night rounded-lg p-3 border border-white/10">{{ editing.message || '—' }}</div>
        </FormField>
        <FormField label="Estado">
          <select v-model="editing.status" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option v-for="s in STATUS" :key="s.v" :value="s.v">{{ s.l }}</option>
          </select>
        </FormField>
        <FormField label="Notas internas">
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
