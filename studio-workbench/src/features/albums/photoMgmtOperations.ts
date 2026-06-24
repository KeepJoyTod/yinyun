import type { Album } from '../../shared/stores/appStore'

export type PhotoItem = {
  key: string
  id: string
  url: string
  name: string
  selected: boolean
  isNegative: boolean
}

export type ThumbnailSetInput = {
  photos: PhotoItem[]
  selectedIds: Set<string>
  failedIds: Set<string>
  loadingIds: Set<string>
}

export type UploadErrorDetail = {
  albumId: string
  storeId: string
  fileName: string
  stage: string
  message: string
  ossId: string
  objectKey: string
}

export type UploadFailureSummary = {
  fileName: string
  stage: string
  message: string
  detail: UploadErrorDetail
}

export type PhotoSelectionUpdateTarget = {
  photoId: string
  selected: boolean
}

export type AlbumActionKey = 'notify' | 'confirm' | 'deliver'

export type AlbumActionAvailabilityItem = {
  enabled: boolean
  reason: string
}

export type AlbumActionAvailability = Record<AlbumActionKey, AlbumActionAvailabilityItem>

const allowAlbumAction = (): AlbumActionAvailabilityItem => ({ enabled: true, reason: '' })
const blockAlbumAction = (reason: string): AlbumActionAvailabilityItem => ({ enabled: false, reason })

export const albumProgress = (album: { selectedCount: number; totalCount: number }) => {
  if (!album.totalCount) return 0
  return Math.min(100, Math.round((album.selectedCount / album.totalCount) * 100))
}

export const albumNextStep = (album: { totalCount: number; negatives: unknown[]; selectedCount: number; status: string }) => {
  if (album.totalCount === 0 || album.negatives.length === 0) return '等待上传'
  if (album.selectedCount === 0) return '待发链接'
  if (album.status === '已交付') return '已归档'
  return '跟进选片'
}

export const buildAlbumActionAvailability = (
  album: Pick<Album, 'totalCount' | 'selectedCount' | 'negatives' | 'status'> | null | undefined,
): AlbumActionAvailability => {
  if (!album) {
    const reason = '请先选择相册'
    return {
      notify: blockAlbumAction(reason),
      confirm: blockAlbumAction(reason),
      deliver: blockAlbumAction(reason),
    }
  }

  const hasPhotos = album.totalCount > 0 && (album.negatives?.length ?? 0) > 0
  if (!hasPhotos) {
    const reason = '请先上传底片'
    return {
      notify: blockAlbumAction(reason),
      confirm: blockAlbumAction(reason),
      deliver: blockAlbumAction(reason),
    }
  }

  if (album.status === '已交付') {
    return {
      notify: allowAlbumAction(),
      confirm: blockAlbumAction('已交付无需重复确认'),
      deliver: blockAlbumAction('已交付无需重复发送'),
    }
  }

  if (album.selectedCount <= 0) {
    return {
      notify: allowAlbumAction(),
      confirm: blockAlbumAction('请先等待客户选片'),
      deliver: blockAlbumAction('请先等待客户选片'),
    }
  }

  return {
    notify: allowAlbumAction(),
    confirm: allowAlbumAction(),
    deliver: allowAlbumAction(),
  }
}

export const buildPhotoItems = (album: Album | null | undefined): PhotoItem[] => {
  if (!album) return []
  const negatives = album.negatives ?? []
  return negatives.map(negative => ({
    key: negative.id,
    id: negative.id,
    url: negative.url,
    name: negative.name,
    selected: negative.selected,
    isNegative: true,
  }))
}

export const computeMarkedSelectedCount = (photos: PhotoItem[], selectedIds: Set<string>) =>
  photos.filter(photo => selectedIds.has(photo.id)).length

export const updateAlbumSelectedCount = (
  currentSelectedCount: number,
  photos: PhotoItem[],
  selectedIds: Set<string>,
  selected: boolean,
) => {
  const selectedCount = computeMarkedSelectedCount(photos, selectedIds)
  return selected
    ? Math.max(currentSelectedCount, selectedCount)
    : Math.max(0, currentSelectedCount - selectedCount)
}

export const buildPhotoSelectionUpdateTargets = (
  photos: PhotoItem[],
  selectedIds: Set<string>,
  selected: boolean,
): PhotoSelectionUpdateTarget[] =>
  photos
    .filter(photo => selectedIds.has(photo.id) && photo.selected !== selected)
    .map(photo => ({ photoId: photo.id, selected }))

export const getNextThumbnailSets = ({ photos, selectedIds, failedIds, loadingIds }: ThumbnailSetInput) => {
  const visibleIds = new Set(photos.map(photo => photo.id))
  const nextSelectedIds = new Set([...selectedIds].filter(id => visibleIds.has(id)))
  const nextFailedIds = new Set([...failedIds].filter(id => visibleIds.has(id)))
  const nextLoadingIds = new Set([...loadingIds].filter(id => visibleIds.has(id)))

  for (const photo of photos) {
    if (photo.url && !nextFailedIds.has(photo.id)) nextLoadingIds.add(photo.id)
  }

  return {
    selectedIds: nextSelectedIds,
    failedIds: nextFailedIds,
    loadingIds: nextLoadingIds,
  }
}

const safeString = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return String(value)
}

export const buildUploadErrorDetail = (params: {
  albumId: string
  storeId: string
  fileName: string
  stage: string
  message: string
  ossId?: string | number
  objectKey?: string
}): UploadErrorDetail => ({
  albumId: safeString(params.albumId),
  storeId: safeString(params.storeId),
  fileName: safeString(params.fileName),
  stage: safeString(params.stage),
  message: safeString(params.message),
  ossId: safeString(params.ossId),
  objectKey: safeString(params.objectKey),
})

export const formatUploadErrorForCopy = (detail: UploadErrorDetail): string => {
  const pairs = [
    `albumId=${detail.albumId}`,
    `storeId=${detail.storeId}`,
    `fileName=${detail.fileName}`,
    `stage=${detail.stage}`,
    `message=${detail.message}`,
    `ossId=${detail.ossId}`,
    `objectKey=${detail.objectKey}`,
  ]
  return `[客片上传失败]\n${pairs.join('\n')}`
}

export const parseUploadErrorMessage = (message: string): UploadFailureSummary | null => {
  const prefix = '[UPLOAD_ERROR] '
  if (!message.startsWith(prefix)) return null
  const payload = message.slice(prefix.length)
  const detail: Record<string, string> = {}
  for (const line of payload.split('\n')) {
    const eqIndex = line.indexOf('=')
    if (eqIndex === -1) continue
    const key = line.slice(0, eqIndex)
    const value = line.slice(eqIndex + 1)
    detail[key] = value
  }
  return {
    fileName: detail.fileName ?? '',
    stage: detail.stage ?? '',
    message: detail.message ?? '',
    detail: {
      albumId: detail.albumId ?? '',
      storeId: detail.storeId ?? '',
      fileName: detail.fileName ?? '',
      stage: detail.stage ?? '',
      message: detail.message ?? '',
      ossId: detail.ossId ?? '',
      objectKey: detail.objectKey ?? '',
    },
  }
}

export type PhotoAccessLogRow = {
  action: string
  platform: string
  happenedAt: string
  ip: string
  success: string
}

export const summarizePhotoAccessLogs = (logs: {
  action: string
  platform: string
  happenedAt?: string
  remark: string
  ip?: string
  customerPhone?: string
  success?: string
}[]): PhotoAccessLogRow[] => {
  if (!logs.length) return []
  return logs.map(log => ({
    action: log.action,
    platform: log.platform || '未知平台',
    happenedAt: log.happenedAt || log.remark || '时间未知',
    ip: '已脱敏',
    success: log.success === '0' || log.success === 'false' ? '失败' : '成功',
  }))
}

export const buildPhotoAccessEmptyHint = (hasBackend: boolean) => {
  if (!hasBackend) return '访问日志接口未接入，接入 yy_photo_access_log 后展示客户浏览、下载和失败访问记录。'
  return '当前相册没有访问记录；客户浏览或下载后，日志会实时出现在这里。'
}
