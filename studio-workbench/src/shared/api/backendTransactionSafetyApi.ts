import { apiRequest } from './request'
import type {
  CompositePaymentCreatePayload,
  CompositePaymentOrderDto,
  EntitlementReservationCreatePayload,
  EntitlementReservationDto,
  MemberWithdrawCreatePayload,
  MemberWithdrawOrderDto,
  StoredValueConsumeCreatePayload,
  StoredValueConsumeOrderDto,
  TransactionSafetyActionPayload,
  TransactionSafetyListQuery,
} from './backendTypes'

export const transactionSafetyApi = {
  listEntitlementReservations(query: TransactionSafetyListQuery = {}) {
    return apiRequest<EntitlementReservationDto[]>('/yy/transaction-safety/entitlement-reservations', {}, query)
  },
  createEntitlementReservation(payload: EntitlementReservationCreatePayload) {
    return apiRequest<EntitlementReservationDto>('/yy/transaction-safety/entitlement-reservations', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  releaseEntitlementReservation(id: string | number, payload: TransactionSafetyActionPayload = {}) {
    return apiRequest<EntitlementReservationDto>(`/yy/transaction-safety/entitlement-reservations/${id}/release`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  releaseExpiredEntitlementReservations(payload: TransactionSafetyActionPayload = {}) {
    return apiRequest<EntitlementReservationDto[]>('/yy/transaction-safety/entitlement-reservations/release-expired', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  fulfillEntitlementReservation(id: string | number, payload: TransactionSafetyActionPayload = {}) {
    return apiRequest<EntitlementReservationDto>(`/yy/transaction-safety/entitlement-reservations/${id}/fulfill`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listCompositePayments(query: TransactionSafetyListQuery = {}) {
    return apiRequest<CompositePaymentOrderDto[]>('/yy/transaction-safety/composite-payments', {}, query)
  },
  createCompositePayment(payload: CompositePaymentCreatePayload) {
    return apiRequest<CompositePaymentOrderDto>('/yy/transaction-safety/composite-payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  confirmCompositePayment(id: string | number, payload: TransactionSafetyActionPayload = {}) {
    return apiRequest<CompositePaymentOrderDto>(`/yy/transaction-safety/composite-payments/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  failCompositePayment(id: string | number, payload: TransactionSafetyActionPayload = {}) {
    return apiRequest<CompositePaymentOrderDto>(`/yy/transaction-safety/composite-payments/${id}/fail`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listStoredValueConsumes(query: TransactionSafetyListQuery = {}) {
    return apiRequest<StoredValueConsumeOrderDto[]>('/yy/transaction-safety/stored-value-consumes', {}, query)
  },
  createStoredValueConsume(payload: StoredValueConsumeCreatePayload) {
    return apiRequest<StoredValueConsumeOrderDto>('/yy/transaction-safety/stored-value-consumes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  confirmStoredValueConsume(id: string | number, payload: TransactionSafetyActionPayload = {}) {
    return apiRequest<StoredValueConsumeOrderDto>(`/yy/transaction-safety/stored-value-consumes/${id}/confirm`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  reverseStoredValueConsume(id: string | number, payload: TransactionSafetyActionPayload = {}) {
    return apiRequest<StoredValueConsumeOrderDto>(`/yy/transaction-safety/stored-value-consumes/${id}/reverse`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listMemberWithdrawOrders(query: TransactionSafetyListQuery = {}) {
    return apiRequest<MemberWithdrawOrderDto[]>('/yy/transaction-safety/withdraw-orders', {}, query)
  },
  createMemberWithdrawOrder(payload: MemberWithdrawCreatePayload) {
    return apiRequest<MemberWithdrawOrderDto>('/yy/transaction-safety/withdraw-orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  markWithdrawPaid(id: string | number, payload: TransactionSafetyActionPayload = {}) {
    return apiRequest<MemberWithdrawOrderDto>(`/yy/transaction-safety/withdraw-orders/${id}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
