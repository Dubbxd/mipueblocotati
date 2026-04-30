<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api, uploadFile } from '@/lib/api'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'
import Icon from '@/components/ui/Icon.vue'

type Photo = {
  id: number
  url: string
  thumbUrl?: string | null
  alt?: string | null
  category: string
  isActive: boolean
  sortOrder: number
}

const CATS = ['food', 'interior', 'team', 'events']

const rows = ref<Photo[]>([])
const loading = ref(true)
const filterCat = ref('all')
const uploading = ref(false)

const open = ref(false)
const editing = ref<Photo | null>(null)
const saving = ref(false)

async function load() { loading.value = true; try { rows.value = await api('/api/admin/gallery') } finally { loading.value = false } }
const filtered = computed(() => filterCat.value === 'all' ? rows.value : rows.value.filter(r => r.category === filterCat.value))

async function onUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files?.length) return
  uploading.value = true
  try {
    for (const f of Array.from(files)) {
      const res = await uploadFile(f)
      await api('/api/admin/gallery', { method: 'POST', body: { url: res.url, category: filterCat.value === 'all' ? 'food' : filterCat.value, isActive: true, sortOrder: rows.value.length } })
    }
    await load()
  } finally {
    uploading.value = false;
    (e.target as HTMLInputElement).value = ''
  }
}

function openEdit(p: Photo) { editing.value = { ...p }; open.value = true }
async function save() {
  if (!editing.value) return
  saving.value = true
  try {
    await api(`/api/admin/gallery/${editing.value.id}`, { method: 'PATCH', body: {
      alt: editing.value.alt || undefined,
      category: editing.value.category,
      isActive: editing.value.isActive,
      sortOrder: Number(editing.value.sortOrder) || 0
    }})
    open.value = false; await load()
  } finally { saving.value = false }
}
async function remove(p: Photo) {
  if (!confirm('¿Borrar foto?')) return
  await api(`/api/admin/gallery/${p.id}`, { method: 'DELETE' })
  await load()
}

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl">Galería</h1>
        <p class="text-white/50 text-sm">{{ filtered.length }} fotos</p>
      </div>
      <div class="ml-auto flex gap-2">
        <select v-model="filterCat" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm">
          <option value="all">Todas las categorías</option>
          <option v-for="c in CATS" :key="c" :value="c">{{ c }}</option>
        </select>
        <label class="inline-flex items-center gap-1.5 cursor-pointer bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <input type="file" accept="image/*" multiple class="hidden" @change="onUpload" />
          <Icon :name="uploading ? 'Refresh' : 'GalleryAdd'" :size="16" />
          <span>{{ uploading ? 'Subiendo…' : 'Subir fotos' }}</span>
        </label>
      </div>
    </header>

    <div v-if="loading" class="text-center text-white/50 py-12">Cargando…</div>
    <div v-else-if="!filtered.length" class="text-center text-white/50 py-12 border border-dashed border-white/10 rounded-xl">Sin fotos en esta categoría</div>
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <div v-for="p in filtered" :key="p.id" class="group relative aspect-square rounded-xl overflow-hidden bg-night-dark border border-white/10">
        <img :src="p.url" :alt="p.alt || ''" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
          <div class="text-xs text-white/80 truncate">{{ p.alt || '—' }}</div>
          <div class="text-[10px] text-white/60 uppercase">{{ p.category }}</div>
          <div class="flex gap-1 mt-2">
            <button @click="openEdit(p)" class="flex-1 inline-flex items-center justify-center gap-1 text-[10px] py-1 rounded bg-white/15 hover:bg-white/25">
              <Icon name="Edit2" :size="10" /> Editar
            </button>
            <button @click="remove(p)" class="flex-1 inline-flex items-center justify-center gap-1 text-[10px] py-1 rounded bg-accent/30 hover:bg-accent/50 text-white">
              <Icon name="Trash" :size="10" /> Borrar
            </button>
          </div>
        </div>
        <div v-if="!p.isActive" class="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full bg-black/70 text-white/70">Oculta</div>
      </div>
    </div>

    <AdminModal :open="open && !!editing" title="Editar foto" size="md" @close="open = false">
      <div v-if="editing" class="grid sm:grid-cols-2 gap-4">
        <div class="sm:col-span-2"><img :src="editing.url" class="w-full max-h-72 object-contain rounded-lg bg-black/30" /></div>
        <FormField label="Texto alternativo" class="sm:col-span-2"><input v-model="editing.alt" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Categoría">
          <select v-model="editing.category" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option v-for="c in CATS" :key="c" :value="c">{{ c }}</option>
          </select>
        </FormField>
        <FormField label="Orden"><input v-model.number="editing.sortOrder" type="number" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField class="sm:col-span-2">
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" v-model="editing.isActive" class="w-4 h-4 accent-brand" /><span>Visible en la galería pública</span></label>
        </FormField>
      </div>
      <template #footer>
        <button @click="open = false" class="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">Cancelar</button>
        <button @click="save" :disabled="saving" class="text-sm px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
      </template>
    </AdminModal>
  </div>
</template>
