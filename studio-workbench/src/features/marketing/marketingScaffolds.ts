import { definePhaseModuleScaffold } from '../system/phaseModuleRegistry'

const marketingBase = {
  phase: 'Phase 2' as const,
  ownerStatus: 'ready' as const,
  domain: '营销',
  owner: 'studio-workbench/src/features/marketing',
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendMarketingApi.ts',
  ],
  ownerLayers: {
    presentation: [
      'studio-workbench/src/features/marketing/MarketingCenterView.vue',
      'studio-workbench/src/features/marketing/MarketingCouponsView.vue',
      'studio-workbench/src/features/marketing/MarketingCampaignsView.vue',
      'studio-workbench/src/features/marketing/MarketingParticipationsView.vue',
    ],
    control: [
      'studio-workbench/src/shared/api/backendMarketingApi.ts',
      'studio-workbench/src/features/marketing/promotionPricingFacade.ts',
      'studio-workbench/src/features/marketing/campaignOrderBridge.ts',
    ],
    data: [
      'yy_coupon_template',
      'yy_coupon_instance',
      'yy_coupon_grant_record',
      'yy_coupon_writeoff_record',
      'yy_campaign',
      'yy_campaign_product',
      'yy_campaign_participation',
      'yy_promotion_capability',
      'yy_promotion_trial_snapshot',
    ],
  },
}

export const marketingScaffolds = [
  definePhaseModuleScaffold({
    ...marketingBase,
    featureKey: 'marketing-center',
    title: '营销中心',
    summary: '营销能力开关、渠道承接和活动订单联动统一落到营销中心 owner。',
    nextPhase: 'Phase 2 继续补真实能力授权、活动概览指标和费用中心联动边界。',
    routes: ['/marketing/center'],
    apis: ['marketingApi.getMarketingDashboard()', 'marketingApi.listMarketingCapabilities()'],
    ledgers: ['yy_promotion_capability', 'yy_order'],
  }),
  definePhaseModuleScaffold({
    ...marketingBase,
    featureKey: 'marketing-coupons',
    title: '优惠券',
    summary: '券模板、发券记录、券实例和恢复策略统一由优惠券 owner 管理。',
    nextPhase: 'Phase 2 继续补真实模板 CRUD、发券、核销和退单恢复。',
    routes: ['/marketing/coupons'],
    apis: ['marketingApi.getCouponTemplateScaffold()'],
    ledgers: ['yy_coupon_template', 'yy_coupon_instance', 'yy_coupon_grant_record', 'yy_coupon_writeoff_record'],
  }),
  definePhaseModuleScaffold({
    ...marketingBase,
    featureKey: 'marketing-campaigns',
    title: '活动清单',
    summary: '活动、时间窗、商品绑定和上下线状态统一由活动 owner 维护。',
    nextPhase: 'Phase 2 继续补真实活动增删改查、上下线与渠道投放映射。',
    routes: ['/marketing/campaigns'],
    apis: ['marketingApi.getCampaignScaffold()'],
    ledgers: ['yy_campaign', 'yy_campaign_product', 'yy_order'],
  }),
  definePhaseModuleScaffold({
    ...marketingBase,
    featureKey: 'marketing-participations',
    title: '活动参与记录',
    summary: '客户参与、转化、退款和固定优先级试算继续归活动参与 owner。',
    nextPhase: 'Phase 2 继续补真实参与状态机、转化回写和人工排障入口。',
    routes: ['/marketing/participations'],
    apis: ['marketingApi.getCampaignParticipationScaffold()', 'marketingApi.runPromotionTrial()'],
    ledgers: ['yy_campaign_participation', 'yy_promotion_trial_snapshot', 'yy_order'],
  }),
]
