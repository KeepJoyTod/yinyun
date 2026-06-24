import type { ChannelProductMappingInfo, StoreInfo } from '../../shared/stores/appStore'

export const standardDouyinLifePoiStoreAnchors = {
  '7228779175929186363': { storeCode: 'BZ-WUYUE', storeBackendId: '900000000000000200' },
  '7555006097638393865': { storeCode: 'WH-ZHIGU', storeBackendId: '900000000000000300' },
  '7342410951733282851': { storeCode: 'BZ-WANDA', storeBackendId: '900000000000000100' },
  '7628187182788544538': { storeCode: 'ZB-WANXIANGHUI', storeBackendId: '900000000000000400' },
} as const

const normalizeToken = (value: string | number | undefined | null) => String(value ?? '').trim().toUpperCase()

const storeTokens = (store: StoreInfo) => new Set([
  normalizeToken(store.name),
  normalizeToken(store.id),
  normalizeToken(store.backendId),
  normalizeToken(`门店 #${store.backendId}`),
])

export const mappingBelongsToStore = (mapping: ChannelProductMappingInfo, store: StoreInfo) => {
  const tokens = storeTokens(store)
  if (tokens.has(normalizeToken(mapping.storeName))) return true

  const anchor = standardDouyinLifePoiStoreAnchors[mapping.externalPoiId as keyof typeof standardDouyinLifePoiStoreAnchors]
  if (!anchor) return false

  return normalizeToken(anchor.storeCode) === normalizeToken(store.id)
    || normalizeToken(anchor.storeBackendId) === normalizeToken(store.backendId)
}

const uniqueValues = (values: string[]) => Array.from(new Set(values.map(value => value.trim()).filter(Boolean)))

export const buildDouyinStoreBindings = (
  stores: StoreInfo[],
  mappings: ChannelProductMappingInfo[],
) => {
  const douyinMappings = mappings.filter(mapping => mapping.channelType === 'DOUYIN_LIFE')
  return stores.map(store => {
    const storeMappings = douyinMappings.filter(mapping => mappingBelongsToStore(mapping, store))
    const readyCount = storeMappings.filter(mapping => mapping.ready).length
    const poiIds = uniqueValues(storeMappings.map(mapping => mapping.externalPoiId))
    return {
      store,
      mappings: storeMappings,
      mappingCount: storeMappings.length,
      readyCount,
      poiIds,
      statusLabel: readyCount > 0 ? '可投放' : storeMappings.length > 0 ? '已映射' : '待绑定',
      statusTone: readyCount > 0 ? 'ready' : storeMappings.length > 0 ? 'mapped' : 'missing',
      hint: storeMappings.length === 0
        ? '这家门店还没有 DOUYIN_LIFE 商品映射；到后台 /yy/channelProductMapping/list 维护商品、SKU、POI 和入口。'
        : readyCount > 0
          ? '已存在可投放的来客商品入口；订单支付后同步到本地 yy_order。'
          : '已完成 POI 归店映射；如需直接投放，还要补齐具体商品、SKU、入口或启用状态。',
    }
  })
}
