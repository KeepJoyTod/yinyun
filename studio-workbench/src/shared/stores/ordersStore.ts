import { reactive } from 'vue'
import { backendApi, type OrderListQuery, type OrderStatusStatDto, type ScheduleItemDto, type TodaySlotDto, type TrendStatDto } from '../api/backend'
import type { BookingOrder, BookingOrderStatus, DashboardFinanceInfo, BookingInventorySlot } from './appStoreTypes'
import { mapOrder, mapBookingInventory, buildScheduleItemsFromOrders, buildTodaySlots, buildTrendStats, buildOrderStatusStats, currentMonthOrderQuery } from './appStoreTransforms'
import type { StoreInfo } from './appStoreTypes'
import type { BackendId } from '../api/backendId'

export const ordersStore = reactive({
  orders: [] as BookingOrder[],
  ledgerOrders: [] as BookingOrder[],
  reportOrders: [] as BookingOrder[],
  bookingInventory: [] as BookingInventorySlot[],
  scheduleItems: [] as ScheduleItemDto[],
  demoScheduleItems: [] as ScheduleItemDto[],
  orderStatusStats: [] as OrderStatusStatDto[],
  trendStats: [] as TrendStatDto[],
  todaySlots: [] as TodaySlotDto[],
  dashboardFinance: null as DashboardFinanceInfo | null,

  reset() {
    this.orders = []
    this.ledgerOrders = []
    this.reportOrders = []
    this.bookingInventory = []
    this.scheduleItems = []
    this.demoScheduleItems = []
    this.orderStatusStats = []
    this.trendStats = []
    this.todaySlots = []
    this.dashboardFinance = null
  },

  async refreshTodayOrders(stores: StoreInfo[]) {
    const page = await backendApi.listTodayOrders()
    this.orders = page.items.map(order => mapOrder(order, stores))
    return this.orders
  },

  async refreshAllOrders(stores: StoreInfo[]) {
    const page = await backendApi.listAllOrders()
    this.ledgerOrders = page.items.map(order => mapOrder(order, stores))
    this.reportOrders = this.ledgerOrders
    return this.ledgerOrders
  },

  async refreshReportOrders(stores: StoreInfo[], query: OrderListQuery = currentMonthOrderQuery()) {
    const page = await backendApi.listOrders(query)
    this.reportOrders = page.items.map(order => mapOrder(order, stores))
    return this.reportOrders
  },

  async refreshBookingInventory(stores: StoreInfo[], serviceGroups: any[], input?: { date?: string; storeBackendId?: BackendId; serviceGroupBackendId?: BackendId; conflictOnly?: boolean }) {
    const inventory = await backendApi.listBookingInventory({
      bizDate: input?.date,
      beginBizDate: input?.date,
      endBizDate: input?.date,
      storeId: input?.storeBackendId,
      serviceGroupId: input?.serviceGroupBackendId,
      conflictOnly: input?.conflictOnly ? '1' : undefined,
    })
    this.bookingInventory = inventory.map(item => mapBookingInventory(item, stores, serviceGroups))
    return this.bookingInventory
  },

  async refreshDashboardStats(date: string, storeBackendId?: BackendId) {
    const [statsPage, trendData, slotsData] = await Promise.all([
      backendApi.orderStatusStats({ bizDate: date, storeId: storeBackendId }),
      backendApi.trendStats({ bizDate: date, storeId: storeBackendId }),
      backendApi.todaySlots({ bizDate: date, storeId: storeBackendId }),
    ])
    this.orderStatusStats = buildOrderStatusStats(statsPage)
    this.trendStats = buildTrendStats(trendData)
    this.todaySlots = buildTodaySlots(slotsData)
    return { orderStatusStats: this.orderStatusStats, trendStats: this.trendStats, todaySlots: this.todaySlots }
  },

  async refreshDashboardFinance(date: string, storeBackendId?: BackendId) {
    const finance = await backendApi.dashboardFinance({ bizDate: date, storeBackendId })
    this.dashboardFinance = finance
    return this.dashboardFinance
  },

  refreshSchedule(orders: BookingOrder[]) {
    this.scheduleItems = buildScheduleItemsFromOrders(orders)
    this.demoScheduleItems = this.scheduleItems
    return this.scheduleItems
  },

  loadDemoOrders(stores: StoreInfo[]) {
    const today = new Date().toISOString().slice(0, 10)
    this.orders = [
      {
        backendId: '9001',
        storeBackendId: '1',
        productBackendId: '101',
        id: 'YY202606100001',
        customer: '陈女士',
        phone: '13800003333',
        store: stores[0]?.name ?? '影约云深圳旗舰店',
        service: '证件照精修套餐',
        source: '抖音来客',
        method: '到店拍摄',
        orderTime: `${today.slice(5)} 09:20`,
        orderDate: today,
        orderClock: '09:20',
        arrivalDate: today,
        arrivalTime: '10:00',
        status: '待确认',
        payment: '已支付',
        amount: 129,
        remark: '',
        bookingStatus: '待确认',
        startAt: `${today}T10:00`,
        endAt: `${today}T10:30`,
        durationMinutes: 30,
      },
      {
        backendId: '9002',
        storeBackendId: '1',
        productBackendId: '102',
        id: 'YY202606100002',
        customer: '李先生',
        phone: '13900004444',
        store: stores[0]?.name ?? '影约云深圳旗舰店',
        service: '个人形象照套餐',
        source: '到店',
        method: '到店拍摄',
        orderTime: `${today.slice(5)} 09:45`,
        orderDate: today,
        orderClock: '09:45',
        arrivalDate: today,
        arrivalTime: '11:00',
        status: '已确认',
        payment: '已支付',
        amount: 399,
        remark: '',
        bookingStatus: '已确认',
        startAt: `${today}T11:00`,
        endAt: `${today}T12:00`,
        durationMinutes: 60,
      },
    ]
    this.ledgerOrders = this.orders
    this.reportOrders = this.ledgerOrders
    this.bookingInventory = [
      {
        backendId: 'inv-001',
        storeBackendId: '1',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        serviceGroupBackendId: '2001',
        serviceGroupName: '证件照组',
        date: today,
        startTime: '10:00',
        endTime: '10:30',
        capacity: 4,
        confirmedCount: 1,
        conflictCount: 0,
        status: 'ACTIVE',
        remark: '',
      },
      {
        backendId: 'inv-002',
        storeBackendId: '1',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        serviceGroupBackendId: '2002',
        serviceGroupName: '形象照组',
        date: today,
        startTime: '11:00',
        endTime: '12:00',
        capacity: 2,
        confirmedCount: 1,
        conflictCount: 0,
        status: 'ACTIVE',
        remark: '',
      },
    ]
    this.orderStatusStats = [
      { status: '待服务', label: '待服务', count: 1, amountCents: 12900 },
      { status: '服务中', label: '服务中', count: 1, amountCents: 39900 },
      { status: '已完成', label: '已完成', count: 0, amountCents: 0 },
      { status: '已取消', label: '已取消', count: 0, amountCents: 0 },
      { status: '已退单', label: '已退单', count: 0, amountCents: 0 },
    ]
    this.scheduleItems = buildScheduleItemsFromOrders(this.orders)
    this.demoScheduleItems = this.scheduleItems
    this.dashboardFinance = null
  },

  loadDemoDashboardStats(stores: StoreInfo[]) {
    const today = new Date().toISOString().slice(0, 10)
    this.trendStats = [
      { day: `${today.slice(0, 7)}-10`, bookedCount: 5, arrivedCount: 4 },
      { day: `${today.slice(0, 7)}-11`, bookedCount: 8, arrivedCount: 6 },
      { day: `${today.slice(0, 7)}-12`, bookedCount: 12, arrivedCount: 10 },
      { day: `${today.slice(0, 7)}-13`, bookedCount: 7, arrivedCount: 5 },
      { day: `${today.slice(0, 7)}-14`, bookedCount: 15, arrivedCount: 13 },
      { day: `${today.slice(0, 7)}-15`, bookedCount: 10, arrivedCount: 8 },
      { day: today, bookedCount: 6, arrivedCount: 3 },
    ]
    this.todaySlots = []
  },
})
