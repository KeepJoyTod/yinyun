import type {
  BackendId,
  CardBatchOrderCreatePayload,
  CardBatchOrderDto,
  CardBatchOrderListQuery,
} from '../../../shared/api/backend'

export type OrderCardBatchFilters = {
  storeId: string
  status: string
  keyword: string
  limit: string
}

export type OrderCardBatchDraft = {
  storeId: string
  batchTitle: string
  cardName: string
  cardType: string
  batchCount: string
  targetCustomerCount: string
  unitPriceYuan: string
  targetAudience: string
  channelPolicy: string
  reason: string
  remark: string
}

export const createEmptyOrderCardBatchFilters = (): OrderCardBatchFilters => ({
  storeId: '',
  status: '',
  keyword: '',
  limit: '20',
})

export const createEmptyOrderCardBatchDraft = (): OrderCardBatchDraft => ({
  storeId: '',
  batchTitle: '',
  cardName: '',
  cardType: 'TIMES_CARD',
  batchCount: '20',
  targetCustomerCount: '20',
  unitPriceYuan: '299',
  targetAudience: '老会员复购',
  channelPolicy: '审批通过后由店员线下确认发放',
  reason: '批量开卡属于高风险动作，需先审批再执行',
  remark: '',
})

const toBackendId = (value: string): BackendId | null => {
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(value.trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

export const toAmountCent = (value: string) => Math.max(0, Math.round(toNumber(value, 0) * 100))

export const formatAmountCent = (value: number | null | undefined) => `¥${((value ?? 0) / 100).toFixed(2)}`

export const normalizeOrderCardBatchQuery = (filters: OrderCardBatchFilters): CardBatchOrderListQuery => ({
  storeId: toBackendId(filters.storeId),
  status: filters.status.trim() || undefined,
  keyword: filters.keyword.trim() || undefined,
  limit: Math.max(1, Math.min(100, toNumber(filters.limit, 20))),
})

export const toOrderCardBatchPayload = (draft: OrderCardBatchDraft): CardBatchOrderCreatePayload => ({
  storeId: toBackendId(draft.storeId),
  batchTitle: draft.batchTitle.trim() || undefined,
  cardName: draft.cardName.trim(),
  cardType: draft.cardType.trim() || undefined,
  batchCount: Math.max(1, toNumber(draft.batchCount, 1)),
  targetCustomerCount: Math.max(1, toNumber(draft.targetCustomerCount, toNumber(draft.batchCount, 1))),
  unitPriceCent: toAmountCent(draft.unitPriceYuan),
  targetAudience: draft.targetAudience.trim() || undefined,
  channelPolicy: draft.channelPolicy.trim() || undefined,
  reason: draft.reason.trim(),
  remark: draft.remark.trim() || undefined,
})

export const buildOrderCardBatchSummaryCards = (orders: CardBatchOrderDto[]) => {
  const pendingCount = orders.filter(item => item.status === 'PENDING').length
  const approvedCount = orders.filter(item => item.status === 'APPROVED').length
  const rejectedCount = orders.filter(item => item.status === 'REJECTED').length
  const estimatedTotalCent = orders.reduce((sum, item) => sum + item.estimatedTotalCent, 0)

  return [
    {
      key: 'total',
      label: '申请单',
      value: orders.length,
      hint: '所有批量开卡申请都先进入审批账本，不直接写真实订单。',
    },
    {
      key: 'pending',
      label: '待审批',
      value: pendingCount,
      hint: '审批通过前只保留草稿意图和金额预估，不发放权益。',
    },
    {
      key: 'approved',
      label: '已通过',
      value: approvedCount,
      hint: '当前仅代表允许人工执行，真实批量订单和权益仍待后续闭环。',
    },
    {
      key: 'estimatedTotal',
      label: '预估总额',
      value: formatAmountCent(estimatedTotalCent),
      hint: `驳回 ${rejectedCount} 单，仍保留审批和审计证据。`,
    },
  ]
}
