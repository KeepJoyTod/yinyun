import type { ChannelProductMappingInfo } from '../../../../shared/stores/appStore'
import { checkDouyinProductReadiness, formatDouyinMissingList } from '../../../products/douyinProductReadiness'

export type MerchantProductFilter = 'all' | 'ready' | 'missing' | 'link'

export const getCopyableProductEntry = (mapping: ChannelProductMappingInfo) => mapping.landingUrl || mapping.landingPath || ''
export const getProductReadiness = (mapping: ChannelProductMappingInfo) => checkDouyinProductReadiness(mapping)
export const getProductMissingList = (mapping: ChannelProductMappingInfo) => formatDouyinMissingList(mapping)

export const buildMerchantProductFilters = (mappings: ChannelProductMappingInfo[]) => {
  const ready = mappings.filter(item => getProductReadiness(item).ready)
  const link = mappings.filter(item => Boolean(getCopyableProductEntry(item)))
  return [
    { key: 'all' as const, label: 'All mappings', count: mappings.length },
    { key: 'ready' as const, label: 'Ready', count: ready.length },
    { key: 'missing' as const, label: 'Needs work', count: mappings.length - ready.length },
    { key: 'link' as const, label: 'Has entry', count: link.length },
  ]
}

export const buildMerchantProductCards = (mappings: ChannelProductMappingInfo[]) => {
  const ready = mappings.filter(item => getProductReadiness(item).ready)
  return [
    { label: 'Douyin mappings', value: String(mappings.length), hint: 'DOUYIN_LIFE mappings from /yy/channelProductMapping/list.', scope: 'ALL' },
    { label: 'Ready', value: String(ready.length), hint: 'Product, SKU, POI, and landing entry are all present.', scope: 'READY' },
    { label: 'Needs work', value: String(mappings.length - ready.length), hint: 'Still missing external ids, POI, entry, or enabled status.', scope: 'CHECK' },
    { label: 'Order ledger', value: 'yy_order', hint: 'Paid Douyin orders still settle into the single local order ledger.', scope: 'CORE' },
  ]
}
