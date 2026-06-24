import { computed, type Ref } from 'vue'
import { format, startOfMonth } from 'date-fns'
import { appDerived, appStore } from '../../../shared/stores/appStore'
import type { OrderAdvancedFilters, OrderDropdownFilter } from './useOrderFilters'

export function useOrderStoreScope(options: {
  advanced: Ref<OrderAdvancedFilters>
  dropdownFilters: Ref<OrderDropdownFilter[]>
  activeDropdown: Ref<string | null>
  orderRange: { start: string; end: string }
  arrivalRange: { start: string; end: string }
}) {
  const storeOptions = computed(() => appDerived.storeNames.value.filter(name => name !== '全部门店'))
  const defaultOrderStoreName = computed(() => storeOptions.value[0] ?? '')
  const lastDouyinLifeOrderSync = computed(() => appStore.lastDouyinLifeOrderSync)

  const resetDateRanges = () => {
    const now = new Date()
    const today = format(now, 'yyyy-MM-dd')
    options.orderRange.start = format(startOfMonth(now), 'yyyy-MM-dd')
    options.orderRange.end = today
    options.arrivalRange.start = today
    options.arrivalRange.end = today
  }

  const selectDropdown = (label: string, option: string) => {
    const filter = options.dropdownFilters.value.find(item => item.label === label)
    if (!filter) return
    const isAll = option.startsWith('全部')
    filter.value = isAll ? label : option
    if (label === '门店选择') options.advanced.value.store = isAll ? defaultOrderStoreName.value : option
    options.activeDropdown.value = null
  }

  const getDropdownCaption = (label: string) => {
    if (label === '门店选择') return '选择门店'
    if (label === '订单来源') return '下单来源'
    return label
  }

  const normalizeOrderStoreName = (storeName: string) =>
    storeOptions.value.includes(storeName) ? storeName : ''

  const storeNameForOrderScope = computed(() =>
    normalizeOrderStoreName(options.advanced.value.store)
    || normalizeOrderStoreName(options.dropdownFilters.value.find(filter => filter.label === '门店选择')?.value ?? '')
    || defaultOrderStoreName.value
  )

  const selectOrderStore = (storeName: string) => {
    const next = normalizeOrderStoreName(storeName)
    if (!next) return
    options.advanced.value.store = next
    const storeFilter = options.dropdownFilters.value.find(filter => filter.label === '门店选择')
    if (storeFilter) storeFilter.value = next
    options.activeDropdown.value = null
  }

  function ensureConcreteStoreScope() {
    const next = storeNameForOrderScope.value
    if (!next) return
    if (options.advanced.value.store !== next) options.advanced.value.store = next
    const storeFilter = options.dropdownFilters.value.find(filter => filter.label === '门店选择')
    if (storeFilter && storeFilter.value !== next) storeFilter.value = next
  }

  return {
    storeOptions,
    defaultOrderStoreName,
    lastDouyinLifeOrderSync,
    resetDateRanges,
    selectDropdown,
    getDropdownCaption,
    storeNameForOrderScope,
    selectOrderStore,
    ensureConcreteStoreScope,
  }
}
