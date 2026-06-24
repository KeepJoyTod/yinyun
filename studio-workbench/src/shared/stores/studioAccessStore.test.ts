import { beforeEach, describe, expect, it } from 'vitest'
import { studioAccessStore } from './studioAccessStore'

describe('studio access store', () => {
  beforeEach(() => studioAccessStore.reset())

  it('applies employee, store, permission, feature and pending bootstrap data', () => {
    studioAccessStore.apply({
      identity: {
        userId: '2063173289800183809',
        employeeId: '2063173289800183810',
        employeeName: '演示店员',
        roleType: 'PHOTOGRAPHER',
        storeId: '7407304729216157722',
      },
      globalStoreScope: false,
      stores: [
        {
          storeId: '7407304729216157722',
          storeCode: 'YY-SZ-001',
          storeName: '影约云深圳旗舰店',
          status: '0',
        },
      ],
      menuPermissions: ['yy:dashboard:list', 'yy:order:list'],
      rolePermissions: ['studio_staff'],
      featureStatuses: { 'order-appointment': 'ready' },
      pending: {
        pendingOrders: 3,
        todayArrivals: 4,
        inventoryConflicts: 2,
        activeSelections: 5,
      },
    })

    expect(studioAccessStore.initialized).toBe(true)
    expect(studioAccessStore.identity?.userId).toBe('2063173289800183809')
    expect(studioAccessStore.stores[0]?.storeId).toBe('7407304729216157722')
    expect(studioAccessStore.menuPermissions).toContain('yy:order:list')
    expect(studioAccessStore.pending.pendingOrders).toBe(3)
  })

  it('hides internal default stores from visible workbench scope', () => {
    studioAccessStore.apply({
      identity: {
        userId: '2063173289800183809',
        employeeId: '2063173289800183810',
        employeeName: '门店管理员',
        roleType: 'STORE_MANAGER',
      },
      globalStoreScope: false,
      stores: [
        {
          storeId: '900000000000000100',
          storeCode: 'BZ-WANDA',
          storeName: '滨州万达店',
          status: '0',
        },
        {
          storeId: '2063619430924812290',
          storeCode: 'DY-LIFE-DEFAULT',
          storeName: '抖音来客默认门店',
          status: '0',
        },
      ],
      menuPermissions: [],
      rolePermissions: [],
      featureStatuses: {},
      pending: {
        pendingOrders: 0,
        todayArrivals: 0,
        inventoryConflicts: 0,
        activeSelections: 0,
      },
    })

    expect(studioAccessStore.stores).toHaveLength(1)
    expect(studioAccessStore.stores[0]?.storeCode).toBe('BZ-WANDA')
  })

  it('clears authorization data on logout', () => {
    studioAccessStore.useDemoAccess('门店账号')
    studioAccessStore.reset()

    expect(studioAccessStore.initialized).toBe(false)
    expect(studioAccessStore.identity).toBeNull()
    expect(studioAccessStore.menuPermissions).toEqual([])
    expect(studioAccessStore.stores).toEqual([])
  })
})
