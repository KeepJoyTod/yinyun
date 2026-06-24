import { reactive } from 'vue'
import { backendApi, type AlbumPhotoDto, type PhotoAlbumActionDto, type PhotoAlbumActionPayload } from '../api/backend'
import { normalizeBackendId, type BackendId } from '../api/backendId'
import type { Album, BookingOrder, PhotoAccessLogInfo, SelectionLink } from './appStoreTypes'
import {
  emptySelectionStats,
  mapAlbum,
  mapAlbumPhoto,
  mapPhotoAccessLog,
  mapSelectionLink,
} from './appStoreTransforms'
import { getSamplePhotoImage } from './workbenchAssets'

const findAlbum = (albums: Album[], albumId: string) =>
  albums.find(item => item.id === albumId || item.backendId === albumId)

export const albumsStore = reactive({
  albums: [] as Album[],
  selectionLinks: [] as SelectionLink[],
  selectionStats: emptySelectionStats(),
  photoAccessLogsByAlbum: {} as Record<string, PhotoAccessLogInfo[]>,

  reset() {
    this.albums = []
    this.selectionLinks = []
    this.selectionStats = emptySelectionStats()
    this.photoAccessLogsByAlbum = {}
  },

  syncAlbum(next: Album) {
    const idx = this.albums.findIndex(item => item.backendId === next.backendId)
    if (idx === -1) this.albums = [next, ...this.albums]
    else this.albums[idx] = next
    return next
  },

  async refreshAlbums(orders: BookingOrder[]) {
    const albums = await backendApi.listAlbums()
    this.albums = albums.map(album => mapAlbum(album, orders))
    return this.albums
  },

  async refreshSelectionLinks(orders: BookingOrder[]) {
    const [links, stats] = await Promise.all([backendApi.listSelectionLinks(), backendApi.selectionStats()])
    this.selectionLinks = links.map(link => mapSelectionLink(link, orders, this.albums))
    this.selectionStats = stats
    return this.selectionLinks
  },

  async refreshCore(orders: BookingOrder[]) {
    await this.refreshAlbums(orders)
    await this.refreshSelectionLinks(orders)
  },

  async refreshSelectionStats() {
    this.selectionStats = await backendApi.selectionStats()
    return this.selectionStats
  },

  async refreshAlbumDetails(albumId: string, orders: BookingOrder[]) {
    const album = findAlbum(this.albums, albumId)
    if (!album) return null
    const dto = await backendApi.getAlbum(album.backendId)
    return this.syncAlbum(mapAlbum(dto, orders))
  },

  async confirmAlbumSelection(albumId: string, orders: BookingOrder[], payload: PhotoAlbumActionPayload = {}) {
    const album = findAlbum(this.albums, albumId)
    if (!album) throw new Error('相册不存在')
    const result = await backendApi.confirmAlbumSelection(album.backendId, payload)
    await this.refreshAlbumDetails(album.id, orders)
    return result
  },

  confirmAlbumSelectionDemo(albumId: string) {
    const album = findAlbum(this.albums, albumId)
    if (!album) throw new Error('相册不存在')
    album.status = '选片中'
    return {
      albumId: normalizeBackendId(album.backendId),
      action: 'CONFIRM_SELECTION',
      status: 'SUCCESS',
      selectionStatus: 'SUBMITTED',
      auditStatus: 'SUCCESS',
      fallback: false,
      notificationChannel: '',
      notificationSendStatus: '',
      requestId: '',
      message: '客片确认成功',
    } satisfies PhotoAlbumActionDto
  },

  async deliverAlbum(albumId: string, orders: BookingOrder[], payload: PhotoAlbumActionPayload = {}) {
    const album = findAlbum(this.albums, albumId)
    if (!album) throw new Error('相册不存在')
    const result = await backendApi.deliverAlbum(album.backendId, payload)
    await this.refreshAlbumDetails(album.id, orders)
    return result
  },

  deliverAlbumDemo(albumId: string) {
    const album = findAlbum(this.albums, albumId)
    if (!album) throw new Error('相册不存在')
    album.status = '已交付'
    return {
      albumId: normalizeBackendId(album.backendId),
      action: 'DELIVER',
      status: 'SUCCESS',
      selectionStatus: 'COMPLETED',
      auditStatus: 'SUCCESS',
      fallback: false,
      notificationChannel: '',
      notificationSendStatus: '',
      requestId: '',
      message: '资料发送成功',
    } satisfies PhotoAlbumActionDto
  },

  async notifyAlbum(albumId: string, orders: BookingOrder[], payload: PhotoAlbumActionPayload = {}) {
    const album = findAlbum(this.albums, albumId)
    if (!album) throw new Error('相册不存在')
    const result = await backendApi.notifyAlbum(album.backendId, payload)
    await this.refreshAlbumDetails(album.id, orders)
    return result
  },

  notifyAlbumDemo(albumId: string, payload: PhotoAlbumActionPayload = {}) {
    const album = findAlbum(this.albums, albumId)
    if (!album) throw new Error('相册不存在')
    return {
      albumId: normalizeBackendId(album.backendId),
      action: 'NOTIFY',
      status: 'FALLBACK_LOGGED',
      selectionStatus: album.status === '已交付' ? 'COMPLETED' : album.status === '选片中' ? 'SELECTING' : 'WAITING',
      auditStatus: 'FALLBACK_LOGGED',
      fallback: true,
      notificationChannel: payload.channelType || 'MANUAL',
      notificationSendStatus: 'PENDING_MANUAL',
      requestId: `demo-fallback-${Date.now()}`,
      message: '通知通道未接入，已记录可审计 fallback 日志',
    } satisfies PhotoAlbumActionDto
  },

  async generateSelectionLink(input: {
    orderId?: string
    albumId?: string
    customer?: string
    phone?: string
    product?: string
  }, orders: BookingOrder[]) {
    const album = input.albumId ? findAlbum(this.albums, input.albumId) : this.albums[0]
    if (!album) throw new Error('请先创建相册')
    const order = input.orderId
      ? orders.find(item => item.id === input.orderId)
      : orders.find(item => item.backendId === album.orderBackendId)
    const dto = await backendApi.createSelectionLink({
      albumId: album.backendId,
      orderId: order?.backendId ?? album.orderBackendId,
      customerPhone: input.phone ?? order?.phone,
      productSnapshot: input.product ?? order?.service ?? album.service,
    })
    const link = mapSelectionLink(dto, orders, this.albums)
    this.selectionLinks = [link, ...this.selectionLinks.filter(item => item.backendId !== link.backendId)]
    await this.refreshSelectionStats()
    return link
  },

  generateSelectionLinkDemo(input: {
    orderId?: string
    albumId?: string
    customer?: string
    phone?: string
    product?: string
  }, orders: BookingOrder[]) {
    const album = input.albumId ? findAlbum(this.albums, input.albumId) : this.albums[0]
    if (!album) throw new Error('请先创建相册')
    const order = input.orderId
      ? orders.find(item => item.id === input.orderId)
      : orders.find(item => item.backendId === album.orderBackendId)
    const link: SelectionLink = {
      backendId: normalizeBackendId(Date.now()),
      token: `demo-selection-token-${Date.now()}`,
      orderBackendId: order?.backendId ?? album.orderBackendId,
      albumBackendId: album.backendId,
      id: String(Date.now()),
      orderId: order?.id,
      albumId: album.id,
      display: `selection/${album.id}`,
      url: `https://api.evanshine.me/client/photo/demo/${album.id}`,
      customer: input.customer ?? album.customer,
      phone: input.phone ?? order?.phone ?? '',
      product: input.product ?? order?.service ?? album.service,
      selectedCount: album.selectedCount,
      extraCount: 0,
      visits: 0,
      expire: '06-30',
      status: '进行中',
    }
    this.selectionLinks = [link, ...this.selectionLinks]
    this.selectionStats.activeCount += 1
    return link
  },

  async uploadAlbumPhotos(albumId: string, files: File[]) {
    const album = findAlbum(this.albums, albumId)
    if (!album) throw new Error('相册不存在')
    const photos = await backendApi.uploadAlbumPhotos(album.backendId, files)
    album.negatives = [...album.negatives, ...photos.map(mapAlbumPhoto)]
    album.totalCount += photos.length
    return photos
  },

  uploadAlbumPhotosDemo(albumId: string, files: File[]) {
    const album = findAlbum(this.albums, albumId)
    if (!album) throw new Error('相册不存在')
    const photos = files.map((file, idx): AlbumPhotoDto => ({
      id: normalizeBackendId(Date.now() + idx),
      albumId: album.backendId,
      fileId: normalizeBackendId(Date.now() + idx),
      originalName: file.name,
      displayName: file.name,
      sortOrder: album.negatives.length + idx,
      selected: false,
      url: URL.createObjectURL(file),
      uploadedAt: new Date().toISOString(),
    }))
    album.negatives = [...album.negatives, ...photos.map(mapAlbumPhoto)]
    album.totalCount += photos.length
    return photos
  },

  async sortAlbumPhotos(albumId: string) {
    const album = findAlbum(this.albums, albumId)
    if (!album) return
    await backendApi.sortAlbumPhotos(
      album.backendId,
      album.negatives.map((photo, sortOrder) => ({ photoId: photo.backendId, sortOrder })),
    )
  },

  async renameAlbumPhoto(albumId: string, photoId: string, displayName: string, orders: BookingOrder[] = []) {
    const album = findAlbum(this.albums, albumId)
    const photo = album?.negatives.find(item => item.id === photoId || item.backendId === photoId)
    if (!album || !photo) return
    await backendApi.renameAlbumPhoto(photo.backendId, displayName)
    return this.refreshAlbumDetails(album.id, orders)
  },

  renameAlbumPhotoDemo(albumId: string, photoId: string, displayName: string) {
    const album = findAlbum(this.albums, albumId)
    const photo = album?.negatives.find(item => item.id === photoId || item.backendId === photoId)
    if (!album || !photo) return
    photo.name = displayName
    return album
  },

  async markAlbumPhotosSelected(albumId: string, updates: { photoId: string; selected: boolean }[]) {
    const album = findAlbum(this.albums, albumId)
    if (!album || updates.length === 0) return []
    const backendUpdates = updates
      .map(update => {
        const photo = album.negatives.find(item => item.id === update.photoId || item.backendId === update.photoId)
        return photo ? { photoId: photo.backendId, selected: update.selected } : null
      })
      .filter((item): item is { photoId: BackendId; selected: boolean } => item !== null)
    const updatedPhotos = await backendApi.markAlbumPhotosSelected(backendUpdates)
    for (const dto of updatedPhotos) {
      const idx = album.negatives.findIndex(item => item.backendId === dto.id)
      if (idx !== -1) album.negatives[idx] = mapAlbumPhoto(dto)
    }
    album.selectedCount = album.negatives.filter(photo => photo.selected).length
    return updatedPhotos
  },

  markAlbumPhotosSelectedDemo(albumId: string, updates: { photoId: string; selected: boolean }[]) {
    const album = findAlbum(this.albums, albumId)
    if (!album || updates.length === 0) return []
    for (const { photoId, selected } of updates) {
      const photo = album.negatives.find(item => item.id === photoId || item.backendId === photoId)
      if (photo) photo.selected = selected
    }
    album.selectedCount = album.negatives.filter(photo => photo.selected).length
    return []
  },

  async deleteAlbumPhoto(albumId: string, photoId: string, orders: BookingOrder[] = []) {
    const album = findAlbum(this.albums, albumId)
    const photo = album?.negatives.find(item => item.id === photoId || item.backendId === photoId)
    if (!album || !photo) return
    await backendApi.deleteAlbumPhoto(photo.backendId)
    return this.refreshAlbumDetails(album.id, orders)
  },

  deleteAlbumPhotoDemo(albumId: string, photoId: string) {
    const album = findAlbum(this.albums, albumId)
    const photo = album?.negatives.find(item => item.id === photoId || item.backendId === photoId)
    if (!album || !photo) return
    album.negatives = album.negatives.filter(item => item.backendId !== photo.backendId)
    album.totalCount = album.negatives.length
    album.selectedCount = album.negatives.filter(item => item.selected).length
    return album
  },

  async loadPhotoAccessLogs(albumId: string) {
    const album = findAlbum(this.albums, albumId)
    if (!album) return []
    const logs = await backendApi.listPhotoAccessLogs({ albumId: album.backendId, pageSize: 50 })
    this.photoAccessLogsByAlbum[album.id] = logs.map(mapPhotoAccessLog)
    return this.photoAccessLogsByAlbum[album.id]
  },

  loadDemo(today: string, tomorrow: string) {
    this.albums = [
      {
        backendId: '7001',
        orderBackendId: '9001',
        id: 'ALB-20260610-001',
        orderId: 'YY202606100001',
        customer: '陈女士',
        service: '证件照精修套餐',
        date: today,
        photographer: '阿杰',
        status: '选片中',
        selectedCount: 3,
        totalCount: 8,
        negatives: Array.from({ length: 8 }, (_, idx) => ({
          backendId: `710${idx}`,
          id: String(7100 + idx),
          name: `chen-${String(idx + 1).padStart(2, '0')}.jpg`,
          url: getSamplePhotoImage(idx),
          uploadedAt: `${today}T${String(10 + Math.floor(idx / 2)).padStart(2, '0')}:00:00`,
          selected: idx < 3,
        })),
      },
      {
        backendId: '7002',
        orderBackendId: '9002',
        id: 'ALB-20260610-002',
        orderId: 'YY202606100002',
        customer: '林先生',
        service: '个人形象照套餐',
        date: tomorrow,
        photographer: '小满',
        status: '待客户选片',
        selectedCount: 0,
        totalCount: 4,
        negatives: Array.from({ length: 4 }, (_, idx) => ({
          backendId: `720${idx}`,
          id: String(7200 + idx),
          name: `lin-${String(idx + 1).padStart(2, '0')}.jpg`,
          url: getSamplePhotoImage(idx + 2),
          uploadedAt: `${today}T15:${String(idx * 8).padStart(2, '0')}:00`,
          selected: false,
        })),
      },
    ]

    this.selectionLinks = [
      {
        backendId: '8001',
        token: 'demo-selection-token-001',
        orderBackendId: '9001',
        albumBackendId: '7001',
        id: '8001',
        orderId: 'YY202606100001',
        albumId: 'ALB-20260610-001',
        display: 'selection/ALB-20260610-001',
        url: 'https://api.evanshine.me/client/photo/demo/ALB-20260610-001',
        customer: '陈女士',
        phone: '13800003333',
        product: '证件照精修套餐',
        selectedCount: 3,
        extraCount: 1,
        visits: 6,
        expire: '06-30',
        status: '进行中',
      },
    ]
    this.photoAccessLogsByAlbum = {}
    this.selectionStats = {
      activeCount: 1,
      newLast7DaysCount: 1,
      completedCount: 12,
      completedThisMonthCount: 5,
      averageSelectionMinutes: 18,
      extraConversionRate: 0.28,
      averageExtraCount: 1.4,
      monthExtraRevenueCents: 268800,
    }
  },

  loadDemoPhotoAccessLogs(albumId: string) {
    const album = findAlbum(this.albums, albumId)
    if (!album) return []
    this.photoAccessLogsByAlbum[album.id] = []
    return this.photoAccessLogsByAlbum[album.id]
  },
})
