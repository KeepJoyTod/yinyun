import { computed, ref, watch, type ComputedRef } from 'vue'
import type { BackendId } from '../../../../shared/api/backendId'
import { appStore, type BookingOrder, type CustomerInfo } from '../../../../shared/stores/appStore'
import type { MemberOverviewInfo } from '../../../../shared/stores/appStoreTypes'
import { memberStore } from '../../../../shared/stores/memberStore'

type UseMemberConsumerAssetPreviewOptions = {
  selectedCustomer: ComputedRef<CustomerInfo | null>
  selectedCustomerId: ComputedRef<BackendId | ''>
  selectedOverview: ComputedRef<MemberOverviewInfo | null>
}

const formatMoney = (value: number) =>
  `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDateTime = (value?: string | null) => value?.trim() || '待接真实时间'

export const useMemberConsumerAssetPreview = (options: UseMemberConsumerAssetPreviewOptions) => {
  const loading = ref(false)
  const error = ref('')

  const profileFacts = computed(() => {
    const customer = options.selectedCustomer.value
    const overview = options.selectedOverview.value
    if (!customer || !overview) return []
    return [
      { label: '会员姓名', value: customer.name, hint: '消费者端基础身份信息，先复用客户档案。' },
      { label: '手机号', value: customer.mobile, hint: '后续真实消费者页需要脱敏策略。' },
      { label: '会员等级', value: overview.memberLevel || customer.memberLevel || '待配置', hint: '用于解释权益门槛与成长值关系。' },
      { label: '会员标签', value: overview.tagSummary || customer.tags.join(' / ') || '未打标签', hint: '先复用客户标签，不新建第二套标签账本。' },
      { label: '最近交易', value: formatDateTime(overview.lastTradeTime), hint: '后续接真实消费者页时可作为资产更新时间提示。' },
      { label: '备注说明', value: overview.remark || customer.remark || '暂无额外说明', hint: '只读展示，不在当前脚手架写回。' },
    ]
  })

  const assetFacts = computed(() => {
    const overview = options.selectedOverview.value
    if (!overview) return []
    return [
      { label: '会员卡', value: String(overview.activeCardCount), hint: '当前激活卡项数量。' },
      { label: '权益', value: String(overview.activeBenefitCount), hint: '当前可用权益数量。' },
      { label: '优惠券 / 兑换券', value: String(overview.activeCouponCount), hint: '当前统一复用优惠券 DTO 承接展示。' },
      { label: '余额', value: formatMoney(overview.balanceAmount), hint: '以余额流水为准，当前只展示最近明细。' },
      { label: '积分', value: String(overview.pointsBalance), hint: '后续接积分规则与抵扣说明。' },
      { label: '成长值', value: String(overview.growthValue), hint: '用于等级成长与权益门槛说明。' },
    ]
  })

  const readonlyNotes = computed(() => [
    '当前页面是只读脚手架，复用现有 memberStore 与 appStore，不新增伪接口。',
    '优惠券与兑换券说明先统一挂在 memberStore.coupons，后续如接独立兑换券接口再拆分模板与实例。',
    '余额与交易明细只展示最近订单和最近流水，不在工作台创建第二套消费者账本。',
  ])

  const recentOrders = computed<BookingOrder[]>(() => {
    const customerId = options.selectedCustomerId.value
    if (!customerId) return []
    return appStore.customerRecentOrders[customerId] ?? []
  })

  const pointsLedger = computed(() => {
    const customerId = String(options.selectedCustomerId.value)
    return memberStore.pointsLedger[customerId] ?? []
  })

  const growthLedger = computed(() => {
    const customerId = String(options.selectedCustomerId.value)
    return memberStore.growthLedger[customerId] ?? []
  })

  const balanceLedger = computed(() => {
    const customerId = String(options.selectedCustomerId.value)
    return memberStore.balanceLedger[customerId] ?? []
  })

  const reload = async () => {
    const customerId = options.selectedCustomerId.value
    if (!customerId) return
    loading.value = true
    error.value = ''
    try {
      await Promise.all([
        appStore.loadCustomerRecentOrders(customerId, 6),
        memberStore.refreshPointsLedger(customerId, 6),
        memberStore.refreshGrowthLedger(customerId, 6),
        memberStore.refreshBalanceLedger(customerId, 6),
      ])
    } catch (err) {
      error.value = err instanceof Error ? err.message : '消费者会员资产说明加载失败'
    } finally {
      loading.value = false
    }
  }

  watch(
    () => [
      options.selectedCustomerId.value,
      options.selectedOverview.value?.lastTradeTime ?? '',
      options.selectedOverview.value?.pendingRechargeCount ?? 0,
    ] as const,
    ([customerId]) => {
      if (!customerId) {
        error.value = ''
        return
      }
      void reload()
    },
    { immediate: true },
  )

  return {
    assetFacts,
    balanceLedger,
    error,
    growthLedger,
    loading,
    pointsLedger,
    profileFacts,
    readonlyNotes,
    recentOrders,
  }
}
