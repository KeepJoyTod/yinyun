<template>
  <div class="flex flex-col min-h-full">
    <OrderConsoleHeader
      :filtered-count="filteredCount"
      :total-amount="totalAmount"
      :order-scope-label="orderScopeLabel"
      :demo-mode="demoMode"
      :syncing-douyin-orders="syncingDouyinOrders"
      :active-dropdown="activeDropdown"
      :can-export-orders="canExportOrders"
      :exporting-orders="exportingOrders"
      :order-export-title="orderExportTitle"
      :order-export-sync-notice="orderExportSyncNotice"
      :unsupported-order-export-filters="unsupportedOrderExportFilters"
      :last-douyin-life-order-sync="lastDouyinLifeOrderSync"
      @open-staff-booking="emit('openStaffBooking')"
      @open-schedule="emit('openSchedule')"
      @sync-douyin-life-orders="emit('syncDouyinLifeOrders')"
      @show-all-orders="emit('showAllOrders')"
      @export-orders="emit('exportOrders')"
      @open-advanced="emit('openAdvanced')"
    />

    <OrderActionNoticePanel :notice="notice" />

    <OrderWorkspace
      :store-name="storeName"
      :store-options="storeOptions"
      :source-options="sourceOptions"
      :dropdown-filters="dropdownFilters"
      :day-cards="dayCards"
      :conflict-orders="conflictOrders"
      :missing-orders="missingOrders"
      :orders="orders"
      :anomaly-filters="anomalyFilters"
      :quick-filters="quickFilters"
      :pipeline-cards="pipelineCards"
      :active-filter="activeFilter"
      :selected-anomalies="selectedAnomalies"
      :search-query="searchQuery"
      :method-options="methodOptions"
      :method="method"
      :time-type="timeType"
      :start-date="startDate"
      :end-date="endDate"
      :active-dropdown="activeDropdown"
      :calendar-title="calendarTitle"
      :calendar-cells="calendarCells"
      :filter-tags="filterTags"
      :has-filters="hasFilters"
      :get-dropdown-caption="getDropdownCaption"
      :get-calendar-cell-class="getCalendarCellClass"
      :status-tabs="statusTabs"
      :status-tab="statusTab"
      :table-columns="tableColumns"
      :status-styles="statusStyles"
      :empty-title="emptyTitle"
      :empty-hint="emptyHint"
      :pagination-start="paginationStart"
      :can-advance="canAdvance"
      :advancing-id="advancingId"
      :get-next-label="getNextLabel"
      :get-next-hint="getNextHint"
      :is-demo="demoMode"
      @select-store="emit('selectStore', $event)"
      @set-filter="(label, option) => emit('setFilter', label, option)"
      @open-order-filter="forwardOpenOrderFilter"
      @update-active-filter="forwardUpdateActiveFilter"
      @toggle-anomaly="emit('toggleAnomaly', $event)"
      @update-time-type="emit('updateTimeType', $event)"
      @set-active-dropdown="emit('setActiveDropdown', $event)"
      @select-dropdown="(label, option) => emit('selectDropdown', label, option)"
      @select-date="emit('selectDate', $event)"
      @reset="emit('reset')"
      @prev-month="emit('prevMonth')"
      @next-month="emit('nextMonth')"
      @open-calendar="emit('openCalendar', $event)"
      @arm-search="emit('armSearch')"
      @handle-search="emit('handleSearch', $event)"
      @select-status="emit('selectStatus', $event)"
      @open-detail="emit('openDetail', $event)"
      @advance="emit('advance', $event)"
      @print="emit('print', $event)"
      @show-all="emit('showAll')"
    />
  </div>
</template>

<script setup lang="ts">
import type { BookingOrder, DouyinLifeOrderSyncInfo } from '../../shared/stores/appStore'
import OrderActionNoticePanel from './OrderActionNoticePanel.vue'
import OrderConsoleHeader from './OrderConsoleHeader.vue'
import OrderWorkspace from './OrderWorkspace.vue'
import type { ActiveFilterTag, OrderDropdownFilter } from './composables/useOrderFilters'
import type { QuickOrderFilter } from './orderOperations'

type CalendarCell = { date: Date; inMonth: boolean }
type StatusTab = { status: string; label: string; count: number }
type OrderActionNotice = { type: 'success' | 'error'; message: string } | null

defineProps<{
  filteredCount: number
  totalAmount: string
  orderScopeLabel: string
  demoMode: boolean
  syncingDouyinOrders: boolean
  activeDropdown: string | null
  canExportOrders: boolean
  exportingOrders: boolean
  orderExportTitle: string
  orderExportSyncNotice: string
  unsupportedOrderExportFilters: string[]
  lastDouyinLifeOrderSync: DouyinLifeOrderSyncInfo | null
  notice: OrderActionNotice
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
}>()

const emit = defineEmits<{
  (e: 'openStaffBooking'): void
  (e: 'openSchedule'): void
  (e: 'syncDouyinLifeOrders'): void
  (e: 'showAllOrders'): void
  (e: 'exportOrders'): void
  (e: 'openAdvanced'): void
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

const forwardOpenOrderFilter = (filter: QuickOrderFilter) => {
  emit('openOrderFilter', filter)
}

const forwardUpdateActiveFilter = (filter: QuickOrderFilter) => {
  emit('updateActiveFilter', filter)
}
</script>
