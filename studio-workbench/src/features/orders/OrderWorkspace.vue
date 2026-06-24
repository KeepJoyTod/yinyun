<template>
  <OrderDayBoard
    :store-options="storeOptions"
    :store-name-for-order-scope="storeName"
    :source-options="sourceOptions"
    :selected-source="selectedSource"
    :day-command-cards="dayCards"
    :inventory-conflict-orders="conflictOrders"
    :missing-info-orders="missingOrders"
    @select-store="emit('selectStore', $event)"
    @select-source="emit('setFilter', '订单来源', $event)"
    @select-quick-filter="forwardOpenOrderFilter"
    @open-order="emit('openDetail', $event)"
  />

  <OrderOpsBoard
    :has-orders="orders.length > 0"
    :anomaly-filters="anomalyFilters"
    :quick-filters="quickFilters"
    :pipeline-cards="pipelineCards"
    :active-filter="activeFilter"
    :selected-anomalies="selectedAnomalies"
    @update:active-filter="forwardUpdateActiveFilter"
    @toggle-anomaly="emit('toggleAnomaly', $event)"
  />

  <OrderFilterBar
    :effective-search-query="searchQuery"
    :dropdown-filters="dropdownFilters"
    :active-dropdown="activeDropdown"
    :get-dropdown-caption="getDropdownCaption"
    :method-options="methodOptions"
    :advanced="{ method }"
    :selected-time-type="timeType"
    :active-start-date="startDate"
    :active-end-date="endDate"
    :calendar-title="calendarTitle"
    :calendar-cells="calendarCells"
    :active-filter-tags="filterTags"
    :has-active-filters="hasFilters"
    :get-calendar-cell-class="getCalendarCellClass"
    @arm-search-query-input="emit('armSearch')"
    @search-input="handleSearchInput"
    @set-active-dropdown="emit('setActiveDropdown', $event)"
    @select-dropdown="(label, option) => emit('selectDropdown', label, option)"
    @select-method-filter="emit('setFilter', '下单方式', $event)"
    @set-selected-time-type="emit('updateTimeType', $event)"
    @open-calendar="emit('openCalendar', $event)"
    @prev-month="emit('prevMonth')"
    @next-month="emit('nextMonth')"
    @select-date="emit('selectDate', $event)"
    @reset-filters="emit('reset')"
  />

  <OrderStatusTabs
    :status-tab="statusTab"
    :status-tab-items="mappedStatusTabs"
    @set-status-tab="emit('selectStatus', $event)"
  />

  <OrderTablePanel
    :filtered-orders="orders"
    :table-columns="tableColumns"
    :status-styles="statusStyles"
    :get-order-sync-label="getOrderSyncLabel"
    :get-next-order-action="getNextOrderAction"
    :get-next-order-hint="getNextHint"
    :updating-order-id="advancingId"
    :demo-mode="isDemo"
    :empty-state-title="emptyTitle"
    :empty-state-hint="emptyHint"
    :pagination-start="paginationStart"
    @open-order="emit('openDetail', $event)"
    @advance-order="emit('advance', $event)"
    @show-all-orders="emit('showAll')"
    @reset-filters="emit('reset')"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BookingOrder } from '../../shared/stores/appStore'
import OrderDayBoard from './OrderDayBoard.vue'
import OrderFilterBar from './OrderFilterBar.vue'
import OrderOpsBoard from './OrderOpsBoard.vue'
import OrderStatusTabs from './OrderStatusTabs.vue'
import OrderTablePanel from './OrderTablePanel.vue'
import type { ActiveFilterTag, OrderDropdownFilter } from './composables/useOrderFilters'
import type { QuickOrderFilter } from './orderOperations'

type CalendarCell = { date: Date; inMonth: boolean }
type StatusTab = { status: string; label: string; count: number }

const props = defineProps<{
  storeName: string
  storeOptions: string[]
  sourceOptions: string[]
  dropdownFilters: OrderDropdownFilter[]
  dayCards: Array<{ label: string; value: string; hint: string; scope: string; action: string; filter: QuickOrderFilter }>
  conflictOrders: BookingOrder[]
  missingOrders: BookingOrder[]
  orders: BookingOrder[]
  anomalyFilters: Array<{ key: string; label: string; count: number }>
  quickFilters: Array<{ key: string; label: string; count: number }>
  pipelineCards: Array<{ label: string; value: string; hint: string; scope: string; action: string; filter: QuickOrderFilter }>
  activeFilter: QuickOrderFilter
  selectedAnomalies: Set<string>
  searchQuery: string
  methodOptions: string[]
  method: string
  timeType: 'order' | 'arrival'
  startDate: string
  endDate: string
  activeDropdown: string | null
  calendarTitle: string
  calendarCells: CalendarCell[]
  filterTags: ActiveFilterTag[]
  hasFilters: boolean
  getDropdownCaption: (label: string) => string
  getCalendarCellClass: (cell: CalendarCell) => string
  statusTabs: StatusTab[]
  statusTab: string
  tableColumns: string[]
  statusStyles: Record<string, string>
  emptyTitle: string
  emptyHint: string
  paginationStart: number
  canAdvance: (order: BookingOrder) => boolean
  advancingId: string
  getNextLabel: (order: BookingOrder) => string
  getNextHint: (order: BookingOrder) => string
  isDemo: boolean
}>()

const emit = defineEmits<{
  (e: 'selectStore', store: string): void
  (e: 'setFilter', label: string, value: string): void
  (e: 'openOrderFilter', filter: QuickOrderFilter): void
  (e: 'updateActiveFilter', filter: QuickOrderFilter): void
  (e: 'toggleAnomaly', key: string): void
  (e: 'updateTimeType', value: 'order' | 'arrival'): void
  (e: 'setActiveDropdown', value: string | null): void
  (e: 'selectDropdown', label: string, option: string): void
  (e: 'selectDate', date: Date): void
  (e: 'reset'): void
  (e: 'prevMonth'): void
  (e: 'nextMonth'): void
  (e: 'openCalendar', target: 'startDate' | 'endDate'): void
  (e: 'armSearch'): void
  (e: 'handleSearch', value: string): void
  (e: 'selectStatus', status: string): void
  (e: 'openDetail', order: BookingOrder): void
  (e: 'advance', order: BookingOrder): void
  (e: 'print', order: BookingOrder): void
  (e: 'showAll'): void
}>()

const forwardOpenOrderFilter = (filter: string) => {
  emit('openOrderFilter', filter as QuickOrderFilter)
}

const forwardUpdateActiveFilter = (filter: string) => {
  emit('updateActiveFilter', filter as QuickOrderFilter)
}

const selectedSource = computed(() =>
  props.dropdownFilters.find(filter => filter.label === '订单来源')?.value ?? '订单来源',
)

const mappedStatusTabs = computed(() =>
  props.statusTabs.map(tab => ({
    key: tab.status as any,
    label: tab.label,
    count: tab.count,
  })),
)

const getOrderSyncLabel = () => (props.isDemo ? 'Local Demo' : 'Backend Sync')

const getNextOrderAction = (order: BookingOrder) =>
  props.canAdvance(order) ? { label: props.getNextLabel(order) } : null

const handleSearchInput = (event: Event) => {
  const value = event.target instanceof HTMLInputElement ? event.target.value : ''
  emit('handleSearch', value)
}
</script>
