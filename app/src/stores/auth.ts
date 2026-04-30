import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, tokenStorage } from '@/lib/api'

export type AdminUser = {
  id: number
  email: string
  name: string
  role: 'superadmin' | 'admin' | 'editor'
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AdminUser | null>(null)
  const token = ref<string | null>(tokenStorage.get())
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function fetchMe() {
    if (!token.value) return null
    try {
      const me = await api<AdminUser>('/api/auth/me')
      user.value = me
      return me
    } catch {
      logout()
      return null
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await api<{ token: string; user: AdminUser }>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false
      })
      token.value = res.token
      user.value = res.user
      tokenStorage.set(res.token)
      return true
    } catch (e: any) {
      error.value = e?.message || 'Error al iniciar sesión'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    tokenStorage.clear()
  }

  return { user, token, loading, error, isAuthenticated, login, logout, fetchMe }
})
