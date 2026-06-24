import { computed } from 'vue'
import { appStore } from '../../../shared/stores/appStore'
import {
  buildOrderCancelGuidance,
  buildOrderDetailTimeline,
  buildOrderFlowSteps,
  buildOrderOperationEvidenceCards,
  buildOrderPhotoDeliveryStage,
  buildOrderRescheduleConflictMessage,
  buildOrderSourceContext,
  getNextOrderAction,
  getNextOrderHint,
  getOrderChannelSyncLogs,
  getOrderRescheduleInventorySlot,
} from '../orderOperations'
import { buildAlbumActionAvailability, summarizePhotoAccessLogs } from '../../albums/photoMgmtOperations'
import type { BookingOrder, BookingInventorySlot } from '../../../shared/stores/appStore'

export function useOrderDetail(
  state: {
    selectedOrder: { value: BookingOrder | null }
    rescheduleDraft: { date: string; time: string; durationMinutes: number; remark: string }
    operationLogsLoading: { value: boolean }
    operationLogsNotice: { value: string }
  },
) {
  const selectedOrderAlbum = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return null
    return appStore.albums.find(
      album => album.orderBackendId === order.backendId || album.orderId === order.id,
    ) ?? null
  })

  const selectedOrderPhotoStage = computed(() => buildOrderPhotoDeliveryStage(selectedOrderAlbum.value))
  const selectedOrderAlbumActionAvailability = computed(() => buildAlbumActionAvailability(selectedOrderAlbum.value))
  const canNotifySelectedOrderAlbum = computed(() => selectedOrderAlbumActionAvailability.value.notify.enabled)
  const canConfirmSelectedOrderAlbum = computed(() => selectedOrderAlbumActionAvailability.value.confirm.enabled)
  const canDeliverSelectedOrderAlbum = computed(() => selectedOrderAlbumActionAvailability.value.deliver.enabled)

  const selectedOrderPhotoAccessLogs = computed(() => {
    const album = selectedOrderAlbum.value
    if (!album) return []
    return summarizePhotoAccessLogs(appStore.photoAccessLogsByAlbum[album.id] ?? []).slice(0, 5)
  })

  const selectedOrderProduct = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return null
    return appStore.products.find(p => p.backendId === order.productBackendId) ?? null
  })

  const selectedOrderSelectionLink = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return null
    return appStore.selectionLinks.find(
      link => link.orderBackendId === order.backendId || link.orderId === order.id,
    ) ?? null
  })

  const selectedOrderAddonSummary = computed(() => {
    const link = selectedOrderSelectionLink.value
    if (!link) return '当前订单还没有加购/加选记录'
    if (link.extraCount > 0) return `已加选 ${link.extraCount} 张`
    if (link.selectedCount > 0) return '当前已选片，暂未产生加购/加选'
    return '客户尚未选片，暂无加购/加选'
  })

  const selectedOrderSyncLogs = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return []
    return getOrderChannelSyncLogs(order, appStore.channelSyncLogs)
  })

  const selectedOrderCancelGuidance = computed(() => {
    const order = state.selectedOrder.value
    return order ? buildOrderCancelGuidance(order) : { tone: 'neutral' as const, title: '', body: '' }
  })

  const selectedOrderSourceContext = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return { title: '', badge: 'ORDER' as const, tone: 'neutral' as const, description: '', details: [] }
    return buildOrderSourceContext(order)
  })

  const clockToMinutes = (clock: string) => {
    const match = clock.trim().match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return Number.NaN
    return Number(match[1]) * 60 + Number(match[2])
  }

  const selectedOrderCurrentSlot = computed(() => {
    const order = state.selectedOrder.value
    if (!order?.storeBackendId) return null
    if (order.inventorySlotId) {
      const byId = appStore.bookingInventory.find(slot =>
        slot.backendId === order.inventorySlotId && slot.storeBackendId === order.storeBackendId)
      if (byId) return byId
    }
    if (!order.arrivalDate || !order.arrivalClock) return null
    const arrivalMinutes = clockToMinutes(order.arrivalClock)
    if (!Number.isFinite(arrivalMinutes)) return null
    return appStore.bookingInventory.find(slot => {
      if (slot.storeBackendId !== order.storeBackendId) return false
      if (slot.date !== order.arrivalDate) return false
      if (order.serviceGroupBackendId && slot.serviceGroupBackendId && slot.serviceGroupBackendId !== order.serviceGroupBackendId) return false
      if (order.externalSkuId && slot.externalSkuId && slot.externalSkuId !== order.externalSkuId) return false
      const start = clockToMinutes(slot.startTime)
      const end = clockToMinutes(slot.endTime)
      if (!Number.isFinite(start) || !Number.isFinite(end)) return false
      return arrivalMinutes >= start && arrivalMinutes < end
    }) ?? null
  })

  const selectedOrderSlotTimeLabel = computed(() => {
    const order = state.selectedOrder.value
    if (!order?.arrivalDate || !order.arrivalClock) return '未排期'
    const slot = selectedOrderCurrentSlot.value
    if (slot) return `${order.arrivalDate} ${slot.startTime}-${slot.endTime}`
    return `${order.arrivalDate} ${order.arrivalClock}`
  })

  const selectedOrderCapacitySummary = computed(() => {
    const order = state.selectedOrder.value
    if (!order?.arrivalDate || !order.arrivalClock) return '缺真实预约时段，不写入今日排期。'
    const slot = selectedOrderCurrentSlot.value
    if (!slot) return '未命中容量账本；保存改期或新增预约时后端仍会最终校验。'
    const remaining = Math.max(0, slot.capacity - slot.confirmedCount)
    const state_ = slot.conflictCount > 0
      ? `冲突 ${slot.conflictCount}`
      : remaining <= 0 ? '已满' : `剩余 ${remaining}`
    return `${slot.serviceGroupName || '未分组'} · 容量 ${slot.capacity} / 已约 ${slot.confirmedCount} / ${state_}`
  })

  const selectedOrderStoreScopeText = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return ''
    if (!order.storeBackendId) return '缺门店映射，需要先补真实门店。'
    return `${order.store} · storeId ${order.storeBackendId}`
  })

  const selectedOrderNextActionLabel = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return ''
    return getNextOrderAction(order)?.label ?? '无后续状态动作'
  })

  const selectedOrderOperationalHint = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return ''
    const conflictCount = selectedOrderCurrentSlot.value?.conflictCount ?? 0
    if (conflictCount > 0) return `先处理库存冲突 ${conflictCount} 条，再继续履约动作。`
    return getNextOrderHint(order)
  })

  const selectedOrderTimeline = computed(() => {
    const order = state.selectedOrder.value
    return order
      ? buildOrderDetailTimeline(order, selectedOrderAlbum.value, appStore.channelSyncLogs, appStore.operationLogs)
      : []
  })

  const selectedOrderOperationEvidenceCards = computed(() => {
    const order = state.selectedOrder.value
    return order ? buildOrderOperationEvidenceCards(order, appStore.operationLogs, 3) : []
  })

  const operationLogsStateText = computed(() => {
    if (state.operationLogsLoading.value) return '正在同步后台操作日志...'
    return state.operationLogsNotice.value
  })

  const reschedulePreviewSlot = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return null
    return getOrderRescheduleInventorySlot(order, appStore.bookingInventory, state.rescheduleDraft)
  })

  const reschedulePreviewConflictMessage = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return ''
    return buildOrderRescheduleConflictMessage(order, appStore.bookingInventory, state.rescheduleDraft)
  })

  const matchesSelectedOrderInventoryDimension = (slot: BookingInventorySlot) => {
    const order = state.selectedOrder.value
    if (!order) return false
    if (order.serviceGroupBackendId && slot.serviceGroupBackendId && slot.serviceGroupBackendId !== order.serviceGroupBackendId) return false
    if (order.externalSkuId && slot.externalSkuId && slot.externalSkuId !== order.externalSkuId) return false
    return true
  }

  const rescheduleSlotOptions = computed(() => {
    const order = state.selectedOrder.value
    if (!order?.storeBackendId || !state.rescheduleDraft.date) return []
    return appStore.bookingInventory
      .filter(slot =>
        slot.storeBackendId === order.storeBackendId
        && slot.date === state.rescheduleDraft.date
        && matchesSelectedOrderInventoryDimension(slot))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  const isRescheduleSlotSelected = (slot: BookingInventorySlot) =>
    state.rescheduleDraft.date === slot.date && state.rescheduleDraft.time === slot.startTime

  const applyRescheduleSlot = (slot: BookingInventorySlot) => {
    state.rescheduleDraft.date = slot.date
    state.rescheduleDraft.time = slot.startTime
    const start = clockToMinutes(slot.startTime)
    const end = clockToMinutes(slot.endTime)
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      state.rescheduleDraft.durationMinutes = end - start
    }
  }

  const buildRescheduleSlotOptionMeta = (slot: BookingInventorySlot) => {
    const remaining = Math.max(0, slot.capacity - slot.confirmedCount)
    if (slot.conflictCount > 0) return `容量 ${slot.capacity} · 冲突 ${slot.conflictCount}`
    if (remaining <= 0) return `容量 ${slot.capacity} · 已满`
    return `容量 ${slot.capacity} · 剩余 ${remaining}`
  }

  const orderFlowSteps = computed(() => {
    const order = state.selectedOrder.value
    if (!order) return []
    return buildOrderFlowSteps(order)
  })

  return {
    selectedOrderAlbum, selectedOrderPhotoStage,
    selectedOrderAlbumActionAvailability, canNotifySelectedOrderAlbum,
    canConfirmSelectedOrderAlbum, canDeliverSelectedOrderAlbum,
    selectedOrderPhotoAccessLogs, selectedOrderProduct,
    selectedOrderSelectionLink, selectedOrderAddonSummary,
    selectedOrderSyncLogs, selectedOrderCancelGuidance,
    selectedOrderSourceContext, selectedOrderCurrentSlot,
    selectedOrderSlotTimeLabel, selectedOrderCapacitySummary,
    selectedOrderStoreScopeText, selectedOrderNextActionLabel,
    selectedOrderOperationalHint, selectedOrderTimeline,
    selectedOrderOperationEvidenceCards, operationLogsStateText,
    reschedulePreviewSlot, reschedulePreviewConflictMessage,
    matchesSelectedOrderInventoryDimension, rescheduleSlotOptions,
    isRescheduleSlotSelected, applyRescheduleSlot,
    buildRescheduleSlotOptionMeta, orderFlowSteps,
  }
}
