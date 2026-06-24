import { ref, type ComputedRef, type Ref } from 'vue'
import type { BookingOrder } from '../../../shared/stores/appStore'
import type { OrderSlotRange, QuickOrderFilter } from '../orderOperations'
import type { StaffBookingInitial } from '../StaffBookingModal.vue'

export type UseOrderStaffBookingParams = {
  storeNameForOrderScope: ComputedRef<string>
  activeStartDate: Ref<string>
  todayKey: string
  slotRange: Ref<OrderSlotRange>
  activeQuickFilter: Ref<QuickOrderFilter>
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export function useOrderStaffBooking(params: UseOrderStaffBookingParams) {
  const {
    storeNameForOrderScope,
    activeStartDate,
    todayKey,
    slotRange,
    activeQuickFilter,
    notifyOrderAction,
  } = params

  const staffBookingOpen = ref(false)
  const staffBookingInitial = ref<StaffBookingInitial | null>(null)

  const buildStaffBookingInitialFromOrderScope = (): StaffBookingInitial | null => {
    const storeName = storeNameForOrderScope.value
    if (!storeName) return null
    const initial: StaffBookingInitial = { storeName }
    if (slotRange.value.start) {
      initial.date = activeStartDate.value || todayKey
      initial.startTime = slotRange.value.start
      initial.endTime = slotRange.value.end || undefined
    }
    return initial
  }

  const openStaffBookingModal = () => {
    staffBookingInitial.value = buildStaffBookingInitialFromOrderScope()
    staffBookingOpen.value = true
  }

  const handleStaffBookingCreated = (order: BookingOrder) => {
    staffBookingOpen.value = false
    activeQuickFilter.value = 'todayOps'
    notifyOrderAction('success', `已新增预约 ${order.id}`)
  }

  return {
    staffBookingOpen,
    staffBookingInitial,
    buildStaffBookingInitialFromOrderScope,
    openStaffBookingModal,
    handleStaffBookingCreated,
  }
}
