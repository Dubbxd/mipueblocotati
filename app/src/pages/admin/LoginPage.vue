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
  <div class="min-h-screen bg-night text-white relative overflow-hidden flex items-center justify-center px-4">
    <img src="/assets/decor/chilles.png" alt="" class="absolute -right-24 top-1/2 -translate-y-1/2 h-[120%] opacity-30 pointer-events-none select-none" />
    <div class="absolute inset-0 bg-gradient-to-br from-night via-night-dark to-night/80"></div>

    <div class="relative w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-brand grid place-items-center font-display text-2xl shadow-elev">MP</div>
        <h1 class="font-display text-3xl mt-4">Panel Mi Pueblo</h1>
        <p class="text-white/60 text-sm mt-1">Inicia sesión para gestionar el restaurante</p>
      </div>

      <form @submit.prevent="submit" class="bg-night-dark/80 backdrop-blur rounded-2xl p-6 border border-white/10 shadow-elev space-y-4">
        <div>
          <label class="block text-xs uppercase tracking-wider text-white/60 mb-1.5">Correo</label>
          <input
            v-model="email"
            type="email"
            required
            autofocus
            placeholder="admin@mipueblocotati.com"
            class="w-full bg-night border border-white/15 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </div>
        <div>
          <label class="block text-xs uppercase tracking-wider text-white/60 mb-1.5">Contraseña</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPwd ? 'text' : 'password'"
              required
              placeholder="••••••••"
              class="w-full bg-night border border-white/15 rounded-lg px-3 py-2.5 pr-12 text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
            <button type="button" @click="showPwd = !showPwd" class="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 p-1.5 rounded hover:bg-white/10" :aria-label="showPwd ? 'Ocultar contraseña' : 'Ver contraseña'">
              <Icon :name="showPwd ? 'EyeSlash' : 'Eye'" :size="18" />
            </button>
          </div>
        </div>

        <p v-if="auth.error" class="text-sm text-accent bg-accent/10 border border-accent/30 rounded-lg px-3 py-2">{{ auth.error }}</p>

        <button
          type="submit"
          :disabled="auth.loading"
          class="w-full bg-brand hover:bg-brand-light disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
        >
          <span v-if="auth.loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          <Icon v-else name="LoginCurve" :size="18" />
          <span>{{ auth.loading ? 'Entrando…' : 'Iniciar sesión' }}</span>
        </button>
      </form>

      <p class="text-center text-xs text-white/40 mt-6">
        <a href="/" class="inline-flex items-center gap-1.5 hover:text-white">
          <Icon name="ArrowLeft" :size="14" />
          <span>Volver al sitio público</span>
        </a>
      </p>
    </div>
  </div>
</template>
