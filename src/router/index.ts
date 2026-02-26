import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const routes = [
  { path: '/', component: () => import('../pages/Homepage.vue') },
  { path: '/projects/photolock', component: () => import('../pages/PhotoLock.vue') },
  { path: '/admin', component: () => import('../pages/AdminDashboard.vue') },
  { path: '/dashboard', component: () => import('../pages/UserDashboard.vue') },
  { path: '/dashboard/profile', component: () => import('../pages/UserProfile.vue') },
  { path: '/ticket/create', component: () => import('../pages/TicketCreate.vue') },
  { path: '/ticket', component: () => import('../pages/TicketList.vue') },
  { path: '/ticket/:id', component: () => import('../pages/TicketView.vue') },
  { path: '/showcase/:slug', component: () => import('../pages/ShowcaseItemView.vue') },
  { path: '/demos/:slug', redirect: (to: { params: { slug?: string } }) => ({ path: `/showcase/${to.params.slug}` }) },
  { path: '/forgot-password', component: () => import('../pages/ForgotPassword.vue') },
  { path: '/reset-password', component: () => import('../pages/ResetPassword.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const { fetchMe, user } = useAuth()
  await fetchMe()

  if (to.path === '/admin') {
    if (user.value?.isAdmin) {
      next()
    } else {
      next('/')
    }
    return
  }

  if (to.path.startsWith('/dashboard') || to.path.startsWith('/ticket')) {
    if (!user.value) {
      next('/')
      return
    }
  }

  next()
})

export default router
