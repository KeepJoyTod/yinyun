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
    expect(getWorkbenchFeature('merchant-service-groups')?.permission).toBe('yy:bookingConfig:list')
    expect(getWorkbenchFeature('merchant-inventory')?.permission).toBe('yy:bookingInventory:list')
  })

  it('maps customer and employee modules to dedicated staff permissions', () => {
    expect(getWorkbenchFeature('member-customers')?.permission).toBe('yy:customer:list')
    expect(getWorkbenchFeature('settings-employees')?.permission).toBe('yy:employee:list')
  })

  it('maps derived member modules to customer permissions', () => {
    for (const key of ['member-accounts', 'member-tags', 'member-consumption']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('ready')
      expect(feature?.permission).toBe('yy:customer:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:customer:list'])).toBe(true)
      expect(canAccessWorkbenchFeature(feature, [])).toBe(false)
    }
  })

  it('maps derived marketing modules to unified order permissions', () => {
    for (const key of ['marketing-center', 'marketing-coupons', 'marketing-campaigns', 'marketing-participations']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('ready')
      expect(feature?.permission).toBe('yy:order:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:order:list'])).toBe(true)
      expect(canAccessWorkbenchFeature(feature, [])).toBe(false)
    }
  })

  it('maps derived reports to the permissions of their source ledgers', () => {
    for (const key of ['report-store-daily', 'report-store-monthly', 'report-products', 'report-finance', 'report-channels', 'report-conversion']) {
      expect(getWorkbenchFeature(key)?.permission).toBe('yy:order:list')
    }
    expect(getWorkbenchFeature('report-employees')?.permission).toBe('yy:employee:list')
    expect(getWorkbenchFeature('report-retouch')?.permission).toBe('yy:photoAlbum:list')
    expect(getWorkbenchFeature('report-customers')?.permission).toBe('yy:customer:list')
    expect(getWorkbenchFeature('report-reviews')?.permission).toBe('yy:customer:list')
  })

  it('maps notification tools to notification permissions', () => {
    expect(getWorkbenchFeature('tool-notifications')?.permission).toBe('yy:notification:list')
  })

  it('maps work order operations to unified order permissions', () => {
    const feature = getWorkbenchFeature('collaboration-work-orders')
    expect(feature?.status).toBe('ready')
    expect(feature?.permission).toBe('yy:order:list')
    expect(canAccessWorkbenchFeature(feature, ['yy:order:list'])).toBe(true)
    expect(canAccessWorkbenchFeature(feature, [])).toBe(false)

    const exportFeature = getWorkbenchFeature('collaboration-export')
    expect(exportFeature?.status).toBe('ready')
    expect(exportFeature?.permission).toBe('yy:order:list')

    const statisticsFeature = getWorkbenchFeature('collaboration-statistics')
    expect(statisticsFeature?.status).toBe('ready')
    expect(statisticsFeature?.permission).toBe('yy:order:list')
  })

  it('maps derived order modules to unified order permissions', () => {
    for (const key of ['order-print', 'order-enterprise', 'order-card', 'order-coupon', 'order-forms']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('ready')
      expect(feature?.permission).toBe('yy:order:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:order:list'])).toBe(true)
      expect(canAccessWorkbenchFeature(feature, [])).toBe(false)
    }
  })

  it('maps derived product modules to product and channel permissions', () => {
    for (const key of ['product-addon', 'product-group', 'product-print']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('ready')
      expect(feature?.permission).toBe('yy:product:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:product:list'])).toBe(true)
      expect(canAccessWorkbenchFeature(feature, [])).toBe(false)
    }

    const meituan = getWorkbenchFeature('product-meituan')
    expect(meituan?.status).toBe('ready')
    expect(meituan?.permission).toBe('yy:channel:list')
    expect(canAccessWorkbenchFeature(meituan, ['yy:channel:list'])).toBe(true)
    expect(canAccessWorkbenchFeature(meituan, [])).toBe(false)
  })

  it('maps resource modules to photo album permissions', () => {
    for (const key of ['resource-files', 'resource-samples']) {
      const feature = getWorkbenchFeature(key)
      expect(feature?.status).toBe('ready')
      expect(feature?.permission).toBe('yy:photoAlbum:list')
      expect(canAccessWorkbenchFeature(feature, ['yy:photoAlbum:list'])).toBe(true)
      expect(canAccessWorkbenchFeature(feature, [])).toBe(false)
    }
  })

  it('never promotes a locally unfinished feature from a remote flag', () => {
    const ready = getWorkbenchFeature('order-appointment')
    const building = ready ? { ...ready, key: 'local-building', status: 'building' as const } : undefined

    expect(getEffectiveFeatureStatus(building, { 'local-building': 'ready' })).toBe('building')
    expect(getEffectiveFeatureStatus(ready, { 'order-appointment': 'building' })).toBe('building')
    expect(getEffectiveFeatureStatus(ready, { 'order-appointment': 'hidden' })).toBe('hidden')
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
