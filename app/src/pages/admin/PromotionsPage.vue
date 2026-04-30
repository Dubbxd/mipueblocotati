<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import Icon from '@/components/ui/Icon.vue'

type Promo = {
  id: number
  slug: string
  titleEs: string; titleEn: string
  bodyEs?: string | null; bodyEn?: string | null
  barTextEs?: string | null; barTextEn?: string | null
  emoji?: string | null
  photo?: string | null
  ctaUrl?: string | null
  ctaLabelEs?: string | null; ctaLabelEn?: string | null
  showInBar: boolean
  isActive: boolean
  sortOrder: number
}

const rows = ref<Promo[]>([])
const loading = ref(true)
const open = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const form = ref<Partial<Promo>>(empty())

function empty(): Partial<Promo> { return { slug: '', titleEs: '', titleEn: '', emoji: '', photo: null, showInBar: false, isActive: true, sortOrder: 0 } }
function slugify(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

async function load() { loading.value = true; try { rows.value = await api('/api/admin/promotions') } finally { loading.value = false } }
function openNew() { form.value = empty(); error.value = null; open.value = true }
function openEdit(r: Promo) { form.value = { ...r }; error.value = null; open.value = true }

async function save() {
  if (!form.value.titleEs || !form.value.titleEn) { error.value = 'Títulos requeridos'; return }
  if (!form.value.slug) form.value.slug = slugify(form.value.titleEs!)
  saving.value = true
  try {
    const body: any = {
      slug: form.value.slug,
      titleEs: form.value.titleEs, titleEn: form.value.titleEn,
      bodyEs: form.value.bodyEs || undefined,
      bodyEn: form.value.bodyEn || undefined,
      barTextEs: form.value.barTextEs || undefined,
      barTextEn: form.value.barTextEn || undefined,
      emoji: form.value.emoji || undefined,
      photo: form.value.photo || undefined,
      ctaUrl: form.value.ctaUrl || undefined,
      ctaLabelEs: form.value.ctaLabelEs || undefined,
      ctaLabelEn: form.value.ctaLabelEn || undefined,
      showInBar: !!form.value.showInBar,
      isActive: form.value.isActive !== false,
      sortOrder: Number(form.value.sortOrder) || 0
    }
    if (form.value.id) await api(`/api/admin/promotions/${form.value.id}`, { method: 'PATCH', body })
    else await api('/api/admin/promotions', { method: 'POST', body })
    open.value = false; await load()
  } catch (e: any) { error.value = e?.message || 'Error' }
  finally { saving.value = false }
}

async function remove(r: Promo) {
  if (!confirm(`¿Borrar "${r.titleEs}"?`)) return
  await api(`/api/admin/promotions/${r.id}`, { method: 'DELETE' })
  await load()
}

const columns = [
  { key: 'icon', label: '', width: '60px', render: (r: Promo) => r.photo ? `<img src="${r.photo}" class="w-10 h-10 object-cover rounded-md" />` : `<div class="w-10 h-10 rounded-md bg-accent/15 text-accent grid place-items-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7h7l-5.5 4.5L18 22l-6-4-6 4 1.5-8.5L2 9h7z"/></svg></div>` },
  { key: 'titleEs', label: 'Promoción', render: (r: Promo) => `<div class="font-medium">${r.titleEs}</div><div class="text-xs text-white/50">${r.titleEn}</div>` },
  { key: 'showInBar', label: 'Top Bar', render: (r: Promo) => r.showInBar ? '<span class="inline-flex items-center gap-1 text-amber-300 text-xs"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-7-7 18-2-8z"/></svg> En barra</span>' : '' },
  { key: 'isActive', label: 'Estado', render: (r: Promo) => r.isActive ? '<span class="text-emerald-400 text-xs">● Activa</span>' : '<span class="text-white/40 text-xs">○ Oculta</span>' }
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex items-center mb-5">
      <div>
        <h1 class="font-display text-2xl">Promociones</h1>
        <p class="text-white/50 text-sm">{{ rows.length }} promociones</p>
      </div>
      <button @click="openNew" class="ml-auto inline-flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">
        <Icon name="Add" :size="16" />
        <span>Nueva</span>
      </button>
    </header>

    <DataTable :rows="rows" :columns="columns as any" :loading="loading" @edit="openEdit" @delete="remove" />

    <AdminModal :open="open" :title="form.id ? 'Editar promoción' : 'Nueva promoción'" size="lg" @close="open = false">
      <div class="grid sm:grid-cols-2 gap-4">
        <FormField label="Título (ES)" required><input v-model="form.titleEs" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Título (EN)" required><input v-model="form.titleEn" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Slug"><input v-model="form.slug" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Emoji decorativo" hint="Opcional, se mostrará si no hay foto"><input v-model="form.emoji" maxlength="4" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Cuerpo (ES)" class="sm:col-span-2"><textarea v-model="form.bodyEs" rows="3" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></FormField>
        <FormField label="Cuerpo (EN)" class="sm:col-span-2"><textarea v-model="form.bodyEn" rows="3" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea></FormField>
        <FormField label="Texto en barra superior (ES)" hint="Si se llena, sale en el banner del header"><input v-model="form.barTextEs" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Texto en barra superior (EN)"><input v-model="form.barTextEn" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="URL del CTA"><input v-model="form.ctaUrl" placeholder="https://… o /menu" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Label CTA (ES)"><input v-model="form.ctaLabelEs" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField label="Foto" class="sm:col-span-2"><ImageUploader v-model="form.photo" /></FormField>
        <FormField label="Orden"><input v-model.number="form.sortOrder" type="number" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" /></FormField>
        <FormField class="sm:col-span-2">
          <div class="flex flex-wrap gap-4 text-sm">
            <label class="flex items-center gap-2"><input type="checkbox" v-model="form.showInBar" class="w-4 h-4 accent-brand" /><span>Mostrar en barra superior</span></label>
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
