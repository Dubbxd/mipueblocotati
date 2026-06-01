<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DOMPurify from 'dompurify'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import AdminModal from '@/components/admin/AdminModal.vue'
import FormField from '@/components/admin/FormField.vue'
import Icon from '@/components/ui/Icon.vue'

type Campaign = {
  id: number
  name: string
  subjectEs: string; subjectEn: string
  previewTextEs?: string | null; previewTextEn?: string | null
  bodyHtmlEs?: string | null; bodyHtmlEn?: string | null
  blogPostId?: number | null
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'
  sentCount?: number | null
  sentAt?: string | null
  scheduledAt?: string | null
  mailjetCampaignId?: string | null
}

const rows = ref<Campaign[]>([])
const loading = ref(true)
const open = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const form = ref<Partial<Campaign>>(empty())

// Send confirmation modal
const sendModal = ref(false)
const sendingId = ref<number | null>(null)
const sendingName = ref('')
const isSending = ref(false)
const sendResult = ref<{ ok?: boolean; subscriberCount?: number; error?: string } | null>(null)

// AI generation state
const aiTopic = ref('')
const aiPromotion = ref('')
const aiGenerating = ref(false)
const aiError = ref<string | null>(null)

function empty(): Partial<Campaign> {
  return { name: '', subjectEs: '', subjectEn: '', previewTextEs: '', previewTextEn: '', bodyHtmlEs: '', bodyHtmlEn: '', status: 'draft' }
}

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/campaigns') } finally { loading.value = false }
}

function openNew() { form.value = empty(); aiTopic.value = ''; aiError.value = null; error.value = null; open.value = true }
function openEdit(r: Campaign) { form.value = { ...r }; aiTopic.value = ''; aiError.value = null; error.value = null; open.value = true }

async function generateWithAI() {
  if (!aiTopic.value.trim()) { aiError.value = 'Escribe un tema para generar'; return }
  aiGenerating.value = true
  aiError.value = null
  try {
    const res = await api('/api/admin/ai/generate', {
      method: 'POST',
      body: { type: 'campaign', topic: aiTopic.value, promotion: aiPromotion.value || undefined }
    }) as { ok: boolean; result: any }
    const r = res.result
    form.value.subjectEs = r.subjectEs || form.value.subjectEs
    form.value.subjectEn = r.subjectEn || form.value.subjectEn
    form.value.previewTextEs = r.previewTextEs || form.value.previewTextEs
    form.value.previewTextEn = r.previewTextEn || form.value.previewTextEn
    form.value.bodyHtmlEs = r.bodyHtmlEs || form.value.bodyHtmlEs
    form.value.bodyHtmlEn = r.bodyHtmlEn || form.value.bodyHtmlEn
    if (!form.value.name) form.value.name = aiTopic.value
  } catch (e: any) {
    aiError.value = e?.message || 'Error al generar campaña con IA'
  } finally {
    aiGenerating.value = false
  }
}

async function save() {
  if (!form.value.name || !form.value.subjectEs || !form.value.subjectEn) {
    error.value = 'Nombre y asuntos (ES + EN) son requeridos'
    return
  }
  saving.value = true
  try {
    const body: any = {
      name: form.value.name,
      subjectEs: form.value.subjectEs,
      subjectEn: form.value.subjectEn,
      previewTextEs: form.value.previewTextEs || undefined,
      previewTextEn: form.value.previewTextEn || undefined,
      bodyHtmlEs: form.value.bodyHtmlEs || undefined,
      bodyHtmlEn: form.value.bodyHtmlEn || undefined,
      blogPostId: form.value.blogPostId || undefined,
      status: form.value.status || 'draft',
    }
    if (form.value.id) await api(`/api/admin/campaigns/${form.value.id}`, { method: 'PATCH', body })
    else await api('/api/admin/campaigns', { method: 'POST', body })
    open.value = false; await load()
  } catch (e: any) { error.value = e?.message || 'Error' }
  finally { saving.value = false }
}

async function remove(r: Campaign) {
  if (!confirm(`¿Borrar "${r.name}"?`)) return
  await api(`/api/admin/campaigns/${r.id}`, { method: 'DELETE' })
  await load()
}

function openSendModal(r: Campaign) {
  sendingId.value = r.id
  sendingName.value = r.name
  sendResult.value = null
  sendModal.value = true
}

async function sendCampaign() {
  if (!sendingId.value) return
  isSending.value = true
  sendResult.value = null
  try {
    const res = await api(`/api/admin/campaigns/${sendingId.value}/send`, { method: 'POST' }) as any
    sendResult.value = { ok: true, subscriberCount: res.subscriberCount }
    await load()
  } catch (e: any) {
    sendResult.value = { error: e?.message || 'Error al enviar' }
  } finally {
    isSending.value = false
  }
}

const STATUS_COLORS: Record<string, string> = {
  sent: 'text-emerald-400 bg-emerald-400/10',
  sending: 'text-amber-400 bg-amber-400/10',
  scheduled: 'text-blue-400 bg-blue-400/10',
  draft: 'text-white/60 bg-white/10',
  cancelled: 'text-red-400 bg-red-400/10',
}
const STATUS_LABELS: Record<string, string> = {
  sent: 'Enviada',
  sending: 'Enviando…',
  scheduled: 'Programada',
  draft: 'Borrador',
  cancelled: 'Cancelada',
}

const columns = [
  {
    key: 'name', label: 'Campaña',
    render: (r: Campaign) => `<div class="font-medium">${r.name}</div><div class="text-xs text-white/50">${r.subjectEs}</div>`
  },
  {
    key: 'status', label: 'Estado',
    render: (r: Campaign) => `<span class="text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] ?? 'text-white/40'}">${STATUS_LABELS[r.status] ?? r.status}</span>`
  },
  {
    key: 'sentCount', label: 'Enviados',
    render: (r: Campaign) => r.sentCount ? `<span class="text-sm font-semibold">${r.sentCount.toLocaleString()}</span>` : '<span class="text-white/30">—</span>'
  },
  {
    key: 'sentAt', label: 'Fecha envío',
    render: (r: Campaign) => r.sentAt ? `<span class="text-xs text-white/50">${new Date(r.sentAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}</span>` : '<span class="text-white/30">—</span>'
  },
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex items-center mb-5">
      <div>
        <h1 class="font-display text-2xl">Newsletter</h1>
        <p class="text-white/50 text-sm">{{ rows.length }} campañas</p>
      </div>
      <button @click="openNew" class="ml-auto inline-flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">
        <Icon name="Add" :size="16" />
        <span>Nueva campaña</span>
      </button>
    </header>

    <!-- Campaigns table with extra "send" action -->
    <div class="bg-white/5 rounded-xl overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/10">
            <th v-for="col in columns" :key="col.key" class="text-left text-xs text-white/40 px-4 py-3 font-medium">{{ col.label }}</th>
            <th class="text-xs text-white/40 px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr>
            <td :colspan="columns.length + 1" class="text-center py-8 text-white/30">Cargando…</td>
          </tr>
        </tbody>
        <tbody v-else-if="!rows.length">
          <tr>
            <td :colspan="columns.length + 1" class="text-center py-12 text-white/30">Sin campañas. Crea tu primera campaña.</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="row in rows" :key="row.id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3" v-html="DOMPurify.sanitize(col.render(row))"></td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button
                  v-if="row.status === 'draft'"
                  @click="openSendModal(row)"
                  title="Enviar campaña"
                  class="inline-flex items-center gap-1 text-xs bg-brand/20 text-brand hover:bg-brand/30 px-2 py-1 rounded"
                >
                  <Icon name="Send2" :size="12" />
                  Enviar
                </button>
                <button @click="openEdit(row)" class="p-1.5 text-white/40 hover:text-white rounded">
                  <Icon name="Edit2" :size="14" />
                </button>
                <button @click="remove(row)" class="p-1.5 text-white/40 hover:text-red-400 rounded">
                  <Icon name="Trash" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit modal -->
    <AdminModal :open="open" :title="form.id ? 'Editar campaña' : 'Nueva campaña'" size="xl" @close="open = false">
      <!-- AI Generation Box -->
      <div class="mb-5 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
        <div class="flex items-center gap-2 mb-3">
          <svg class="text-purple-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 0 2h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1 0-2h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/></svg>
          <span class="text-sm font-semibold text-purple-300">Generar campaña con IA</span>
        </div>
        <div class="flex gap-2 flex-wrap">
          <input
            v-model="aiTopic"
            placeholder="Ej: Mes de la Independencia — promociones especiales…"
            class="flex-1 min-w-0 bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-purple-500/60 outline-none"
          />
          <input
            v-model="aiPromotion"
            placeholder="Promoción activa (opcional)"
            class="w-48 bg-night border border-white/15 rounded-lg px-3 py-2 text-sm focus:border-purple-500/60 outline-none"
          />
          <button
            @click="generateWithAI"
            :disabled="aiGenerating"
            class="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap"
          >
            <svg v-if="aiGenerating" class="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
            {{ aiGenerating ? 'Generando…' : 'Generar' }}
          </button>
        </div>
        <p v-if="aiError" class="text-xs text-red-400 mt-2">{{ aiError }}</p>
      </div>

      <div class="grid sm:grid-cols-2 gap-4">
        <FormField label="Nombre de campaña" required class="sm:col-span-2">
          <input v-model="form.name" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>

        <FormField label="Asunto del email (ES)" required>
          <input v-model="form.subjectEs" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Asunto del email (EN)" required>
          <input v-model="form.subjectEn" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>

        <FormField label="Preview text (ES)" hint="Texto previo visible en bandeja de entrada">
          <input v-model="form.previewTextEs" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>
        <FormField label="Preview text (EN)">
          <input v-model="form.previewTextEn" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </FormField>

        <FormField label="Cuerpo HTML (ES)" class="sm:col-span-2">
          <textarea v-model="form.bodyHtmlEs" rows="10" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm font-mono text-xs"></textarea>
        </FormField>
        <FormField label="Cuerpo HTML (EN)" class="sm:col-span-2">
          <textarea v-model="form.bodyHtmlEn" rows="10" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm font-mono text-xs"></textarea>
        </FormField>

        <FormField label="Estado" class="sm:col-span-2">
          <div class="flex gap-3">
            <label v-for="s in ['draft', 'scheduled', 'cancelled']" :key="s" class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" v-model="form.status" :value="s" class="accent-brand" />
              {{ STATUS_LABELS[s] ?? s }}
            </label>
          </div>
        </FormField>
      </div>

      <p v-if="error" class="text-sm text-accent mt-3">{{ error }}</p>

      <template #footer>
        <button @click="open = false" class="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">Cancelar</button>
        <button @click="save" :disabled="saving" class="text-sm px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold">
          {{ saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </template>
    </AdminModal>

    <!-- Send confirmation modal -->
    <AdminModal :open="sendModal" title="Enviar campaña" size="sm" @close="sendModal = false">
      <div v-if="!sendResult">
        <p class="text-sm text-white/70 mb-2">¿Enviar la campaña <strong class="text-white">{{ sendingName }}</strong> a todos los suscriptores activos?</p>
        <p class="text-xs text-amber-400">Esta acción no se puede deshacer.</p>
      </div>
      <div v-else-if="sendResult.ok" class="text-center py-4">
        <div class="text-4xl mb-3">✉️</div>
        <p class="font-semibold text-emerald-400">¡Campaña enviada!</p>
        <p class="text-sm text-white/60 mt-1">Se enviaron {{ sendResult.subscriberCount?.toLocaleString() }} correos.</p>
      </div>
      <div v-else class="text-center py-4">
        <p class="text-red-400 text-sm">{{ sendResult.error }}</p>
      </div>
      <template #footer>
        <button @click="sendModal = false" class="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">
          {{ sendResult ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button
          v-if="!sendResult"
          @click="sendCampaign"
          :disabled="isSending"
          class="text-sm px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold"
        >
          {{ isSending ? 'Enviando…' : 'Sí, enviar' }}
        </button>
      </template>
    </AdminModal>
  </div>
</template>
