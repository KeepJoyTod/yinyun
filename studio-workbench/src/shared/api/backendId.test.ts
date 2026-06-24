import { describe, expect, it } from 'vitest'
import { normalizeBackendId, optionalBackendId } from './backendId'

describe('backend id boundary', () => {
  it('preserves a 19 digit snowflake id exactly', () => {
    expect(normalizeBackendId('2063173289800183809')).toBe('2063173289800183809')
  })

  it('normalizes safe numeric ids used by legacy and demo data', () => {
    expect(normalizeBackendId(903001)).toBe('903001')
  })

  it('keeps missing optional relations undefined', () => {
    expect(optionalBackendId(null)).toBeUndefined()
    expect(optionalBackendId(undefined)).toBeUndefined()
    expect(optionalBackendId('')).toBeUndefined()
  })

  it('rejects missing required ids', () => {
    expect(() => normalizeBackendId(null)).toThrow('Missing backend id')
  })
})
