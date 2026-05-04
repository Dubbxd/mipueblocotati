<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/lib/api'
import Icon from '@/components/ui/Icon.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const open = ref(false)
const pendingReservations = ref(0)
const pendingCatering = ref(0)

const sections = [
  { group: 'Principal', items: [
    { to: '/admin', label: 'Dashboard', icon: 'Element4', exact: true }
  ]},
  { group: 'Carta', items: [
    { to: '/admin/menu/items', label: 'Platillos', icon: 'MenuBoard' },
    { to: '/admin/menu/categories', label: 'Categorías', icon: 'Category2' },
    { to: '/admin/promotions', label: 'Promociones', icon: 'MedalStar' }
  ]},
  { group: 'Operación', items: [
    { to: '/admin/reservations', label: 'Reservas', icon: 'CalendarTick', badgeKey: 'res' as const },
    { to: '/admin/catering', label: 'Catering', icon: 'Box1', badgeKey: 'cat' as const },
    { to: '/admin/locations', label: 'Sucursales', icon: 'Location' }
  ]},
  { group: 'Marketing', items: [
    { to: '/admin/reviews', label: 'Reseñas', icon: 'Star1' },
    { to: '/admin/gallery', label: 'Galería', icon: 'Gallery' },
    { to: '/admin/newsletter', label: 'Suscriptores', icon: 'Sms' }
  ]},
  { group: 'Contenido', items: [
    { to: '/admin/blog', label: 'Blog', icon: 'Book1' },
    { to: '/admin/campaigns', label: 'Campañas', icon: 'Send2' }
  ]}
]

const initials = computed(() => {
  const n = auth.user?.name || auth.user?.email || '?'
  return n.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('')
})

async function loadBadges() {
  try {
    const [r, c] = await Promise.all([
      api<any[]>('/api/admin/reservations'),
      api<any[]>('/api/admin/catering')
    ])
    pendingReservations.value = Array.isArray(r) ? r.filter((x: any) => x.status === 'pending').length : 0
    pendingCatering.value = Array.isArray(c) ? c.filter((x: any) => x.status === 'new').length : 0
  } catch { /* ignore */ }
}

function badge(key: 'res' | 'cat' | undefined) {
  if (key === 'res') return pendingReservations.value
  if (key === 'cat') return pendingCatering.value
  return 0
}

function logout() {
  auth.logout()
  router.replace('/admin/login')
}

onMounted(() => {
  if (auth.token && !auth.user) auth.fetchMe()
  loadBadges()
})
</script>

<template>
  <div class="admin-dark min-h-screen bg-night text-white flex">
    <!-- Sidebar -->
    <aside
      class="fixed md:static inset-y-0 left-0 z-40 w-64 bg-night-dark border-r border-white/10 transform transition-transform md:transform-none flex flex-col"
      :class="open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    >
      <div class="p-5 border-b border-white/10 flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-brand text-white grid place-items-center font-display text-lg">MP</div>
        <div>
          <div class="font-display text-sm leading-tight">Mi Pueblo</div>
          <div class="text-xs text-white/60">Panel admin</div>
        </div>
      </div>
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <div v-for="section in sections" :key="section.group">
          <div class="px-3 text-[11px] uppercase tracking-wider text-white/40 mb-2">{{ section.group }}</div>
          <ul class="space-y-1">
            <li v-for="item in section.items" :key="item.to">
              <RouterLink
                :to="item.to"
                @click="open = false"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition"
                :class="(item.exact ? route.path === item.to : route.path.startsWith(item.to)) ? 'bg-brand/15 text-white border border-brand/30' : 'text-white/75'"
              >
                <Icon :name="item.icon" :size="18" />
                <span class="flex-1">{{ item.label }}</span>
                <span v-if="badge((item as any).badgeKey) > 0" class="text-[10px] px-1.5 py-0.5 rounded-full bg-accent text-white font-semibold">{{ badge((item as any).badgeKey) }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </nav>
      <div class="p-3 border-t border-white/10">
        <a href="/" target="_blank" class="flex items-center justify-center gap-2 text-xs text-white/50 hover:text-white py-2">
          <Icon name="ExportSquare" :size="14" />
          <span>Ver sitio público</span>
        </a>
      </div>
    </aside>

    <!-- Backdrop mobile -->
    <div v-if="open" @click="open = false" class="fixed inset-0 bg-black/50 z-30 md:hidden"></div>

    <!-- Main -->
    <div class="flex-1 min-w-0 flex flex-col">
      <header class="bg-night-soft border-b border-white/10 px-4 md:px-6 py-3 flex items-center gap-3">
        <button @click="open = !open" class="md:hidden p-2 -ml-2 rounded hover:bg-white/10" aria-label="Menú">
          <Icon name="HambergerMenu" :size="22" />
        </button>
        <div class="text-sm text-white/70 truncate">{{ (route.meta?.title as string) || 'Panel' }}</div>
        <div class="ml-auto flex items-center gap-3">
          <div class="hidden sm:block text-right text-xs">
            <div class="text-white">{{ auth.user?.name }}</div>
            <div class="text-white/50">{{ auth.user?.role }}</div>
          </div>
          <div class="w-9 h-9 rounded-full bg-brand grid place-items-center text-sm font-bold">{{ initials }}</div>
          <button @click="logout" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10">
            <Icon name="LogoutCurve" :size="14" />
            <span>Salir</span>
          </button>
        </div>
      </header>
      <main class="flex-1 p-4 md:p-6 lg:p-8 bg-night">
        <RouterView />
      </main>
    </div>
  </div>
</template>
