// main.ts
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
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
