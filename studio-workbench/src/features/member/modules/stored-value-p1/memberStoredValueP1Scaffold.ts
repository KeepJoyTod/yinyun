import type {
  MemberRechargeCapabilityDto,
  MemberRechargeSettingDto,
  MemberStoredValueTransactionDto,
  MemberStoredValueTransactionListQuery,
} from '../../../../shared/api/backend'

const fallbackTradeTime = '2026-06-24 10:00:00'

export const buildFallbackMemberRechargeCapability = (): MemberRechargeCapabilityDto => ({
  capabilityCode: 'MEMBER_RECHARGE',
  capabilityName: '会员充值',
  enabled: false,
  status: 'scaffold',
  scopeLabel: '品牌级',
  gateCopy: '会员储值正式版前端脚手架已接入，真实租户开通、审批、风控和财务入账仍待后端闭环。',
  permissionCode: 'yy:customer:list',
  requiresApproval: true,
  pluginState: 'disabled',
  licenseState: 'missing',
})

export const buildFallbackMemberRechargeSetting = (): MemberRechargeSettingDto => ({
  status: 'scaffold',
  enabled: false,
  scopeLabel: '品牌级',
  gateCopy: '当前先暴露充值设置读取结构，待真实配置中心接入后再切到租户级设置。',
  allowManualRecharge: true,
  allowGiftAmount: true,
  allowCrossStore: false,
  supportedChannels: ['STORE_CASH', 'BANK_TRANSFER'],
  defaultChannelType: 'STORE_CASH',
  minRechargeAmount: 100,
  maxRechargeAmount: 50000,
  notice: '储值充值涉及预付式消费监管，正式放量前需补齐审批、风控、通知与财务对账。',
  updatedAt: fallbackTradeTime,
  giftRules: [
    {
      ruleId: 'member-recharge-rule-1000',
      label: '充1000送100',
      rechargeAmount: 1000,
      giftAmount: 100,
      enabled: true,
      remark: '仅作为前端结构示例，未接真实写入。',
    },
    {
      ruleId: 'member-recharge-rule-3000',
      label: '充3000送400',
      rechargeAmount: 3000,
      giftAmount: 400,
      enabled: false,
      remark: '保留停用态，便于后续页面展示状态差异。',
    },
  ],
})

const fallbackTransactions: MemberStoredValueTransactionDto[] = [
  {
    id: 'stored-value-txn-001',
    transactionNo: 'SV20260624001',
    customerId: 'member-customer-scaffold',
    customerName: '储值脚手架客户',
    transactionType: 'RECHARGE',
    transactionStatus: 'CONFIRMED',
    direction: 'IN',
    sourceType: 'RECHARGE_ORDER',
    sourceId: 'recharge-order-001',
    sourceOrderId: null,
    sourceOrderNo: '',
    rechargeOrderId: 'recharge-order-001',
    rechargeOrderNo: 'CZ20260624001',
    storeId: 'store-scaffold',
    storeName: '示例门店',
    operatorId: 'operator-scaffold',
    operatorName: '店员A',
    channelType: 'STORE_CASH',
    tradeTime: fallbackTradeTime,
    summary: {
      balanceBefore: 500,
      changeAmount: 1100,
      giftAmount: 100,
      principalAmount: 1000,
      balanceAfter: 1600,
    },
    remark: '脚手架充值到账示例',
    tags: ['scaffold', 'recharge'],
  },
  {
    id: 'stored-value-txn-002',
    transactionNo: 'SV20260624002',
    customerId: 'member-customer-scaffold',
    customerName: '储值脚手架客户',
    transactionType: 'CONSUME',
    transactionStatus: 'CONFIRMED',
    direction: 'OUT',
    sourceType: 'ORDER',
    sourceId: 'order-001',
    sourceOrderId: 'order-001',
    sourceOrderNo: 'YY20260624001',
    rechargeOrderId: null,
    rechargeOrderNo: '',
    storeId: 'store-scaffold',
    storeName: '示例门店',
    operatorId: 'operator-scaffold',
    operatorName: '收银台',
    channelType: 'BALANCE_PAY',
    tradeTime: '2026-06-24 10:30:00',
    summary: {
      balanceBefore: 1600,
      changeAmount: -399,
      giftAmount: 0,
      principalAmount: -399,
      balanceAfter: 1201,
    },
    remark: '脚手架余额消费示例',
    tags: ['scaffold', 'consume'],
  },
  {
    id: 'stored-value-txn-003',
    transactionNo: 'SV20260624003',
    customerId: 'member-customer-scaffold',
    customerName: '储值脚手架客户',
    transactionType: 'REFUND',
    transactionStatus: 'PENDING',
    direction: 'IN',
    sourceType: 'REFUND_ORDER',
    sourceId: 'refund-order-001',
    sourceOrderId: 'order-001',
    sourceOrderNo: 'YY20260624001',
    rechargeOrderId: null,
    rechargeOrderNo: '',
    storeId: 'store-scaffold',
    storeName: '示例门店',
    operatorId: 'operator-scaffold',
    operatorName: '店长审批',
    channelType: 'BALANCE_RETURN',
    tradeTime: '2026-06-24 11:00:00',
    summary: {
      balanceBefore: 1201,
      changeAmount: 399,
      giftAmount: 0,
      principalAmount: 399,
      balanceAfter: 1600,
    },
    remark: '脚手架退款回补示例',
    tags: ['scaffold', 'refund', 'pending'],
  },
]

export const buildFallbackMemberStoredValueTransactions = (
  query: MemberStoredValueTransactionListQuery = {},
): MemberStoredValueTransactionDto[] =>
  fallbackTransactions
    .filter(item => !query.customerId || item.customerId === query.customerId)
    .filter(item => !query.storeId || item.storeId === query.storeId)
    .filter(item => !query.transactionType || item.transactionType === query.transactionType)
    .filter(item => !query.transactionStatus || item.transactionStatus === query.transactionStatus)
    .slice(0, query.limit ?? 20)
