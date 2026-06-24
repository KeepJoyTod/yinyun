import type {
  BackendId,
  CollaborationPolicyDto,
  CollaborationPolicyPayload,
  RetouchProviderDto,
  RetouchProviderPayload,
  ServiceLicenseBindingDto,
  ServiceLicenseBindingPayload,
} from '../../shared/api/backend'

export type PolicyDraft = {
  id?: BackendId
  policyCode: string
  reviewFlowEnabled: boolean
  productInfoMaskMode: string
  enabledStoreIds: BackendId[]
  fallbackAction: string
  transferEnabled: boolean
  autoDispatchMode: string
  genderMakeupEnabled: boolean
  femaleMakeupRatio: number
  remark: string
}

export type RetouchProviderDraft = {
  id?: BackendId
  providerCode: string
  providerName: string
  contactName: string
  contactPhone: string
  supportedStoreIds: BackendId[]
  serviceScope: string
  quoteMode: string
  settlementMode: string
  applicationStatus: string
  status: string
  ratingScore: number
  slaHours: number
  remark: string
}

export type LicenseDraft = {
  id?: BackendId
  licenseKey: string
  planName: string
  status: string
  expireTime: string
  boundStoreIds: BackendId[]
  seatCount: number
  activatedTime: string
  renewAction: string
  remark: string
}

export const retouchTaskStatusOptions = [
  { value: 'WAIT_ASSIGN', label: '待派单' },
  { value: 'WAIT_ACCEPTANCE', label: '待接单' },
  { value: 'IN_PROGRESS', label: '修图中' },
  { value: 'WAIT_REVIEW', label: '待审片' },
  { value: 'COMPLETED', label: '已完成' },
  { value: 'BLOCKED', label: '阻塞' },
]

export const acceptanceStatusOptions = [
  { value: 'PENDING', label: '待验收' },
  { value: 'ACCEPTED', label: '已验收' },
]

export const providerApplicationStatusOptions = [
  { value: 'PENDING', label: '待审核' },
  { value: 'APPROVED', label: '已通过' },
  { value: 'REJECTED', label: '已驳回' },
]

export const providerStatusOptions = [
  { value: 'ACTIVE', label: '可接单' },
  { value: 'PAUSED', label: '暂停合作' },
]

export const quoteModeOptions = [
  { value: 'PER_PHOTO', label: '按张报价' },
  { value: 'PER_ALBUM', label: '按相册报价' },
]

export const settlementModeOptions = [
  { value: 'MONTHLY', label: '月结' },
  { value: 'PER_ORDER', label: '单结' },
]

export const productMaskModeOptions = [
  { value: 'MASK_PHOTO_ONLY', label: '只隐藏照片' },
  { value: 'MASK_ALL', label: '隐藏全部产品信息' },
  { value: 'NONE', label: '不隐藏' },
]

export const fallbackActionOptions = [
  { value: 'RETURN_TO_STORE', label: '异常退回门店' },
  { value: 'MANUAL_ESCALATION', label: '升级人工处理' },
]

export const autoDispatchModeOptions = [
  { value: 'STORE_ONLY', label: '仅门店自动派单' },
  { value: 'CENTRAL_FIRST', label: '中央修图优先' },
  { value: 'MANUAL_ONLY', label: '仅人工派单' },
]

export const licenseStatusOptions = [
  { value: 'ACTIVE', label: '生效中' },
  { value: 'SUSPENDED', label: '暂停中' },
  { value: 'EXPIRED', label: '已过期' },
]

export const renewActionOptions = [
  { value: 'RENEW', label: '自动续期' },
  { value: 'CONTACT_SALES', label: '联系续费' },
  { value: 'STOP', label: '到期停用' },
]

export const splitBackendIds = (csv: string) =>
  csv
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)

export const joinBackendIds = (ids: BackendId[]) =>
  Array.from(new Set(ids.map(String))).filter(Boolean).join(',')

export const formatMoneyCent = (amountCent: number) => `¥${(amountCent / 100).toFixed(2)}`

export const formatDateTime = (value: string) => {
  if (!value) return '未设置'
  return value.replace('T', ' ').slice(0, 16)
}

export const toLocalDateTimeInput = (value: string) => {
  if (!value) return ''
  return value.replace(' ', 'T').slice(0, 16)
}

export const fromLocalDateTimeInput = (value: string) => {
  if (!value) return ''
  return value.length === 16 ? `${value.replace('T', ' ')}:00` : value.replace('T', ' ')
}

export const createPolicyDraft = (policy?: Partial<CollaborationPolicyDto>): PolicyDraft => ({
  id: policy?.id,
  policyCode: policy?.policyCode || 'DEFAULT',
  reviewFlowEnabled: String(policy?.reviewFlowEnabled ?? '1') === '1',
  productInfoMaskMode: policy?.productInfoMaskMode || 'MASK_PHOTO_ONLY',
  enabledStoreIds: splitBackendIds(policy?.enabledStoreIds || ''),
  fallbackAction: policy?.fallbackAction || 'RETURN_TO_STORE',
  transferEnabled: String(policy?.transferEnabled ?? '1') === '1',
  autoDispatchMode: policy?.autoDispatchMode || 'STORE_ONLY',
  genderMakeupEnabled: String(policy?.genderMakeupEnabled ?? '0') === '1',
  femaleMakeupRatio: Number(policy?.femaleMakeupRatio ?? 1.5),
  remark: policy?.remark || '',
})

export const toPolicyPayload = (draft: PolicyDraft): CollaborationPolicyPayload => ({
  id: draft.id,
  policyCode: draft.policyCode,
  reviewFlowEnabled: draft.reviewFlowEnabled ? '1' : '0',
  productInfoMaskMode: draft.productInfoMaskMode,
  enabledStoreIds: joinBackendIds(draft.enabledStoreIds),
  fallbackAction: draft.fallbackAction,
  transferEnabled: draft.transferEnabled ? '1' : '0',
  autoDispatchMode: draft.autoDispatchMode,
  genderMakeupEnabled: draft.genderMakeupEnabled ? '1' : '0',
  femaleMakeupRatio: draft.femaleMakeupRatio,
  remark: draft.remark,
})

export const createRetouchProviderDraft = (provider?: Partial<RetouchProviderDto>): RetouchProviderDraft => ({
  id: provider?.id,
  providerCode: provider?.providerCode || '',
  providerName: provider?.providerName || '',
  contactName: provider?.contactName || '',
  contactPhone: provider?.contactPhone || '',
  supportedStoreIds: splitBackendIds(provider?.supportedStoreIds || ''),
  serviceScope: provider?.serviceScope || '证件照,写真,精修客片',
  quoteMode: provider?.quoteMode || 'PER_PHOTO',
  settlementMode: provider?.settlementMode || 'MONTHLY',
  applicationStatus: provider?.applicationStatus || 'PENDING',
  status: provider?.status || 'ACTIVE',
  ratingScore: Number(provider?.ratingScore ?? 5),
  slaHours: Number(provider?.slaHours ?? 24),
  remark: provider?.remark || '',
})

export const toRetouchProviderPayload = (draft: RetouchProviderDraft): RetouchProviderPayload => ({
  id: draft.id,
  providerCode: draft.providerCode.trim(),
  providerName: draft.providerName.trim(),
  contactName: draft.contactName.trim(),
  contactPhone: draft.contactPhone.trim(),
  supportedStoreIds: joinBackendIds(draft.supportedStoreIds),
  serviceScope: draft.serviceScope.trim(),
  quoteMode: draft.quoteMode,
  settlementMode: draft.settlementMode,
  applicationStatus: draft.applicationStatus,
  status: draft.status,
  ratingScore: draft.ratingScore,
  slaHours: draft.slaHours,
  remark: draft.remark.trim(),
})

export const createLicenseDraft = (license?: Partial<ServiceLicenseBindingDto>): LicenseDraft => ({
  id: license?.id,
  licenseKey: license?.licenseKey || '',
  planName: license?.planName || '协作套件许可证',
  status: license?.status || 'ACTIVE',
  expireTime: toLocalDateTimeInput(license?.expireTime || ''),
  boundStoreIds: splitBackendIds(license?.boundStoreIds || ''),
  seatCount: Number(license?.seatCount ?? 1),
  activatedTime: toLocalDateTimeInput(license?.activatedTime || ''),
  renewAction: license?.renewAction || 'RENEW',
  remark: license?.remark || '',
})

export const toLicensePayload = (draft: LicenseDraft): ServiceLicenseBindingPayload => ({
  id: draft.id,
  licenseKey: draft.licenseKey.trim(),
  planName: draft.planName.trim(),
  status: draft.status,
  expireTime: fromLocalDateTimeInput(draft.expireTime),
  boundStoreIds: joinBackendIds(draft.boundStoreIds),
  seatCount: draft.seatCount,
  activatedTime: fromLocalDateTimeInput(draft.activatedTime),
  renewAction: draft.renewAction,
  remark: draft.remark.trim(),
})
