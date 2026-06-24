import { describe, expect, it } from 'vitest'
import storeSource from './StoreView.vue?raw'

describe('store page contract', () => {
  it('shows a store operations board before the store grid', () => {
    expect(storeSource).toContain('MerchantModuleChrome')
    expect(storeSource).toContain('store-ops-board')
    expect(storeSource).toContain('门店承接概况')
    expect(storeSource).toContain('门店总数')
    expect(storeSource).toContain('营业中')
    expect(storeSource).toContain('待服务单')
    expect(storeSource).toContain('本月订单')
  })

  it('offers quick filters for store staff', () => {
    expect(storeSource).toContain('quickStoreFilters')
    expect(storeSource).toContain('当前可见')
    expect(storeSource).toContain('有待服务')
    expect(storeSource).toContain('预约制')
    expect(storeSource).toContain('activeStoreFilter')
    expect(storeSource).toContain("type=\"button\"")
  })

  it('derives store operations from existing app store data', () => {
    expect(storeSource).toContain('appStore.stores')
    expect(storeSource).toContain('appStore.orders')
    expect(storeSource).toContain('appStore.albums')
    expect(storeSource).toContain('appStore.scheduleItems')
    expect(storeSource).toContain('appStore.channelProductMappings')
    expect(storeSource).toContain('storeBackendId === storeBackendId')
  })

  it('summarizes Douyin Life bindings for every local store', () => {
    expect(storeSource).toContain('抖音来客绑定')
    expect(storeSource).toContain('douyinStoreBindings')
    expect(storeSource).toContain('externalPoiId')
    expect(storeSource).toContain("mapping.channelType === 'DOUYIN_LIFE'")
    expect(storeSource).toContain('loadChannelProductMappings')
    expect(storeSource).toContain('/yy/channelProductMapping/list')
    expect(storeSource).toContain('真实可用门店以 /yy/store/list 为主数据')
  })

  it('routes store CTAs into real workbench pages instead of dead buttons', () => {
    expect(storeSource).toContain('useRouter')
    expect(storeSource).toContain('const openStoreAction = (store: StoreInfo, actionKey: StoreActionKey)')
    expect(storeSource).toContain('@click="openStoreAction(store, action.key)"')
    expect(storeSource).toContain("path: '/order/appointment'")
    expect(storeSource).toContain("path: '/merchant/service-groups'")
    expect(storeSource).toContain("path: '/product/service'")
    expect(storeSource).toContain("path: '/order/forms'")
    expect(storeSource).toContain('storeId: store.backendId')
  })

  it('does not expose an all-store action in the normal merchant store workbench', () => {
    expect(storeSource).not.toContain('全部门店')
    expect(storeSource).not.toContain('查看全部门店')
    expect(storeSource).not.toContain('切回全部门店')
  })

  it('uses compact reference-style store cards with real action buttons', () => {
    expect(storeSource).toContain('store-reference-card')
    expect(storeSource).toContain('workbenchImages.storeFront')
    expect(storeSource).toContain('storeActionButtons')
    expect(storeSource).toContain('服务组管理')
    expect(storeSource).toContain('产品配置')
    expect(storeSource).toContain('到店下单')
    expect(storeSource).toContain('订单属性')
    expect(storeSource).toContain('openStoreAction(store, action.key)')
  })

  it('keeps Douyin Life mapping as secondary collapsed diagnostics', () => {
    expect(storeSource).toContain('<details')
    expect(storeSource).toContain('抖音来客映射')
    expect(storeSource).toContain('summary')
  })

  it('does not expose placeholder operation scopes', () => {
    const placeholderScope = ['TO', 'DO'].join('')
    expect(storeSource).not.toContain(`scope: '${placeholderScope}'`)
    expect(storeSource).toContain("scope: '服务'")
  })
})
