import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../pages/Homepage.vue') },
  { path: '/projects/photolock', component: () => import('../pages/PhotoLock.vue') },
  { path: '/admin', component: () => import('../pages/AdminDashboard.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (to.path === '/admin') {
    return next('/')
  }

  next()
})

export default router
