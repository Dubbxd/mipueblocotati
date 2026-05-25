<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSiteStore } from '@/stores'
import MapLeaflet from '@/components/sections/MapLeaflet.vue'
import Icon from '@/components/ui/Icon.vue'
import { api } from '@/lib/api'

const { t } = useI18n()
const site = useSiteStore()
const main = computed(() => site.mainRestaurant)

const form = ref({ name: '', email: '', phone: '', message: '' })
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

async function submit() {
  if (status.value === 'loading') return
  status.value = 'loading'
  try {
    // Enviamos como catering request con mensaje libre
    await api('/api/public/contact', {
      method: 'POST', auth: false,
      body: {
        name: form.value.name,
        phone: form.value.phone || 'N/A',
        email: form.value.email,
        message: form.value.message,
      },
    })
    status.value = 'success'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <main>

    <!-- Hero compacto -->
    <section class="relative overflow-hidden bg-night text-white">
      <img src="/assets/gallery/restaurantmx.jpg" alt=""
        class="absolute inset-0 w-full h-full object-cover opacity-25" loading="eager" />
      <div class="absolute inset-0 bg-gradient-to-b from-night/60 to-night"></div>
      <div class="relative z-10 container-page py-14 text-center">
        <p class="section-kicker !text-accent justify-center mb-3">
          <Icon name="Location" :size="13" class="mr-1" />{{ t('contact.kicker') }}
        </p>
        <h1 class="font-display text-4xl md:text-5xl font-bold text-white">{{ t('contact.title') }}</h1>
        <p class="text-sand-300 mt-3 max-w-sm mx-auto text-sm">{{ t('contact.sub') }}</p>
      </div>
    </section>

    <!-- Chips de acción rápida -->
    <div v-if="main" class="bg-sand-50 border-b border-sand-200">
      <div class="container-page py-5 flex flex-wrap justify-center gap-3">
        <a :href="`tel:${main.phone}`"
           class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand text-white text-sm font-bold shadow-soft hover:bg-brand-dark transition-colors">
          <Icon name="Call" :size="15" type="Bold" />
          {{ main.phone }}
        </a>
        <a :href="`mailto:${main.email}`"
           class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-sand-200 text-secondary text-sm font-semibold hover:border-brand/50 hover:text-brand transition-colors shadow-soft">
          <Icon name="Sms" :size="15" />
          {{ main.email }}
        </a>
        <a :href="main.links.facebook" target="_blank" rel="noopener"
           class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-sand-200 text-secondary text-sm font-semibold hover:border-brand/50 hover:text-brand transition-colors shadow-soft">
          <Icon name="Global" :size="15" />
          Facebook
        </a>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-if="main" class="container-page py-12">
      <div class="grid lg:grid-cols-2 gap-10 items-start">

        <!-- Columna izquierda: info + mapa -->
        <div class="space-y-6">

          <!-- Info card -->
          <div class="rounded-3xl bg-white border border-sand-100 shadow-soft overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-brand/10 to-accent/5 px-6 py-4 border-b border-sand-100">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-brand/15 flex items-center justify-center">
                  <Icon name="Buildings2" :size="20" type="Bold" class="text-brand" />
                </div>
                <div>
                  <p class="font-bold text-secondary-dark">{{ main.name }}</p>
                  <p class="text-xs text-ink-muted">{{ t('contact.mainLocation') }}</p>
                </div>
              </div>
            </div>
            <!-- Datos -->
            <div class="p-6 space-y-4">
              <a :href="`https://maps.google.com/?q=${encodeURIComponent(main.address + ', ' + main.city)}`"
                 target="_blank" rel="noopener"
                 class="flex items-start gap-3 group">
                <div class="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Location" :size="16" type="Bold" class="text-brand" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wide text-ink-muted">{{ t('contact.address') }}</p>
                  <p class="text-sm text-secondary-dark group-hover:text-brand transition-colors">
                    {{ main.address }}, {{ main.city }}, {{ main.state }} {{ main.zip }}
                  </p>
                </div>
              </a>
              <a :href="`tel:${main.phone}`" class="flex items-start gap-3 group">
                <div class="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Call" :size="16" type="Bold" class="text-brand" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wide text-ink-muted">{{ t('contact.phone') }}</p>
                  <p class="text-sm text-secondary-dark group-hover:text-brand transition-colors">{{ main.phone }}</p>
                </div>
              </a>
              <a :href="`mailto:${main.email}`" class="flex items-start gap-3 group">
                <div class="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Sms" :size="16" type="Bold" class="text-brand" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wide text-ink-muted">{{ t('contact.email') }}</p>
                  <p class="text-sm text-secondary-dark group-hover:text-brand transition-colors">{{ main.email }}</p>
                </div>
              </a>
              <div class="flex items-start gap-3">
                <div class="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon name="Clock" :size="16" type="Bold" class="text-brand" />
                </div>
                <div class="flex-1">
                  <p class="text-xs font-bold uppercase tracking-wide text-ink-muted mb-2">{{ t('contact.hours') }}</p>
                  <div class="rounded-xl bg-sand-50 border border-sand-100 divide-y divide-sand-100">
                    <div class="flex items-center justify-between px-3 py-2 text-sm">
                      <span class="text-ink-muted">{{ t('contact.weekdays') }}</span>
                      <span class="font-semibold text-secondary-dark">{{ main.hours.mon_fri }}</span>
                    </div>
                    <div class="flex items-center justify-between px-3 py-2 text-sm">
                      <span class="text-ink-muted">{{ t('contact.weekend') }}</span>
                      <span class="font-semibold text-secondary-dark">{{ main.hours.sat_sun }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mapa -->
          <div class="rounded-3xl overflow-hidden shadow-elev border border-sand-200 h-64">
            <MapLeaflet only="cotati" height="100%" />
          </div>

        </div>

        <!-- Columna derecha: formulario de contacto -->
        <div class="rounded-3xl bg-white border border-sand-100 shadow-soft p-6 sm:p-8">

          <!-- Éxito -->
          <div v-if="status === 'success'" class="py-10 flex flex-col items-center gap-4 text-center">
            <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Icon name="TickCircle" :size="36" type="Bold" class="text-green-500" />
            </div>
            <h3 class="font-display text-2xl font-bold text-secondary-dark">{{ t('contact.successTitle') }}</h3>
            <p class="text-ink-muted max-w-xs">{{ t('contact.successBody') }}</p>
          </div>

          <template v-else>
            <div class="mb-6">
              <h2 class="font-display text-2xl font-bold text-secondary-dark">{{ t('contact.formTitle') }}</h2>
              <p class="text-ink-muted text-sm mt-1">{{ t('contact.formSub') }}</p>
            </div>

            <form @submit.prevent="submit" class="space-y-4">
              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">{{ t('contact.fieldName') }} *</label>
                  <input v-model="form.name" type="text" required
                    :placeholder="t('contact.namePlaceholder')" class="form-input" />
                </div>
                <div>
                  <label class="form-label">{{ t('contact.fieldPhone') }}</label>
                  <input v-model="form.phone" type="tel"
                    placeholder="+1 (707) ..." class="form-input" />
                </div>
              </div>
              <div>
                <label class="form-label">{{ t('contact.fieldEmail') }} *</label>
                <input v-model="form.email" type="email" required
                  placeholder="tu@correo.com" class="form-input" />
              </div>
              <div>
                <label class="form-label">{{ t('contact.fieldMessage') }} *</label>
                <textarea v-model="form.message" rows="5" required
                  :placeholder="t('contact.messagePlaceholder')"
                  class="form-input resize-none"></textarea>
              </div>

              <p v-if="status === 'error'" class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                {{ t('contact.errorMsg') }}
              </p>

              <button type="submit" :disabled="status === 'loading'"
                class="w-full btn-primary py-3.5 text-base font-bold inline-flex items-center justify-center gap-2 disabled:opacity-60">
                <Icon v-if="status !== 'loading'" name="Send2" :size="17" type="Bold" />
                <svg v-else class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="40 20" />
                </svg>
                {{ status === 'loading' ? t('contact.sending') : t('contact.sendBtn') }}
              </button>
            </form>
          </template>
        </div>

      </div>
    </div>

  </main>
</template>
