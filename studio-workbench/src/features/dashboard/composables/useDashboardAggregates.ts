import { computed, type ComputedRef, type Ref } from 'vue'
import type { ScheduleItemDto } from '../../../shared/api/backendTypes'
import type { Album, BookingInventorySlot, BookingOrder, DashboardFinanceInfo, SelectionLink } from '../../../shared/stores/appStore'
import { buildOrderStatusGroupCounts, getOrderOperationalDate } from '../../orders/orderOperations'
import {
  buildDashboardFinanceOverview,
  buildDashboardScheduleItems,
  buildDashboardServiceOrderBreakdown,
} from '../dashboardOperations'

type DashboardAggregateInput = {
  reportOrders: () => BookingOrder[]
  ledgerOrders: () => BookingOrder[]
  orders: () => BookingOrder[]
  albums: () => Album[]
  selectionLinks: () => SelectionLink[]
  scheduleItems: () => ScheduleItemDto[]
  bookingInventory: () => BookingInventorySlot[]
  dashboardFinance: () => DashboardFinanceInfo | null
  selectedDateValue: ComputedRef<string>
  selectedDashboardStoreBackendId: ComputedRef<string>
  businessDateMode: Ref<'today' | 'yesterday'>
  formatDateKey: (date: Date) => string
  toDateFromKey: (value: string) => Date
}

const uniqueOrders = (rows: BookingOrder[]) => {
  const seen = new Set<string>()
  return rows.filter(order => {
    const key = order.backendId || order.id
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export const useDashboardAggregates = (input: DashboardAggregateInput) => {
  const ledgerOrders = computed(() =>
    uniqueOrders([...input.reportOrders(), ...input.ledgerOrders(), ...input.orders()]),
  )
  const allKnownOrders = computed(() =>
    uniqueOrders([...ledgerOrders.value, ...input.orders()]),
  )
  const scopedLedgerOrders = computed(() => {
    const storeId = input.selectedDashboardStoreBackendId.value
    if (!storeId) return ledgerOrders.value
    return ledgerOrders.value.filter(order => order.storeBackendId === storeId)
  })
  const matchesSelectedStore = (storeBackendId?: string) =>
    !input.selectedDashboardStoreBackendId.value || storeBackendId === input.selectedDashboardStoreBackendId.value
  const resolveOrderForAlbum = (album: Album) =>
    allKnownOrders.value.find(order =>
      (album.orderBackendId && order.backendId === album.orderBackendId)
      || (album.orderId && order.id === album.orderId),
    )
  const resolveOrderForSelectionLink = (link: SelectionLink) => {
    const directOrder = allKnownOrders.value.find(order =>
      (link.orderBackendId && order.backendId === link.orderBackendId)
      || (link.orderId && order.id === link.orderId),
    )
    if (directOrder) return directOrder
    const album = input.albums().find(item =>
      (link.albumBackendId && item.backendId === link.albumBackendId)
      || (link.albumId && item.id === link.albumId),
    )
    return album ? resolveOrderForAlbum(album) : undefined
  }
  const matchesDashboardDate = (order: BookingOrder, date: string) => {
    const operationalDate = getOrderOperationalDate(order)
    return operationalDate === date || (!operationalDate && order.orderDate === date)
  }
  const selectedDateOrders = computed(() =>
    scopedLedgerOrders.value.filter(order => matchesDashboardDate(order, input.selectedDateValue.value)),
  )

  const businessDateKey = computed(() => {
    if (input.businessDateMode.value === 'today') return input.selectedDateValue.value
    const d = input.toDateFromKey(input.selectedDateValue.value)
    d.setDate(d.getDate() - 1)
    return input.formatDateKey(d)
  })
  const businessDateScopeLabel = computed(() =>
    `${businessDateKey.value} · ${input.businessDateMode.value === 'today' ? '今天' : '昨天'}经营概况`,
  )
  const businessDateOrders = computed(() =>
    scopedLedgerOrders.value.filter(order => matchesDashboardDate(order, businessDateKey.value)),
  )

  const dashboardScheduleItems = computed<ScheduleItemDto[]>(() => buildDashboardScheduleItems({
    scheduleItems: input.scheduleItems(),
    selectedDateOrders: selectedDateOrders.value,
    selectedStoreBackendId: input.selectedDashboardStoreBackendId.value,
    selectedDate: input.selectedDateValue.value,
  }))

  const channelOrderSummary = computed(() => {
    const buckets = new Map<string, { source: string; count: number; amount: number }>()
    for (const order of selectedDateOrders.value) {
      const bucket = buckets.get(order.source) ?? { source: order.source, count: 0, amount: 0 }
      bucket.count += 1
      bucket.amount += order.amount
      buckets.set(order.source, bucket)
    }
    const rows = [...buckets.values()].sort((a, b) => b.count - a.count)
    const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0)
    const maxCount = rows.reduce((max, row) => Math.max(max, row.count), 0)
    return { rows, totalAmount, maxCount: maxCount || 1 }
  })

  const inventoryConflicts = computed(() =>
    input.bookingInventory()
      .filter(item => item.date === input.selectedDateValue.value && item.conflictCount > 0)
      .map(item => ({
        backendId: item.backendId,
        storeName: item.storeName,
        serviceGroupName: item.serviceGroupName,
        window: `${item.startTime} - ${item.endTime}`,
        conflictCount: item.conflictCount,
        remark: item.remark,
      })),
  )

  const pendingTaskNotice = computed(() => {
    const conflicts = inventoryConflicts.value.length
    const pending = selectedDateOrders.value.filter(order => order.status === '待确认').length
    if (conflicts === 0 && pending === 0) return null
    const parts: string[] = []
    if (pending > 0) parts.push(`${pending} 个订单待确认`)
    if (conflicts > 0) parts.push(`${conflicts} 个时段库存冲突`)
    return { type: 'success' as const, message: `当前待处理：${parts.join('，')}` }
  })

  const serviceStatusCards = computed(() =>
    buildOrderStatusGroupCounts(selectedDateOrders.value)
      .filter(item => item.key !== '待支付')
      .map(item => ({ key: item.key, label: item.label, value: String(item.count) })),
  )
  const statusCards = computed(() => serviceStatusCards.value)

  const todayOperationCards = computed(() => {
    const todayShootCount = selectedDateOrders.value.filter(
      order => ['待确认', '已确认', '拍摄中'].includes(order.status),
    ).length
    const selectedDateAlbums = input.albums().filter(album => {
      const order = resolveOrderForAlbum(album)
      return album.date === input.selectedDateValue.value && matchesSelectedStore(order?.storeBackendId)
    })
    const selectedDateSelectionLinks = input.selectionLinks().filter(link => {
      const album = input.albums().find(item => item.backendId === link.albumBackendId || item.id === link.albumId)
      const order = resolveOrderForSelectionLink(link)
      return (album?.date || order?.arrivalDate) === input.selectedDateValue.value && matchesSelectedStore(order?.storeBackendId)
    })
    const pendingUploadCount = selectedDateAlbums.filter(
      album => album.totalCount === 0 || album.negatives.length === 0,
    ).length
    const pendingSelectionCount = selectedDateAlbums.filter(
      album => album.status === '待客户选片' || (album.totalCount > 0 && album.selectedCount === 0),
    ).length
    const pendingDeliveryCount = selectedDateSelectionLinks.filter(
      link => link.status === '进行中' && link.selectedCount > 0,
    ).length

    return [
      {
        label: '今日待拍',
        value: String(todayShootCount),
        desc: '今日到店且还未进入选片的订单',
        hint: '先确认排期',
        scope: '订单',
        icon: 'camera',
      },
      {
        label: '待上传',
        value: String(pendingUploadCount),
        desc: '相册还没有底片，需要门店补传',
        hint: '补齐素材',
        scope: '相册',
        icon: 'upload',
      },
      {
        label: '待选片',
        value: String(pendingSelectionCount),
        desc: '客户还未完成首次选择的相册',
        hint: '提醒客户',
        scope: '选片',
        icon: 'select',
      },
      {
        label: '待交付',
        value: String(pendingDeliveryCount),
        desc: '客户已选片，需要进入修图交付',
        hint: '安排精修',
        scope: '交付',
        icon: 'deliver',
      },
    ]
  })

  const dashboardFinanceDate = computed(() => input.dashboardFinance()?.date ?? '')
  const dashboardFinanceStoreId = computed(() => input.dashboardFinance()?.storeBackendId ?? undefined)
  const dashboardFinanceMatchesScope = computed(() =>
    dashboardFinanceDate.value === businessDateKey.value
    && dashboardFinanceStoreId.value === input.selectedDashboardStoreBackendId.value,
  )
  const financeOverview = computed(() => buildDashboardFinanceOverview({
    backendFinance: input.dashboardFinance(),
    backendFinanceMatchesScope: dashboardFinanceMatchesScope.value,
    dayOrders: businessDateOrders.value,
  }))
  const serviceOrderBreakdown = computed(() =>
    buildDashboardServiceOrderBreakdown(buildOrderStatusGroupCounts(businessDateOrders.value)),
  )
  const productRanking = computed(() => {
    const buckets = new Map<string, { product: string; count: number; amount: number }>()
    for (const order of businessDateOrders.value) {
      const key = order.service || '未指定产品'
      const bucket = buckets.get(key) ?? { product: key, count: 0, amount: 0 }
      bucket.count += 1
      bucket.amount += order.amount
      buckets.set(key, bucket)
    }
    const rows = [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, 5)
    return rows.map((row, idx) => ({ rank: idx + 1, ...row }))
  })

  return {
    ledgerOrders,
    allKnownOrders,
    scopedLedgerOrders,
    matchesSelectedStore,
    resolveOrderForAlbum,
    resolveOrderForSelectionLink,
    matchesDashboardDate,
    selectedDateOrders,
    businessDateKey,
    businessDateScopeLabel,
    businessDateOrders,
    dashboardScheduleItems,
    channelOrderSummary,
    inventoryConflicts,
    pendingTaskNotice,
    serviceStatusCards,
    statusCards,
    todayOperationCards,
    dashboardFinanceDate,
    dashboardFinanceStoreId,
    dashboardFinanceMatchesScope,
    financeOverview,
    serviceOrderBreakdown,
    productRanking,
  }
}
