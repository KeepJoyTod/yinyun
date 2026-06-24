import { describe, expect, it } from 'vitest'
import type { BookingInventorySlot } from '../../shared/stores/appStore'
import {
  buildOrderStatusGroupCounts,
  buildOrderExportQuery,
  buildOrderRescheduleConflictMessage,
  buildOrderFlowSteps,
  buildOrderOperationCards,
  buildQuickOrderFilters,
  getOrderOperationalDate,
  getOrderExportSyncNotice,
  getNextOrderAction,
  getNextOrderHint,
  getOrderFilterDate,
  getOrderInventoryConflictSlot,
  getOrderRescheduleInventorySlot,
  getUnsupportedOrderExportFilters,
  hasCustomerContact,
  isInventoryConflictMessage,
  mapScheduleItemToSlotOrder,
  matchesOrderStatusGroup,
  isOperationalOrder,
  isMissingArrivalSchedule,
  matchesQuickOrderFilter,
  matchesOrderDeepLinkId,
  matchesOrderDeepLinkQuery,
  matchesOrderSlotRange,
  normalizeOrderStatusTab,
  parseMDHMToISODate,
  shouldAcceptOrderSearchInput,
  resolveOrderSearchQueryState,
  todayOperationalStatuses,
} from './orderOperations'
import { makeOrder } from './orderOperations.testData'

describe('order operations helpers', () => {
  it('keeps operational order detection scoped to real customer contact and arrival date', () => {
    expect(hasCustomerContact(makeOrder())).toBe(true)
    expect(isOperationalOrder(makeOrder())).toBe(true)
    expect(hasCustomerContact(makeOrder({ customer: ' ', phone: '13800000000' }))).toBe(false)
    expect(hasCustomerContact(makeOrder({ customer: '张三', phone: ' ' }))).toBe(false)
    expect(isOperationalOrder(makeOrder({ arrivalDate: '' }))).toBe(false)
  })

  it('matches staff quick filters without leaking incomplete channel orders into daily work', () => {
    const todayKey = '2026-06-14'
    const pending = makeOrder({ status: '待确认', arrivalDate: todayKey })
    const confirmed = makeOrder({ id: 'order-2', status: '已确认', arrivalDate: todayKey })
    const selecting = makeOrder({ id: 'order-3', status: '选片中', arrivalDate: '2026-06-10' })
    const incomplete = makeOrder({ id: 'order-4', customer: '', phone: '', arrivalDate: '' })

    expect(todayOperationalStatuses).toEqual(['待确认', '已确认', '已到店', '服务中', '拍摄中'])
    expect(matchesQuickOrderFilter(pending, 'todayOps', todayKey)).toBe(true)
    expect(matchesQuickOrderFilter(confirmed, 'today', todayKey)).toBe(true)
    expect(matchesQuickOrderFilter(pending, 'pending', todayKey)).toBe(true)
    expect(matchesQuickOrderFilter(selecting, 'selection', todayKey)).toBe(true)
    expect(matchesQuickOrderFilter(incomplete, 'issues', todayKey)).toBe(true)
    expect(matchesQuickOrderFilter(incomplete, 'todayOps', todayKey)).toBe(false)
  })

  it('uses Douyin Life order date as the staff work date when no appointment slot exists', () => {
    const todayKey = '2026-06-14'
    const douyinOrder = makeOrder({
      source: '抖音来客',
      method: '渠道同步',
      orderDate: todayKey,
      orderTime: '06-14 09:30',
      arrivalDate: '',
      arrivalTime: '',
      arrivalClock: '',
      status: '待确认',
    })

    expect(getOrderOperationalDate(douyinOrder)).toBe(todayKey)
    expect(isOperationalOrder(douyinOrder)).toBe(true)
    expect(isMissingArrivalSchedule(douyinOrder)).toBe(false)
    expect(matchesQuickOrderFilter(douyinOrder, 'todayOps', todayKey)).toBe(true)
    expect(matchesQuickOrderFilter(douyinOrder, 'issues', todayKey)).toBe(false)
    expect(getOrderFilterDate(douyinOrder, 'arrival', todayKey)).toBe(todayKey)
  })

  it('keeps non-Douyin orders without an arrival slot in the missing-info flow', () => {
    const todayKey = '2026-06-14'
    const localOrder = makeOrder({
      source: '门店录入',
      orderDate: todayKey,
      arrivalDate: '',
      arrivalTime: '',
      arrivalClock: '',
    })

    expect(getOrderOperationalDate(localOrder)).toBe('')
    expect(isOperationalOrder(localOrder)).toBe(false)
    expect(isMissingArrivalSchedule(localOrder)).toBe(true)
    expect(matchesQuickOrderFilter(localOrder, 'issues', todayKey)).toBe(true)
    expect(getOrderFilterDate(localOrder, 'arrival', todayKey)).toBe('')
  })

  it('builds quick filters and operation cards from the same operational counts', () => {
    const orders = [
      makeOrder({ id: 'pending', status: '待确认' }),
      makeOrder({ id: 'confirmed', status: '已确认' }),
      makeOrder({ id: 'selecting', status: '选片中', arrivalDate: '2026-06-10' }),
      makeOrder({ id: 'issue', customer: '', phone: '', arrivalDate: '' }),
    ]

    expect(buildQuickOrderFilters(orders, '2026-06-14')).toEqual([
      { key: 'todayOps', label: '今日待处理', count: 2 },
      { key: 'all', label: '全部订单', count: 4 },
      { key: 'douyin30', label: '近30天来客', count: 4 },
      { key: 'today', label: '只看今日', count: 2 },
      { key: 'pending', label: '待确认优先', count: 1 },
      { key: 'selection', label: '客片交付', count: 1 },
      { key: 'issues', label: '异常缺资料', count: 1 },
    ])

    expect(buildOrderOperationCards(orders, '2026-06-14').map(card => [card.label, card.value, card.filter])).toEqual([
      ['今日到店', '2', 'today'],
      ['今日待确认', '1', 'pending'],
      ['待服务', '2', 'today'],
      ['客片交付', '1', 'selection'],
    ])
  })

  it('builds JianYue-style status group counts from one shared rule', () => {
    const orders = [
      makeOrder({ id: 'pending', status: '待确认' }),
      makeOrder({ id: 'confirmed', status: '已确认' }),
      makeOrder({ id: 'arrived', status: '已到店' }),
      makeOrder({ id: 'serving', status: '服务中' }),
      makeOrder({ id: 'shooting', status: '拍摄中' }),
      makeOrder({ id: 'selecting', status: '选片中' }),
      makeOrder({ id: 'completed', status: '已完成' }),
      makeOrder({ id: 'unpaid', status: '待确认', payment: '待支付' }),
      makeOrder({ id: 'cancelled', status: '已取消' }),
      makeOrder({ id: 'refunded-status', status: '已退单' }),
      makeOrder({ id: 'refunded-payment', status: '已确认', payment: '已退款' }),
    ]

    expect(buildOrderStatusGroupCounts(orders)).toEqual([
      { key: 'all', label: '全部有效订单', count: 8 },
      { key: '待服务', label: '待服务', count: 2 },
      { key: '服务中', label: '服务中', count: 4 },
      { key: '已完成', label: '已完成', count: 2 },
      { key: '待支付', label: '待支付', count: 1 },
      { key: '已取消', label: '已取消', count: 1 },
      { key: '已退单', label: '已退单', count: 2 },
    ])
  })

  it('matches status tabs through the same status group rule', () => {
    expect(matchesOrderStatusGroup(makeOrder({ status: '待确认' }), '待服务')).toBe(true)
    expect(matchesOrderStatusGroup(makeOrder({ status: '已确认' }), '服务中')).toBe(true)
    expect(matchesOrderStatusGroup(makeOrder({ status: '已到店' }), '服务中')).toBe(true)
    expect(matchesOrderStatusGroup(makeOrder({ status: '服务中' }), '服务中')).toBe(true)
    expect(matchesOrderStatusGroup(makeOrder({ status: '拍摄中' }), '服务中')).toBe(true)
    expect(matchesOrderStatusGroup(makeOrder({ status: '选片中' }), '已完成')).toBe(true)
    expect(matchesOrderStatusGroup(makeOrder({ status: '已完成' }), '已完成')).toBe(true)
    expect(matchesOrderStatusGroup(makeOrder({ status: '已确认', payment: '待支付' }), '待支付')).toBe(true)
    expect(matchesOrderStatusGroup(makeOrder({ status: '已取消' }), 'all')).toBe(false)
    expect(matchesOrderStatusGroup(makeOrder({ status: '已确认', payment: '已退款' }), '已退单')).toBe(true)
  })

  it('normalizes dashboard and URL status tab labels to shared keys', () => {
    expect(normalizeOrderStatusTab('all')).toBe('all')
    expect(normalizeOrderStatusTab('全部有效订单')).toBe('all')
    expect(normalizeOrderStatusTab('待服务')).toBe('待服务')
    expect(normalizeOrderStatusTab('待确认')).toBe('待服务')
    expect(normalizeOrderStatusTab('已确认')).toBe('服务中')
    expect(normalizeOrderStatusTab('已到店')).toBe('服务中')
    expect(normalizeOrderStatusTab('服务中')).toBe('服务中')
    expect(normalizeOrderStatusTab('拍摄中')).toBe('服务中')
    expect(normalizeOrderStatusTab('选片中')).toBe('已完成')
    expect(normalizeOrderStatusTab('已退款')).toBe('已退单')
    expect(normalizeOrderStatusTab('未知')).toBe('all')
  })

  it('matches an order from a dashboard deep link query', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
      customer: '王明',
      phone: '17863026867',
    })

    expect(matchesOrderDeepLinkQuery(order, 'YY202606150001')).toBe(true)
    expect(matchesOrderDeepLinkQuery(order, '9001')).toBe(true)
    expect(matchesOrderDeepLinkQuery(order, '026867')).toBe(true)
    expect(matchesOrderDeepLinkQuery(order, '王明')).toBe(true)
    expect(matchesOrderDeepLinkQuery(order, 'YY202606150002')).toBe(false)
  })

  it('matches exact order ids from a slot deep link before fuzzy search', () => {
    const order = makeOrder({
      backendId: '9001',
      id: 'YY202606150001',
    })

    expect(matchesOrderDeepLinkId(order, '9001')).toBe(true)
    expect(matchesOrderDeepLinkId(order, 'YY202606150001')).toBe(true)
    expect(matchesOrderDeepLinkId(order, '001')).toBe(false)
    expect(matchesOrderDeepLinkId(order, 'YY202606150001-extra')).toBe(false)
  })

  it('matches only orders overlapping the deep-linked slot range', () => {
    const exact = makeOrder({ arrivalClock: '10:30' })
    const overlap = makeOrder({ id: 'overlap', arrivalClock: '10:45' })
    const outside = makeOrder({ id: 'outside', arrivalClock: '11:00' })

    expect(matchesOrderSlotRange(exact, { start: '10:30', end: '11:00' })).toBe(true)
    expect(matchesOrderSlotRange(overlap, { start: '10:30', end: '11:00' })).toBe(true)
    expect(matchesOrderSlotRange(outside, { start: '10:30', end: '11:00' })).toBe(false)
    expect(matchesOrderSlotRange(makeOrder({ arrivalClock: '' }), { start: '10:30', end: '11:00' })).toBe(false)
    expect(matchesOrderSlotRange(exact, { start: '', end: '' })).toBe(true)
  })

  it('ignores restored search text when a slot deep link does not carry q and staff has not typed', () => {
    expect(resolveOrderSearchQueryState({
      inputValue: 'JY-12118454',
      routeQueryValue: '',
      userEdited: false,
    })).toEqual({
      effectiveValue: '',
      urlValue: undefined,
    })
  })

  it('keeps route-provided q until staff explicitly edits the search box', () => {
    expect(resolveOrderSearchQueryState({
      inputValue: 'JY-12118454',
      routeQueryValue: 'JY-12118454',
      userEdited: false,
    })).toEqual({
      effectiveValue: 'JY-12118454',
      urlValue: 'JY-12118454',
    })
  })

  it('removes q after staff clears a route-provided search box', () => {
    expect(resolveOrderSearchQueryState({
      inputValue: '',
      routeQueryValue: 'JY-12118454',
      userEdited: true,
    })).toEqual({
      effectiveValue: '',
      urlValue: undefined,
    })
  })

  it('drops route q inside slot-scoped order deep links until staff types again', () => {
    expect(resolveOrderSearchQueryState({
      inputValue: 'JY-12118454',
      routeQueryValue: 'JY-12118454',
      slotScoped: true,
      userEdited: false,
    })).toEqual({
      effectiveValue: '',
      urlValue: undefined,
    })
  })

  it('rejects browser-restored input when the route has no q and staff has not armed the search box', () => {
    expect(shouldAcceptOrderSearchInput({
      routeQueryValue: '',
      userArmed: false,
    })).toBe(false)
  })

  it('accepts route-backed or user-armed order search input', () => {
    expect(shouldAcceptOrderSearchInput({
      routeQueryValue: 'JY-12118454',
      userArmed: false,
    })).toBe(true)
    expect(shouldAcceptOrderSearchInput({
      routeQueryValue: '',
      userArmed: true,
    })).toBe(true)
  })

  it('maps schedule rows into slot-scoped fallback orders', () => {
    const order = mapScheduleItemToSlotOrder({
      bookingId: 'booking-12138444',
      orderId: 'order-12138444',
      storeId: '10',
      studioId: '10',
      studioName: '滨州万达店',
      startAt: '2026-06-18T18:00:00',
      endAt: '2026-06-18T18:30:00',
      bookingStatus: '待确认',
      orderNo: 'JY-12138444',
      customerName: '王女士',
      customerPhone: '138****0000',
      serviceName: '简约网导入 order_id=12138444',
      orderStatus: '待确认',
    }, [{
      backendId: '10',
      id: 'store-10',
      name: '滨州万达店',
      status: '营业中',
      manager: '',
      monthlyOrders: '0',
      pendingOrders: '0',
      address: '',
      phone: '',
      hours: '',
    }])

    expect(order).toMatchObject({
      backendId: 'order-12138444',
      storeBackendId: '10',
      id: 'JY-12138444',
      customer: '王女士',
      store: '滨州万达店',
      source: '简约网',
      method: '时段排期',
      arrivalDate: '2026-06-18',
      arrivalClock: '18:00',
      status: '待确认',
    })
    expect(matchesOrderSlotRange(order, { start: '18:00', end: '18:30' })).toBe(true)
  })

  it('maps store order status to the next visible staff action', () => {
    expect(getNextOrderAction(makeOrder({ status: '待确认' }))).toMatchObject({ label: '确认订单', nextStatus: '已确认' })
    expect(getNextOrderAction(makeOrder({ status: '已确认' }))).toMatchObject({ label: '标记到店', nextStatus: '已到店' })
    expect(getNextOrderAction(makeOrder({ status: '已到店' }))).toMatchObject({ label: '开始服务', nextStatus: '服务中' })
    expect(getNextOrderAction(makeOrder({ status: '服务中' }))).toMatchObject({ label: '完成服务', nextStatus: '已完成' })
    expect(getNextOrderAction(makeOrder({ status: '已完成' }))).toBeUndefined()
    expect(getNextOrderHint(makeOrder({ status: '已完成' }))).toBe('服务已完成，可进入客片交付和资料发送')
  })

  it('builds the real store order flow for the detail drawer', () => {
    expect(buildOrderFlowSteps(makeOrder({ status: '已到店' }))).toEqual([
      { label: '待确认', state: 'done', hint: '电话/微信确认后点击' },
      { label: '已确认', state: 'done', hint: '客户到店后点击' },
      { label: '已到店', state: 'current', hint: '开始拍摄或证件照服务时点击' },
      { label: '服务中', state: 'todo', hint: '拍摄/服务完成后点击' },
      { label: '已完成', state: 'todo' },
    ])

    expect(buildOrderFlowSteps(makeOrder({ status: '服务中' })).map(step => step.label)).toEqual([
      '待确认',
      '已确认',
      '已到店',
      '服务中',
      '已完成',
    ])
  })

  it('keeps terminal cancel and refund states out of the normal completion chain', () => {
    expect(buildOrderFlowSteps(makeOrder({ status: '已取消' })).map(step => [step.label, step.state])).toEqual([
      ['待确认', 'done'],
      ['已取消', 'current'],
    ])
    expect(getNextOrderHint(makeOrder({ status: '已取消' }))).toBe('订单已取消，库存已释放；如需重新安排请新建预约或从操作日志追溯原因')

    expect(buildOrderFlowSteps(makeOrder({ status: '已退单' })).map(step => [step.label, step.state])).toEqual([
      ['待确认', 'done'],
      ['已退单', 'current'],
    ])
    expect(getNextOrderHint(makeOrder({ status: '已退单' }))).toBe('订单已退单，等待退款/平台同步记录归档')
  })

  it('keeps legacy shooting orders compatible without restoring the old selecting chain', () => {
    expect(buildOrderFlowSteps(makeOrder({ status: '拍摄中' })).map(step => step.label)).toEqual([
      '待确认',
      '已确认',
      '已到店',
      '拍摄中',
      '已完成',
    ])
    expect(buildOrderFlowSteps(makeOrder({ status: '拍摄中' })).find(step => step.label === '拍摄中')).toMatchObject({
      state: 'current',
      hint: '兼容旧状态：拍摄完成后点击',
    })
  })

  it('parses compact order dates and chooses the correct filter date source', () => {
    expect(parseMDHMToISODate('06-13 09:00', '2026')).toBe('2026-06-13')
    expect(parseMDHMToISODate('2026-06-13 09:00', '2026')).toBe('')
    expect(getOrderFilterDate(makeOrder({ orderDate: '', orderTime: '06-13 09:00' }), 'order', '2026-06-14')).toBe('2026-06-13')
    expect(getOrderFilterDate(makeOrder({ arrivalDate: '', arrivalTime: '06-15 10:30' }), 'arrival', '2026-06-14')).toBe('2026-06-15')
  })

  it('builds a backend export query only from real supported filters', () => {
    expect(buildOrderExportQuery({
      selectedTimeType: 'arrival',
      startDate: '2026-06-15',
      endDate: '2026-06-16',
      storeName: '影约云深圳旗舰店',
      sourceLabel: '抖音来客',
      paymentLabel: '已支付',
      statusLabel: '已确认',
      stores: [{ backendId: '1', name: '影约云深圳旗舰店' }],
    })).toEqual({
      pageNum: 1,
      pageSize: 5000,
      storeId: '1',
      source: 'DOUYIN_LIFE',
      payStatus: 'PAID',
      status: 'CONFIRMED',
      beginArrivalTime: '2026-06-15 00:00:00',
      endArrivalTime: '2026-06-16 23:59:59',
    })

    expect(buildOrderExportQuery({
      selectedTimeType: 'order',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      storeName: '门店选择',
      sourceLabel: '全部来源',
      paymentLabel: '支付状态',
      statusLabel: 'all',
      keyword: 'YY202606100001',
      methodLabel: '渠道同步',
      stores: [{ backendId: '1', name: '影约云深圳旗舰店' }],
    })).toEqual({
      pageNum: 1,
      pageSize: 5000,
      keyword: 'YY202606100001',
      bookingMethod: 'CHANNEL',
      beginOrderTime: '2026-06-01 00:00:00',
      endOrderTime: '2026-06-30 23:59:59',
    })

    expect(buildOrderExportQuery({
      selectedTimeType: 'order',
      methodLabel: '人工预约',
      stores: [],
    })).toMatchObject({
      bookingMethod: 'MANUAL',
    })
  })

  it('identifies filters that cannot be faithfully expressed by the backend export query', () => {
    expect(getUnsupportedOrderExportFilters({
      selectedTimeType: 'arrival',
      keyword: 'YY202606100001',
      serviceLabel: '证件照',
      methodLabel: '在线预约',
      amountMin: '100',
      amountMax: '',
      statusLabels: ['待确认', '已确认'],
    })).toEqual(['服务产品', '预约方式', '金额区间', '多状态'])

    expect(getUnsupportedOrderExportFilters({
      selectedTimeType: 'arrival',
      storeName: '影约云深圳旗舰店',
      sourceLabel: '抖音来客',
      paymentLabel: '已支付',
      statusLabel: '已确认',
      serviceLabel: '全部服务',
      methodLabel: '全部方式',
      amountMin: '',
      amountMax: '',
      statusLabels: ['已确认'],
    })).toEqual([])

    expect(getUnsupportedOrderExportFilters({
      selectedTimeType: 'arrival',
      keyword: 'YY202606100001',
      methodLabel: '渠道同步',
      statusLabels: ['已确认'],
    })).toEqual([])
  })

  it('explains that exports only include locally synchronized yy_order rows', () => {
    expect(getOrderExportSyncNotice({
      demoMode: false,
      sourceLabel: '抖音来客',
    })).toBe('导出范围：本地 yy_order 已同步订单。抖音来客对账前，先同步近24小时或指定时间窗口。')

    expect(getOrderExportSyncNotice({
      demoMode: false,
      sourceLabel: '微信',
    })).toBe('导出范围：本地 yy_order 已同步订单；跨渠道对账前请确认对应渠道已完成同步。')

    expect(getOrderExportSyncNotice({
      demoMode: true,
    })).toBe('Demo 模式仅预览样例；真实对账请连接 API，并先同步抖音来客订单。')
  })

  it('recognizes inventory conflict wording from backend errors', () => {
    expect(isInventoryConflictMessage('库存冲突：该时段已满')).toBe(true)
    expect(isInventoryConflictMessage('slot capacity exceeded')).toBe(true)
    expect(isInventoryConflictMessage('订单状态更新失败')).toBe(false)
  })

  it('finds only the slot that actually overlaps the order arrival time', () => {
    const slots: BookingInventorySlot[] = [
      {
        backendId: 'slot-1',
        storeBackendId: '10',
        storeName: '影约云旗舰店',
        serviceGroupBackendId: '501',
        serviceGroupName: '证件照快拍组',
        date: '2026-06-14',
        startTime: '14:00',
        endTime: '14:30',
        capacity: 6,
        confirmedCount: 4,
        conflictCount: 0,
        status: 'ACTIVE',
        remark: '',
        externalSkuId: '',
      },
      {
        backendId: 'slot-2',
        storeBackendId: '10',
        storeName: '影约云旗舰店',
        serviceGroupBackendId: '502',
        serviceGroupName: '形象照主棚',
        date: '2026-06-14',
        startTime: '15:00',
        endTime: '16:30',
        capacity: 3,
        confirmedCount: 3,
        conflictCount: 1,
        status: 'ACTIVE',
        remark: '已超卖',
        externalSkuId: '',
      },
      {
        backendId: 'slot-3',
        storeBackendId: '11',
        storeName: '影约云分店',
        serviceGroupBackendId: '503',
        serviceGroupName: '异店时段',
        date: '2026-06-14',
        startTime: '15:00',
        endTime: '16:30',
        capacity: 3,
        confirmedCount: 3,
        conflictCount: 1,
        status: 'ACTIVE',
        remark: '其他门店',
        externalSkuId: '',
      },
    ]

    expect(getOrderInventoryConflictSlot(makeOrder({ arrivalDate: '2026-06-14', arrivalClock: '15:20' }), slots)?.backendId).toBe('slot-2')
    expect(getOrderInventoryConflictSlot(makeOrder({ arrivalDate: '2026-06-14', arrivalClock: '14:10' }), slots)).toBeNull()
    expect(getOrderInventoryConflictSlot(makeOrder({ arrivalDate: '2026-06-15', arrivalClock: '15:20' }), slots)).toBeNull()
    expect(getOrderInventoryConflictSlot(makeOrder({ storeBackendId: '11', arrivalDate: '2026-06-14', arrivalClock: '15:20' }), slots)?.backendId).toBe('slot-3')
  })

  it('does not flag another service group conflict when the order has a precise service group', () => {
    const slots: BookingInventorySlot[] = [
      {
        backendId: 'slot-portrait',
        storeBackendId: '10',
        storeName: '影约云旗舰店',
        serviceGroupBackendId: 'portrait',
        serviceGroupName: '形象照主棚',
        date: '2026-06-14',
        startTime: '15:00',
        endTime: '16:30',
        capacity: 3,
        confirmedCount: 3,
        conflictCount: 1,
        status: 'ACTIVE',
        remark: '形象照已超卖',
        externalSkuId: '',
      },
    ]

    const order = {
      ...makeOrder({ arrivalDate: '2026-06-14', arrivalClock: '15:20' }),
      serviceGroupBackendId: 'id-card',
    }

    expect(getOrderInventoryConflictSlot(order, slots)).toBeNull()
  })

  it('flags an order-level inventory conflict even when the matching slot is missing from the current inventory page', () => {
    const order = makeOrder({
      inventoryStatus: 'CONFLICT',
      conflictReason: '库存已满，需人工改期',
      arrivalDate: '2026-06-17',
      arrivalClock: '11:00',
    })

    expect(getOrderInventoryConflictSlot(order, [])).toMatchObject({
      backendId: undefined,
      conflictCount: 1,
      remark: '库存已满，需人工改期',
    })
  })

  it('preflights target reschedule inventory by overlap, store, service group, and sku', () => {
    const slots: BookingInventorySlot[] = [
      {
        backendId: 'slot-ok',
        storeBackendId: '10',
        storeName: '影约云旗舰店',
        serviceGroupBackendId: 'portrait',
        serviceGroupName: '形象照主棚',
        date: '2026-06-15',
        startTime: '10:00',
        endTime: '11:00',
        capacity: 4,
        confirmedCount: 2,
        conflictCount: 0,
        status: 'ACTIVE',
        remark: '可约',
        externalSkuId: 'sku-1',
      },
      {
        backendId: 'slot-conflict',
        storeBackendId: '10',
        storeName: '影约云旗舰店',
        serviceGroupBackendId: 'portrait',
        serviceGroupName: '形象照主棚',
        date: '2026-06-15',
        startTime: '14:00',
        endTime: '15:00',
        capacity: 3,
        confirmedCount: 3,
        conflictCount: 1,
        status: 'ACTIVE',
        remark: '抖音与微信同一时段重叠',
        externalSkuId: 'sku-1',
      },
      {
        backendId: 'slot-other-service',
        storeBackendId: '10',
        storeName: '影约云旗舰店',
        serviceGroupBackendId: 'id-photo',
        serviceGroupName: '证件照快拍组',
        date: '2026-06-15',
        startTime: '14:00',
        endTime: '15:00',
        capacity: 1,
        confirmedCount: 1,
        conflictCount: 1,
        status: 'ACTIVE',
        remark: '其他服务组冲突',
        externalSkuId: 'sku-1',
      },
    ]
    const order = makeOrder({
      serviceGroupBackendId: 'portrait',
      externalSkuId: 'sku-1',
    })

    expect(getOrderRescheduleInventorySlot(order, slots, {
      date: '2026-06-15',
      time: '14:30',
      durationMinutes: 30,
    })?.backendId).toBe('slot-conflict')
    expect(getOrderRescheduleInventorySlot(order, slots, {
      date: '2026-06-15',
      time: '11:00',
      durationMinutes: 30,
    })).toBeNull()
  })

  it('builds a conflict message before saving a reschedule into a full slot', () => {
    const slot: BookingInventorySlot = {
      backendId: 'slot-conflict',
      storeBackendId: '10',
      storeName: '影约云旗舰店',
      serviceGroupBackendId: 'portrait',
      serviceGroupName: '形象照主棚',
      date: '2026-06-15',
      startTime: '14:00',
      endTime: '15:00',
      capacity: 3,
      confirmedCount: 3,
      conflictCount: 1,
      status: 'ACTIVE',
      remark: '抖音与微信同一时段重叠',
      externalSkuId: '',
    }

    expect(buildOrderRescheduleConflictMessage(makeOrder(), [slot], {
      date: '2026-06-15',
      time: '14:30',
      durationMinutes: 30,
    })).toBe('目标时段 14:00-15:00 已满且有 1 条冲突；容量 3，已确认 3。抖音与微信同一时段重叠')

    expect(buildOrderRescheduleConflictMessage(makeOrder(), [slot], {
      date: '2026-06-15',
      time: '15:00',
      durationMinutes: 30,
    })).toBe('')
  })

})
