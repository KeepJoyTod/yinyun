import { describe, expect, it } from 'vitest'
import {
  canAccessWorkbenchFeature,
  getEffectiveFeatureStatus,
  getFeaturePendingCount,
  getWorkbenchFeature,
  type WorkbenchPendingCounts,
} from './featureRegistry'

describe('workbench feature access', () => {
  it('requires the matching RuoYi permission for protected features', () => {
    const feature = getWorkbenchFeature('order-appointment')
    expect(feature?.permission).toBe('yy:order:list')
    expect(canAccessWorkbenchFeature(feature, ['yy:order:list'])).toBe(true)
    expect(canAccessWorkbenchFeature(feature, ['yy:dashboard:list'])).toBe(false)
    expect(canAccessWorkbenchFeature(feature, ['*:*:*'])).toBe(true)
  })

  it('maps merchant operations to booking config and inventory permissions', () => {
    expect(getWorkbenchFeature('merchant-overview')?.permission).toBe('yy:store:list')
    expect(getWorkbenchFeature('merchant-readiness')?.permission).toBe('yy:store:list')
    expect(getWorkbenchFeature('merchant-service-groups')?.permission).toBe('yy:bookingConfig:list')
    expect(getWorkbenchFeature('merchant-inventory')?.permission).toBe('yy:bookingInventory:list')
  })

  it('maps member routes to customer permissions and keeps owner readiness explicit', () => {
    const accounts = getWorkbenchFeature('member-accounts')
    expect(accounts?.status).toBe('ready')
    expect(accounts?.permission).toBe('yy:customer:list')
    expect(canAccessWorkbenchFeature(accounts, ['yy:customer:list'])).toBe(true)
    expect(canAccessWorkbenchFeature(accounts, [])).toBe(false)

    const tags = getWorkbenchFeature('member-tags')
    expect(tags?.status).toBe('derived')
    expect(tags?.permission).toBe('yy:customer:list')
    expect(canAccessWorkbenchFeature(tags, ['yy:customer:list'])).toBe(true)
    expect(canAccessWorkbenchFeature(tags, [])).toBe(false)

    const consumption = getWorkbenchFeature('member-consumption')
    expect(consumption?.status).toBe('ready')
    expect(consumption?.permission).toBe('yy:customer:list')
    expect(canAccessWorkbenchFeature(consumption, ['yy:customer:list'])).toBe(true)
    expect(canAccessWorkbenchFeature(consumption, [])).toBe(false)
  })

  it('maps dedicated marketing modules to unified order permissions with ready status', () => {
    for (const key of ['marketing-center', 'marketing-coupons', 'marketing-campaigns', 'marketing-participations']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('ready')
      expect(feature?.permission).toBe('yy:order:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:order:list'])).toBe(true)
      expect(canAccessWorkbenchFeature(feature, [])).toBe(false)
    }
  })

  it('maps collaboration overview routes to real work-order permissions with ready status', () => {
    for (const key of ['collaboration-overview', 'collaboration-work-orders', 'collaboration-export', 'collaboration-statistics']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('ready')
      expect(feature?.permission).toBe('yy:order:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:order:list'])).toBe(true)
    }
  })

  it('maps derived order modules to unified order permissions', () => {
    for (const key of ['order-print', 'order-enterprise', 'order-card', 'order-coupon', 'order-campaign', 'order-forms']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('derived')
      expect(feature?.permission).toBe('yy:order:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:order:list'])).toBe(true)
      expect(canAccessWorkbenchFeature(feature, [])).toBe(false)
    }
  })

  it('maps derived product modules to product and channel permissions', () => {
    for (const key of ['product-addon', 'product-group', 'product-print']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('derived')
      expect(feature?.permission).toBe('yy:product:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:product:list'])).toBe(true)
    }

    const meituan = getWorkbenchFeature('product-meituan')
    expect(meituan?.status).toBe('derived')
    expect(meituan?.permission).toBe('yy:channel:list')
    expect(canAccessWorkbenchFeature(meituan, ['yy:channel:list'])).toBe(true)
    expect(canAccessWorkbenchFeature(meituan, [])).toBe(false)
  })

  it('keeps partial routes visible but not mislabeled as ready', () => {
    expect(getWorkbenchFeature('order-verification')?.status).toBe('partial')
    expect(getWorkbenchFeature('report-reviews')?.status).toBe('partial')
    expect(getWorkbenchFeature('settings-roles')?.status).toBe('partial')
    expect(getWorkbenchFeature('settings-logs')?.status).toBe('partial')
  })

  it('maps new scaffold governance groups to verified existing permissions instead of inventing new codes', () => {
    expect(getWorkbenchFeature('platform-integration')?.permission).toBe('yy:channel:list')
    expect(getWorkbenchFeature('platform-notification-center')?.permission).toBe('yy:notification:list')
    expect(getWorkbenchFeature('account-profile')?.permission).toBe('yy:dashboard:list')
    expect(getWorkbenchFeature('finance-overview')?.permission).toBe('yy:dashboard:list')
    expect(getWorkbenchFeature('tool-sample-works')?.permission).toBe('yy:photoAsset:list')
    expect(getWorkbenchFeature('tool-precision-delivery')?.permission).toBe('yy:notification:list')
  })

  it('never promotes a locally unfinished feature from a remote flag', () => {
    const ready = getWorkbenchFeature('order-appointment')
    const building = ready ? { ...ready, key: 'local-building', status: 'building' as const } : undefined

    expect(getEffectiveFeatureStatus(building, { 'local-building': 'ready' })).toBe('building')
    expect(getEffectiveFeatureStatus(ready, { 'order-appointment': 'building' })).toBe('building')
    expect(getEffectiveFeatureStatus(ready, { 'order-appointment': 'hidden' })).toBe('hidden')
    expect(getEffectiveFeatureStatus(getWorkbenchFeature('order-forms'), {})).toBe('derived')
    expect(getEffectiveFeatureStatus(getWorkbenchFeature('settings-logs'), {})).toBe('partial')
  })

  it('maps pending counters to the relevant navigation entries', () => {
    const pending: WorkbenchPendingCounts = {
      pendingOrders: 12,
      todayArrivals: 7,
      inventoryConflicts: 2,
      activeSelections: 4,
    }

    expect(getFeaturePendingCount('order-appointment', pending)).toBe(12)
    expect(getFeaturePendingCount('dashboard-today', pending)).toBe(7)
    expect(getFeaturePendingCount('merchant-inventory', pending)).toBe(2)
    expect(getFeaturePendingCount('service-selection', pending)).toBe(4)
    expect(getFeaturePendingCount('member-customers', pending)).toBe(0)
  })
})
