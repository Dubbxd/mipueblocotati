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
      image="/assets/gallery/parrillada-especial.jpg"
      image-alt="Parrillada especial Mi Pueblo, ideal para eventos"
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

    <AboutSection
      :kicker="t('home.parties.kicker')"
      :title="t('home.parties.title')"
      :body="t('home.parties.body')"
      :cta-label="t('home.parties.cta')"
      cta-href="/reservar"
      image="/assets/gallery/clientes-brindis-patio.jpg"
      image-alt="Clientes celebrando en el patio de Mi Pueblo"
      bg="white"
      kicker-icon="Music"
      :stats="[
        { icon: 'People',   label: t('home.parties.stats.capacityLabel'), value: '120' },
        { icon: 'Calendar', label: t('home.parties.stats.daysLabel'),     value: '7/7' },
        { icon: 'Music',    label: t('home.parties.stats.musicLabel'),    value: t('home.parties.stats.musicValue') }
      ]"
      :badge="{ icon: 'Cake', title: '100+', subtitle: t('home.parties.badgeSubtitle') }"
    />

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
