import type {
  CollaborationPositionConfigItemDto,
  CollaborationStageCode,
  ProductCollaborationConfigDto,
} from '../../shared/api/backend'

export type CommonCollaborationConfig = {
  autoCompleteAfterAllWorkOrders: boolean
  autoDispatchOnArrival: boolean
  enabledStoreMode: 'ALL' | 'PARTIAL' | 'DISABLED'
  enabledStoreIds: string[]
  genderMakeupSplit: boolean
  maleMakeupRatio: number
}

export type RetouchCenterConfig = {
  reviewFlowEnabled: boolean
  hideProductInfoMode: 'NONE' | 'PHOTO_ONLY' | 'ALL'
  dispatchTransferEnabled: boolean
  sameStoreOnly: boolean
}

export type CollaborationLicenseDraft = {
  licenseKey: string
  licenseName: string
  authStatus: string
  enabled: string
  validFrom: string
  validTo: string
  seatCount: number
  remark: string
}

export const collaborationStageOptions: Array<{ code: CollaborationStageCode; label: string }> = [
  { code: 'RECEPTION', label: '接待' },
  { code: 'MAKEUP', label: '化妆' },
  { code: 'PHOTOGRAPHY', label: '摄影' },
  { code: 'RETOUCH', label: '修图' },
  { code: 'REVIEW', label: '审片' },
  { code: 'SELECTION_REVIEW', label: '看片' },
  { code: 'PICKUP', label: '取件' },
]

export const defaultPositionConfig = (): CollaborationPositionConfigItemDto[] => [
  { code: 'RECEPTION', label: '接待', enabled: true, sort: 10, roleType: 'RECEPTION', slaHours: 2, autoAssign: true },
  { code: 'MAKEUP', label: '化妆', enabled: true, sort: 20, roleType: 'MAKEUP', slaHours: 2, autoAssign: false },
  { code: 'PHOTOGRAPHY', label: '摄影', enabled: true, sort: 30, roleType: 'PHOTOGRAPHY', slaHours: 4, autoAssign: false },
  { code: 'RETOUCH', label: '修图', enabled: true, sort: 40, roleType: 'RETOUCH', slaHours: 48, autoAssign: false },
  { code: 'REVIEW', label: '审片', enabled: true, sort: 50, roleType: 'REVIEW', slaHours: 24, autoAssign: false },
  { code: 'SELECTION_REVIEW', label: '看片', enabled: true, sort: 60, roleType: 'SELECTION_REVIEW', slaHours: 24, autoAssign: false },
  { code: 'PICKUP', label: '取件', enabled: true, sort: 70, roleType: 'PICKUP', slaHours: 24, autoAssign: false },
]

export const defaultCommonConfig = (): CommonCollaborationConfig => ({
  autoCompleteAfterAllWorkOrders: true,
  autoDispatchOnArrival: false,
  enabledStoreMode: 'ALL',
  enabledStoreIds: [],
  genderMakeupSplit: false,
  maleMakeupRatio: 1,
})

export const defaultRetouchCenterConfig = (): RetouchCenterConfig => ({
  reviewFlowEnabled: true,
  hideProductInfoMode: 'NONE',
  dispatchTransferEnabled: true,
  sameStoreOnly: false,
})

export const defaultLicenseDraft = (): CollaborationLicenseDraft => ({
  licenseKey: '',
  licenseName: '内部协作许可证',
  authStatus: 'AUTHORIZED',
  enabled: '1',
  validFrom: '',
  validTo: '',
  seatCount: 1,
  remark: '',
})

export const parseJson = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export const stringifyJson = (value: unknown) => JSON.stringify(value, null, 2)

export const buildDefaultWorkflowJson = (config?: ProductCollaborationConfigDto | null) => stringifyJson({
  stageCodes: config?.stageCodes?.length ? config.stageCodes : ['RECEPTION', 'PHOTOGRAPHY', 'RETOUCH', 'PICKUP'],
})
