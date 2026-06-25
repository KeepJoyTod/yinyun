import type { BackendId } from './backendId'

export type MemberStoredValueScaffoldStatus = 'scaffold' | 'ready' | 'disabled' | 'expired'

export type MemberRechargeSettingChannelCode =
  | 'STORE_CASH'
  | 'WECHAT_PAY'
  | 'ALIPAY'
  | 'BANK_TRANSFER'
  | 'OTHER'

export type MemberRechargeGiftRuleDto = {
  ruleId: string
  label: string
  rechargeAmount: number
  giftAmount: number
  enabled: boolean
  remark?: string
}

export type MemberRechargeSettingDto = {
  status: MemberStoredValueScaffoldStatus
  enabled: boolean
  scopeLabel: string
  gateCopy: string
  allowManualRecharge: boolean
  allowGiftAmount: boolean
  allowCrossStore: boolean
  supportedChannels: MemberRechargeSettingChannelCode[]
  defaultChannelType: MemberRechargeSettingChannelCode
  minRechargeAmount: number
  maxRechargeAmount?: number
  notice: string
  updatedAt?: string
  giftRules: MemberRechargeGiftRuleDto[]
}

export type MemberRechargeCapabilityDto = {
  capabilityCode: string
  capabilityName: string
  enabled: boolean
  status: MemberStoredValueScaffoldStatus
  scopeLabel: string
  gateCopy: string
  permissionCode: string
  requiresApproval: boolean
  pluginState: 'enabled' | 'disabled' | 'unknown'
  licenseState: 'active' | 'missing' | 'expired' | 'unknown'
  expiresAt?: string
}

export type MemberStoredValueTransactionType =
  | 'RECHARGE'
  | 'CONSUME'
  | 'REFUND'
  | 'ADJUST'
  | 'EXPIRE'
  | 'WITHDRAW'

export type MemberStoredValueTransactionStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'FAILED'
  | 'REVERSED'

export type MemberStoredValueTransactionDirection = 'IN' | 'OUT'

export type MemberStoredValueTransactionSourceType =
  | 'RECHARGE_ORDER'
  | 'ORDER'
  | 'MANUAL_ADJUST'
  | 'REFUND_ORDER'
  | 'WITHDRAW_APPLY'
  | 'UNKNOWN'

export type MemberStoredValueTransactionSummaryDto = {
  balanceBefore: number
  changeAmount: number
  giftAmount: number
  principalAmount: number
  balanceAfter: number
}

export type MemberStoredValueTransactionDto = {
  id: BackendId
  transactionNo: string
  customerId: BackendId
  customerName: string
  transactionType: MemberStoredValueTransactionType
  transactionStatus: MemberStoredValueTransactionStatus
  direction: MemberStoredValueTransactionDirection
  sourceType: MemberStoredValueTransactionSourceType
  sourceId?: BackendId | null
  sourceOrderId?: BackendId | null
  sourceOrderNo?: string
  rechargeOrderId?: BackendId | null
  rechargeOrderNo?: string
  storeId?: BackendId | null
  storeName: string
  operatorId?: BackendId | null
  operatorName: string
  channelType: string
  tradeTime: string
  summary: MemberStoredValueTransactionSummaryDto
  remark: string
  tags: string[]
}

export type MemberStoredValueTransactionListQuery = {
  customerId?: BackendId
  storeId?: BackendId
  transactionType?: MemberStoredValueTransactionType
  transactionStatus?: MemberStoredValueTransactionStatus
  limit?: number
}
