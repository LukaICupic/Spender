import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('../views/BillUploadView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/StatisticsView.vue'),
    },
  ],
})

export default router
