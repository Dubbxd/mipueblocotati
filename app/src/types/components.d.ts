// Augment Vue's global components so <VsxIcon> y <Vue3Lottie> tengan tipos en *.vue
import type { DefineComponent } from 'vue'

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
