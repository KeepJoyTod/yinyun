import { computed, ref } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import { buildDashboardDateTabs, formatDateKey, toDateFromKey } from './dashboardPresentation'

export const useDashboardSelectionScope = () => {
  const todayKey = formatDateKey(new Date())
  const selectedDate = ref(todayKey)
  const selectedDateValue = computed(() => selectedDate.value || todayKey)
  const selectedDateObject = computed(() => toDateFromKey(selectedDateValue.value))
  const selectedDateLabel = computed(() => {
    const date = selectedDateObject.value
    return `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  })
  const selectedDateShortLabel = computed(() => selectedDateValue.value.slice(5))
  const selectedDatePrefix = computed(() => (selectedDateValue.value === todayKey ? '今日这些' : '当天这些'))
  const selectedDashboardStoreId = ref('')
  const dashboardStoreOptions = computed(() => [
    ...appStore.stores.map(store => ({ id: store.backendId, name: store.name })),
  ])
  const selectedDashboardStore = computed(() =>
    appStore.stores.find(store => store.backendId === selectedDashboardStoreId.value),
  )
  const fallbackDashboardStoreId = computed(() => appStore.stores[0]?.backendId || '')
  const selectedDashboardStoreScopeId = computed(() =>
    selectedDashboardStore.value?.backendId || fallbackDashboardStoreId.value,
  )
  const selectedDashboardStoreBackendId = computed(() =>
    selectedDashboardStoreScopeId.value,
  )
  const selectedDashboardStoreName = computed(() =>
    selectedDashboardStore.value?.name
    ?? appStore.stores.find(store => store.backendId === selectedDashboardStoreScopeId.value)?.name
    ?? '未选择门店',
  )
  const selectedStoreScopeLabel = computed(() =>
    selectedDashboardStoreName.value,
  )

  const selectDashboardDate = (date: string) => {
    selectedDate.value = date
  }
  const selectDashboardStore = (storeId: string) => {
    if (appStore.stores.some(store => store.backendId === storeId)) {
      selectedDashboardStoreId.value = storeId
    }
  }
  const shiftDashboardDate = (days: number) => {
    const date = toDateFromKey(selectedDateValue.value)
    date.setDate(date.getDate() + days)
    selectedDate.value = formatDateKey(date)
  }
  const dashboardDateTabs = computed(() => buildDashboardDateTabs(selectedDateValue.value, todayKey))

  return {
    todayKey,
    selectedDate,
    selectedDateValue,
    selectedDateLabel,
    selectedDateShortLabel,
    selectedDatePrefix,
    selectedDashboardStoreId,
    dashboardStoreOptions,
    selectedDashboardStore,
    fallbackDashboardStoreId,
    selectedDashboardStoreScopeId,
    selectedDashboardStoreBackendId,
    selectedDashboardStoreName,
    selectedStoreScopeLabel,
    selectDashboardDate,
    selectDashboardStore,
    shiftDashboardDate,
    dashboardDateTabs,
  }
}
