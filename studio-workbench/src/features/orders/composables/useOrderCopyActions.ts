import { computed, watch, type Ref } from 'vue'
import { appStore, type BookingOrder } from '../../../shared/stores/appStore'
import { buildOrderChannelDiagnosticText } from '../orderOperations'
import type { CopyOrderDraft } from './useOrdersViewState'

export type UseOrderCopyActionsParams = {
  selectedOrder: Ref<BookingOrder | null>
  copyingOrderId: Ref<string>
  copyOrderDraft: CopyOrderDraft
  copyFieldText: (value: string, key: string) => Promise<boolean>
  onOrderCopied?: (order: BookingOrder) => void
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export function useOrderCopyActions(params: UseOrderCopyActionsParams) {
  const { selectedOrder, copyingOrderId, copyOrderDraft, copyFieldText, notifyOrderAction } = params

  const inferSourceDurationMinutes = (_order: BookingOrder | null) => 60

  const buildDefaultCopyRemark = (order: BookingOrder | null) =>
    order ? `复制自订单 ${order.id}` : ''

  const syncCopyDraft = (order: BookingOrder | null) => {
    const hasReusableSlot = Boolean(order?.arrivalDate && order?.arrivalClock)
    copyOrderDraft.scheduleMode = hasReusableSlot ? 'REUSE_SLOT' : 'UNDECIDED'
    copyOrderDraft.date = order?.arrivalDate || ''
    copyOrderDraft.time = order?.arrivalClock || ''
    copyOrderDraft.durationMinutes = inferSourceDurationMinutes(order)
    copyOrderDraft.remark = buildDefaultCopyRemark(order)
  }

  watch(selectedOrder, order => {
    syncCopyDraft(order)
  }, { immediate: true })

  const canReuseSourceSlot = computed(() =>
    Boolean(selectedOrder.value?.arrivalDate && selectedOrder.value?.arrivalClock),
  )

  const copyField = async (value: string, key: string) => {
    const ok = await copyFieldText(value, key)
    if (ok) {
      notifyOrderAction('success', `已复制${key === 'phone' ? '手机号' : '订单号'}`)
    } else {
      notifyOrderAction('error', '复制失败，请手动选择文本复制')
    }
  }

  const copyOrderChannelDiagnostic = async () => {
    const order = selectedOrder.value
    if (!order) return
    const text = buildOrderChannelDiagnosticText(order, appStore.channelSyncLogs)
    const ok = await copyFieldText(text, 'channelDiagnostic')
    if (ok) {
      notifyOrderAction('success', '已复制渠道排障信息')
    } else {
      notifyOrderAction('error', '复制失败，请手动选择排障信息复制')
    }
  }

  const updateCopyScheduleMode = (mode: 'REUSE_SLOT' | 'UNDECIDED') => {
    if (mode === 'REUSE_SLOT' && !canReuseSourceSlot.value) {
      notifyOrderAction('error', '原订单缺少可复用时段，只能复制为待定档期')
      copyOrderDraft.scheduleMode = 'UNDECIDED'
      return
    }
    copyOrderDraft.scheduleMode = mode
  }

  const copySelectedOrder = async () => {
    const order = selectedOrder.value
    if (!order || copyingOrderId.value) return
    const scheduleMode = copyOrderDraft.scheduleMode === 'UNDECIDED' ? 'UNDECIDED' : 'REUSE_SLOT'
    if (scheduleMode === 'REUSE_SLOT') {
      if (!copyOrderDraft.date || !copyOrderDraft.time) {
        notifyOrderAction('error', '请选择复制后的预约日期和开始时间')
        return
      }
    }
    copyingOrderId.value = order.id
    try {
      const next = await appStore.copyOrder({
        orderId: order.id,
        scheduleMode,
        date: scheduleMode === 'REUSE_SLOT' ? copyOrderDraft.date : '',
        time: scheduleMode === 'REUSE_SLOT' ? copyOrderDraft.time : '',
        durationMinutes: copyOrderDraft.durationMinutes,
        remark: copyOrderDraft.remark.trim(),
      })
      notifyOrderAction('success', `复制订单成功，已生成新订单 ${next.id}`)
      params.onOrderCopied?.(next)
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      notifyOrderAction('error', `复制订单失败：${message}`)
    } finally {
      copyingOrderId.value = ''
    }
  }

  return {
    copyField,
    copyOrderChannelDiagnostic,
    copySelectedOrder,
    updateCopyScheduleMode,
    canReuseSourceSlot,
  }
}
