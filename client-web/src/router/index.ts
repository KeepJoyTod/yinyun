import { createRouter, createWebHistory } from 'vue-router'
import { CLIENT_WEB_ROUTES } from '../shared/entryContracts'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: CLIENT_WEB_ROUTES.home,
      name: 'Home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: CLIENT_WEB_ROUTES.miniappBookingGuide,
      name: 'MiniappBookingGuide',
      component: () => import('../views/BookingView.vue'),
    },
    {
      path: '/booking/success',
      redirect: CLIENT_WEB_ROUTES.miniappBookingGuide,
    },
    {
      path: CLIENT_WEB_ROUTES.customerLogin,
      name: 'CustomerLogin',
      component: () => import('../views/CustomerLoginView.vue'),
    },
    {
      path: CLIENT_WEB_ROUTES.customerAlbums,
      name: 'CustomerAlbums',
      component: () => import('../views/CustomerAlbumsView.vue'),
    },
    {
      path: CLIENT_WEB_ROUTES.customerAlbumDetail,
      name: 'CustomerAlbumDetail',
      component: () => import('../views/CustomerAlbumDetailView.vue'),
    },
    {
      path: CLIENT_WEB_ROUTES.customerOrderDetail,
      name: 'CustomerOrderDetail',
      component: () => import('../views/CustomerOrderDetailView.vue'),
    },
    {
      path: CLIENT_WEB_ROUTES.customerResult,
      name: 'CustomerResult',
      component: () => import('../views/CustomerResultView.vue'),
    },
    {
      path: CLIENT_WEB_ROUTES.pickup,
      redirect: CLIENT_WEB_ROUTES.customerLogin,
    },
    {
      path: CLIENT_WEB_ROUTES.staffEntry,
      name: 'StaffEntry',
      component: () => import('../views/StaffEntryView.vue'),
    },
  ],
})

export default router
