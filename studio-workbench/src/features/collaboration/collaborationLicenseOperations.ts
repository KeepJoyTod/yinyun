import type { BackendId, CollaborationLicenseDto, CollaborationLicensePayload } from '../../shared/api/backend'

export type CollaborationOpenLicenseDraft = {
  id?: BackendId
  licenseKey: string
  licenseName: string
  status: string
  validFrom: string
  validTo: string
  seatCount: number
  renewAction: string
  remark: string
  boundStoreIds: BackendId[]
}

export const collaborationLicenseStatusOptions = [
  { value: 'ACTIVE', label: '生效中' },
  { value: 'SUSPENDED', label: '暂停中' },
  { value: 'EXPIRED', label: '已过期' },
]

export const collaborationRenewActionOptions = [
  { value: 'RENEW', label: '自动续期' },
  { value: 'CONTACT_SALES', label: '联系续费' },
  { value: 'STOP', label: '到期停用' },
]

export const toLocalDateTimeInput = (value: string) => {
  if (!value) return ''
  return value.replace(' ', 'T').slice(0, 16)
}

export const fromLocalDateTimeInput = (value: string) => {
  if (!value) return ''
  return value.length === 16 ? `${value.replace('T', ' ')}:00` : value.replace('T', ' ')
}

const uniqueBackendIds = (ids: Array<string | number | null | undefined>) =>
  Array.from(new Set(ids.map(item => String(item ?? '').trim()).filter(Boolean)))

export const createCollaborationLicenseDraft = (
  license?: Partial<CollaborationLicenseDto> | null,
): CollaborationOpenLicenseDraft => ({
  id: license?.id,
  licenseKey: license?.licenseKey || '',
  licenseName: license?.licenseName || '内部协作许可证',
  status: license?.status || 'ACTIVE',
  validFrom: toLocalDateTimeInput(license?.validFrom || ''),
  validTo: toLocalDateTimeInput(license?.validTo || ''),
  seatCount: Number(license?.seatCount ?? 1),
  renewAction: license?.renewAction || 'RENEW',
  remark: license?.remark || '',
  boundStoreIds: uniqueBackendIds((license?.boundStores ?? []).map(item => item.storeId)) as BackendId[],
})

export const toCollaborationLicensePayload = (
  draft: CollaborationOpenLicenseDraft,
): CollaborationLicensePayload => ({
  id: draft.id,
  licenseKey: draft.licenseKey.trim(),
  licenseName: draft.licenseName.trim(),
  status: draft.status,
  authStatus: draft.status,
  enabled: draft.status === 'SUSPENDED' ? '0' : '1',
  validFrom: fromLocalDateTimeInput(draft.validFrom),
  validTo: fromLocalDateTimeInput(draft.validTo),
  seatCount: draft.seatCount,
  renewAction: draft.renewAction,
  remark: draft.remark.trim(),
})
