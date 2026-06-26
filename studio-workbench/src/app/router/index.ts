import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getStoredApiToken } from '../../shared/api/request'
import { getStaffSession } from '../../shared/auth/staffSession'
import { ensureStudioAccess, studioAccessStore } from '../../shared/stores/studioAccessStore'
import {
  getWorkbenchGroupLabel,
  workbenchFeatures,
} from './featureRegistry'
import { resolveWorkbenchProtectedRoute } from './routeGuard'

const componentLoaders = {
  dashboard: () => import('../../features/dashboard/DashboardView.vue'),
  orders: () => import('../../features/orders/OrdersView.vue'),
  'staff-booking-entry': () => import('../../features/merchant/modules/operations/MerchantOperationsView.vue'),
  'order-card-batch': () => import('../../features/orders/card-batch/OrderCardBatchView.vue'),
  schedule: () => import('../../features/schedule/ScheduleView.vue'),
  'merchant-overview': () => import('../../features/merchant/modules/core/MerchantCoreView.vue'),
  'merchant-readiness': () => import('../../features/merchant/modules/readiness/MerchantReadinessView.vue'),
  'merchant-schedule-governance': () => import('../../features/merchant/modules/schedule-governance/MerchantScheduleGovernanceView.vue'),
  'merchant-channel-readiness': () => import('../../features/merchant/modules/channel-readiness/MerchantChannelReadinessView.vue'),
  'merchant-governance': () => import('../../features/merchant/modules/governance/MerchantGovernanceView.vue'),
  'merchant-dependency-readiness': () => import('../../features/merchant/modules/dependency-readiness/MerchantDependencyReadinessView.vue'),
  'merchant-consumer-ops-p1': () => import('../../features/merchant/modules/consumer-ops-p1/MerchantConsumerOpsP1View.vue'),
  store: () => import('../../features/stores/StoreView.vue'),
  'service-groups': () => import('../../features/merchant/modules/config/MerchantConfigView.vue'),
  decoration: () => import('../../features/merchant/modules/decoration/MerchantDecorationModuleView.vue'),
  'micro-pages': () => import('../../features/merchant/modules/content/MerchantContentView.vue'),
  'micro-forms': () => import('../../features/merchant/modules/content/MerchantContentView.vue'),
  'micro-form-editor': () => import('../../features/merchant/MerchantMicroFormEditorView.vue'),
  inventory: () => import('../../features/merchant/modules/config/MerchantConfigView.vue'),
  products: () => import('../../features/products/ProductConfigView.vue'),
  'product-catalog-module': () => import('../../features/products/catalog/ProductCatalogModuleView.vue'),
  'product-sku-module': () => import('../../features/products/sku/ProductSkuModuleView.vue'),
  'product-category-module': () => import('../../features/products/category/ProductCategoryModuleView.vue'),
  'product-relation-module': () => import('../../features/products/relation/ProductRelationModuleView.vue'),
  'product-booking-rules-module': () => import('../../features/products/booking-rules/ProductBookingRulesModuleView.vue'),
  'product-channel-module': () => import('../../features/products/channel/ProductChannelModuleView.vue'),
  'product-cards-module': () => import('../../features/products/cards/ProductCardsModuleView.vue'),
  'douyin-products': () => import('../../features/merchant/modules/product/MerchantProductView.vue'),
  'derived-product-module': () => import('../../features/products/DerivedProductModuleView.vue'),
  'product-cards': () => import('../../features/products/ProductCardManagementView.vue'),
  'product-card-catalog': () => import('../../features/products/ProductCardCatalogView.vue'),
  customers: () => import('../../features/member/CustomersView.vue'),
  'member-assets': () => import('../../features/member/modules/assets/MemberAssetsView.vue'),
  'member-transaction-safety': () => import('../../features/member/modules/transaction-safety/MemberTransactionSafetyView.vue'),
  'member-transactions': () => import('../../features/member/modules/transactions/MemberTransactionsView.vue'),
  'derived-member-module': () => import('../../features/member/DerivedMemberModuleView.vue'),
  'marketing-center-view': () => import('../../features/marketing/MarketingCenterView.vue'),
  'marketing-coupons-view': () => import('../../features/marketing/MarketingCouponsView.vue'),
  'marketing-campaigns-view': () => import('../../features/marketing/MarketingCampaignsView.vue'),
  'marketing-participations-view': () => import('../../features/marketing/MarketingParticipationsView.vue'),
  'derived-report-module': () => import('../../features/reports/DerivedReportModuleView.vue'),
  'report-finance-reconciliation': () => import('../../features/reports/ReportFinanceReconciliationView.vue'),
  'report-order-analysis': () => import('../../features/reports/OrderAnalysisReportView.vue'),
  albums: () => import('../../features/albums/PhotoMgmtView.vue'),
  selection: () => import('../../features/selection/OnlineSelectionView.vue'),
  'campaign-orders': () => import('../../features/orders/CampaignOrdersView.vue'),
  'order-form-submissions': () => import('../../features/orders/modules/form-submissions/OrderFormSubmissionsOwnerView.vue'),
  'derived-order-module': () => import('../../features/orders/DerivedOrderModuleView.vue'),
  'service-retouch-center': () => import('../../features/service-production/RetouchCenterView.vue'),
  'service-retouch-providers': () => import('../../features/service-production/RetouchProvidersView.vue'),
  'work-execution-overview': () => import('../../features/collaboration/WorkExecutionOverviewView.vue'),
  'work-orders': () => import('../../features/collaboration/WorkOrdersView.vue'),
  'work-order-export': () => import('../../features/collaboration/WorkOrderExportView.vue'),
  'work-order-statistics': () => import('../../features/collaboration/WorkOrderStatisticsView.vue'),
  'collaboration-positions-settings': () => import('../../features/collaboration/CollaborationPositionSettingsView.vue'),
  'collaboration-product-settings': () => import('../../features/collaboration/CollaborationProductSettingsView.vue'),
  'collaboration-retouch-settings': () => import('../../features/collaboration/CollaborationRetouchCenterSettingsView.vue'),
  'collaboration-common-settings': () => import('../../features/collaboration/CollaborationCommonSettingsView.vue'),
  'collaboration-open-settings': () => import('../../features/collaboration/CollaborationOpenSettingsView.vue'),
  'derived-resource-module': () => import('../../features/resources/DerivedResourceModuleView.vue'),
  'resource-manage': () => import('../../features/resources/ResourceManageView.vue'),
  'resource-tags': () => import('../../features/resources/ResourceTagsView.vue'),
  'resource-usage': () => import('../../features/resources/ResourceUsageView.vue'),
  'share-links': () => import('../../features/tools/ShareLinksView.vue'),
  notifications: () => import('../../features/platform-settings/PlatformNotificationCenterView.vue'),
  'tool-sample-works': () => import('../../features/tools/SampleWorksView.vue'),
  'tool-precision-delivery': () => import('../../features/tools/PrecisionDeliveryView.vue'),
  employees: () => import('../../features/settings/EmployeesView.vue'),
  roles: () => import('../../features/settings/RolesView.vue'),
  logs: () => import('../../features/settings/LogsView.vue'),
  channels: () => import('../../features/settings/ChannelsView.vue'),
  'channel-verification': () => import('../../features/orders/ChannelVerificationView.vue'),
  settings: () => import('../../features/settings/SettingsView.vue'),
  'platform-brand-info': () => import('../../features/platform-settings/PlatformBrandInfoView.vue'),
  'platform-integration': () => import('../../features/platform-settings/PlatformIntegrationView.vue'),
  'platform-login-risk': () => import('../../features/platform-settings/PlatformLoginRiskView.vue'),
  'platform-open-api': () => import('../../features/platform-settings/PlatformOpenApiView.vue'),
  'platform-task-center': () => import('../../features/platform-settings/PlatformTaskCenterView.vue'),
  'platform-booking-policy': () => import('../../features/platform-settings/PlatformBookingPolicyView.vue'),
  'platform-print-settings': () => import('../../features/platform-settings/PlatformPrintSettingsView.vue'),
  'platform-score-settings': () => import('../../features/platform-settings/PlatformScoreSettingsView.vue'),
  'platform-meituan-review-trace': () => import('../../features/platform-settings/PlatformMeituanReviewTraceView.vue'),
  'platform-email-settings': () => import('../../features/platform-settings/PlatformEmailSettingsView.vue'),
  'platform-notification-center': () => import('../../features/platform-settings/PlatformNotificationCenterView.vue'),
  'platform-backup-recovery': () => import('../../features/platform-settings/PlatformBackupRecoveryView.vue'),
  'platform-service-packages': () => import('../../features/platform-settings/PlatformServicePackagesView.vue'),
  'account-profile': () => import('../../features/account-center/AccountProfileView.vue'),
  'account-brands': () => import('../../features/account-center/AccountBrandsView.vue'),
  'account-help': () => import('../../features/account-center/AccountHelpCenterView.vue'),
  'finance-overview': () => import('../../features/finance-center/FinanceOverviewView.vue'),
  'finance-transactions': () => import('../../features/finance-center/FinanceTransactionsView.vue'),
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
  {
    path: '/merchant/order-attributes',
    name: 'merchant-order-attributes',
    component: componentLoaders['service-groups'],
    meta: {
      section: '商户',
      title: '订单属性配置',
      featureKey: 'merchant-service-groups',
      featureStatus: 'ready',
    },
  },
  {
    path: '/tools/photo/sample',
    redirect: '/tools/sample-works',
  },
  {
    path: '/tools/photo/sample/legacy',
    name: 'tool-photo-sample-legacy',
    component: componentLoaders['derived-resource-module'],
    meta: {
      section: '工具',
      title: '样片作品兼容页',
    },
  },
  { path: '/merchant', redirect: '/merchant/overview' },
  { path: '/orders', redirect: '/order/appointment' },
  { path: '/schedule', redirect: '/dashboard/today' },
  { path: '/store', redirect: '/merchant/store' },
  { path: '/config', redirect: '/product/service' },
  { path: '/tools', redirect: '/tools/share-links' },
  { path: '/tools/center', redirect: '/tools/share-links' },
  { path: '/photo-mgmt', redirect: '/service/photos' },
  { path: '/resource/files', redirect: '/resource/manage' },
  { path: '/resource/samples', redirect: '/tools/sample-works' },
  { path: '/online-selection', redirect: '/service/selection' },
  { path: '/settings', redirect: '/settings/workbench' },
  { path: '/platform', redirect: '/platform/brand-info' },
  { path: '/account', redirect: '/account/profile' },
  { path: '/finance', redirect: '/finance/overview' },
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
  return resolveWorkbenchProtectedRoute(
    featureKey,
    studioAccessStore.featureStatuses,
    studioAccessStore.menuPermissions,
  )
})

export default router
