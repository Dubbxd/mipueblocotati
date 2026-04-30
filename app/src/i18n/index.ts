import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

const stored = (typeof localStorage !== 'undefined' && localStorage.getItem('lang')) || 'es'

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: stored,
  fallbackLocale: 'es',
  messages: { es, en }
})
