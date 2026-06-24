import { describe, expect, it } from 'vitest'
import skeletonSource from './SkeletonRows.vue?raw'

describe('SkeletonRows contract', () => {
  it('renders configurable number of skeleton rows', () => {
    expect(skeletonSource).toContain('v-for="i in count"')
    expect(skeletonSource).toContain('animate-pulse')
  })

  it('uses amber theme tokens for skeleton styling', () => {
    expect(skeletonSource).toContain('border-amber-topbar-border')
    expect(skeletonSource).toContain('bg-white/55')
  })

  it('defaults to 4 rows with 78px height', () => {
    expect(skeletonSource).toContain('count: 4')
    expect(skeletonSource).toContain('rowHeight: 78')
  })

  it('applies dynamic height via style binding', () => {
    expect(skeletonSource).toContain(':style="{ height: rowHeight + \'px\' }"')
  })
})