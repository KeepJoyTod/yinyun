import { apiRequest, apiRequestRaw } from './request'
import { normalizeBackendId, type BackendId } from './backendId'
import { pageQuery } from './backendQueryMappers'
import { mapPhotoAccessLogRow } from './backendRowMappers'
import {
  buildSelectionLinksFromAlbums,
  buildSelectionStats,
  buildYyPhotoAssetFormFromOss,
  extractRuoyiRows,
  mapYyAlbum,
  mapYyPhotoAsset,
  resolveNextAssetSort,
  type OssVo,
  type RuoyiTableResponse,
  type YyPhotoAlbumVo,
  type YyPhotoAssetVo,
} from './yingyueAdapter'
import type { AlbumDto, AlbumPhotoDto, OrderDto, PhotoAccessLog, PhotoAccessLogQuery } from './backendTypes'

type RuoyiResponse<T> = {
  code?: number
  msg?: string
  data?: T
}

type OssUploadData = {
  ossId?: string | number
  fileName?: string
  url?: string
}

export type PhotoAlbumActionPayload = {
  channelType?: string
  receiver?: string
  remark?: string
  orderId?: BackendId
  albumId?: BackendId
}

export type PhotoAlbumActionDto = {
  albumId: BackendId
  action: string
  status: string
  selectionStatus: string
  auditStatus: string
  fallback: boolean
  notificationChannel: string
  notificationSendStatus: string
  requestId: string
  message: string
}

type AlbumsApiOptions = {
  getCachedOrders: () => OrderDto[]
}

let cachedAlbumSources: YyPhotoAlbumVo[] = []
let cachedAssets: AlbumPhotoDto[] = []
let cachedAlbums: AlbumDto[] = []
let cachedPhotoAccessLogs: PhotoAccessLog[] = []

const sameId = (left: string | number | undefined | null, right: string | number | undefined | null) =>
  String(left ?? '') === String(right ?? '')

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const getData = async <T>(path: string) => {
  const response = await apiRequestRaw<RuoyiResponse<T>>(path)
  if (!response.data) throw new Error(`Empty response data: ${path}`)
  return response.data
}

const buildYyPhotoAssetUploadError = (params: {
  albumId: string
  storeId: string
  fileName: string
  stage: string
  message: string
  ossId?: string | number
  objectKey?: string
}): string => {
  const safe = (v: unknown) => (v === null || v === undefined ? '' : String(v))
  const detailLines = [
    `albumId=${safe(params.albumId)}`,
    `storeId=${safe(params.storeId)}`,
    `fileName=${safe(params.fileName)}`,
    `stage=${safe(params.stage)}`,
    `message=${safe(params.message)}`,
    `ossId=${safe(params.ossId)}`,
    `objectKey=${safe(params.objectKey)}`,
  ]
  return `[UPLOAD_ERROR] ${detailLines.join('\n')}`
}

const findAlbumSource = async (albumId: BackendId) =>
  cachedAlbumSources.find(item => sameId(item.id, albumId)) ?? await getData<YyPhotoAlbumVo>(`/yy/photoAlbum/${albumId}`)

const resolveOssById = async (ossId: string | number, fallbackUrl?: string) => {
  const response = await apiRequestRaw<RuoyiResponse<OssVo[]>>(`/resource/oss/listByIds/${ossId}`)
  const oss = response.data?.[0]
  if (!oss?.fileName) {
    throw new Error('OSS Key 获取失败，请检查 system:oss:query 权限或 OSS 记录')
  }
  return {
    ...oss,
    url: oss.url || fallbackUrl,
  }
}

const refreshAlbumAssetCache = async (album: YyPhotoAlbumVo, albumId: BackendId, orders: OrderDto[]) => {
  const latestRows = await listRows<YyPhotoAssetVo>('/yy/photoAsset/list', { albumId })
  const latestAssets = latestRows.map(mapYyPhotoAsset)
  cachedAssets = [
    ...cachedAssets.filter(asset => !sameId(asset.albumId, albumId)),
    ...latestAssets,
  ]
  const nextAlbum = mapYyAlbum(album, cachedAssets, orders)
  const index = cachedAlbums.findIndex(item => sameId(item.id, albumId))
  if (index === -1) cachedAlbums = [nextAlbum, ...cachedAlbums]
  else cachedAlbums[index] = nextAlbum
  return { rows: latestRows, assets: latestAssets }
}

export const createAlbumsApi = ({ getCachedOrders }: AlbumsApiOptions) => ({
  async listAlbums() {
    const [albums, assets] = await Promise.all([
      listRows<YyPhotoAlbumVo>('/yy/photoAlbum/list'),
      listRows<YyPhotoAssetVo>('/yy/photoAsset/list'),
    ])
    cachedAlbumSources = albums
    cachedAssets = assets.map(mapYyPhotoAsset)
    cachedAlbums = albums.map(album => mapYyAlbum(album, cachedAssets, getCachedOrders()))
    return cachedAlbums
  },
  async getAlbum(id: BackendId) {
    const source = await getData<YyPhotoAlbumVo>(`/yy/photoAlbum/${id}`)
    const sourceIndex = cachedAlbumSources.findIndex(album => sameId(album.id, source.id))
    if (sourceIndex === -1) cachedAlbumSources = [source, ...cachedAlbumSources]
    else cachedAlbumSources[sourceIndex] = source
    const assets = await listRows<YyPhotoAssetVo>('/yy/photoAsset/list', { albumId: id })
    const mappedAssets = assets.map(mapYyPhotoAsset)
    return mapYyAlbum(source, mappedAssets, getCachedOrders())
  },
  confirmAlbumSelection: (id: BackendId, payload: PhotoAlbumActionPayload = {}) =>
    apiRequest<PhotoAlbumActionDto>(`/yy/photoAlbum/${id}/selection/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deliverAlbum: (id: BackendId, payload: PhotoAlbumActionPayload = {}) =>
    apiRequest<PhotoAlbumActionDto>(`/yy/photoAlbum/${id}/deliver`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  notifyAlbum: (id: BackendId, payload: PhotoAlbumActionPayload = {}) =>
    apiRequest<PhotoAlbumActionDto>(`/yy/photoAlbum/${id}/notify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  async listSelectionLinks() {
    return buildSelectionLinksFromAlbums(cachedAlbums, cachedAlbumSources)
  },
  async selectionStats() {
    return buildSelectionStats(buildSelectionLinksFromAlbums(cachedAlbums, cachedAlbumSources))
  },
  async createSelectionLink(payload: {
    orderId?: BackendId
    albumId: BackendId
    customerPhone?: string
    productSnapshot?: string
    expireAt?: string
  }) {
    const album = cachedAlbums.find(item => item.id === payload.albumId)
    if (!album) throw new Error('未找到相册')
    const source = cachedAlbumSources.find(item => sameId(item.id, payload.albumId))
    return buildSelectionLinksFromAlbums([album], source ? [source] : [])[0]
  },
  async uploadAlbumPhotos(_albumId: BackendId, _files: File[]): Promise<AlbumPhotoDto[]> {
    const album = await findAlbumSource(_albumId)
    if (!album.id || !album.storeId) {
      throw new Error('相册信息不完整，无法上传')
    }

    const existingRows = await listRows<YyPhotoAssetVo>('/yy/photoAsset/list', { albumId: _albumId })
    const existingAssets = existingRows.map(mapYyPhotoAsset)
    const knownObjectKeys = new Set(existingRows.map(row => String(row.objectKey || '')).filter(Boolean))
    const uploadedObjectKeys = new Set<string>()
    let nextSort = resolveNextAssetSort(existingAssets, existingRows.length)

    for (const file of _files) {
      let currentOssId: string | number | undefined
      let currentObjectKey: string | undefined
      let currentFileName: string | undefined
      try {
        const formData = new FormData()
        formData.append('file', file)
        const uploadResponse = await apiRequestRaw<RuoyiResponse<OssUploadData>>('/resource/oss/upload', {
          method: 'POST',
          headers: { repeatSubmit: 'false' },
          body: formData,
        })
        currentOssId = uploadResponse.data?.ossId
        if (!currentOssId) {
          throw new Error(uploadResponse.msg || 'OSS 上传失败：未返回 ossId')
        }
        const oss = await resolveOssById(currentOssId, uploadResponse.data?.url)
        currentObjectKey = String(oss.fileName || '')
        currentFileName = uploadResponse.data?.fileName || file.name
        uploadedObjectKeys.add(currentObjectKey)
        if (knownObjectKeys.has(currentObjectKey)) {
          continue
        }

        const assetForm = buildYyPhotoAssetFormFromOss(
          album,
          oss,
          currentFileName,
          nextSort,
          currentOssId,
        )
        await apiRequestRaw<RuoyiResponse<void>>('/yy/photoAsset', {
          method: 'POST',
          body: JSON.stringify(assetForm),
        })
        knownObjectKeys.add(currentObjectKey)
        nextSort += 1
      } catch (error) {
        const message = error instanceof Error ? error.message : '上传失败'
        const stage = !currentOssId ? 'oss_upload' : !currentObjectKey ? 'oss_resolve' : 'yy_photo_asset_create'
        const detailMessage = buildYyPhotoAssetUploadError({
          albumId: String(album.id ?? ''),
          storeId: String(album.storeId ?? ''),
          fileName: currentFileName ?? file.name,
          stage,
          message,
          ossId: currentOssId,
          objectKey: currentObjectKey,
        })
        throw new Error(detailMessage)
      }
    }

    const { rows, assets } = await refreshAlbumAssetCache(album, _albumId, getCachedOrders())
    const returnedIds = rows
      .filter(row => uploadedObjectKeys.has(String(row.objectKey || '')))
      .map(row => normalizeBackendId(row.id))
    return assets.filter(asset => returnedIds.includes(asset.id))
  },
  sortAlbumPhotos: (_albumId: BackendId, items: { photoId: BackendId; sortOrder: number }[]) =>
    Promise.all(
      items.map(async item => {
        const data = await getData<YyPhotoAssetVo>(`/yy/photoAsset/${item.photoId}`)
        await apiRequestRaw<RuoyiResponse<void>>('/yy/photoAsset', {
          method: 'PUT',
          body: JSON.stringify({ ...data, sort: item.sortOrder }),
        })
      }),
    ).then(() => undefined),
  async renameAlbumPhoto(photoId: BackendId, displayName: string) {
    const data = await getData<YyPhotoAssetVo>(`/yy/photoAsset/${photoId}`)
    const next = { ...data, fileName: displayName }
    await apiRequestRaw<RuoyiResponse<void>>('/yy/photoAsset', {
      method: 'PUT',
      body: JSON.stringify(next),
    })
    return mapYyPhotoAsset(next)
  },
  markAlbumPhotosSelected: (items: { photoId: BackendId; selected: boolean }[]) =>
    Promise.all(
      items.map(async item => {
        const data = await getData<YyPhotoAssetVo>(`/yy/photoAsset/${item.photoId}`)
        const next = { ...data, isSelected: item.selected ? '1' : '0' }
        await apiRequestRaw<RuoyiResponse<void>>('/yy/photoAsset', {
          method: 'PUT',
          body: JSON.stringify(next),
        })
        return mapYyPhotoAsset(next)
      }),
    ),
  deleteAlbumPhoto: (photoId: BackendId) =>
    apiRequestRaw<RuoyiResponse<void>>(`/yy/photoAsset/${photoId}`, { method: 'DELETE' }).then(() => undefined),
  async listPhotoAccessLogs(query: PhotoAccessLogQuery = {}) {
    const rows = await listRows<Record<string, any>>('/yy/photoAccessLog/list', {
      pageNum: query.pageNum ?? 1,
      pageSize: query.pageSize ?? 50,
      ...(query.albumId ? { albumId: String(query.albumId) } : {}),
      ...(query.assetId ? { assetId: String(query.assetId) } : {}),
      ...(query.action ? { action: query.action } : {}),
    })
    cachedPhotoAccessLogs = rows.map(mapPhotoAccessLogRow)
    return cachedPhotoAccessLogs
  },
})
