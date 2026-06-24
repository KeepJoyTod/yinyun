import type { ComputedRef } from 'vue'
import type { Router } from 'vue-router'
import type { ScheduleItemDto } from '../../../shared/api/backendTypes'
import type { JianyueSlotCard } from '../../../shared/components/schedule/jianyueSlotTypes'
import type { StoreInfo } from '../../../shared/stores/appStore'
import {
  buildScheduleCsv,
  buildScheduleEntryQuery,
  buildScheduleInventoryQuery,
  buildScheduleOrderQuery,
  resolveSelectedScheduleBooking,
  type ScheduleBookingSelection,
  type ScheduleOperationCard,
} from '../scheduleOperations'

export const useScheduleNavigation = (input: {
  router: Router
  date: ComputedRef<string> | { value: string }
  store: ComputedRef<string> | { value: string }
  selectedStore: ComputedRef<StoreInfo | undefined>
  selectedStoreBackendId: ComputedRef<string | undefined>
  scheduleItemsForStore: ComputedRef<ScheduleItemDto[]>
  filteredScheduleItems: ComputedRef<ScheduleItemDto[]>
  stores: () => StoreInfo[]
  orders: () => Array<{ id: string; backendId?: string }>
  ledgerOrders: () => Array<{ id: string; backendId?: string }>
  selectedSlot: { value: JianyueSlotCard | null }
}) => {
  const openScheduleCard = (item: ScheduleOperationCard) => {
    if (item.go.target === 'orders') {
      input.router.push({ path: '/order/appointment', query: item.go.query })
      return
    }
    if (item.go.target === 'inventory') {
      input.router.push({ path: '/merchant/inventory', query: item.go.query })
      return
    }
    if (item.go.target === 'booking-entry') {
      input.router.push({ path: '/tools/booking-entry', query: item.go.query })
      return
    }
    if (item.go.target === 'share-links') {
      input.router.push({ path: '/tools/share-links', query: item.go.query })
      return
    }
    input.router.push({ path: '/report/store-daily', query: item.go.query })
  }

  const goInventoryForSelectedDate = () => {
    input.router.push({
      path: '/merchant/inventory',
      query: buildScheduleInventoryQuery(input.date.value, input.selectedStoreBackendId.value),
    })
  }

  const goBookingEntryForSelectedStore = () => {
    input.router.push({
      path: '/tools/booking-entry',
      query: buildScheduleEntryQuery(input.selectedStoreBackendId.value),
    })
  }

  const exportScheduleCsv = () => {
    const rows = buildScheduleCsv(input.scheduleItemsForStore.value, input.stores())
    const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `schedule-${input.date.value}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const openBookingFromSlot = (booking: ScheduleBookingSelection) => {
    const bookingKey = booking.bookingId ?? booking.id
    if (bookingKey === undefined) return
    const matched = resolveSelectedScheduleBooking(
      input.filteredScheduleItems.value.map(item => ({
        bookingId: String(item.bookingId),
        orderNo: item.orderNo,
        customer: item.customerName,
        status: item.bookingStatus === '待确认' ? 'pending' : 'active',
      })),
      bookingKey,
    )
    if (!matched) return
    const allKnownOrders = [...input.orders(), ...input.ledgerOrders()]
    const order = allKnownOrders.find(item =>
      String(item.backendId) === String(matched.bookingId)
      || String(item.id) === String(matched.bookingId)
      || String(item.id) === String(matched.orderNo),
    )
    if (order) {
      input.router.push({
        path: '/order/appointment',
        query: buildScheduleOrderQuery(
          input.date.value,
          'all',
          input.store.value,
          String(matched.orderNo || order.id),
          input.selectedStore.value?.backendId,
        ),
      })
      return
    }
    input.router.push({
      path: '/order/appointment',
      query: buildScheduleOrderQuery(
        input.date.value,
        'all',
        input.store.value,
        String(matched.orderNo || matched.bookingId || matched.id || ''),
        input.selectedStore.value?.backendId,
      ),
    })
  }

  const buildSelectedSlotOrderQuery = (keyword = '', orderId = '') => ({
    ...buildScheduleOrderQuery(input.date.value, 'all', input.store.value, keyword, input.selectedStore.value?.backendId),
    slotStart: input.selectedSlot.value?.time,
    slotEnd: input.selectedSlot.value?.endTime || undefined,
    orderId: orderId || undefined,
  })

  const goSelectedSlotOrders = (keyword = input.selectedSlot.value?.orderNos[0] || '', orderId = '') => {
    if (!input.selectedSlot.value) return
    input.router.push({
      path: '/order/appointment',
      query: buildSelectedSlotOrderQuery(keyword, orderId),
    })
  }

  const openSelectedSlotOrder = (item: ScheduleItemDto) => {
    goSelectedSlotOrders(String(item.orderNo || item.orderId || item.bookingId), String(item.bookingId))
  }

  const goSelectedSlotInventory = () => {
    if (!input.selectedSlot.value) return
    input.router.push({
      path: '/merchant/inventory',
      query: {
        ...buildScheduleInventoryQuery(
          input.date.value,
          input.selectedSlot.value.storeBackendIds[0] || input.selectedStoreBackendId.value,
        ),
        serviceGroupId: input.selectedSlot.value.serviceGroupBackendIds[0],
        slotStart: input.selectedSlot.value.time,
        slotEnd: input.selectedSlot.value.endTime || undefined,
        returnTo: 'staffBooking',
        conflictOnly: input.selectedSlot.value.conflictCount > 0 ? '1' : undefined,
      },
    })
  }

  return {
    openScheduleCard,
    goInventoryForSelectedDate,
    goBookingEntryForSelectedStore,
    exportScheduleCsv,
    openBookingFromSlot,
    buildSelectedSlotOrderQuery,
    goSelectedSlotOrders,
    openSelectedSlotOrder,
    goSelectedSlotInventory,
  }
}
