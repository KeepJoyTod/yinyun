import { describe, expect, it } from 'vitest'
import routerSource from '../../../../app/router/index.ts?raw'
import featureRegistrySource from '../../../../app/router/featureRegistry.ts?raw'
import backendSource from '../../../../shared/api/backend.ts?raw'
import backendTypesSource from '../../../../shared/api/backendTypes.ts?raw'
import transactionSafetyTypesSource from '../../../../shared/api/backendTypesTransactionSafety.ts?raw'
import apiSource from '../../../../shared/api/backendTransactionSafetyApi.ts?raw'
import viewSource from './MemberTransactionSafetyView.vue?raw'
import composableSource from './useMemberTransactionSafety.ts?raw'

const transactionSafetyContractSource = [
  routerSource,
  featureRegistrySource,
  backendSource,
  backendTypesSource,
  transactionSafetyTypesSource,
  apiSource,
  viewSource,
  composableSource,
].join('\n')

describe('member transaction safety scaffold contract', () => {
  it('registers a dedicated owner route and feature registry entry', () => {
    expect(routerSource).toContain('MemberTransactionSafetyView.vue')
    expect(featureRegistrySource).toContain("'member-transaction-safety'")
    expect(featureRegistrySource).toContain("'/member/transaction-safety'")
    expect(featureRegistrySource).toContain("'yy:customer:list'")
  })

  it('exports transaction safety dto and payload barrels through shared backend types', () => {
    expect(backendTypesSource).toContain("export type * from './backendTypesTransactionSafety'")
    expect(transactionSafetyContractSource).toContain('export type EntitlementReservationDto = {')
    expect(transactionSafetyContractSource).toContain('export type CompositePaymentOrderDto = {')
    expect(transactionSafetyContractSource).toContain('export type StoredValueConsumeOrderDto = {')
    expect(transactionSafetyContractSource).toContain('export type MemberWithdrawOrderDto = {')
    expect(transactionSafetyContractSource).toContain('export type TransactionSafetyActionPayload = {')
  })

  it('exposes dedicated api owners instead of hiding the scaffold in existing member screens', () => {
    expect(backendSource).toContain('transactionSafetyApi')
    expect(backendSource).toContain('...transactionSafetyApi')
    expect(apiSource).toContain("'/yy/transaction-safety/entitlement-reservations'")
    expect(apiSource).toContain("'/yy/transaction-safety/composite-payments'")
    expect(apiSource).toContain("'/yy/transaction-safety/stored-value-consumes'")
    expect(apiSource).toContain("'/yy/transaction-safety/withdraw-orders'")
    expect(apiSource).toContain('/release')
    expect(apiSource).toContain('/release-expired')
    expect(apiSource).toContain('/fulfill')
    expect(apiSource).toContain('/confirm')
    expect(apiSource).toContain('/reverse')
    expect(apiSource).toContain('/mark-paid')
  })

  it('keeps one owner page with explicit create actions and refresh loading', () => {
    expect(composableSource).toContain('Promise.allSettled')
    expect(composableSource).toContain('createReservation')
    expect(composableSource).toContain('createCompositePayment')
    expect(composableSource).toContain('createStoredValueConsume')
    expect(composableSource).toContain('createWithdrawOrder')
    expect(composableSource).toContain('runAction')
    expect(composableSource).toContain('releaseExpiredReservations')
    expect(viewSource).toContain('markWithdrawPaid')
    expect(viewSource).toContain('释放过期预占')
    expect(viewSource).toContain('交易安全脚手架')
    expect(viewSource).toContain('创建脚手架记录')
  })
})
