import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { OrderListQuery } from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'
import { format } from 'date-fns'
import {
  quickOrderFilterKeys,
  resolveOrderSearchQueryState,
  normalizeOrderStatusTab,
  shouldAcceptOrderSearchInput,
} from '../orderOperations'
import type { QuickOrderFilter } from '../orderOperations'

export function useOrderRouteSync(
  state: {
    searchQuery: { value: string }
    searchQueryArmed: { value: boolean }
    searchQueryTouched: { value: boolean }
    activeQuickFilter: { value: QuickOrderFilter }
    selectedTimeType: { value: 'order' | 'arrival' }
    activeStartDate: { value: string }
    activeEndDate: { value: string }
    slotRange: { value: { start: string; end: string } }
    slotScopedDashboardContext: { value: { date?: string; storeId?: string; slotStart?: string; slotEnd?: string } | null }
    statusTab: { value: string }
    storeNameForOrderScope: { value: string }
    advanced: { value: { store: string; source: string; payment: string; service: string; method: string; amountMin: string; amountMax: string; status: string[] } }
    dropdownFilters: { value: Array<{ label: string; value: string }> }
    syncingFromQuery: { value: boolean }
  },
) {
  const route = useRoute()
  const router = useRouter()

  const readQueryString = (value: unknown) =>
    Array.isArray(value) ? String(value[0] ?? '') : String(value ?? '')

  const isDateKey = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)

  const resolveStoreNameFromBackendId = (storeId: string) => {
    if (!storeId.trim()) return ''
    return appStore.stores.find(store => store.backendId === storeId)?.name ?? ''
  }

  const resolveStoreBackendIdFromName = (storeName: string) => {
    if (!storeName.trim() || storeName === '全部门店') return undefined
    return appStore.stores.find(store => store.name === storeName)?.backendId
  }

  const applySearchQueryFromRoute = (value: string) => {
    state.searchQueryArmed.value = false
    state.searchQueryTouched.value = false
    state.searchQuery.value = value
  }

  const armSearchQueryInput = () => {
    state.searchQueryArmed.value = true
  }

  const setSearchQuery = (value: string) => {
    state.searchQueryArmed.value = true
    state.searchQueryTouched.value = true
    state.searchQuery.value = value
  }

  const handleSearchInput = (value: string) => {
    if (!shouldAcceptOrderSearchInput({
      routeQueryValue: route.query.q || route.query.keyword,
      userArmed: state.searchQueryArmed.value,
    })) {
      applySearchQueryFromRoute('')
      return
    }
    setSearchQuery(value)
  }

  const searchQueryState = computed(() => resolveOrderSearchQueryState({
    inputValue: state.searchQuery.value,
    routeQueryValue: route.query.q || route.query.keyword,
    slotScoped: Boolean(readQueryString(route.query.slotStart) || readQueryString(route.query.slotEnd)),
    userEdited: state.searchQueryTouched.value,
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

  const readSlotScopedDateFromRoute = () => {
    const routeDate = readQueryString(route.query.date).trim()
    if (isDateKey(routeDate)) return routeDate
    return readSlotOriginDateFromRoute()
  }

  const readSlotOriginStoreIdFromRoute = () =>
    readQueryString(route.query.slotOriginStoreId).trim() || undefined

  const syncSlotScopedDashboardContextFromRoute = () => {
    const slotStart = readQueryString(route.query.slotStart).trim()
    const slotEnd = readQueryString(route.query.slotEnd).trim()
    if (!slotStart) {
      state.slotScopedDashboardContext.value = null
      return
    }
    const start = readQueryString(route.query.start).trim()
    const end = readQueryString(route.query.end).trim()
    const slotScopedDate = readSlotScopedDateFromRoute()
    const nextContext = {
      date: slotScopedDate || (isDateKey(start) ? start : isDateKey(end) ? end : format(new Date(), 'yyyy-MM-dd')),
      storeId: readSlotOriginStoreIdFromRoute() || readQueryString(route.query.storeId).trim() || undefined,
      slotStart,
      slotEnd: slotEnd || undefined,
    }
    const current = state.slotScopedDashboardContext.value
    if (!current) { state.slotScopedDashboardContext.value = nextContext; return }
    if (current.slotStart !== nextContext.slotStart || current.slotEnd !== nextContext.slotEnd) {
      state.slotScopedDashboardContext.value = nextContext; return
    }
    if (slotScopedDate && current.date !== nextContext.date) {
      state.slotScopedDashboardContext.value = nextContext; return
    }
    if (readSlotOriginStoreIdFromRoute() && current.storeId !== nextContext.storeId) {
      state.slotScopedDashboardContext.value = nextContext
    }
  }

  const applyFiltersFromQuery = () => {
    state.syncingFromQuery.value = true
    applySearchQueryFromRoute(readQueryString(route.query.q || route.query.keyword))
    const quick = readQueryString(route.query.quick) as QuickOrderFilter
    if ((quickOrderFilterKeys as readonly string[]).includes(quick)) state.activeQuickFilter.value = quick
    const timeType = readQueryString(route.query.time)
    if (timeType === 'order' || timeType === 'arrival') state.selectedTimeType.value = timeType
    const start = readQueryString(route.query.start)
    const end = readQueryString(route.query.end)
    const hasExplicitStart = isDateKey(start)
    const hasExplicitEnd = isDateKey(end)
    if (isDateKey(start)) state.activeStartDate.value = start
    if (isDateKey(end)) state.activeEndDate.value = end
    const slotStart = readQueryString(route.query.slotStart)
    const slotEnd = readQueryString(route.query.slotEnd)
    const slotScopedDate = readSlotScopedDateFromRoute()
    const hasSlotScopedRange = Boolean(slotStart || slotEnd)
    if (!hasExplicitStart && hasSlotScopedRange && slotScopedDate) state.activeStartDate.value = slotScopedDate
    if (!hasExplicitEnd && hasSlotScopedRange && slotScopedDate) state.activeEndDate.value = slotScopedDate
    state.slotRange.value = { start: slotStart, end: slotEnd }
    syncSlotScopedDashboardContextFromRoute()
    if ((quick === 'all' || quick === 'douyin30')
      && !hasExplicitStart
      && !hasExplicitEnd
      && !(hasSlotScopedRange && slotScopedDate)) {
      state.activeStartDate.value = ''
      state.activeEndDate.value = ''
    }

    const applyDropdown = (queryKey: string, filterLabel: string) => {
      const raw = readQueryString(route.query[queryKey])
      if (!raw) return
      const f = state.dropdownFilters.value.find(d => d.label === filterLabel)
      if (f) f.value = raw
    }
    applyDropdown('ds', '服务类型')
    applyDropdown('dp', '支付状态')
    applyDropdown('dm', '门店选择')
    applyDropdown('dr', '订单来源')

    const readAdvancedScalar = (key: string): string => readQueryString(route.query[key])
    const stTab = readQueryString(route.query.statusTab)
    if (stTab) state.statusTab.value = normalizeOrderStatusTab(stTab)
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
    if (resolvedStore || store) state.advanced.value.store = resolvedStore || store
    if (source) state.advanced.value.source = source
    if (payment) state.advanced.value.payment = payment
    if (service) state.advanced.value.service = service
    if (method) state.advanced.value.method = method
    if (amountMin !== '') state.advanced.value.amountMin = amountMin
    if (amountMax !== '') state.advanced.value.amountMax = amountMax
    if (statusRaw) {
      const parsed = statusRaw.split(',').filter(Boolean)
      if (parsed.length) state.advanced.value.status = parsed
    }

    window.queueMicrotask(() => {
      state.syncingFromQuery.value = false
      if (slotScopedRouteSearch.value) syncFiltersToUrl()
    })
  }

  const syncFiltersToUrl = () => {
    if (state.syncingFromQuery.value) return
    const dropdownValue = (label: string) => {
      const f = state.dropdownFilters.value.find(d => d.label === label)
      if (!f || f.value === label || f.value.startsWith('全部')) return undefined
      return f.value
    }
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        q: syncedSearchQuery.value,
        orderId: route.query.orderId || undefined,
        quick: state.activeQuickFilter.value,
        time: state.selectedTimeType.value,
        start: state.activeStartDate.value || undefined,
        end: state.activeEndDate.value || undefined,
        slotStart: state.slotRange.value.start || undefined,
        slotEnd: state.slotRange.value.end || undefined,
        slotOriginDate: state.slotScopedDashboardContext.value?.date || route.query.slotOriginDate || undefined,
        slotOriginStoreId: state.slotScopedDashboardContext.value?.storeId || route.query.slotOriginStoreId || undefined,
        ds: dropdownValue('服务类型'),
        dp: dropdownValue('支付状态'),
        dm: state.storeNameForOrderScope.value || undefined,
        dr: dropdownValue('订单来源'),
        statusTab: state.statusTab.value === 'all' ? undefined : state.statusTab.value,
        astore: state.storeNameForOrderScope.value || undefined,
        storeId: resolveStoreBackendIdFromName(state.storeNameForOrderScope.value),
        asource: state.advanced.value.source !== '全部来源' ? state.advanced.value.source : undefined,
        apayment: state.advanced.value.payment !== '全部状态' ? state.advanced.value.payment : undefined,
        aservice: state.advanced.value.service !== '全部服务' ? state.advanced.value.service : undefined,
        amethod: state.advanced.value.method !== '全部方式' ? state.advanced.value.method : undefined,
        amin: state.advanced.value.amountMin !== '' ? state.advanced.value.amountMin : undefined,
        amax: state.advanced.value.amountMax !== '' ? state.advanced.value.amountMax : undefined,
        astatus: state.advanced.value.status.length > 0 ? state.advanced.value.status.join(',') : undefined,
      },
    })
  }

  const buildSlotScopedOrderQuery = (): (OrderListQuery & { slotStart?: string; slotEnd?: string }) | null => {
    if (!state.slotRange.value.start) return null
    const queryDate = state.slotScopedDashboardContext.value?.date || state.activeStartDate.value || state.activeEndDate.value
    if (!isDateKey(queryDate)) return null
    return {
      pageNum: 1,
      pageSize: 5000,
      keyword: effectiveSearchQuery.value || undefined,
      storeId: readQueryString(route.query.storeId) || resolveStoreBackendIdFromName(state.storeNameForOrderScope.value) || undefined,
      beginArrivalTime: `${queryDate} 00:00:00`,
      endArrivalTime: `${queryDate} 23:59:59`,
      slotDate: queryDate,
      slotStart: state.slotRange.value.start || undefined,
      slotEnd: state.slotRange.value.end || undefined,
    }
  }

  return {
    readQueryString, isDateKey, applySearchQueryFromRoute,
    armSearchQueryInput, setSearchQuery, handleSearchInput,
    searchQueryState, effectiveSearchQuery, syncedSearchQuery,
    slotScopedRouteSearch, syncSlotScopedDashboardContextFromRoute,
    applyFiltersFromQuery, syncFiltersToUrl, buildSlotScopedOrderQuery,
    resolveStoreNameFromBackendId, resolveStoreBackendIdFromName,
  }
}
