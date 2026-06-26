import { describe, expect, it } from 'vitest'
import source from './MerchantGovernanceView.vue?raw'

describe('merchant governance owner', () => {
  it('renders the real risk approval queue', () => {
    expect(source).toContain('data-testid="risk-approval-filters"')
    expect(source).toContain('data-testid="risk-approval-list"')
    expect(source).toContain('listRiskApprovals')
    expect(source).toContain('SLOT_CLOSE_WITH_PAID_ORDER')
    expect(source).toContain('ORDER_REFUND')
    expect(source).toContain('MEMBER_RECHARGE_CONFIRM')
    expect(source).toContain('payloadJson')
    expect(source).toContain('resultSummary')
  })

  it('exposes approve and reject actions', () => {
    expect(source).toContain('approveRiskApproval')
    expect(source).toContain('rejectRiskApproval')
    expect(source).toContain("item.status !== 'PENDING'")
  })

  it('offers a deeplink back to schedule governance for slot-close approvals', () => {
    expect(source).toContain("path: '/merchant/schedule-governance'")
    expect(source).toContain('buildScheduleGovernanceQuery')
    expect(source).toContain('查看治理结果')
  })
})
