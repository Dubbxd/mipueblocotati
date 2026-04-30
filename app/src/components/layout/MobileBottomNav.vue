<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { restaurants } from '@/data/restaurants'
import Icon from '@/components/ui/Icon.vue'
const { t } = useI18n()
const main = restaurants[0]
</script>

<template>
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-sand-200 shadow-elev pb-[env(safe-area-inset-bottom,0px)]">
    <div class="grid grid-cols-4 text-[10px] font-semibold uppercase tracking-wider">
      <a :href="main.links.pickup" target="_blank" rel="noopener" class="flex flex-col items-center justify-center py-2.5 min-h-[56px] text-brand active:bg-sand-100 transition-colors">
        <Icon name="Bag2" :size="22" />
        <span class="mt-0.5">{{ t('cta.orderOnline') }}</span>
      </a>
      <RouterLink to="/reservar" class="flex flex-col items-center justify-center py-2.5 min-h-[56px] text-secondary active:bg-sand-100 transition-colors">
        <Icon name="Calendar" :size="22" />
        <span class="mt-0.5">{{ t('nav.reserve') }}</span>
      </RouterLink>
      <RouterLink to="/menu" class="flex flex-col items-center justify-center py-2.5 min-h-[56px] text-secondary active:bg-sand-100 transition-colors">
        <Icon name="Reserve" :size="22" />
        <span class="mt-0.5">{{ t('nav.menu') }}</span>
      </RouterLink>
      <a :href="`tel:${main.phone}`" class="flex flex-col items-center justify-center py-2.5 min-h-[56px] text-secondary active:bg-sand-100 transition-colors">
        <Icon name="Call" :size="22" />
        <span class="mt-0.5">{{ t('cta.callUs') }}</span>
      </a>
    </div>
  </nav>
</template>
