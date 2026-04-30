import type { GalleryImage } from '@/types/domain'

// Fuente: mipueblonovato/scraping/05-activos-digitales.md
// 21 fotos con caption. Las imágenes viven en /assets/gallery/ (copiadas en build).
export const gallery: GalleryImage[] = [
  { id: 'g1',  src: '/assets/gallery/alambre-meal.webp',              alt: { es: 'Plato de alambre',                   en: 'Alambre meal.' },                    width: 2 },
  { id: 'g2',  src: '/assets/gallery/two-meals.webp',                 alt: { es: 'Dos platillos servidos',             en: 'Two meals.' } },
  { id: 'g3',  src: '/assets/gallery/served-drinks.webp',             alt: { es: 'Bebidas servidas',                   en: 'Served drinks.' } },
  { id: 'g4',  src: '/assets/gallery/tostada-raspada.webp',           alt: { es: 'Tostada raspada',                    en: 'Tostada Raspada.' },                 width: 2 },
  { id: 'g5',  src: '/assets/gallery/super-nachos.webp',              alt: { es: 'Súper nachos',                       en: 'The Super Nachos.' } },
  { id: 'g6',  src: '/assets/gallery/siete-mares-soup.webp',          alt: { es: 'Sopa siete mares',                   en: 'Siete Mares Soup.' } },
  { id: 'g7',  src: '/assets/gallery/quesa-birria.webp',              alt: { es: 'Quesa birria',                       en: 'Quesa Birria.' },                    width: 2 },
  { id: 'g8',  src: '/assets/gallery/molcajete-bowl.webp',            alt: { es: 'Molcajete',                          en: 'Molcajete bowl.' } },
  { id: 'g9',  src: '/assets/gallery/chile-relleno.webp',             alt: { es: 'Chile relleno',                      en: 'Chile Relleno.' } },
  { id: 'g10', src: '/assets/gallery/birria-bowl.webp',               alt: { es: 'Birria en plato',                    en: 'Birria bowl.' } },
  { id: 'g11', src: '/assets/gallery/burrito-served.webp',            alt: { es: 'Burrito servido',                    en: 'Burrito, served.' },                 width: 2 },
  { id: 'g12', src: '/assets/gallery/taco-tuesday.webp',              alt: { es: 'Martes de tacos',                    en: 'Taco Tuesday.' } },
  { id: 'g13', src: '/assets/gallery/pollo-con-crema.webp',           alt: { es: 'Pollo con crema',                    en: 'Pollo Con Crema.' } },
  { id: 'g14', src: '/assets/gallery/quesa-birria-taco-closeup.webp', alt: { es: 'Taco de quesa birria, primer plano', en: 'Quesa Birria taco, closeup.' } },
  { id: 'g15', src: '/assets/gallery/quesa-birria-taco-served.webp',  alt: { es: 'Taco de quesa birria servido',       en: 'Quesa Birria taco, served.' } },
  { id: 'g16', src: '/assets/gallery/taco-salad-top.webp',            alt: { es: 'Ensalada de taco vista superior',    en: 'Taco salad, top view.' },            width: 2 },
  { id: 'g17', src: '/assets/gallery/chef-flames.webp',               alt: { es: 'Chef con sartén en llamas',          en: 'Chef holding a pan with flames.' } },
  { id: 'g18', src: '/assets/gallery/restaurant-building-garden.webp',alt: { es: 'Restaurante y jardín',               en: 'Restaurant building and garden.' } },
  { id: 'g19', src: '/assets/gallery/taco-salad-served.webp',         alt: { es: 'Ensalada de taco servida',           en: 'Taco salad, served.' } },
  { id: 'g20', src: '/assets/gallery/quesa-birria-taco-2.webp',       alt: { es: 'Taco de quesa birria',               en: 'Quesa Birria taco served.' } },
  { id: 'g21', src: '/assets/gallery/camarones-con-steak.webp',       alt: { es: 'Camarones con steak',                en: 'Camarones Con Steak.' } }
]
