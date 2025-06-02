import { createRouter, createWebHistory } from 'vue-router';
import Homepage from '../pages/Homepage.vue';
import AdminDashboard from '../pages/AdminDashboard.vue';
import { useAuth } from '@/composables/useAuth'; // 🔥 Import your composable

const routes = [
  { path: '/', component: Homepage },
  { path: '/admin', component: AdminDashboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const { fetchMe, user } = useAuth();

  await fetchMe();

  const isAdmin = user.value?.isAdmin === true;

  if (to.path === '/admin' && !isAdmin) {
    return next('/');
  }

  next();
});

export default router;