import { describe, expect, it } from 'vitest'
import type { ChannelProductMappingInfo, StoreInfo } from '../../shared/stores/appStore'
import {
  buildDouyinStoreBindings,
  mappingBelongsToStore,
  standardDouyinLifePoiStoreAnchors,
} from './storeDouyinBindings'

const makeStore = (overrides: Partial<StoreInfo> = {}): StoreInfo => ({
  backendId: '900000000000000100',
  id: 'BZ-WANDA',
  name: '滨州万达店',
  status: '营业中',
  manager: '主管 · 未配置',
  monthlyOrders: '0',
  pendingOrders: '0',
  address: '',
  phone: '',
  hours: '--:-- - --:--',
  ...overrides,
})

const makeMapping = (overrides: Partial<ChannelProductMappingInfo> = {}): ChannelProductMappingInfo => ({
  backendId: 'mapping-1',
  productBackendId: 'product-1',
  storeName: '门店 #900000000000000100',
  productName: '抖音来客 POI 锚点',
  channelType: 'DOUYIN_LIFE',
  externalProductId: '',
  externalSkuId: '',
  externalPoiId: '7342410951733282851',
  landingUrl: '',
  landingPath: '',
  externalName: '一悦照相馆(滨州万达店) POI 锚点',
  mappingStatus: 'ACTIVE',
  remark: '',
  ready: false,
  ...overrides,
})

describe('store Douyin Life bindings', () => {
  it('keeps the four confirmed Douyin Life POI anchors explicit', () => {
    expect(standardDouyinLifePoiStoreAnchors).toEqual({
      '7228779175929186363': { storeCode: 'BZ-WUYUE', storeBackendId: '900000000000000200' },
      '7555006097638393865': { storeCode: 'WH-ZHIGU', storeBackendId: '900000000000000300' },
      '7342410951733282851': { storeCode: 'BZ-WANDA', storeBackendId: '900000000000000100' },
      '7628187182788544538': { storeCode: 'ZB-WANXIANGHUI', storeBackendId: '900000000000000400' },
    })
  })

  it('matches mappings by backend id, store code, name, and standard POI anchor', () => {
    const store = makeStore()

    expect(mappingBelongsToStore(makeMapping({ storeName: '门店 #900000000000000100' }), store)).toBe(true)
    expect(mappingBelongsToStore(makeMapping({ storeName: 'BZ-WANDA', externalPoiId: '' }), store)).toBe(true)
    expect(mappingBelongsToStore(makeMapping({ storeName: '滨州万达店', externalPoiId: '' }), store)).toBe(true)
    expect(mappingBelongsToStore(makeMapping({ storeName: '全部门店', externalPoiId: '7342410951733282851' }), store)).toBe(true)
  })

  it('does not guess the non-standard Binzhou POI into the four-store set', () => {
    const store = makeStore()

    expect(mappingBelongsToStore(makeMapping({
      storeName: '全部门店',
      externalPoiId: '7407304729216157722',
      externalName: '一悦照相馆(滨州店)',
    }), store)).toBe(false)
  })

  it('builds per-store binding summaries from DOUYIN_LIFE mappings only', () => {
    const bindings = buildDouyinStoreBindings([
      makeStore({ backendId: '900000000000000100', id: 'BZ-WANDA', name: '滨州万达店' }),
      makeStore({ backendId: '900000000000000400', id: 'ZB-WANXIANGHUI', name: '淄博万象汇店' }),
    ], [
      makeMapping({ backendId: 'wanda-anchor', externalPoiId: '7342410951733282851', storeName: '全部门店', channelType: 'DOUYIN_LIFE' }),
      makeMapping({ backendId: 'zibo-anchor', externalPoiId: '7628187182788544538', storeName: '全部门店', channelType: 'DOUYIN_LIFE', ready: true }),
      makeMapping({ backendId: 'wechat-noise', externalPoiId: '7342410951733282851', storeName: '全部门店', channelType: 'WECHAT' }),
    ])

    expect(bindings.map(item => [item.store.id, item.mappingCount, item.readyCount, item.poiIds])).toEqual([
      ['BZ-WANDA', 1, 0, ['7342410951733282851']],
      ['ZB-WANXIANGHUI', 1, 1, ['7628187182788544538']],
    ])
  })

  it('separates active POI mapping from sellable landing readiness', () => {
    const [anchorOnly, sellable, missing] = buildDouyinStoreBindings([
      makeStore({ backendId: '900000000000000100', id: 'BZ-WANDA', name: '滨州万达店' }),
      makeStore({ backendId: '900000000000000400', id: 'ZB-WANXIANGHUI', name: '淄博万象汇店' }),
      makeStore({ backendId: '900000000000000200', id: 'BZ-WUYUE', name: '滨州吾悦店' }),
    ], [
      makeMapping({ externalPoiId: '7342410951733282851', storeName: '全部门店', ready: false }),
      makeMapping({ externalPoiId: '7628187182788544538', storeName: '全部门店', ready: true }),
    ])

    expect(anchorOnly?.statusLabel).toBe('已映射')
    expect(sellable?.statusLabel).toBe('可投放')
    expect(missing?.statusLabel).toBe('待绑定')
  })
})
