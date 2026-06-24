import { computed, ref, type ComputedRef } from 'vue'
import type { ScheduleItemDto } from '../../../shared/api/backendTypes'
import type { JianyueSlotCard, JianyueSlotGroup } from '../../../shared/components/schedule/jianyueSlotTypes'

export const useScheduleSlotDetail = (input: {
  slotGroups: ComputedRef<JianyueSlotGroup[]>
  filteredScheduleItems: ComputedRef<ScheduleItemDto[]>
  selectedStoreBackendId: ComputedRef<string | undefined>
  selectedStoreName: ComputedRef<string | undefined>
  storeName: { value: string }
  slotDeepLink: { value: { start: string; end: string } }
  formatDateClock: (value: string) => string
}) => {
  const selectedSlot = ref<JianyueSlotCard | null>(null)

  const restoreSelectedSlotFromQuery = () => {
    const { start, end } = input.slotDeepLink.value
    if (!start) return
    const candidates = input.slotGroups.value
      .flatMap(group => group.slots)
      .filter(slot => slot.time === start)
    const scoreSlot = (slot: JianyueSlotCard) =>
      (end && slot.endTime === end ? 100 : 0)
      + (slot.orderCount > 0 ? 10 : 0)
      + (input.selectedStoreBackendId.value && slot.storeBackendIds.includes(input.selectedStoreBackendId.value) ? 1 : 0)
    const slot = candidates.sort((a, b) => scoreSlot(b) - scoreSlot(a))[0]
    if (slot) selectedSlot.value = slot
  }

  const selectedSlotOrders = computed(() => {
    if (!selectedSlot.value) return []
    const orderNos = new Set(selectedSlot.value.orderNos.map(String))
    if (orderNos.size === 0) return []
    return input.filteredScheduleItems.value.filter(item => {
      const startsAtSlot = input.formatDateClock(item.startAt) === selectedSlot.value?.time
      const orderMatch = orderNos.has(String(item.orderNo || item.orderId || item.bookingId))
      return startsAtSlot && orderMatch
    })
  })

  const selectedSlotRemaining = computed(() => {
    if (!selectedSlot.value || !selectedSlot.value.hasInventory) return 0
    return Math.max(0, selectedSlot.value.capacity - selectedSlot.value.confirmedCount)
  })

  const selectedSlotRemainingLabel = computed(() => {
    if (!selectedSlot.value?.hasInventory) return '-'
    return String(selectedSlotRemaining.value)
  })

  const selectedSlotStatusLabel = computed(() => {
    if (!selectedSlot.value) return ''
    if (selectedSlot.value.conflictCount > 0) return '有冲突'
    if (selectedSlot.value.isFull) return '已满'
    if (selectedSlot.value.orderCount > 0) return '有预约'
    return '可新增'
  })

  const selectedSlotStoreLabel = computed(() =>
    selectedSlot.value?.storeNames[0] || input.selectedStoreName.value || input.storeName.value,
  )
  const selectedSlotServiceLabel = computed(() => selectedSlot.value?.serviceGroupNames[0] || '未限定服务组')
  const selectedSlotServiceBreakdown = computed(() => selectedSlot.value?.serviceGroupBreakdown ?? [])
  const selectedSlotBlocked = computed(() =>
    Boolean(selectedSlot.value && (selectedSlotRemaining.value <= 0 || selectedSlot.value.conflictCount > 0)),
  )
  const selectedSlotBlockedReason = computed(() => {
    if (!selectedSlot.value) return ''
    if (selectedSlotRemaining.value <= 0 && selectedSlot.value.conflictCount > 0) {
      return `该时段容量已满且有 ${selectedSlot.value.conflictCount} 单冲突；请先扩容或处理冲突后再录入预约。`
    }
    if (selectedSlot.value.conflictCount > 0) {
      return `该时段有 ${selectedSlot.value.conflictCount} 单库存冲突；请先处理冲突后再录入预约。`
    }
    return `该时段容量已满（${selectedSlot.value.capacityLabel}），请先调整容量后再录入预约。`
  })

  const openJianyueSlot = (slot: JianyueSlotCard) => {
    selectedSlot.value = slot
  }

  return {
    selectedSlot,
    restoreSelectedSlotFromQuery,
    selectedSlotOrders,
    selectedSlotRemaining,
    selectedSlotRemainingLabel,
    selectedSlotStatusLabel,
    selectedSlotStoreLabel,
    selectedSlotServiceLabel,
    selectedSlotServiceBreakdown,
    selectedSlotBlocked,
    selectedSlotBlockedReason,
    openJianyueSlot,
  }
}
