import type { BackendId } from './backendId'

export type ProductConfigStatus = '0' | '1' | string

export type ProductCategoryDto = {
  id?: BackendId
  storeId?: BackendId
  categoryCode?: string
  categoryName: string
  parentId?: BackendId
  sort?: number
  status?: ProductConfigStatus
  remark?: string
}

export type ProductSkuDto = {
  id?: BackendId
  productId: BackendId
  specName: string
  originalPrice?: number
  salePrice?: number
  workstationCost?: number
  onShow?: string
  status?: ProductConfigStatus
  sort?: number
  remark?: string
}

export type ProductDisplayConfigDto = {
  id?: BackendId
  productId: BackendId
  showPlatform?: string
  bookingButtonText?: string
  directUrl?: string
  qrScene?: string
  onlineBookingFlag?: string
  storeOrderFlag?: string
  detailButtonMode?: string
  status?: ProductConfigStatus
  remark?: string
}

export type ProductRelationDto = {
  id?: BackendId
  productId: BackendId
  targetProductId: BackendId
  relationType: string
  pricePolicy?: string
  sort?: number
  status?: ProductConfigStatus
  remark?: string
}

export type ProductBookingRuleDto = {
  id?: BackendId
  productId: BackendId
  storeId?: BackendId
  serviceGroupIds?: string
  durationMinutes?: number
  prepayMode?: string
  bookingLimit?: string
  inventoryBindingStatus?: string
  benefitBindingStatus?: string
  status?: ProductConfigStatus
  remark?: string
}

export type ProductChannelConfigDto = {
  id?: BackendId
  productId: BackendId
  channelMappingId?: BackendId
  channelType: string
  externalProductId?: string
  externalSkuId?: string
  externalPoiId?: string
  landingUrl?: string
  landingPath?: string
  mappingStatus?: string
  status?: ProductConfigStatus
  remark?: string
}

export type ProductFulfillmentRuleDto = {
  id?: BackendId
  productId: BackendId
  collaborationConfigId?: BackendId
  workflowCode?: string
  needPhoto?: string
  needRetouch?: string
  needPickup?: string
  deliverWithinHours?: number
  status?: ProductConfigStatus
  remark?: string
}

export type ProductBindingReadinessDto = {
  productId?: BackendId
  ready?: boolean
  bound?: boolean
  status?: string
  bindingStatus?: string
  reason?: string
}

export type ProductCatalogDto = {
  productId: BackendId
  storeId?: BackendId
  productType?: string
  productName?: string
  price?: number
  durationMinutes?: number
  status?: ProductConfigStatus
  sort?: number
  skus: ProductSkuDto[]
  displayConfig?: ProductDisplayConfigDto | null
  bookingRule?: ProductBookingRuleDto | null
  relations: ProductRelationDto[]
  channelConfigs: ProductChannelConfigDto[]
  fulfillmentRule?: ProductFulfillmentRuleDto | null
  orderReadiness?: ProductBindingReadinessDto | null
  inventoryBinding?: ProductBindingReadinessDto | null
  benefitBinding?: ProductBindingReadinessDto | null
}

export type ProductConfigListQuery = Record<string, string | number | boolean | null | undefined>

export type ProductScaffoldOwner = {
  key: string
  label: string
  path: string
  apiPath: string
  layer: 'presentation' | 'control' | 'data'
  status: string
}
