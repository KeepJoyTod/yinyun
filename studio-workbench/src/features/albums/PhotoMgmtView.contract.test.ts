import { describe, expect, it } from 'vitest'
import photoMgmtSource from './PhotoMgmtView.vue?raw'
import photoAccessLogPanelSource from './components/PhotoAccessLogPanel.vue?raw'
import photoAlbumSidebarSource from './components/PhotoAlbumSidebar.vue?raw'
import photoGridPanelSource from './components/PhotoGridPanel.vue?raw'
import usePhotoAlbumFiltersSource from './composables/usePhotoAlbumFilters.ts?raw'
import usePhotoDeliveryActionsSource from './composables/usePhotoDeliveryActions.ts?raw'
import usePhotoUploadStateSource from './composables/usePhotoUploadState.ts?raw'
import photoOpsSource from './photoMgmtOperations.ts?raw'
import appStoreSource from '../../shared/stores/appStore.ts?raw'
import backendAlbumsApiSource from '../../shared/api/backendAlbumsApi.ts?raw'
import backendSource from '../../shared/api/backend.ts?raw'

const backendContractSource = `${backendSource}\n${backendAlbumsApiSource}`
const photoMgmtViewSource = `${photoMgmtSource}\n${photoAccessLogPanelSource}\n${photoAlbumSidebarSource}\n${photoGridPanelSource}`

describe('photo management page contract', () => {
  it('shows a batch operation toolbar for store photo delivery', () => {
    expect(photoMgmtViewSource).toContain('photo-batch-toolbar')
    expect(photoMgmtViewSource).toContain('已选择')
    expect(photoMgmtViewSource).toContain('批量标记已选')
    expect(photoMgmtViewSource).toContain('批量取消已选')
    expect(photoMgmtViewSource).toContain('清空选择')
  })

  it('persists batch selected photo state instead of only changing local counters', () => {
    expect(photoMgmtSource).toContain('usePhotoUploadState')
    expect(usePhotoUploadStateSource).toContain('buildPhotoSelectionUpdateTargets')
    expect(usePhotoUploadStateSource).toContain('await input.markAlbumPhotosSelected')
    expect(photoMgmtSource).toContain('batchSelectionSaving')
    expect(photoMgmtViewSource).toContain('保存中')
  })

  it('keeps thumbnail loading and failure states explicit', () => {
    expect(photoMgmtSource).toContain('thumbnailLoadingIds')
    expect(photoMgmtSource).toContain('thumbnailFailedIds')
    expect(usePhotoUploadStateSource).toContain('getNextThumbnailSets')
    expect(photoMgmtViewSource).toContain('缩略图生成中')
    expect(photoMgmtViewSource).toContain('缩略图加载失败')
    expect(photoMgmtViewSource).toContain('@load=')
    expect(photoMgmtViewSource).toContain('@error=')
  })

  it('keeps photo delivery rules in a tested pure helper', () => {
    expect(photoMgmtSource).toContain("from './photoMgmtOperations'")
    expect(photoOpsSource).toContain('buildPhotoItems')
    expect(photoOpsSource).toContain('updateAlbumSelectedCount')
    expect(photoOpsSource).toContain('albumNextStep')
    expect(photoOpsSource).toContain('albumProgress')
  })

  it('displays structured upload failure info with a copy button', () => {
    expect(photoMgmtSource).toContain('uploadError')
    expect(photoMgmtViewSource).toContain('底片上传失败')
    expect(photoMgmtViewSource).toContain('复制错误详情')
    expect(photoMgmtViewSource).toContain('复制中')
    expect(photoMgmtViewSource).toContain('已复制')
    expect(photoMgmtViewSource).toContain('复制失败，请手动选择文本复制')
    expect(photoMgmtSource).toContain('copyUploadError')
    expect(usePhotoUploadStateSource).toContain('useCopyWithState')
    expect(usePhotoUploadStateSource).toContain('parseUploadErrorMessage')
    expect(usePhotoUploadStateSource).toContain('formatUploadErrorForCopy')
    expect(photoMgmtSource).not.toContain('alert(')
  })

  it('provides album filter by status, photographer and keyword synced to the url', () => {
    expect(photoMgmtSource).toContain('usePhotoAlbumFilters')
    expect(photoMgmtViewSource).toContain('重置筛选')
    expect(usePhotoAlbumFiltersSource).toContain('useRouteQueryFilters')
    expect(usePhotoAlbumFiltersSource).toContain('applyFromQuery')
    expect(usePhotoAlbumFiltersSource).toContain('syncToUrl')
    expect(usePhotoAlbumFiltersSource).toContain('filterStatus')
    expect(usePhotoAlbumFiltersSource).toContain('filterPhotographer')
    expect(usePhotoAlbumFiltersSource).toContain('filterSearch')
    expect(usePhotoAlbumFiltersSource).toContain('filteredAlbums')
    expect(usePhotoAlbumFiltersSource).toContain('photographerOptions')
    expect(usePhotoAlbumFiltersSource).toContain('album:')
  })

  it('accepts dashboard drill-down filters for date scoped upload backlog', () => {
    expect(photoMgmtSource).toContain('usePhotoAlbumFilters')
    expect(usePhotoAlbumFiltersSource).toContain('filterDate')
    expect(usePhotoAlbumFiltersSource).toContain('filterNeedsUpload')
    expect(usePhotoAlbumFiltersSource).toContain("needsUpload: filterNeedsUpload.value ? '1' : ''")
    expect(usePhotoAlbumFiltersSource).toContain('date: filterDate.value')
    expect(usePhotoAlbumFiltersSource).toContain('album.date !== filterDate.value')
    expect(usePhotoAlbumFiltersSource).toContain('filterNeedsUpload.value && !albumNeedsUpload(album)')
    expect(usePhotoAlbumFiltersSource).toContain('export const albumNeedsUpload')
  })

  it('shows upload progress feedback while uploading negatives', () => {
    expect(photoMgmtSource).toContain('uploadProgress')
    expect(photoMgmtViewSource).toContain('正在上传底片')
    expect(photoMgmtViewSource).toContain('animate-pulse')
  })

  it('renders an empty state when no album matches the filters', () => {
    expect(photoMgmtViewSource).toContain('StateView')
    expect(photoMgmtViewSource).toContain('没有匹配的相册')
    expect(photoMgmtViewSource).toContain('empty-action')
  })

  it('offers a direct upload action when the active album has no photos', () => {
    expect(photoMgmtViewSource).toContain('empty-photo-dropzone')
    expect(photoMgmtViewSource).toContain('workbenchImages.emptyFiles')
    expect(photoMgmtViewSource).toContain('上传第一批底片')
    expect(photoMgmtViewSource).toContain('@click=\"triggerNegativesUpload\"')
    expect(photoMgmtViewSource).toContain('当前相册没有底片，不会展示假缩略图。')
  })

  it('loads photo access logs from backend state instead of fake visits', () => {
    expect(photoMgmtSource).toContain('PhotoAccessLogPanel')
    expect(photoMgmtViewSource).toContain('photo-access-log-panel')
    expect(photoMgmtViewSource).toContain('客户访问')
    expect(photoMgmtSource).toContain('loadPhotoAccessLogs')
    expect(photoMgmtSource).toContain('photoAccessLogsByAlbum')
    expect(photoMgmtViewSource).toContain('photoAccessLoading')
    expect(photoMgmtViewSource).toContain('photoAccessError')
    expect(usePhotoDeliveryActionsSource).toContain('summarizePhotoAccessLogs')
    expect(usePhotoDeliveryActionsSource).toContain('buildPhotoAccessEmptyHint')
    expect(usePhotoDeliveryActionsSource).toContain('buildPhotoAccessEmptyHint(true)')
    expect(photoMgmtViewSource).toContain('访问日志加载失败')
    expect(usePhotoDeliveryActionsSource).not.toContain('summarizePhotoAccessLogs([])')
    expect(photoMgmtSource).not.toContain('假访问')
    expect(photoMgmtSource).not.toContain('随机访问')
  })

  it('wires album operation actions to real store methods instead of disabled placeholders', () => {
    expect(photoMgmtSource).toContain('客片操作')
    expect(photoMgmtSource).toContain('通知客户')
    expect(photoMgmtSource).toContain('人工跟进')
    expect(photoMgmtSource).toContain('客片确认')
    expect(photoMgmtSource).toContain('资料发送')
    expect(photoMgmtSource).toContain('@click="handleAlbumNotify"')
    expect(photoMgmtSource).toContain('@click="handleAlbumConfirmSelection"')
    expect(photoMgmtSource).toContain('@click="handleAlbumDeliver"')
    expect(photoMgmtSource).toContain('usePhotoDeliveryActions')
    expect(usePhotoDeliveryActionsSource).toContain('input.notifyAlbum(')
    expect(usePhotoDeliveryActionsSource).toContain('input.confirmAlbumSelection(')
    expect(usePhotoDeliveryActionsSource).toContain('input.deliverAlbum(')
    expect(photoMgmtSource).toContain('albumActionFeedback')
    expect(photoMgmtSource).toContain('albumActionError')
    expect(usePhotoDeliveryActionsSource).toContain('if (result.fallback)')
    expect(usePhotoDeliveryActionsSource).toContain('已记录，需要人工跟进')
    expect(photoMgmtSource).not.toContain("action === 'notify' && result.fallback")
    expect(photoMgmtSource).not.toContain('已记录人工通知/待人工跟进')
    expect(photoMgmtSource).not.toContain('SMS/人工')
    expect(photoMgmtSource).toContain(":disabled=\"albumActionLoading === 'notify' || !canNotifyActiveAlbum\"")
    expect(photoMgmtSource).toContain(":disabled=\"albumActionLoading === 'confirm' || !canConfirmActiveAlbum\"")
    expect(photoMgmtSource).toContain(":disabled=\"albumActionLoading === 'deliver' || !canDeliverActiveAlbum\"")
    expect(photoMgmtSource).not.toContain('title="通知接口未接入"')
    expect(photoMgmtSource).not.toContain('建设中')
    expect(photoMgmtSource).toContain('待确认')
  })

  it('uses the real online selection route and avoids a fake sync action label', () => {
    expect(photoMgmtSource).toContain('生成/更新选片链接')
    expect(photoMgmtSource).toContain('打开选片管理')
    expect(photoMgmtSource).toContain('activeAlbumSelectionLink')
    expect(photoMgmtSource).toContain("path: '/service/selection'")
    expect(photoMgmtSource).not.toContain("path: '/online-selection'")
    expect(photoMgmtSource).not.toContain('同步至选片系统')
  })

  it('gates album operation buttons by delivery readiness to prevent staff misclicks', () => {
    expect(photoOpsSource).toContain('buildAlbumActionAvailability')
    expect(photoOpsSource).toContain('请先上传底片')
    expect(photoOpsSource).toContain('请先选择相册')
    expect(photoOpsSource).toContain('请先等待客户选片')
    expect(photoOpsSource).toContain('已交付无需重复发送')
    expect(photoMgmtSource).toContain('activeAlbumActionAvailability')
    expect(photoMgmtSource).toContain('canNotifyActiveAlbum')
    expect(photoMgmtSource).toContain('canConfirmActiveAlbum')
    expect(photoMgmtSource).toContain('canDeliverActiveAlbum')
    expect(photoMgmtSource).toContain('activeAlbumNeedsUpload')
    expect(photoMgmtSource).toContain('上传底片后再通知')
    expect(photoMgmtSource).toContain('当前未选择相册，通知、确认和交付动作已锁定。')
    expect(photoMgmtSource).toContain('请选择左侧相册后再继续客片交付动作。')
    expect(photoMgmtSource).toContain("{{ activeAlbum ? `已上传 ${activeAlbum.totalCount} · 已选 ${activeAlbum.selectedCount} · 待确认 ${Math.max(0, activeAlbum.totalCount - activeAlbum.selectedCount)}` : '请先选择相册' }}")
    expect(photoMgmtSource).toContain('activeAlbumActionAvailability.notify.reason')
    expect(photoMgmtSource).toContain('activeAlbumActionAvailability.confirm.reason')
    expect(photoMgmtSource).toContain('activeAlbumActionAvailability.deliver.reason')
    expect(photoMgmtSource).toContain(':title="activeAlbumActionAvailability.notify.reason || \'通知客户\'"')
    expect(photoMgmtSource).toContain(':title="activeAlbumActionAvailability.confirm.reason || \'客片确认\'"')
    expect(photoMgmtSource).toContain(':title="activeAlbumActionAvailability.deliver.reason || \'资料发送\'"')
    expect(photoMgmtSource).toContain(":disabled=\"albumActionLoading === 'notify' || !canNotifyActiveAlbum\"")
    expect(photoMgmtSource).toContain(":disabled=\"albumActionLoading === 'confirm' || !canConfirmActiveAlbum\"")
    expect(photoMgmtSource).toContain(":disabled=\"albumActionLoading === 'deliver' || !canDeliverActiveAlbum\"")
    expect(photoMgmtSource).toContain("{{ canNotifyActiveAlbum ? '人工跟进' : activeAlbumActionAvailability.notify.reason }}")
    expect(photoMgmtSource).toContain("{{ canConfirmActiveAlbum ? '提交确认' : activeAlbumActionAvailability.confirm.reason }}")
    expect(photoMgmtSource).toContain("{{ canDeliverActiveAlbum ? '最终交付' : activeAlbumActionAvailability.deliver.reason }}")
  })

  it('adds album action methods in appStore and backend api', () => {
    expect(appStoreSource).toContain('async notifyAlbum(albumId: string')
    expect(appStoreSource).toContain('async confirmAlbumSelection(albumId: string')
    expect(appStoreSource).toContain('async deliverAlbum(albumId: string')
    expect(appStoreSource).toContain('albumsStore.notifyAlbum(albumId, this.orders, payload)')
    expect(appStoreSource).toContain('albumsStore.confirmAlbumSelection(albumId, this.orders, payload)')
    expect(appStoreSource).toContain('albumsStore.deliverAlbum(albumId, this.orders, payload)')
    expect(backendSource).toContain('...createAlbumsApi')
    expect(backendContractSource).toContain('confirmAlbumSelection: (id: BackendId')
    expect(backendContractSource).toContain("`/yy/photoAlbum/${id}/selection/confirm`")
    expect(backendContractSource).toContain("`/yy/photoAlbum/${id}/deliver`")
    expect(backendContractSource).toContain("`/yy/photoAlbum/${id}/notify`")
  })

  it('renders the photo management page as a compact delivery console', () => {
    expect(photoMgmtSource).toContain('photo-hero')
    expect(photoMgmtViewSource).toContain('底片胶卷')
    expect(photoMgmtSource).toContain('上传底片')
    expect(photoMgmtSource).toContain('currentAlbumStats')
    expect(photoMgmtSource).toContain('photo-hero rounded-md border border-amber-topbar-border bg-amber-content-bg px-5 py-4')
    expect(photoMgmtSource).toContain('text-[22px] font-sans font-semibold')
    expect(photoMgmtSource).toContain('rounded-md border border-amber-topbar-border/70 bg-white px-3 py-2')
    expect(photoMgmtSource).not.toContain('rounded-[24px]')
  })
})
