import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { menuItems, categories } from '@/data/menu'
import { restaurants } from '@/data/restaurants'
import { gallery } from '@/data/gallery'
import { awards, promotions } from '@/data/marketing'
import type { MenuTag } from '@/types/domain'

export const useMenuStore = defineStore('menu', () => {
  const search = ref('')
  const activeTag = ref<MenuTag | 'all'>('all')

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return menuItems.filter((m) => {
      if (activeTag.value !== 'all' && !m.tags.includes(activeTag.value)) return false
      if (!q) return true
      return m.name.es.toLowerCase().includes(q)
        || m.name.en.toLowerCase().includes(q)
        || (m.description?.es ?? '').toLowerCase().includes(q)
        || (m.description?.en ?? '').toLowerCase().includes(q)
    })
  })

  const grouped = computed(() => {
    const map = new Map<string, typeof menuItems>()
    for (const item of filtered.value) {
      if (!map.has(item.categoryId)) map.set(item.categoryId, [])
      map.get(item.categoryId)!.push(item)
    }
    return categories
      .filter((c) => map.has(c.id))
      .map((c) => ({ category: c, items: map.get(c.id)! }))
  })

  const popular = computed(() => menuItems.filter((m) => m.tags.includes('popular')))

  return { search, activeTag, filtered, grouped, popular, all: menuItems, categories }
})

export const useSiteStore = defineStore('site', () => {
  const promoBarDismissed = ref(localStorage.getItem('promoBarDismissed') === '1')
  const dismissPromoBar = () => { promoBarDismissed.value = true; localStorage.setItem('promoBarDismissed','1') }
  return { restaurants, gallery, awards, promotions, promoBarDismissed, dismissPromoBar }
})
