import { ref } from 'vue'
import { appStore, type BookingOrder } from '../../../shared/stores/appStore'
import type { OrderSlotRange, QuickOrderFilter } from '../orderOperations'
import type { AdvancedFilters, FilterDropdown } from './useOrderRouteScope'

export function useOrderPageState() {
  const searchQuery = ref('')
  const searchQueryArmed = ref(false)
  const searchQueryTouched = ref(false)
  const selectedTimeType = ref<'order' | 'arrival'>('arrival')
  const activeDropdown = ref<string | null>(null)
  const advancedOpen = ref(false)
  const activeQuickFilter = ref<QuickOrderFilter>('todayOps')
  const slotRange = ref<OrderSlotRange>({ start: '', end: '' })
  const slotScopedOrders = ref<BookingOrder[] | null>(null)
  const slotScopedDashboardContext = ref<{
    date: string
    storeId?: string
    slotStart: string
    slotEnd?: string
  } | null>(null)
  const statusTab = ref('all')
  const syncingFromQuery = ref(false)
  const sharedAdvanced = ref<AdvancedFilters>({
    store: '',
    source: '全部来源',
    payment: '全部状态',
    service: '全部服务',
    method: '全部方式',
    amountMin: '',
    amountMax: '',
    status: [],
  })
  const sharedDropdownFilters = ref<FilterDropdown[]>([
    { label: '服务类型', width: 109, options: [], value: '服务类型' },
    { label: '支付状态', width: 97.5, options: [], value: '支付状态' },
    { label: '门店选择', width: 86, options: [], value: '门店选择' },
    { label: '订单来源', width: 86, options: [], value: '订单来源' },
  ])
  const resolveStoreNameFromBackendId = (storeId: string) => {
    if (!storeId.trim()) return ''
    return appStore.stores.find(store => store.backendId === storeId)?.name ?? ''
  }
  const resolveStoreBackendIdFromName = (storeName: string) => {
    if (!storeName.trim() || storeName === '全部门店') return undefined
    return appStore.stores.find(store => store.name === storeName)?.backendId
  }

  return {
    searchQuery,
    searchQueryArmed,
    searchQueryTouched,
    selectedTimeType,
    activeDropdown,
    advancedOpen,
    activeQuickFilter,
    slotRange,
    slotScopedOrders,
    slotScopedDashboardContext,
    statusTab,
    syncingFromQuery,
    sharedAdvanced,
    sharedDropdownFilters,
    resolveStoreNameFromBackendId,
    resolveStoreBackendIdFromName,
  }
}
