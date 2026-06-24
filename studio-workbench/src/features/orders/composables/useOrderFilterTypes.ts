import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { BookingOrder, DouyinLifeOrderSyncInfo } from '../../../shared/stores/appStore'
import type { OrderSlotRange, QuickOrderFilter } from '../orderOperations'
import type { buildOrderStatusGroupCounts } from '../orderOperations'

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

export type UseOrderFiltersParams = {
  selectedTimeType: Ref<'order' | 'arrival'>
  activeQuickFilter: Ref<QuickOrderFilter>
  activeDropdown: Ref<string | null>
  slotRange: Ref<OrderSlotRange>
  slotScopedOrders: Ref<BookingOrder[] | null>
  statusTab: Ref<string>
  effectiveSearchQuery: ComputedRef<string>
  setSearchQuery: (value: string) => void
  externalOrderRange?: { start: string; end: string }
  externalArrivalRange?: { start: string; end: string }
  externalAdvanced?: Ref<AdvancedFilters>
  externalDropdownFilters?: Ref<FilterDropdown[]>
}

export type CalendarCell = { date: Date; inMonth: boolean }

export type UseOrderFiltersReturn = {
  todayKey: string
  today: Date
  orderRange: { start: string; end: string }
  arrivalRange: { start: string; end: string }
  activeStartDate: WritableComputedRef<string>
  activeEndDate: WritableComputedRef<string>
  calendarMonth: Ref<Date>
  calendarCells: ComputedRef<CalendarCell[]>
  calendarTitle: ComputedRef<string>
  getCalendarCellClass: (cell: CalendarCell) => string
  openCalendar: (target: 'startDate' | 'endDate') => void
  prevMonth: () => void
  nextMonth: () => void
  selectDate: (d: Date) => void
  storeOptions: ComputedRef<string[]>
  defaultOrderStoreName: ComputedRef<string>
  advancedStoreOptions: ComputedRef<string[]>
  serviceOptions: ComputedRef<string[]>
  paymentOptions: ComputedRef<string[]>
  sourceOptions: ComputedRef<string[]>
  methodOptions: ComputedRef<string[]>
  statusOptions: ComputedRef<string[]>
  orders: ComputedRef<BookingOrder[]>
  lastDouyinLifeOrderSync: ComputedRef<DouyinLifeOrderSyncInfo | null>
  orderScopeLabel: ComputedRef<string>
  dropdownFilters: Ref<FilterDropdown[]>
  selectDropdown: (label: string, option: string) => void
  getDropdownCaption: (label: string) => string
  selectMethodFilter: (option: string) => void
  advanced: Ref<AdvancedFilters>
  normalizeOrderStoreName: (name: string) => string
  storeNameForOrderScope: ComputedRef<string>
  selectOrderStore: (storeName: string) => void
  ensureConcreteStoreScope: () => void
  toggleAdvancedStatus: (opt: string) => void
  columns: string[]
  tableColumns: string[]
  statusStyles: Record<string, string>
  photoDeliveryStageStyles: Record<string, string>
  orderTimelineToneStyles: Record<string, string>
  paymentTone: (payment: string) => 'success' | 'warn' | 'danger' | 'neutral'
  quickOrderFilters: ComputedRef<Array<{ key: QuickOrderFilter; label: string; count: number }>>
  statusTabItems: ComputedRef<ReturnType<typeof buildOrderStatusGroupCounts>>
  matchesStatusTab: (order: BookingOrder) => boolean
  filteredOrders: ComputedRef<BookingOrder[]>
  emptyStateTitle: ComputedRef<string>
  emptyStateHint: ComputedRef<string>
  paginationStart: ComputedRef<number>
  totalAmount: ComputedRef<string>
  activeFilterTags: ComputedRef<Array<{ key: string; label: string; clear: () => void }>>
  hasSearchFilter: ComputedRef<boolean>
  hasDateRangeFilter: ComputedRef<boolean>
  hasActiveFilters: ComputedRef<boolean>
  hasOnlyQuickFilter: ComputedRef<boolean>
  anomalyFilters: Ref<Set<string>>
  anomalyFilterOptions: ComputedRef<Array<{ key: string; label: string; count: number }>>
  toggleAnomalyFilter: (key: string) => void
  resetAdvanced: () => void
  resetFilters: () => void
}
