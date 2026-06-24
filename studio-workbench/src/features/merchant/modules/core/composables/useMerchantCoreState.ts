import { computed, onMounted, ref, watch } from 'vue'
import { appStore } from '../../../../../shared/stores/appStore'
import { buildDouyinStoreBindings } from '../../../../stores/storeDouyinBindings'
import { useConcreteStoreScope } from '../../shared/useConcreteStoreScope'
import {
  buildMerchantOverviewMetrics,
  buildScopedBookingInventory,
  buildScopedMerchantOrders,
  buildScopedScheduleItems,
  buildScopedStoreRows,
  resolveMerchantStatusClass,
  resolveStoreFillRate,
  resolveStoreTodayOrders,
} from '../merchantCoreOperations'

const today = new Date()
const pad2 = (n: number) => String(n).padStart(2, '0')
const todayKey = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`

export const useMerchantCoreState = () => {
  const selectedStoreId = ref('')
  const { concreteStoreOptions, ensureWorkbenchStores, applyStoreScope } = useConcreteStoreScope(selectedStoreId)

  const selectedStore = computed(() =>
    concreteStoreOptions.value.find(store => String(store.backendId) === selectedStoreId.value) ?? null,
  )
  const storeRoute = computed(() => ({
    path: '/merchant/store',
    query: { storeId: selectedStoreId.value || undefined },
  }))
  const storeRows = computed(() => buildScopedStoreRows(selectedStore.value))
  const scopedOrders = computed(() => buildScopedMerchantOrders(appStore.orders, selectedStoreId.value))
  const scopedScheduleItems = computed(() => buildScopedScheduleItems(appStore.scheduleItems, selectedStoreId.value))
  const scopedBookingInventory = computed(() => buildScopedBookingInventory(appStore.bookingInventory, selectedStoreId.value))
  const openStoreCount = computed(() => storeRows.value.filter(store => store.status.includes('营业') || store.status.includes('预约')).length)
  const pendingOrders = computed(() => scopedOrders.value.filter(order => ['待确认', '已确认', '拍摄中'].includes(order.status)).length)
  const todayBookings = computed(() => scopedScheduleItems.value.filter(item => item.startAt.startsWith(todayKey)).length)
  const fullSlots = computed(() => scopedBookingInventory.value.filter(slot => slot.capacity > 0 && slot.confirmedCount >= slot.capacity).length)
  const douyinStoreBindings = computed(() => buildDouyinStoreBindings(storeRows.value, appStore.channelProductMappings))
  const readyDouyinStoreCount = computed(() => douyinStoreBindings.value.filter(item => item.readyCount > 0).length)
  const overviewMetrics = computed(() => buildMerchantOverviewMetrics({
    storeRows: storeRows.value,
    openStoreCount: openStoreCount.value,
    todayBookings: todayBookings.value,
    pendingOrders: pendingOrders.value,
    fullSlots: fullSlots.value,
    readyDouyinStoreCount: readyDouyinStoreCount.value,
    scopedBookingInventoryCount: scopedBookingInventory.value.length,
  }))

  const reloadMerchantContext = async () => {
    await ensureWorkbenchStores()
    const normalized = applyStoreScope()
    if (!normalized) return
    await Promise.all([
      appStore.refreshCoreData(),
      appStore.loadSchedule(todayKey, selectedStore.value?.name ?? '', normalized),
      appStore.loadBookingInventory({ date: todayKey, storeBackendId: normalized }),
      appStore.loadChannelProductMappings('DOUYIN_LIFE'),
    ])
  }

  watch(
    () => concreteStoreOptions.value.map(store => `${store.backendId}:${store.name}`).join('|'),
    () => {
      applyStoreScope()
    },
  )

  watch(selectedStoreId, () => {
    void reloadMerchantContext()
  })

  onMounted(async () => {
    await ensureWorkbenchStores()
    applyStoreScope()
    if (appStore.bookingInventory.length === 0) void reloadMerchantContext()
  })

  return {
    selectedStoreId,
    concreteStoreOptions,
    storeRoute,
    storeRows,
    douyinStoreBindings,
    overviewMetrics,
    reloadMerchantContext,
    storeTodayOrders: (storeBackendId: string) => resolveStoreTodayOrders(storeBackendId, scopedScheduleItems.value, todayKey),
    storeFillRate: (storeBackendId: string) => resolveStoreFillRate(storeBackendId, scopedBookingInventory.value, todayKey),
    statusClass: resolveMerchantStatusClass,
  }
}
