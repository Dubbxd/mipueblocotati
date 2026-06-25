<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { api } from '@/lib/api'
import AdminModal from '@/components/admin/AdminModal.vue'
import Icon from '@/components/ui/Icon.vue'

type User = {
  id: number
  email: string
  name: string
  role: 'superadmin' | 'admin' | 'editor'
  allowedModules: string[]
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
}

const MODULE_LABELS: Record<string, string> = {
  menu: 'Carta / Platillos',
  promotions: 'Promociones',
  reservations: 'Reservaciones',
  catering: 'Catering',
  locations: 'Sucursales',
  messages: 'Mensajes',
  contacts: 'Contactos CRM',
  reviews: 'Reseñas',
  gallery: 'Galería',
  newsletter: 'Newsletter',
  coupons: 'Cupones',
  blog: 'Blog',
  campaigns: 'Campañas email',
  users: 'Gestión de usuarios',
}

const MODULE_ICONS: Record<string, string> = {
  menu: 'MenuBoard',
  promotions: 'MedalStar',
  reservations: 'CalendarTick',
  catering: 'Box1',
  locations: 'Location',
  messages: 'Sms',
  contacts: 'People',
  reviews: 'Star1',
  gallery: 'Gallery',
  newsletter: 'Sms',
  coupons: 'TicketDiscount',
  blog: 'Book1',
  campaigns: 'Send2',
  users: 'SecurityUser',
}

const ALL_MODULES = Object.keys(MODULE_LABELS)
const ROLES = [
  { v: 'superadmin', l: 'Super Admin', desc: 'Acceso total, gestiona usuarios' },
  { v: 'admin', l: 'Admin', desc: 'Acceso completo excepto gestión de usuarios' },
  { v: 'editor', l: 'Editor', desc: 'Acceso limitado a módulos asignados' },
]

const rows = ref<User[]>([])
const loading = ref(true)
const open = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const form = ref({
  id: null as number | null,
  email: '',
  name: '',
  password: '',
  role: 'editor' as 'superadmin' | 'admin' | 'editor',
  allowedModules: [] as string[],
  isActive: true,
})

async function load() {
  loading.value = true
  try { rows.value = await api('/api/admin/users') }
  finally { loading.value = false }
}

function openNew() {
  form.value = { id: null, email: '', name: '', password: '', role: 'editor', allowedModules: [], isActive: true }
  error.value = null
  open.value = true
}

function openEdit(u: User) {
  form.value = {
    id: u.id,
    email: u.email,
    name: u.name,
    password: '',
    role: u.role,
    allowedModules: [...(u.allowedModules || [])],
    isActive: u.isActive,
  }
  error.value = null
  open.value = true
}

const needsModules = computed(() => form.value.role === 'editor')

function toggleModule(mod: string) {
  const i = form.value.allowedModules.indexOf(mod)
  if (i === -1) form.value.allowedModules.push(mod)
  else form.value.allowedModules.splice(i, 1)
}

function selectAllModules() {
  form.value.allowedModules = [...ALL_MODULES]
}
function clearModules() {
  form.value.allowedModules = []
}

async function save() {
  error.value = null
  if (!form.value.name || !form.value.email) { error.value = 'Nombre y email son requeridos'; return }
  if (!form.value.id && (!form.value.password || form.value.password.length < 8)) {
    error.value = 'La contraseña debe tener al menos 8 caracteres'; return
  }
  saving.value = true
  try {
    if (form.value.id) {
      const body: Record<string, unknown> = {
        name: form.value.name,
        role: form.value.role,
        allowedModules: form.value.role === 'editor' ? form.value.allowedModules : [],
        isActive: form.value.isActive,
      }
      if (form.value.password) body.password = form.value.password
      await api(`/api/admin/users/${form.value.id}`, { method: 'PATCH', body })
    } else {
      await api('/api/admin/users', {
        method: 'POST',
        body: {
          email: form.value.email,
          password: form.value.password,
          name: form.value.name,
          role: form.value.role,
          allowedModules: form.value.role === 'editor' ? form.value.allowedModules : [],
        },
      })
    }
    open.value = false
    await load()
  } catch (e: any) {
    error.value = e?.data?.error || e?.message || 'Error al guardar'
  } finally {
    saving.value = false
  }
}

async function toggleActive(u: User) {
  await api(`/api/admin/users/${u.id}`, {
    method: 'PATCH',
    body: { isActive: !u.isActive },
  })
  await load()
}

function fmtDate(d: string | null) {
  if (!d) return 'Nunca'
  return new Date(d).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const ROLE_CLS: Record<string, string> = {
  superadmin: 'bg-purple-500/20 text-purple-300',
  admin: 'bg-brand/20 text-brand-light',
  editor: 'bg-white/10 text-white/60',
}

onMounted(load)
</script>

<template>
  <div>
    <header class="flex flex-wrap items-center gap-3 mb-5">
      <div>
        <h1 class="font-display text-2xl">Usuarios</h1>
        <p class="text-white/50 text-sm">{{ rows.length }} usuario{{ rows.length !== 1 ? 's' : '' }}</p>
      </div>
      <button @click="openNew" class="ml-auto inline-flex items-center gap-1.5 bg-brand hover:bg-brand-light text-white text-sm font-semibold px-4 py-2 rounded-lg">
        <Icon name="Add" :size="16" />
        Nuevo usuario
      </button>
    </header>

    <!-- Users table -->
    <div class="overflow-x-auto rounded-xl border border-white/10 bg-night-dark">
      <table class="w-full text-sm">
        <thead class="bg-white/5 text-white/70 text-xs uppercase tracking-wider">
          <tr>
            <th class="text-left font-semibold px-4 py-3">Usuario</th>
            <th class="text-left font-semibold px-4 py-3">Rol</th>
            <th class="text-left font-semibold px-4 py-3 hidden md:table-cell">Módulos</th>
            <th class="text-left font-semibold px-4 py-3 hidden lg:table-cell">Último acceso</th>
            <th class="text-left font-semibold px-4 py-3 w-24">Estado</th>
            <th class="w-28"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="6" class="text-center py-12 text-white/50">Cargando…</td>
          </tr>
          <tr v-else-if="!rows.length">
            <td colspan="6" class="text-center py-12 text-white/50">Sin usuarios</td>
          </tr>
          <tr v-for="u in rows" :key="u.id" class="border-t border-white/5 hover:bg-white/[0.03] transition">
            <td class="px-4 py-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                  :class="u.isActive ? 'bg-brand/20 text-brand' : 'bg-white/10 text-white/40'">
                  {{ u.name[0]?.toUpperCase() }}
                </div>
                <div>
                  <div class="font-medium" :class="u.isActive ? 'text-white/90' : 'text-white/40'">{{ u.name }}</div>
                  <div class="text-xs text-white/50">{{ u.email }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3">
              <span :class="ROLE_CLS[u.role]" class="text-[10px] uppercase px-2 py-1 rounded-full font-semibold tracking-wide">{{ u.role }}</span>
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <div v-if="u.role === 'superadmin'" class="text-xs text-purple-300">Todos</div>
              <div v-else-if="!u.allowedModules?.length" class="text-xs text-white/40">Todos</div>
              <div v-else class="flex flex-wrap gap-1">
                <span v-for="m in u.allowedModules.slice(0, 4)" :key="m" class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                  {{ MODULE_LABELS[m] || m }}
                </span>
                <span v-if="u.allowedModules.length > 4" class="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">
                  +{{ u.allowedModules.length - 4 }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell text-xs text-white/50">{{ fmtDate(u.lastLoginAt) }}</td>
            <td class="px-4 py-3">
              <span :class="u.isActive ? 'text-emerald-400' : 'text-red-400'" class="text-xs">
                {{ u.isActive ? '● Activo' : '○ Inactivo' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right" @click.stop>
              <div class="flex items-center justify-end gap-1">
                <button @click="openEdit(u)" class="p-1.5 text-white/40 hover:text-white rounded" title="Editar">
                  <Icon name="Edit2" :size="14" />
                </button>
                <button @click="toggleActive(u)" class="p-1.5 rounded" :class="u.isActive ? 'text-white/40 hover:text-red-400' : 'text-white/40 hover:text-emerald-400'" :title="u.isActive ? 'Desactivar' : 'Activar'">
                  <Icon :name="u.isActive ? 'CloseCircle' : 'TickCircle'" :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit modal -->
    <AdminModal :open="open" :title="form.id ? 'Editar usuario' : 'Nuevo usuario'" size="lg" @close="open = false">
      <div class="space-y-5">
        <!-- Basic info -->
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">Nombre *</label>
            <input v-model="form.name" type="text" class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">Email *</label>
            <input v-model="form.email" type="email" :disabled="!!form.id" :class="form.id ? 'opacity-50' : ''"
              class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label class="text-xs text-white/50 uppercase tracking-wide block mb-1.5">
            {{ form.id ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *' }}
          </label>
          <input v-model="form.password" type="password" :placeholder="form.id ? '••••••••' : 'Mínimo 8 caracteres'"
            class="w-full bg-night border border-white/15 rounded-lg px-3 py-2 text-sm" autocomplete="new-password" />
        </div>

        <!-- Role selector -->
        <div>
          <label class="text-xs text-white/50 uppercase tracking-wide block mb-2">Rol</label>
          <div class="grid grid-cols-3 gap-3">
            <button v-for="r in ROLES" :key="r.v" type="button" @click="form.role = r.v as any"
              :class="form.role === r.v
                ? 'border-brand bg-brand/10 text-white'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'"
              class="border-2 rounded-xl p-3 text-left transition-all">
              <div class="font-semibold text-sm">{{ r.l }}</div>
              <div class="text-[11px] mt-0.5 opacity-70">{{ r.desc }}</div>
            </button>
          </div>
        </div>

        <!-- Module permissions (only for editor) -->
        <div v-if="needsModules" class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div class="flex items-center justify-between mb-3">
            <label class="text-xs text-white/50 uppercase tracking-wide">Módulos permitidos</label>
            <div class="flex gap-2">
              <button @click="selectAllModules" class="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-white/60">Todos</button>
              <button @click="clearModules" class="text-[10px] px-2 py-1 rounded bg-white/10 hover:bg-white/15 text-white/60">Ninguno</button>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button v-for="mod in ALL_MODULES" :key="mod" type="button" @click="toggleModule(mod)"
              :class="form.allowedModules.includes(mod)
                ? 'border-brand bg-brand/15 text-white'
                : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20'"
              class="flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-medium transition-all text-left">
              <Icon :name="MODULE_ICONS[mod] || 'Category2'" :size="14"
                :class="form.allowedModules.includes(mod) ? 'text-brand' : 'text-white/30'" />
              {{ MODULE_LABELS[mod] }}
            </button>
          </div>
          <p v-if="!form.allowedModules.length" class="text-[11px] text-amber-400 mt-2">
            Selecciona al menos un módulo para que el usuario pueda acceder al panel.
          </p>
        </div>
        <div v-else class="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p class="text-xs text-white/50">
            <span v-if="form.role === 'superadmin'" class="text-purple-300">Super Admin tiene acceso a todos los módulos, incluyendo gestión de usuarios.</span>
            <span v-else class="text-white/60">Admin tiene acceso a todos los módulos excepto gestión de usuarios.</span>
          </p>
        </div>

        <!-- Active toggle -->
        <label v-if="form.id" class="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" v-model="form.isActive" class="h-4 w-4 rounded border-white/40 text-brand cursor-pointer" />
          <span class="text-sm">Usuario activo</span>
        </label>

        <p v-if="error" class="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{{ error }}</p>
      </div>

      <template #footer>
        <button @click="open = false" class="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10">Cancelar</button>
        <button @click="save" :disabled="saving" class="text-sm px-4 py-2 rounded-lg bg-brand hover:bg-brand-light text-white font-semibold disabled:opacity-60">
          {{ saving ? 'Guardando…' : (form.id ? 'Guardar cambios' : 'Crear usuario') }}
        </button>
      </template>
    </AdminModal>
  </div>
</template>
