<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import DataTable from '@/components/admin/DataTable.vue'
import Icon from '@/components/ui/Icon.vue'

type Sub = {
  id: number
  email: string
  name?: string | null
  locale: string
  source?: string | null
  isActive: boolean
  createdAt: string
}

const rows = ref<Sub[]>([])
const loading = ref(true)
const search = ref('')

async function load() { loading.value = true; try { rows.value = await api('/api/admin/newsletter') } finally { loading.value = false } }

const filtered = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return rows.value
  return rows.value.filter(r => r.email.toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q))
})

function exportCsv() {
  const header = 'email,name,locale,source,active,created_at\n'
  const body = filtered.value.map(r => [
    r.email,
    r.name || '',
    r.locale,
    r.source || '',
    r.isActive ? 'yes' : 'no',
    r.createdAt
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function remove(r: Sub) {
  if (!confirm(`¿Eliminar suscriptor ${r.email}?`)) return
  await api(`/api/admin/newsletter/${r.id}`, { method: 'DELETE' })
  await load()
}

const columns = [
  { key: 'email', label: 'Email', render: (r: Sub) => `<div class="font-medium">${r.email}</div><div class="text-xs text-white/50">${r.name || '—'}</div>` },
  { key: 'locale', label: 'Idioma', width: '80px' },
  { key: 'source', label: 'Origen', render: (r: Sub) => `<span class="text-xs text-white/70">${r.source || '—'}</span>` },
  { key: 'createdAt', label: 'Fecha', render: (r: Sub) => `<span class="text-xs">${new Date(r.createdAt).toLocaleDateString()}</span>` },
  { key: 'isActive', label: 'Activo', render: (r: Sub) => r.isActive ? '<span class="text-emerald-400 text-xs">●</span>' : '<span class="text-white/40 text-xs">○</span>' }
]

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl">Newsletter</h1>
        <p class="text-white/50 text-sm">{{ filtered.length }} suscriptores</p>
      </div>
      <div class="ml-auto flex gap-2">
        <input v-model="search" placeholder="Buscar email…" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm" />
        <button @click="exportCsv" class="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-lg">
          <Icon name="DocumentDownload" :size="16" />
          <span>Exportar CSV</span>
        </button>
      </div>
    </header>

    <DataTable :rows="filtered" :columns="columns as any" :loading="loading" empty="Sin suscriptores" @edit="() => {}" @delete="remove" />
  </div>
</template>
