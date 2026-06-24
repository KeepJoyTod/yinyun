import { computed, reactive, ref, watch } from 'vue'
import { format, startOfMonth } from 'date-fns'
import type { BookingOrder } from '../../../shared/stores/appStore'
import { appDerived, appStore } from '../../../shared/stores/appStore'
import {
  buildQuickOrderFilters,
  buildOrderStatusGroupCounts,
  getOrderFilterDate,
  matchesOrderSlotRange,
  matchesQuickOrderFilter,
  matchesOrderStatusGroup,
  isMissingArrivalSchedule,
} from '../orderOperations'
import {
  columns,
  orderTimelineToneStyles,
  paymentTone,
  photoDeliveryStageStyles,
  statusStyles,
  tableColumns,
} from './orderFilterUiConfig'
import { useOrderFilterCalendar } from './useOrderFilterCalendar'
import type {
  AdvancedFilters,
  FilterDropdown,
  UseOrderFiltersParams,
  UseOrderFiltersReturn,
} from './useOrderFilterTypes'

export type { AdvancedFilters, CalendarCell, FilterDropdown, UseOrderFiltersParams, UseOrderFiltersReturn } from './useOrderFilterTypes'
export type OrderAdvancedFilters = AdvancedFilters
export type OrderDropdownFilter = FilterDropdown
export type ActiveFilterTag = { key: string; label: string; clear: () => void }

export function useOrderFilters(params: UseOrderFiltersParams): UseOrderFiltersReturn {
  const {
    selectedTimeType,
    activeQuickFilter,
    activeDropdown,
    slotRange,
    slotScopedOrders,
    statusTab,
    effectiveSearchQuery,
    setSearchQuery,
    externalOrderRange,
    externalArrivalRange,
    externalAdvanced,
    externalDropdownFilters,
  } = params

  const today = new Date()
  const todayKey = format(today, 'yyyy-MM-dd')
  const defaultOrderStart = format(startOfMonth(today), 'yyyy-MM-dd')
  const orderRange = externalOrderRange ?? reactive({
    start: defaultOrderStart,
    end: format(today, 'yyyy-MM-dd'),
  })
  const arrivalRange = externalArrivalRange ?? reactive({
    start: todayKey,
    end: todayKey,
  })

  const activeStartDate = computed({
    get: () => (selectedTimeType.value === 'order' ? orderRange.start : arrivalRange.start),
    set: (v: string) => {
      if (selectedTimeType.value === 'order') orderRange.start = v
      else arrivalRange.start = v
    },
  })

  const activeEndDate = computed({
    get: () => (selectedTimeType.value === 'order' ? orderRange.end : arrivalRange.end),
    set: (v: string) => {
      if (selectedTimeType.value === 'order') orderRange.end = v
      else arrivalRange.end = v
    },
  })

  const {
    calendarMonth,
    calendarCells,
    calendarTitle,
    getCalendarCellClass,
    openCalendar,
    prevMonth,
    nextMonth,
    selectDate,
  } = useOrderFilterCalendar({
    today,
    activeDropdown,
    activeStartDate,
    activeEndDate,
  })

  // Store options
  const storeOptions = computed(() => appDerived.storeNames.value.filter(name => name !== '全部门店'))
  const defaultOrderStoreName = computed(() => storeOptions.value[0] ?? '')
  const advancedStoreOptions = computed(() => storeOptions.value)

  // Orders
  const orders = computed(() => slotScopedOrders.value ?? (activeQuickFilter.value === 'douyin30'
    ? (appStore.ledgerOrders.length ? appStore.ledgerOrders : appStore.orders)
    : appStore.orders))
  const lastDouyinLifeOrderSync = computed(() => appStore.lastDouyinLifeOrderSync)

  const orderScopeLabel = computed(() => {
    const slotLabel = slotRange.value.start
      ? ` · 时段 ${slotRange.value.start}${slotRange.value.end ? `-${slotRange.value.end}` : ''}`
      : ''
    if (slotScopedOrders.value) return `时段定向订单：${slotScopedOrders.value.length} 条${slotLabel}`
    if (activeQuickFilter.value === 'douyin30') {
      return `抖音来客近30天：${appStore.ledgerOrders.length || appStore.orders.length} 条，本地 yy_order 账本${slotLabel}`
    }
    return activeQuickFilter.value === 'all'
      ? `全部订单：${appStore.orders.length} 条，按当前门店和状态筛选${slotLabel}`
      : `今日履约队列：${appStore.orders.length} 条，到店确认、服务中、客片交付${slotLabel}`
  })

  // Filter options
  const uniqueOrderValues = (selector: (order: BookingOrder) => string) =>
    Array.from(new Set(orders.value.map(selector).filter(Boolean)))
  const serviceOptions = computed(() => ['全部服务', ...appDerived.activeProducts.value.map(p => p.name)])
  const paymentOptions = computed(() => ['全部状态', ...uniqueOrderValues(order => order.payment)])
  const sourceOptions = computed(() => ['全部来源', ...uniqueOrderValues(order => order.source)])
  const methodOptions = computed(() => ['全部方式', ...uniqueOrderValues(order => order.method)])
  const statusOptions = computed(() => uniqueOrderValues(order => order.status))

  // Dropdown
  const dropdownFilters = externalDropdownFilters ?? ref<FilterDropdown[]>([
    { label: '服务类型', width: 109, options: serviceOptions.value, value: '服务类型' },
    { label: '支付状态', width: 97.5, options: paymentOptions.value, value: '支付状态' },
    { label: '门店选择', width: 86, options: storeOptions.value, value: '门店选择' },
    { label: '订单来源', width: 86, options: sourceOptions.value, value: '订单来源' },
  ])

  watch([serviceOptions, paymentOptions, storeOptions, sourceOptions], ([services, payments, stores, sources]) => {
    dropdownFilters.value = dropdownFilters.value.map(filter => {
      if (filter.label === '服务类型') return { ...filter, options: services }
      if (filter.label === '支付状态') return { ...filter, options: payments }
      if (filter.label === '门店选择') return { ...filter, options: stores }
      if (filter.label === '订单来源') return { ...filter, options: sources }
      return filter
    })
  }, { immediate: true })

  const selectDropdown = (label: string, option: string) => {
    const f = dropdownFilters.value.find(d => d.label === label)
    if (!f) return
    const isAll = option.startsWith('全部')
    f.value = isAll ? label : option
    if (label === '门店选择') advanced.value.store = isAll ? defaultOrderStoreName.value : option
    activeDropdown.value = null
  }

  const getDropdownCaption = (label: string) => {
    if (label === '门店选择') return '选择门店'
    if (label === '订单来源') return '下单来源'
    return label
  }

  const selectMethodFilter = (option: string) => {
    advanced.value.method = option
    activeDropdown.value = null
  }

  // Advanced
  const advanced = externalAdvanced ?? ref<AdvancedFilters>({
    store: '全部门店',
    source: '全部来源',
    payment: '全部状态',
    service: '全部服务',
    method: '全部方式',
    amountMin: '',
    amountMax: '',
    status: [],
  })

  const normalizeOrderStoreName = (storeName: string) =>
    storeOptions.value.includes(storeName) ? storeName : ''

  const storeNameForOrderScope = computed(() =>
    normalizeOrderStoreName(advanced.value.store)
    || normalizeOrderStoreName(dropdownFilters.value.find(filter => filter.label === '门店选择')?.value ?? '')
    || defaultOrderStoreName.value
  )

  const selectOrderStore = (storeName: string) => {
    const next = normalizeOrderStoreName(storeName)
    if (!next) return
    advanced.value.store = next
    const storeFilter = dropdownFilters.value.find(filter => filter.label === '门店选择')
    if (storeFilter) storeFilter.value = next
    activeDropdown.value = null
  }

  function ensureConcreteStoreScope() {
    const next = storeNameForOrderScope.value
    if (!next) return
    if (advanced.value.store !== next) advanced.value.store = next
    const storeFilter = dropdownFilters.value.find(filter => filter.label === '门店选择')
    if (storeFilter && storeFilter.value !== next) storeFilter.value = next
  }

  const toggleAdvancedStatus = (opt: string) => {
    if (advanced.value.status.includes(opt)) {
      advanced.value.status = advanced.value.status.filter(s => s !== opt)
      return
    }
    advanced.value.status = [...advanced.value.status, opt]
  }

  // Quick filters & tabs
  const quickOrderFilters = computed(() => buildQuickOrderFilters(orders.value, todayKey))
  const statusTabItems = computed(() => buildOrderStatusGroupCounts(orders.value))

  const matchesStatusTab = (order: BookingOrder) => matchesOrderStatusGroup(order, statusTab.value)

  const matchesDropdown = (o: BookingOrder) => {
    const byService = dropdownFilters.value.find(d => d.label === '服务类型')?.value ?? '服务类型'
    if (byService !== '服务类型' && o.service !== byService) return false

    const byPay = dropdownFilters.value.find(d => d.label === '支付状态')?.value ?? '支付状态'
    if (byPay !== '支付状态' && o.payment !== byPay) return false

    const byStore = dropdownFilters.value.find(d => d.label === '门店选择')?.value ?? '门店选择'
    if (byStore !== '门店选择' && o.store !== byStore) return false

    const bySource = dropdownFilters.value.find(d => d.label === '订单来源')?.value ?? '订单来源'
    if (bySource !== '订单来源' && o.source !== bySource) return false

    return true
  }

  const matchesAdvanced = (o: BookingOrder) => {
    if (storeNameForOrderScope.value && o.store !== storeNameForOrderScope.value) return false
    if (advanced.value.source !== '全部来源' && o.source !== advanced.value.source) return false
    if (advanced.value.payment !== '全部状态' && o.payment !== advanced.value.payment) return false
    if (advanced.value.service !== '全部服务' && o.service !== advanced.value.service) return false
    if (advanced.value.method !== '全部方式' && o.method !== advanced.value.method) return false

    const min = Number(advanced.value.amountMin)
    if (Number.isFinite(min) && advanced.value.amountMin !== '' && o.amount < min) return false

    const max = Number(advanced.value.amountMax)
    if (Number.isFinite(max) && advanced.value.amountMax !== '' && o.amount > max) return false

    if (advanced.value.status.length > 0 && !advanced.value.status.includes(o.status)) return false

    return true
  }

  const getFilterDate = (o: BookingOrder) => getOrderFilterDate(o, selectedTimeType.value, todayKey)

  // Anomaly
  const anomalyFilters = ref(new Set<string>())

  const anomalyFilterOptions = computed(() => {
    const missingStore = orders.value.filter(o =>
      !o.storeBackendId || !appStore.stores.some(s => s.backendId === o.storeBackendId)
    ).length
    const missingArrival = orders.value.filter(isMissingArrivalSchedule).length
    const missingProduct = orders.value.filter(o =>
      !o.service || o.service === '未知产品' || o.service === '-'
    ).length

    return [
      { key: 'missingStore', label: '缺门店映射', count: missingStore },
      { key: 'missingArrival', label: '缺预约时间', count: missingArrival },
      { key: 'missingProduct', label: '缺产品名', count: missingProduct },
    ]
  })

  const toggleAnomalyFilter = (key: string) => {
    if (anomalyFilters.value.has(key)) {
      anomalyFilters.value.delete(key)
    } else {
      anomalyFilters.value.add(key)
    }
  }

  // Filter results
  const filteredOrders = computed(() => {
    const q = effectiveSearchQuery.value
    let result = orders.value.filter(o => {
      if (q) {
        const hay = `${o.customer} ${o.phone} ${o.id}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }

      const dateKey = getFilterDate(o)
      if (activeStartDate.value && dateKey && dateKey < activeStartDate.value) return false
      if (activeEndDate.value && dateKey && dateKey > activeEndDate.value) return false
      if (!matchesOrderSlotRange(o, slotRange.value)) return false

      if (!matchesDropdown(o)) return false
      if (!matchesAdvanced(o)) return false
      if (!matchesQuickOrderFilter(o, activeQuickFilter.value, todayKey)) return false
      if (!matchesStatusTab(o)) return false
      return true
    })

    // Apply anomaly filters
    if (anomalyFilters.value.has('missingStore')) {
      result = result.filter(o => !o.storeBackendId || !appStore.stores.some(s => s.backendId === o.storeBackendId))
    }
    if (anomalyFilters.value.has('missingArrival')) {
      result = result.filter(isMissingArrivalSchedule)
    }
    if (anomalyFilters.value.has('missingProduct')) {
      result = result.filter(o => !o.service || o.service === '未知产品' || o.service === '-')
    }

    return result
  })

  const emptyStateTitle = computed(() => {
    if (!orders.value.length) return '暂无订单数据'
    if (hasSearchFilter.value) return '搜索无结果'
    if (hasActiveFilters.value && !hasOnlyQuickFilter.value) return '当前筛选无结果'
    if (activeQuickFilter.value === 'todayOps') return '今日待处理订单已清空'
    if (activeQuickFilter.value === 'pending') return '待确认订单已处理完'
    if (activeQuickFilter.value === 'today') return '今天暂无匹配订单'
    if (activeQuickFilter.value === 'selection') return '暂无客片交付订单'
    if (activeQuickFilter.value === 'issues') return '暂无缺资料订单'
    return '当前筛选下暂无订单'
  })

  const emptyStateHint = computed(() => {
    if (!orders.value.length) return '当前统一订单库暂无可展示订单；真实订单同步或小程序下单后会出现在这里。'
    if (hasSearchFilter.value) return '可以换一个客户姓名、手机号或订单号再搜，也可以清空搜索标签。'
    if (hasActiveFilters.value && !hasOnlyQuickFilter.value) return '数据存在但不匹配当前筛选条件，可以逐个清空筛选标签或重置全部筛选。'
    if (activeQuickFilter.value === 'todayOps') return '今天到店的确认、到店、服务中动作都已处理；需要追历史单时再切到近30天来客。'
    if (activeQuickFilter.value === 'pending') return '今天到店的待确认订单已处理完；需要追历史单时再切到近30天来客。'
    if (activeQuickFilter.value === 'issues') return '缺手机号、缺客户信息或非来客订单缺预约时间的渠道单会留在后台对账，不进入店员日常处理流。'
    return '当前筛选条件没有匹配数据，可以查看近30天来客或重置筛选。'
  })

  const paginationStart = computed(() => filteredOrders.value.length > 0 ? 1 : 0)

  const totalAmount = computed(() => {
    const sum = filteredOrders.value.reduce((acc, o) => acc + o.amount, 0)
    return sum.toLocaleString('zh-CN')
  })

  // Filter tags
  const hasSearchFilter = computed(() => effectiveSearchQuery.value.length > 0)

  const hasDateRangeFilter = computed(() => {
    if (!activeStartDate.value && !activeEndDate.value) return false
    if (selectedTimeType.value !== 'arrival') return true
    return activeStartDate.value !== todayKey || activeEndDate.value !== todayKey
  })

  const activeFilterTags = computed<ActiveFilterTag[]>(() => {
    const tags: ActiveFilterTag[] = []
    if (effectiveSearchQuery.value) {
      tags.push({ key: 'search', label: `搜索：${effectiveSearchQuery.value}`, clear: () => { setSearchQuery('') } })
    }
    if (hasDateRangeFilter.value) {
      const timeLabel = selectedTimeType.value === 'order' ? '下单时间' : '到店时间'
      const rangeLabel = `${activeStartDate.value || '不限'} 至 ${activeEndDate.value || '不限'}`
      tags.push({
        key: 'time',
        label: `${timeLabel}：${rangeLabel}`,
        clear: () => {
          activeStartDate.value = ''
          activeEndDate.value = ''
        },
      })
    }
    if (activeQuickFilter.value !== 'todayOps') {
      const f = quickOrderFilters.value.find(q => q.key === activeQuickFilter.value)
      tags.push({ key: 'quick', label: f?.label ?? activeQuickFilter.value, clear: () => { activeQuickFilter.value = 'todayOps' } })
    }
    dropdownFilters.value.forEach(filter => {
      if (filter.label === '门店选择') return
      const isAll = filter.value === filter.label || filter.value.startsWith('全部')
      if (!isAll) {
        tags.push({ key: filter.label, label: `${filter.label}：${filter.value}`, clear: () => { filter.value = filter.label } })
      }
    })
    if (storeNameForOrderScope.value && storeNameForOrderScope.value !== defaultOrderStoreName.value) {
      tags.push({ key: 'advanced-store', label: `高级门店：${storeNameForOrderScope.value}`, clear: () => { selectOrderStore(defaultOrderStoreName.value) } })
    }
    if (advanced.value.source !== '全部来源') tags.push({ key: 'advanced-source', label: `高级来源：${advanced.value.source}`, clear: () => { advanced.value.source = '全部来源' } })
    if (advanced.value.payment !== '全部状态') tags.push({ key: 'advanced-payment', label: `高级支付：${advanced.value.payment}`, clear: () => { advanced.value.payment = '全部状态' } })
    if (advanced.value.service !== '全部服务') tags.push({ key: 'advanced-service', label: `高级服务：${advanced.value.service}`, clear: () => { advanced.value.service = '全部服务' } })
    if (advanced.value.method !== '全部方式') tags.push({ key: 'advanced-method', label: `高级方式：${advanced.value.method}`, clear: () => { advanced.value.method = '全部方式' } })
    if (advanced.value.amountMin !== '') tags.push({ key: 'advanced-amount-min', label: `最低金额：¥${advanced.value.amountMin}`, clear: () => { advanced.value.amountMin = '' } })
    if (advanced.value.amountMax !== '') tags.push({ key: 'advanced-amount-max', label: `最高金额：¥${advanced.value.amountMax}`, clear: () => { advanced.value.amountMax = '' } })
    advanced.value.status.forEach(status => {
      tags.push({ key: `advanced-status-${status}`, label: `订单状态：${status}`, clear: () => { advanced.value.status = advanced.value.status.filter(item => item !== status) } })
    })
    return tags
  })

  const hasActiveFilters = computed(() => activeFilterTags.value.length > 0)
  const hasOnlyQuickFilter = computed(() => activeFilterTags.value.length === 1 && activeFilterTags.value[0]?.key === 'quick')

  // Reset
  const resetAdvanced = () => {
    advanced.value = {
      store: defaultOrderStoreName.value,
      source: '全部来源',
      payment: '全部状态',
      service: '全部服务',
      method: '全部方式',
      amountMin: '',
      amountMax: '',
      status: [],
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    selectedTimeType.value = 'arrival'
    activeQuickFilter.value = 'todayOps'
    slotRange.value = { start: '', end: '' }
    slotScopedOrders.value = null
    statusTab.value = 'all'
    activeDropdown.value = null
    dropdownFilters.value = dropdownFilters.value.map(f => ({ ...f, value: f.label }))
    resetAdvanced()
    const now = new Date()
    const nowToday = format(now, 'yyyy-MM-dd')
    orderRange.start = format(startOfMonth(now), 'yyyy-MM-dd')
    orderRange.end = nowToday
    arrivalRange.start = nowToday
    arrivalRange.end = nowToday
    ensureConcreteStoreScope()
  }

  return {
    todayKey,
    today,
    orderRange,
    arrivalRange,
    activeStartDate,
    activeEndDate,
    calendarMonth,
    calendarCells,
    calendarTitle,
    getCalendarCellClass,
    openCalendar,
    prevMonth,
    nextMonth,
    selectDate,
    storeOptions,
    defaultOrderStoreName,
    advancedStoreOptions,
    serviceOptions,
    paymentOptions,
    sourceOptions,
    methodOptions,
    statusOptions,
    orders,
    lastDouyinLifeOrderSync,
    orderScopeLabel,
    dropdownFilters,
    selectDropdown,
    getDropdownCaption,
    selectMethodFilter,
    advanced,
    normalizeOrderStoreName,
    storeNameForOrderScope,
    selectOrderStore,
    ensureConcreteStoreScope,
    toggleAdvancedStatus,
    columns,
    tableColumns,
    statusStyles,
    photoDeliveryStageStyles,
    orderTimelineToneStyles,
    paymentTone,
    quickOrderFilters,
    statusTabItems,
    matchesStatusTab,
    filteredOrders,
    emptyStateTitle,
    emptyStateHint,
    paginationStart,
    totalAmount,
    activeFilterTags,
    hasSearchFilter,
    hasDateRangeFilter,
    hasActiveFilters,
    hasOnlyQuickFilter,
    anomalyFilters,
    anomalyFilterOptions,
    toggleAnomalyFilter,
    resetAdvanced,
    resetFilters,
  }
}
