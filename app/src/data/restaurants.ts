import type { Restaurant } from '@/types/domain'

// Fuente: mipueblocotati/scraping/01-informacion-general.md
// Coordenadas aproximadas (geocoded; refinar con Google Geocoding API).
export const restaurants: Restaurant[] = [
  {
    id: 'cotati', slug: 'cotati', name: 'Mi Pueblo Cotati', isMain: true,
    address: '7384 Commerce Blvd', city: 'Cotati', state: 'CA', zip: '94931',
    phone: '+1-707-792-4380', email: 'mipueblocotati1@gmail.com',
    lat: 38.3274, lng: -122.7094,
    photo: '/assets/gallery/restaurantmx.jpg',
    hours: { mon_fri: '11:00 AM – 9:00 PM', sat_sun: '10:00 AM – 9:00 PM' },
    links: {
      pickup: 'https://mi-pueblo-real-mex-cotati.cloveronline.com/menu/all',
      delivery: 'https://www.doordash.com/store/taqueria-mi-pueblo-cotati-275565/',
      reservations: 'https://www.mipueblocotati.com/reservations-online',
      facebook: 'https://www.facebook.com/MiPuebloCotati',
      instagram: 'https://www.instagram.com/mipueblocotati/'
    }
  },
  {
    id: 'petaluma-blvd', slug: 'petaluma-blvd-norte', name: 'Mi Pueblo Petaluma (Blvd N)',
    address: '800 Petaluma Blvd N', city: 'Petaluma', state: 'CA', zip: '94952',
    phone: '+1-707-762-8192', lat: 38.2483, lng: -122.6447,
    hours: { mon_fri: '11:00 AM – 9:00 PM', sat_sun: '10:00 AM – 9:00 PM' },
    links: {}
  },
  {
    id: 'petaluma-kentucky', slug: 'petaluma-kentucky', name: 'Mi Pueblo Petaluma (Kentucky St)',
    address: '108 Kentucky St', city: 'Petaluma', state: 'CA', zip: '94952',
    phone: '+1-707-769-9066', lat: 38.2335, lng: -122.6395,
    hours: { mon_fri: '11:00 AM – 9:00 PM', sat_sun: '10:00 AM – 9:00 PM' },
    links: {}
  },
  {
    id: 'novato', slug: 'novato', name: 'Mi Pueblo Novato',
    address: '905 Grant Ave', city: 'Novato', state: 'CA', zip: '94945',
    phone: '+1-415-878-0122', email: 'mipueblonovato@gmail.com',
    lat: 38.1057, lng: -122.5697,
    photo: '/assets/hero/novato-building.jpg',
    hours: { mon_fri: '11:00 AM – 9:00 PM', sat_sun: '10:00 AM – 9:00 PM' },
    links: { pickup: 'https://eatmipueblonovato.com/' }
  },
  {
    id: 'san-anselmo', slug: 'san-anselmo', name: 'Mi Pueblo San Anselmo',
    address: '208 Sir Francis Drake Blvd', city: 'San Anselmo', state: 'CA', zip: '94960',
    phone: '+1-415-460-1027', lat: 37.9747, lng: -122.5614,
    hours: { mon_fri: '11:00 AM – 9:00 PM', sat_sun: '10:00 AM – 9:00 PM' },
    links: {}
  },
  {
    id: 'windsor', slug: 'windsor', name: 'Mi Pueblo Windsor',
    address: '8832 Lakewood Dr', city: 'Windsor', state: 'CA', zip: '95492',
    phone: '+1-707-836-4360', lat: 38.5471, lng: -122.8164,
    hours: { mon_fri: '11:00 AM – 9:00 PM', sat_sun: '10:00 AM – 9:00 PM' },
    links: {}
  }
]
