import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'

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

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token)
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error('Error decoding JWT token:', error)
    return true
  }
}

router.beforeEach((to, from, next) => {
  const token = Cookies.get('token') // Get token from cookies
  console.log('token', token)
  if (to.meta.requiresAuth) {
    if (!token || isTokenExpired(token)) next({ name: 'login' })
    else next()
  } else next()
})

export default router
