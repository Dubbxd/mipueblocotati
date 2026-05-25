<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPwd = ref(false)

onMounted(async () => {
  if (auth.token) {
    const me = await auth.fetchMe()
    if (me) router.replace('/admin')
  }
})

async function submit() {
  const ok = await auth.login(email.value.trim(), password.value)
  if (ok) router.replace('/admin')
}
</script>

<template>
  <div class="admin-dark min-h-screen flex bg-night text-white">

    <!-- ── Columna izquierda: foto ──────────────────────────────── -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
      <img
        src="/assets/gallery/chef-flames.jpg"
        alt="Chef en Mi Pueblo Cotati"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <!-- Overlay gradiente -->
      <div class="absolute inset-0 bg-gradient-to-r from-night/70 via-night/30 to-transparent"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-night/80 via-transparent to-transparent"></div>

      <!-- Branding sobre la foto -->
      <div class="relative z-10 flex flex-col justify-end p-10 pb-12">
        <div class="w-14 h-14 rounded-2xl bg-brand grid place-items-center font-display text-2xl shadow-elev mb-5">MP</div>
        <h2 class="font-display text-4xl xl:text-5xl font-bold leading-tight text-white">
          Mi Pueblo<br/>Cotati
        </h2>
        <p class="mt-3 text-white/70 text-base max-w-xs leading-relaxed">
          Auténtica cocina mexicana desde 1997.<br/>Panel de administración.
        </p>
        <div class="mt-8 flex items-center gap-2 text-white/50 text-sm">
          <span class="w-8 h-px bg-white/30"></span>
          <span>Sonoma County, California</span>
        </div>
      </div>
    </div>

    <!-- ── Columna derecha: formulario ─────────────────────────── -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-night-dark">

      <!-- Logo mobile -->
      <div class="lg:hidden text-center mb-8">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-brand grid place-items-center font-display text-2xl shadow-elev">MP</div>
        <h1 class="font-display text-2xl mt-3">Mi Pueblo Cotati</h1>
      </div>

      <div class="w-full max-w-sm">
        <div class="mb-8">
          <h1 class="font-display text-3xl font-bold">Bienvenido</h1>
          <p class="text-white/50 text-sm mt-1">Inicia sesión para gestionar el restaurante</p>
        </div>

        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              required
              autofocus
              placeholder="admin@mipueblocotati.com"
              class="w-full bg-night border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition placeholder:text-white/25"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Contraseña</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPwd ? 'text' : 'password'"
                required
                placeholder="••••••••"
                class="w-full bg-night border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition placeholder:text-white/25"
              />
              <button type="button" @click="showPwd = !showPwd"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 p-1 rounded hover:text-white/70 transition"
                :aria-label="showPwd ? 'Ocultar contraseña' : 'Ver contraseña'">
                <Icon :name="showPwd ? 'EyeSlash' : 'Eye'" :size="18" />
              </button>
            </div>
          </div>

          <p v-if="auth.error" class="text-sm text-accent bg-accent/10 border border-accent/25 rounded-xl px-4 py-2.5">
            {{ auth.error }}
          </p>

          <button
            type="submit"
            :disabled="auth.loading"
            class="w-full bg-brand hover:bg-brand-light disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand/20"
          >
            <span v-if="auth.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            <Icon v-else name="LoginCurve" :size="18" />
            <span>{{ auth.loading ? 'Entrando…' : 'Iniciar sesión' }}</span>
          </button>
        </form>

        <p class="text-center text-xs text-white/30 mt-8">
          <a href="/" class="inline-flex items-center gap-1.5 hover:text-white/60 transition">
            <Icon name="ArrowLeft" :size="13" />
            <span>Volver al sitio público</span>
          </a>
        </p>
      </div>
    </div>

  </div>
</template>
