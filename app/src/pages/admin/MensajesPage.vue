<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import AdminModal from '@/components/admin/AdminModal.vue'
import Icon from '@/components/ui/Icon.vue'

type ContactMessage = {
  id: number
  contactId: number | null
  name: string
  email: string | null
  phone: string | null
  subject: string | null
  message: string
  consentTerms: boolean
  consentData: boolean
  status: 'new' | 'read' | 'replied' | 'archived'
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

const STATUS = [
  { v: 'new',      l: 'Nuevo',      cls: 'bg-amber-500/20 text-amber-300' },
  { v: 'read',     l: 'Leído',      cls: 'bg-sky-500/20 text-sky-300' },
  { v: 'replied',  l: 'Respondido', cls: 'bg-emerald-500/20 text-emerald-300' },
  { v: 'archived', l: 'Archivado',  cls: 'bg-white/10 text-white/50' },
]

const rows = ref<ContactMessage[]>([])
const loading = ref(true)
const filterStatus = ref('all')

const open = ref(false)
const current = ref<ContactMessage | null>(null)
const saving = ref(false)

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/contact-messages') }
  finally { loading.value = false }
}

const filtered = computed(() =>
  filterStatus.value === 'all'
    ? rows.value
    : rows.value.filter(r => r.status === filterStatus.value)
)

const unreadCount = computed(() => rows.value.filter(r => r.status === 'new').length)

function openDetail(msg: ContactMessage) {
  current.value = { ...msg }
  open.value = true
  // Si está nuevo, marcarlo como leído automáticamente
  if (msg.status === 'new') quickStatus(msg, 'read')
}

async function quickStatus(msg: ContactMessage, status: ContactMessage['status']) {
  await api(`/api/admin/contact-messages/${msg.id}`, { method: 'PATCH', body: { status } })
  const row = rows.value.find(r => r.id === msg.id)
  if (row) row.status = status
  if (current.value?.id === msg.id) current.value.status = status
}

async function save() {
  if (!current.value) return
  saving.value = true
  try {
    await api(`/api/admin/contact-messages/${current.value.id}`, {
      method: 'PATCH',
      body: { status: current.value.status, adminNotes: current.value.adminNotes || undefined }
    })
    open.value = false
    await load()
  } finally { saving.value = false }
}

function statusBadge(s: string) {
  const f = STATUS.find(x => x.v === s)
  return `<span class="text-[10px] uppercase px-2 py-1 rounded-full ${f?.cls || 'bg-white/10 text-white/60'}">${f?.l || s}</span>`
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl flex items-center gap-2">
          Mensajes
          <span v-if="unreadCount > 0" class="text-xs px-2 py-0.5 rounded-full bg-accent text-white font-semibold">{{ unreadCount }} nuevos</span>
        </h1>
        <p class="text-white/50 text-sm">{{ filtered.length }} de {{ rows.length }}</p>
      </div>
      <select v-model="filterStatus" class="ml-auto bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm">
        <option value="all">Todos los estados</option>
        <option v-for="s in STATUS" :key="s.v" :value="s.v">{{ s.l }}</option>
      </select>
    </header>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border border-white/10 bg-night-dark">
      <table class="w-full text-sm">
        <thead class="bg-white/5 text-white/70 text-xs uppercase tracking-wider">
          <tr>
            <th class="text-left font-semibold px-4 py-3">Fecha</th>
            <th class="text-left font-semibold px-4 py-3">Contacto</th>
            <th class="text-left font-semibold px-4 py-3">Asunto / Mensaje</th>
            <th class="text-left font-semibold px-4 py-3 w-28">Estado</th>
            <th class="w-32"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="text-center py-12 text-white/50">Cargando…</td>
          </tr>
          <tr v-else-if="!filtered.length">
            <td colspan="5" class="text-center py-12 text-white/50">Sin mensajes</td>
          </tr>
          <tr
            v-for="msg in filtered"
            :key="msg.id"
            class="border-t border-white/5 hover:bg-white/[0.03] transition cursor-pointer"
            :class="msg.status === 'new' ? 'bg-accent/5' : ''"
            @click="openDetail(msg)"
          >
            <td class="px-4 py-3 align-top text-xs text-white/60 whitespace-nowrap">{{ fmtDate(msg.createdAt) }}</td>
            <td class="px-4 py-3 align-top">
              <div class="font-medium" :class="msg.status === 'new' ? 'text-white' : 'text-white/80'">{{ msg.name }}</div>
              <div class="text-xs text-white/50 mt-0.5">{{ msg.email || '' }}{{ msg.email && msg.phone ? ' · ' : '' }}{{ msg.phone || '' }}</div>
            </td>
            <td class="px-4 py-3 align-top max-w-xs">
              <div v-if="msg.subject" class="text-xs font-semibold text-white/80 mb-0.5">{{ msg.subject }}</div>
              <div class="text-xs text-white/60 line-clamp-2">{{ msg.message }}</div>
            </td>
            <td class="px-4 py-3 align-top" v-html="statusBadge(msg.status)"></td>
            <td class="px-4 py-3 text-right whitespace-nowrap" @click.stop>
              <button @click="openDetail(msg)" class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10">
                <Icon name="Eye" :size="14" />
                <span class="hidden sm:inline">Ver</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Detail modal -->
    <AdminModal :open="open" @close="open = false" title="Mensaje de contacto" size="lg">
      <div v-if="current" class="space-y-5">

        <!-- Header info -->
        <div class="flex flex-wrap gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div class="space-y-1 flex-1 min-w-40">
            <p class="text-xs text-white/50 uppercase tracking-wide">Contacto</p>
            <p class="font-semibold">{{ current.name }}</p>
            <p v-if="current.email" class="text-sm text-white/60">
              <a :href="`mailto:${current.email}`" class="hover:text-accent" @click.stop>{{ current.email }}</a>
            </p>
            <p v-if="current.phone" class="text-sm text-white/60">
              <a :href="`tel:${current.phone}`" class="hover:text-accent" @click.stop>{{ current.phone }}</a>
            </p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-white/50 uppercase tracking-wide">Recibido</p>
            <p class="text-sm">{{ fmtDate(current.createdAt) }}</p>
          </div>
          <div class="space-y-1">
            <p class="text-xs text-white/50 uppercase tracking-wide">Consentimiento</p>
            <div class="flex gap-2 text-xs">
              <span :class="current.consentTerms ? 'text-emerald-400' : 'text-red-400'">
                <Icon name="TickCircle" :size="12" class="inline mr-0.5" />T&C
              </span>
              <span :class="current.consentData ? 'text-emerald-400' : 'text-red-400'">
                <Icon name="TickCircle" :size="12" class="inline mr-0.5" />Datos
              </span>
            </div>
          </div>
        </div>

        <!-- Message -->
        <div>
          <p v-if="current.subject" class="text-sm font-semibold text-white/80 mb-1">{{ current.subject }}</p>
          <div class="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-sm leading-relaxed whitespace-pre-wrap text-white/80">{{ current.message }}</div>
        </div>

        <!-- Quick reply link -->
        <a
          v-if="current.email"
          :href="`mailto:${current.email}?subject=Re: ${encodeURIComponent(current.subject || 'Tu mensaje a Mi Pueblo')}`"
          target="_blank"
          class="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-brand/20 border border-brand/30 text-white hover:bg-brand/30 transition"
        >
          <Icon name="Send2" :size="15" />
          Responder por email
        </a>

        <!-- Status + notes -->
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">Estado</label>
            <select v-model="current.status" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm">
              <option v-for="s in STATUS" :key="s.v" :value="s.v">{{ s.l }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">Notas internas</label>
            <textarea v-model="current.adminNotes" rows="2" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Solo visibles para el equipo…"></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2 border-t border-white/10">
          <button @click="open = false" class="px-4 py-2 text-sm rounded-lg border border-white/15 hover:bg-white/5">Cerrar</button>
          <button @click="save" :disabled="saving" class="btn-primary text-sm px-5 py-2 disabled:opacity-60">
            {{ saving ? 'Guardando…' : 'Guardar cambios' }}
          </button>
        </div>
      </div>
    </AdminModal>
  </div>
</template>
