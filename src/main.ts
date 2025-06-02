// main.ts
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

declare global {
  interface Window { __appMounted?: boolean }
}

if (!window.__appMounted) {
  app.mount('#app')
  window.__appMounted = true
}

const authStore = useAuthStore()
authStore.fetchMe().catch(() => {})
