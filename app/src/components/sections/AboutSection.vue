<script setup lang="ts">
import Icon from '@/components/ui/Icon.vue'

interface Stat {
  icon: string
  label: string
  value: string
}
interface Badge {
  icon: string
  title: string
  subtitle: string
}

defineProps<{
  kicker?: string
  title: string
  body: string
  image: string
  imageAlt: string
  ctaLabel?: string
  ctaHref?: string
  reverse?: boolean
  bg?: 'sand' | 'cream' | 'white'
  stats?: Stat[]
  badge?: Badge
  kickerIcon?: string
}>()
</script>

<template>
  <section
    class="section relative overflow-hidden"
    :class="{
      'bg-sand-100': bg === 'sand',
      'bg-sand-200': bg === 'cream',
      'bg-white': bg === 'white' || !bg
    }"
  >
    <div
      class="container-page grid items-center gap-12 md:gap-20 md:grid-cols-2"
      :class="{ 'md:[&>*:first-child]:order-2': reverse }"
      v-motion
      :initial="{ opacity: 0, y: 24 }"
      :visibleOnce="{ opacity: 1, y: 0, transition: { duration: 600 } }"
    >
      <!-- TEXT -->
      <div class="relative">
        <p v-if="kicker" class="section-kicker !text-left !mb-4 inline-flex items-center gap-2">
          <Icon v-if="kickerIcon" :name="kickerIcon" :size="14" />
          <span class="h-px w-8 bg-accent inline-block"></span>
          <span>{{ kicker }}</span>
        </p>

        <h2 class="font-display text-3xl md:text-5xl font-extrabold text-secondary-dark mb-5 leading-[1.05]">
          {{ title }}
        </h2>

        <p class="text-secondary text-lg leading-relaxed mb-7 max-w-prose">{{ body }}</p>

        <ul v-if="stats?.length" class="flex flex-wrap gap-3 mb-8">
          <li
            v-for="s in stats"
            :key="s.label"
            class="inline-flex items-center gap-3 bg-sand-50 border border-sand-200 px-4 py-3 rounded-2xl shadow-sm"
          >
            <span class="grid place-items-center w-9 h-9 rounded-xl bg-accent/10 text-accent">
              <Icon :name="s.icon" type="Bold" :size="18" />
            </span>
            <span>
              <span class="block text-[10px] uppercase tracking-widest text-ink-muted leading-none">{{ s.label }}</span>
              <span class="block font-display font-extrabold text-secondary-dark text-lg leading-tight">{{ s.value }}</span>
            </span>
          </li>
        </ul>

        <a
          v-if="ctaLabel && ctaHref"
          :href="ctaHref"
          class="btn-primary inline-flex items-center gap-2"
        >
          <span>{{ ctaLabel }}</span>
          <Icon name="ArrowRight" :size="18" />
        </a>
      </div>

      <!-- IMAGE — foto a sangre, sin marco -->
      <div class="relative group">
        <img
          :src="image"
          :alt="imageAlt"
          class="w-full h-[420px] md:h-[540px] object-cover rounded-3xl shadow-elev transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />

        <div
          v-if="badge"
          class="absolute -bottom-2 -right-2 md:-right-4 bg-white px-5 py-4 rounded-2xl shadow-elev ring-1 ring-sand-200 flex items-center gap-3 max-w-[260px]"
        >
          <span class="grid place-items-center w-12 h-12 rounded-xl bg-accent text-white shrink-0 shadow-md">
            <Icon :name="badge.icon" type="Bold" :size="22" />
          </span>
          <span class="leading-tight">
            <span class="block font-display font-extrabold text-2xl text-secondary-dark">{{ badge.title }}</span>
            <span class="block text-xs uppercase tracking-wider text-ink-muted">{{ badge.subtitle }}</span>
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
