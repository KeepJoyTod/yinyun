import type {
  MarketingCampaignParticipationDto,
  MarketingCampaignScaffoldDto,
  MarketingCapabilityDto,
  MarketingCouponScaffoldDto,
  MarketingDashboardDto,
  PromotionCandidateType,
  PromotionTrialCandidateDto,
  PromotionTrialPayload,
  PromotionTrialResultDto,
} from '../../shared/api/backend'
import type { BookingOrder, CustomerInfo } from '../../shared/stores/appStore'

const money = (amountCent: number) => `¥${(amountCent / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const maskMobile = (value?: string) => {
  const text = String(value ?? '').trim()
  return text.length >= 7 ? `${text.slice(0, 3)}****${text.slice(-4)}` : text || '未留手机号'
}
const isPaid = (order: BookingOrder) => ['已支付', '部分支付'].includes(order.payment)
const isCampaignSource = (order: BookingOrder) => /抖音|美团|微信|券|活动|拼团|秒杀|砍价|分享|团购|兑换/.test(`${order.source} ${order.service}`)

export const formatMarketingMoney = money

export const buildFallbackMarketingCapabilities = (): MarketingCapabilityDto[] => [
  {
    capabilityCode: 'MARKETING_CENTER',
    capabilityName: '营销总览',
    enabled: true,
    status: 'ready',
    scopeLabel: '品牌级',
    gateCopy: '营销总览脚手架已就绪，可承接真实账本。',
  },
  {
    capabilityCode: 'COUPON_TEMPLATE',
    capabilityName: '券模板与发券',
    enabled: true,
    status: 'scaffold',
    scopeLabel: '品牌级',
    gateCopy: '券模板、发券、券实例已按模块化规范搭好脚手架，等待真实营销表灌数。',
  },
  {
    capabilityCode: 'CAMPAIGN_MANAGEMENT',
    capabilityName: '活动管理',
    enabled: true,
    status: 'scaffold',
    scopeLabel: '品牌级',
    gateCopy: '活动清单与参与记录已就绪，当前仍以统一订单做示意性聚合。',
  },
  {
    capabilityCode: 'PROMOTION_TRIAL',
    capabilityName: '优惠试算',
    enabled: true,
    status: 'scaffold',
    scopeLabel: '订单级',
    gateCopy: '固定优先级试算已接线，可展示命中规则、互斥来源和恢复策略。',
  },
]

export const buildFallbackMarketingDashboard = (orders: BookingOrder[]): MarketingDashboardDto => {
  const campaignOrders = orders.filter(isCampaignSource)
  const sources = new Map<string, BookingOrder[]>()
  for (const order of campaignOrders) {
    const source = order.source || '未标记来源'
    if (!sources.has(source)) sources.set(source, [])
    sources.get(source)!.push(order)
  }
  const sourceRows = Array.from(sources.entries())
    .map(([sourceLabel, rows]) => ({
      sourceLabel,
      orderCount: rows.length,
      paidOrderCount: rows.filter(isPaid).length,
      pendingCount: rows.filter(row => !isPaid(row)).length,
      paidAmountCent: rows.reduce((sum, row) => sum + (isPaid(row) ? row.amount * 100 : 0), 0),
    }))
    .sort((left, right) => right.orderCount - left.orderCount)

  return {
    status: 'scaffold',
    boundary: '营销总览脚手架当前继续聚合 yy_order 来源与支付信息，不复制订单主账本。',
    metrics: [
      { metricCode: 'campaignOrderCount', label: '活动相关订单', value: String(campaignOrders.length), hint: '活动/券/渠道来源命中的统一订单数量。' },
      { metricCode: 'paidOrderCount', label: '已支付转化', value: String(campaignOrders.filter(isPaid).length), hint: '已支付或部分支付的活动相关订单。' },
      { metricCode: 'sourceCount', label: '来源渠道', value: String(sourceRows.length), hint: '当前聚合到的营销来源数量。' },
      { metricCode: 'pendingCount', label: '待跟进', value: String(campaignOrders.filter(row => !isPaid(row)).length), hint: '仍需支付、确认或回访的活动相关订单。' },
    ],
    channels: sourceRows,
  }
}

export const buildFallbackCouponScaffold = (
  orders: BookingOrder[],
  customers: CustomerInfo[],
): MarketingCouponScaffoldDto => {
  const relevantOrders = orders.filter(isCampaignSource).slice(0, 4)
  const customerPool = customers.slice(0, 4)
  return {
    status: 'scaffold',
    boundary: '券模板、发券记录和券实例为真实营销域预留结构；当前示意数据由订单和客户侧信息拼装，不写第二账本。',
    templates: [
      {
        templateId: 'coupon-cash-01',
        templateName: '新客立减券',
        templateType: 'CASH',
        status: 'scaffold',
        storeScopeLabel: relevantOrders[0]?.store || '全门店',
        productScopeLabel: relevantOrders[0]?.service || '全服务产品',
        faceValueCent: 3000,
        stackedWith: '与优惠码互斥；不与权益叠加',
        restoreOnRefund: true,
        issuedCount: Math.max(relevantOrders.length, 3),
        writeoffCount: Math.min(relevantOrders.length, 2),
        expiresAt: '2026-12-31',
      },
      {
        templateId: 'coupon-redeem-01',
        templateName: '兑换券脚手架',
        templateType: 'REDEEM',
        status: 'scaffold',
        storeScopeLabel: '指定门店',
        productScopeLabel: relevantOrders[1]?.service || '指定套餐',
        faceValueCent: 9900,
        stackedWith: '命中后直接替代指定商品价格',
        restoreOnRefund: true,
        issuedCount: 2,
        writeoffCount: 0,
        expiresAt: '2026-10-01',
      },
    ],
    grantRecords: customerPool.map((customer, index) => ({
      grantId: `grant-${index + 1}`,
      templateId: index % 2 === 0 ? 'coupon-cash-01' : 'coupon-redeem-01',
      templateName: index % 2 === 0 ? '新客立减券' : '兑换券脚手架',
      targetCustomer: customer.name,
      targetMobile: maskMobile(customer.mobile),
      grantSource: index % 2 === 0 ? '商家发券' : '活动自动发券',
      status: 'scaffold',
    })),
    instances: customerPool.map((customer, index) => ({
      instanceId: `instance-${index + 1}`,
      templateId: index % 2 === 0 ? 'coupon-cash-01' : 'coupon-redeem-01',
      templateName: index % 2 === 0 ? '新客立减券' : '兑换券脚手架',
      holderName: customer.name,
      status: index === 0 ? 'USED' : index === 1 ? 'RESTORE_PENDING' : 'UNUSED',
      orderId: relevantOrders[index]?.id,
      expiresAt: '2026-12-31',
    })),
  }
}

export const buildFallbackCampaignScaffold = (orders: BookingOrder[]): MarketingCampaignScaffoldDto => {
  const dashboard = buildFallbackMarketingDashboard(orders)
  const primaryStore = orders[0]?.store || '全门店'
  return {
    status: 'scaffold',
    boundary: '活动清单脚手架保留真实活动表结构，当前统计先用统一订单来源示意活动承接量。',
    sources: dashboard.channels,
    campaigns: [
      {
        campaignId: 'campaign-seckill-01',
        campaignName: '证件照秒杀首发',
        campaignType: 'SECKILL',
        status: 'scaffold',
        storeScopeLabel: primaryStore,
        productScopeLabel: orders[0]?.service || '证件照',
        timeRangeLabel: '2026-06-24 ~ 2026-07-24',
        participantCount: dashboard.metrics[0] ? Number(dashboard.metrics[0].value) : 0,
        orderCount: dashboard.channels[0]?.orderCount || 0,
        paidAmountCent: dashboard.channels[0]?.paidAmountCent || 0,
      },
      {
        campaignId: 'campaign-groupbuy-01',
        campaignName: '拼团裂变脚手架',
        campaignType: 'GROUP_BUY',
        status: 'scaffold',
        storeScopeLabel: primaryStore,
        productScopeLabel: orders[1]?.service || '家庭套餐',
        timeRangeLabel: '2026-06-24 ~ 2026-08-01',
        participantCount: dashboard.channels[1]?.orderCount || 0,
        orderCount: dashboard.channels[1]?.orderCount || 0,
        paidAmountCent: dashboard.channels[1]?.paidAmountCent || 0,
      },
    ],
  }
}

export const buildFallbackParticipations = (
  orders: BookingOrder[],
  customers: CustomerInfo[],
): MarketingCampaignParticipationDto[] =>
  orders
    .filter(isCampaignSource)
    .slice(0, 8)
    .map((order, index) => {
      const customer = customers.find(item => item.mobile === order.phone)
      const stage = order.payment === '已退款'
        ? '已退款'
        : isPaid(order)
          ? '已转化'
          : index % 2 === 0
            ? '待跟进'
            : '待转化'
      return {
        participationId: `participation-${order.id}`,
        campaignId: index % 2 === 0 ? 'campaign-seckill-01' : 'campaign-groupbuy-01',
        campaignName: index % 2 === 0 ? '证件照秒杀首发' : '拼团裂变脚手架',
        customerName: order.customer || customer?.name || '未命名客户',
        customerMobile: maskMobile(order.phone || customer?.mobile),
        channelLabel: order.source || '未标记来源',
        orderId: order.id,
        stage,
        payableAmountCent: order.amount * 100,
        finalAmountCent: isPaid(order) ? Math.max(order.amount * 100 - 3000, 0) : order.amount * 100,
        nextAction: stage === '待跟进' ? '优先跟进支付和到店确认。' : stage === '已退款' ? '核对退单恢复与客户回访。' : '继续跟进服务履约与复购。',
      }
    })

const buildCandidate = (
  candidateId: string,
  candidateType: PromotionCandidateType,
  title: string,
  priority: number,
  originalAmountCent: number,
  discountAmountCent: number,
  applicable: boolean,
  reason?: string,
): PromotionTrialCandidateDto => ({
  candidateId,
  candidateType,
  title,
  applicable,
  priority,
  discountAmountCent: applicable ? discountAmountCent : 0,
  finalAmountCent: applicable ? Math.max(0, originalAmountCent - discountAmountCent) : originalAmountCent,
  reason,
})

const resolveAppliedCandidate = (candidates: PromotionTrialCandidateDto[]) =>
  candidates
    .filter(candidate => candidate.applicable)
    .sort((left, right) => left.priority - right.priority || right.discountAmountCent - left.discountAmountCent)[0]

export const buildFallbackPromotionTrial = (payload: PromotionTrialPayload): PromotionTrialResultDto => {
  const originalAmountCent = Math.max(0, payload.originalAmountCent || 0)
  const sourceText = `${payload.orderSource || ''} ${payload.productName || ''}`
  const voucherEligible = /兑换/.test(sourceText)
  const campaignEligible = /抖音|美团|活动|拼团|秒杀|砍价|分享/.test(sourceText)
  const couponEligible = originalAmountCent >= 10000
  const codeEligible = originalAmountCent >= 8000
  const cardEligible = /VIP|高级/.test(payload.customerLevel || '') || originalAmountCent >= 30000

  const candidates = [
    buildCandidate('redeem-voucher', 'REDEEM_VOUCHER', '兑换券抵扣', 1, originalAmountCent, originalAmountCent, voucherEligible, '仅适用于兑换类商品或入口'),
    buildCandidate('campaign-best-price', 'CAMPAIGN', '活动最优价', 2, originalAmountCent, Math.min(5000, Math.round(originalAmountCent * 0.2)), campaignEligible, '当前订单未命中活动类入口'),
    buildCandidate('coupon-template', 'COUPON', '优惠券', 3, originalAmountCent, 3000, couponEligible, '满 100 元可用'),
    buildCandidate('coupon-code', 'COUPON_CODE', '优惠码', 3, originalAmountCent, 2000, codeEligible, '满 80 元可用'),
    buildCandidate('card-right', 'CARD_RIGHT', '次卡/共享次卡/卡项权益', 4, originalAmountCent, 5000, cardEligible, '仅高等级或高客单订单示意'),
  ]

  const applied = resolveAppliedCandidate(candidates)
  if (!applied) {
    return {
      status: 'blocked',
      originalAmountCent,
      finalAmountCent: originalAmountCent,
      discountAmountCent: 0,
      restorePolicy: '未命中优惠，不产生恢复动作。',
      blockedReasons: candidates.filter(candidate => !candidate.applicable).map(candidate => candidate.reason || `${candidate.title} 不可用`),
      candidates,
    }
  }

  const normalizedCandidates = candidates.map(candidate => {
    if (candidate.candidateId === applied.candidateId) return candidate
    if (!candidate.applicable) return candidate
    if (candidate.priority >= applied.priority) {
      return {
        ...candidate,
        applicable: false,
        conflictSource: applied.title,
        reason: `与 ${applied.title} 互斥，按固定优先级未命中。`,
      }
    }
    return candidate
  })

  return {
    status: 'eligible',
    appliedRuleCode: applied.candidateType,
    originalAmountCent,
    finalAmountCent: applied.finalAmountCent,
    discountAmountCent: applied.discountAmountCent,
    conflictSource: applied.title,
    restorePolicy: '仅恢复已核销且允许退单恢复的券/权益；已过期或失效实例不恢复。',
    blockedReasons: normalizedCandidates.filter(candidate => !candidate.applicable && candidate.reason).map(candidate => candidate.reason as string),
    candidates: normalizedCandidates,
  }
}
