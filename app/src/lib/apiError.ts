// Mensajes específicos por campo para errores de validación (422) de los formularios públicos.
const VALIDATION_FIELD_MESSAGES: Record<string, string> = {
  email: 'Revisa tu correo electrónico, el formato no parece válido.',
  message: 'Tu mensaje es muy corto, escribe al menos 10 caracteres.',
  name: 'Revisa el campo de nombre.',
  phone: 'Revisa tu número de teléfono.',
  date: 'Revisa la fecha seleccionada.',
  time: 'Revisa la hora seleccionada.',
  partySize: 'Revisa el número de personas.',
  consentTerms: 'Debes aceptar los términos y condiciones.',
  consentData: 'Debes aceptar el uso de tus datos.',
}

export function apiErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>
    if (payload.error === 'validation' && typeof payload.field === 'string') {
      const known = VALIDATION_FIELD_MESSAGES[payload.field]
      if (known) return known
    }
  }

  if (typeof data === 'string' && data.trim()) return data.trim()

  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>
    if (typeof payload.message === 'string' && payload.message.trim()) return payload.message.trim()
    if (typeof payload.error === 'string' && payload.error.trim()) return payload.error.trim()
  }

  if (status === 401) return 'Tu sesión no es válida o ya expiró.'
  if (status === 403) return 'No tienes permisos para realizar esta acción.'
  if (status === 404) return 'No se encontró el recurso solicitado.'
  if (status === 422) return 'Revisa los datos del formulario e inténtalo de nuevo.'
  if (status >= 500) return 'El servidor no pudo completar la solicitud. Intenta de nuevo.'
  return `Error HTTP ${status}`
}
