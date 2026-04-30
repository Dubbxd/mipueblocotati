<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useSiteStore } from '@/stores'
import 'leaflet/dist/leaflet.css'

const site = useSiteStore()
const props = withDefaults(defineProps<{ height?: string; only?: string }>(), { height: '420px' })
const mapEl = ref<HTMLDivElement>()
let map: any

onMounted(async () => {
  const L = await import('leaflet')
  // Fix default icon path issue with bundlers
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
  })

  const list = props.only ? site.restaurants.filter(r => r.id === props.only) : site.restaurants
  const center = list[0] ? [list[0].lat, list[0].lng] : [38.3, -122.7]
  map = L.map(mapEl.value!, { scrollWheelZoom: false }).setView(center as any, list.length === 1 ? 14 : 9)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map)

  for (const r of list) {
    L.marker([r.lat, r.lng]).addTo(map).bindPopup(
      `<strong>${r.name}</strong><br/>${r.address}<br/><a href="tel:${r.phone}">${r.phone}</a>`
    )
  }
})

onUnmounted(() => map?.remove())
</script>

<template>
  <div ref="mapEl" :style="{ height }" class="w-full rounded-2xl overflow-hidden shadow-soft"></div>
</template>
