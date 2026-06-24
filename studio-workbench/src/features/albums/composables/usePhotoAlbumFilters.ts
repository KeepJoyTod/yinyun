import { computed, onMounted, ref, watch } from 'vue'
import { useRouteQueryFilters } from '../../../shared/composables/useRouteQueryFilters'
import type { Album, BookingOrder, SelectionLink } from '../../../shared/stores/appStore'
import { albumProgress, buildAlbumActionAvailability } from '../photoMgmtOperations'

export const albumNeedsUpload = (album: Album) => album.totalCount === 0 || album.negatives.length === 0

export function usePhotoAlbumFilters(input: {
  albums: () => Album[]
  orders: () => BookingOrder[]
  selectionLinks: () => SelectionLink[]
}) {
  const allAlbums = computed(() => input.albums())
  const filterStatus = ref('全部')
  const filterPhotographer = ref('全部摄影师')
  const filterSearch = ref('')
  const filterDate = ref('')
  const filterNeedsUpload = ref(false)
  const activeAlbumId = ref(input.albums()[0]?.id ?? '')

  const photographerOptions = computed(() => {
    const set = new Set<string>()
    for (const album of allAlbums.value) {
      if (album.photographer) set.add(album.photographer)
    }
    return ['全部摄影师', ...[...set].sort()]
  })

  const filteredAlbums = computed(() => {
    const keyword = filterSearch.value.trim().toLowerCase()
    return allAlbums.value.filter(album => {
      if (filterDate.value && album.date !== filterDate.value) return false
      if (filterNeedsUpload.value && !albumNeedsUpload(album)) return false
      if (filterStatus.value !== '全部' && album.status !== filterStatus.value) return false
      if (filterPhotographer.value !== '全部摄影师' && album.photographer !== filterPhotographer.value) return false
      if (keyword) {
        const hay = `${album.customer} ${album.id} ${album.orderId}`.toLowerCase()
        if (!hay.includes(keyword)) return false
      }
      return true
    })
  })

  const activeAlbum = computed(() => allAlbums.value.find(album => album.id === activeAlbumId.value))
  const activeAlbumOrder = computed(() => input.orders().find(order => order.id === activeAlbum.value?.orderId))
  const activeAlbumSelectionLink = computed(() => {
    const album = activeAlbum.value
    if (!album) return null
    return input.selectionLinks().find(link =>
      link.albumId === album.id
      || link.albumBackendId === album.backendId
      || link.orderId === album.orderId,
    ) ?? null
  })

  const totalPhotoCount = computed(() => allAlbums.value.reduce((sum, album) => sum + album.totalCount, 0))
  const readyAlbumCount = computed(() => allAlbums.value.filter(album => album.totalCount > 0 && album.status !== '已交付').length)
  const needsUploadCount = computed(() => allAlbums.value.filter(albumNeedsUpload).length)
  const activeProgressPercent = computed(() => (activeAlbum.value ? albumProgress(activeAlbum.value) : 0))
  const currentAlbumStats = computed(() => [
    { label: '当前相册', value: String(filteredAlbums.value.length), hint: '按筛选条件可见的相册数' },
    { label: '待上传', value: String(needsUploadCount.value), hint: '需要补底片或补全图片的相册' },
    { label: '已完成', value: String(readyAlbumCount.value), hint: '可继续选片或已交付的相册' },
  ])

  const activeAlbumActionLabel = computed(() => {
    const album = activeAlbum.value
    if (!album) return '等待选择相册'
    if (albumNeedsUpload(album)) return '先上传底片'
    if (album.selectedCount === 0) return '生成取片入口'
    if (album.status === '已交付') return '归档完成'
    return '跟进客户选片'
  })

  const activeAlbumActionHint = computed(() => {
    const album = activeAlbum.value
    if (!album) return '从左侧选择一个客户相册查看交付状态。'
    if (albumNeedsUpload(album)) return '门店修完照片后先上传到底片区，再生成选片链接给客户。'
    if (album.selectedCount === 0) return '当前还没有客户选片记录，建议生成链接并发送给客户。'
    if (album.status === '已交付') return '该相册已完成交付，可用于售后查看和复购沟通。'
    return '客户已有选片进度，下一步确认精修、加片和最终交付。'
  })

  const activeAlbumActionAvailability = computed(() => buildAlbumActionAvailability(activeAlbum.value))
  const canNotifyActiveAlbum = computed(() => activeAlbumActionAvailability.value.notify.enabled)
  const canConfirmActiveAlbum = computed(() => activeAlbumActionAvailability.value.confirm.enabled)
  const canDeliverActiveAlbum = computed(() => activeAlbumActionAvailability.value.deliver.enabled)
  const activeAlbumNeedsUpload = computed(() => activeAlbum.value ? albumNeedsUpload(activeAlbum.value) : false)

  const { applyFromQuery, syncToUrl, isDateKey } = useRouteQueryFilters({
    buildQuery: () => ({
      status: filterStatus.value === '全部' ? '' : filterStatus.value,
      photographer: filterPhotographer.value === '全部摄影师' ? '' : filterPhotographer.value,
      q: filterSearch.value.trim(),
      date: filterDate.value,
      needsUpload: filterNeedsUpload.value ? '1' : '',
      album: activeAlbumId.value === (allAlbums.value[0]?.id ?? '') ? '' : activeAlbumId.value,
    }),
    parseQuery: get => {
      const date = get('date')
      if (date && isDateKey(date)) filterDate.value = date
      filterNeedsUpload.value = get('needsUpload') === '1'
      const status = get('status')
      if (status) filterStatus.value = status
      const photographer = get('photographer')
      if (photographer) filterPhotographer.value = photographer
      const q = get('q')
      if (q) filterSearch.value = q
      const album = get('album')
      if (album && allAlbums.value.some(item => item.id === album)) activeAlbumId.value = album
    },
  })

  onMounted(() => {
    applyFromQuery()
  })

  watch([filterStatus, filterPhotographer, filterSearch, filterDate, filterNeedsUpload, activeAlbumId], () => {
    syncToUrl()
  })

  const hasActiveFilter = computed(
    () => filterStatus.value !== '全部'
      || filterPhotographer.value !== '全部摄影师'
      || filterSearch.value.trim() !== ''
      || filterDate.value !== ''
      || filterNeedsUpload.value,
  )

  const resetFilter = () => {
    filterStatus.value = '全部'
    filterPhotographer.value = '全部摄影师'
    filterSearch.value = ''
    filterDate.value = ''
    filterNeedsUpload.value = false
  }

  return {
    allAlbums,
    filterStatus,
    filterPhotographer,
    filterSearch,
    filterDate,
    filterNeedsUpload,
    photographerOptions,
    filteredAlbums,
    albums: filteredAlbums,
    activeAlbumId,
    activeAlbum,
    activeAlbumOrder,
    activeAlbumSelectionLink,
    albumProgress,
    totalPhotoCount,
    readyAlbumCount,
    needsUploadCount,
    activeProgressPercent,
    currentAlbumStats,
    activeAlbumActionLabel,
    activeAlbumActionHint,
    activeAlbumActionAvailability,
    canNotifyActiveAlbum,
    canConfirmActiveAlbum,
    canDeliverActiveAlbum,
    activeAlbumNeedsUpload,
    hasActiveFilter,
    resetFilter,
  }
}
