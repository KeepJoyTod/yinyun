import { describe, expect, it } from 'vitest'
import routerSource from './index.ts?raw'
import sidebarSource from '../../shared/components/layout/Sidebar.vue?raw'
import merchantConfigOwnerSource from '../../features/merchant/modules/config/MerchantConfigView.vue?raw'
import merchantContentOwnerSource from '../../features/merchant/modules/content/MerchantContentView.vue?raw'
import merchantCoreOwnerSource from '../../features/merchant/modules/core/MerchantCoreView.vue?raw'
import merchantDecorationOwnerSource from '../../features/merchant/modules/decoration/MerchantDecorationModuleView.vue?raw'
import merchantReadinessOwnerSource from '../../features/merchant/modules/readiness/MerchantReadinessView.vue?raw'
import merchantOperationsOwnerSource from '../../features/merchant/modules/operations/MerchantOperationsView.vue?raw'
import merchantProductOwnerSource from '../../features/merchant/modules/product/MerchantProductView.vue?raw'
import { getWorkbenchGroupLabel, workbenchFeatures, workbenchGroups } from './featureRegistry'

describe('studio complete navigation contract', () => {
  const groups = ['首页', '商户', '商品', '订单', '服务', '内部协作', '资源', '会员', '工具', '营销', '统计', '设置', '平台设置', '账号中心', '费用中心']

  it('drives the router and sidebar from one feature registry', () => {
    expect(routerSource).toContain('workbenchFeatures')
    expect(sidebarSource).toContain('workbenchGroups')
    expect(sidebarSource).toContain('menuSearch')
    expect(sidebarSource).toContain('toggleGroup')
  })

  it('exposes all planned navigation groups', () => {
    expect(workbenchGroups.map(group => group.label)).toEqual(groups)
    expect(workbenchFeatures.length).toBeGreaterThanOrEqual(65)
    expect(getWorkbenchGroupLabel('home')).toBe('首页')
    expect(getWorkbenchGroupLabel('platform')).toBe('平台设置')
    expect(getWorkbenchGroupLabel('account')).toBe('账号中心')
    expect(getWorkbenchGroupLabel('finance')).toBe('费用中心')
  })

  it('keeps old routes compatible and sends unopened features to one construction view', () => {
    expect(routerSource).toContain("path: '/orders'")
    expect(routerSource).toContain("redirect: '/order/appointment'")
    expect(routerSource).toContain("path: '/photo-mgmt'")
    expect(routerSource).toContain("redirect: '/service/photos'")
    expect(routerSource).toContain("path: '/tools/photo/sample'")
    expect(routerSource).toContain("redirect: '/tools/sample-works'")
    expect(routerSource).toContain('ConstructionView.vue')
  })

  it('keeps merchant routes on owner module wrappers', () => {
    expect(routerSource).toContain('modules/core/MerchantCoreView.vue')
    expect(routerSource).toContain('modules/config/MerchantConfigView.vue')
    expect(routerSource).toContain('modules/decoration/MerchantDecorationModuleView.vue')
    expect(routerSource).toContain('modules/readiness/MerchantReadinessView.vue')
    expect(routerSource).toContain('modules/content/MerchantContentView.vue')
    expect(routerSource).toContain('modules/product/MerchantProductView.vue')
    expect(routerSource).toContain('modules/operations/MerchantOperationsView.vue')
    expect(merchantCoreOwnerSource).toContain('MerchantOverviewView.vue')
    expect(merchantConfigOwnerSource).toContain('ServiceGroupsView.vue')
    expect(merchantConfigOwnerSource).toContain('InventoryView.vue')
    expect(merchantDecorationOwnerSource).toContain('MerchantDecorationView.vue')
    expect(merchantReadinessOwnerSource).toContain('MerchantModuleChrome')
    expect(merchantReadinessOwnerSource).toContain('MerchantReadinessBoard')
    expect(merchantReadinessOwnerSource).toContain('useMerchantReadinessState')
    expect(merchantContentOwnerSource).toContain('MerchantMicroPagesView.vue')
    expect(merchantContentOwnerSource).toContain('MerchantMicroFormsView.vue')
    expect(merchantProductOwnerSource).toContain('DouyinProductsView.vue')
    expect(merchantOperationsOwnerSource).toContain('StaffBookingEntryView.vue')
    expect(merchantOperationsOwnerSource).toContain('OrderFormSubmissionsView.vue')
    expect(merchantOperationsOwnerSource).toContain('NotificationsView.vue')
    expect(routerSource).toContain('MerchantMicroFormEditorView.vue')
    expect(routerSource).toContain("redirect: '/merchant/overview'")
    expect(workbenchFeatures.find(feature => feature.key === 'merchant-overview')?.component).toBe('merchant-overview')
  })

  it('marks derived product modules with real status instead of ready', () => {
    for (const key of ['product-addon', 'product-group', 'product-print', 'product-meituan']) {
      const feature = workbenchFeatures.find(feature => feature.key === key)
      expect(feature?.component).toBe('derived-product-module')
      expect(feature?.status).toBe('derived')
    }
    expect(workbenchFeatures.find(feature => feature.key === 'product-douyin')?.status).toBe('ready')
  })

  it('marks derived order routes and partial routes with real status', () => {
    for (const key of ['order-print', 'order-enterprise', 'order-card', 'order-coupon', 'order-campaign', 'order-forms']) {
      expect(workbenchFeatures.find(feature => feature.key === key)?.status).toBe('derived')
    }
    expect(workbenchFeatures.find(feature => feature.key === 'order-verification')?.status).toBe('partial')
  })

  it('marks member, marketing, and report routes with their current Phase 3 status', () => {
    expect(workbenchFeatures.find(feature => feature.key === 'member-accounts')?.component).toBe('member-assets')
    expect(workbenchFeatures.find(feature => feature.key === 'member-accounts')?.status).toBe('ready')
    expect(workbenchFeatures.find(feature => feature.key === 'member-tags')?.component).toBe('derived-member-module')
    expect(workbenchFeatures.find(feature => feature.key === 'member-tags')?.status).toBe('derived')
    expect(workbenchFeatures.find(feature => feature.key === 'member-consumption')?.component).toBe('member-transactions')
    expect(workbenchFeatures.find(feature => feature.key === 'member-consumption')?.status).toBe('ready')

    for (const key of ['marketing-center', 'marketing-coupons', 'marketing-campaigns', 'marketing-participations']) {
      expect(workbenchFeatures.find(feature => feature.key === key)?.status).toBe('ready')
    }

    for (const key of ['report-store-daily', 'report-store-monthly', 'report-products', 'report-employees', 'report-retouch', 'report-finance', 'report-customers', 'report-channels', 'report-conversion']) {
      expect(workbenchFeatures.find(feature => feature.key === key)?.status).toBe('derived')
    }
    expect(workbenchFeatures.find(feature => feature.key === 'report-reviews')?.status).toBe('partial')
  })

  it('uses dedicated marketing owners instead of one derived placeholder', () => {
    expect(routerSource).toContain('MarketingCenterView.vue')
    expect(routerSource).toContain('MarketingCouponsView.vue')
    expect(routerSource).toContain('MarketingCampaignsView.vue')
    expect(routerSource).toContain('MarketingParticipationsView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'marketing-center')?.component).toBe('marketing-center-view')
    expect(workbenchFeatures.find(feature => feature.key === 'marketing-coupons')?.component).toBe('marketing-coupons-view')
    expect(workbenchFeatures.find(feature => feature.key === 'marketing-campaigns')?.component).toBe('marketing-campaigns-view')
    expect(workbenchFeatures.find(feature => feature.key === 'marketing-participations')?.component).toBe('marketing-participations-view')
  })

  it('promotes phase 3 scaffold modules into first-class navigation groups', () => {
    for (const key of [
      'platform-brand-info',
      'platform-integration',
      'platform-booking-policy',
      'platform-print-settings',
      'platform-score-settings',
      'platform-email-settings',
      'platform-notification-center',
      'platform-service-packages',
      'account-profile',
      'account-brands',
      'account-help',
      'finance-overview',
      'finance-transactions',
    ]) {
      expect(workbenchFeatures.find(feature => feature.key === key)?.status).toBe('building')
    }
    expect(routerSource).toContain('PlatformBrandInfoView.vue')
    expect(routerSource).toContain('AccountProfileView.vue')
    expect(routerSource).toContain('FinanceOverviewView.vue')
  })

  it('keeps tool sample works and precision delivery as dedicated scaffold entries', () => {
    expect(workbenchFeatures.find(feature => feature.key === 'tool-sample-works')?.path).toBe('/tools/sample-works')
    expect(workbenchFeatures.find(feature => feature.key === 'tool-sample-works')?.status).toBe('building')
    expect(workbenchFeatures.find(feature => feature.key === 'tool-precision-delivery')?.path).toBe('/tools/precision-delivery')
    expect(workbenchFeatures.find(feature => feature.key === 'tool-precision-delivery')?.status).toBe('building')
    expect(routerSource).toContain('SampleWorksView.vue')
    expect(routerSource).toContain('PrecisionDeliveryView.vue')
  })

  it('marks collaboration overview routes and settings as ready after real work-order接线', () => {
    for (const key of ['collaboration-overview', 'collaboration-work-orders', 'collaboration-export', 'collaboration-statistics']) {
      expect(workbenchFeatures.find(feature => feature.key === key)?.status).toBe('ready')
    }
    for (const key of ['collaboration-positions', 'collaboration-product-settings', 'collaboration-retouch-center-settings', 'collaboration-common-settings', 'collaboration-open-settings']) {
      expect(workbenchFeatures.find(feature => feature.key === key)?.status).toBe('ready')
    }
  })

  it('keeps partial settings routes explicit in code', () => {
    expect(routerSource).toContain('RolesView.vue')
    expect(routerSource).toContain('LogsView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'settings-roles')?.status).toBe('partial')
    expect(workbenchFeatures.find(feature => feature.key === 'settings-logs')?.status).toBe('partial')
    expect(workbenchFeatures.find(feature => feature.key === 'settings-channels')?.status).toBe('ready')
  })

  it('keeps public micro page and micro form routes outside staff auth', () => {
    expect(routerSource).toContain("path: '/public/micro-form/:id'")
    expect(routerSource).toContain('PublicMicroFormView.vue')
    expect(routerSource).toContain("path: '/public/micro-page/:id'")
    expect(routerSource).toContain('PublicMicroPageView.vue')
    expect(routerSource).toContain("meta: { public: true")
  })
})
