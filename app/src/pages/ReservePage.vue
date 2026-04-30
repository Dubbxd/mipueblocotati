<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { restaurants } from '@/data/restaurants'
import type { ReservationDraft } from '@/types/domain'

const { t } = useI18n()
const route = useRoute()
const submitted = ref(false)
const submitting = ref(false)
const form = ref<ReservationDraft>({
  restaurantId: (route.query.branch as string) || 'cotati',
  date: '', time: '19:00', partySize: 2,
  customer: { name: '', phone: '', email: '', notes: '' }
})
const todayISO = computed(() => new Date().toISOString().slice(0, 10))

const submit = async () => {
  submitting.value = true
  // TODO: hook to Elyza POST /api/reservations
  await new Promise(r => setTimeout(r, 500))
  submitting.value = false
  submitted.value = true
}
</script>

<template>
  <main class="container-page py-12 max-w-3xl">
    <h1 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-secondary-dark">{{ t('reserve.title') }}</h1>
    <p class="text-ink-muted mt-2">{{ t('reserve.sub') }}</p>

    <div v-if="submitted" class="mt-10 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
      <h2 class="font-display text-2xl text-green-800">{{ t('reserve.successTitle') }}</h2>
      <p class="text-green-700 mt-2">{{ t('reserve.successBody') }} <strong>{{ form.customer.email }}</strong>.</p>
    </div>

    <form v-else @submit.prevent="submit" class="card p-6 mt-8 grid gap-4 md:grid-cols-2" novalidate>
      <label class="block md:col-span-2">
        <span class="text-sm font-semibold text-secondary">{{ t('reserve.form.branch') }}</span>
        <select v-model="form.restaurantId" required autocomplete="off" class="w-full mt-1 px-3 py-3 rounded-md border border-sand-300 bg-white">
          <option v-for="r in restaurants" :key="r.id" :value="r.id">{{ r.name }} — {{ r.city }}</option>
        </select>
      </label>
      <label class="block">
        <span class="text-sm font-semibold text-secondary">{{ t('reserve.form.date') }}</span>
        <input v-model="form.date" type="date" :min="todayISO" required autocomplete="off" class="w-full mt-1 px-3 py-3 rounded-md border border-sand-300 bg-white" />
      </label>
      <label class="block">
        <span class="text-sm font-semibold text-secondary">{{ t('reserve.form.time') }}</span>
        <input v-model="form.time" type="time" required autocomplete="off" class="w-full mt-1 px-3 py-3 rounded-md border border-sand-300 bg-white" />
      </label>
      <label class="block">
        <span class="text-sm font-semibold text-secondary">{{ t('reserve.form.party') }}</span>
        <input v-model.number="form.partySize" type="number" inputmode="numeric" min="1" max="20" required autocomplete="off" class="w-full mt-1 px-3 py-3 rounded-md border border-sand-300 bg-white" />
      </label>
      <label class="block">
        <span class="text-sm font-semibold text-secondary">{{ t('reserve.form.phone') }}</span>
        <input v-model="form.customer.phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="(707) 555-1234" class="w-full mt-1 px-3 py-3 rounded-md border border-sand-300 bg-white" />
      </label>
      <label class="block md:col-span-2">
        <span class="text-sm font-semibold text-secondary">{{ t('reserve.form.name') }}</span>
        <input v-model="form.customer.name" type="text" autocomplete="name" required class="w-full mt-1 px-3 py-3 rounded-md border border-sand-300 bg-white" />
      </label>
      <label class="block md:col-span-2">
        <span class="text-sm font-semibold text-secondary">{{ t('reserve.form.email') }}</span>
        <input v-model="form.customer.email" type="email" inputmode="email" autocomplete="email" required class="w-full mt-1 px-3 py-3 rounded-md border border-sand-300 bg-white" />
      </label>
      <label class="block md:col-span-2">
        <span class="text-sm font-semibold text-secondary">{{ t('reserve.form.notes') }}</span>
        <textarea v-model="form.customer.notes" rows="3" autocomplete="off" class="w-full mt-1 px-3 py-3 rounded-md border border-sand-300 bg-white"></textarea>
      </label>
      <p class="text-xs text-ink-muted md:col-span-2">{{ t('reserve.policy') }}</p>
      <button :disabled="submitting" class="btn-primary md:col-span-2 disabled:opacity-60 disabled:cursor-not-allowed">{{ submitting ? '…' : t('reserve.form.submit') }}</button>
    </form>
  </main>
</template>
