<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { restaurants } from '@/data/restaurants'
import NewsletterForm from '@/components/marketing/NewsletterForm.vue'
import Icon from '@/components/ui/Icon.vue'
const { t } = useI18n()
const main = restaurants[0]
</script>

<template>
  <footer class="bg-night text-sand-100 mt-16 border-t-4 border-brand">
    <!-- Banda de delivery / pickup -->
    <div class="bg-night-soft border-b border-night-light">
      <div class="container-page py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p class="font-impact uppercase text-sand-100 text-lg tracking-wider text-center md:text-left flex items-center gap-2 justify-center md:justify-start">
          <Icon name="Truck" :size="24" class="text-accent" />
          <span>{{ t('footer.deliveryWith') }}:</span>
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <a v-if="main.links.delivery" :href="main.links.delivery" target="_blank" rel="noopener"
             class="px-4 py-2 rounded-lg bg-[#FF3008] text-white font-bold text-sm hover:scale-105 transition-transform shadow-md">DoorDash</a>
          <a href="https://www.ubereats.com" target="_blank" rel="noopener"
             class="px-4 py-2 rounded-lg bg-black text-white font-bold text-sm hover:scale-105 transition-transform shadow-md">Uber Eats</a>
          <a href="https://www.grubhub.com" target="_blank" rel="noopener"
             class="px-4 py-2 rounded-lg bg-[#F63440] text-white font-bold text-sm hover:scale-105 transition-transform shadow-md">Grubhub</a>
          <a v-if="main.links.pickup" :href="main.links.pickup" target="_blank" rel="noopener"
             class="px-4 py-2 rounded-lg bg-[#00B388] text-white font-bold text-sm hover:scale-105 transition-transform shadow-md">Clover · Pickup</a>
        </div>
      </div>
    </div>

    <div class="container-page py-14 grid gap-10 md:grid-cols-4">
      <div>
        <img src="/logo.png" alt="Mi Pueblo Cotati" class="h-14 mb-3 brightness-0 invert" />
        <p class="text-sm text-sand-200 leading-relaxed">{{ t('footer.powered') }}.<br/>{{ t('footer.since') }}.</p>
      </div>

      <div>
        <h4 class="font-impact uppercase tracking-wider text-lg mb-3 text-accent inline-flex items-center gap-2">
          <Icon name="Location" :size="18" />
          <span>{{ t('contact.address') }}</span>
        </h4>
        <p class="text-sm text-sand-200">{{ main.address }}<br/>{{ main.city }}, {{ main.state }} {{ main.zip }}</p>
        <a :href="`tel:${main.phone}`" class="mt-2 text-sm text-sand-100 hover:text-accent inline-flex items-center gap-1.5">
          <Icon name="Call" :size="14" />
          <span>{{ main.phone }}</span>
        </a>
        <a :href="`mailto:${main.email}`" class="text-sm text-sand-100 hover:text-accent inline-flex items-center gap-1.5">
          <Icon name="Sms" :size="14" />
          <span>{{ main.email }}</span>
        </a>
      </div>

      <div>
        <h4 class="font-impact uppercase tracking-wider text-lg mb-3 text-accent inline-flex items-center gap-2">
          <Icon name="Clock" :size="18" />
          <span>{{ t('contact.hours') }}</span>
        </h4>
        <p class="text-sm text-sand-200">{{ t('contact.weekdays') }} · {{ main.hours.mon_fri }}<br/>{{ t('contact.weekend') }} · {{ main.hours.sat_sun }}</p>
        <h4 class="font-impact uppercase tracking-wider text-lg mt-5 mb-2 text-accent inline-flex items-center gap-2">
          <Icon name="Heart" :size="18" />
          <span>{{ t('footer.follow') }}</span>
        </h4>
        <div class="flex gap-3">
          <a v-if="main.links.facebook" :href="main.links.facebook" target="_blank" rel="noopener" class="hover:text-accent inline-flex items-center gap-1" aria-label="Facebook">
            <Icon name="Facebook" :size="18" />
            <span class="sr-only sm:not-sr-only text-sm">Facebook</span>
          </a>
          <a v-if="main.links.instagram" :href="main.links.instagram" target="_blank" rel="noopener" class="hover:text-accent inline-flex items-center gap-1" aria-label="Instagram">
            <Icon name="Instagram" :size="18" />
            <span class="sr-only sm:not-sr-only text-sm">Instagram</span>
          </a>
        </div>
      </div>

      <div>
        <NewsletterForm />
      </div>
    </div>

    <div class="border-t border-night-light text-center text-xs text-sand-300 py-4">
      &copy; {{ new Date().getFullYear() }} Mi Pueblo Cotati &middot; {{ t('footer.rights') }} &middot;
      <RouterLink to="/legal/privacidad" class="underline hover:text-accent">{{ t('footer.privacy') }}</RouterLink> &middot;
      <RouterLink to="/legal/terminos" class="underline hover:text-accent">{{ t('footer.terms') }}</RouterLink> &middot;
      <RouterLink to="/legal/cookies" class="underline hover:text-accent">{{ t('footer.cookies') }}</RouterLink>
    </div>
  </footer>
</template>
