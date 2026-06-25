import { normalizeBackendId, optionalBackendId, type BackendId } from './backendId'
import { pageQuery } from './backendQueryMappers'
import { apiRequest, apiRequestRaw, type PageResponse } from './request'
import type {
  ResourceBatchUpdatePayload,
  ResourceListQuery,
  ResourceRowDto,
  ResourceSizeBackfillPayload,
  ResourceSizeBackfillResultDto,
  ResourceTagDto,
  ResourceTagListQuery,
  ResourceTagOptionDto,
  ResourceTagPayload,
  ResourceUsageBreakdownDto,
  ResourceUsageSummaryDto,
} from './backendTypes'

type RuoyiTableResponse<T> = {
  rows?: T[]
  total?: number
}

type ResourceTagRow = {
  id?: string | number
  storeId?: string | number | null
  storeName?: string
  tagName?: string
  resourceCount?: string | number
  createBy?: string | number | null
  createTime?: string
}

type ResourceRow = {
  assetId?: string | number
  albumId?: string | number | null
  storeId?: string | number | null
  storeName?: string
  orderId?: string | number | null
  productId?: string | number | null
  productName?: string
  fileName?: string
  fileUrl?: string | null
  thumbnailUrl?: string | null
  assetType?: string
  rating?: string | number
  visible?: boolean | string | number
  fileSizeBytes?: string | number
  tagList?: Array<{ id?: string | number; tagName?: string }>
  customerName?: string
  customerPhoneMasked?: string
  albumName?: string
  uploadedAt?: string
  uploaderId?: string | number | null
  uploaderName?: string
}

type ResourceUsageRow = {
  totalQuotaBytes?: string | number
  usedBytes?: string | number
  remainingBytes?: string | number
  usagePercent?: string | number
  missingSizeCount?: string | number
  cleanupPlanEnabled?: boolean
  cleanupRetentionDays?: string | number
  quotaConfigKey?: string
  cleanupPlanConfigKey?: string
  cleanupRetentionConfigKey?: string
  typeBreakdown?: Array<{
    assetType?: string
    assetCount?: string | number
    totalBytes?: string | number
  }>
}

type ResourceSizeBackfillRow = {
  attemptedCount?: string | number
  updatedCount?: string | number
  skippedCount?: string | number
  failedCount?: string | number
  remainingMissingSizeCount?: string | number
  message?: string
}

const toNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return 0
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

const toBoolean = (value: unknown) => value === true || value === '1' || value === 1 || value === 'true'

const mapTagOption = (row: { id?: string | number; tagName?: string }): ResourceTagOptionDto => ({
  id: normalizeBackendId(row.id),
  tagName: String(row.tagName ?? ''),
})

const mapTagRow = (row: ResourceTagRow): ResourceTagDto => ({
  id: normalizeBackendId(row.id),
  storeId: optionalBackendId(row.storeId) ?? null,
  storeName: String(row.storeName ?? ''),
  tagName: String(row.tagName ?? ''),
  resourceCount: toNumber(row.resourceCount),
  createBy: optionalBackendId(row.createBy) ?? null,
  createTime: String(row.createTime ?? ''),
})

const mapResourceRow = (row: ResourceRow): ResourceRowDto => ({
  assetId: normalizeBackendId(row.assetId),
  albumId: optionalBackendId(row.albumId) ?? null,
  storeId: optionalBackendId(row.storeId) ?? null,
  storeName: String(row.storeName ?? ''),
  orderId: optionalBackendId(row.orderId) ?? null,
  productId: optionalBackendId(row.productId) ?? null,
  productName: String(row.productName ?? ''),
  fileName: String(row.fileName ?? ''),
  fileUrl: row.fileUrl ? String(row.fileUrl) : null,
  thumbnailUrl: row.thumbnailUrl ? String(row.thumbnailUrl) : null,
  assetType: String(row.assetType ?? ''),
  rating: toNumber(row.rating),
  visible: toBoolean(row.visible),
  fileSizeBytes: toNumber(row.fileSizeBytes),
  tagList: Array.isArray(row.tagList) ? row.tagList.filter(item => item?.id !== undefined).map(mapTagOption) : [],
  customerName: String(row.customerName ?? ''),
  customerPhoneMasked: String(row.customerPhoneMasked ?? ''),
  albumName: String(row.albumName ?? ''),
  uploadedAt: String(row.uploadedAt ?? ''),
  uploaderId: optionalBackendId(row.uploaderId) ?? null,
  uploaderName: String(row.uploaderName ?? ''),
})

const mapUsageBreakdown = (row: { assetType?: string; assetCount?: string | number; totalBytes?: string | number }): ResourceUsageBreakdownDto => ({
  assetType: String(row.assetType ?? ''),
  assetCount: toNumber(row.assetCount),
  totalBytes: toNumber(row.totalBytes),
})

const mapUsageSummary = (row: ResourceUsageRow): ResourceUsageSummaryDto => ({
  totalQuotaBytes: toNumber(row.totalQuotaBytes),
  usedBytes: toNumber(row.usedBytes),
  remainingBytes: toNumber(row.remainingBytes),
  usagePercent: toNumber(row.usagePercent),
  missingSizeCount: toNumber(row.missingSizeCount),
  cleanupPlanEnabled: Boolean(row.cleanupPlanEnabled),
  cleanupRetentionDays: toNumber(row.cleanupRetentionDays),
  quotaConfigKey: String(row.quotaConfigKey ?? ''),
  cleanupPlanConfigKey: String(row.cleanupPlanConfigKey ?? ''),
  cleanupRetentionConfigKey: String(row.cleanupRetentionConfigKey ?? ''),
  typeBreakdown: Array.isArray(row.typeBreakdown) ? row.typeBreakdown.map(mapUsageBreakdown) : [],
})

const mapSizeBackfillResult = (row: ResourceSizeBackfillRow): ResourceSizeBackfillResultDto => ({
  attemptedCount: toNumber(row.attemptedCount),
  updatedCount: toNumber(row.updatedCount),
  skippedCount: toNumber(row.skippedCount),
  failedCount: toNumber(row.failedCount),
  remainingMissingSizeCount: toNumber(row.remainingMissingSizeCount),
  message: String(row.message ?? ''),
})

const joinIds = (value?: BackendId[]) => value?.length ? value.join(',') : undefined

export const resourcesApi = {
  async listResources(query: ResourceListQuery = {}): Promise<PageResponse<ResourceRowDto>> {
    const response = await apiRequestRaw<RuoyiTableResponse<ResourceRow>>('/yy/photoAsset/resource-list', {}, {
      ...pageQuery,
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 200,
      keyword: query.keyword,
      beginUploadTime: query.beginUploadTime,
      endUploadTime: query.endUploadTime,
      storeId: query.storeId,
      albumId: query.albumId,
      orderId: query.orderId,
      productId: query.productId,
      uploaderId: query.uploaderId,
      uploaderKeyword: query.uploaderKeyword,
      assetType: query.assetType,
      rating: query.rating,
      tagIds: joinIds(query.tagIds),
      visible: query.visible === undefined ? undefined : (query.visible ? '1' : '0'),
    })
    const items = (response.rows ?? []).map(mapResourceRow)
    return {
      items,
      page: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 200,
      total: Number(response.total ?? items.length),
    }
  },
  batchUpdateResources(payload: ResourceBatchUpdatePayload) {
    return apiRequest<void>('/yy/photoAsset/batch-update', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  async listResourceTags(query: ResourceTagListQuery = {}): Promise<PageResponse<ResourceTagDto>> {
    const response = await apiRequestRaw<RuoyiTableResponse<ResourceTagRow>>('/yy/photoTag/list', {}, {
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 200,
      keyword: query.keyword,
      storeId: query.storeId,
    })
    const items = (response.rows ?? []).map(mapTagRow)
    return {
      items,
      page: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 200,
      total: Number(response.total ?? items.length),
    }
  },
  createResourceTag(payload: ResourceTagPayload) {
    return apiRequest<void>('/yy/photoTag', {
      method: 'POST',
      body: JSON.stringify({
        storeId: payload.storeId,
        tagName: payload.tagName,
      }),
    })
  },
  updateResourceTag(payload: ResourceTagPayload) {
    return apiRequest<void>('/yy/photoTag', {
      method: 'PUT',
      body: JSON.stringify({
        id: payload.id,
        storeId: payload.storeId ?? null,
        tagName: payload.tagName,
      }),
    })
  },
  deleteResourceTag(id: BackendId) {
    return apiRequest<void>(`/yy/photoTag/${id}`, { method: 'DELETE' })
  },
  deleteResource(id: BackendId) {
    return apiRequest<void>(`/yy/photoAsset/${id}`, { method: 'DELETE' })
  },
  async getResourceUsageSummary() {
    const response = await apiRequest<ResourceUsageRow>('/yy/photoAsset/usage-summary')
    return mapUsageSummary(response)
  },
  async backfillResourceSizes(payload: ResourceSizeBackfillPayload = {}) {
    const response = await apiRequest<ResourceSizeBackfillRow>('/yy/photoAsset/size-backfill', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return mapSizeBackfillResult(response)
  },
}
