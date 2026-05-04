// Augment Vue's global components so <VsxIcon> y <Vue3Lottie> tengan tipos en *.vue
import type { DefineComponent, Ref } from 'vue'

// vue-iconsax ships without type declarations
declare module 'vue-iconsax' {
  import type { DefineComponent } from 'vue'
  export const VsxIcon: DefineComponent<{
    iconName: string
    type?: string
    size?: number | string
    color?: string
  }>
  export default VsxIcon
}

// vite-plugin-pwa virtual module
declare module 'virtual:pwa-register/vue' {
  export function useRegisterSW(options?: {
    immediate?: boolean
    onNeedRefresh?: () => void
    onOfflineReady?: () => void
    onRegisteredSW?: (swUrl: string, registration: ServiceWorkerRegistration | undefined) => void
    onRegisterError?: (error: unknown) => void
  }): {
    needRefresh: Ref<boolean>
    offlineReady: Ref<boolean>
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>
  }
}

declare module 'vue' {
  export interface GlobalComponents {
    VsxIcon: DefineComponent<{
      iconName: string
      type?: 'Linear' | 'Outline' | 'TwoTone' | 'Bulk' | 'Broken' | 'Bold'
      size?: number | string
      color?: string
    }>
    Vue3Lottie: DefineComponent<Record<string, any>>
  }
}

export {}
