import { describe, expect, it } from 'vitest'
import backendSource from '/src/shared/api/backend.ts?raw'
import backendTypesSource from '/src/shared/api/backendTypes.ts?raw'
import backendTypesMemberP1Source from '/src/shared/api/backendTypesMemberP1.ts?raw'
import scaffoldSource from './memberStoredValueP1Scaffold.ts?raw'
import composableSource from './useMemberStoredValueP1.ts?raw'

const memberStoredValueP1ContractSource = [
  backendSource,
  backendTypesSource,
  backendTypesMemberP1Source,
  scaffoldSource,
  composableSource,
].join('\n')

describe('member stored value p1 scaffold contract', () => {
  it('exports member recharge setting and capability facades on the shared backend api', () => {
    expect(backendSource).toContain('getMemberRechargeSetting')
    expect(backendSource).toContain('getMemberRechargeCapability')
    expect(backendSource).toContain('listMemberStoredValueTransactions')
    expect(backendSource).toContain("'/yy/member/recharge-setting'")
    expect(backendSource).toContain("'/yy/member/recharge-capability'")
    expect(backendSource).toContain("'/yy/member/stored-value-transactions'")
  })

  it('registers p1 dto exports through the backend types barrel', () => {
    expect(backendTypesSource).toContain("export type * from './backendTypesMemberP1'")
    expect(memberStoredValueP1ContractSource).toContain('export type MemberRechargeSettingDto = {')
    expect(memberStoredValueP1ContractSource).toContain('export type MemberRechargeCapabilityDto = {')
    expect(memberStoredValueP1ContractSource).toContain('export type MemberStoredValueTransactionDto = {')
    expect(memberStoredValueP1ContractSource).toContain('summary: MemberStoredValueTransactionSummaryDto')
  })

  it('keeps a future-page-ready loader with local scaffold fallback', () => {
    expect(composableSource).toContain('Promise.allSettled')
    expect(composableSource).toContain('resolveFeatureGate')
    expect(composableSource).toContain('buildFallbackMemberRechargeCapability')
    expect(composableSource).toContain('buildFallbackMemberRechargeSetting')
    expect(composableSource).toContain('buildFallbackMemberStoredValueTransactions')
    expect(scaffoldSource).toContain("capabilityCode: 'MEMBER_RECHARGE'")
    expect(scaffoldSource).toContain("transactionType: 'RECHARGE'")
  })
})
