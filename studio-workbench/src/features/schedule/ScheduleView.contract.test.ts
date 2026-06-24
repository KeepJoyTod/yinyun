import { describe, expect, it } from 'vitest'
import scheduleGridTableSource from './ScheduleGridTable.vue?raw'
import scheduleGridFallbackSource from './scheduleGridFallback.ts?raw'
import scheduleSource from './ScheduleView.vue?raw'
import scheduleToolbarSource from './ScheduleToolbar.vue?raw'
import slotDetailPanelSource from '../../shared/components/schedule/SlotDetailPanel.vue?raw'

const scheduleFullSource = [
  scheduleSource,
  scheduleGridTableSource,
  scheduleToolbarSource,
].join('\n')

describe('schedule page contract', () => {
  it('shows a 14-day schedule grid with time group rows', () => {
    expect(scheduleFullSource).toContain('14天档期网格')
    expect(scheduleFullSource).toContain('timeGroups')
    expect(scheduleFullSource).toContain('上午')
    expect(scheduleFullSource).toContain('下午')
    expect(scheduleFullSource).toContain('晚上')
    expect(scheduleFullSource).toContain('ScheduleGridCell')
  })

  it('loads schedule grid data from the backend API', () => {
    expect(scheduleSource).toContain('dashboardScheduleGrid')
    expect(scheduleSource).toContain('listBookingInventory')
    expect(scheduleSource).toContain('buildScheduleGridFallback')
    expect(scheduleSource).toContain('backendApi')
    expect(scheduleSource).toContain('gridData')
    expect(scheduleSource).toContain('loadGrid')
    expect(scheduleGridFallbackSource).toContain('createScheduleGridDates')
  })

  it('supports store filtering for the grid', () => {
    expect(scheduleSource).toContain('storeOptions')
    expect(scheduleSource).toContain('buildConcreteStoreOptions')
    expect(scheduleSource).not.toContain("{ label: '全部门店' }")
    expect(scheduleSource).toContain('selectStore')
    expect(scheduleSource).toContain('store.value.backendId')
  })

  it('offers export and new booking actions', () => {
    expect(scheduleSource).toContain('@export="exportScheduleCsv"')
    expect(scheduleSource).toContain('@create-booking="openStaffBookingModal"')
    expect(scheduleFullSource).toContain('新增预约')
    expect(scheduleFullSource).toContain('导出排期')
    expect(scheduleSource).toContain('@go-booking-entry="goBookingEntryForSelectedStore"')
    expect(scheduleSource).toContain('@go-inventory="goInventoryForSelectedDate"')
    expect(scheduleToolbarSource).toContain('@click="$emit(\'export\')"')
    expect(scheduleToolbarSource).toContain('@click="$emit(\'create-booking\')"')
  })

  it('opens slot detail panel when a grid cell is selected', () => {
    expect(scheduleSource).toContain('SlotDetailPanel')
    expect(scheduleSource).toContain(':slot="selectedSlotJianyue"')
    expect(scheduleSource).toContain(':orders="selectedSlotOrders"')
    expect(scheduleSource).toContain('selectedSlot')
    expect(scheduleSource).toContain('openSlotDetail')
    expect(scheduleSource).toContain('aria-label="时段详情"')
  })

  it('provides staff booking modal with prefilled slot context', () => {
    expect(scheduleSource).toContain('StaffBookingModal')
    expect(scheduleSource).toContain('staffBookingOpen')
    expect(scheduleSource).toContain('openStaffBookingFromSelectedSlot')
    expect(scheduleSource).toContain('openStaffBookingForSlot')
  })

  it('shows slot status labels and blocked reasons', () => {
    expect(scheduleSource).toContain('selectedSlotStatusLabel')
    expect(scheduleSource).toContain('selectedSlotBlocked')
    expect(scheduleSource).toContain('selectedSlotBlockedReason')
    expect(scheduleSource).toContain('SLOT_CONFLICT')
    expect(scheduleSource).toContain('SLOT_FULL')
  })

  it('navigates to orders and inventory from slot detail', () => {
    expect(scheduleSource).toContain('goSelectedSlotOrders')
    expect(scheduleSource).toContain('goSelectedSlotInventory')
    expect(scheduleSource).toContain("path: '/order/appointment'")
    expect(scheduleSource).toContain("path: '/merchant/inventory'")
    expect(scheduleSource).toContain('slotOriginDate')
    expect(scheduleSource).toContain('slotOriginStoreId')
    expect(scheduleSource).toContain('slotEnd: selectedSlot.value.endTime')
    expect(scheduleSource).toContain('@open-order="goSelectedSlotOrderDetail"')
    expect(scheduleSource).toContain('goSelectedSlotOrderDetail')
    expect(scheduleSource).toContain('orderId: item.orderId')
  })

  it('applies route query params for store and date', () => {
    expect(scheduleSource).toContain('useRoute')
    expect(scheduleSource).toContain('applyRouteFilters')
    expect(scheduleSource).toContain('route.query.storeId')
    expect(scheduleSource).toContain('route.query.date')
    expect(scheduleSource).toContain('openRouteSlotIfPossible')
  })

  it('exports CSV with grid slot data', () => {
    expect(scheduleSource).toContain('exportScheduleCsv')
    expect(scheduleSource).toContain('bizDate')
    expect(scheduleSource).toContain('startTime')
    expect(scheduleSource).toContain('capacity')
    expect(scheduleSource).toContain('paidCount')
  })

  it('SlotDetailPanel still supports order list and service breakdown', () => {
    expect(slotDetailPanelSource).toContain('查看该时段订单')
    expect(slotDetailPanelSource).toContain('调整容量')
    expect(slotDetailPanelSource).toContain('服务组拆分')
  })
})
