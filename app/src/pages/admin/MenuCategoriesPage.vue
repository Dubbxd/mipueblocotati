<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import Icon from '@/components/ui/Icon.vue'

type Cat = {
  id: number
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs?: string | null
  descriptionEn?: string | null
  emoji?: string | null
  photo?: string | null
  isFeatured: boolean
  isBestSeller: boolean
  sortOrder: number
  isActive: boolean
}

const rows = ref<Cat[]>([])
const loading = ref(true)
const open = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const form = ref<Partial<Cat>>(empty())

function empty(): Partial<Cat> { return { slug: '', nameEs: '', nameEn: '', emoji: '', photo: null, isFeatured: false, isBestSeller: false, sortOrder: 0, isActive: true } }
function slugify(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/menu/categories') } finally { loading.value = false }
}
function openNew() { form.value = empty(); error.value = null; open.value = true }
function openEdit(r: Cat) { form.value = { ...r }; error.value = null; open.value = true }

async function save() {
  if (!form.value.nameEs || !form.value.nameEn) { error.value = 'Nombres requeridos'; return }
  if (!form.value.slug) form.value.slug = slugify(form.value.nameEs!)
  saving.value = true
  try {
    const body: any = {
      slug: form.value.slug, nameEs: form.value.nameEs, nameEn: form.value.nameEn,
      descriptionEs: form.value.descriptionEs || undefined,
      descriptionEn: form.value.descriptionEn || undefined,
      emoji: form.value.emoji || undefined,
      photo: form.value.photo || undefined,
      isFeatured: !!form.value.isFeatured,
      isBestSeller: !!form.value.isBestSeller,
      sortOrder: Number(form.value.sortOrder) || 0,
      isActive: form.value.isActive !== false
    }
    if (form.value.id) await api(`/api/admin/menu/categories/${form.value.id}`, { method: 'PATCH', body })
    else await api('/api/admin/menu/categories', { method: 'POST', body })
    open.value = false; await load()
  } catch (e: any) { error.value = e?.message || 'Error' }
  finally { saving.value = false }
}

async function remove(r: Cat) {
  if (!confirm(`¿Borrar "${r.nameEs}"? Se borrarán los platillos asociados.`)) return
  await api(`/api/admin/menu/categories/${r.id}`, { method: 'DELETE' })
  await load()
}

const columns = [
  { key: 'icon', label: '', width: '60px', render: (r: Cat) => r.photo ? `<img src="${r.photo}" class="w-10 h-10 object-cover rounded-md" />` : `<div class="w-10 h-10 rounded-md bg-brand/15 text-brand grid place-items-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h14v6a7 7 0 11-14 0V4z"/></svg></div>` },
  { key: 'nameEs', label: 'Categoría', render: (r: Cat) => `<div class="font-medium">${r.nameEs}</div><div class="text-xs text-white/50">${r.nameEn} · /${r.slug}</div>` },
  { key: 'sortOrder', label: 'Orden', width: '80px' },
  { key: 'isBestSeller', label: 'Best Seller', render: (r: Cat) => r.isBestSeller ? '<span class="inline-flex items-center gap-1 text-amber-300 text-xs"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/></svg></span>' : '' },
  { key: 'isActive', label: 'Estado', render: (r: Cat) => r.isActive ? '<span class="text-emerald-400 text-xs">● Activa</span>' : '<span class="text-white/40 text-xs">○ Oculta</span>' }
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex items-center mb-5">
      <div>
        <h1 class="font-display text-2xl">Categorías del menú</h1>
        <p class="text-white/50 text-sm">{{ rows.length }} categorías</p>
      </div>
      <button @click="openNew" class="ml-auto inline-flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">
        <Icon name="Add" :size="16" />
        <span>Nueva</span>
      </button>
    </header>

    <DataTable :rows="rows" :columns="columns as any" :loading="loading" @edit="openEdit" @delete="remove" />

    <AdminModal :open="open" :title="form.id ? 'Editar categoría' : 'Nueva categoría'" size="md" @close="open = false">
      <div class="grid sm:grid-cols-2 gap-4">
        <FormField label="Nombre (ES)" required><input v-model="form.nameEs" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Nombre (EN)" required><input v-model="form.nameEn" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Slug"><input v-model="form.slug" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Emoji decorativo" hint="Opcional. Dejar vacío para usar foto."><input v-model="form.emoji" maxlength="4" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Descripción ES" class="sm:col-span-2"><textarea v-model="form.descriptionEs" rows="2" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></FormField>
        <FormField label="Descripción EN" class="sm:col-span-2"><textarea v-model="form.descriptionEn" rows="2" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></FormField>
        <FormField label="Foto" class="sm:col-span-2"><ImageUploader v-model="form.photo" /></FormField>
        <FormField label="Orden"><input v-model.number="form.sortOrder" type="number" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField class="sm:col-span-2">
          <div class="flex flex-wrap gap-4 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" v-model="form.isBestSeller" class="w-4 h-4 accent-brand" /><span>Best Seller</span></label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="form.isFeatured" class="w-4 h-4 accent-brand" /><span>Destacada</span></label>
            <label class="flex items-center gap-2"><input type="checkbox" v-model="form.isActive" class="w-4 h-4 accent-brand" /><span>Activa</span></label>
          </div>
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
