import type { MenuItem } from '@/types/domain'

// Fotos de respaldo por categoría, usadas cuando un platillo no tiene foto propia
// (hoy ningún item de data/menu.ts trae `photo`, así que esto cubre toda la app).
export const CATEGORY_FALLBACK_PHOTO: Record<string, string> = {
  appetizers: '/assets/gallery/aguachile-tostada.jpg',
  specialties: '/assets/gallery/tomahawk-steak.jpg',
  tacos: '/assets/gallery/tacos-al-pastor-grill.jpg',
  burritos: '/assets/gallery/burrito-deluxe.jpg',
  meats: '/assets/gallery/fajitas-sizzling.jpg',
  seafood: '/assets/gallery/pescado-frito-entero.jpg',
  'seafood-combos': '/assets/gallery/pescado-frito-entero.jpg',
}

export const DEFAULT_DISH_PHOTO = '/assets/gallery/fajitas-sizzling.jpg'

/** Foto a usar para un platillo: la propia si existe, si no la de su categoría. */
export function dishPhoto(item: Pick<MenuItem, 'photo' | 'categoryId'>): string {
  if (item.photo) return item.photo.replace('.webp', '.jpg')
  return CATEGORY_FALLBACK_PHOTO[item.categoryId] ?? DEFAULT_DISH_PHOTO
}
