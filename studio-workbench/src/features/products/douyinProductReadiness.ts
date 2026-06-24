import type { ChannelProductMappingInfo } from '../../shared/stores/appStoreTypes'

export type MissingFieldLabel = 'externalProductId' | 'externalSkuId' | 'externalPoiId' | 'landingUrlOrPath' | 'mappingStatus'

export type MissingFieldInfo = {
  key: MissingFieldLabel
  label: string
  missing: boolean
}

export type DouyinReadinessResult = {
  ready: boolean
  fields: MissingFieldInfo[]
  missingFields: string[]
}

const isActiveMappingStatus = (value: string | null | undefined) => {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!normalized) return false
  return ['0', '1', 'active', 'enabled', 'enable', 'normal', 'online', 'ready', 'valid', '启用', '正常'].includes(normalized)
}

export const checkDouyinProductReadiness = (
  mapping: ChannelProductMappingInfo,
): DouyinReadinessResult => {
  const fields: MissingFieldInfo[] = [
    { key: 'externalProductId', label: '商品 ID', missing: !mapping.externalProductId },
    { key: 'externalSkuId', label: 'SKU ID', missing: !mapping.externalSkuId },
    { key: 'externalPoiId', label: 'POI', missing: !mapping.externalPoiId },
    { key: 'landingUrlOrPath', label: '落地页', missing: !mapping.landingUrl && !mapping.landingPath },
    { key: 'mappingStatus', label: '映射状态', missing: !isActiveMappingStatus(mapping.mappingStatus) },
  ]
  const missingFields = fields.filter(f => f.missing).map(f => f.label)
  return {
    ready: missingFields.length === 0,
    fields,
    missingFields,
  }
}

export const formatDouyinMissingList = (mapping: ChannelProductMappingInfo): string => {
  const readiness = checkDouyinProductReadiness(mapping)
  const lines: string[] = [
    `【抖音产品待补清单】`,
    `商品名称：${mapping.productName || '未命名'}`,
    `门店：${mapping.storeName || '未知'}`,
    `mappingId：${mapping.backendId}`,
    `productId：${mapping.productBackendId || '-'}`,
    '',
    '缺失字段：',
  ]
  if (readiness.missingFields.length === 0) {
    lines.push('  无缺失，可投放')
  } else {
    for (const field of readiness.missingFields) {
      lines.push(`  - ${field === '映射状态' ? '映射状态未启用' : `缺${field}`}`)
    }
  }
  lines.push('')
  lines.push('建议补齐位置：')
  lines.push('  - 系统后台渠道商品映射 /yy/channelProductMapping/list')
  lines.push('  - 抖音来客商品后台')
  return lines.join('\n')
}
