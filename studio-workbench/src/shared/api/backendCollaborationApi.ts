import { apiRequest } from './request'
import { normalizeBackendId, optionalBackendId, type BackendId } from './backendId'
import type {
  CollaborationLicenseBindStorePayload,
  CollaborationLicenseDto,
  CollaborationLicensePayload,
  CollaborationLicenseStoreBindingDto,
  CollaborationSettingDto,
  CollaborationSettingPayload,
  CollaborationStageCode,
  ProductCollaborationConfigDto,
  ProductCollaborationConfigPayload,
} from './backendTypes'

const parseStageCodes = (workflowJson: string): CollaborationStageCode[] => {
  try {
    const parsed = JSON.parse(workflowJson) as { stageCodes?: unknown }
    return Array.isArray(parsed.stageCodes)
      ? parsed.stageCodes.map(item => String(item) as CollaborationStageCode)
      : []
  } catch {
    return []
  }
}

const parseSwitch = (value: unknown, fallback = false) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    const normalized = value.trim().toUpperCase()
    if (['1', 'TRUE', 'Y', 'YES', 'ON', 'ACTIVE', 'ENABLED'].includes(normalized)) return true
    if (['0', 'FALSE', 'N', 'NO', 'OFF', 'DISABLED'].includes(normalized)) return false
  }
  return fallback
}

const mapSettingRow = (row: Record<string, any>): CollaborationSettingDto => ({
  id: normalizeBackendId(row.id),
  settingType: String(row.settingType ?? 'COMMON') as CollaborationSettingDto['settingType'],
  status: String(row.status ?? 'ACTIVE'),
  configJson: String(row.configJson ?? '{}'),
  remark: String(row.remark ?? ''),
  createTime: String(row.createTime ?? ''),
  updateTime: String(row.updateTime ?? ''),
})

const mapProductConfigRow = (row: Record<string, any>): ProductCollaborationConfigDto => {
  const workflowJson = String(row.workflowJson ?? '{"stageCodes":[]}')
  return {
    id: normalizeBackendId(row.id),
    productId: normalizeBackendId(row.productId),
    storeId: optionalBackendId(row.storeId) ?? null,
    workflowJson,
    stageCodes: parseStageCodes(workflowJson),
    needMakeup: parseSwitch(row.needMakeup),
    needPhotography: parseSwitch(row.needPhotography, true),
    needRetouch: parseSwitch(row.needRetouch),
    needReview: parseSwitch(row.needReview),
    needSelectionReview: parseSwitch(row.needSelectionReview),
    needPickup: parseSwitch(row.needPickup, true),
    makeupCount: Number(row.makeupCount ?? 0),
    deliverWithinHours: Number(row.deliverWithinHours ?? 48),
    status: String(row.status ?? 'ACTIVE'),
    remark: String(row.remark ?? ''),
    createTime: String(row.createTime ?? ''),
    updateTime: String(row.updateTime ?? ''),
  }
}

const mapLicenseStoreRow = (row: Record<string, any>): CollaborationLicenseStoreBindingDto => ({
  id: normalizeBackendId(row.id),
  licenseId: normalizeBackendId(row.licenseId),
  storeId: normalizeBackendId(row.storeId),
  storeName: String(row.storeName ?? ''),
  bindStatus: String(row.bindStatus ?? 'BOUND'),
  boundAt: String(row.boundAt ?? ''),
  unboundAt: String(row.unboundAt ?? ''),
  remark: String(row.remark ?? ''),
})

const mapLicenseRow = (row: Record<string, any>): CollaborationLicenseDto => ({
  id: normalizeBackendId(row.id),
  pluginId: optionalBackendId(row.pluginId) ?? null,
  licenseKey: String(row.licenseKey ?? ''),
  licenseName: String(row.licenseName ?? ''),
  status: String(row.status ?? 'ACTIVE'),
  authStatus: String(row.authStatus ?? 'UNOPENED'),
  enabled: String(row.enabled ?? '0'),
  validFrom: String(row.validFrom ?? ''),
  validTo: String(row.validTo ?? ''),
  seatCount: Number(row.seatCount ?? 0),
  renewAction: String(row.renewAction ?? 'RENEW'),
  remark: String(row.remark ?? ''),
  createTime: String(row.createTime ?? ''),
  updateTime: String(row.updateTime ?? ''),
  boundStores: Array.isArray(row.boundStores) ? row.boundStores.map((item: Record<string, any>) => mapLicenseStoreRow(item)) : [],
})

export const collaborationApi = {
  async getSetting(settingType: CollaborationSettingDto['settingType']) {
    const row = await apiRequest<Record<string, any>>(`/yy/collaboration/setting/${settingType}`)
    return mapSettingRow(row)
  },
  async saveSetting(payload: CollaborationSettingPayload) {
    const row = await apiRequest<Record<string, any>>(`/yy/collaboration/setting/${payload.settingType}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapSettingRow(row)
  },
  async listProductConfigs() {
    const rows = await apiRequest<Record<string, any>[]>('/yy/collaboration/product-config/list')
    return rows.map(mapProductConfigRow)
  },
  async saveProductConfig(productId: BackendId, payload: ProductCollaborationConfigPayload) {
    const row = await apiRequest<Record<string, any>>(`/yy/collaboration/product-config/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapProductConfigRow(row)
  },
  async listLicenses() {
    const rows = await apiRequest<Record<string, any>[]>('/yy/collaboration/license/list')
    return rows.map(mapLicenseRow)
  },
  async saveLicense(payload: CollaborationLicensePayload) {
    const row = await apiRequest<Record<string, any>>('/yy/collaboration/license', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return mapLicenseRow(row)
  },
  async bindLicenseStore(licenseId: BackendId, payload: CollaborationLicenseBindStorePayload) {
    const row = await apiRequest<Record<string, any>>(`/yy/collaboration/license/${licenseId}/bind-store`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapLicenseRow(row)
  },
  async unbindLicenseStore(licenseId: BackendId, storeId: BackendId) {
    const row = await apiRequest<Record<string, any>>(`/yy/collaboration/license/${licenseId}/unbind-store/${storeId}`, {
      method: 'POST',
    })
    return mapLicenseRow(row)
  },
}
