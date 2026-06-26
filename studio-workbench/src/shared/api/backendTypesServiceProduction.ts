import type { BackendId } from './backendId'

export type RetouchTaskDto = {
  id: BackendId
  tenantId: string
  storeId: BackendId | null
  storeName: string
  orderId: BackendId | null
  orderNo: string
  albumId: BackendId | null
  albumName: string
  providerId: BackendId | null
  providerName: string
  taskNo: string
  status: string
  acceptanceStatus: string
  quoteAmountCent: number
  dueTime: string
  submittedTime: string
  completedTime: string
  sourceStage: string
  customerName: string
  serviceName: string
  blockReason: string
  remark: string
  createTime: string
  updateTime: string
}

export type RetouchTaskListQuery = {
  storeId?: BackendId
  providerId?: BackendId
  status?: string
  keyword?: string
  pageNum?: number
  pageSize?: number
}

export type RetouchTaskActionPayload = {
  id: BackendId
  providerId?: BackendId | null
  quoteAmountCent?: number
  dueTime?: string
  status?: string
  acceptanceStatus?: string
  blockReason?: string
  remark?: string
}

export type RetouchProviderDto = {
  id: BackendId
  tenantId: string
  providerCode: string
  providerName: string
  contactName: string
  contactPhone: string
  supportedStoreIds: string
  serviceScope: string
  quoteMode: string
  settlementMode: string
  applicationStatus: string
  status: string
  ratingScore: number
  slaHours: number
  remark: string
  createTime: string
  updateTime: string
}

export type RetouchProviderListQuery = {
  keyword?: string
  applicationStatus?: string
  status?: string
}

export type RetouchProviderPayload = {
  id?: BackendId
  providerCode: string
  providerName: string
  contactName?: string
  contactPhone?: string
  supportedStoreIds?: string
  serviceScope?: string
  quoteMode?: string
  settlementMode?: string
  applicationStatus?: string
  status?: string
  ratingScore?: number
  slaHours?: number
  remark?: string
}

export type CollaborationPolicyDto = {
  id?: BackendId
  tenantId: string
  policyCode: string
  reviewFlowEnabled: string
  productInfoMaskMode: string
  enabledStoreIds: string
  fallbackAction: string
  transferEnabled: string
  autoDispatchMode: string
  genderMakeupEnabled: string
  femaleMakeupRatio: number
  remark: string
  createTime: string
  updateTime: string
}

export type CollaborationPolicyPayload = {
  id?: BackendId
  policyCode?: string
  reviewFlowEnabled?: string
  productInfoMaskMode?: string
  enabledStoreIds?: string
  fallbackAction?: string
  transferEnabled?: string
  autoDispatchMode?: string
  genderMakeupEnabled?: string
  femaleMakeupRatio?: number
  remark?: string
}

export type ServiceLicenseBindingDto = {
  id: BackendId
  tenantId: string
  licenseKey: string
  planName: string
  status: string
  expireTime: string
  boundStoreIds: string
  seatCount: number
  activatedTime: string
  renewAction: string
  remark: string
  createTime: string
  updateTime: string
}

export type ServiceLicenseBindingPayload = {
  id?: BackendId
  licenseKey: string
  planName?: string
  status?: string
  expireTime?: string
  boundStoreIds?: string
  seatCount?: number
  activatedTime?: string
  renewAction?: string
  remark?: string
}
