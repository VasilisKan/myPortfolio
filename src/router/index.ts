import { createRouter, createWebHistory } from 'vue-router'
import Homepage from '../pages/Homepage.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import { useAuthStore } from './../stores/authStore' 

const routes = [
  { path: '/', component: Homepage },
  { path: '/admin', component: AdminDashboard }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    await authStore.fetchMe() 
  }

  const isAdmin = authStore.user?.isAdmin === true

  if (to.path === '/admin' && !isAdmin) {
    return next('/') 
  }

  next()
})

export default router
