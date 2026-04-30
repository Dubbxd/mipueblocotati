import type { Award, Promotion } from '@/types/domain'

export const awards: Award[] = [
  { id: 'a1', title: { es: 'Mejor Burrito en Sonoma',           en: 'Best Burrito in Sonoma' },           badge: '/assets/awards/award-best-burrito-restaurant.png' },
  { id: 'a2', title: { es: 'Mejor Restaurante Mexicano Sonoma', en: 'Best Mexican Restaurant Sonoma' },   badge: '/assets/awards/award-best-mexican-sonoma.png' },
  { id: 'a3', title: { es: 'Mejores Steaks en Sonoma',          en: 'Best Steaks in Sonoma' },            badge: '/assets/awards/award-best-steaks-sonoma.png' },
  { id: 'a4', title: { es: 'Restaurant Guru Recommended',       en: 'Restaurant Guru Recommended' },      badge: '/assets/awards/award-restaurant-guru-certificate.png' },
  { id: 'a5', title: { es: 'Mi Pueblo · Familia desde 1997',    en: 'Mi Pueblo · Family since 1997' },    badge: '/assets/awards/award-mi-pueblo-badge.png' }
]

export const promotions: Promotion[] = [
  {
    id: 'burrito-thursday',
    title: { es: 'Jueves de Burrito', en: 'Burrito Thursday' },
    description: {
      es: 'Burrito regular a $10 con la compra de cualquier bebida. Solo los jueves.',
      en: 'Regular burrito for $10 with the purchase of any drink. Thursdays only.'
    },
    recurrence: 'weekly', dayOfWeek: 4, active: true,
    validAt: ['cotati'],
    cta: { label: { es: 'Ver menú', en: 'View Menu' }, href: '/menu#burritos' }
  },
  {
    id: 'taco-tuesday',
    title: { es: 'Martes de Taco', en: 'Taco Tuesday' },
    description: {
      es: 'Promoción especial de tacos cada martes en sucursales seleccionadas.',
      en: 'Special taco promotion every Tuesday at select locations.'
    },
    recurrence: 'weekly', dayOfWeek: 2, active: true,
    validAt: ['novato', 'petaluma-blvd', 'petaluma-kentucky'],
    cta: { label: { es: 'Ver sucursales', en: 'See locations' }, href: '/sucursales' }
  },
  {
    id: 'newsletter-5off',
    title: { es: '$5 de descuento al suscribirte', en: '$5 off when you subscribe' },
    description: {
      es: 'Recibe $5 de descuento al consumir $40 después de suscribirte al newsletter.',
      en: 'Get $5 off when you spend $40 after subscribing to our newsletter.'
    },
    recurrence: 'one_time', active: true,
    cta: { label: { es: 'Suscribirme', en: 'Subscribe' }, href: '#newsletter' }
  }
]
