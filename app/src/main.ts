import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { VsxIcon } from 'vue-iconsax'
import Vue3Lottie from 'vue3-lottie'
import './styles/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(Vue3Lottie)
app.component('VsxIcon', VsxIcon)
app.mount('#app')
