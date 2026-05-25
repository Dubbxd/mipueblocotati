<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import AdminModal from '@/components/admin/AdminModal.vue'
import Icon from '@/components/ui/Icon.vue'

type Contact = {
  id: number
  email: string | null
  phone: string | null
  name: string | null
  locale: string
  tags: string[]
  notes: string | null
  consentTerms: boolean
  consentData: boolean
  consentMarketing: boolean
  consentedAt: string | null
  isSubscriber: boolean
  firstSeen: string
  lastSeen: string
  visitCount: number
  createdAt: string
}

type Interaction = {
  id: number
  type: string
  refTable: string | null
  refId: number | null
  summary: string | null
  metadata: Record<string, any>
  createdAt: string
}

type ContactDetail = Contact & { interactions: Interaction[] }

const INTERACTION_ICONS: Record<string, string> = {
  reservation:       'CalendarTick',
  catering:          'Box1',
  contact_form:      'Sms',
  newsletter_sub:    'AddCircle',
  newsletter_unsub:  'MinusCircle',
  survey:            'Star1',
}
const INTERACTION_LABELS: Record<string, string> = {
  reservation:       'Reserva',
  catering:          'Catering',
  contact_form:      'Mensaje de contacto',
  newsletter_sub:    'Suscripción newsletter',
  newsletter_unsub:  'Baja newsletter',
  survey:            'Encuesta de satisfacción',
}

const rows = ref<Contact[]>([])
const loading = ref(true)
const search = ref('')

const detailOpen = ref(false)
const detail = ref<ContactDetail | null>(null)
const detailLoading = ref(false)

const editOpen = ref(false)
const editForm = ref<Partial<Contact>>({})
const saving = ref(false)

const newTag = ref('')

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/contacts') }
  finally { loading.value = false }
}

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(c =>
    c.name?.toLowerCase().includes(q) ||
    c.email?.toLowerCase().includes(q) ||
    c.phone?.includes(q) ||
    c.tags?.some(t => t.toLowerCase().includes(q))
  )
})

async function openDetail(c: Contact) {
  detailOpen.value = true
  detail.value = null
  detailLoading.value = true
  try {
    detail.value = await api(`/api/admin/contacts/${c.id}`)
  } finally {
    detailLoading.value = false
  }
}

function openEdit(c: Contact) {
  editForm.value = { name: c.name || '', phone: c.phone || '', notes: c.notes || '', tags: [...(c.tags || [])] }
  editOpen.value = true
  if (!detail.value || detail.value.id !== c.id) openDetail(c)
}

async function save() {
  if (!detail.value) return
  saving.value = true
  try {
    await api(`/api/admin/contacts/${detail.value.id}`, {
      method: 'PATCH',
      body: {
        name: editForm.value.name || undefined,
        phone: editForm.value.phone || undefined,
        notes: editForm.value.notes || undefined,
        tags: editForm.value.tags,
      }
    })
    editOpen.value = false
    await load()
    await openDetail({ ...detail.value, ...(editForm.value as any) })
  } finally { saving.value = false }
}

function addTag() {
  const t = newTag.value.trim()
  if (!t || editForm.value.tags?.includes(t)) return
  editForm.value.tags = [...(editForm.value.tags || []), t]
  newTag.value = ''
}
function removeTag(t: string) {
  editForm.value.tags = editForm.value.tags?.filter(x => x !== t)
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl">Contactos CRM</h1>
        <p class="text-white/50 text-sm">{{ filtered.length }} de {{ rows.length }} contactos</p>
      </div>
      <div class="ml-auto flex gap-2">
        <div class="relative">
          <Icon name="SearchNormal1" :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            v-model="search"
            type="search"
            placeholder="Nombre, email, teléfono, tag…"
            class="bg-night-dark border border-white/15 rounded-lg pl-9 pr-3 py-2 text-sm w-64"
          />
        </div>
      </div>
    </header>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border border-white/10 bg-night-dark">
      <table class="w-full text-sm">
        <thead class="bg-white/5 text-white/70 text-xs uppercase tracking-wider">
          <tr>
            <th class="text-left font-semibold px-4 py-3">Contacto</th>
            <th class="text-left font-semibold px-4 py-3 hidden md:table-cell">Tags</th>
            <th class="text-left font-semibold px-4 py-3 hidden lg:table-cell">Visitas</th>
            <th class="text-left font-semibold px-4 py-3 hidden lg:table-cell">Última actividad</th>
            <th class="text-left font-semibold px-4 py-3 w-36">Estado</th>
            <th class="w-24"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-white/50">Cargando…</td>
          </tr>
          <tr v-else-if="!filtered.length">
            <td colspan="6" class="text-center py-12 text-white/50">Sin contactos</td>
          </tr>
          <tr
            v-for="c in filtered"
            :key="c.id"
            class="border-t border-white/5 hover:bg-white/[0.03] transition cursor-pointer"
            @click="openDetail(c)"
          >
            <!-- Contacto -->
            <td class="px-4 py-3 align-top">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center text-brand font-semibold text-sm shrink-0">
                  {{ (c.name || c.email || '?')[0].toUpperCase() }}
                </div>
                <div>
                  <div class="font-medium text-white/90">{{ c.name || '—' }}</div>
                  <div class="text-xs text-white/50">{{ c.email || c.phone || '—' }}</div>
                </div>
              </div>
            </td>
            <!-- Tags -->
            <td class="px-4 py-3 align-top hidden md:table-cell">
              <div v-if="c.tags?.length" class="flex flex-wrap gap-1">
                <span v-for="t in c.tags" :key="t" class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">{{ t }}</span>
              </div>
              <span v-else class="text-white/30">—</span>
            </td>
            <!-- Visitas -->
            <td class="px-4 py-3 align-top hidden lg:table-cell text-center">
              <span class="text-base font-semibold">{{ c.visitCount }}</span>
            </td>
            <!-- Última actividad -->
            <td class="px-4 py-3 align-top hidden lg:table-cell text-xs text-white/60">{{ fmtDate(c.lastSeen) }}</td>
            <!-- Estado badges -->
            <td class="px-4 py-3 align-top">
              <div class="flex flex-col gap-1">
                <span v-if="c.isSubscriber" class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 w-fit">Newsletter</span>
                <span v-if="c.consentMarketing" class="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 w-fit">Marketing</span>
                <span v-if="c.consentData" class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 w-fit">Datos ✓</span>
              </div>
            </td>
            <!-- Acciones -->
            <td class="px-4 py-3 text-right" @click.stop>
              <button @click="openEdit(c)" class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10">
                <Icon name="Edit2" :size="13" />
                <span class="hidden sm:inline">Editar</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail panel modal -->
    <AdminModal v-model="detailOpen" title="Perfil de contacto" size="lg">
      <div v-if="detailLoading" class="py-12 text-center text-white/50">Cargando…</div>
      <div v-else-if="detail" class="space-y-6">

        <!-- Info header -->
        <div class="flex flex-wrap gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="w-12 h-12 rounded-full bg-brand/25 flex items-center justify-center text-brand font-bold text-xl shrink-0">
            {{ (detail.name || detail.email || '?')[0].toUpperCase() }}
          </div>
          <div class="flex-1 min-w-40">
            <h3 class="font-semibold text-lg leading-tight">{{ detail.name || '(Sin nombre)' }}</h3>
            <div class="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-sm text-white/60">
              <a v-if="detail.email" :href="`mailto:${detail.email}`" class="hover:text-accent flex items-center gap-1">
                <Icon name="Sms" :size="13" />{{ detail.email }}
              </a>
              <a v-if="detail.phone" :href="`tel:${detail.phone}`" class="hover:text-accent flex items-center gap-1">
                <Icon name="Call" :size="13" />{{ detail.phone }}
              </a>
            </div>
          </div>
          <div class="flex flex-col gap-1 text-right text-xs text-white/50">
            <span>{{ detail.visitCount }} visita{{ detail.visitCount !== 1 ? 's' : '' }}</span>
            <span>Primera: {{ fmtDate(detail.firstSeen) }}</span>
            <span>Última: {{ fmtDate(detail.lastSeen) }}</span>
          </div>
        </div>

        <!-- Badges -->
        <div class="flex flex-wrap gap-2">
          <span v-if="detail.isSubscriber" class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Newsletter ✓</span>
          <span v-if="detail.consentMarketing" class="text-xs px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">Marketing ✓</span>
          <span v-if="detail.consentTerms" class="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">T&C ✓</span>
          <span v-if="detail.consentData" class="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">Datos ✓</span>
          <span v-if="detail.locale === 'en'" class="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">EN</span>
        </div>

        <!-- Tags -->
        <div v-if="detail.tags?.length">
          <p class="text-xs text-white/50 uppercase tracking-wide mb-2">Tags</p>
          <div class="flex flex-wrap gap-1.5">
            <span v-for="t in detail.tags" :key="t" class="text-xs px-2.5 py-1 rounded-full bg-brand/15 text-white/80 border border-brand/20">{{ t }}</span>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="detail.notes">
          <p class="text-xs text-white/50 uppercase tracking-wide mb-2">Notas internas</p>
          <div class="p-3 rounded-lg bg-white/5 text-sm text-white/70 whitespace-pre-wrap">{{ detail.notes }}</div>
        </div>

        <!-- Interactions timeline -->
        <div>
          <p class="text-xs text-white/50 uppercase tracking-wide mb-3">
            Historial de interacciones ({{ detail.interactions.length }})
          </p>
          <div v-if="!detail.interactions.length" class="text-sm text-white/40 text-center py-4">Sin interacciones registradas</div>
          <ol v-else class="relative border-l border-white/10 ml-3 space-y-4">
            <li v-for="ix in detail.interactions" :key="ix.id" class="ml-5">
              <span class="absolute -left-[9px] w-4 h-4 rounded-full bg-night-dark border-2 border-brand/50 flex items-center justify-center">
                <Icon :name="INTERACTION_ICONS[ix.type] || 'Activity'" :size="8" class="text-brand" />
              </span>
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-sm font-medium text-white/80">{{ INTERACTION_LABELS[ix.type] || ix.type }}</p>
                  <p v-if="ix.summary" class="text-xs text-white/50 mt-0.5">{{ ix.summary }}</p>
                </div>
                <span class="text-xs text-white/40 whitespace-nowrap shrink-0">{{ fmtDateTime(ix.createdAt) }}</span>
              </div>
            </li>
          </ol>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center pt-2 border-t border-white/10">
          <button @click="openEdit(detail)" class="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10">
            <Icon name="Edit2" :size="15" />
            Editar contacto
          </button>
          <button @click="detailOpen = false" class="px-4 py-2 text-sm rounded-lg border border-white/15 hover:bg-white/5">Cerrar</button>
        </div>
      </div>
    </AdminModal>

    <!-- Edit modal -->
    <AdminModal v-model="editOpen" title="Editar contacto">
      <div class="space-y-4">
        <div>
          <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">Nombre</label>
          <input v-model="editForm.name" type="text" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">Teléfono</label>
          <input v-model="editForm.phone" type="tel" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">Notas internas</label>
          <textarea v-model="editForm.notes" rows="3" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm resize-none"></textarea>
        </div>
        <!-- Tags -->
        <div>
          <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">Tags</label>
          <div v-if="editForm.tags?.length" class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-for="t in editForm.tags" :key="t"
              class="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-brand/15 border border-brand/25"
            >
              {{ t }}
              <button @click="removeTag(t)" class="text-white/50 hover:text-accent ml-0.5 leading-none">×</button>
            </span>
          </div>
          <div class="flex gap-2">
            <input
              v-model="newTag"
              type="text"
              placeholder="Nuevo tag…"
              class="flex-1 bg-night border border-white/15 rounded-lg px-3 py-2 text-sm"
              @keydown.enter.prevent="addTag"
            />
            <button @click="addTag" class="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm border border-white/15">
              <Icon name="Add" :size="16" />
            </button>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button @click="editOpen = false" class="px-4 py-2 text-sm rounded-lg border border-white/15 hover:bg-white/5">Cancelar</button>
          <button @click="save" :disabled="saving" class="btn-primary text-sm px-5 py-2 disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
