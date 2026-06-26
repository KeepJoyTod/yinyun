import type { BackendId } from './backendId'

export type CardBatchOrderListQuery = {
  storeId?: BackendId | null
  status?: string
  keyword?: string
  limit?: number
}

export type CardBatchOrderDto = {
  id: BackendId
  storeId?: BackendId | null
  batchNo: string
  title: string
  status: string
  reason: string
  cardName: string
  cardType: string
  batchCount: number
  targetCustomerCount: number
  unitPriceCent: number
  estimatedTotalCent: number
  targetAudience: string
  channelPolicy: string
  remark: string
  payloadJson: string
  applicantName: string
  approverName: string
  approveTime: string
  resultSummary: string
  createTime: string
  executionMode: string
}

export type CardBatchOrderCreatePayload = {
  storeId?: BackendId | null
  batchTitle?: string
  cardName: string
  cardType?: string
  batchCount: number
  targetCustomerCount?: number
  unitPriceCent?: number
  targetAudience?: string
  channelPolicy?: string
  reason: string
  remark?: string
}
