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

  it('replaces merchant service group and inventory placeholders with dedicated views', () => {
    expect(routerSource).toContain('MerchantOverviewView.vue')
    expect(routerSource).toContain('ServiceGroupsView.vue')
    expect(routerSource).toContain('InventoryView.vue')
    expect(routerSource).toContain('MerchantDecorationView.vue')
    expect(routerSource).toContain('MerchantMicroPagesView.vue')
    expect(routerSource).toContain('MerchantMicroFormsView.vue')
    expect(routerSource).toContain('MerchantMicroFormEditorView.vue')
    expect(routerSource).toContain("redirect: '/merchant/overview'")
    expect(workbenchFeatures.find(feature => feature.key === 'merchant-overview')?.component).toBe('merchant-overview')
    expect(workbenchFeatures.find(feature => feature.key === 'merchant-decoration')?.component).toBe('decoration')
    expect(workbenchFeatures.find(feature => feature.key === 'merchant-micro-pages')?.component).toBe('micro-pages')
    expect(workbenchFeatures.find(feature => feature.key === 'merchant-micro-forms')?.component).toBe('micro-forms')
  })

  it('replaces customer and employee placeholders with dedicated views', () => {
    expect(routerSource).toContain('CustomersView.vue')
    expect(routerSource).toContain('EmployeesView.vue')
  })

  it('replaces notification placeholders with a dedicated view', () => {
    expect(routerSource).toContain('NotificationsView.vue')
  })

  it('replaces customer entry and QR placeholders with a dedicated view', () => {
    expect(routerSource).toContain('ShareLinksView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'tool-booking-entry')?.status).toBe('ready')
    expect(workbenchFeatures.find(feature => feature.key === 'tool-pickup-entry')?.status).toBe('ready')
    expect(workbenchFeatures.find(feature => feature.key === 'tool-share-links')?.status).toBe('ready')
  })

  it('replaces channel settings placeholder with a dedicated view', () => {
    expect(routerSource).toContain('ChannelsView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'settings-channels')?.status).toBe('ready')
  })

  it('replaces system logs placeholder with a dedicated view', () => {
    expect(routerSource).toContain('LogsView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'settings-logs')?.status).toBe('ready')
  })

  it('replaces roles and permissions placeholder with a dedicated view', () => {
    expect(routerSource).toContain('RolesView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'settings-roles')?.status).toBe('ready')
  })

  it('replaces Douyin product and channel verification placeholders with dedicated views', () => {
    expect(routerSource).toContain('DouyinProductsView.vue')
    expect(routerSource).toContain('ChannelVerificationView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'product-douyin')?.status).toBe('ready')
    expect(workbenchFeatures.find(feature => feature.key === 'order-verification')?.status).toBe('ready')
  })

  it('replaces remaining product placeholders with derived product module views', () => {
    expect(routerSource).toContain('DerivedProductModuleView.vue')
    expect(routerSource).toContain('ProductCardManagementView.vue')
    expect(routerSource).toContain('ProductCardCatalogView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'product-card-management')?.component).toBe('product-cards')
    expect(workbenchFeatures.find(feature => feature.key === 'product-card-catalog')?.component).toBe('product-card-catalog')
    for (const key of ['product-addon', 'product-group', 'product-print', 'product-meituan']) {
      const feature = workbenchFeatures.find(feature => feature.key === key)
      expect(feature?.component).toBe('derived-product-module')
      expect(feature?.status).toBe('ready')
    }
  })

  it('replaces the campaign order placeholder with a unified order view', () => {
    expect(routerSource).toContain('CampaignOrdersView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'order-campaign')?.component).toBe('campaign-orders')
    expect(workbenchFeatures.find(feature => feature.key === 'order-campaign')?.status).toBe('ready')
  })

  it('exposes a dedicated staff booking entry instead of hiding manual booking inside QR tools', () => {
    expect(routerSource).toContain('StaffBookingEntryView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'order-staff-booking')?.component).toBe('staff-booking-entry')
    expect(workbenchFeatures.find(feature => feature.key === 'order-staff-booking')?.permission).toBe('yy:order:add')
    expect(workbenchFeatures.find(feature => feature.key === 'order-staff-booking')?.path).toBe('/order/staff-booking')
  })

  it('replaces the remaining order placeholders with derived order module views', () => {
    expect(routerSource).toContain('DerivedOrderModuleView.vue')
    for (const key of ['order-print', 'order-enterprise', 'order-card', 'order-coupon']) {
      const feature = workbenchFeatures.find(feature => feature.key === key)
      expect(feature?.component).toBe('derived-order-module')
      expect(feature?.status).toBe('ready')
    }
  })

  it('maps order-forms to the real OrderFormSubmissionsView', () => {
    expect(routerSource).toContain('OrderFormSubmissionsView.vue')
    const feature = workbenchFeatures.find(f => f.key === 'order-forms')
    expect(feature?.component).toBe('order-form-submissions')
    expect(feature?.status).toBe('ready')
  })

  it('keeps public micro page and micro form routes outside staff auth', () => {
    expect(routerSource).toContain("path: '/public/micro-form/:id'")
    expect(routerSource).toContain('PublicMicroFormView.vue')
    expect(routerSource).toContain("path: '/public/micro-page/:id'")
    expect(routerSource).toContain('PublicMicroPageView.vue')
    expect(routerSource).toContain("meta: { public: true")
  })

  it('replaces the work execution placeholder with a derived operations view', () => {
    expect(routerSource).toContain('WorkExecutionOverviewView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'collaboration-overview')?.component).toBe('work-execution-overview')
    expect(workbenchFeatures.find(feature => feature.key === 'collaboration-overview')?.status).toBe('ready')
  })

  it('replaces the work order placeholder with a derived work order view', () => {
    expect(routerSource).toContain('WorkOrdersView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'collaboration-work-orders')?.component).toBe('work-orders')
    expect(workbenchFeatures.find(feature => feature.key === 'collaboration-work-orders')?.status).toBe('ready')
  })

  it('replaces the work order export placeholder with a CSV export view', () => {
    expect(routerSource).toContain('WorkOrderExportView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'collaboration-export')?.component).toBe('work-order-export')
    expect(workbenchFeatures.find(feature => feature.key === 'collaboration-export')?.status).toBe('ready')
  })

  it('replaces the work order statistics placeholder with a stage statistics view', () => {
    expect(routerSource).toContain('WorkOrderStatisticsView.vue')
    expect(workbenchFeatures.find(feature => feature.key === 'collaboration-statistics')?.component).toBe('work-order-statistics')
    expect(workbenchFeatures.find(feature => feature.key === 'collaboration-statistics')?.status).toBe('ready')
  })

  it('replaces resource placeholders with derived resource module views', () => {
    expect(routerSource).toContain('DerivedResourceModuleView.vue')
    for (const key of ['resource-files', 'resource-samples']) {
      const feature = workbenchFeatures.find(feature => feature.key === key)
      expect(feature?.component).toBe('derived-resource-module')
      expect(feature?.status).toBe('ready')
    }
  })

  it('does not add an old CreateBooking route outside the workbench registry', () => {
    expect(routerSource).not.toContain('CreateBooking')
  })
})
