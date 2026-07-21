<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import { adminStatusLabel } from '@/lib/adminStatus'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'
import Icon from '@/components/ui/Icon.vue'

type Review = {
  id: number
  authorName: string
  authorCity?: string | null
  rating: number
  bodyEs: string
  bodyEn?: string | null
  source?: string | null
  status: 'pending' | 'approved' | 'hidden'
  isFeatured: boolean
  sortOrder: number
}

const rows = ref<Review[]>([])
const loading = ref(true)
const filterStatus = ref('all')

const open = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const form = ref<Partial<Review>>(empty())

function empty(): Partial<Review> { return { authorName: '', authorCity: '', rating: 5, bodyEs: '', bodyEn: '', source: 'manual', status: 'approved', isFeatured: false, sortOrder: 0 } }

async function load() { loading.value = true; try { rows.value = await api('/api/admin/reviews') } finally { loading.value = false } }
function openNew() { form.value = empty(); error.value = null; open.value = true }
function openEdit(r: Review) { form.value = { ...r }; error.value = null; open.value = true }

async function save() {
  if (!form.value.authorName || !form.value.bodyEs) { error.value = 'Autor y cuerpo requeridos'; return }
  saving.value = true
  try {
    const body: any = {
      authorName: form.value.authorName,
      authorCity: form.value.authorCity || undefined,
      rating: Number(form.value.rating) || 5,
      bodyEs: form.value.bodyEs,
      bodyEn: form.value.bodyEn || undefined,
      source: form.value.source || undefined,
      status: form.value.status,
      isFeatured: !!form.value.isFeatured,
      sortOrder: Number(form.value.sortOrder) || 0
    }
    if (form.value.id) await api(`/api/admin/reviews/${form.value.id}`, { method: 'PATCH', body })
    else await api('/api/admin/reviews', { method: 'POST', body })
    open.value = false; await load()
  } catch (e: any) { error.value = e?.message || 'Error' }
  finally { saving.value = false }
}

async function remove(r: Review) {
  if (!confirm(`¿Borrar reseña de ${r.authorName}?`)) return
  await api(`/api/admin/reviews/${r.id}`, { method: 'DELETE' })
  await load()
}

async function quickApprove(r: Review) {
  await api(`/api/admin/reviews/${r.id}`, { method: 'PATCH', body: { status: 'approved' } })
  await load()
}

const columns = [
  { key: 'rating', label: 'Calif.', width: '120px', render: (r: Review) => `<span class="inline-flex items-center gap-0.5 text-amber-300">${Array.from({length: 5}, (_, i) => `<svg width="14" height="14" viewBox="0 0 24 24" fill="${i < r.rating ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/></svg>`).join('')}</span>` },
  { key: 'authorName', label: 'Autor', render: (r: Review) => `<div class="font-medium">${r.authorName}</div><div class="text-xs text-white/50">${r.authorCity || ''} · ${r.source || 'manual'}</div>` },
  { key: 'bodyEs', label: 'Reseña', render: (r: Review) => `<div class="text-xs text-white/70 line-clamp-2 max-w-md">${r.bodyEs}</div>` },
  { key: 'isFeatured', label: 'Destacada', render: (r: Review) => r.isFeatured ? '<span class="inline-flex items-center gap-1 text-amber-300 text-xs"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/></svg></span>' : '' },
  { key: 'status', label: 'Estado', render: (r: Review) => {
    const cls = r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : r.status === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/50'
    return `<span class="text-[10px] uppercase px-2 py-1 rounded-full ${cls}">${adminStatusLabel(r.status)}</span>`
  }}
]

const filtered = computed(() => filterStatus.value === 'all' ? rows.value : rows.value.filter(r => r.status === filterStatus.value))

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl">Reseñas</h1>
        <p class="text-white/50 text-sm">{{ filtered.length }} de {{ rows.length }}</p>
      </div>
      <div class="ml-auto flex gap-2">
        <select v-model="filterStatus" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm">
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="hidden">Ocultas</option>
        </select>
        <button @click="openNew" class="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <Icon name="Add" :size="16" />
          <span>Nueva</span>
        </button>
      </div>
    </header>

    <div v-if="rows.some(r => r.status === 'pending')" class="mb-4 flex flex-wrap gap-2">
      <span class="text-xs text-white/60 self-center mr-2">Pendientes:</span>
      <button v-for="r in rows.filter(x => x.status === 'pending')" :key="r.id" @click="quickApprove(r)"
        class="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25">
        <Icon name="TickCircle" :size="12" />
        <span>Aprobar {{ r.authorName }}</span>
      </button>
    </div>

    <DataTable :rows="filtered" :columns="columns as any" :loading="loading" @edit="openEdit" @delete="remove" />

    <AdminModal :open="open" :title="form.id ? 'Editar reseña' : 'Nueva reseña'" size="md" @close="open = false">
      <div class="grid sm:grid-cols-2 gap-4">
        <FormField label="Autor" required><input v-model="form.authorName" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Ciudad"><input v-model="form.authorCity" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Estrellas">
          <select v-model.number="form.rating" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
          </select>
        </FormField>
        <FormField label="Fuente">
          <select v-model="form.source" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option value="manual">Manual</option>
            <option value="google">Google</option>
            <option value="yelp">Yelp</option>
            <option value="facebook">Facebook</option>
          </select>
        </FormField>
        <FormField label="Reseña (ES)" required class="sm:col-span-2"><textarea v-model="form.bodyEs" rows="3" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></FormField>
        <FormField label="Reseña (EN)" class="sm:col-span-2"><textarea v-model="form.bodyEn" rows="3" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></FormField>
        <FormField label="Estado">
          <select v-model="form.status" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobada</option>
            <option value="hidden">Oculta</option>
          </select>
        </FormField>
        <FormField label="Orden"><input v-model.number="form.sortOrder" type="number" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField class="sm:col-span-2">
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.isFeatured" class="w-4 h-4 accent-brand" /><span>Destacar en el home</span></label>
        </FormField>
      </div>
      <p v-if="error" class="text-sm text-accent mt-3">{{ error }}</p>
      <template #footer>
        <button @click="open = false" class="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">Cancelar</button>
        <button @click="save" :disabled="saving" class="text-sm px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      </template>
    </AdminModal>
  </div>
</template>
