import type { Router } from 'vue-router'
import { watch, type Ref } from 'vue'
import { appStore, type Album, type BookingOrder } from '../../../shared/stores/appStore'
import { buildOrderChannelDiagnosticText, getNextOrderAction, isInventoryConflictMessage } from '../orderOperations'
import { canConfirmStorePayment } from '../orderPaymentRules'
import type { AlbumActionAvailability, AlbumActionKey } from '../../albums/photoMgmtOperations'

type RescheduleDraft = {
  date: string
  time: string
  durationMinutes: number
  remark: string
}

type NoticeType = 'success' | 'error'

type AlbumActionResult = {
  fallback?: boolean
  requestId?: string
  message?: string
}

export function useOrderDetailActions(options: {
  router: Router
  todayKey: string
  selectedOrder: Ref<BookingOrder | null>
  slotRange: Ref<{ start: string; end: string }>
  slotScopedDashboardContext: Ref<{ date: string; storeId?: string; slotStart: string; slotEnd?: string } | null>
  cancelReason: Ref<string>
  cancellingOrderId: Ref<string>
  updatingOrderId: Ref<string>
  confirmingPaymentOrderId: Ref<string>
  reschedulingOrderId: Ref<string>
  rescheduleConflict: Ref<string>
  rescheduleDraft: RescheduleDraft
  orderAlbumActionLoading: Ref<'' | AlbumActionKey>
  orderPhotoAccessLoading: Ref<boolean>
  orderPhotoAccessError: Ref<string>
  orderPhotoAccessRequestId: Ref<number>
  operationLogsLoading: Ref<boolean>
  operationLogsReloadQueued: Ref<boolean>
  operationLogsNotice: Ref<string>
  selectedOrderAlbum: Ref<Album | null>
  selectedOrderAlbumActionAvailability: Ref<AlbumActionAvailability>
  reschedulePreviewConflictMessage: Ref<string>
  loadSlotScopedOrdersFromQuery: () => Promise<void>
  copyFieldText: (value: string, key: string) => Promise<boolean>
  notifyOrderAction: (type: NoticeType, message: string) => void
}) {
  const resetRescheduleDraft = (order: BookingOrder) => {
    options.rescheduleDraft.date = order.arrivalDate || options.todayKey
    options.rescheduleDraft.time = order.arrivalClock || '10:00'
    options.rescheduleDraft.durationMinutes = 60
    options.rescheduleDraft.remark = ''
    options.rescheduleConflict.value = ''
  }

  const applyCancelReason = (reason: string) => {
    options.cancelReason.value = reason
  }

  const applyRescheduleReason = (reason: string) => {
    options.rescheduleDraft.remark = reason
  }

  const addMinutesToClock = (clock: string, minutes: number) => {
    const [hour, minute] = clock.split(':').map(value => Number.parseInt(value, 10))
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return ''
    const totalMinutes = hour * 60 + minute + minutes
    const normalized = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60)
    const nextHour = Math.floor(normalized / 60)
    const nextMinute = normalized % 60
    return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`
  }

  const syncSlotScopeToOrder = (order: BookingOrder) => {
    if (!order.arrivalDate || !order.arrivalClock) return
    const durationMinutes = Math.max(30, Number(options.rescheduleDraft.durationMinutes) || 30)
    const nextStart = order.arrivalClock
    const nextEnd = addMinutesToClock(order.arrivalClock, durationMinutes) || options.slotRange.value.end || ''
    options.slotRange.value = {
      start: nextStart,
      end: nextEnd || '',
    }
    if (options.slotScopedDashboardContext.value) {
      options.slotScopedDashboardContext.value = {
        ...options.slotScopedDashboardContext.value,
        date: order.arrivalDate,
        storeId: order.storeBackendId || options.slotScopedDashboardContext.value.storeId,
        slotStart: nextStart,
        slotEnd: nextEnd || undefined,
      }
    }
  }

  let lastRescheduleInventoryKey = ''

  const loadRescheduleInventory = async (order: BookingOrder, date?: string) => {
    const targetDate = String(date || order.arrivalDate || options.todayKey || '').trim()
    if (appStore.demoMode || !order.storeBackendId || !targetDate) return
    const inventoryKey = [order.storeBackendId, order.serviceGroupBackendId || '', targetDate].join('|')
    if (lastRescheduleInventoryKey === inventoryKey) return
    lastRescheduleInventoryKey = inventoryKey
    try {
      await appStore.loadBookingInventory({
        date: targetDate,
        storeBackendId: order.storeBackendId,
        serviceGroupBackendId: order.serviceGroupBackendId || undefined,
      })
    } catch (error) {
      lastRescheduleInventoryKey = ''
      const message = error instanceof Error ? error.message : '加载失败'
      options.notifyOrderAction('error', `加载改期时段失败：${message}`)
    }
  }

  watch(
    [options.selectedOrder, () => options.rescheduleDraft.date],
    ([order, date]) => {
      if (!order) {
        lastRescheduleInventoryKey = ''
        return
      }
      void loadRescheduleInventory(order, date)
    },
    { immediate: true },
  )

  const loadOrderOperationLogs = async () => {
    if (appStore.demoMode) {
      options.operationLogsNotice.value = '演示模式不读取后台操作日志和渠道同步日志；操作记录使用本地基础时间线。'
      return
    }
    if (options.operationLogsLoading.value) {
      options.operationLogsReloadQueued.value = true
      return
    }
    options.operationLogsLoading.value = true
    options.operationLogsNotice.value = ''
    try {
      do {
        options.operationLogsReloadQueued.value = false
        await Promise.all([
          appStore.loadOperationLogs(),
          appStore.loadChannelSyncLogs(),
        ])
        options.operationLogsNotice.value = ''
      } while (options.operationLogsReloadQueued.value)
    } catch {
      options.operationLogsNotice.value = '操作日志或渠道同步日志读取失败，已保留基础时间线；不影响确认、改期和取消。'
    } finally {
      options.operationLogsLoading.value = false
    }
  }

  const openOrderDetail = (order: BookingOrder) => {
    options.selectedOrder.value = order
    options.cancelReason.value = ''
    resetRescheduleDraft(order)
    void loadOrderOperationLogs()
  }

  const goToAlbum = async (albumId: string) => {
    await options.router.push({ path: '/service/photos', query: { album: albumId } })
    options.selectedOrder.value = null
  }

  const goToPhotoManagement = async () => {
    await options.router.push('/service/photos')
    options.selectedOrder.value = null
  }

  const loadSelectedOrderPhotoAccessLogs = async (albumId: string) => {
    const requestId = options.orderPhotoAccessRequestId.value + 1
    options.orderPhotoAccessRequestId.value = requestId
    options.orderPhotoAccessLoading.value = true
    options.orderPhotoAccessError.value = ''
    try {
      await appStore.loadPhotoAccessLogs(albumId)
    } catch (error) {
      if (options.orderPhotoAccessRequestId.value === requestId) {
        options.orderPhotoAccessError.value = error instanceof Error ? error.message : '未知错误'
      }
    } finally {
      if (options.orderPhotoAccessRequestId.value === requestId) {
        options.orderPhotoAccessLoading.value = false
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
    action: AlbumActionKey,
    successLabel: string,
    runner: (albumId: string) => Promise<AlbumActionResult>,
  ) => {
    const album = options.selectedOrderAlbum.value
    if (!album || options.orderAlbumActionLoading.value) return
    const availability = options.selectedOrderAlbumActionAvailability.value[action]
    if (!availability.enabled) {
      options.notifyOrderAction('error', availability.reason)
      return
    }
    options.orderAlbumActionLoading.value = action
    try {
      const result = await runner(album.id)
      await refreshSelectedOrderAlbumEvidence(album.id)
      if (result.fallback) {
        options.notifyOrderAction('success', result.message?.trim() || `已记录人工通知/待人工跟进 · requestId ${result.requestId || 'fallback'}`)
      } else {
        options.notifyOrderAction('success', result.message?.trim() || successLabel)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败'
      options.notifyOrderAction('error', `${successLabel}失败：${message}`)
    } finally {
      options.orderAlbumActionLoading.value = ''
    }
  }

  const getSelectedOrderAlbumBackendId = () =>
    options.selectedOrderAlbum.value?.backendId || options.selectedOrderAlbum.value?.id || ''

  const handleOrderAlbumNotify = async () => {
    const albumBackendId = getSelectedOrderAlbumBackendId()
    await runOrderAlbumAction(
      'notify',
      '通知客户',
      albumId => appStore.notifyAlbum(albumId, {
        channelType: 'MANUAL',
        orderId: options.selectedOrder.value?.backendId,
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
        orderId: options.selectedOrder.value?.backendId,
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
        orderId: options.selectedOrder.value?.backendId,
        albumId: albumBackendId,
        remark: `订单详情发送资料 ${albumId}`,
      }),
    )
  }

  const copyField = async (value: string, key: string) => {
    const ok = await options.copyFieldText(value, key)
    if (ok) {
      options.notifyOrderAction('success', `已复制${key === 'phone' ? '手机号' : '订单号'}`)
    } else {
      options.notifyOrderAction('error', '复制失败，请手动选择文本复制')
    }
  }

  const copyOrderChannelDiagnostic = async () => {
    const order = options.selectedOrder.value
    if (!order) return
    const text = buildOrderChannelDiagnosticText(order, appStore.channelSyncLogs)
    const ok = await options.copyFieldText(text, 'channelDiagnostic')
    if (ok) {
      options.notifyOrderAction('success', '已复制渠道排障信息')
    } else {
      options.notifyOrderAction('error', '复制失败，请手动选择排障信息复制')
    }
  }

  const refreshOrderDetailAfterAdvance = async () => {
    await options.loadSlotScopedOrdersFromQuery()
    await loadOrderOperationLogs()
  }

  const advanceOrder = async (order: BookingOrder) => {
    const action = getNextOrderAction(order)
    if (!action || options.updatingOrderId.value) return
    appStore.rememberOrderForOperations(order)
    options.updatingOrderId.value = order.id
    let shouldRefresh = false
    try {
      const next = await appStore.updateOrderStatus(order.id, action.nextStatus)
      if (options.selectedOrder.value?.id === order.id) options.selectedOrder.value = next
      shouldRefresh = true
      const prefix = appStore.demoMode ? '演示模式已更新本页状态' : '订单状态已同步到后端'
      options.notifyOrderAction('success', `${prefix}：${order.customer} ${action.label}，当前为 ${action.nextStatus}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '订单状态更新失败'
      options.notifyOrderAction('error', `处理失败：${message}`)
    } finally {
      options.updatingOrderId.value = ''
    }
    if (shouldRefresh) await refreshOrderDetailAfterAdvance()
  }

  const cancelSelectedOrder = async () => {
    const order = options.selectedOrder.value
    if (!order || options.cancellingOrderId.value) return
    if (!options.cancelReason.value.trim()) {
      options.notifyOrderAction('error', '请输入取消原因')
      return
    }
    appStore.rememberOrderForOperations(order)
    options.cancellingOrderId.value = order.id
    try {
      const next = await appStore.updateOrderStatus(order.id, '已取消', options.cancelReason.value.trim())
      options.selectedOrder.value = next
      await options.loadSlotScopedOrdersFromQuery()
      await loadOrderOperationLogs()
      options.notifyOrderAction('success', `已取消预约：${next.customer || next.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '取消失败'
      options.notifyOrderAction('error', `取消失败：${message}`)
    } finally {
      options.cancellingOrderId.value = ''
    }
  }

  const confirmSelectedOrderPayment = async () => {
    const order = options.selectedOrder.value
    if (!order || options.confirmingPaymentOrderId.value) return
    if (!canConfirmStorePayment(order)) {
      options.notifyOrderAction('error', '当前订单不可确认收款')
      return
    }
    appStore.rememberOrderForOperations(order)
    options.confirmingPaymentOrderId.value = order.id
    try {
      const next = await appStore.confirmOrderPayment({
        id: order.id,
        amountCent: Math.round(Number(order.amount || 0) * 100),
        remark: '门店确认收款（非第三方平台支付）',
      })
      options.selectedOrder.value = next
      await appStore.refreshOrderOperationalScope(next)
      await options.loadSlotScopedOrdersFromQuery()
      await loadOrderOperationLogs()
      options.notifyOrderAction('success', '门店确认收款已同步到后端，不是第三方平台支付')
    } catch (error) {
      const message = error instanceof Error ? error.message : '确认收款失败'
      options.notifyOrderAction('error', `确认收款失败：${message}`)
    } finally {
      options.confirmingPaymentOrderId.value = ''
    }
  }

  const rescheduleSelectedOrder = async () => {
    const order = options.selectedOrder.value
    if (!order || options.reschedulingOrderId.value) return
    appStore.rememberOrderForOperations(order)
    options.rescheduleConflict.value = ''
    if (options.reschedulePreviewConflictMessage.value) {
      options.rescheduleConflict.value = options.reschedulePreviewConflictMessage.value
      options.notifyOrderAction('error', `库存冲突：${options.reschedulePreviewConflictMessage.value}`)
      return
    }
    options.reschedulingOrderId.value = order.id
    try {
      const next = await appStore.rescheduleOrder(order.id, {
        date: options.rescheduleDraft.date,
        time: options.rescheduleDraft.time,
        durationMinutes: options.rescheduleDraft.durationMinutes,
        remark: options.rescheduleDraft.remark,
      })
      options.selectedOrder.value = next
      syncSlotScopeToOrder(next)
      resetRescheduleDraft(next)
      await options.loadSlotScopedOrdersFromQuery()
      await loadOrderOperationLogs()
      const prefix = appStore.demoMode ? '演示模式已改期' : '改期已同步到后端'
      options.notifyOrderAction('success', `${prefix}：${next.customer} 到店时间 ${next.arrivalDate} ${next.arrivalClock}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '改期失败'
      if (isInventoryConflictMessage(message)) {
        options.rescheduleConflict.value = message
        options.notifyOrderAction('error', `库存冲突：${message}`)
      } else {
        options.notifyOrderAction('error', `改期失败：${message}`)
      }
    } finally {
      options.reschedulingOrderId.value = ''
    }
  }

  return {
    resetRescheduleDraft,
    applyCancelReason,
    applyRescheduleReason,
    loadOrderOperationLogs,
    openOrderDetail,
    goToAlbum,
    goToPhotoManagement,
    loadSelectedOrderPhotoAccessLogs,
    refreshSelectedOrderAlbumEvidence,
    runOrderAlbumAction,
    handleOrderAlbumNotify,
    handleOrderAlbumConfirm,
    handleOrderAlbumDeliver,
    copyField,
    copyOrderChannelDiagnostic,
    refreshOrderDetailAfterAdvance,
    advanceOrder,
    canConfirmPayment: canConfirmStorePayment,
    cancelSelectedOrder,
    confirmSelectedOrderPayment,
    rescheduleSelectedOrder,
  }
}
