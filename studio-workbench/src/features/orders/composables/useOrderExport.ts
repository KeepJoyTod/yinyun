import { computed, ref } from 'vue'
import { format } from 'date-fns'
import { appStore, type BookingOrder } from '../../../shared/stores/appStore'
import {
  buildOrderExportQuery,
  getOrderExportSyncNotice,
  getUnsupportedOrderExportFilters,
} from '../orderOperations'
import type { OrderAdvancedFilters, OrderDropdownFilter } from './useOrderFilters'

type OrderExportStatusTab = { value: string }
type OrderExportDateMode = { value: 'order' | 'arrival' }
type OrderExportAdvanced = { value: OrderAdvancedFilters }
type OrderExportDropdowns = { value: OrderDropdownFilter[] }
type OrderExportStringRef = { value: string }
type OrderExportOrders = { value: BookingOrder[] }

export function useOrderExport(state: {
  selectedTimeType: OrderExportDateMode
  activeStartDate: OrderExportStringRef
  activeEndDate: OrderExportStringRef
  storeNameForOrderScope: OrderExportStringRef
  effectiveSearchQuery: OrderExportStringRef
  statusTab: OrderExportStatusTab
  advanced: OrderExportAdvanced
  dropdownFilters: OrderExportDropdowns
  filteredOrders: OrderExportOrders
}, notifyOrderAction: (type: 'success' | 'error', message: string) => void) {
  const exportingOrders = ref(false)

  const getDropdownValue = (label: string) => {
    const value = state.dropdownFilters.value.find(filter => filter.label === label)?.value
    if (!value || value === label || value.startsWith('全部')) return undefined
    return value
  }

  const getExportStatusLabel = () => {
    if (state.advanced.value.status.length === 1) return state.advanced.value.status[0]
    if (state.statusTab.value !== 'all' && state.statusTab.value !== '待支付') return state.statusTab.value
    return undefined
  }

  const getExportPaymentLabel = () => {
    if (state.advanced.value.payment !== '全部状态') return state.advanced.value.payment
    if (state.statusTab.value === '待支付') return '待支付'
    return getDropdownValue('支付状态')
  }

  const orderExportSourceLabel = computed(() =>
    state.advanced.value.source !== '全部来源' ? state.advanced.value.source : getDropdownValue('订单来源'))

  const orderExportSyncNotice = computed(() => getOrderExportSyncNotice({
    demoMode: appStore.demoMode,
    sourceLabel: orderExportSourceLabel.value,
  }))

  const orderExportQuery = computed(() => buildOrderExportQuery({
    selectedTimeType: state.selectedTimeType.value,
    startDate: state.activeStartDate.value,
    endDate: state.activeEndDate.value,
    storeName: state.storeNameForOrderScope.value,
    sourceLabel: orderExportSourceLabel.value,
    paymentLabel: getExportPaymentLabel(),
    statusLabel: getExportStatusLabel(),
    keyword: state.effectiveSearchQuery.value,
    stores: appStore.stores,
  }))

  const unsupportedOrderExportFilters = computed(() => getUnsupportedOrderExportFilters({
    selectedTimeType: state.selectedTimeType.value,
    keyword: state.effectiveSearchQuery.value,
    serviceLabel: state.advanced.value.service !== '全部服务' ? state.advanced.value.service : getDropdownValue('服务类型'),
    methodLabel: state.advanced.value.method,
    amountMin: state.advanced.value.amountMin,
    amountMax: state.advanced.value.amountMax,
    statusLabels: state.advanced.value.status,
  }))

  const canExportOrders = computed(() =>
    !appStore.demoMode && state.filteredOrders.value.length > 0 && unsupportedOrderExportFilters.value.length === 0)

  const orderExportTitle = computed(() => {
    if (appStore.demoMode) return 'Demo 模式不可导出，请连接 API 后使用真实 yy_order 导出'
    if (unsupportedOrderExportFilters.value.length) {
      return `${unsupportedOrderExportFilters.value.join('、')}暂不支持等价导出，请清除后再导出`
    }
    if (!state.filteredOrders.value.length) return '当前筛选无订单可导出'
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
    if (!state.filteredOrders.value.length || exportingOrders.value) return
    exportingOrders.value = true
    try {
      const result = await appStore.exportOrders(orderExportQuery.value)
      const fallbackName = `yy_order_${format(new Date(), 'yyyyMMddHHmmss')}.xlsx`
      downloadOrderBlob(result.blob, result.fileName || fallbackName)
      notifyOrderAction('success', `已发起导出：${state.filteredOrders.value.length} 条订单`)
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败'
      notifyOrderAction('error', `导出失败：${message}`)
    } finally {
      exportingOrders.value = false
    }
  }

  return {
    exportingOrders,
    orderExportSyncNotice,
    unsupportedOrderExportFilters,
    canExportOrders,
    orderExportTitle,
    exportOrders,
  }
}
