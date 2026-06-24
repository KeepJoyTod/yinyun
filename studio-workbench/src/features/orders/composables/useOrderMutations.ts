import { computed, reactive, ref, type Ref, type ComputedRef } from 'vue'
import type { BookingOrder, BookingInventorySlot } from '../../../shared/stores/appStore'
import { appStore } from '../../../shared/stores/appStore'
import type { OrderSlotRange } from '../orderOperations'
import {
  getOrderRescheduleInventorySlot,
  buildOrderRescheduleConflictMessage,
  getNextOrderAction,
  isInventoryConflictMessage,
} from '../orderOperations'

export type UseOrderMutationsParams = {
  selectedOrder: Ref<BookingOrder | null>
  selectedOrderCurrentSlot: ComputedRef<BookingInventorySlot | null>
  todayKey: string
  slotRange: Ref<OrderSlotRange>
  slotScopedDashboardContext: Ref<{
    date: string
    storeId?: string
    slotStart: string
    slotEnd?: string
  } | null>
  loadSlotScopedOrdersFromQuery: () => Promise<void>
  loadOrderOperationLogs: () => Promise<void>
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export type UseOrderMutationsReturn = {
  cancelReason: Ref<string>
  cancellingOrderId: Ref<string>
  updatingOrderId: Ref<string>
  reschedulingOrderId: Ref<string>
  rescheduleConflict: Ref<string>
  rescheduleDraft: ReturnType<typeof reactive<{ date: string; time: string; durationMinutes: number; remark: string }>>
  cancelReasonOptions: string[]
  rescheduleReasonOptions: string[]
  resetRescheduleDraft: (order: BookingOrder) => void
  applyCancelReason: (reason: string) => void
  applyRescheduleReason: (reason: string) => void
  reschedulePreviewSlot: ComputedRef<BookingInventorySlot | null>
  reschedulePreviewConflictMessage: ComputedRef<string>
  rescheduleSlotOptions: ComputedRef<BookingInventorySlot[]>
  isRescheduleSlotSelected: (slot: BookingInventorySlot) => boolean
  applyRescheduleSlot: (slot: BookingInventorySlot) => void
  buildRescheduleSlotOptionMeta: (slot: BookingInventorySlot) => string
  advanceOrder: (order: BookingOrder) => Promise<void>
  cancelSelectedOrder: () => Promise<void>
  rescheduleSelectedOrder: () => Promise<void>
}

export function useOrderMutations(params: UseOrderMutationsParams): UseOrderMutationsReturn {
  const {
    selectedOrder,
    selectedOrderCurrentSlot,
    todayKey,
    slotRange,
    slotScopedDashboardContext,
    loadSlotScopedOrdersFromQuery,
    loadOrderOperationLogs,
    notifyOrderAction,
  } = params

  const cancelReason = ref('')
  const cancellingOrderId = ref('')
  const updatingOrderId = ref('')
  const reschedulingOrderId = ref('')
  const rescheduleConflict = ref('')

  const rescheduleDraft = reactive({
    date: '',
    time: '',
    durationMinutes: 60,
    remark: '',
  })

  const cancelReasonOptions = ['客户主动取消', '客户未到店', '重复预约/录入错误', '门店容量调整']
  const rescheduleReasonOptions = ['客户要求改期', '客户迟到顺延', '门店调整时段', '原时段满员改派']

  const resetRescheduleDraft = (order: BookingOrder) => {
    rescheduleDraft.date = order.arrivalDate || todayKey
    rescheduleDraft.time = order.arrivalClock || '10:00'
    rescheduleDraft.durationMinutes = 60
    rescheduleDraft.remark = ''
    rescheduleConflict.value = ''
  }

  const applyCancelReason = (reason: string) => {
    cancelReason.value = reason
  }

  const applyRescheduleReason = (reason: string) => {
    rescheduleDraft.remark = reason
  }

  const clockToMinutes = (clock: string) => {
    const match = clock.trim().match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return Number.NaN
    return Number(match[1]) * 60 + Number(match[2])
  }

  const matchesSelectedOrderInventoryDimension = (slot: BookingInventorySlot) => {
    const order = selectedOrder.value
    if (!order) return false
    if (order.serviceGroupBackendId && slot.serviceGroupBackendId && slot.serviceGroupBackendId !== order.serviceGroupBackendId) return false
    if (order.externalSkuId && slot.externalSkuId && slot.externalSkuId !== order.externalSkuId) return false
    return true
  }

  const reschedulePreviewSlot = computed(() => {
    const order = selectedOrder.value
    if (!order) return null
    return getOrderRescheduleInventorySlot(order, appStore.bookingInventory, rescheduleDraft)
  })

  const reschedulePreviewConflictMessage = computed(() => {
    const order = selectedOrder.value
    if (!order) return ''
    return buildOrderRescheduleConflictMessage(order, appStore.bookingInventory, rescheduleDraft)
  })

  const rescheduleSlotOptions = computed(() => {
    const order = selectedOrder.value
    if (!order?.storeBackendId || !rescheduleDraft.date) return []
    return appStore.bookingInventory
      .filter(slot =>
        slot.storeBackendId === order.storeBackendId
        && slot.date === rescheduleDraft.date
        && matchesSelectedOrderInventoryDimension(slot),
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  const isRescheduleSlotSelected = (slot: BookingInventorySlot) =>
    rescheduleDraft.date === slot.date && rescheduleDraft.time === slot.startTime

  const applyRescheduleSlot = (slot: BookingInventorySlot) => {
    rescheduleDraft.date = slot.date
    rescheduleDraft.time = slot.startTime
    const start = clockToMinutes(slot.startTime)
    const end = clockToMinutes(slot.endTime)
    if (Number.isFinite(start) && Number.isFinite(end) && end > start) {
      rescheduleDraft.durationMinutes = end - start
    }
  }

  const buildRescheduleSlotOptionMeta = (slot: BookingInventorySlot) => {
    const remaining = Math.max(0, slot.capacity - slot.confirmedCount)
    if (slot.conflictCount > 0) return `容量 ${slot.capacity} · 冲突 ${slot.conflictCount}`
    if (remaining <= 0) return `容量 ${slot.capacity} · 已满`
    return `容量 ${slot.capacity} · 剩余 ${remaining}`
  }

  const syncSlotScopeToOrder = (order: BookingOrder) => {
    if (!order.arrivalDate || !order.arrivalClock) return
    const nextSlot = selectedOrderCurrentSlot.value
    const nextStart = nextSlot?.startTime || order.arrivalClock
    const nextEnd = nextSlot?.endTime || slotRange.value.end || undefined
    slotRange.value = {
      start: nextStart,
      end: nextEnd || '',
    }
    if (slotScopedDashboardContext.value) {
      slotScopedDashboardContext.value = {
        ...slotScopedDashboardContext.value,
        date: order.arrivalDate,
        slotStart: nextStart,
        slotEnd: nextEnd,
      }
    }
  }

  const refreshOrderDetailAfterAdvance = async () => {
    await Promise.all([
      loadSlotScopedOrdersFromQuery(),
      loadOrderOperationLogs(),
    ])
  }

  const advanceOrder = async (order: BookingOrder) => {
    const action = getNextOrderAction(order)
    if (!action || updatingOrderId.value) return
    appStore.rememberOrderForOperations(order)
    updatingOrderId.value = order.id
    let shouldRefresh = false
    try {
      const next = await appStore.updateOrderStatus(order.id, action.nextStatus)
      if (selectedOrder.value?.id === order.id) selectedOrder.value = next
      shouldRefresh = true
      const prefix = appStore.demoMode ? '演示模式已更新本页状态' : '订单状态已同步到后端'
      notifyOrderAction('success', `${prefix}：${order.customer} ${action.label}，当前为 ${action.nextStatus}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '订单状态更新失败'
      notifyOrderAction('error', `处理失败：${message}`)
    } finally {
      updatingOrderId.value = ''
    }
    if (shouldRefresh) await refreshOrderDetailAfterAdvance()
  }

  const cancelSelectedOrder = async () => {
    const order = selectedOrder.value
    if (!order || cancellingOrderId.value) return
    if (!cancelReason.value.trim()) {
      notifyOrderAction('error', '请输入取消原因')
      return
    }
    appStore.rememberOrderForOperations(order)
    cancellingOrderId.value = order.id
    try {
      const next = await appStore.updateOrderStatus(order.id, '已取消', cancelReason.value.trim())
      selectedOrder.value = next
      await loadSlotScopedOrdersFromQuery()
      await loadOrderOperationLogs()
      notifyOrderAction('success', `已取消预约：${next.customer || next.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '取消失败'
      notifyOrderAction('error', `取消失败：${message}`)
    } finally {
      cancellingOrderId.value = ''
    }
  }

  const rescheduleSelectedOrder = async () => {
    const order = selectedOrder.value
    if (!order || reschedulingOrderId.value) return
    appStore.rememberOrderForOperations(order)
    rescheduleConflict.value = ''
    if (reschedulePreviewConflictMessage.value) {
      rescheduleConflict.value = reschedulePreviewConflictMessage.value
      notifyOrderAction('error', `库存冲突：${reschedulePreviewConflictMessage.value}`)
      return
    }
    reschedulingOrderId.value = order.id
    try {
      const next = await appStore.rescheduleOrder(order.id, {
        date: rescheduleDraft.date,
        time: rescheduleDraft.time,
        durationMinutes: rescheduleDraft.durationMinutes,
        remark: rescheduleDraft.remark,
      })
      selectedOrder.value = next
      syncSlotScopeToOrder(next)
      resetRescheduleDraft(next)
      await loadSlotScopedOrdersFromQuery()
      await loadOrderOperationLogs()
      const prefix = appStore.demoMode ? '演示模式已改期' : '改期已同步到后端'
      notifyOrderAction('success', `${prefix}：${next.customer} 到店时间 ${next.arrivalDate} ${next.arrivalClock}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '改期失败'
      if (isInventoryConflictMessage(message)) {
        rescheduleConflict.value = message
        notifyOrderAction('error', `库存冲突：${message}`)
      } else {
        notifyOrderAction('error', `改期失败：${message}`)
      }
    } finally {
      reschedulingOrderId.value = ''
    }
  }

  return {
    cancelReason,
    cancellingOrderId,
    updatingOrderId,
    reschedulingOrderId,
    rescheduleConflict,
    rescheduleDraft,
    cancelReasonOptions,
    rescheduleReasonOptions,
    resetRescheduleDraft,
    applyCancelReason,
    applyRescheduleReason,
    reschedulePreviewSlot,
    reschedulePreviewConflictMessage,
    rescheduleSlotOptions,
    isRescheduleSlotSelected,
    applyRescheduleSlot,
    buildRescheduleSlotOptionMeta,
    advanceOrder,
    cancelSelectedOrder,
    rescheduleSelectedOrder,
  }
}
