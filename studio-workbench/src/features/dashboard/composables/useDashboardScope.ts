import { computed, ref } from 'vue'
import type { StoreInfo } from '../../../shared/stores/appStore'

const pad2 = (n: number) => String(n).padStart(2, '0')

export const formatDashboardDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

export const toDashboardDateFromKey = (value: string) => {
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

export const useDashboardScope = (input: { stores: () => StoreInfo[] }) => {
  const todayKey = formatDashboardDateKey(new Date())
  const selectedDate = ref(todayKey)
  const selectedDashboardStoreId = ref('')
  const dashboardDeepLinkSlot = ref<{ start: string; end: string }>({ start: '', end: '' })

  const selectedDateValue = computed(() => selectedDate.value || todayKey)
  const selectedDateObject = computed(() => toDashboardDateFromKey(selectedDateValue.value))
  const selectedDateLabel = computed(() => {
    const date = selectedDateObject.value
    return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  })
  const selectedDateShortLabel = computed(() => selectedDateValue.value.slice(5))
  const selectedDatePrefix = computed(() => (selectedDateValue.value === todayKey ? '今日这些' : '当天这些'))
  const dashboardStoreOptions = computed(() => [
    ...input.stores().map(store => ({ id: store.backendId, name: store.name })),
  ])
  const selectedDashboardStore = computed(() =>
    input.stores().find(store => store.backendId === selectedDashboardStoreId.value),
  )
  const fallbackDashboardStoreId = computed(() => input.stores()[0]?.backendId || '')
  const selectedDashboardStoreScopeId = computed(() =>
    selectedDashboardStore.value?.backendId || fallbackDashboardStoreId.value,
  )
  const selectedDashboardStoreBackendId = computed(() => selectedDashboardStoreScopeId.value)
  const selectedDashboardStoreName = computed(() =>
    selectedDashboardStore.value?.name
    ?? input.stores().find(store => store.backendId === selectedDashboardStoreScopeId.value)?.name
    ?? '未选择门店',
  )
  const selectedStoreScopeLabel = computed(() => selectedDashboardStoreName.value)
  const hasDashboardSlotDeepLink = computed(() => Boolean(dashboardDeepLinkSlot.value.start))

  const selectDashboardDate = (date: string) => {
    selectedDate.value = date
  }
  const selectDashboardStore = (storeId: string) => {
    if (input.stores().some(store => store.backendId === storeId)) {
      selectedDashboardStoreId.value = storeId
    }
  }
  const shiftDashboardDate = (days: number) => {
    const date = toDashboardDateFromKey(selectedDateValue.value)
    date.setDate(date.getDate() + days)
    selectedDate.value = formatDashboardDateKey(date)
  }

  const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const dashboardDateTabs = computed(() => {
    const selected = toDashboardDateFromKey(selectedDateValue.value)
    return Array.from({ length: 7 }, (_, idx) => {
      const item = new Date(selected)
      item.setDate(selected.getDate() + idx)
      const key = formatDashboardDateKey(item)
      return {
        date: key,
        shortLabel: key === todayKey ? '今天' : weekdayLabels[item.getDay()],
        dateLabel: `${pad2(item.getMonth() + 1)}月${pad2(item.getDate())}日`,
        active: key === selectedDateValue.value,
        today: key === todayKey,
      }
    })
  })

  return {
    todayKey,
    selectedDate,
    selectedDashboardStoreId,
    dashboardDeepLinkSlot,
    selectedDateValue,
    selectedDateLabel,
    selectedDateShortLabel,
    selectedDatePrefix,
    dashboardStoreOptions,
    selectedDashboardStore,
    fallbackDashboardStoreId,
    selectedDashboardStoreScopeId,
    selectedDashboardStoreBackendId,
    selectedDashboardStoreName,
    selectedStoreScopeLabel,
    hasDashboardSlotDeepLink,
    selectDashboardDate,
    selectDashboardStore,
    shiftDashboardDate,
    dashboardDateTabs,
  }
}
