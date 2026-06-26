import { describe, expect, it } from 'vitest'
import source from './MerchantScheduleGovernanceView.vue?raw'

describe('merchant schedule governance owner', () => {
  it('renders an actionable schedule governance form', () => {
    expect(source).toContain('data-testid="schedule-governance-form"')
    expect(source).toContain('previewScheduleGovernance')
    expect(source).toContain('applyScheduleGovernance')
    expect(source).toContain('CLOSE')
    expect(source).toContain('REOPEN')
    expect(source).toContain('CAPACITY_OVERRIDE')
  })

  it('shows approval-required state when paid slots are affected', () => {
    expect(source).toContain('data-testid="schedule-governance-approval-required"')
    expect(source).toContain('approvalRequired')
    expect(source).toContain('preview.approval?.id')
  })

  it('can hydrate the governance form from an approval deeplink and auto-preview', () => {
    expect(source).toContain('useRoute')
    expect(source).toContain('route.query.approvalId')
    expect(source).toContain('applyQueryPrefill')
    expect(source).toContain('previewGovernance()')
  })
})
