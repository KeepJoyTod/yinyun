import type { Ref } from 'vue'
import { appStore, type BookingOrder } from '../../../shared/stores/appStore'
import type { QuickOrderFilter } from '../orderOperations'
import type { StaffBookingInitial } from '../StaffBookingModal.vue'

export function useOrderConsoleActions(options: {
  activeStartDate: Ref<string>
  selectedTimeType: Ref<'order' | 'arrival'>
  activeQuickFilter: Ref<QuickOrderFilter>
  slotRange: Ref<{ start: string; end: string }>
  orderRange: { start: string; end: string }
  arrivalRange: { start: string; end: string }
  orders: { value: BookingOrder[] }
  syncingDouyinOrders: Ref<boolean>
  staffBookingOpen: Ref<boolean>
  staffBookingInitial: Ref<StaffBookingInitial | null>
  printDialogOpen: Ref<boolean>
  printDialogOrderId: Ref<string | null>
  todayKey: string
  storeNameForOrderScope: Ref<string>
  readDouyin30Query: () => boolean
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}) {
  const buildStaffBookingInitialFromOrderScope = (): StaffBookingInitial | null => {
    const storeName = options.storeNameForOrderScope.value
    if (!storeName) return null
    const initial: StaffBookingInitial = { storeName }
    if (options.slotRange.value.start) {
      initial.date = options.activeStartDate.value || options.todayKey
      initial.startTime = options.slotRange.value.start
      initial.endTime = options.slotRange.value.end || undefined
    }
    return initial
  }

  const openStaffBookingModal = () => {
    options.staffBookingInitial.value = buildStaffBookingInitialFromOrderScope()
    options.staffBookingOpen.value = true
  }

  const handleStaffBookingCreated = (order: BookingOrder) => {
    options.staffBookingOpen.value = false
    options.activeQuickFilter.value = 'todayOps'
    options.notifyOrderAction('success', `已新增预约 ${order.id}`)
  }

  const openPrintDialog = (order: BookingOrder) => {
    options.printDialogOrderId.value = order.backendId
    options.printDialogOpen.value = true
  }

  const exportCoupons = () => {
    options.notifyOrderAction('success', '优惠券导出功能开发中')
  }

  const exportRights = () => {
    options.notifyOrderAction('success', '权益导出功能开发中')
  }

  const syncDouyinLifeOrders = async () => {
    if (options.syncingDouyinOrders.value) return
    options.syncingDouyinOrders.value = true
    try {
      const result = await appStore.syncDouyinLifeOrdersAndRefresh({
        refreshDate: options.todayKey,
        maxPages: 2,
        maxTotal: 80,
        refreshAllOrders: options.readDouyin30Query(),
      })
      const prefix = appStore.demoMode ? '演示模式同步完成' : '同步近24小时抖音来客订单完成'
      options.notifyOrderAction(
        'success',
        `${prefix}：created ${result.created}，updated ${result.updated}，failed ${result.failed}，lastLogId ${result.lastLogId || '暂无'}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : '同步失败'
      options.notifyOrderAction('error', `同步失败：${message}`)
    } finally {
      options.syncingDouyinOrders.value = false
    }
  }

  const showAllOrders = async () => {
    try {
      if (!appStore.demoMode) await appStore.loadAllOrders()
      options.selectedTimeType.value = 'arrival'
      options.activeQuickFilter.value = 'douyin30'
      options.arrivalRange.start = ''
      options.arrivalRange.end = ''
      options.orderRange.start = ''
      options.orderRange.end = ''
      options.notifyOrderAction('success', `已切换到近30天抖音来客订单，当前 ${options.orders.value.length} 条；今日处理队列不会被历史账本覆盖`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载失败'
      options.notifyOrderAction('error', `加载近30天来客订单失败：${message}`)
    }
  }

  return {
    buildStaffBookingInitialFromOrderScope,
    openStaffBookingModal,
    handleStaffBookingCreated,
    openPrintDialog,
    exportCoupons,
    exportRights,
    syncDouyinLifeOrders,
    showAllOrders,
  }
}
