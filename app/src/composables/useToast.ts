import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: number
  type: ToastType
  title: string
  message?: string
  duration: number
}

let _id = 0
const toasts = reactive<Toast[]>([])

function add(type: ToastType, title: string, message?: string, duration = 4500) {
  const id = ++_id
  toasts.push({ id, type, title, message, duration })
  if (duration > 0) setTimeout(() => remove(id), duration)
  return id
}

function remove(id: number) {
  const i = toasts.findIndex(t => t.id === id)
  if (i !== -1) toasts.splice(i, 1)
}

export function useToast() {
  return {
    toasts,
    success: (title: string, msg?: string, duration?: number) => add('success', title, msg, duration),
    error:   (title: string, msg?: string, duration?: number) => add('error',   title, msg, duration),
    info:    (title: string, msg?: string, duration?: number) => add('info',    title, msg, duration),
    warning: (title: string, msg?: string, duration?: number) => add('warning', title, msg, duration),
    remove,
  }
}
