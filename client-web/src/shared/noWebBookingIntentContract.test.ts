import { describe, expect, it } from 'vitest'

const modules = import.meta.glob('../**/*.{ts,vue}', {
  eager: true,
  query: '?raw',
  import: 'default',
})

describe('client web booking boundary', () => {
  it('does not expose a public web booking intent endpoint', () => {
    const combinedSource = Object.entries(modules)
      .filter(([path]) => !path.endsWith('.test.ts'))
      .map(([, source]) => String(source))
      .join('\n')

    expect(combinedSource).not.toContain('/client/booking/intent')
    expect(combinedSource).not.toContain('clientBookingApi')
  })
})
