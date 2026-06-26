import { computed, reactive, ref } from 'vue'
import { format, startOfMonth } from 'date-fns'
import type { BookingOrder } from '../../../shared/stores/appStore'
import type { QuickOrderFilter, OrderSlotRange } from '../orderOperations'
import type { OrderAdvancedFilters, OrderDropdownFilter } from './useOrderFilters'

export type StaffBookingInitial = { storeName: string; date?: string; startTime?: string; endTime?: string }
export type CopyOrderDraft = {
  scheduleMode: 'REUSE_SLOT' | 'UNDECIDED'
  date: string
  time: string
  durationMinutes: number
  remark: string
}

export function useOrdersViewState() {
  const searchQuery = ref('')
  const searchQueryArmed = ref(false)
  const searchQueryTouched = ref(false)
  const selectedTimeType = ref<'order' | 'arrival'>('arrival')
  const activeDropdown = ref<string | null>(null)
  const advancedOpen = ref(false)
  const activeQuickFilter = ref<QuickOrderFilter>('todayOps')
  const slotRange = ref<Required<OrderSlotRange>>({ start: '', end: '' })
  const slotScopedOrders = ref<BookingOrder[] | null>(null)
  const slotScopedDashboardContext = ref<{
    date: string; storeId?: string; slotStart: string; slotEnd?: string
  } | null>(null)
  const statusTab = ref('all')
  const anomalyFilters = ref(new Set<string>())
  const ordersTableScrollRef = ref<HTMLElement | null>(null)
  const syncingFromQuery = ref(false)
  const lastAllOrdersQueryKey = ref('')
  const lastOpenedOrderQuery = ref('')
  const cancelReason = ref('')
  const cancellingOrderId = ref('')
  const updatingOrderId = ref('')
  const confirmingPaymentOrderId = ref('')
  const refundingOrderId = ref('')
  const refundReason = ref('')
  const copyingOrderId = ref('')
  const orderAlbumActionLoading = ref<'' | 'notify' | 'confirm' | 'deliver'>('')
  const orderPhotoAccessLoading = ref(false)
  const orderPhotoAccessError = ref('')
  const orderPhotoAccessRequestId = ref(0)
  const orderActionNotice = ref<{ type: 'success' | 'error'; message: string } | null>(null)
  const selectedOrder = ref<BookingOrder | null>(null)
  const exportingOrders = ref(false)
  const reschedulingOrderId = ref('')
  const rescheduleConflict = ref('')
  const syncingDouyinOrders = ref(false)
  const operationLogsLoading = ref(false)
  const operationLogsReloadQueued = ref(false)
  const operationLogsNotice = ref('')
  const staffBookingOpen = ref(false)
  const staffBookingInitial = ref<StaffBookingInitial | null>(null)
  const printDialogOpen = ref(false)
  const printDialogOrderId = ref<string | null>(null)
  const rescheduleDraft = reactive({ date: '', time: '', durationMinutes: 60, remark: '' })
  const copyOrderDraft = reactive<CopyOrderDraft>({
    scheduleMode: 'REUSE_SLOT',
    date: '',
    time: '',
    durationMinutes: 60,
    remark: '',
  })
  const cancelReasonOptions = ['客户主动取消', '客户未到店', '重复预约/录入错误', '门店容量调整']
  const rescheduleReasonOptions = ['客户要求改期', '客户迟到顺延', '门店调整时段', '原时段满员改期']

  const today = new Date()
  const todayKey = format(today, 'yyyy-MM-dd')
  const defaultOrderStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const orderRange = reactive({ start: defaultOrderStart, end: todayKey })
  const arrivalRange = reactive({ start: todayKey, end: todayKey })
  const calendarMonth = ref(startOfMonth(today))

  const activeStartDate = computed({
    get: () => (selectedTimeType.value === 'order' ? orderRange.start : arrivalRange.start),
    set: (value: string) => {
      if (selectedTimeType.value === 'order') orderRange.start = value
      else arrivalRange.start = value
    },
  })

  const activeEndDate = computed({
    get: () => (selectedTimeType.value === 'order' ? orderRange.end : arrivalRange.end),
    set: (value: string) => {
      if (selectedTimeType.value === 'order') orderRange.end = value
      else arrivalRange.end = value
    },
  })

  const advanced = ref<OrderAdvancedFilters>({
    store: '全部门店',
    source: '全部来源',
    payment: '全部状态',
    service: '全部服务',
    method: '全部方式',
    amountMin: '',
    amountMax: '',
    status: [] as string[],
  })

  const dropdownFilters = ref<OrderDropdownFilter[]>([
    { label: '服务类型', width: 109, options: [] as string[], value: '服务类型' },
    { label: '支付状态', width: 97.5, options: [] as string[], value: '支付状态' },
    { label: '门店选择', width: 86, options: [] as string[], value: '门店选择' },
    { label: '订单来源', width: 86, options: [] as string[], value: '订单来源' },
  ])

  const toggleAdvancedStatus = (option: string) => {
    if (advanced.value.status.includes(option)) {
      advanced.value.status = advanced.value.status.filter(status => status !== option)
      return
    }
    advanced.value.status = [...advanced.value.status, option]
  }

  return {
    searchQuery, searchQueryArmed, searchQueryTouched,
    selectedTimeType, activeDropdown, advancedOpen, activeQuickFilter,
    slotRange, slotScopedOrders, slotScopedDashboardContext,
    statusTab, anomalyFilters, ordersTableScrollRef,
    syncingFromQuery, lastAllOrdersQueryKey, lastOpenedOrderQuery,
    cancelReason, cancellingOrderId, updatingOrderId, confirmingPaymentOrderId, refundingOrderId, refundReason, copyingOrderId,
    orderAlbumActionLoading, orderPhotoAccessLoading, orderPhotoAccessError, orderPhotoAccessRequestId,
    orderActionNotice, selectedOrder, exportingOrders,
    reschedulingOrderId, rescheduleConflict, syncingDouyinOrders,
    operationLogsLoading, operationLogsReloadQueued, operationLogsNotice,
    staffBookingOpen, staffBookingInitial, printDialogOpen, printDialogOrderId,
    rescheduleDraft, copyOrderDraft, cancelReasonOptions, rescheduleReasonOptions,
    today, todayKey, defaultOrderStart, orderRange, arrivalRange,
    activeStartDate, activeEndDate, calendarMonth, advanced, dropdownFilters,
    toggleAdvancedStatus,
  }
}
