import { describe, expect, it } from 'vitest'
import type { Album } from '../../shared/stores/appStore'
import {
  albumNextStep,
  albumProgress,
  buildAlbumActionAvailability,
  buildPhotoItems,
  buildPhotoSelectionUpdateTargets,
  buildUploadErrorDetail,
  buildPhotoAccessEmptyHint,
  summarizePhotoAccessLogs,
  computeMarkedSelectedCount,
  formatUploadErrorForCopy,
  getNextThumbnailSets,
  parseUploadErrorMessage,
  updateAlbumSelectedCount,
} from './photoMgmtOperations'

const baseAlbum: Album = {
  backendId: 'album-1',
  orderId: 'YY202606140001',
  id: 'ALB-1',
  customer: '张三',
  service: '证件照',
  date: '2026-06-14',
  photographer: '摄影师A',
  status: '选片中',
  selectedCount: 1,
  totalCount: 3,
  negatives: [
    { backendId: 'n1', id: 'n1', name: '001.jpg', url: 'https://example.com/001.jpg', uploadedAt: '2026-06-14', selected: true },
    { backendId: 'n2', id: 'n2', name: '002.jpg', url: 'https://example.com/002.jpg', uploadedAt: '2026-06-14', selected: false },
    { backendId: 'n3', id: 'n3', name: '003.jpg', url: '', uploadedAt: '2026-06-14', selected: false },
  ],
}

const makeAlbum = (overrides: Partial<Album> = {}): Album => ({
  ...baseAlbum,
  ...overrides,
})

describe('photo management operation helpers', () => {
  it('calculates album progress and next staff step', () => {
    expect(albumProgress({ selectedCount: 1, totalCount: 3 })).toBe(33)
    expect(albumProgress({ selectedCount: 8, totalCount: 4 })).toBe(100)
    expect(albumProgress({ selectedCount: 0, totalCount: 0 })).toBe(0)

    expect(albumNextStep(makeAlbum({ totalCount: 0, negatives: [] }))).toBe('等待上传')
    expect(albumNextStep(makeAlbum({ selectedCount: 0 }))).toBe('待发链接')
    expect(albumNextStep(makeAlbum({ status: '已交付' }))).toBe('已归档')
    expect(albumNextStep(makeAlbum())).toBe('跟进选片')
  })

  it('gates album actions by real delivery stage', () => {
    expect(buildAlbumActionAvailability(null)).toMatchObject({
      notify: { enabled: false, reason: '请先选择相册' },
      confirm: { enabled: false, reason: '请先选择相册' },
      deliver: { enabled: false, reason: '请先选择相册' },
    })

    expect(buildAlbumActionAvailability(makeAlbum({ totalCount: 0, selectedCount: 0, negatives: [] }))).toMatchObject({
      notify: { enabled: false, reason: '请先上传底片' },
      confirm: { enabled: false, reason: '请先上传底片' },
      deliver: { enabled: false, reason: '请先上传底片' },
    })

    expect(buildAlbumActionAvailability(makeAlbum({ totalCount: 3, selectedCount: 0 }))).toMatchObject({
      notify: { enabled: true, reason: '' },
      confirm: { enabled: false, reason: '请先等待客户选片' },
      deliver: { enabled: false, reason: '请先等待客户选片' },
    })

    expect(buildAlbumActionAvailability(makeAlbum({ totalCount: 3, selectedCount: 1, status: '选片中' }))).toMatchObject({
      notify: { enabled: true, reason: '' },
      confirm: { enabled: true, reason: '' },
      deliver: { enabled: true, reason: '' },
    })

    expect(buildAlbumActionAvailability(makeAlbum({ totalCount: 3, selectedCount: 1, status: '已交付' }))).toMatchObject({
      notify: { enabled: true, reason: '' },
      confirm: { enabled: false, reason: '已交付无需重复确认' },
      deliver: { enabled: false, reason: '已交付无需重复发送' },
    })
  })

  it('builds photo grid items from album negatives without inventing placeholder photos', () => {
    expect(buildPhotoItems(null)).toEqual([])
    expect(buildPhotoItems(makeAlbum({ negatives: [] }))).toEqual([])

    expect(buildPhotoItems(makeAlbum()).map(photo => ({
      id: photo.id,
      name: photo.name,
      selected: photo.selected,
      isNegative: photo.isNegative,
    }))).toEqual([
      { id: 'n1', name: '001.jpg', selected: true, isNegative: true },
      { id: 'n2', name: '002.jpg', selected: false, isNegative: true },
      { id: 'n3', name: '003.jpg', selected: false, isNegative: true },
    ])
  })

  it('respects per-photo selected flags instead of guessing by selected count order', () => {
    expect(buildPhotoItems(makeAlbum({
      selectedCount: 1,
      negatives: [
        { backendId: 'n1', id: 'n1', name: '001.jpg', url: 'https://example.com/001.jpg', uploadedAt: '2026-06-14', selected: false },
        { backendId: 'n2', id: 'n2', name: '002.jpg', url: 'https://example.com/002.jpg', uploadedAt: '2026-06-14', selected: true },
      ],
    })).map(photo => ({ id: photo.id, selected: photo.selected }))).toEqual([
      { id: 'n1', selected: false },
      { id: 'n2', selected: true },
    ])
  })

  it('updates selected counts using only photos currently visible in the album', () => {
    const photos = buildPhotoItems(makeAlbum())
    const picked = new Set(['n1', 'n2', 'missing'])

    expect(computeMarkedSelectedCount(photos, picked)).toBe(2)
    expect(updateAlbumSelectedCount(1, photos, picked, true)).toBe(2)
    expect(updateAlbumSelectedCount(3, photos, picked, false)).toBe(1)
    expect(updateAlbumSelectedCount(1, photos, new Set(['missing']), false)).toBe(1)
  })

  it('builds batch selection updates only for visible photos that need persistence', () => {
    const photos = buildPhotoItems(makeAlbum())

    expect(buildPhotoSelectionUpdateTargets(photos, new Set(['n1', 'n2', 'missing']), true)).toEqual([
      { photoId: 'n2', selected: true },
    ])

    expect(buildPhotoSelectionUpdateTargets(photos, new Set(['n1', 'n2']), false)).toEqual([
      { photoId: 'n1', selected: false },
    ])
  })

  it('keeps thumbnail loading and failed id sets scoped to visible photos', () => {
    const photos = buildPhotoItems(makeAlbum())
    const next = getNextThumbnailSets({
      photos,
      selectedIds: new Set(['n1', 'stale-selected']),
      failedIds: new Set(['n2', 'stale-failed']),
      loadingIds: new Set(['n3', 'stale-loading']),
    })

    expect([...next.selectedIds]).toEqual(['n1'])
    expect([...next.failedIds]).toEqual(['n2'])
    expect([...next.loadingIds].sort()).toEqual(['n1', 'n3'])
  })

  it('builds structured error detail from upload failure params', () => {
    const detail = buildUploadErrorDetail({
      albumId: 'ALB-1',
      storeId: 'STORE-001',
      fileName: 'test.jpg',
      stage: 'yy_photo_asset_create',
      message: '权限不足',
      ossId: 'oss-999',
      objectKey: 'uploads/test.jpg',
    })

    expect(detail).toEqual({
      albumId: 'ALB-1',
      storeId: 'STORE-001',
      fileName: 'test.jpg',
      stage: 'yy_photo_asset_create',
      message: '权限不足',
      ossId: 'oss-999',
      objectKey: 'uploads/test.jpg',
    })
  })

  it('fills empty strings for missing optional fields', () => {
    const detail = buildUploadErrorDetail({
      albumId: 'ALB-1',
      storeId: '',
      fileName: 'no-oss.jpg',
      stage: 'oss_upload',
      message: '网络错误',
    })

    expect(detail.ossId).toBe('')
    expect(detail.objectKey).toBe('')
    expect(detail.albumId).toBe('ALB-1')
  })

  it('formats error detail into a copyable multi-line string', () => {
    const detail = buildUploadErrorDetail({
      albumId: 'ALB-2',
      storeId: 'S1',
      fileName: 'photo.png',
      stage: 'oss_resolve',
      message: 'OSS Key 获取失败',
      objectKey: 'uploads/photo.png',
    })

    const formatted = formatUploadErrorForCopy(detail)
    expect(formatted).toContain('[客片上传失败]')
    expect(formatted).toContain('albumId=ALB-2')
    expect(formatted).toContain('fileName=photo.png')
    expect(formatted).toContain('stage=oss_resolve')
    expect(formatted).toContain('OSS Key 获取失败')
    expect(formatted).toContain('objectKey=uploads/photo.png')
  })

  it('parses structured error messages back into summaries', () => {
    const payload = '[UPLOAD_ERROR] albumId=ALB-3\nstoreId=S2\nfileName=x.jpg\nstage=oss_upload\nmessage=timeout\nossId=\nobjectKey='
    const summary = parseUploadErrorMessage(payload)

    expect(summary).not.toBeNull()
    expect(summary!.fileName).toBe('x.jpg')
    expect(summary!.stage).toBe('oss_upload')
    expect(summary!.message).toBe('timeout')
    expect(summary!.detail.albumId).toBe('ALB-3')
    expect(summary!.detail.ossId).toBe('')
  })

  it('returns null for non-structured error messages', () => {
    expect(parseUploadErrorMessage('旧格式错误提示')).toBeNull()
    expect(parseUploadErrorMessage('')).toBeNull()
  })

  it('summarizes photo access logs without exposing raw phone or ip', () => {
    const rows = summarizePhotoAccessLogs([
      {
        action: 'VIEW',
        platform: 'WECHAT',
        remark: '2026-06-15 10:30 客户打开相册',
        ip: '10.0.0.1',
        customerPhone: '13800003333',
        success: '1',
      },
    ])

    expect(rows).toEqual([
      {
        action: 'VIEW',
        platform: 'WECHAT',
        happenedAt: '2026-06-15 10:30 客户打开相册',
        ip: '已脱敏',
        success: '成功',
      },
    ])
    expect(JSON.stringify(rows)).not.toContain('10.0.0.1')
    expect(JSON.stringify(rows)).not.toContain('13800003333')
  })

  it('uses backend create time when summarizing photo access logs', () => {
    const rows = summarizePhotoAccessLogs([
      {
        action: 'DOWNLOAD',
        platform: 'H5',
        happenedAt: '2026-06-15 11:20:00',
        remark: '客户下载底片',
        success: '0',
      },
    ])

    expect(rows[0]).toMatchObject({
      action: 'DOWNLOAD',
      happenedAt: '2026-06-15 11:20:00',
      success: '失败',
    })
  })

  it('keeps photo access log empty hints honest before and after backend wiring', () => {
    expect(summarizePhotoAccessLogs([])).toEqual([])
    expect(buildPhotoAccessEmptyHint(false)).toContain('访问日志接口未接入')
    expect(buildPhotoAccessEmptyHint(true)).toContain('当前相册没有访问记录')
  })
})
