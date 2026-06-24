import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import {
  backendApi,
  type DashboardConversionDto,
  type DashboardProductRankingDto,
} from '../../shared/api/backend'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { appDerived, appStore, type BookingOrder, type SelectionLink } from '../../shared/stores/appStore'
import { buildOrderStatusGroupCounts } from '../orders/orderOperations'
import { buildEntryPayload } from '../tools/shareLinkOperations'

type UseDashboardBusinessInsightsOptions = {
  selectedDateValue: ComputedRef<string>
  selectedDashboardStoreId: Ref<string>
  selectedDashboardStoreBackendId: ComputedRef<string>
  scopedLedgerOrders: ComputedRef<BookingOrder[]>
  resolveOrderForSelectionLink: (link: SelectionLink) => BookingOrder | undefined
  matchesDashboardDate: (order: BookingOrder, date: string) => boolean
  formatDateKey: (date: Date) => string
  toDateFromKey: (value: string) => Date
  buildWorkbenchUrl: (path: string, query?: Record<string, string | undefined>) => string
}

const centsToDisplayAmount = (value: number) => Math.round((value || 0) / 100)

const formatRateText = (rate: number) => `${Math.round(rate * 100)}%`

const buildSelectionEntry = (
  selectedStoreBackendId: string,
  resolveOrderForSelectionLink: (link: SelectionLink) => BookingOrder | undefined,
) => {
  const link = appStore.selectionLinks.find(item => {
    const order = resolveOrderForSelectionLink(item)
    return selectedStoreBackendId ? order?.storeBackendId === selectedStoreBackendId : true
  }) ?? appStore.selectionLinks[0]
  return link
}

export const useDashboardBusinessInsights = ({
  selectedDateValue,
  selectedDashboardStoreId,
  selectedDashboardStoreBackendId,
  scopedLedgerOrders,
  resolveOrderForSelectionLink,
  matchesDashboardDate,
  formatDateKey,
  toDateFromKey,
  buildWorkbenchUrl,
}: UseDashboardBusinessInsightsOptions) => {
  const productRankingData = ref<DashboardProductRankingDto | null>(null)
  const conversionData = ref<DashboardConversionDto | null>(null)
  const dashboardDataLoading = ref(false)
  const dashboardFinanceRequested = ref(false)
  const dashboardFinanceError = ref('')

  const businessDateMode = ref<'today' | 'yesterday'>('today')
  const productRankingMode = ref<'byOrderCount' | 'byAmount'>('byOrderCount')

  const businessDateKey = computed(() => {
    if (businessDateMode.value === 'today') return selectedDateValue.value
    const date = toDateFromKey(selectedDateValue.value)
    date.setDate(date.getDate() - 1)
    return formatDateKey(date)
  })

  const businessDateLabel = computed(() => {
    const date = toDateFromKey(businessDateKey.value)
    return `${date.getMonth() + 1} 月 ${date.getDate()} 日${businessDateMode.value === 'yesterday' ? '（昨天）' : ''}`
  })

  const businessDateScopeLabel = computed(() =>
    `${businessDateKey.value} · ${businessDateMode.value === 'today' ? '今天' : '昨天'}经营概况`,
  )

  const businessDateOrders = computed(() =>
    scopedLedgerOrders.value.filter(order => matchesDashboardDate(order, businessDateKey.value)),
  )

  const dashboardFinanceDate = computed(() => appStore.dashboardFinance?.date ?? '')
  const dashboardFinanceStoreId = computed(() => appStore.dashboardFinance?.storeBackendId ?? undefined)
  const dashboardFinanceMatchesScope = computed(() =>
    dashboardFinanceDate.value === businessDateKey.value
    && dashboardFinanceStoreId.value === selectedDashboardStoreBackendId.value,
  )

  watch([businessDateKey, selectedDashboardStoreId], async ([date]) => {
    if (appStore.demoMode || dashboardFinanceMatchesScope.value) return
    dashboardFinanceRequested.value = true
    dashboardFinanceError.value = ''
    try {
      await appStore.loadDashboardFinance(date, selectedDashboardStoreBackendId.value)
    } catch (error) {
      dashboardFinanceError.value = error instanceof Error ? error.message : '首页经营概况读取失败'
    }
  })

  const loadDashboardPhase2Data = async () => {
    if (appStore.demoMode) return
    dashboardDataLoading.value = true
    try {
      const [ranking, conversion] = await Promise.all([
        backendApi.dashboardProductRanking({
          date: businessDateKey.value,
          storeId: selectedDashboardStoreBackendId.value || undefined,
          topN: 10,
        }),
        backendApi.dashboardConversion({
          date: businessDateKey.value,
          storeId: selectedDashboardStoreBackendId.value || undefined,
        }),
      ])
      productRankingData.value = ranking
      conversionData.value = conversion
    } catch {
      productRankingData.value = null
      conversionData.value = null
    } finally {
      dashboardDataLoading.value = false
    }
  }

  const financeOverview = computed(() => {
    const backendFinance = appStore.dashboardFinance
    if (backendFinance && dashboardFinanceMatchesScope.value) {
      return {
        hasBackendFinanceApi: true,
        actualIncome: centsToDisplayAmount(backendFinance.actualIncomeCent),
        expectedIncome: centsToDisplayAmount(backendFinance.expectedIncomeCent),
        productAmount: centsToDisplayAmount(backendFinance.productAmountCent),
        discountAmount: centsToDisplayAmount(backendFinance.discountAmountCent),
        orderAmount: centsToDisplayAmount(backendFinance.orderAmountCent),
        refundAmount: centsToDisplayAmount(backendFinance.refundAmountCent),
        orderCount: backendFinance.orderCount,
        warningMessage: '',
      }
    }

    const dayOrders = businessDateOrders.value
    const paidOrders = dayOrders.filter(order => order.payment === '已支付')
    const refundedOrders = dayOrders.filter(order => order.payment === '已退款')
    const actualIncome = paidOrders.reduce((sum, order) => sum + order.amount, 0)
    const expectedIncome = dayOrders
      .filter(order => order.payment !== '已退款')
      .reduce((sum, order) => sum + order.amount, 0)
    const orderAmount = dayOrders.reduce((sum, order) => sum + order.amount, 0)
    const refundAmount = refundedOrders.reduce((sum, order) => sum + order.amount, 0)

    return {
      hasBackendFinanceApi: false,
      actualIncome,
      expectedIncome,
      productAmount: orderAmount,
      discountAmount: 0,
      orderAmount,
      refundAmount,
      orderCount: dayOrders.length,
      warningMessage: appStore.demoMode
        ? '当前为 Demo 数据。接入 API 后会切到真实首页经营汇总。'
        : `首页经营概况接口暂不可用，当前展示为本地订单缓存估算。${dashboardFinanceError.value ? `原因：${dashboardFinanceError.value}` : ''}`,
    }
  })

  const serviceOrderBreakdown = computed(() => {
    const backendFinance = appStore.dashboardFinance
    if (backendFinance && dashboardFinanceMatchesScope.value) {
      return [
        { label: '总订单', count: backendFinance.orderCount },
        { label: '待服务', count: backendFinance.pendingOrderCount },
        { label: '服务中', count: backendFinance.servingOrderCount },
        { label: '已完成', count: backendFinance.completedOrderCount },
        { label: '已取消', count: backendFinance.canceledOrderCount },
      ]
    }

    const groups = buildOrderStatusGroupCounts(businessDateOrders.value)
    return [
      { label: '总订单', count: groups.find(item => item.key === 'all')?.count ?? 0 },
      ...groups
        .filter(item => item.key !== 'all' && item.key !== '待支付')
        .map(item => ({ label: item.label, count: item.count })),
    ]
  })

  const localProductRanking = computed(() => {
    const buckets = new Map<string, { product: string; count: number; amount: number }>()
    for (const order of businessDateOrders.value) {
      const key = order.service || '未指定产品'
      const bucket = buckets.get(key) ?? { product: key, count: 0, amount: 0 }
      bucket.count += 1
      bucket.amount += order.amount
      buckets.set(key, bucket)
    }
    return [...buckets.values()]
      .sort((left, right) => right.count - left.count)
      .slice(0, 10)
      .map((row, index) => ({
        rank: index + 1,
        productName: row.product,
        product: row.product,
        value: row.count,
        count: row.count,
        amount: row.amount,
      }))
  })

  const effectiveProductRanking = computed(() => {
    if (!productRankingData.value) return localProductRanking.value

    const source = productRankingMode.value === 'byAmount'
      ? productRankingData.value.byAmount
      : productRankingData.value.byOrderCount
    return source.map(item => ({
      rank: item.rank,
      productName: item.productName,
      product: item.productName,
      value: productRankingMode.value === 'byAmount'
        ? centsToDisplayAmount(item.amountCents)
        : item.orderCount,
      count: item.orderCount,
      amount: centsToDisplayAmount(item.amountCents),
    }))
  })

  const conversionDisplay = computed(() => {
    if (conversionData.value) {
      return {
        bookedCount: conversionData.value.bookedCount,
        paidCount: conversionData.value.paidCount,
        arrivedCount: conversionData.value.arrivedCount,
        completedCount: conversionData.value.completedCount,
        paidRate: formatRateText(conversionData.value.paidRate),
        arrivedRate: formatRateText(conversionData.value.arrivedRate),
        completedRate: formatRateText(conversionData.value.completedRate),
      }
    }

    const orders = businessDateOrders.value
    const bookedCount = orders.length
    const paidCount = orders.filter(order => order.payment === '已支付').length
    const arrivedCount = orders.filter(order => ['已到店', '服务中', '已完成'].includes(order.status)).length
    const completedCount = orders.filter(order => order.status === '已完成').length

    return {
      bookedCount,
      paidCount,
      arrivedCount,
      completedCount,
      paidRate: bookedCount ? formatRateText(paidCount / bookedCount) : '0%',
      arrivedRate: paidCount ? formatRateText(arrivedCount / paidCount) : '0%',
      completedRate: arrivedCount ? formatRateText(completedCount / arrivedCount) : '0%',
    }
  })

  const quickEntries = computed(() => {
    const primaryStoreId = selectedDashboardStoreBackendId.value || appStore.stores[0]?.backendId || ''
    const bookingUrl = primaryStoreId
      ? buildEntryPayload({ storeId: primaryStoreId, entryType: 'BOOKING', channel: 'WECHAT' }).h5Url
      : ''
    const pickupUrl = primaryStoreId
      ? buildEntryPayload({ storeId: primaryStoreId, entryType: 'PICKUP', channel: 'WECHAT' }).h5Url
      : ''
    const selectionLink = buildSelectionEntry(primaryStoreId, resolveOrderForSelectionLink)

    return [
      {
        key: 'booking',
        label: '预约入口',
        url: bookingUrl,
        hint: '客户小程序 / H5 预约地址',
      },
      {
        key: 'selection',
        label: '选片入口',
        url: selectionLink?.url || buildWorkbenchUrl('/service/selection'),
        hint: selectionLink ? '客户在线选片真实入口' : '暂无真实选片链接，点击前往选片工具页',
      },
      {
        key: 'pickup',
        label: '取片入口',
        url: pickupUrl,
        hint: '客户取片与查单地址',
      },
    ]
  })

  const { copiedKey: copiedEntryKey, copyText: copyEntryText } = useCopyWithState()
  const copyEntryUrl = async (key: string, url: string) => {
    if (!url) return
    await copyEntryText(url, key)
  }

  const anomalyPreStats = computed(() => appDerived.anomalyPreStats.value)
  const syncStatusClass = computed(() => {
    const status = appStore.lastDouyinLifeOrderSync?.syncStatus
    if (status === 'SUSPICIOUS' || status === 'FAILED') return 'text-red-400'
    if (status === 'SYNCED' || status === 'PARTIAL') return 'text-amber-400'
    return 'text-emerald-400'
  })
  const syncStatusLabel = computed(() => {
    const status = appStore.lastDouyinLifeOrderSync?.syncStatus || 'N/A'
    if (status === 'SUSPICIOUS') return '触发上限'
    if (status === 'FAILED') return '同步失败'
    if (status === 'PARTIAL') return '部分成功'
    return status
  })

  return {
    businessDateMode,
    businessDateKey,
    businessDateLabel,
    businessDateScopeLabel,
    businessDateOrders,
    dashboardFinanceDate,
    dashboardFinanceStoreId,
    dashboardFinanceMatchesScope,
    productRankingData,
    conversionData,
    dashboardDataLoading,
    loadDashboardPhase2Data,
    financeOverview,
    serviceOrderBreakdown,
    productRankingMode,
    effectiveProductRanking,
    conversionDisplay,
    quickEntries,
    copiedEntryKey,
    copyEntryUrl,
    anomalyPreStats,
    syncStatusClass,
    syncStatusLabel,
    dashboardFinanceRequested,
  }
}
