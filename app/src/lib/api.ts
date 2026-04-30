const BASE = import.meta.env.VITE_API_URL || ''
const TOKEN_KEY = 'mp_admin_token'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY)
}

type Options = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
  query?: Record<string, string | number | boolean | undefined>
  isForm?: boolean
}

export class ApiError extends Error {
  status: number
  data: unknown
  constructor(status: number, message: string, data: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, auth = true, query, isForm = false } = opts
  const headers: Record<string, string> = {}
  if (auth) {
    const t = tokenStorage.get()
    if (t) headers['Authorization'] = `Bearer ${t}`
  }
  let url = `${BASE}${path}`
  if (query) {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
    }
    const s = qs.toString()
    if (s) url += `?${s}`
  }
  let payload: BodyInit | undefined
  if (body !== undefined) {
    if (isForm) {
      payload = body as FormData
    } else {
      headers['Content-Type'] = 'application/json'
      payload = JSON.stringify(body)
    }
  }
  const res = await fetch(url, { method, headers, body: payload })
  const ct = res.headers.get('content-type') || ''
  const data = ct.includes('application/json') ? await res.json() : await res.text()
  if (!res.ok) {
    const msg = (data && typeof data === 'object' && 'message' in (data as any))
      ? (data as any).message
      : `HTTP ${res.status}`
    if (res.status === 401) tokenStorage.clear()
    throw new ApiError(res.status, msg, data)
  }
  return data as T
}

export async function uploadFile(file: File): Promise<{ url: string; id: number }> {
  const fd = new FormData()
  fd.append('file', file)
  return api('/api/upload', { method: 'POST', body: fd, isForm: true })
}
