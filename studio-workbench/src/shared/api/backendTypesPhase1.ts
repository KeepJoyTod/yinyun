import type { BackendId } from './backendId'

export type BookingInventoryListQuery = {
  bizDate?: string
  beginBizDate?: string
  endBizDate?: string
  storeId?: BackendId
  serviceGroupId?: BackendId
  conflictOnly?: string
}

export type OperationLogListQuery = {
  orderByColumn?: string
  isAsc?: 'ascending' | 'descending'
}

export type ChannelSyncLogListQuery = {
  storeId?: BackendId
  channelType?: string
  apiName?: string
  requestId?: string
  success?: string
}

export type PaymentRecordDto = {
  id: BackendId
  storeId: BackendId | null
  orderId: BackendId | null
  channelType: string
  provider: string
  outTradeNo: string
  platformOrderId: string
  transactionId: string
  amountCent: number
  paidAmountCent: number
  payStatus: string
  paidTime: string
  notifyTime: string
  currency: string
  rawPayload: string
  remark: string
}
