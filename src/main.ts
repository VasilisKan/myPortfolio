// main.ts
import './assets/main.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { useAuth } from '@/composables/useAuth';

const app  = createApp(App);
const auth = useAuth();

app.use(router); 

auth.fetchMe().catch(() => {
 
});

declare global {
  interface Window { __appMounted?: boolean }
}

if (!window.__appMounted) {
  app.mount('#app');
  window.__appMounted = true;
}