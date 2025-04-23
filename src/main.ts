// main.ts
import './assets/main.css';
import { createApp } from 'vue';
import App         from './App.vue';
import { useAuth } from '@/composables/useAuth';

const app  = createApp(App);
const auth = useAuth();

// Fire‐and‐forget the /me check, but catch any 401
auth.fetchMe().catch(() => {
  // ignore; user simply isn’t logged in yet
});

declare global {
  interface Window { __appMounted?: boolean }
}

if (!window.__appMounted) {
  app.mount('#app');
  window.__appMounted = true;
}
