import { describe, expect, it } from 'vitest'
import statusBadgeSource from './StatusBadge.vue?raw'

describe('StatusBadge contract', () => {
  it('maps every supported tone to semantic color tokens', () => {
    expect(statusBadgeSource).toContain('label')
    expect(statusBadgeSource).toContain('tone')
    for (const tone of [
      'neutral',
      'active',
      'dark',
      'inverted',
      'success',
      'warn',
      'danger',
    ]) {
      expect(statusBadgeSource).toContain(tone)
    }
    // 使用语义色 token，不硬编码颜色值
    expect(statusBadgeSource).toContain('--color-status-pending')
    expect(statusBadgeSource).toContain('--color-status-confirmed')
    expect(statusBadgeSource).toContain('--color-status-shooting')
    expect(statusBadgeSource).toContain('--color-status-selecting')
    expect(statusBadgeSource).toContain('--color-status-done')
    expect(statusBadgeSource).toContain('--color-status-warn')
    expect(statusBadgeSource).toContain('--color-status-danger')
    expect(statusBadgeSource).not.toContain('amber-accent/10')
  })

  it('uses rounded-md and consistent font size for modern look', () => {
    expect(statusBadgeSource).toContain('rounded-md')
    expect(statusBadgeSource).toContain('text-[11px]')
  })
})
