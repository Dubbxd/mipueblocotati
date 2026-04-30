<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import Icon from '@/components/ui/Icon.vue'

type Item = {
  id: number
  categoryId: number
  slug: string
  nameEs: string
  nameEn: string
  descriptionEs?: string | null
  descriptionEn?: string | null
  price?: string | null
  photo?: string | null
  tags: string[]
  isAvailable: boolean
  sortOrder: number
}
type Category = { id: number; nameEs: string }

const items = ref<Item[]>([])
const cats = ref<Category[]>([])
const loading = ref(true)
const search = ref('')
const filterCat = ref<number | 'all'>('all')

const open = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const form = ref<Partial<Item>>(emptyForm())

function emptyForm(): Partial<Item> {
  return { categoryId: undefined, slug: '', nameEs: '', nameEn: '', descriptionEs: '', descriptionEn: '', price: '', photo: null, tags: [], isAvailable: true, sortOrder: 0 }
}

const ALL_TAGS = ['popular', 'spicy', 'vegetarian', 'glutenfree', 'new', 'chefchoice']

async function load() {
  loading.value = true
  try {
    const [is, cs] = await Promise.all([
      api<Item[]>('/api/admin/menu/items'),
      api<Category[]>('/api/admin/menu/categories')
    ])
    items.value = is
    cats.value = cs
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  return items.value.filter(i => {
    if (filterCat.value !== 'all' && i.categoryId !== filterCat.value) return false
    if (!q) return true
    return i.nameEs.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q) || (i.slug || '').includes(q)
  })
})

function catName(id: number) {
  return cats.value.find(c => c.id === id)?.nameEs || '—'
}

function openNew() {
  form.value = emptyForm()
  if (cats.value[0]) form.value.categoryId = cats.value[0].id
  error.value = null
  open.value = true
}

function openEdit(row: Item) {
  form.value = { ...row, tags: Array.isArray(row.tags) ? [...row.tags] : [] }
  error.value = null
  open.value = true
}

function toggleTag(t: string) {
  const tags = form.value.tags || []
  form.value.tags = tags.includes(t) ? tags.filter(x => x !== t) : [...tags, t]
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function save() {
  if (!form.value.categoryId || !form.value.nameEs || !form.value.nameEn) {
    error.value = 'Categoría, nombre ES e inglés son obligatorios'
    return
  }
  if (!form.value.slug) form.value.slug = slugify(form.value.nameEs)
  saving.value = true
  error.value = null
  try {
    const body: any = {
      categoryId: Number(form.value.categoryId),
      slug: form.value.slug,
      nameEs: form.value.nameEs,
      nameEn: form.value.nameEn,
      descriptionEs: form.value.descriptionEs || undefined,
      descriptionEn: form.value.descriptionEn || undefined,
      price: form.value.price ? String(form.value.price) : undefined,
      photo: form.value.photo || undefined,
      tags: form.value.tags || [],
      isAvailable: form.value.isAvailable !== false,
      sortOrder: Number(form.value.sortOrder) || 0
    }
    if (form.value.id) {
      await api(`/api/admin/menu/items/${form.value.id}`, { method: 'PATCH', body })
    } else {
      await api('/api/admin/menu/items', { method: 'POST', body })
    }
    open.value = false
    await load()
  } catch (e: any) {
    error.value = e?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function remove(row: Item) {
  if (!confirm(`¿Borrar "${row.nameEs}"?`)) return
  await api(`/api/admin/menu/items/${row.id}`, { method: 'DELETE' })
  await load()
}

const columns = [
  { key: 'photo', label: '', width: '64px', render: (r: Item) => r.photo ? `<img src="${r.photo}" class="w-12 h-12 object-cover rounded" />` : `<div class="w-12 h-12 rounded bg-white/5 grid place-items-center text-white/30"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4V8z"/><path d="M9 11h.01M15 11h.01M9 15c.5.5 1.5 1 3 1s2.5-.5 3-1"/></svg></div>` },
  { key: 'nameEs', label: 'Platillo', render: (r: Item) => `<div class="font-medium">${r.nameEs}</div><div class="text-xs text-white/50">${r.nameEn}</div>` },
  { key: 'categoryId', label: 'Categoría', render: (r: Item) => `<span class="text-xs text-white/70">${catName(r.categoryId)}</span>` },
  { key: 'price', label: 'Precio', render: (r: Item) => r.price ? `$${r.price}` : '—' },
  { key: 'tags', label: 'Tags', render: (r: Item) => (r.tags || []).map(t => `<span class="text-[10px] uppercase px-1.5 py-0.5 rounded bg-white/10 mr-1">${t}</span>`).join('') },
  { key: 'isAvailable', label: 'Estado', render: (r: Item) => r.isAvailable ? '<span class="text-emerald-400 text-xs">● Activo</span>' : '<span class="text-white/40 text-xs">○ Oculto</span>' }
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl">Platillos</h1>
        <p class="text-white/50 text-sm">{{ items.length }} en total</p>
      </div>
      <div class="ml-auto flex gap-2">
        <input v-model="search" placeholder="Buscar…" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand" />
        <select v-model="filterCat" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm">
          <option :value="'all'">Todas las categorías</option>
          <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.nameEs }}</option>
        </select>
        <button @click="openNew" class="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <Icon name="Add" :size="16" />
          <span>Nuevo</span>
        </button>
      </div>
    </header>

    <DataTable :rows="filtered" :columns="columns as any" :loading="loading" empty="Sin platillos" @edit="openEdit" @delete="remove" />

    <AdminModal :open="open" :title="form.id ? 'Editar platillo' : 'Nuevo platillo'" size="lg" @close="open = false">
      <div class="grid sm:grid-cols-2 gap-4">
        <FormField label="Categoría" required>
          <select v-model="form.categoryId" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option v-for="c in cats" :key="c.id" :value="c.id">{{ c.nameEs }}</option>
          </select>
        </FormField>
        <FormField label="Slug" hint="Se genera automáticamente">
          <input v-model="form.slug" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Nombre (ES)" required>
          <input v-model="form.nameEs" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Nombre (EN)" required>
          <input v-model="form.nameEn" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Descripción (ES)">
          <textarea v-model="form.descriptionEs" rows="3" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea>
        </FormField>
        <FormField label="Descripción (EN)">
          <textarea v-model="form.descriptionEn" rows="3" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea>
        </FormField>
        <FormField label="Precio (USD)">
          <input v-model="form.price" type="number" step="0.01" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Orden">
          <input v-model.number="form.sortOrder" type="number" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Foto" class="sm:col-span-2">
          <ImageUploader v-model="form.photo" />
        </FormField>
        <FormField label="Tags" class="sm:col-span-2">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="t in ALL_TAGS"
              :key="t"
              type="button"
              @click="toggleTag(t)"
              class="text-xs px-3 py-1.5 rounded-full border transition"
              :class="(form.tags || []).includes(t) ? 'bg-brand border-brand text-white' : 'bg-white/5 border-white/15 text-white/70 hover:border-white/30'"
            >{{ t }}</button>
          </div>
        </FormField>
        <FormField class="sm:col-span-2">
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.isAvailable" class="w-4 h-4 accent-brand" />
            <span>Disponible (visible en el menú público)</span>
          </label>
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
