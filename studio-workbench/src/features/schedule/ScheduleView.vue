<template>
  <div class="flex flex-col gap-7 min-h-full">
    <section class="bg-surface-1 border border-hairline rounded-md overflow-hidden">
      <ScheduleToolbar
        :store-label="storeLabel"
        :active-dropdown="activeDropdown"
        :store-options="storeOptions"
        @export="exportScheduleCsv"
        @create-booking="openStaffBookingModal"
        @go-booking-entry="goBookingEntryForSelectedStore"
        @go-inventory="goInventoryForSelectedDate"
        @toggle-store-dropdown="toggleStoreDropdown"
        @select-store="selectStore"
        @reset-filters="resetFilters"
      />

      <ScheduleGridTable
        :loading="loading"
        :load-error="loadError"
        :grid-dates="gridDates"
        :today-key="todayKey"
        :time-groups="timeGroups"
        :weekday-label="weekdayLabel"
        :date-label="dateLabel"
        :slots-for-date-and-group="slotsForDateAndGroup"
        @open-slot-detail="openSlotDetail"
        @open-staff-booking-for-slot="openStaffBookingForSlot"
      />

      <SlotDetailPanel
        v-if="selectedSlot"
        :slot="selectedSlotJianyue"
        :status-label="selectedSlotStatusLabel"
        :store-label="selectedSlotStoreLabel"
        :service-label="selectedSlotServiceLabel"
        :remaining-count="selectedSlotRemaining"
        :remaining-label="String(selectedSlotRemaining)"
        :blocked="selectedSlotBlocked"
        :blocked-reason="selectedSlotBlocked ? selectedSlotBlockedReason : ''"
        :service-breakdown="[]"
        :orders="selectedSlotOrders"
        :format-clock="formatTime"
        aria-label="时段详情"
        @close="selectedSlot = null"
        @primary-action="selectedSlotBlocked ? goSelectedSlotInventory() : openStaffBookingFromSelectedSlot()"
        @open-orders="goSelectedSlotOrders()"
        @open-inventory="goSelectedSlotInventory"
        @open-order="goSelectedSlotOrderDetail"
      />
    </section>

    <StaffBookingModal
      :open="staffBookingOpen"
      :initial="staffBookingInitial"
      @close="staffBookingOpen = false"
      @created="handleStaffBookingCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { backendApi } from '../../shared/api/backend'
import type { DashboardScheduleGridDto, ScheduleGridSlotDto } from '../../shared/api/backendTypes'
import { appStore } from '../../shared/stores/appStore'
import SlotDetailPanel from '../../shared/components/schedule/SlotDetailPanel.vue'
import StaffBookingModal, { type StaffBookingInitial } from '../orders/StaffBookingModal.vue'
import ScheduleGridTable from './ScheduleGridTable.vue'
import ScheduleToolbar, { type ScheduleStoreOption } from './ScheduleToolbar.vue'
import { buildScheduleGridFallback, createScheduleGridDates } from './scheduleGridFallback'

const router = useRouter()
const route = useRoute()

const pad2 = (n: number) => String(n).padStart(2, '0')
const today = new Date()
const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`

const store = ref<ScheduleStoreOption>({ label: '' })
const activeDropdown = ref<'store' | null>(null)
const gridData = ref<DashboardScheduleGridDto | null>(null)
const loading = ref(false)
const loadError = ref('')
const selectedSlot = ref<ScheduleGridSlotDto | null>(null)
const staffBookingOpen = ref(false)
const staffBookingInitial = ref<StaffBookingInitial | null>(null)

const buildConcreteStoreOptions = (): ScheduleStoreOption[] =>
  appStore.stores
    .filter(s => s.backendId)
    .map(s => ({ label: s.name, backendId: String(s.backendId) }))

const storeOptions = computed(() => buildConcreteStoreOptions())

const storeLabel = computed(() => store.value.label)
const routeDate = computed(() => typeof route.query.date === 'string' && route.query.date ? route.query.date : todayKey)
const routeStoreId = computed(() => typeof route.query.storeId === 'string' ? route.query.storeId : '')
const routeSlotStart = computed(() => typeof route.query.slotStart === 'string' ? route.query.slotStart : '')
const routeSlotEnd = computed(() => typeof route.query.slotEnd === 'string' ? route.query.slotEnd : '')

const gridDates = computed(() => gridData.value?.dates ?? [])

const timeGroups = [
  { key: 'morning', label: '09:00–12:00', start: '09', end: '12' },
  { key: 'afternoon', label: '12:00–18:00', start: '12', end: '18' },
  { key: 'evening', label: '18:00–21:00', start: '18', end: '21' },
] as const

const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const weekdayLabel = (d: string) => {
  const parsed = new Date(`${d}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? '' : weekdayLabels[parsed.getDay()]
}

const dateLabel = (d: string) => {
  const parts = d.split('-')
  return parts.length === 3 ? `${Number(parts[1])}月${Number(parts[2])}日` : d
}

const slotsForDateAndGroup = (date: string, groupKey: string) => {
  const all = gridData.value?.slotsByDate?.[date] ?? []
  const group = timeGroups.find(g => g.key === groupKey)
  if (!group) return all
  return all.filter(slot => {
    const hour = slot.startTime.split(':')[0]
    return hour >= group.start && hour < group.end
  })
}

const selectedSlotOrders = computed(() => {
  if (!selectedSlot.value) return []
  return (selectedSlot.value.orders ?? []).map(o => ({
    bookingId: o.orderId,
    orderId: o.orderId,
    storeId: selectedSlot.value!.storeId,
    studioId: '',
    studioName: '',
    startAt: `${selectedSlot.value!.bizDate}T${selectedSlot.value!.startTime}:00`,
    endAt: `${selectedSlot.value!.bizDate}T${selectedSlot.value!.endTime}:00`,
    bookingStatus: o.status === 'PENDING' ? '待确认' : o.status === 'COMPLETED' ? '已完成' : o.status,
    orderNo: o.orderNo,
    customerName: o.customerName,
    customerPhone: '',
    serviceName: '',
    orderStatus: o.status,
  })) as import('../../shared/api/backendTypes').ScheduleItemDto[]
})

const selectedSlotRemaining = computed(() => selectedSlot.value?.remainCount ?? 0)
const selectedSlotStatusLabel = computed(() => {
  if (!selectedSlot.value) return ''
  if (selectedSlot.value.slotStatus === 'SLOT_CONFLICT') return '有冲突'
  if (selectedSlot.value.slotStatus === 'SLOT_FULL') return '已满'
  if (selectedSlot.value.slotStatus === 'SLOT_PARTIAL') return '有预约'
  return '可新增'
})
const selectedSlotStoreLabel = computed(() => {
  if (!selectedSlot.value) return store.value.label
  const s = appStore.stores.find(st => String(st.backendId) === String(selectedSlot.value!.storeId))
  return s?.name ?? store.value.label
})
const selectedSlotServiceLabel = computed(() => '未限定服务组')
const selectedSlotBlocked = computed(() =>
  Boolean(selectedSlot.value && (selectedSlotRemaining.value <= 0 || selectedSlot.value.slotStatus === 'SLOT_CONFLICT')),
)
const selectedSlotBlockedReason = computed(() => {
  if (!selectedSlot.value) return ''
  if (selectedSlotRemaining.value <= 0 && selectedSlot.value.slotStatus === 'SLOT_CONFLICT') {
    return `该时段容量已满且有 ${selectedSlot.value.conflictCount} 单冲突；请先扩容或处理冲突。`
  }
  if (selectedSlot.value.slotStatus === 'SLOT_CONFLICT') {
    return `该时段有 ${selectedSlot.value.conflictCount} 单库存冲突；请先处理冲突。`
  }
  return `该时段容量已满（${selectedSlot.value.capacity}），请先调整容量。`
})

const selectedSlotJianyue = computed(() => {
  if (!selectedSlot.value) return null as any
  const s = selectedSlot.value
  return {
    id: String(s.id),
    time: s.startTime,
    endTime: s.endTime,
    orderCount: s.paidCount,
    capacity: s.capacity,
    capacityLabel: `${s.paidCount}/${s.capacity}`,
    confirmedCount: s.paidCount,
    remainingCount: s.remainCount,
    hasInventory: true,
    isFull: s.slotStatus === 'SLOT_FULL',
    conflictCount: s.conflictCount,
    storeNames: [selectedSlotStoreLabel.value],
    storeBackendIds: [String(s.storeId)],
    serviceGroupNames: [],
    serviceGroupBackendIds: [],
    serviceGroupBreakdown: [],
    orderNos: s.orders.map(o => String(o.orderNo)),
  }
})

const formatTime = (iso: string) => {
  const parts = iso.split('T')
  if (parts.length < 2) return iso
  return parts[1].substring(0, 5)
}

const openSlotDetail = (slot: ScheduleGridSlotDto) => {
  selectedSlot.value = slot
}

const openRouteSlotIfPossible = () => {
  const slotStart = routeSlotStart.value
  if (!slotStart || !gridData.value) return
  const slotDate = routeDate.value
  const slotEnd = routeSlotEnd.value
  const matched = (gridData.value.slotsByDate?.[slotDate] ?? []).find(slot =>
    slot.startTime === slotStart
    && (!slotEnd || slot.endTime === slotEnd)
    && (!routeStoreId.value || String(slot.storeId) === routeStoreId.value),
  )
  selectedSlot.value = matched ?? null
}

const openStaffBookingForSlot = (date: string, groupKey: string) => {
  const group = timeGroups.find(g => g.key === groupKey)
  staffBookingInitial.value = {
    storeName: store.value.label || undefined,
    date,
    startTime: group ? `${group.start}:00` : undefined,
    endTime: group ? `${group.end}:00` : undefined,
  }
  staffBookingOpen.value = true
}

const openStaffBookingModal = () => {
  staffBookingInitial.value = {
    storeName: store.value.label || undefined,
    date: routeDate.value,
  }
  staffBookingOpen.value = true
}

const openStaffBookingFromSelectedSlot = () => {
  if (!selectedSlot.value) return
  staffBookingInitial.value = {
    storeName: selectedSlotStoreLabel.value,
    date: selectedSlot.value.bizDate,
    startTime: selectedSlot.value.startTime,
    endTime: selectedSlot.value.endTime,
  }
  staffBookingOpen.value = true
}

const handleStaffBookingCreated = async () => {
  staffBookingOpen.value = false
  selectedSlot.value = null
  await loadGrid()
}

const goInventoryForSelectedDate = () => {
  const storeBackendId = store.value.backendId ? String(store.value.backendId) : undefined
  router.push({ path: '/merchant/inventory', query: { date: todayKey, storeId: storeBackendId } })
}

const goBookingEntryForSelectedStore = () => {
  const storeBackendId = store.value.backendId ? String(store.value.backendId) : undefined
  router.push({ path: '/tools/booking-entry', query: { storeId: storeBackendId } })
}

const goSelectedSlotOrders = () => {
  if (!selectedSlot.value) return
  router.push({
    path: '/order/appointment',
    query: {
      quick: 'all',
      date: selectedSlot.value.bizDate,
      storeId: String(selectedSlot.value.storeId),
      slotOriginDate: selectedSlot.value.bizDate,
      slotOriginStoreId: String(selectedSlot.value.storeId),
      slotStart: selectedSlot.value.startTime,
      slotEnd: selectedSlot.value.endTime,
    },
  })
}

const goSelectedSlotOrderDetail = (item: { orderId?: string | number }) => {
  if (!selectedSlot.value || !item.orderId) return
  router.push({
    path: '/order/appointment',
    query: {
      quick: 'all',
      date: selectedSlot.value.bizDate,
      storeId: String(selectedSlot.value.storeId),
      orderId: item.orderId,
      slotOriginDate: selectedSlot.value.bizDate,
      slotOriginStoreId: String(selectedSlot.value.storeId),
      slotStart: selectedSlot.value.startTime,
      slotEnd: selectedSlot.value.endTime,
    },
  })
}

const goSelectedSlotInventory = () => {
  if (!selectedSlot.value) return
  router.push({
    path: '/merchant/inventory',
    query: {
      date: selectedSlot.value.bizDate,
      storeId: String(selectedSlot.value.storeId),
      slotStart: selectedSlot.value.startTime,
      slotEnd: selectedSlot.value.endTime,
    },
  })
}

const exportScheduleCsv = () => {
  if (!gridData.value) return
  const header = '日期,开始时间,结束时间,容量,已约,剩余,状态,订单数'
  const rows = [header]
  for (const d of gridData.value.dates) {
    const slots = gridData.value.slotsByDate?.[d] ?? []
    for (const s of slots) {
      rows.push(`${d},${s.startTime},${s.endTime},${s.capacity},${s.paidCount},${s.remainCount},${s.slotStatus},${s.orders.length}`)
    }
  }
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `schedule-grid-${todayKey}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

const toggleStoreDropdown = () => {
  activeDropdown.value = activeDropdown.value === 'store' ? null : 'store'
}

const selectStore = (opt: ScheduleStoreOption) => {
  store.value = opt
  activeDropdown.value = null
}

const resetFilters = () => {
  store.value = storeOptions.value[0] ?? { label: '' }
  activeDropdown.value = null
  selectedSlot.value = null
}

const loadGrid = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const storeId = store.value.backendId
    try {
      gridData.value = await backendApi.dashboardScheduleGrid(storeId ? { storeId } : {})
    } catch {
      const dates = createScheduleGridDates(routeDate.value)
      const [inventory, orderPage] = await Promise.all([
        backendApi.listBookingInventory({
          beginBizDate: dates[0],
          endBizDate: dates[dates.length - 1],
          storeId,
        }),
        backendApi.listOrders({
          pageNum: 1,
          pageSize: 1000,
          storeId,
          beginArrivalTime: `${dates[0]} 00:00:00`,
          endArrivalTime: `${dates[dates.length - 1]} 23:59:59`,
        }),
      ])
      gridData.value = buildScheduleGridFallback({
        startDate: dates[0],
        storeId: storeId ?? null,
        inventory,
        orders: orderPage.items,
      })
    }
    openRouteSlotIfPossible()
  } catch (e: any) {
    gridData.value = null
    selectedSlot.value = null
    loadError.value = e?.message || '加载档期数据失败'
  } finally {
    loading.value = false
  }
}

const applyRouteFilters = () => {
  const concreteStores = storeOptions.value
  if (concreteStores.length <= 0) {
    store.value = { label: '' }
    return
  }
  if (routeStoreId.value) {
    const matched = concreteStores.find(s => String(s.backendId) === routeStoreId.value)
    if (matched) {
      store.value = matched
      return
    }
  }
  if (!store.value.backendId || !concreteStores.some(s => s.backendId === store.value.backendId)) {
    store.value = concreteStores[0]!
  }
}

watch([() => store.value.backendId, routeDate], () => {
  loadGrid()
}, { immediate: true })

watch(() => route.fullPath, () => {
  applyRouteFilters()
  openRouteSlotIfPossible()
})

watch([storeOptions], () => {
  applyRouteFilters()
}, { immediate: true })
</script>
