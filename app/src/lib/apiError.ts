export function apiErrorMessage(data: unknown, status: number): string {
  if (typeof data === 'string' && data.trim()) return data.trim()

  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>
    if (typeof payload.message === 'string' && payload.message.trim()) return payload.message.trim()
    if (typeof payload.error === 'string' && payload.error.trim()) return payload.error.trim()
  }

  if (status === 401) return 'Tu sesión no es válida o ya expiró.'
  if (status === 403) return 'No tienes permisos para realizar esta acción.'
  if (status === 404) return 'No se encontró el recurso solicitado.'
  if (status >= 500) return 'El servidor no pudo completar la solicitud. Intenta de nuevo.'
  return `Error HTTP ${status}`
}
