import { ref, type ComputedRef, type Ref } from 'vue'
import type { Router } from 'vue-router'
import { appStore, type Album, type BookingOrder } from '../../../shared/stores/appStore'
import type { AlbumActionAvailability } from '../../albums/photoMgmtOperations'

type OrderAlbumAction = 'notify' | 'confirm' | 'deliver'

type AlbumActionResult = {
  fallback?: boolean
  requestId?: string
  message?: string
}

export type UseOrderAlbumActionsParams = {
  router: Router
  selectedOrder: Ref<BookingOrder | null>
  selectedOrderAlbum: ComputedRef<Album | null>
  selectedOrderAlbumActionAvailability: ComputedRef<AlbumActionAvailability>
  loadOrderOperationLogs: () => Promise<void>
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export function useOrderAlbumActions(params: UseOrderAlbumActionsParams) {
  const {
    router,
    selectedOrder,
    selectedOrderAlbum,
    selectedOrderAlbumActionAvailability,
    loadOrderOperationLogs,
    notifyOrderAction,
  } = params

  const orderAlbumActionLoading = ref<'' | OrderAlbumAction>('')
  const orderPhotoAccessLoading = ref(false)
  const orderPhotoAccessError = ref('')
  const orderPhotoAccessRequestId = ref(0)

  const goToAlbum = async (albumId: string) => {
    await router.push({ path: '/service/photos', query: { album: albumId } })
    selectedOrder.value = null
  }

  const goToPhotoManagement = async () => {
    await router.push('/service/photos')
    selectedOrder.value = null
  }

  const loadSelectedOrderPhotoAccessLogs = async (albumId: string) => {
    const requestId = orderPhotoAccessRequestId.value + 1
    orderPhotoAccessRequestId.value = requestId
    orderPhotoAccessLoading.value = true
    orderPhotoAccessError.value = ''
    try {
      await appStore.loadPhotoAccessLogs(albumId)
    } catch (error) {
      if (orderPhotoAccessRequestId.value === requestId) {
        orderPhotoAccessError.value = error instanceof Error ? error.message : '未知错误'
      }
    } finally {
      if (orderPhotoAccessRequestId.value === requestId) {
        orderPhotoAccessLoading.value = false
      }
    }
  }

  const refreshSelectedOrderAlbumEvidence = async (albumId: string) => {
    await Promise.allSettled([
      appStore.loadAlbumDetails(albumId),
      loadSelectedOrderPhotoAccessLogs(albumId),
      loadOrderOperationLogs(),
    ])
  }

  const runOrderAlbumAction = async (
    action: OrderAlbumAction,
    successLabel: string,
    runner: (albumId: string) => Promise<AlbumActionResult>,
  ) => {
    const album = selectedOrderAlbum.value
    if (!album || orderAlbumActionLoading.value) return
    const availability = selectedOrderAlbumActionAvailability.value[action]
    if (!availability.enabled) {
      notifyOrderAction('error', availability.reason)
      return
    }
    orderAlbumActionLoading.value = action
    try {
      const result = await runner(album.id)
      await refreshSelectedOrderAlbumEvidence(album.id)
      if (result.fallback) {
        notifyOrderAction('success', result.message?.trim() || `已记录人工通知/待人工跟进 · requestId ${result.requestId || 'fallback'}`)
      } else {
        notifyOrderAction('success', result.message?.trim() || successLabel)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败'
      notifyOrderAction('error', `${successLabel}失败：${message}`)
    } finally {
      orderAlbumActionLoading.value = ''
    }
  }

  const getSelectedOrderAlbumBackendId = () => selectedOrderAlbum.value?.backendId || selectedOrderAlbum.value?.id || ''

  const handleOrderAlbumNotify = async () => {
    const albumBackendId = getSelectedOrderAlbumBackendId()
    await runOrderAlbumAction(
      'notify',
      '通知客户',
      albumId => appStore.notifyAlbum(albumId, {
        channelType: 'MANUAL',
        orderId: selectedOrder.value?.backendId,
        albumId: albumBackendId,
        remark: `订单详情通知客户 ${albumId}`,
      }),
    )
  }

  const handleOrderAlbumConfirm = async () => {
    const albumBackendId = getSelectedOrderAlbumBackendId()
    await runOrderAlbumAction(
      'confirm',
      '客片确认',
      albumId => appStore.confirmAlbumSelection(albumId, {
        orderId: selectedOrder.value?.backendId,
        albumId: albumBackendId,
        remark: `订单详情确认客片 ${albumId}`,
      }),
    )
  }

  const handleOrderAlbumDeliver = async () => {
    const albumBackendId = getSelectedOrderAlbumBackendId()
    await runOrderAlbumAction(
      'deliver',
      '资料发送',
      albumId => appStore.deliverAlbum(albumId, {
        orderId: selectedOrder.value?.backendId,
        albumId: albumBackendId,
        remark: `订单详情发送资料 ${albumId}`,
      }),
    )
  }

  return {
    orderAlbumActionLoading,
    orderPhotoAccessLoading,
    orderPhotoAccessError,
    goToAlbum,
    goToPhotoManagement,
    loadSelectedOrderPhotoAccessLogs,
    refreshSelectedOrderAlbumEvidence,
    handleOrderAlbumNotify,
    handleOrderAlbumConfirm,
    handleOrderAlbumDeliver,
  }
}
