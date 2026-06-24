import { computed, watch, type ComputedRef, type Ref } from 'vue'
import type { Router } from 'vue-router'
import type { ScheduleItemDto } from '../../shared/api/backendTypes'
import type { JianyueSlotCard } from '../../shared/components/schedule/jianyueSlotTypes'
import { appStore } from '../../shared/stores/appStore'
import type { StaffBookingInitial } from '../orders/StaffBookingModal.vue'
import { buildJianyueSlotGroups } from '../schedule/scheduleOperations'

type DashboardSlotQuery = Record<string, string | undefined>

type UseDashboardSlotDetailOptions = {
  router: Router
  selectedDateValue: ComputedRef<string>
  selectedDashboardStoreBackendId: ComputedRef<string>
  selectedDashboardStoreScopeId: ComputedRef<string>
  selectedDashboardStoreName: ComputedRef<string>
  dashboardScheduleItems: ComputedRef<ScheduleItemDto[]>
  dashboardDeepLinkSlot: Ref<{ start: string; end: string }>
  dashboardSelectedSlot: Ref<JianyueSlotCard | null>
  dashboardSlotSelectionError: Ref<string>
  dashboardStaffBookingOpen: Ref<boolean>
  dashboardStaffBookingInitial: Ref<StaffBookingInitial | null>
  buildDateOrderQuery: (date: string, extra?: Record<string, string | undefined>) => DashboardSlotQuery
  loadDashboardFor: (date: string) => Promise<void>
}

export const useDashboardSlotDetail = ({
  router,
  selectedDateValue,
  selectedDashboardStoreBackendId,
  selectedDashboardStoreScopeId,
  selectedDashboardStoreName,
  dashboardScheduleItems,
  dashboardDeepLinkSlot,
  dashboardSelectedSlot,
  dashboardSlotSelectionError,
  dashboardStaffBookingOpen,
  dashboardStaffBookingInitial,
  buildDateOrderQuery,
  loadDashboardFor,
}: UseDashboardSlotDetailOptions) => {
  const dashboardSlotGroups = computed(() => buildJianyueSlotGroups({
    date: selectedDateValue.value,
    scheduleItems: dashboardScheduleItems.value,
    inventory: appStore.bookingInventory,
    storeBackendId: selectedDashboardStoreBackendId.value,
  }))

  const restoreDashboardSlotFromQuery = () => {
    const { start, end } = dashboardDeepLinkSlot.value
    if (!start) return
    const candidateSlots = dashboardSlotGroups.value
      .flatMap(group => group.slots)
      .filter(item => item.time === start)
    const scoreDashboardDeepLinkSlot = (slot: JianyueSlotCard) =>
      (end && slot.endTime === end ? 100 : 0)
      + (slot.orderCount > 0 ? 10 : 0)
      + (selectedDashboardStoreScopeId.value && slot.storeBackendIds.includes(selectedDashboardStoreScopeId.value) ? 1 : 0)
    const slot = candidateSlots
      .sort((a, b) => scoreDashboardDeepLinkSlot(b) - scoreDashboardDeepLinkSlot(a))[0]
    if (!slot) return
    dashboardSlotSelectionError.value = ''
    dashboardSelectedSlot.value = slot
  }

  watch([
    dashboardSlotGroups,
    () => dashboardDeepLinkSlot.value.start,
    () => dashboardDeepLinkSlot.value.end,
    selectedDashboardStoreBackendId,
  ], () => {
    restoreDashboardSlotFromQuery()
  }, { immediate: true })

  const formatDashboardClock = (value: string) => {
    const match = value.match(/(?:T|\s)?(\d{1,2}):(\d{2})/)
    if (!match) return ''
    return `${match[1].padStart(2, '0')}:${match[2]}`
  }

  const dashboardSelectedSlotOrders = computed(() => {
    if (!dashboardSelectedSlot.value) return []
    const orderNos = new Set(dashboardSelectedSlot.value.orderNos.map(String))
    if (orderNos.size === 0) return []
    return dashboardScheduleItems.value.filter(item => {
      if (!item.startAt.startsWith(selectedDateValue.value)) return false
      const startsAtSlot = formatDashboardClock(item.startAt) === dashboardSelectedSlot.value?.time
      const orderMatch = orderNos.has(String(item.orderNo || item.orderId || item.bookingId))
      return startsAtSlot && orderMatch
    })
  })

  const dashboardSelectedSlotRemaining = computed(() => {
    if (!dashboardSelectedSlot.value || !dashboardSelectedSlot.value.hasInventory) return 0
    return Math.max(0, dashboardSelectedSlot.value.capacity - dashboardSelectedSlot.value.confirmedCount)
  })

  const dashboardSelectedSlotRemainingLabel = computed(() => {
    if (!dashboardSelectedSlot.value?.hasInventory) return '-'
    return String(dashboardSelectedSlotRemaining.value)
  })

  const dashboardSelectedSlotStatusLabel = computed(() => {
    if (!dashboardSelectedSlot.value) return ''
    if (dashboardSelectedSlot.value.conflictCount > 0) return '有冲突'
    if (dashboardSelectedSlot.value.isFull) return '已满'
    if (dashboardSelectedSlot.value.orderCount > 0) return '有预约'
    return '可新增'
  })

  const dashboardSelectedSlotStoreLabel = computed(() =>
    dashboardSelectedSlot.value?.storeNames[0] || selectedDashboardStoreName.value,
  )
  const dashboardSelectedSlotServiceLabel = computed(() =>
    dashboardSelectedSlot.value?.serviceGroupNames[0] || '未限定服务组',
  )
  const dashboardSelectedSlotServiceBreakdown = computed(() =>
    dashboardSelectedSlot.value?.serviceGroupBreakdown ?? [],
  )
  const dashboardSelectedSlotBlocked = computed(() =>
    Boolean(dashboardSelectedSlot.value && (dashboardSelectedSlotRemaining.value <= 0 || dashboardSelectedSlot.value.conflictCount > 0)),
  )
  const dashboardSelectedSlotBlockedReason = computed(() => {
    if (!dashboardSelectedSlot.value) return ''
    if (dashboardSelectedSlotRemaining.value <= 0 && dashboardSelectedSlot.value.conflictCount > 0) {
      return `该时段容量已满且有 ${dashboardSelectedSlot.value.conflictCount} 单冲突；请先扩容或处理冲突后再录入预约。`
    }
    if (dashboardSelectedSlot.value.conflictCount > 0) {
      return `该时段有 ${dashboardSelectedSlot.value.conflictCount} 单库存冲突；请先处理冲突后再录入预约。`
    }
    return `该时段容量已满（${dashboardSelectedSlot.value.capacityLabel}），请先调整容量后再录入预约。`
  })

  const buildDashboardSelectedSlotOrderQuery = (orderId = '') => ({
    ...buildDateOrderQuery(selectedDateValue.value, { quick: 'all' }),
    slotStart: dashboardSelectedSlot.value?.time,
    slotEnd: dashboardSelectedSlot.value?.endTime || undefined,
    slotOriginDate: selectedDateValue.value,
    slotOriginStoreId: selectedDashboardStoreBackendId.value || undefined,
    orderId: orderId || undefined,
  })

  const goDashboardSelectedSlotOrders = (orderId = '') => {
    if (!dashboardSelectedSlot.value) return
    router.push({
      path: '/order/appointment',
      query: buildDashboardSelectedSlotOrderQuery(orderId),
    })
  }

  const openDashboardSelectedSlotOrder = (item: ScheduleItemDto) => {
    goDashboardSelectedSlotOrders(String(item.orderNo || item.orderId || item.bookingId))
  }

  const goDashboardSelectedSlotInventory = () => {
    if (!dashboardSelectedSlot.value) return
    router.push({
      path: '/merchant/inventory',
      query: {
        date: selectedDateValue.value,
        storeId: dashboardSelectedSlot.value.storeBackendIds[0] || selectedDashboardStoreScopeId.value,
        serviceGroupId: dashboardSelectedSlot.value.serviceGroupBackendIds[0],
        slotStart: dashboardSelectedSlot.value.time,
        slotEnd: dashboardSelectedSlot.value.endTime || undefined,
        returnTo: 'staffBooking',
        conflictOnly: dashboardSelectedSlot.value.conflictCount > 0 ? '1' : undefined,
      },
    })
  }

  const openDashboardStaffBookingFromSelectedSlot = () => {
    if (!dashboardSelectedSlot.value || dashboardSlotSelectionError.value) return
    dashboardStaffBookingInitial.value = {
      storeName: dashboardSelectedSlot.value.storeNames[0],
      serviceGroupId: dashboardSelectedSlot.value.serviceGroupBackendIds[0],
      date: selectedDateValue.value,
      startTime: dashboardSelectedSlot.value.time,
      endTime: dashboardSelectedSlot.value.endTime || undefined,
    }
    dashboardStaffBookingOpen.value = true
  }

  const openDashboardSlot = (slot: JianyueSlotCard) => {
    dashboardSlotSelectionError.value = ''
    if (slot.orderCount > 0) {
      dashboardSelectedSlot.value = slot
      return
    }
    if (slot.storeBackendIds.length !== 1 || slot.serviceGroupBackendIds.length !== 1) {
      dashboardSelectedSlot.value = slot
      dashboardSlotSelectionError.value = '请先按门店筛选或进入排期页选择具体服务组'
      return
    }
    if (slot.orderNos.length === 0) {
      dashboardStaffBookingInitial.value = {
        storeName: slot.storeNames[0],
        serviceGroupId: slot.serviceGroupBackendIds[0],
        date: selectedDateValue.value,
        startTime: slot.time,
        endTime: slot.endTime || undefined,
      }
      dashboardStaffBookingOpen.value = true
      dashboardSelectedSlot.value = slot
      return
    }
  }

  const handleDashboardStaffBookingCreated = async () => {
    dashboardStaffBookingOpen.value = false
    await loadDashboardFor(selectedDateValue.value)
  }

  return {
    dashboardSlotGroups,
    restoreDashboardSlotFromQuery,
    formatDashboardClock,
    dashboardSelectedSlotOrders,
    dashboardSelectedSlotRemaining,
    dashboardSelectedSlotRemainingLabel,
    dashboardSelectedSlotStatusLabel,
    dashboardSelectedSlotStoreLabel,
    dashboardSelectedSlotServiceLabel,
    dashboardSelectedSlotServiceBreakdown,
    dashboardSelectedSlotBlocked,
    dashboardSelectedSlotBlockedReason,
    buildDashboardSelectedSlotOrderQuery,
    goDashboardSelectedSlotOrders,
    openDashboardSelectedSlotOrder,
    goDashboardSelectedSlotInventory,
    openDashboardStaffBookingFromSelectedSlot,
    openDashboardSlot,
    handleDashboardStaffBookingCreated,
  }
}
