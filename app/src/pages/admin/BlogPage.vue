<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import Icon from '@/components/ui/Icon.vue'

type Post = {
  id: number
  slug: string
  titleEs: string; titleEn: string
  excerptEs?: string | null; excerptEn?: string | null
  bodyEs?: string | null; bodyEn?: string | null
  coverImage?: string | null
  category: string
  tags?: string[] | null
  status: 'draft' | 'published' | 'archived'
  aiGenerated: boolean
  metaTitleEs?: string | null; metaTitleEn?: string | null
  metaDescriptionEs?: string | null; metaDescriptionEn?: string | null
  publishedAt?: string | null
}

const CATEGORIES = ['news', 'recipes', 'culture', 'events', 'promotions', 'behind-the-scenes']

const rows = ref<Post[]>([])
const loading = ref(true)
const open = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const form = ref<Partial<Post>>(empty())
const tagsInput = ref('')

// AI generation state
const aiTopic = ref('')
const aiCategory = ref('news')
const aiGenerating = ref(false)
const aiError = ref<string | null>(null)

function empty(): Partial<Post> {
  return { slug: '', titleEs: '', titleEn: '', excerptEs: '', excerptEn: '', bodyEs: '', bodyEn: '', category: 'news', tags: [], status: 'draft', aiGenerated: false }
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/blog') } finally { loading.value = false }
}

function openNew() { form.value = empty(); tagsInput.value = ''; aiTopic.value = ''; aiError.value = null; error.value = null; open.value = true }
function openEdit(r: Post) {
  form.value = { ...r }
  tagsInput.value = Array.isArray(r.tags) ? r.tags.join(', ') : ''
  aiTopic.value = ''
  aiError.value = null
  error.value = null
  open.value = true
}

async function generateWithAI() {
  if (!aiTopic.value.trim()) { aiError.value = 'Escribe un tema para generar'; return }
  aiGenerating.value = true
  aiError.value = null
  try {
    const res = await api('/api/admin/ai/generate', {
      method: 'POST',
      body: { type: 'blog_post', topic: aiTopic.value, category: aiCategory.value }
    }) as { ok: boolean; result: any }
    const r = res.result
    form.value.titleEs = r.titleEs || form.value.titleEs
    form.value.titleEn = r.titleEn || form.value.titleEn
    form.value.excerptEs = r.excerptEs || form.value.excerptEs
    form.value.excerptEn = r.excerptEn || form.value.excerptEn
    form.value.bodyEs = r.bodyEs || form.value.bodyEs
    form.value.bodyEn = r.bodyEn || form.value.bodyEn
    form.value.metaTitleEs = r.metaTitleEs || form.value.metaTitleEs
    form.value.metaTitleEn = r.metaTitleEn || form.value.metaTitleEn
    form.value.metaDescriptionEs = r.metaDescriptionEs || form.value.metaDescriptionEs
    form.value.metaDescriptionEn = r.metaDescriptionEn || form.value.metaDescriptionEn
    form.value.slug = r.slug || form.value.slug
    form.value.category = aiCategory.value
    form.value.aiGenerated = true
    if (r.tags && Array.isArray(r.tags)) tagsInput.value = r.tags.join(', ')
  } catch (e: any) {
    aiError.value = e?.message || 'Error al generar contenido con IA'
  } finally {
    aiGenerating.value = false
  }
}

async function save() {
  if (!form.value.titleEs || !form.value.titleEn) { error.value = 'Títulos requeridos'; return }
  if (!form.value.slug) form.value.slug = slugify(form.value.titleEs!)
  saving.value = true
  try {
    const tags = tagsInput.value
      ? tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
      : []
    const body: any = {
      slug: form.value.slug,
      titleEs: form.value.titleEs, titleEn: form.value.titleEn,
      excerptEs: form.value.excerptEs || undefined,
      excerptEn: form.value.excerptEn || undefined,
      bodyEs: form.value.bodyEs || undefined,
      bodyEn: form.value.bodyEn || undefined,
      coverImage: form.value.coverImage || undefined,
      category: form.value.category || 'news',
      tags: tags.length ? tags : undefined,
      status: form.value.status || 'draft',
      aiGenerated: !!form.value.aiGenerated,
      metaTitleEs: form.value.metaTitleEs || undefined,
      metaTitleEn: form.value.metaTitleEn || undefined,
      metaDescriptionEs: form.value.metaDescriptionEs || undefined,
      metaDescriptionEn: form.value.metaDescriptionEn || undefined,
    }
    if (form.value.id) await api(`/api/admin/blog/${form.value.id}`, { method: 'PATCH', body })
    else await api('/api/admin/blog', { method: 'POST', body })
    open.value = false; await load()
  } catch (e: any) { error.value = e?.message || 'Error' }
  finally { saving.value = false }
}

async function remove(r: Post) {
  if (!confirm(`¿Borrar "${r.titleEs}"?`)) return
  await api(`/api/admin/blog/${r.id}`, { method: 'DELETE' })
  await load()
}

const STATUS_COLORS: Record<string, string> = {
  published: 'text-emerald-400',
  draft: 'text-amber-400',
  archived: 'text-white/40'
}
const STATUS_LABELS: Record<string, string> = {
  published: '● Publicado',
  draft: '◐ Borrador',
  archived: '○ Archivado'
}

const columns = [
  {
    key: 'cover', label: '', width: '60px',
    render: (r: Post) => r.coverImage
      ? `<img src="${r.coverImage}" class="w-10 h-10 object-cover rounded-md" />`
      : `<div class="w-10 h-10 rounded-md bg-accent/15 text-accent grid place-items-center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m3 9 5-5 5 5 5-8"/><circle cx="8.5" cy="13.5" r="1.5"/></svg></div>`
  },
  {
    key: 'titleEs', label: 'Artículo',
    render: (r: Post) => {
      const ai = r.aiGenerated ? '<span class="ml-1 text-xs bg-purple-500/20 text-purple-300 rounded px-1">IA</span>' : ''
      return `<div class="font-medium">${r.titleEs}${ai}</div><div class="text-xs text-white/50">${r.titleEn}</div>`
    }
  },
  { key: 'category', label: 'Categoría', render: (r: Post) => `<span class="text-xs bg-white/10 rounded-full px-2 py-0.5">${r.category}</span>` },
  {
    key: 'status', label: 'Estado',
    render: (r: Post) => `<span class="text-xs ${STATUS_COLORS[r.status] ?? 'text-white/40'}">${STATUS_LABELS[r.status] ?? r.status}</span>`
  }
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex items-center mb-5">
      <div>
        <h1 class="font-display text-2xl">Blog</h1>
        <p class="text-white/50 text-sm">{{ rows.length }} artículos</p>
      </div>
      <button @click="openNew" class="ml-auto inline-flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">
        <Icon name="Add" :size="16" />
        <span>Nuevo artículo</span>
      </button>
    </header>

    <DataTable :rows="rows" :columns="columns as any" :loading="loading" @edit="openEdit" @delete="remove" />

    <AdminModal :open="open" :title="form.id ? 'Editar artículo' : 'Nuevo artículo'" size="xl" @close="open = false">
      <!-- AI Generation Box -->
      <div class="mb-5 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
        <div class="flex items-center gap-2 mb-3">
          <svg class="text-purple-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
          <span class="text-sm font-semibold text-purple-300">Generar con IA</span>
        </div>
        <div class="flex gap-2 flex-wrap">
          <input
            v-model="aiTopic"
            placeholder="Ej: Tradiciones culinarias de Guerrero…"
            class="flex-1 min-w-0 bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-purple-500/60 outline-none"
          />
          <select v-model="aiCategory" class="bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
          <button
            @click="generateWithAI"
            :disabled="aiGenerating"
            class="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
          >
            <svg v-if="!aiGenerating" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3l14 9-14 9V3z"/></svg>
            <svg v-else class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>
            {{ aiGenerating ? 'Generando…' : 'Generar' }}
          </button>
        </div>
        <p v-if="aiError" class="text-xs text-red-400 mt-2">{{ aiError }}</p>
        <p v-if="form.aiGenerated" class="text-xs text-purple-300 mt-2">✓ Contenido generado con IA — revisa y edita antes de publicar</p>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <FormField label="Título (ES)" required>
          <input v-model="form.titleEs" @input="if (!form.id) form.slug = slugify(form.titleEs || '')" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Título (EN)" required>
          <input v-model="form.titleEn" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>

        <FormField label="Slug">
          <input v-model="form.slug" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm font-mono" />
        </FormField>
        <FormField label="Categoría">
          <select v-model="form.category" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
        </FormField>

        <FormField label="Extracto (ES)" class="sm:col-span-2">
          <textarea v-model="form.excerptEs" rows="2" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea>
        </FormField>
        <FormField label="Extracto (EN)" class="sm:col-span-2">
          <textarea v-model="form.excerptEn" rows="2" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea>
        </FormField>

        <FormField label="Cuerpo (ES — HTML)" class="sm:col-span-2">
          <textarea v-model="form.bodyEs" rows="8" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm font-mono text-xs"></textarea>
        </FormField>
        <FormField label="Cuerpo (EN — HTML)" class="sm:col-span-2">
          <textarea v-model="form.bodyEn" rows="8" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm font-mono text-xs"></textarea>
        </FormField>

        <FormField label="Imagen de portada" class="sm:col-span-2">
          <ImageUploader v-model="form.coverImage" />
        </FormField>

        <FormField label="Tags" hint="Separados por coma" class="sm:col-span-2">
          <input v-model="tagsInput" placeholder="gastronomía, cultura, México…" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>

        <FormField label="Meta título (ES)">
          <input v-model="form.metaTitleEs" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Meta título (EN)">
          <input v-model="form.metaTitleEn" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Meta descripción (ES)" class="sm:col-span-2">
          <textarea v-model="form.metaDescriptionEs" rows="2" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea>
        </FormField>
        <FormField label="Meta descripción (EN)" class="sm:col-span-2">
          <textarea v-model="form.metaDescriptionEn" rows="2" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"></textarea>
        </FormField>

        <FormField label="Estado" class="sm:col-span-2">
          <div class="flex gap-3">
            <label v-for="s in ['draft', 'published', 'archived']" :key="s" class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" v-model="form.status" :value="s" class="accent-brand" />
              {{ s === 'draft' ? 'Borrador' : s === 'published' ? 'Publicado' : 'Archivado' }}
            </label>
          </div>
        </FormField>
      </div>

      <p v-if="error" class="text-sm text-accent mt-3">{{ error }}</p>

      <template #footer>
        <button @click="open = false" class="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">Cancelar</button>
        <button
          @click="() => { form.status = 'draft'; save() }"
          :disabled="saving"
          class="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 font-semibold"
        >Guardar borrador</button>
        <button
          @click="() => { form.status = 'published'; save() }"
          :disabled="saving"
          class="text-sm px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold"
        >{{ saving ? 'Guardando…' : 'Publicar' }}</button>
      </template>
    </AdminModal>
  </div>
</template>
