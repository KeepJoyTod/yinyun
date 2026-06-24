import { computed, type Ref, type ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router'
import type { QuickOrderFilter, OrderSlotRange } from '../orderOperations'
import { resolveOrderSearchQueryState, shouldAcceptOrderSearchInput, quickOrderFilterKeys, normalizeOrderStatusTab } from '../orderOperations'

export type FilterDropdown = { label: string; width: number; options: string[]; value: string }

export type AdvancedFilters = {
  store: string
  source: string
  payment: string
  service: string
  method: string
  amountMin: string
  amountMax: string
  status: string[]
}

export type UseOrderRouteScopeParams = {
  route: RouteLocationNormalizedLoaded
  router: Router
  searchQuery: Ref<string>
  searchQueryArmed: Ref<boolean>
  searchQueryTouched: Ref<boolean>
  selectedTimeType: Ref<'order' | 'arrival'>
  activeQuickFilter: Ref<QuickOrderFilter>
  activeStartDate: Ref<string>
  activeEndDate: Ref<string>
  slotRange: Ref<OrderSlotRange>
  slotScopedDashboardContext: Ref<{
    date: string
    storeId?: string
    slotStart: string
    slotEnd?: string
  } | null>
  statusTab: Ref<string>
  advanced: Ref<AdvancedFilters>
  dropdownFilters: Ref<FilterDropdown[]>
  syncingFromQuery: Ref<boolean>
  storeNameForOrderScope: ComputedRef<string>
  resolveStoreBackendIdFromName: (name: string) => string | undefined
  resolveStoreNameFromBackendId: (id: string) => string
}

export type UseOrderRouteScopeReturn = {
  readQueryString: (value: unknown) => string
  isDateKey: (value: string) => boolean
  applySearchQueryFromRoute: (value: string) => void
  armSearchQueryInput: () => void
  setSearchQuery: (value: string) => void
  handleSearchInput: (event: Event) => void
  searchQueryState: ComputedRef<{ effectiveValue: string; urlValue: string | undefined }>
  effectiveSearchQuery: ComputedRef<string>
  syncedSearchQuery: ComputedRef<string | undefined>
  slotScopedRouteSearch: ComputedRef<boolean>
  applyFiltersFromQuery: () => void
  syncFiltersToUrl: () => void
}

export function useOrderRouteScope(params: UseOrderRouteScopeParams): UseOrderRouteScopeReturn {
  const {
    route,
    router,
    searchQuery,
    searchQueryArmed,
    searchQueryTouched,
    selectedTimeType,
    activeQuickFilter,
    activeStartDate,
    activeEndDate,
    slotRange,
    slotScopedDashboardContext,
    statusTab,
    advanced,
    dropdownFilters,
    syncingFromQuery,
    storeNameForOrderScope,
    resolveStoreBackendIdFromName,
    resolveStoreNameFromBackendId,
  } = params

  const readQueryString = (value: unknown): string =>
    Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

  const isDateKey = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value)

  const applySearchQueryFromRoute = (value: string) => {
    searchQueryArmed.value = false
    searchQueryTouched.value = false
    searchQuery.value = value
  }

  const armSearchQueryInput = () => {
    searchQueryArmed.value = true
  }

  const setSearchQuery = (value: string) => {
    searchQueryArmed.value = true
    searchQueryTouched.value = true
    searchQuery.value = value
  }

  const handleSearchInput = (event: Event) => {
    const value = event.target instanceof HTMLInputElement ? event.target.value : ''
    if (!shouldAcceptOrderSearchInput({
      routeQueryValue: route.query.q || route.query.keyword,
      userArmed: searchQueryArmed.value,
    })) {
      applySearchQueryFromRoute('')
      return
    }
    setSearchQuery(value)
  }

  const searchQueryState = computed(() => resolveOrderSearchQueryState({
    inputValue: searchQuery.value,
    routeQueryValue: route.query.q || route.query.keyword,
    slotScoped: Boolean(readQueryString(route.query.slotStart) || readQueryString(route.query.slotEnd)),
    userEdited: searchQueryTouched.value,
  }))

  const effectiveSearchQuery = computed(() => searchQueryState.value.effectiveValue)
  const syncedSearchQuery = computed(() => searchQueryState.value.urlValue)
  const slotScopedRouteSearch = computed(() =>
    Boolean((readQueryString(route.query.slotStart) || readQueryString(route.query.slotEnd))
      && readQueryString(route.query.q || route.query.keyword).trim()),
  )

  const readSlotOriginDateFromRoute = () => {
    const value = readQueryString(route.query.slotOriginDate).trim()
    return isDateKey(value) ? value : undefined
  }

  const readSlotOriginStoreIdFromRoute = () =>
    readQueryString(route.query.slotOriginStoreId).trim() || undefined

  const syncSlotScopedDashboardContextFromRoute = () => {
    const slotStart = readQueryString(route.query.slotStart).trim()
    const slotEnd = readQueryString(route.query.slotEnd).trim()
    if (!slotStart) {
      slotScopedDashboardContext.value = null
      return
    }
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const start = readQueryString(route.query.start).trim()
    const end = readQueryString(route.query.end).trim()
    const nextContext = {
      date: readSlotOriginDateFromRoute() || (isDateKey(start) ? start : isDateKey(end) ? end : todayKey),
      storeId: readSlotOriginStoreIdFromRoute() || readQueryString(route.query.storeId).trim() || undefined,
      slotStart,
      slotEnd: slotEnd || undefined,
    }
    const current = slotScopedDashboardContext.value
    if (!current) {
      slotScopedDashboardContext.value = nextContext
      return
    }
    if (current.slotStart !== nextContext.slotStart || current.slotEnd !== nextContext.slotEnd) {
      slotScopedDashboardContext.value = nextContext
      return
    }
    if (readSlotOriginDateFromRoute() && current.date !== nextContext.date) {
      slotScopedDashboardContext.value = nextContext
      return
    }
    if (readSlotOriginStoreIdFromRoute() && current.storeId !== nextContext.storeId) {
      slotScopedDashboardContext.value = nextContext
    }
  }

  const applyFiltersFromQuery = () => {
    syncingFromQuery.value = true
    applySearchQueryFromRoute(readQueryString(route.query.q || route.query.keyword))
    const quick = readQueryString(route.query.quick) as QuickOrderFilter
    if ((quickOrderFilterKeys as readonly string[]).includes(quick)) activeQuickFilter.value = quick
    const timeType = readQueryString(route.query.time)
    if (timeType === 'order' || timeType === 'arrival') selectedTimeType.value = timeType
    const start = readQueryString(route.query.start)
    const end = readQueryString(route.query.end)
    if (isDateKey(start)) activeStartDate.value = start
    if (isDateKey(end)) activeEndDate.value = end
    const slotStart = readQueryString(route.query.slotStart)
    const slotEnd = readQueryString(route.query.slotEnd)
    slotRange.value = { start: slotStart, end: slotEnd }
    syncSlotScopedDashboardContextFromRoute()
    if ((quick === 'all' || quick === 'douyin30') && !isDateKey(start) && !isDateKey(end)) {
      activeStartDate.value = ''
      activeEndDate.value = ''
    }

    // 下拉筛选回填：?ds=服务&dp=支付&dm=门店&dr=来源
    const applyDropdown = (queryKey: string, filterLabel: string) => {
      const raw = readQueryString(route.query[queryKey])
      if (!raw) return
      const f = dropdownFilters.value.find(d => d.label === filterLabel)
      if (f) f.value = raw
    }
    applyDropdown('ds', '服务类型')
    applyDropdown('dp', '支付状态')
    applyDropdown('dm', '门店选择')
    applyDropdown('dr', '订单来源')

    // 高级筛选回填
    const readAdvancedScalar = (key: string): string => readQueryString(route.query[key])
    const stTab = readQueryString(route.query.statusTab)
    if (stTab) statusTab.value = normalizeOrderStatusTab(stTab)
    const store = readAdvancedScalar('astore')
    const storeId = readAdvancedScalar('storeId')
    const resolvedStore = resolveStoreNameFromBackendId(storeId)
    const source = readAdvancedScalar('asource')
    const payment = readAdvancedScalar('apayment')
    const service = readAdvancedScalar('aservice')
    const method = readAdvancedScalar('amethod')
    const amountMin = readAdvancedScalar('amin')
    const amountMax = readAdvancedScalar('amax')
    const statusRaw = readQueryString(route.query.astatus)
    if (resolvedStore || store) advanced.value.store = resolvedStore || store
    if (source) advanced.value.source = source
    if (payment) advanced.value.payment = payment
    if (service) advanced.value.service = service
    if (method) advanced.value.method = method
    if (amountMin !== '') advanced.value.amountMin = amountMin
    if (amountMax !== '') advanced.value.amountMax = amountMax
    if (statusRaw) {
      const parsed = statusRaw.split(',').filter(Boolean)
      if (parsed.length) advanced.value.status = parsed
    }

    window.queueMicrotask(() => {
      syncingFromQuery.value = false
      if (slotScopedRouteSearch.value) syncFiltersToUrl()
    })
  }

  const syncFiltersToUrl = () => {
    if (syncingFromQuery.value) return
    // 把下拉框的 label 默认值视为"未选"，不写回 URL
    const dropdownValue = (label: string) => {
      const f = dropdownFilters.value.find(d => d.label === label)
      if (!f || f.value === label || f.value.startsWith('全部')) return undefined
      return f.value
    }
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        q: syncedSearchQuery.value,
        orderId: route.query.orderId || undefined,
        quick: activeQuickFilter.value,
        time: selectedTimeType.value,
        start: activeStartDate.value || undefined,
        end: activeEndDate.value || undefined,
        slotStart: slotRange.value.start || undefined,
        slotEnd: slotRange.value.end || undefined,
        slotOriginDate: slotScopedDashboardContext.value?.date || route.query.slotOriginDate || undefined,
        slotOriginStoreId: slotScopedDashboardContext.value?.storeId || route.query.slotOriginStoreId || undefined,
        ds: dropdownValue('服务类型'),
        dp: dropdownValue('支付状态'),
        dm: storeNameForOrderScope.value || undefined,
        dr: dropdownValue('订单来源'),
        statusTab: statusTab.value === 'all' ? undefined : statusTab.value,
        astore: storeNameForOrderScope.value || undefined,
        storeId: resolveStoreBackendIdFromName(storeNameForOrderScope.value),
        asource: advanced.value.source !== '全部来源' ? advanced.value.source : undefined,
        apayment: advanced.value.payment !== '全部状态' ? advanced.value.payment : undefined,
        aservice: advanced.value.service !== '全部服务' ? advanced.value.service : undefined,
        amethod: advanced.value.method !== '全部方式' ? advanced.value.method : undefined,
        amin: advanced.value.amountMin !== '' ? advanced.value.amountMin : undefined,
        amax: advanced.value.amountMax !== '' ? advanced.value.amountMax : undefined,
        astatus: advanced.value.status.length > 0 ? advanced.value.status.join(',') : undefined,
      },
    })
  }

  return {
    readQueryString,
    isDateKey,
    applySearchQueryFromRoute,
    armSearchQueryInput,
    setSearchQuery,
    handleSearchInput,
    searchQueryState,
    effectiveSearchQuery,
    syncedSearchQuery,
    slotScopedRouteSearch,
    applyFiltersFromQuery,
    syncFiltersToUrl,
  }
}
