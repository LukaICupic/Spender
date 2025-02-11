import { createRouter, createWebHistory } from 'vue-router'
import { postRequest } from '@/utils'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/BillUploadView.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('../views/AnalyticsView.vue'),
    meta: { layout: 'default', requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

//TODO - rather than going to BE to verify every time, firs look in the cache.
//If none then BE and if there is session on BE then return it and store in cache
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      const response = await postRequest('/verify-session', {})
      if (response.ok) {
        next()
      } else {
        next({ name: 'login' })
      }
    } catch (error) {
      console.error('Error verifying session:', error)
      next({ name: 'login' })
    }
  } else {
    next()
  }
})

export default router
