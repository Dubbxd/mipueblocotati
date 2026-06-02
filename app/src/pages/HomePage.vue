<script setup lang="ts">
import HeroSection from '@/components/sections/HeroSection.vue'
import TodaySection from '@/components/sections/TodaySection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import GalleryMasonry from '@/components/sections/GalleryMasonry.vue'
import MenuPreview from '@/components/sections/MenuPreview.vue'
import DeliveryBand from '@/components/sections/DeliveryBand.vue'
import CategoriesSection from '@/components/sections/CategoriesSection.vue'
import ReviewsBand from '@/components/sections/ReviewsBand.vue'
import AwardsBand from '@/components/sections/AwardsBand.vue'
import MapGoogle from '@/components/sections/MapGoogle.vue'
import Icon from '@/components/ui/Icon.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useSiteStore } from '@/stores'
const { t } = useI18n()
const site = useSiteStore()
const mainAddress = computed(() => {
  const r = site.mainRestaurant
  return r ? `${r.address}, ${r.city}, ${r.state}` : 'Mi Pueblo Cotati, CA'
})
const googleRatingStar = computed(() =>
  site.mainRestaurant?.googleRating ? `${site.mainRestaurant.googleRating.toFixed(1)} ★` : '4.4 ★'
)
</script>

<template>
  <main>
    <HeroSection />

    <TodaySection />

    <CategoriesSection />

    <MenuPreview />

    <DeliveryBand />

    <AboutSection
      show-kicker
      :kicker="t('home.story.kicker')"
      :title="t('home.story.title')"
      :body="t('home.story.body')"
      image="/assets/gallery/restaurantmx.jpg"
      image-alt="Restaurante Mi Pueblo Cotati"
      bg="white"
      kicker-icon="Heart"
      :stats="[
        { icon: 'Calendar', label: t('home.story.stats.sinceLabel'), value: '1997' },
        { icon: 'People',   label: t('home.story.stats.familyLabel'), value: t('home.story.stats.familyValue') },
        { icon: 'Star1',    label: 'Google',  value: googleRatingStar }
      ]"
      :badge="{ icon: 'Award', title: '25+', subtitle: t('home.story.badgeSubtitle') }"
    />

    <ReviewsBand />

    <AboutSection
      :kicker="t('home.catering.kicker')"
      :title="t('home.catering.title')"
      :body="t('home.catering.body')"
      :cta-label="t('home.catering.cta')"
      cta-href="/catering"
      image="/assets/gallery/catering-buffet-setup.jpg"
      image-alt="Catering Mi Pueblo"
      reverse
      bg="cream"
      kicker-icon="Cake"
      :stats="[
        { icon: 'People',     label: t('home.catering.stats.guestsLabel'), value: '20–500' },
        { icon: 'MenuBoard',  label: t('home.catering.stats.menusLabel'),  value: '15+' },
        { icon: 'Truck',      label: t('home.catering.stats.deliveryLabel'), value: t('home.catering.stats.deliveryValue') }
      ]"
      :badge="{ icon: 'Crown1', title: '500+', subtitle: t('home.catering.badgeSubtitle') }"
    />

    <AwardsBand />

    <GalleryMasonry />

    <!-- Salón para eventos: layout bento (diferente familia, rompe zigzag de 2× image+text) -->
    <section class="section bg-white">
      <div class="container-page">
        <div class="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <!-- Texto + bento stats -->
          <div>
            <h2 class="font-display text-3xl md:text-5xl font-extrabold text-secondary-dark mb-5 leading-[1.05]">
              {{ t('home.parties.title') }}
            </h2>
            <p class="text-secondary text-lg leading-relaxed mb-8 max-w-prose">{{ t('home.parties.body') }}</p>

            <!-- Bento 2×2 stats -->
            <div class="grid grid-cols-2 gap-3 mb-8">
              <div class="bg-sand-50 rounded-2xl px-5 py-4 ring-1 ring-sand-200">
                <span class="block font-display font-extrabold text-3xl text-brand">120</span>
                <span class="block text-xs uppercase tracking-widest text-ink-muted mt-1">{{ t('home.parties.stats.capacityLabel') }}</span>
              </div>
              <div class="bg-sand-50 rounded-2xl px-5 py-4 ring-1 ring-sand-200">
                <span class="block font-display font-extrabold text-3xl text-secondary-dark">7/7</span>
                <span class="block text-xs uppercase tracking-widest text-ink-muted mt-1">{{ t('home.parties.stats.daysLabel') }}</span>
              </div>
              <div class="bg-brand/5 rounded-2xl px-5 py-4 ring-1 ring-brand/10 col-span-2">
                <span class="block font-display font-extrabold text-2xl text-secondary-dark">100+</span>
                <span class="block text-xs uppercase tracking-widest text-ink-muted mt-1">{{ t('home.parties.badgeSubtitle') }}</span>
              </div>
            </div>

            <RouterLink to="/reservar" class="btn-primary inline-flex items-center gap-2 active:scale-[0.98]">
              <span>{{ t('home.parties.cta') }}</span>
              <Icon name="ArrowRight" :size="18" />
            </RouterLink>
          </div>

          <!-- Imagen con proporción diferente a AboutSection (square vs tall) -->
          <div class="relative">
            <img
              src="/assets/gallery/dining-room-tables-set.jpg"
              :alt="t('home.parties.title')"
              class="w-full aspect-square object-cover rounded-3xl shadow-elev"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="section bg-sand-100">
      <div class="container-page">
        <h2 class="section-header">{{ t('home.map.title') }}</h2>
        <p class="section-sub">{{ t('home.map.sub') }}</p>
        <div class="rounded-2xl overflow-hidden shadow-soft border border-sand-200">
          <MapGoogle :q="mainAddress" height="500px" :title="t('home.map.title')" />
        </div>
      </div>
    </section>
  </main>
</template>
