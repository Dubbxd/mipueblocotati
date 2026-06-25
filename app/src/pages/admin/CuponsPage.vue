<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import Icon from '@/components/ui/Icon.vue'

type Coupon = {
  id: number
  code: string
  type: string
  discountType: string
  discountValue: string
  minPurchase: string | null
  description: string | null
  subscriberEmail: string | null
  status: 'active' | 'redeemed' | 'expired'
  expiresAt: string | null
  redeemedAt: string | null
  redeemedBy: string | null
  createdAt: string
}

const auth = useAuthStore()
const rows = ref<Coupon[]>([])
const loading = ref(true)
const filterStatus = ref('all')

const scanCode = ref('')
const scanResult = ref<{ valid?: boolean; error?: string; coupon?: Coupon } | null>(null)
const scanning = ref(false)
const redeeming = ref(false)

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/coupons') }
  finally { loading.value = false }
}

const filtered = computed(() =>
  filterStatus.value === 'all'
    ? rows.value
    : rows.value.filter(r => r.status === filterStatus.value)
)

const stats = computed(() => ({
  active: rows.value.filter(r => r.status === 'active').length,
  redeemed: rows.value.filter(r => r.status === 'redeemed').length,
  expired: rows.value.filter(r => r.status === 'expired').length,
}))

async function validate() {
  const code = scanCode.value.trim().toUpperCase()
  if (!code) return
  scanning.value = true
  scanResult.value = null
  try {
    scanResult.value = await api(`/api/admin/coupons/validate/${encodeURIComponent(code)}`)
  } catch (e: any) {
    scanResult.value = { valid: false, error: e?.data?.error || e?.message || 'Cupón no encontrado' }
  } finally {
    scanning.value = false
  }
}

async function redeem() {
  const code = scanCode.value.trim().toUpperCase()
  if (!code) return
  redeeming.value = true
  try {
    await api(`/api/admin/coupons/redeem/${encodeURIComponent(code)}`, {
      method: 'POST',
      body: { redeemedBy: auth.user?.name || 'staff' },
    })
    scanResult.value = { valid: false, error: '¡Cupón canjeado exitosamente!' }
    scanCode.value = ''
    await load()
  } catch (e: any) {
    scanResult.value = { valid: false, error: e?.data?.error || e?.message || 'Error al canjear' }
  } finally {
    redeeming.value = false
  }
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

const STATUS_CLS: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300',
  redeemed: 'bg-white/10 text-white/50',
  expired: 'bg-red-500/20 text-red-300',
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  redeemed: 'Canjeado',
  expired: 'Expirado',
}

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-6">
      <div>
        <h1 class="font-display text-2xl">Cupones</h1>
        <p class="text-white/50 text-sm">{{ filtered.length }} de {{ rows.length }} cupones</p>
      </div>
    </header>

    <!-- Scanner card -->
    <div class="rounded-2xl border border-brand/30 bg-brand/5 p-6 mb-6">
      <div class="flex items-center gap-2 mb-4">
        <Icon name="ScanBarcode" :size="20" class="text-brand" />
        <h2 class="font-semibold text-lg">Validar / Canjear cupón</h2>
      </div>
      <div class="flex gap-3 flex-wrap">
        <input
          v-model="scanCode"
          type="text"
          placeholder="Ingresa el código (ej. MP-A3X9K2)"
          class="flex-1 min-w-0 bg-night border border-white/15 rounded-xl px-4 py-3 text-lg font-mono tracking-widest uppercase focus:border-brand outline-none"
          @keydown.enter="validate"
        />
        <button
          @click="validate"
          :disabled="scanning || !scanCode.trim()"
          class="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-50"
        >
          <Icon name="SearchNormal1" :size="18" />
          Validar
        </button>
      </div>

      <!-- Scan result -->
      <div v-if="scanResult" class="mt-4">
        <!-- Valid coupon -->
        <div v-if="scanResult.valid && scanResult.coupon" class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Icon name="TickCircle" type="Bold" :size="28" class="text-emerald-400" />
            </div>
            <div class="flex-1">
              <p class="text-emerald-300 font-bold text-lg mb-1">Cupón válido</p>
              <div class="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <div><span class="text-white/50">Código:</span> <span class="font-mono font-bold tracking-wider">{{ scanResult.coupon.code }}</span></div>
                <div><span class="text-white/50">Descuento:</span> <span class="font-bold">${{ scanResult.coupon.discountValue }} off</span></div>
                <div><span class="text-white/50">Mínimo:</span> ${{ scanResult.coupon.minPurchase || '0' }}</div>
                <div><span class="text-white/50">Expira:</span> {{ fmtDate(scanResult.coupon.expiresAt) }}</div>
                <div v-if="scanResult.coupon.subscriberEmail" class="sm:col-span-2"><span class="text-white/50">Cliente:</span> {{ scanResult.coupon.subscriberEmail }}</div>
              </div>
            </div>
          </div>
          <button
            @click="redeem"
            :disabled="redeeming"
            class="mt-4 w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Icon v-if="!redeeming" name="TickCircle" type="Bold" :size="20" />
            <svg v-else class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20" />
            </svg>
            {{ redeeming ? 'Canjeando…' : 'Canjear cupón' }}
          </button>
        </div>

        <!-- Invalid / error -->
        <div v-else class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-center gap-3">
          <Icon name="Warning2" type="Bold" :size="22" class="text-amber-400 shrink-0" />
          <p class="text-sm text-amber-200">{{ scanResult.error }}</p>
        </div>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-3 gap-3 mb-6">
      <div class="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
        <div class="text-2xl font-bold text-emerald-400">{{ stats.active }}</div>
        <div class="text-xs text-white/50">Activos</div>
      </div>
      <div class="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
        <div class="text-2xl font-bold text-white/70">{{ stats.redeemed }}</div>
        <div class="text-xs text-white/50">Canjeados</div>
      </div>
      <div class="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
        <div class="text-2xl font-bold text-red-400">{{ stats.expired }}</div>
        <div class="text-xs text-white/50">Expirados</div>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex items-center gap-3 mb-4">
      <select v-model="filterStatus" class="bg-night-dark border border-white/15 rounded-lg px-3 py-2 text-sm">
        <option value="all">Todos</option>
        <option value="active">Activos</option>
        <option value="redeemed">Canjeados</option>
        <option value="expired">Expirados</option>
      </select>
    </div>

    <!-- Coupons table -->
    <div class="overflow-x-auto rounded-xl border border-white/10 bg-night-dark">
      <table class="w-full text-sm">
        <thead class="bg-white/5 text-white/70 text-xs uppercase tracking-wider">
          <tr>
            <th class="text-left font-semibold px-4 py-3">Código</th>
            <th class="text-left font-semibold px-4 py-3 hidden sm:table-cell">Cliente</th>
            <th class="text-left font-semibold px-4 py-3">Descuento</th>
            <th class="text-left font-semibold px-4 py-3 hidden md:table-cell">Creado</th>
            <th class="text-left font-semibold px-4 py-3 hidden md:table-cell">Expira</th>
            <th class="text-left font-semibold px-4 py-3 w-28">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-white/50">Cargando…</td>
          </tr>
          <tr v-else-if="!filtered.length">
            <td colspan="6" class="text-center py-12 text-white/50">Sin cupones</td>
          </tr>
          <tr
            v-for="c in filtered"
            :key="c.id"
            class="border-t border-white/5 hover:bg-white/[0.03] transition"
          >
            <td class="px-4 py-3">
              <span class="font-mono font-bold tracking-wider text-white/90">{{ c.code }}</span>
              <span class="text-[10px] ml-1.5 text-white/40">{{ c.type }}</span>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell text-white/60 text-xs">{{ c.subscriberEmail || '—' }}</td>
            <td class="px-4 py-3">
              <span class="font-semibold">${{ c.discountValue }}</span>
              <span v-if="c.minPurchase" class="text-xs text-white/40 ml-1">mín ${{ c.minPurchase }}</span>
            </td>
            <td class="px-4 py-3 hidden md:table-cell text-xs text-white/50">{{ fmtDate(c.createdAt) }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-xs text-white/50">{{ fmtDate(c.expiresAt) }}</td>
            <td class="px-4 py-3">
              <span :class="STATUS_CLS[c.status]" class="text-[10px] uppercase px-2 py-1 rounded-full">
                {{ STATUS_LABELS[c.status] }}
              </span>
              <div v-if="c.redeemedBy" class="text-[10px] text-white/40 mt-0.5">por {{ c.redeemedBy }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
