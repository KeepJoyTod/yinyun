import { describe, expect, it } from 'vitest'
import { buildUsageEmptyState, buildUsageSizeBackfillHint, computeUsagePercent, formatBytesToGb } from './resourceUsageOperations'

describe('resourceUsageOperations', () => {
  it('formats bytes to gb and computes usage percent', () => {
    expect(formatBytesToGb(1024 ** 3)).toContain('1.00')
    expect(computeUsagePercent(50, 200)).toBe(25)
  })

  it('warns when some resource sizes are missing', () => {
    expect(buildUsageSizeBackfillHint({
      totalQuotaBytes: 1,
      usedBytes: 1,
      remainingBytes: 0,
      usagePercent: 100,
      missingSizeCount: 2,
      cleanupPlanEnabled: false,
      cleanupRetentionDays: 0,
      quotaConfigKey: '',
      cleanupPlanConfigKey: '',
      cleanupRetentionConfigKey: '',
      typeBreakdown: [],
    })).toContain('2')
  })

  it('keeps usage empty state honest when no size data exists', () => {
    expect(buildUsageEmptyState(null).title).toContain('资源用量暂不可用')
    expect(buildUsageEmptyState({
      totalQuotaBytes: 1,
      usedBytes: 0,
      remainingBytes: 1,
      usagePercent: 0,
      missingSizeCount: 0,
      cleanupPlanEnabled: false,
      cleanupRetentionDays: 30,
      quotaConfigKey: '',
      cleanupPlanConfigKey: '',
      cleanupRetentionConfigKey: '',
      typeBreakdown: [],
    }).title).toContain('当前没有可统计的资源大小')
  })
})
