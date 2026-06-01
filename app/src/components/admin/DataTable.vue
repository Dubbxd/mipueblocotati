<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue'
import DOMPurify from 'dompurify'
import Icon from '@/components/ui/Icon.vue'

defineProps<{
  rows: T[]
  columns: { key: string; label: string; render?: (row: T) => string; width?: string; class?: string }[]
  loading?: boolean
  empty?: string
  rowKey?: (row: T) => string | number
}>()

const emit = defineEmits<{
  (e: 'edit', row: T): void
  (e: 'delete', row: T): void
  (e: 'row-click', row: T): void
}>()

function get(row: any, path: string) {
  return path.split('.').reduce((o, k) => o?.[k], row)
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-white/10 bg-night-dark">
    <table class="w-full text-sm">
      <thead class="bg-white/5 text-white/70 text-xs uppercase tracking-wider">
        <tr>
          <th v-for="c in columns" :key="c.key" class="text-left font-semibold px-4 py-3" :style="c.width ? { width: c.width } : {}">{{ c.label }}</th>
          <th class="w-32"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length + 1" class="text-center py-12 text-white/50">Cargando…</td>
        </tr>
        <tr v-else-if="!rows.length">
          <td :colspan="columns.length + 1" class="text-center py-12 text-white/50">{{ empty || 'Sin registros' }}</td>
        </tr>
        <tr
          v-for="row in rows"
          :key="rowKey ? rowKey(row) : (row.id ?? JSON.stringify(row))"
          class="border-t border-white/5 hover:bg-white/[0.03] transition"
        >
          <td v-for="c in columns" :key="c.key" class="px-4 py-3 align-top" :class="c.class">
            <span v-if="c.render" v-html="DOMPurify.sanitize(c.render(row))"></span>
            <span v-else>{{ get(row, c.key) }}</span>
          </td>
          <td class="px-4 py-3 text-right whitespace-nowrap">
            <button @click="emit('edit', row)" class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 mr-1" title="Editar">
              <Icon name="Edit2" :size="14" />
              <span class="hidden sm:inline">Editar</span>
            </button>
            <button @click="emit('delete', row)" class="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-accent/15 hover:bg-accent/25 text-accent" title="Borrar">
              <Icon name="Trash" :size="14" />
              <span class="hidden sm:inline">Borrar</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
