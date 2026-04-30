<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'

type Loc = {
  id: number
  slug: string
  name: string; city: string; state: string
  addressLine: string
  postalCode?: string | null
  phone?: string | null
  email?: string | null
  lat?: string | null; lng?: string | null
  hours?: Array<{ day: string; open: string; close: string }> | null
  links?: Record<string, string> | null
  isActive: boolean
  sortOrder: number
}

const DAYS = [
  { v: 'mon', l: 'Lun' }, { v: 'tue', l: 'Mar' }, { v: 'wed', l: 'Mié' },
  { v: 'thu', l: 'Jue' }, { v: 'fri', l: 'Vie' }, { v: 'sat', l: 'Sáb' }, { v: 'sun', l: 'Dom' }
]
const LINK_KEYS = ['googleMaps', 'doordash', 'ubereats', 'grubhub', 'clover', 'instagram', 'facebook']

const rows = ref<Loc[]>([])
const loading = ref(true)
const open = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const form = ref<Partial<Loc>>(empty())

function empty(): Partial<Loc> {
  return {
    slug: '', name: '', city: '', state: 'CA', addressLine: '',
    hours: DAYS.map(d => ({ day: d.v, open: '11:00', close: '21:00' })),
    links: {}, isActive: true, sortOrder: 0
  }
}
function slugify(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

async function load() { loading.value = true; try { rows.value = await api('/api/admin/locations') } finally { loading.value = false } }
function openNew() { form.value = empty(); error.value = null; open.value = true }
function openEdit(r: Loc) {
  form.value = { ...r, hours: r.hours ? [...r.hours] : empty().hours, links: { ...(r.links || {}) } }
  error.value = null; open.value = true
}

async function save() {
  if (!form.value.name || !form.value.city || !form.value.addressLine) { error.value = 'Nombre, ciudad y dirección requeridos'; return }
  if (!form.value.slug) form.value.slug = slugify(form.value.name!)
  saving.value = true
  try {
    const body: any = {
      slug: form.value.slug, name: form.value.name, city: form.value.city, state: form.value.state,
      addressLine: form.value.addressLine, postalCode: form.value.postalCode || undefined,
      phone: form.value.phone || undefined, email: form.value.email || undefined,
      lat: form.value.lat ? String(form.value.lat) : undefined,
      lng: form.value.lng ? String(form.value.lng) : undefined,
      hours: form.value.hours, links: form.value.links,
      isActive: form.value.isActive !== false,
      sortOrder: Number(form.value.sortOrder) || 0
    }
    if (form.value.id) await api(`/api/admin/locations/${form.value.id}`, { method: 'PATCH', body })
    else await api('/api/admin/locations', { method: 'POST', body })
    open.value = false; await load()
  } catch (e: any) { error.value = e?.message || 'Error' }
  finally { saving.value = false }
}

async function remove(r: Loc) {
  if (!confirm(`¿Borrar "${r.name}"?`)) return
  await api(`/api/admin/locations/${r.id}`, { method: 'DELETE' })
  await load()
}

const columns = [
  { key: 'name', label: 'Sucursal', render: (r: Loc) => `<div class="font-medium">${r.name}</div><div class="text-xs text-white/50">${r.city}, ${r.state} · /${r.slug}</div>` },
  { key: 'addressLine', label: 'Dirección', render: (r: Loc) => `<span class="text-xs text-white/70">${r.addressLine}</span>` },
  { key: 'phone', label: 'Teléfono', render: (r: Loc) => r.phone || '—' },
  { key: 'isActive', label: 'Estado', render: (r: Loc) => r.isActive ? '<span class="text-emerald-400 text-xs">● Activa</span>' : '<span class="text-white/40 text-xs">○</span>' }
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex items-center mb-5">
      <div>
        <h1 class="font-display text-2xl">Sucursales</h1>
        <p class="text-white/50 text-sm">{{ rows.length }} sucursales</p>
      </div>
      <button @click="openNew" class="ml-auto bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">+ Nueva</button>
    </header>

    <DataTable :rows="rows" :columns="columns as any" :loading="loading" @edit="openEdit" @delete="remove" />

    <AdminModal :open="open" :title="form.id ? 'Editar sucursal' : 'Nueva sucursal'" size="lg" @close="open = false">
      <div class="grid sm:grid-cols-2 gap-4">
        <FormField label="Nombre" required><input v-model="form.name" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Slug"><input v-model="form.slug" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Ciudad" required><input v-model="form.city" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Estado"><input v-model="form.state" maxlength="2" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Dirección" required class="sm:col-span-2"><input v-model="form.addressLine" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Código postal"><input v-model="form.postalCode" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Teléfono"><input v-model="form.phone" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Email"><input v-model="form.email" type="email" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Lat"><input v-model="form.lat" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Lng"><input v-model="form.lng" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>

        <FormField label="Horarios" class="sm:col-span-2">
          <div class="space-y-2">
            <div v-for="(h, i) in (form.hours || [])" :key="i" class="flex items-center gap-2 text-sm">
              <span class="w-12 text-white/60">{{ DAYS.find(d => d.v === h.day)?.l || h.day }}</span>
              <input v-model="h.open" type="time" class="bg-night border border-white/15 rounded px-2 py-1 text-sm" />
              <span class="text-white/40">→</span>
              <input v-model="h.close" type="time" class="bg-night border border-white/15 rounded px-2 py-1 text-sm" />
            </div>
          </div>
        </FormField>

        <FormField label="Links" class="sm:col-span-2" hint="URLs opcionales para mostrar en la página de sucursal">
          <div class="grid sm:grid-cols-2 gap-2">
            <div v-for="k in LINK_KEYS" :key="k">
              <label class="block text-xs text-white/50 mb-1">{{ k }}</label>
              <input :value="form.links?.[k] || ''" @input="(form.links = { ...(form.links || {}), [k]: ($event.target as HTMLInputElement).value })" class="w-full bg-night border border-white/15 rounded px-2 py-1.5 text-xs" />
            </div>
          </div>
        </FormField>

        <FormField label="Orden"><input v-model.number="form.sortOrder" type="number" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField class="sm:col-span-2">
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="form.isActive" class="w-4 h-4 accent-brand" /><span>Activa</span></label>
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
