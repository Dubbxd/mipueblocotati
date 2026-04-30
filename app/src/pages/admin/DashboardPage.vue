<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/lib/api'
import Icon from '@/components/ui/Icon.vue'

type Stats = {
  reservationsToday: number
  reservationsPending: number
  cateringPending: number
  newsletterCount: number
  menuActive: number
  reviewsPending: number
  recentReservations: any[]
  recentCatering: any[]
}

const stats = ref<Stats>({
  reservationsToday: 0,
  reservationsPending: 0,
  cateringPending: 0,
  newsletterCount: 0,
  menuActive: 0,
  reviewsPending: 0,
  recentReservations: [],
  recentCatering: []
})
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const [reservations, catering, newsletter, menu, reviews] = await Promise.all([
      api<any[]>('/api/admin/reservations'),
      api<any[]>('/api/admin/catering'),
      api<any[]>('/api/admin/newsletter'),
      api<any[]>('/api/admin/menu/items'),
      api<any[]>('/api/admin/reviews')
    ])
    const today = new Date().toISOString().slice(0, 10)
    stats.value = {
      reservationsToday: reservations.filter(r => r.date === today).length,
      reservationsPending: reservations.filter(r => r.status === 'pending').length,
      cateringPending: catering.filter(c => c.status === 'new').length,
      newsletterCount: newsletter.length,
      menuActive: menu.filter(m => m.isAvailable).length,
      reviewsPending: reviews.filter(r => r.status === 'pending').length,
      recentReservations: [...reservations].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5),
      recentCatering: [...catering].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5)
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)

const cards = [
  { key: 'reservationsToday', label: 'Reservas hoy',         icon: 'Calendar',     color: 'bg-brand/15 text-brand-light border-brand/30' },
  { key: 'reservationsPending', label: 'Reservas pendientes', icon: 'Clock',        color: 'bg-accent/15 text-accent border-accent/30' },
  { key: 'cateringPending',   label: 'Catering pendiente',    icon: 'Box1',         color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { key: 'reviewsPending',    label: 'Reseñas por revisar',   icon: 'Star1',        color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  { key: 'menuActive',        label: 'Platillos activos',     icon: 'MenuBoard',    color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { key: 'newsletterCount',   label: 'Suscriptores newsletter', icon: 'Sms',        color: 'bg-sky-500/15 text-sky-300 border-sky-500/30' }
] as const
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="font-display text-3xl">Hola</h1>
      <p class="text-white/60 text-sm">Aquí está el resumen del restaurante</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
      <div v-for="c in cards" :key="c.key" class="rounded-2xl p-4 border" :class="c.color">
        <Icon :name="c.icon" :size="24" class="mb-1" />
        <div class="font-display text-3xl">{{ loading ? '·' : (stats as any)[c.key] }}</div>
        <div class="text-xs text-white/70 mt-1">{{ c.label }}</div>
      </div>
    </div>

    <div class="grid lg:grid-cols-2 gap-6">
      <section class="bg-night-dark rounded-2xl border border-white/10 p-5">
        <header class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg">Últimas reservas</h2>
          <RouterLink to="/admin/reservations" class="text-xs text-brand-light hover:underline inline-flex items-center gap-1">Ver todas <Icon name="ArrowRight" :size="12" /></RouterLink>
        </header>
        <ul class="divide-y divide-white/5">
          <li v-if="!stats.recentReservations.length" class="py-4 text-sm text-white/50">Sin reservas todavía</li>
          <li v-for="r in stats.recentReservations" :key="r.id" class="py-3 flex items-center gap-3 text-sm">
            <div class="w-10 h-10 rounded-lg bg-brand/15 text-brand-light grid place-items-center text-xs font-semibold">{{ r.partySize }}p</div>
            <div class="flex-1 min-w-0">
              <div class="truncate">{{ r.name }}</div>
              <div class="text-xs text-white/50">{{ r.date }} · {{ r.time }}</div>
            </div>
            <span class="text-[10px] uppercase px-2 py-1 rounded-full" :class="{
              'bg-amber-500/20 text-amber-300': r.status === 'pending',
              'bg-emerald-500/20 text-emerald-300': r.status === 'confirmed',
              'bg-white/10 text-white/60': r.status === 'completed',
              'bg-accent/20 text-accent': r.status === 'cancelled'
            }">{{ r.status }}</span>
          </li>
        </ul>
      </section>

      <section class="bg-night-dark rounded-2xl border border-white/10 p-5">
        <header class="flex items-center justify-between mb-4">
          <h2 class="font-display text-lg">Solicitudes de catering</h2>
          <RouterLink to="/admin/catering" class="text-xs text-brand-light hover:underline inline-flex items-center gap-1">Ver todas <Icon name="ArrowRight" :size="12" /></RouterLink>
        </header>
        <ul class="divide-y divide-white/5">
          <li v-if="!stats.recentCatering.length" class="py-4 text-sm text-white/50">Sin solicitudes todavía</li>
          <li v-for="c in stats.recentCatering" :key="c.id" class="py-3 text-sm">
            <div class="flex items-center justify-between">
              <span>{{ c.name }}</span>
              <span class="text-xs text-white/50">{{ c.eventDate }}</span>
            </div>
            <div class="text-xs text-white/50 mt-0.5">{{ c.guests }} personas · {{ c.eventType }}</div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
