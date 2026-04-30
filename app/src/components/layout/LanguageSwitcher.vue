<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const setLang = (l: 'es' | 'en') => { locale.value = l; localStorage.setItem('lang', l); document.documentElement.lang = l }
</script>

<template>
  <div class="inline-flex items-center text-xs font-semibold rounded-full border border-secondary/30 overflow-hidden">
    <button :class="locale === 'es' ? 'bg-brand text-white' : 'text-secondary'" class="px-3 py-1.5" @click="setLang('es')">ES</button>
    <button :class="locale === 'en' ? 'bg-brand text-white' : 'text-secondary'" class="px-3 py-1.5" @click="setLang('en')">EN</button>
  </div>
</template>
