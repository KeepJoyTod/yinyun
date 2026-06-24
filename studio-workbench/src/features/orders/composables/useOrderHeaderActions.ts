import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { format } from 'date-fns'
import { appStore } from '../../../shared/stores/appStore'
import {
  buildOrderExportQuery,
  getOrderExportSyncNotice,
  getUnsupportedOrderExportFilters,
  type QuickOrderFilter,
} from '../orderOperations'
import type { useOrderFilters } from './useOrderFilters'

export type UseOrderHeaderActionsParams = {
  route: RouteLocationNormalizedLoaded
  filters: ReturnType<typeof useOrderFilters>
  selectedTimeType: Ref<'order' | 'arrival'>
  activeQuickFilter: Ref<QuickOrderFilter>
  statusTab: Ref<string>
  effectiveSearchQuery: ComputedRef<string>
  readQueryString: (value: unknown) => string
  notifyOrderAction: (type: 'success' | 'error', message: string) => void
}

export function useOrderHeaderActions(params: UseOrderHeaderActionsParams) {
  const {
    route,
    filters,
    selectedTimeType,
    activeQuickFilter,
    statusTab,
    effectiveSearchQuery,
    readQueryString,
    notifyOrderAction,
  } = params

  const exportingOrders = ref(false)
  const syncingDouyinOrders = ref(false)
  const lastAllOrdersQueryKey = ref('')

  const syncDouyinLifeOrders = async () => {
    if (syncingDouyinOrders.value) return
    syncingDouyinOrders.value = true
    try {
      const result = await appStore.syncDouyinLifeOrdersAndRefresh({
        refreshDate: filters.todayKey,
        maxPages: 2,
        maxTotal: 80,
        refreshAllOrders: readQueryString(route.query.quick) === 'douyin30',
      })
      const prefix = appStore.demoMode ? '演示模式同步完成' : '同步近24小时抖音来客订单完成'
      notifyOrderAction(
        'success',
        `${prefix}：created ${result.created}，updated ${result.updated}，failed ${result.failed}，lastLogId ${result.lastLogId || '暂无'}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : '同步失败'
      notifyOrderAction('error', `同步失败：${message}`)
    } finally {
      syncingDouyinOrders.value = false
    }
  }

  const showAllOrders = async () => {
    try {
      if (!appStore.demoMode) await appStore.loadAllOrders()
      selectedTimeType.value = 'arrival'
      activeQuickFilter.value = 'douyin30'
      filters.arrivalRange.start = ''
      filters.arrivalRange.end = ''
      filters.orderRange.start = ''
      filters.orderRange.end = ''
      notifyOrderAction('success', `已切换到近30天抖音来客订单，当前 ${filters.orders.value.length} 条；今日处理队列不会被历史账本覆盖`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载失败'
      notifyOrderAction('error', `加载近30天来客订单失败：${message}`)
    }
  }

  const loadAllOrdersFromQuery = async () => {
    if (!appStore.initialized || appStore.demoMode || readQueryString(route.query.quick) !== 'douyin30') return
    const queryKey = route.fullPath
    if (lastAllOrdersQueryKey.value === queryKey) return
    lastAllOrdersQueryKey.value = queryKey
    try {
      await appStore.loadAllOrders()
    } catch (error) {
      lastAllOrdersQueryKey.value = ''
      const message = error instanceof Error ? error.message : '加载失败'
      notifyOrderAction('error', `加载近30天来客订单失败：${message}`)
    }
  }

  const getDropdownValue = (label: string) => {
    const value = filters.dropdownFilters.value.find(filter => filter.label === label)?.value
    if (!value || value === label || value.startsWith('全部')) return undefined
    return value
  }

  const getExportStatusLabel = () => {
    if (filters.advanced.value.status.length === 1) return filters.advanced.value.status[0]
    if (statusTab.value !== 'all' && statusTab.value !== '待支付') return statusTab.value
    return undefined
  }

  const getExportPaymentLabel = () => {
    if (filters.advanced.value.payment !== '全部状态') return filters.advanced.value.payment
    if (statusTab.value === '待支付') return '待支付'
    return getDropdownValue('支付状态')
  }

  const orderExportSourceLabel = computed(() =>
    filters.advanced.value.source !== '全部来源' ? filters.advanced.value.source : getDropdownValue('订单来源'),
  )
  const orderExportSyncNotice = computed(() => getOrderExportSyncNotice({
    demoMode: appStore.demoMode,
    sourceLabel: orderExportSourceLabel.value,
  }))

  const orderExportQuery = computed(() => buildOrderExportQuery({
    selectedTimeType: selectedTimeType.value,
    startDate: filters.activeStartDate.value,
    endDate: filters.activeEndDate.value,
    storeName: filters.storeNameForOrderScope.value,
    sourceLabel: orderExportSourceLabel.value,
    paymentLabel: getExportPaymentLabel(),
    statusLabel: getExportStatusLabel(),
    keyword: effectiveSearchQuery.value,
    stores: appStore.stores,
  }))

  const unsupportedOrderExportFilters = computed(() => getUnsupportedOrderExportFilters({
    selectedTimeType: selectedTimeType.value,
    keyword: effectiveSearchQuery.value,
    serviceLabel: filters.advanced.value.service !== '全部服务' ? filters.advanced.value.service : getDropdownValue('服务类型'),
    methodLabel: filters.advanced.value.method,
    amountMin: filters.advanced.value.amountMin,
    amountMax: filters.advanced.value.amountMax,
    statusLabels: filters.advanced.value.status,
  }))

  const canExportOrders = computed(() =>
    !appStore.demoMode && filters.filteredOrders.value.length > 0 && unsupportedOrderExportFilters.value.length === 0,
  )
  const orderExportTitle = computed(() => {
    if (appStore.demoMode) return 'Demo 模式不可导出，请连接 API 后使用真实 yy_order 导出'
    if (unsupportedOrderExportFilters.value.length) {
      return `${unsupportedOrderExportFilters.value.join('、')}暂不支持等价导出，请清除后再导出`
    }
    if (!filters.filteredOrders.value.length) return '当前筛选无订单可导出'
    return '按当前后端可表达筛选导出 yy_order Excel'
  })

  const downloadOrderBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const exportOrders = async () => {
    if (appStore.demoMode) {
      notifyOrderAction('error', 'Demo 模式不可导出，请连接 API 后导出真实 yy_order')
      return
    }
    if (unsupportedOrderExportFilters.value.length) {
      notifyOrderAction('error', `当前筛选暂不支持等价导出：${unsupportedOrderExportFilters.value.join('、')}`)
      return
    }
    if (!filters.filteredOrders.value.length || exportingOrders.value) return
    exportingOrders.value = true
    try {
      const result = await appStore.exportOrders(orderExportQuery.value)
      const fallbackName = `yy_order_${format(new Date(), 'yyyyMMddHHmmss')}.xlsx`
      downloadOrderBlob(result.blob, result.fileName || fallbackName)
      notifyOrderAction('success', `已发起导出：${filters.filteredOrders.value.length} 条订单`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败'
      notifyOrderAction('error', `导出失败：${message}`)
    } finally {
      exportingOrders.value = false
    }
  }

  return {
    exportingOrders,
    syncingDouyinOrders,
    syncDouyinLifeOrders,
    showAllOrders,
    loadAllOrdersFromQuery,
    orderExportSyncNotice,
    unsupportedOrderExportFilters,
    canExportOrders,
    orderExportTitle,
    exportOrders,
  }
}
