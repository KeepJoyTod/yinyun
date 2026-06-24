import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type {
  BookingOrder,
  BookingInventorySlot,
  Album,
  ProductConfig,
  SelectionLink,
  ChannelSyncLogInfo,
} from '../../../shared/stores/appStore'
import { appStore } from '../../../shared/stores/appStore'
import {
  buildOrderPhotoDeliveryStage,
  buildOrderCancelGuidance,
  buildOrderDetailTimeline,
  buildOrderFlowSteps,
  buildOrderOperationCards,
  buildOrderOperationEvidenceCards,
  buildOrderSourceContext,
  getOrderChannelSyncLogs,
  getNextOrderAction,
  getNextOrderHint,
  getOrderInventoryConflictSlot,
  hasCustomerContact,
  isMissingArrivalSchedule,
  isTodayPendingConfirmOrder,
  type OrderCancelGuidance,
  type OrderDetailTimelineItem,
  type OrderFlowStep,
  type OrderOperationCard,
  type OrderOperationEvidenceCard,
  type OrderPhotoDeliveryStage,
  type OrderSourceContext,
  type QuickOrderFilter,
} from '../orderOperations'
import {
  buildAlbumActionAvailability,
  summarizePhotoAccessLogs,
  type AlbumActionAvailability,
  type PhotoAccessLogRow,
} from '../../albums/photoMgmtOperations'

export type UseOrderDetailStateParams = {
  orders: ComputedRef<BookingOrder[]>
  todayKey: string
}

export type UseOrderDetailStateReturn = {
  selectedOrder: Ref<BookingOrder | null>
  selectedOrderAlbum: ComputedRef<Album | null>
  selectedOrderPhotoStage: ComputedRef<OrderPhotoDeliveryStage>
  selectedOrderAlbumActionAvailability: ComputedRef<AlbumActionAvailability>
  canNotifySelectedOrderAlbum: ComputedRef<boolean>
  canConfirmSelectedOrderAlbum: ComputedRef<boolean>
  canDeliverSelectedOrderAlbum: ComputedRef<boolean>
  selectedOrderPhotoAccessLogs: ComputedRef<PhotoAccessLogRow[]>
  selectedOrderProduct: ComputedRef<ProductConfig | null>
  selectedOrderSelectionLink: ComputedRef<SelectionLink | null>
  selectedOrderAddonSummary: ComputedRef<string>
  selectedOrderSyncLogs: ComputedRef<ChannelSyncLogInfo[]>
  selectedOrderCancelGuidance: ComputedRef<OrderCancelGuidance>
  selectedOrderSourceContext: ComputedRef<OrderSourceContext>
  selectedOrderCurrentSlot: ComputedRef<BookingInventorySlot | null>
  selectedOrderSlotTimeLabel: ComputedRef<string>
  selectedOrderCapacitySummary: ComputedRef<string>
  selectedOrderStoreScopeText: ComputedRef<string>
  selectedOrderNextActionLabel: ComputedRef<string>
  selectedOrderOperationalHint: ComputedRef<string>
  selectedOrderTimeline: ComputedRef<OrderDetailTimelineItem[]>
  selectedOrderOperationEvidenceCards: ComputedRef<OrderOperationEvidenceCard[]>
  orderFlowSteps: ComputedRef<OrderFlowStep[]>
  todayPendingConfirmOrders: ComputedRef<BookingOrder[]>
  orderOperationCards: ComputedRef<OrderOperationCard[]>
  orderPipelineCards: ComputedRef<OrderOperationCard[]>
  inventoryConflictOrders: ComputedRef<BookingOrder[]>
  missingInfoOrders: ComputedRef<BookingOrder[]>
  dayCommandCards: ComputedRef<Array<{ label: string; value: string; hint: string; action: string; scope: string; filter: QuickOrderFilter }>>
  getOrderSyncLabel: () => string
}

export function useOrderDetailState(params: UseOrderDetailStateParams): UseOrderDetailStateReturn {
  const { orders, todayKey } = params

  const selectedOrder = ref<BookingOrder | null>(null)

  const selectedOrderAlbum = computed(() => {
    const order = selectedOrder.value
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
    const order = selectedOrder.value
    if (!order) return null
    return appStore.products.find(p => p.backendId === order.productBackendId) ?? null
  })

  const selectedOrderSelectionLink = computed(() => {
    const order = selectedOrder.value
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
    const order = selectedOrder.value
    if (!order) return []
    return getOrderChannelSyncLogs(order, appStore.channelSyncLogs)
  })

  const selectedOrderCancelGuidance = computed(() => {
    const order = selectedOrder.value
    return order
      ? buildOrderCancelGuidance(order)
      : { tone: 'neutral' as const, title: '', body: '' }
  })

  const selectedOrderSourceContext = computed(() => {
    const order = selectedOrder.value
    return order
      ? buildOrderSourceContext(order)
      : { title: '', badge: 'ORDER', tone: 'neutral' as const, description: '', details: [] }
  })

  const clockToMinutes = (clock: string) => {
    const match = clock.trim().match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return Number.NaN
    return Number(match[1]) * 60 + Number(match[2])
  }

  const selectedOrderCurrentSlot = computed(() => {
    const order = selectedOrder.value
    if (!order?.storeBackendId) return null
    if (order.inventorySlotId) {
      const byId = appStore.bookingInventory.find(slot =>
        slot.backendId === order.inventorySlotId
        && slot.storeBackendId === order.storeBackendId,
      )
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
    const order = selectedOrder.value
    if (!order?.arrivalDate || !order.arrivalClock) return '未排期'
    const slot = selectedOrderCurrentSlot.value
    if (slot) return `${order.arrivalDate} ${slot.startTime}-${slot.endTime}`
    return `${order.arrivalDate} ${order.arrivalClock}`
  })

  const selectedOrderCapacitySummary = computed(() => {
    const order = selectedOrder.value
    if (!order?.arrivalDate || !order.arrivalClock) return '缺真实预约时段，不写入今日排期。'
    const slot = selectedOrderCurrentSlot.value
    if (!slot) return '未命中容量账本；保存改期或新增预约时后端仍会最终校验。'
    const remaining = Math.max(0, slot.capacity - slot.confirmedCount)
    const state = slot.conflictCount > 0
      ? `冲突 ${slot.conflictCount}`
      : remaining <= 0
        ? '已满'
        : `剩余 ${remaining}`
    return `${slot.serviceGroupName || '未分组'} · 容量 ${slot.capacity} / 已约 ${slot.confirmedCount} / ${state}`
  })

  const selectedOrderStoreScopeText = computed(() => {
    const order = selectedOrder.value
    if (!order) return ''
    if (!order.storeBackendId) return '缺门店映射，需要先补真实门店。'
    return `${order.store} · storeId ${order.storeBackendId}`
  })

  const selectedOrderNextActionLabel = computed(() => {
    const order = selectedOrder.value
    if (!order) return ''
    return getNextOrderAction(order)?.label ?? '无后续状态动作'
  })

  const selectedOrderOperationalHint = computed(() => {
    const order = selectedOrder.value
    if (!order) return ''
    const conflictCount = selectedOrderCurrentSlot.value?.conflictCount ?? 0
    if (conflictCount > 0) return `先处理库存冲突 ${conflictCount} 条，再继续履约动作。`
    return getNextOrderHint(order)
  })

  const selectedOrderTimeline = computed(() => {
    const order = selectedOrder.value
    return order
      ? buildOrderDetailTimeline(order, selectedOrderAlbum.value, appStore.channelSyncLogs, appStore.operationLogs)
      : []
  })

  const selectedOrderOperationEvidenceCards = computed(() => {
    const order = selectedOrder.value
    return order ? buildOrderOperationEvidenceCards(order, appStore.operationLogs, 3) : []
  })

  const orderFlowSteps = computed(() => {
    const order = selectedOrder.value
    if (!order) return []
    return buildOrderFlowSteps(order)
  })

  const todayPendingConfirmOrders = computed(() => orders.value.filter(order => isTodayPendingConfirmOrder(order, todayKey)))

  const orderOperationCards = computed(() => buildOrderOperationCards(orders.value, todayKey))
  const orderPipelineCards = orderOperationCards
  const inventoryConflictOrders = computed(() =>
    orders.value.filter(order => getOrderInventoryConflictSlot(order, appStore.bookingInventory)),
  )
  const missingInfoOrders = computed(() =>
    orders.value.filter(order => !hasCustomerContact(order) || isMissingArrivalSchedule(order)),
  )
  const dayCommandCards = computed(() => [
    {
      label: '按天处理',
      value: String(todayPendingConfirmOrders.value.length),
      hint: '今天到店待确认，优先做电话 / 微信确认。',
      action: '先确认',
      scope: '日期',
      filter: 'pending' as QuickOrderFilter,
    },
    {
      label: '门店筛选',
      value: String(new Set(orders.value.map(order => order.store)).size),
      hint: '按门店把当天订单收拢到同一队列。',
      action: '看门店',
      scope: '门店',
      filter: 'todayOps' as QuickOrderFilter,
    },
    {
      label: '渠道筛选',
      value: String(new Set(orders.value.map(order => order.source)).size),
      hint: '抖音、微信、手工录入分开看，避免混单。',
      action: '看渠道',
      scope: '渠道',
      filter: 'todayOps' as QuickOrderFilter,
    },
    {
      label: '冲突提示',
      value: String(inventoryConflictOrders.value.length),
      hint: '库存冲突时先改期，再处理后续动作。',
      action: '查看冲突',
      scope: '异常',
      filter: 'issues' as QuickOrderFilter,
    },
  ])

  const getOrderSyncLabel = () => appStore.demoMode ? 'Local Demo' : 'Backend Sync'

  return {
    selectedOrder,
    selectedOrderAlbum,
    selectedOrderPhotoStage,
    selectedOrderAlbumActionAvailability,
    canNotifySelectedOrderAlbum,
    canConfirmSelectedOrderAlbum,
    canDeliverSelectedOrderAlbum,
    selectedOrderPhotoAccessLogs,
    selectedOrderProduct,
    selectedOrderSelectionLink,
    selectedOrderAddonSummary,
    selectedOrderSyncLogs,
    selectedOrderCancelGuidance,
    selectedOrderSourceContext,
    selectedOrderCurrentSlot,
    selectedOrderSlotTimeLabel,
    selectedOrderCapacitySummary,
    selectedOrderStoreScopeText,
    selectedOrderNextActionLabel,
    selectedOrderOperationalHint,
    selectedOrderTimeline,
    selectedOrderOperationEvidenceCards,
    orderFlowSteps,
    todayPendingConfirmOrders,
    orderOperationCards,
    orderPipelineCards,
    inventoryConflictOrders,
    missingInfoOrders,
    dayCommandCards,
    getOrderSyncLabel,
  }
}
