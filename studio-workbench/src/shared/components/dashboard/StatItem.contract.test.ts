import { describe, expect, it } from 'vitest'
import statSource from './StatItem.vue?raw'

describe('StatItem contract', () => {
  it('displays label, value, and trend with amber theme tokens', () => {
    expect(statSource).toContain('label')
    expect(statSource).toContain('value')
    expect(statSource).toContain('trend')
    expect(statSource).toContain('text-amber-dark')
    expect(statSource).toContain('text-amber-text-muted')
  })

  it('uses sans font for the main value display', () => {
    expect(statSource).toContain('font-sans')
    expect(statSource).not.toContain('font-serif')
  })

  it('renders trend direction icons for up down neutral', () => {
    expect(statSource).toContain("trendType === 'up'")
    expect(statSource).toContain("trendType === 'down'")
    expect(statSource).toContain("trendType === 'neutral'")
  })

  it('shows tabular nums for aligned numeric display', () => {
    expect(statSource).toContain('tabular-nums')
  })
})