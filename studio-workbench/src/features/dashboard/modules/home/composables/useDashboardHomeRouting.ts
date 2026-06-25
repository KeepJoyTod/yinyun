import { nextTick, onMounted, watch, type ComputedRef, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { useRouteQueryFilters } from '../../../../../shared/composables/useRouteQueryFilters'
import { appStore, type StoreInfo } from '../../../../../shared/stores/appStore'

type UseDashboardHomeRoutingOptions = {
  selectedDate: Ref<string>
  todayKey: string
  selectedDateValue: ComputedRef<string>
  selectedDashboardStoreId: Ref<string>
  selectedDashboardStore: ComputedRef<StoreInfo | undefined>
  fallbackDashboardStoreId: ComputedRef<string>
  selectedDashboardStoreScopeId: ComputedRef<string>
  dashboardDeepLinkSlot: Ref<{ start: string; end: string }>
  restoreDashboardSlotFromQuery: () => void
}

export const useDashboardHomeRouting = ({
  selectedDate,
  todayKey,
  selectedDateValue,
  selectedDashboardStoreId,
  selectedDashboardStore,
  fallbackDashboardStoreId,
  selectedDashboardStoreScopeId,
  dashboardDeepLinkSlot,
  restoreDashboardSlotFromQuery,
}: UseDashboardHomeRoutingOptions) => {
  const route = useRoute()
  const { syncing, applyFromQuery, syncToUrl, isDateKey } = useRouteQueryFilters({
    buildQuery: () => ({
      date: selectedDate.value === todayKey ? '' : selectedDate.value,
      storeId: selectedDashboardStoreScopeId.value || '',
      slotStart: dashboardDeepLinkSlot.value.start,
      slotEnd: dashboardDeepLinkSlot.value.end,
    }),
    parseQuery: get => {
      const slotStart = get('slotStart')
      const slotEnd = get('slotEnd')
      dashboardDeepLinkSlot.value = { start: slotStart, end: slotEnd }
      const date = get('date')
      if (date && isDateKey(date)) selectedDate.value = date
      const storeId = get('storeId')
      if (storeId && appStore.stores.some(store => store.backendId === storeId)) {
        selectedDashboardStoreId.value = storeId
      }
    },
  })

  applyFromQuery()

  watch([selectedDateValue, selectedDashboardStoreId], () => {
    if (syncing.value) return
    syncToUrl()
  })

  onMounted(async () => {
    if (!selectedDashboardStoreId.value && appStore.stores[0]?.backendId) {
      selectedDashboardStoreId.value = appStore.stores[0].backendId
    }
    applyFromQuery()
    await nextTick()
    restoreDashboardSlotFromQuery()
  })

  watch(
    () => appStore.stores.map(store => store.backendId).join('|'),
    () => {
      if (!selectedDashboardStore.value && fallbackDashboardStoreId.value) {
        selectedDashboardStoreId.value = fallbackDashboardStoreId.value
      }
    },
    { immediate: true },
  )

  watch(
    () => route.fullPath,
    () => {
      applyFromQuery()
      if (!selectedDashboardStore.value && fallbackDashboardStoreId.value) {
        selectedDashboardStoreId.value = fallbackDashboardStoreId.value
      }
      restoreDashboardSlotFromQuery()
    },
  )

  return {
    syncing,
    applyFromQuery,
    syncToUrl,
  }
}
