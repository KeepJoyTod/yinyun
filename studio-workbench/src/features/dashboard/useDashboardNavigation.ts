import type { Ref, ComputedRef } from 'vue'
import type { Router } from 'vue-router'
import { appStore } from '../../shared/stores/appStore'
import type { DashboardOperationCard } from './useDashboardOperationCards'

export type DashboardTrendGranularity = '月 / 周 / 日' | '月' | '周' | '日'

type UseDashboardNavigationOptions = {
  router: Router
  selectedDateValue: ComputedRef<string>
  selectedDashboardStoreBackendId: ComputedRef<string>
  selectedDashboardStoreScopeId: ComputedRef<string>
  businessDateKey: ComputedRef<string>
  trendGranularity: Ref<DashboardTrendGranularity>
}

export const buildWorkbenchUrl = (
  router: Router,
  path: string,
  query?: Record<string, string | undefined>,
) => {
  const resolved = router.resolve({ path, query })
  if (typeof window === 'undefined') return resolved.href
  return new URL(resolved.href, window.location.origin).toString()
}

export const useDashboardNavigation = ({
  router,
  selectedDateValue,
  selectedDashboardStoreBackendId,
  selectedDashboardStoreScopeId,
  businessDateKey,
  trendGranularity,
}: UseDashboardNavigationOptions) => {
  const buildDateOrderQuery = (date: string, extra: Record<string, string | undefined> = {}) => ({
    quick: 'all',
    time: 'arrival',
    start: date,
    end: date,
    storeId: selectedDashboardStoreBackendId.value,
    ...extra,
  })
  const buildDashboardOrderQuery = (date: string) => ({
    pageNum: 1,
    pageSize: 500,
    storeId: selectedDashboardStoreScopeId.value,
    slotDate: date,
  })
  const goInventory = (item?: { storeName?: string; serviceGroupName?: string }) => router.push({
    path: '/merchant/inventory',
    query: {
      date: selectedDateValue.value,
      storeId: item?.storeName ? appStore.stores.find(store => store.name === item.storeName)?.backendId : undefined,
    },
  })
  const goShareLinks = () => router.push('/tools/share-links')
  const goDailyReport = () => router.push({
    path: '/report/store-daily',
    query: { date: selectedDateValue.value, storeId: selectedDashboardStoreBackendId.value },
  })
  const toggleTrendGranularity = () => {
    trendGranularity.value = trendGranularity.value === '月 / 周 / 日'
      ? '日'
      : trendGranularity.value === '日'
        ? '周'
        : trendGranularity.value === '周'
          ? '月'
          : '月 / 周 / 日'
  }
  const openSlotFilter = () => {
    router.push({
      path: '/merchant/inventory',
      query: { date: selectedDateValue.value, storeId: selectedDashboardStoreBackendId.value },
    })
  }
  const openOperationCard = (item: DashboardOperationCard) => {
    if (item.label === '今日待拍') {
      router.push({ path: '/order/appointment', query: buildDateOrderQuery(selectedDateValue.value, { quick: 'todayOps' }) })
      return
    }
    if (item.label === '待上传') {
      router.push({ path: '/service/photos', query: { date: selectedDateValue.value, needsUpload: '1' } })
      return
    }
    if (item.label === '待选片') {
      router.push({ path: '/service/selection', query: { date: selectedDateValue.value, stage: 'pending-submit' } })
      return
    }
    router.push({ path: '/service/selection', query: { date: selectedDateValue.value, stage: 'selecting' } })
  }
  const openStatusCard = (item: { key: string; label: string }) => {
    router.push({ path: '/order/appointment', query: buildDateOrderQuery(selectedDateValue.value, { statusTab: item.key }) })
  }
  const openProductRanking = (product: string) => {
    router.push({ path: '/order/appointment', query: buildDateOrderQuery(businessDateKey.value, { aservice: product }) })
  }
  const openChannelSummary = (source: string) => {
    router.push({ path: '/order/appointment', query: buildDateOrderQuery(selectedDateValue.value, { asource: source }) })
  }
  const openQuickEntry = (entryKey: string) => {
    const storeId = selectedDashboardStoreBackendId.value ?? appStore.stores[0]?.backendId
    if (entryKey === 'booking') {
      router.push({ path: '/tools/booking-entry', query: { storeId } })
      return
    }
    if (entryKey === 'selection') {
      router.push({ path: '/service/selection' })
      return
    }
    router.push({ path: '/tools/pickup-entry', query: { storeId } })
  }

  return {
    buildDateOrderQuery,
    buildDashboardOrderQuery,
    buildWorkbenchUrl: (path: string, query?: Record<string, string | undefined>) =>
      buildWorkbenchUrl(router, path, query),
    goInventory,
    goShareLinks,
    goDailyReport,
    toggleTrendGranularity,
    openSlotFilter,
    openOperationCard,
    openStatusCard,
    openProductRanking,
    openChannelSummary,
    openQuickEntry,
  }
}
