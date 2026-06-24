import { computed, type ComputedRef } from 'vue'
import type { Router } from 'vue-router'
import { useCopyWithState } from '../../../shared/composables/useCopyWithState'
import type { StoreInfo } from '../../../shared/stores/appStore'
import type { DashboardInventoryConflictItem } from '../components/DashboardInventoryConflictsSection.vue'
import type { DashboardOperationCard } from '../components/DashboardOperationStripSection.vue'

type DashboardNavigationInput = {
  router: Router
  stores: () => StoreInfo[]
  selectedDateValue: ComputedRef<string>
  selectedDashboardStoreScopeId: ComputedRef<string>
  selectedDashboardStoreBackendId: ComputedRef<string>
  businessDateKey: ComputedRef<string>
}

export const useDashboardNavigation = (input: DashboardNavigationInput) => {
  const buildDateOrderQuery = (date: string, extra: Record<string, string | undefined> = {}) => ({
    quick: 'all',
    time: 'arrival',
    start: date,
    end: date,
    storeId: input.selectedDashboardStoreBackendId.value,
    ...extra,
  })

  const buildDashboardOrderQuery = (date: string) => ({
    pageNum: 1,
    pageSize: 500,
    storeId: input.selectedDashboardStoreScopeId.value,
    slotDate: date,
  })

  const goInventory = (item?: DashboardInventoryConflictItem) => input.router.push({
    path: '/merchant/inventory',
    query: {
      date: input.selectedDateValue.value,
      storeId: item?.storeName ? input.stores().find(store => store.name === item.storeName)?.backendId : undefined,
    },
  })

  const goShareLinks = () => input.router.push('/tools/share-links')
  const goDailyReport = () => input.router.push({
    path: '/report/store-daily',
    query: { date: input.selectedDateValue.value, storeId: input.selectedDashboardStoreBackendId.value },
  })
  const openSlotFilter = () => {
    input.router.push({
      path: '/merchant/inventory',
      query: { date: input.selectedDateValue.value, storeId: input.selectedDashboardStoreBackendId.value },
    })
  }
  const openOperationCard = (item: DashboardOperationCard) => {
    if (item.label === '今日待拍') {
      input.router.push({
        path: '/order/appointment',
        query: buildDateOrderQuery(input.selectedDateValue.value, { quick: 'todayOps' }),
      })
      return
    }
    if (item.label === '待上传') {
      input.router.push({ path: '/service/photos', query: { date: input.selectedDateValue.value, needsUpload: '1' } })
      return
    }
    if (item.label === '待选片') {
      input.router.push({ path: '/service/selection', query: { date: input.selectedDateValue.value, stage: 'pending-submit' } })
      return
    }
    input.router.push({ path: '/service/selection', query: { date: input.selectedDateValue.value, stage: 'selecting' } })
  }
  const openStatusCard = (item: { key: string; label: string }) => {
    input.router.push({
      path: '/order/appointment',
      query: buildDateOrderQuery(input.selectedDateValue.value, { statusTab: item.key }),
    })
  }
  const openProductRanking = (product: string) => {
    input.router.push({ path: '/order/appointment', query: buildDateOrderQuery(input.businessDateKey.value, { aservice: product }) })
  }
  const openChannelSummary = (source: string) => {
    input.router.push({ path: '/order/appointment', query: buildDateOrderQuery(input.selectedDateValue.value, { asource: source }) })
  }
  const openQuickEntry = (entryKey: string) => {
    const storeId = input.selectedDashboardStoreBackendId.value ?? input.stores()[0]?.backendId
    if (entryKey === 'booking') {
      input.router.push({ path: '/tools/booking-entry', query: { storeId } })
      return
    }
    if (entryKey === 'selection') {
      input.router.push({ path: '/service/selection' })
      return
    }
    input.router.push({ path: '/tools/pickup-entry', query: { storeId } })
  }

  const buildWorkbenchUrl = (path: string, query?: Record<string, string | undefined>) => {
    const resolved = input.router.resolve({ path, query })
    if (typeof window === 'undefined') return resolved.href
    return new URL(resolved.href, window.location.origin).toString()
  }

  const quickEntries = computed(() => {
    const primaryStoreId = input.selectedDashboardStoreBackendId.value ?? input.stores()[0]?.backendId
    return [
      {
        key: 'booking',
        label: '预约入口',
        url: primaryStoreId ? buildWorkbenchUrl('/tools/booking-entry', { storeId: primaryStoreId }) : '',
        hint: '客户小程序/H5 预约地址',
      },
      {
        key: 'selection',
        label: '选片入口',
        url: buildWorkbenchUrl('/service/selection'),
        hint: '客户在线选片工作台入口',
      },
      {
        key: 'pickup',
        label: '取片入口',
        url: primaryStoreId ? buildWorkbenchUrl('/tools/pickup-entry', { storeId: primaryStoreId }) : '',
        hint: '客户取片与查单地址',
      },
    ]
  })

  const { copiedKey: copiedEntryKey, copyText: copyEntryText } = useCopyWithState()
  const copyEntryUrl = async (key: string, url: string) => {
    if (!url) return
    await copyEntryText(url, key)
  }

  return {
    buildDateOrderQuery,
    buildDashboardOrderQuery,
    goInventory,
    goShareLinks,
    goDailyReport,
    openSlotFilter,
    openOperationCard,
    openStatusCard,
    openProductRanking,
    openChannelSummary,
    openQuickEntry,
    quickEntries,
    copiedEntryKey,
    copyEntryUrl,
  }
}
