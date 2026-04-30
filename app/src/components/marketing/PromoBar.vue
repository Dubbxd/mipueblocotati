<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import Icon from '@/components/ui/Icon.vue'
const { t } = useI18n()
const site = useSiteStore()
</script>

<template>
  <div v-if="!site.promoBarDismissed" class="bg-brand text-white text-center text-xs sm:text-sm py-2 px-10 relative font-bold">
    <RouterLink to="/promociones" class="hover:underline tracking-wide inline-flex items-center gap-1.5 justify-center">
      <Icon name="DiscountShape" :size="14" />
      <span>{{ t('promoBar.burritoThursday') }}</span>
    </RouterLink>
    <button @click="site.dismissPromoBar()" class="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-6 h-6 grid place-items-center rounded-full hover:bg-white/15" aria-label="Cerrar">
      <Icon name="CloseCircle" :size="16" />
    </button>
  </div>
</template>
