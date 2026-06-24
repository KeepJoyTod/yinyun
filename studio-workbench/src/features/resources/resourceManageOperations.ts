import type { BackendId } from '../../shared/api/backendId'
import type { ResourceManageFilters } from './resourceTypes'

export const resourceTypeLabelMap: Record<string, string> = {
  RAW: '原片',
  PROOF: '样片',
  RETOUCHED: '精修',
  DELIVERY: '交付图',
  OTHER: '其他',
}

export const ratingLabelMap: Record<number, string> = {
  0: '未评星',
  1: '1 星',
  2: '2 星',
  3: '3 星',
  4: '4 星',
  5: '5 星',
}

export const getResourceTypeLabel = (value?: string | null) => resourceTypeLabelMap[String(value ?? '').trim()] || '未分类'

export const getResourceRatingLabel = (value?: number | null) => ratingLabelMap[Number(value ?? 0)] || `${Number(value ?? 0)} 星`

export const getVisibilityLabel = (visible: boolean) => (visible ? '客户可见' : '仅内部')

export const formatFileSize = (bytes?: number | null) => {
  const size = Number(bytes ?? 0)
  if (!Number.isFinite(size) || size <= 0) return '未回填'
  if (size < 1024) return `${size} B`
  if (size < 1024 ** 2) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 ** 3) return `${(size / 1024 ** 2).toFixed(1)} MB`
  return `${(size / 1024 ** 3).toFixed(2)} GB`
}

export const buildResourceEmptyState = (filters: ResourceManageFilters) => {
  const hasFilters = Boolean(
    filters.keyword
    || filters.beginUploadTime
    || filters.endUploadTime
    || filters.storeId
    || filters.albumId
    || filters.orderId
    || filters.productId
    || filters.uploaderKeyword
    || filters.assetType
    || filters.rating
    || filters.tagIds.length
    || filters.visible,
  )
  return hasFilters
    ? {
      title: '当前筛选没有匹配资源',
      hint: '可以先放宽门店、时间、标签或评星条件，再重新加载真实资源列表。',
    }
    : {
      title: '当前还没有资源记录',
      hint: '资源列表直接读取 yy_photo_asset / yy_photo_album，后端无数据时展示真实空态。',
    }
}

export const canRunBatchAction = (selectedIds: BackendId[], payload: {
  assetType?: string
  rating?: number
  visible?: boolean
  tagIdsToAdd?: BackendId[]
  tagIdsToRemove?: BackendId[]
}) => selectedIds.length > 0 && Boolean(
  payload.assetType
  || payload.rating !== undefined
  || payload.visible !== undefined
  || payload.tagIdsToAdd?.length
  || payload.tagIdsToRemove?.length
)
