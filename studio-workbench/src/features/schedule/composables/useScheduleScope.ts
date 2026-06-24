import { computed, ref } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import type { StoreInfo } from '../../../shared/stores/appStore'

const pad2 = (n: number) => String(n).padStart(2, '0')

export const formatScheduleDateKey = (value: Date) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`

export const toScheduleDateFromKey = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

export const formatScheduleClock = (value: string) => {
  const d = new Date(value)
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export const useScheduleScope = (input: {
  route: RouteLocationNormalizedLoaded
  stores: () => StoreInfo[]
  storeNames: () => string[]
}) => {
  const today = new Date()
  const todayKey = formatScheduleDateKey(today)
  const date = ref(todayKey)
  const store = ref('')
  const viewMode = ref<'day' | 'week'>('day')
  const activeDropdown = ref<'store' | null>(null)
  const activeScheduleFilter = ref<'all' | 'pending' | 'confirmed' | 'conflict'>('all')
  const showFilterPanel = ref(false)
  const showTimeline = ref(false)
  const slotDeepLink = ref<{ start: string; end: string }>({ start: '', end: '' })

  const scheduleStoreOptions = computed(() => input.storeNames().filter(name => name !== '全部门店'))
  const storeOptions = computed(() => scheduleStoreOptions.value)
  const selectedStore = computed(() => input.stores().find(s => s.name === store.value))
  const selectedStoreBackendId = computed(() => selectedStore.value?.backendId ? String(selectedStore.value.backendId) : undefined)

  const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const scheduleDateTabs = computed(() => {
    const selected = toScheduleDateFromKey(date.value)
    return Array.from({ length: 7 }, (_, idx) => {
      const item = new Date(selected)
      item.setDate(selected.getDate() + idx)
      const key = formatScheduleDateKey(item)
      return {
        date: key,
        shortLabel: key === todayKey ? '今天' : weekdayLabels[item.getDay()],
        dateLabel: `${pad2(item.getMonth() + 1)}月${pad2(item.getDate())}日`,
        active: key === date.value,
        today: key === todayKey,
      }
    })
  })

  const selectScheduleDate = (nextDate: string) => {
    date.value = nextDate
  }

  const shiftScheduleDate = (days: number) => {
    const next = toScheduleDateFromKey(date.value)
    next.setDate(next.getDate() + days)
    date.value = formatScheduleDateKey(next)
  }

  const toggleFilterPanel = () => {
    showFilterPanel.value = !showFilterPanel.value
  }

  const selectStore = (opt: string) => {
    store.value = opt
    activeDropdown.value = null
  }

  const applyRouteFilters = () => {
    const routeDate = typeof input.route.query.date === 'string' ? input.route.query.date : ''
    if (routeDate) date.value = routeDate

    const routeStoreId = typeof input.route.query.storeId === 'string' ? input.route.query.storeId : ''
    const matchedStore = input.stores().find(item => String(item.backendId) === routeStoreId)
    if (matchedStore) store.value = matchedStore.name

    const routeSlotStart = typeof input.route.query.slotStart === 'string' ? input.route.query.slotStart : ''
    const routeSlotEnd = typeof input.route.query.slotEnd === 'string' ? input.route.query.slotEnd : ''
    slotDeepLink.value = { start: routeSlotStart, end: routeSlotEnd }

    if (!store.value) store.value = scheduleStoreOptions.value[0] ?? ''
  }

  const resetFilters = () => {
    date.value = todayKey
    store.value = scheduleStoreOptions.value[0] ?? ''
    viewMode.value = 'day'
    activeScheduleFilter.value = 'all'
    activeDropdown.value = null
    showFilterPanel.value = false
    showTimeline.value = false
  }

  return {
    date,
    store,
    viewMode,
    activeDropdown,
    activeScheduleFilter,
    showFilterPanel,
    showTimeline,
    slotDeepLink,
    scheduleStoreOptions,
    storeOptions,
    selectedStore,
    selectedStoreBackendId,
    scheduleDateTabs,
    selectScheduleDate,
    shiftScheduleDate,
    toggleFilterPanel,
    selectStore,
    applyRouteFilters,
    resetFilters,
  }
}
