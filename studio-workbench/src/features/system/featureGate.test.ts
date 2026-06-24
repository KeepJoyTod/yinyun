import { beforeEach, describe, expect, it } from 'vitest'
import { studioAccessStore } from '../../shared/stores/studioAccessStore'
import { resolveFeatureGate, resolveLicenseState } from './featureGate'

describe('feature gate', () => {
  beforeEach(() => studioAccessStore.reset())

  it('blocks access when page permission is missing', () => {
    studioAccessStore.apply({
      identity: { userId: 'staff-1' },
      globalStoreScope: true,
      stores: [],
      menuPermissions: ['yy:customer:list'],
      rolePermissions: ['studio_staff'],
      featureStatuses: { 'marketing-center': 'ready' },
      pending: {
        pendingOrders: 0,
        todayArrivals: 0,
        inventoryConflicts: 0,
        activeSelections: 0,
      },
    })

    const gate = resolveFeatureGate({ featureKey: 'marketing-center' })

    expect(gate.state).toBe('permission_denied')
    expect(gate.permissionCode).toBe('yy:order:list')
    expect(gate.permissionMatched).toBe(false)
  })

  it('requires store scope when the domain mandates concrete store authorization', () => {
    studioAccessStore.apply({
      identity: { userId: 'staff-2' },
      globalStoreScope: false,
      stores: [],
      menuPermissions: ['yy:order:list'],
      rolePermissions: ['studio_staff'],
      featureStatuses: { 'marketing-center': 'ready' },
      pending: {
        pendingOrders: 0,
        todayArrivals: 0,
        inventoryConflicts: 0,
        activeSelections: 0,
      },
    })

    const gate = resolveFeatureGate({ featureKey: 'marketing-center', requireStoreScope: true })

    expect(gate.state).toBe('store_scope_required')
    expect(gate.storeScopeLabel).toBe('当前账号暂无门店范围')
  })

  it('marks explicit empty license bindings as missing', () => {
    expect(resolveLicenseState([])).toBe('missing')
  })

  it('passes when permission, role, plugin and active license are all ready', () => {
    studioAccessStore.apply({
      identity: { userId: 'manager-1' },
      globalStoreScope: false,
      stores: [
        {
          storeId: 'store-1',
          storeCode: 'YY-SH-001',
          storeName: '上海旗舰店',
          status: '0',
        },
      ],
      menuPermissions: ['yy:order:list'],
      rolePermissions: ['studio_manager'],
      featureStatuses: { 'marketing-center': 'ready' },
      pending: {
        pendingOrders: 0,
        todayArrivals: 0,
        inventoryConflicts: 0,
        activeSelections: 0,
      },
    })

    const gate = resolveFeatureGate({
      featureKey: 'marketing-center',
      requiredRoles: ['studio_manager'],
      requireStoreScope: true,
      pluginEnabled: true,
      licenseBindings: [
        {
          licenseKey: 'license-001',
          planName: '营销中心',
          status: 'ACTIVE',
          expireTime: '2099-12-31 23:59:59',
          boundStoreIds: 'store-1',
        },
      ],
    })

    expect(gate.state).toBe('enabled')
    expect(gate.licenseState).toBe('active')
    expect(gate.pluginState).toBe('enabled')
    expect(gate.roleMatched).toBe(true)
  })
})
