import './assets/main.css'
import 'primeicons/primeicons.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
})

declare global {
  interface Window { __appMounted?: boolean }
}

if (!window.__appMounted) {
  app.mount('#app')
  window.__appMounted = true
}
