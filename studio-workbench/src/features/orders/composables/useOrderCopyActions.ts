import type { Ref } from 'vue'
import { useCopyWithState } from '../../../shared/composables/useCopyWithState'
import { appStore, type BookingOrder } from '../../../shared/stores/appStore'
import { buildOrderChannelDiagnosticText } from '../orderOperations'

export type UseOrderCopyActionsParams = {
  selectedOrder: Ref<BookingOrder | null>
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export function useOrderCopyActions(params: UseOrderCopyActionsParams) {
  const { selectedOrder, notifyOrderAction } = params
  const { copiedKey: copiedField, copyText: copyFieldText } = useCopyWithState()

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

  return {
    copiedField,
    copyField,
    copyOrderChannelDiagnostic,
  }
}
