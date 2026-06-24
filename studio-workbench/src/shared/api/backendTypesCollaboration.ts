import type { BackendId } from './backendId'

export type CollaborationStageCode =
  | 'RECEPTION'
  | 'MAKEUP'
  | 'PHOTOGRAPHY'
  | 'RETOUCH'
  | 'REVIEW'
  | 'SELECTION_REVIEW'
  | 'PICKUP'

export type CollaborationSettingType = 'POSITION' | 'COMMON' | 'RETOUCH_CENTER'

export type CollaborationPositionConfigItemDto = {
  code: CollaborationStageCode
  label: string
  enabled: boolean
  sort: number
  roleType: string
  slaHours: number
  autoAssign: boolean
}

export type CollaborationSettingDto = {
  id: BackendId
  settingType: CollaborationSettingType
  status: string
  configJson: string
  remark: string
  createTime: string
  updateTime: string
}

export type CollaborationSettingPayload = {
  id?: BackendId
  settingType: CollaborationSettingType
  status?: string
  configJson: string
  remark?: string
}

export type ProductCollaborationConfigDto = {
  id: BackendId
  productId: BackendId
  storeId: BackendId | null
  workflowJson: string
  stageCodes: CollaborationStageCode[]
  needMakeup: boolean
  needPhotography: boolean
  needRetouch: boolean
  needReview: boolean
  needSelectionReview: boolean
  needPickup: boolean
  makeupCount: number
  deliverWithinHours: number
  status: string
  remark: string
  createTime: string
  updateTime: string
}

export type ProductCollaborationConfigPayload = {
  id?: BackendId
  productId: BackendId
  workflowJson: string
  needMakeup: boolean
  needPhotography: boolean
  needRetouch: boolean
  needReview: boolean
  needSelectionReview: boolean
  needPickup: boolean
  makeupCount: number
  deliverWithinHours: number
  status?: string
  remark?: string
}

export type CollaborationLicenseStoreBindingDto = {
  id: BackendId
  licenseId: BackendId
  storeId: BackendId
  storeName: string
  bindStatus: string
  boundAt: string
  unboundAt: string
  remark: string
}

export type CollaborationLicenseDto = {
  id: BackendId
  pluginId: BackendId | null
  licenseKey: string
  licenseName: string
  authStatus: string
  enabled: string
  validFrom: string
  validTo: string
  seatCount: number
  remark: string
  createTime: string
  updateTime: string
  boundStores: CollaborationLicenseStoreBindingDto[]
}

export type CollaborationLicensePayload = {
  id?: BackendId
  pluginId?: BackendId | null
  licenseKey: string
  licenseName: string
  authStatus?: string
  enabled?: string
  validFrom?: string
  validTo?: string
  seatCount?: number
  remark?: string
}

export type CollaborationLicenseBindStorePayload = {
  storeId: BackendId
  remark?: string
}
