import { definePhaseModuleScaffold } from '../system/phaseModuleRegistry'

const memberBaseContracts = [
  'docs/contracts/full-product-closed-loop-contract.md',
  'studio-workbench/src/shared/api/backendMemberApi.ts',
]

const memberBaseOwners = {
  presentation: [
    'studio-workbench/src/features/member/CustomersView.vue',
    'studio-workbench/src/features/member/DerivedMemberModuleView.vue',
  ],
  control: [
    'studio-workbench/src/shared/api/backendMemberApi.ts',
    'studio-workbench/src/shared/stores/memberStore.ts',
  ],
  data: [
    'yy_customer',
    'yy_order',
    'yy_member_account',
    'yy_member_card_instance',
    'yy_member_balance_ledger',
  ],
}

export const memberScaffolds = [
  definePhaseModuleScaffold({
    featureKey: 'member-customers',
    phase: 'Phase 2',
    ownerStatus: 'ready',
    domain: '会员',
    title: '客户档案',
    summary: '客户资料、来源、订单、相册与会员资产入口继续归客户域统一 owner。',
    owner: 'studio-workbench/src/features/member',
    nextPhase: 'Phase 2 继续把会员资产、充值、标签和消费明细统一回收到客户档案链路。',
    routes: ['/member/customers'],
    contracts: memberBaseContracts,
    apis: ['backendApi.listCustomers()', 'memberApi.getMemberOverview()'],
    ledgers: ['yy_customer', 'yy_order', 'yy_photo_album'],
    ownerLayers: {
      ...memberBaseOwners,
      presentation: [...memberBaseOwners.presentation, 'studio-workbench/src/features/member/CustomersView.vue'],
    },
  }),
  definePhaseModuleScaffold({
    featureKey: 'member-accounts',
    phase: 'Phase 2',
    ownerStatus: 'ready',
    domain: '会员',
    title: '会员账户',
    summary: '会员账户 owner 已独立到资产视图，统一承接卡项、权益、优惠券、积分、成长值和余额摘要。',
    owner: 'studio-workbench/src/features/member/modules/assets',
    nextPhase: 'Phase 2 继续补充值、退款回滚、权益核销和会员卡写链路。',
    routes: ['/member/accounts'],
    contracts: memberBaseContracts,
    apis: [
      'memberApi.getMemberOverview()',
      'memberApi.listMemberCards()',
      'memberApi.listMemberBenefits()',
      'memberApi.listMemberCoupons()',
      'memberApi.listMemberRechargeOrders()',
      'memberApi.createMemberRechargeOrder()',
      'memberApi.confirmMemberRechargeOrder()',
    ],
    ledgers: [
      'yy_member_account',
      'yy_member_card_instance',
      'yy_member_benefit_ledger',
      'yy_member_balance_ledger',
      'yy_member_recharge_order',
    ],
    ownerLayers: {
      presentation: ['studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue'],
      control: [
        'studio-workbench/src/features/member/modules/assets/useMemberAssetOverview.ts',
        'studio-workbench/src/features/member/modules/assets/useMemberRecharge.ts',
        'studio-workbench/src/shared/api/backendMemberApi.ts',
        'studio-workbench/src/shared/stores/memberRechargeStore.ts',
      ],
      data: [
        'yy_member_account',
        'yy_member_card_instance',
        'yy_member_benefit_ledger',
        'yy_member_balance_ledger',
        'yy_member_recharge_order',
      ],
    },
  }),
  definePhaseModuleScaffold({
    featureKey: 'member-tags',
    phase: 'Phase 2',
    ownerStatus: 'derived',
    domain: '会员',
    title: '客户标签',
    summary: '标签继续走派生视图，避免在工作台创建第二套会员标签账本。',
    owner: 'studio-workbench/src/features/member',
    nextPhase: 'Phase 2 先补统一标签规则和圈选口径，再决定是否开放独立写入口。',
    routes: ['/member/tags'],
    contracts: memberBaseContracts,
    apis: ['buildDerivedMemberItems()', 'backendApi.listCustomers()'],
    ledgers: ['yy_customer.tags', 'yy_order'],
    ownerLayers: memberBaseOwners,
  }),
  definePhaseModuleScaffold({
    featureKey: 'member-consumption',
    phase: 'Phase 2',
    ownerStatus: 'ready',
    domain: '会员',
    title: '消费记录',
    summary: '消费记录 owner 已从页面内联判断拆到独立交易模块，统一读取会员相关流水和订单事实。',
    owner: 'studio-workbench/src/features/member/modules/transactions',
    nextPhase: 'Phase 2 继续补退款冲正、积分/成长值规则和跨门店消费聚合。',
    routes: ['/member/consumption'],
    contracts: memberBaseContracts,
    apis: [
      'memberApi.listMemberPointsLedger()',
      'memberApi.listMemberGrowthLedger()',
      'memberApi.listMemberBalanceLedger()',
    ],
    ledgers: ['yy_order', 'yy_member_points_ledger', 'yy_member_growth_ledger', 'yy_member_balance_ledger'],
    ownerLayers: {
      presentation: ['studio-workbench/src/features/member/modules/transactions/MemberTransactionsView.vue'],
      control: [
        'studio-workbench/src/features/member/modules/transactions/useMemberTransactions.ts',
        'studio-workbench/src/shared/api/backendMemberApi.ts',
        'studio-workbench/src/shared/stores/memberStore.ts',
      ],
      data: ['yy_order', 'yy_member_points_ledger', 'yy_member_growth_ledger', 'yy_member_balance_ledger'],
    },
  }),
]
