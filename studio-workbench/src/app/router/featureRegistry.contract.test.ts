import { describe, expect, it } from 'vitest'
import routerSource from './index.ts?raw'
import sidebarSource from '../../shared/components/layout/Sidebar.vue?raw'
import { getWorkbenchGroupLabel, workbenchFeatures, workbenchGroups } from './featureRegistry'

describe('studio complete navigation contract', () => {
  const groups = ['首页', '商户', '商品', '订单', '服务', '内部协作', '资源', '会员', '工具', '营销', '统计', '设置']

  it('drives the router and sidebar from one feature registry', () => {
    expect(routerSource).toContain('workbenchFeatures')
    expect(sidebarSource).toContain('workbenchGroups')
    expect(sidebarSource).toContain('menuSearch')
    expect(sidebarSource).toContain('toggleGroup')
  })

  it('exposes all planned navigation groups', () => {
    expect(workbenchGroups.map(group => group.label)).toEqual(groups)
    expect(workbenchFeatures.length).toBeGreaterThanOrEqual(50)
    expect(getWorkbenchGroupLabel('home')).toBe('首页')
  })

  it('keeps old routes compatible and sends unopened features to one construction view', () => {
    expect(routerSource).toContain("path: '/orders'")
    expect(routerSource).toContain("redirect: '/order/appointment'")
    expect(routerSource).toContain("path: '/photo-mgmt'")
    expect(routerSource).toContain("redirect: '/service/photos'")
    expect(routerSource).toContain('ConstructionView.vue')
  })

  it('keeps merchant routes on dedicated views', () => {
    expect(routerSource).toContain('MerchantOverviewView.vue')
    expect(routerSource).toContain('ServiceGroupsView.vue')
    expect(routerSource).toContain('InventoryView.vue')
    expect(routerSource).toContain('MerchantDecorationView.vue')
    expect(routerSource).toContain('MerchantMicroPagesView.vue')
    expect(routerSource).toContain('MerchantMicroFormsView.vue')
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
