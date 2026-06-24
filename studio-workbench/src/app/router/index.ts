import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getStoredApiToken } from '../../shared/api/request'
import { getStaffSession } from '../../shared/auth/staffSession'
import { ensureStudioAccess, studioAccessStore } from '../../shared/stores/studioAccessStore'
import {
  canAccessWorkbenchFeature,
  getEffectiveFeatureStatus,
  getWorkbenchFeature,
  getWorkbenchGroupLabel,
  workbenchFeatures,
} from './featureRegistry'

const componentLoaders = {
  dashboard: () => import('../../features/dashboard/DashboardView.vue'),
  orders: () => import('../../features/orders/OrdersView.vue'),
  'staff-booking-entry': () => import('../../features/orders/StaffBookingEntryView.vue'),
  schedule: () => import('../../features/schedule/ScheduleView.vue'),
  'merchant-overview': () => import('../../features/merchant/MerchantOverviewView.vue'),
  store: () => import('../../features/stores/StoreView.vue'),
  'service-groups': () => import('../../features/merchant/ServiceGroupsView.vue'),
  decoration: () => import('../../features/merchant/MerchantDecorationView.vue'),
  'micro-pages': () => import('../../features/merchant/MerchantMicroPagesView.vue'),
  'micro-forms': () => import('../../features/merchant/MerchantMicroFormsView.vue'),
  'micro-form-editor': () => import('../../features/merchant/MerchantMicroFormEditorView.vue'),
  inventory: () => import('../../features/merchant/InventoryView.vue'),
  products: () => import('../../features/products/ProductConfigView.vue'),
  'douyin-products': () => import('../../features/products/DouyinProductsView.vue'),
  'derived-product-module': () => import('../../features/products/DerivedProductModuleView.vue'),
  'product-cards': () => import('../../features/products/ProductCardManagementView.vue'),
  'product-card-catalog': () => import('../../features/products/ProductCardCatalogView.vue'),
  customers: () => import('../../features/member/CustomersView.vue'),
  'derived-member-module': () => import('../../features/member/DerivedMemberModuleView.vue'),
  'derived-marketing-module': () => import('../../features/marketing/DerivedMarketingModuleView.vue'),
  'derived-report-module': () => import('../../features/reports/DerivedReportModuleView.vue'),
  albums: () => import('../../features/albums/PhotoMgmtView.vue'),
  selection: () => import('../../features/selection/OnlineSelectionView.vue'),
  'campaign-orders': () => import('../../features/orders/CampaignOrdersView.vue'),
  'order-form-submissions': () => import('../../features/orders/OrderFormSubmissionsView.vue'),
  'derived-order-module': () => import('../../features/orders/DerivedOrderModuleView.vue'),
  'work-execution-overview': () => import('../../features/collaboration/WorkExecutionOverviewView.vue'),
  'work-orders': () => import('../../features/collaboration/WorkOrdersView.vue'),
  'work-order-export': () => import('../../features/collaboration/WorkOrderExportView.vue'),
  'work-order-statistics': () => import('../../features/collaboration/WorkOrderStatisticsView.vue'),
  'derived-resource-module': () => import('../../features/resources/DerivedResourceModuleView.vue'),
  'share-links': () => import('../../features/tools/ShareLinksView.vue'),
  notifications: () => import('../../features/tools/NotificationsView.vue'),
  employees: () => import('../../features/settings/EmployeesView.vue'),
  roles: () => import('../../features/settings/RolesView.vue'),
  logs: () => import('../../features/settings/LogsView.vue'),
  channels: () => import('../../features/settings/ChannelsView.vue'),
  'channel-verification': () => import('../../features/orders/ChannelVerificationView.vue'),
  settings: () => import('../../features/settings/SettingsView.vue'),
  construction: () => import('../../features/system/ConstructionView.vue'),
}

const featureRoutes: RouteRecordRaw[] = workbenchFeatures.map(feature => ({
  path: feature.path,
  name: feature.key,
  component: componentLoaders[feature.component as keyof typeof componentLoaders] ?? componentLoaders.construction,
  meta: {
    section: getWorkbenchGroupLabel(feature.group),
    title: feature.label,
    featureKey: feature.key,
    featureStatus: feature.status,
  },
}))

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'StaffLogin',
    component: () => import('../../features/auth/StaffLoginView.vue'),
    meta: { public: true, section: '门店入口', title: '员工登录' },
  },
  {
    path: '/public/micro-form/:id',
    name: 'PublicMicroForm',
    component: () => import('../../features/public/PublicMicroFormView.vue'),
    meta: { public: true, section: '公开页面', title: '微表单' },
  },
  {
    path: '/public/micro-page/:id',
    name: 'PublicMicroPage',
    component: () => import('../../features/public/PublicMicroPageView.vue'),
    meta: { public: true, section: '公开页面', title: '微页面' },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../../features/system/ForbiddenView.vue'),
    meta: { section: '访问控制', title: '无权限' },
  },
  ...featureRoutes,
  {
    path: '/merchant/micro-forms/new',
    name: 'merchant-micro-form-create',
    component: componentLoaders['micro-form-editor'],
    meta: {
      section: '商户',
      title: '新建微表单',
      featureKey: 'merchant-micro-forms',
      featureStatus: 'ready',
    },
  },
  {
    path: '/merchant/micro-forms/:id/edit',
    name: 'merchant-micro-form-edit',
    component: componentLoaders['micro-form-editor'],
    meta: {
      section: '商户',
      title: '编辑微表单',
      featureKey: 'merchant-micro-forms',
      featureStatus: 'ready',
    },
  },
  { path: '/merchant', redirect: '/merchant/overview' },
  { path: '/orders', redirect: '/order/appointment' },
  { path: '/schedule', redirect: '/dashboard/today' },
  { path: '/store', redirect: '/merchant/store' },
  { path: '/config', redirect: '/product/service' },
  { path: '/photo-mgmt', redirect: '/service/photos' },
  { path: '/online-selection', redirect: '/service/selection' },
  { path: '/settings', redirect: '/settings/workbench' },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async to => {
  if (to.meta.public) return true
  const hasSession = Boolean(getStaffSession())
  const needsApiToken = import.meta.env.VITE_STUDIO_DEMO === 'false'
  const hasApiToken = Boolean(getStoredApiToken())
  if (!hasSession || (needsApiToken && !hasApiToken)) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }

  try {
    await ensureStudioAccess()
  } catch {
    return {
      path: '/login',
      query: { redirect: to.fullPath, reason: 'access' },
    }
  }

  const featureKey = typeof to.meta.featureKey === 'string' ? to.meta.featureKey : ''
  if (!featureKey) return true
  const feature = getWorkbenchFeature(featureKey)
  const status = getEffectiveFeatureStatus(feature, studioAccessStore.featureStatuses)
  if (
    status === 'hidden'
    || !canAccessWorkbenchFeature(feature, studioAccessStore.menuPermissions)
  ) {
    return { path: '/403' }
  }
  return true
})

export default router
