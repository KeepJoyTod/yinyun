import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useCopyWithState } from '../../shared/composables/useCopyWithState'
import { appDerived, appStore, type BookingOrder } from '../../shared/stores/appStore'
import { buildOrderStatusGroupCounts } from '../orders/orderOperations'

type UseDashboardBusinessInsightsOptions = {
  selectedDateValue: ComputedRef<string>
  selectedDashboardStoreId: Ref<string>
  selectedDashboardStoreBackendId: ComputedRef<string>
  scopedLedgerOrders: ComputedRef<BookingOrder[]>
  matchesDashboardDate: (order: BookingOrder, date: string) => boolean
  formatDateKey: (date: Date) => string
  toDateFromKey: (value: string) => Date
  buildWorkbenchUrl: (path: string, query?: Record<string, string | undefined>) => string
}

type ProductRankingRow = {
  rank: number
  productName: string
  value: number
}

type ProductRankingDto = {
  byOrderCount: ProductRankingRow[]
  byAmount: ProductRankingRow[]
}

type ConversionDto = {
  visitCount: number
  submitCount: number
  paidCount: number
  arrivedCount: number
  submitRate: number
  paidRate: number
  arrivedRate: number
}

type EntryLinkDto = {
  storeId: string
  storeName: string
  linkType: string
  linkUrl: string
}

const centsToDisplayAmount = (value: number) => Math.round((value || 0) / 100)

export const useDashboardBusinessInsights = ({
  selectedDateValue,
  selectedDashboardStoreId,
  selectedDashboardStoreBackendId,
  scopedLedgerOrders,
  matchesDashboardDate,
  formatDateKey,
  toDateFromKey,
  buildWorkbenchUrl,
}: UseDashboardBusinessInsightsOptions) => {
  const productRankingData = ref<ProductRankingDto | null>(null)
  const conversionData = ref<ConversionDto | null>(null)
  const entryLinksData = ref<EntryLinkDto[]>([])
  const dashboardDataLoading = ref(false)

  // 今日/昨日切换（对齐 yuyue123 经营概况）
  const businessDateMode = ref<'today' | 'yesterday'>('today')
  const businessDateKey = computed(() => {
    if (businessDateMode.value === 'today') return selectedDateValue.value
    const d = toDateFromKey(selectedDateValue.value)
    d.setDate(d.getDate() - 1)
    return formatDateKey(d)
  })
  const businessDateScopeLabel = computed(() => `${businessDateKey.value} · ${businessDateMode.value === 'today' ? '今天' : '昨天'}经营概况`)
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
    try {
      await appStore.loadDashboardFinance(date, selectedDashboardStoreBackendId.value)
    } catch {
      // 经营概况仍可使用本地订单缓存回退，避免单一统计接口影响首页主体。
    }
  })

  const loadDashboardPhase2Data = async () => {
    if (appStore.demoMode) return
    dashboardDataLoading.value = true
    try {
      productRankingData.value = null
      conversionData.value = null
      entryLinksData.value = []
    } catch {
      // Phase 2 data is optional enhancement; local fallback remains available
    } finally {
      dashboardDataLoading.value = false
    }
  }

  // 经营概况财务口径：优先使用后端 yy_order 聚合，失败时回退本地订单缓存
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
      }
    }

    const dayOrders = businessDateOrders.value
    const paidOrders = dayOrders.filter(o => o.payment === '已支付')
    const refundedOrders = dayOrders.filter(o => o.payment === '已退款')
    const actualIncome = paidOrders.reduce((sum, o) => sum + o.amount, 0)
    const expectedIncome = dayOrders
      .filter(o => o.payment !== '已退款')
      .reduce((sum, o) => sum + o.amount, 0)
    const orderAmount = dayOrders.reduce((sum, o) => sum + o.amount, 0)
    const refundAmount = refundedOrders.reduce((sum, o) => sum + o.amount, 0)
    const hasBackendFinanceApi = false
    return {
      hasBackendFinanceApi,
      actualIncome,
      expectedIncome,
      productAmount: orderAmount, // 无商品金额独立口径，暂用订单金额
      discountAmount: 0, // 无优惠减免口径
      orderAmount,
      refundAmount,
      orderCount: dayOrders.length,
    }
  })

  // 服务订单状态分项（待服务/服务中/已完成/已取消）
  const serviceOrderBreakdown = computed(() => {
    const groups = buildOrderStatusGroupCounts(businessDateOrders.value)
    return [
      { label: '总订单', count: groups.find(item => item.key === 'all')?.count ?? 0 },
      ...groups.filter(item => item.key !== 'all' && item.key !== '待支付').map(item => ({
        label: item.label,
        count: item.count,
      })),
    ]
  })

  // 产品排行：按 product 分布（对齐 yuyue123 预约服务产品分布）
  const productRanking = computed(() => {
    const buckets = new Map<string, { product: string; count: number; amount: number }>()
    for (const order of businessDateOrders.value) {
      const key = order.service || '未指定产品'
      const bucket = buckets.get(key) ?? { product: key, count: 0, amount: 0 }
      bucket.count += 1
      bucket.amount += order.amount
      buckets.set(key, bucket)
    }
    const rows = [...buckets.values()].sort((a, b) => b.count - a.count).slice(0, 5)
    return rows.map((row, idx) => ({ rank: idx + 1, ...row }))
  })

  // Phase 2: 后端产品排行双榜 + 转化率 + 入群链接
  const productRankingMode = ref<'byOrderCount' | 'byAmount'>('byOrderCount')

  const effectiveProductRanking = computed(() => {
    if (productRankingData.value) {
      const source = productRankingMode.value === 'byAmount'
        ? productRankingData.value.byAmount
        : productRankingData.value.byOrderCount
      return source.map(item => ({
        rank: item.rank,
        productName: item.productName,
        product: item.productName,
        value: item.value,
        count: productRankingMode.value === 'byOrderCount' ? item.value : 0,
        amount: productRankingMode.value === 'byAmount' ? item.value : 0,
      }))
    }
    return productRanking.value.map(row => ({
      rank: row.rank,
      productName: row.product,
      product: row.product,
      value: row.count,
      count: row.count,
      amount: row.amount,
    }))
  })

  const conversionDisplay = computed(() => {
    const data = conversionData.value
    const fmt = (rate: number) => `${Math.round(rate * 100)}%`
    if (data) {
      return {
        visitCount: data.visitCount,
        submitCount: data.submitCount,
        paidCount: data.paidCount,
        arrivedCount: data.arrivedCount,
        submitRate: fmt(data.submitRate),
        paidRate: fmt(data.paidRate),
        arrivedRate: fmt(data.arrivedRate),
      }
    }
    const orders = businessDateOrders.value
    const visitCount = orders.length
    const submitCount = orders.filter(o => o.status !== '已取消').length
    const paidCount = orders.filter(o => o.payment === '已支付').length
    const arrivedCount = orders.filter(o => ['已到店', '服务中', '已完成'].includes(o.status)).length
    return {
      visitCount,
      submitCount,
      paidCount,
      arrivedCount,
      submitRate: visitCount ? fmt(submitCount / visitCount) : '0%',
      paidRate: submitCount ? fmt(paidCount / submitCount) : '0%',
      arrivedRate: paidCount ? fmt(arrivedCount / paidCount) : '0%',
    }
  })

  // 快捷入口：优先使用后端 entryLinks 数据，否则回退到工作台真实路由
  const quickEntries = computed(() => {
    if (entryLinksData.value.length > 0) {
      return entryLinksData.value.map(link => ({
        key: `${link.storeId}-${link.linkType}`,
        label: `${link.storeName} ${link.linkType}`,
        url: link.linkUrl,
        hint: link.linkType === '预约' ? '客户预约地址' : link.linkType === '选片' ? '客户在线选片入口' : '客户取片与查单地址',
      }))
    }
    const primaryStoreId = selectedDashboardStoreBackendId.value ?? appStore.stores[0]?.backendId
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

  // 异常概览
  const anomalyPreStats = computed(() => appDerived.anomalyPreStats.value)
  const syncStatusClass = computed(() => {
    const s = appStore.lastDouyinLifeOrderSync?.syncStatus
    if (s === 'SUSPICIOUS' || s === 'FAILED') return 'text-red-400'
    if (s === 'SYNCED' || s === 'PARTIAL') return 'text-amber-400'
    return 'text-emerald-400'
  })
  const syncStatusLabel = computed(() => {
    const s = appStore.lastDouyinLifeOrderSync?.syncStatus || 'N/A'
    if (s === 'SUSPICIOUS') return '触发上限'
    if (s === 'FAILED') return '同步失败'
    if (s === 'PARTIAL') return '部分成功'
    return s
  })

  return {
    businessDateMode,
    businessDateKey,
    businessDateScopeLabel,
    businessDateOrders,
    dashboardFinanceDate,
    dashboardFinanceStoreId,
    dashboardFinanceMatchesScope,
    productRankingData,
    conversionData,
    entryLinksData,
    dashboardDataLoading,
    loadDashboardPhase2Data,
    financeOverview,
    serviceOrderBreakdown,
    productRanking,
    productRankingMode,
    effectiveProductRanking,
    conversionDisplay,
    quickEntries,
    copiedEntryKey,
    copyEntryUrl,
    anomalyPreStats,
    syncStatusClass,
    syncStatusLabel,
  }
}
