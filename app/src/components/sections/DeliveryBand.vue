<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'

const { locale } = useI18n()
const site = useSiteStore()
const main = computed(() => site.mainRestaurant)

const platforms = computed(() => [
  {
    name: 'DoorDash',
    sub: locale.value === 'es' ? 'Entrega a domicilio' : 'Home delivery',
    from: '#FF3008', to: '#C42200',
    href: main.value?.links?.delivery ?? 'https://www.doordash.com',
    icon: 'Truck',
  },
  {
    name: 'Uber Eats',
    sub: locale.value === 'es' ? 'Entrega rápida' : 'Fast delivery',
    from: '#1C1C1C', to: '#000000',
    href: 'https://www.ubereats.com',
    icon: 'Driving',
  },
  {
    name: 'Grubhub',
    sub: locale.value === 'es' ? 'Pide en línea' : 'Order online',
    from: '#F63440', to: '#C22028',
    href: 'https://www.grubhub.com',
    icon: 'Bag2',
  },
  {
    name: 'Clover · Pickup',
    sub: locale.value === 'es' ? 'Recoge sin espera' : 'Skip the wait',
    from: '#00B388', to: '#008B6A',
    href: main.value?.links?.pickup ?? '#',
    icon: 'ShoppingCart',
  },
])
</script>

<template>
  <section class="relative overflow-hidden bg-night">
    <!-- Dot grid background -->
    <div class="absolute inset-0 opacity-30"
      style="background-image: radial-gradient(circle, rgba(240,152,40,0.18) 1.5px, transparent 1.5px); background-size: 26px 26px;"></div>
    <!-- Glow blobs -->
    <div class="absolute -top-20 right-0 w-80 h-80 rounded-full bg-brand/20 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-12 left-0 w-60 h-60 rounded-full bg-accent/15 blur-2xl pointer-events-none"></div>

    <div class="relative z-10 container-page py-14 md:py-16">
      <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

        <!-- ── Left: headline ── -->
        <div class="shrink-0 text-center lg:text-left lg:max-w-[17rem]">
          <!-- Kicker pill -->
          <div class="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest mb-5">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            {{ locale === 'es' ? 'Disponible ahora' : 'Available now' }}
          </div>

          <h2 class="font-display text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
            {{ locale === 'es' ? 'Pídelo donde más te guste' : 'Order your way' }}
          </h2>
          <p class="text-sand-300 text-sm leading-relaxed mb-5">
            {{ locale === 'es'
              ? 'Entrega a domicilio o pickup — elige tu plataforma favorita y llega en minutos.'
              : 'Delivery or pickup — choose your favorite platform and get it in minutes.' }}
          </p>
          <!-- Delivery time badge -->
          <div class="inline-flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3.5 py-2">
            <Icon name="Clock" :size="14" class="text-accent shrink-0" />
            <span class="text-sand-200 text-xs font-medium">
              {{ locale === 'es' ? '30–45 min · Todos los días' : '30–45 min · Every day' }}
            </span>
          </div>
        </div>

        <!-- ── Right: platform cards grid ── -->
        <div class="flex-1 grid grid-cols-2 gap-3 w-full sm:gap-4">
          <a
            v-for="p in platforms"
            :key="p.name"
            :href="p.href"
            target="_blank"
            rel="noopener"
            class="group relative flex flex-col gap-2 p-4 sm:p-5 rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] active:scale-[0.99] cursor-pointer"
            :style="{ background: `linear-gradient(140deg, ${p.from} 0%, ${p.to} 100%)` }"
          >
            <!-- Shine on hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>

            <!-- Top row: icon + arrow -->
            <div class="flex items-center justify-between">
              <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <Icon :name="p.icon" :size="19" type="Bold" class="text-white drop-shadow" />
              </div>
              <Icon name="ArrowRight2" :size="14"
                class="text-white/50 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200" />
            </div>

            <!-- Platform name -->
            <div>
              <p class="font-bold text-white text-sm sm:text-base leading-tight">{{ p.name }}</p>
              <p class="text-white/65 text-[11px] sm:text-xs mt-0.5 leading-tight">{{ p.sub }}</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  </section>
</template>
