import type { BackendId } from './backendId'

export type TransactionSafetyListQuery = {
  storeId?: BackendId | null
  customerId?: BackendId | null
  orderId?: BackendId | null
  status?: string
  limit?: number
}

export type TransactionSafetyActionPayload = {
  reason?: string
  localAdapterRef?: string
  limit?: number
}

export type EntitlementReservationDto = {
  id: BackendId
  storeId?: BackendId | null
  customerId: BackendId
  orderId?: BackendId | null
  reservationNo: string
  reservationType: string
  targetType: string
  targetSnapshot: string
  quantity: number
  reservationAmount: number
  status: string
  idempotencyKey: string
  expireTime: string
  releasedTime: string
  executionMode: string
  remark: string
}

export type EntitlementReservationCreatePayload = {
  storeId?: BackendId | null
  customerId: BackendId
  orderId?: BackendId | null
  reservationType?: string
  targetType?: string
  targetSnapshot?: string
  quantity?: number
  reservationAmount?: number
  expireMinutes?: number
  idempotencyKey?: string
  remark?: string
}

export type CompositePaymentOrderDto = {
  id: BackendId
  storeId?: BackendId | null
  customerId: BackendId
  orderId?: BackendId | null
  compositeNo: string
  totalAmount: number
  externalAmount: number
  storedValueAmount: number
  cashAmount: number
  discountAmount: number
  waiveAmount: number
  status: string
  settleStatus: string
  executionMode: string
  remark: string
}

export type CompositePaymentCreatePayload = {
  storeId?: BackendId | null
  customerId: BackendId
  orderId?: BackendId | null
  totalAmount: number
  externalAmount?: number
  storedValueAmount?: number
  cashAmount?: number
  discountAmount?: number
  waiveAmount?: number
  remark?: string
}

export type StoredValueConsumeOrderDto = {
  id: BackendId
  storeId?: BackendId | null
  customerId: BackendId
  orderId?: BackendId | null
  consumeNo: string
  consumeAmount: number
  balanceSnapshot: number
  status: string
  reversalStatus: string
  executionMode: string
  confirmedTime: string
  remark: string
}

export type StoredValueConsumeCreatePayload = {
  storeId?: BackendId | null
  customerId: BackendId
  orderId?: BackendId | null
  consumeAmount: number
  remark?: string
}

export type MemberWithdrawOrderDto = {
  id: BackendId
  storeId?: BackendId | null
  customerId: BackendId
  withdrawNo: string
  withdrawAmount: number
  balanceSnapshot: number
  approvalId?: BackendId | null
  accountName: string
  accountNoMasked: string
  channelType: string
  status: string
  executionMode: string
  paidTime: string
  remark: string
}

export type MemberWithdrawCreatePayload = {
  storeId?: BackendId | null
  customerId: BackendId
  withdrawAmount: number
  accountName: string
  accountNo: string
  channelType?: string
  remark?: string
}
