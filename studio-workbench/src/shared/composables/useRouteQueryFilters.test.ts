import { describe, expect, it } from 'vitest'
import {
  buildRouterQuery,
  isDateKey,
  mergeRouterQuery,
  readQueryString,
} from './useRouteQueryFilters'

describe('useRouteQueryFilters pure helpers', () => {
  it('readQueryString returns first array item or coerced scalar', () => {
    expect(readQueryString('林先生')).toBe('林先生')
    expect(readQueryString(['today', 'all'])).toBe('today')
    expect(readQueryString([''])).toBe('')
    expect(readQueryString(undefined)).toBe('')
    expect(readQueryString(null)).toBe('')
    expect(readQueryString(0)).toBe('0')
  })

  it('isDateKey validates strict YYYY-MM-DD', () => {
    expect(isDateKey('2026-06-14')).toBe(true)
    expect(isDateKey('2026-6-14')).toBe(false)
    expect(isDateKey('')).toBe(false)
    expect(isDateKey('2026/06/14')).toBe(false)
  })

  it('buildRouterQuery strips empty values so cleared filters leave the URL', () => {
    expect(buildRouterQuery({ q: '林先生', quick: 'today' })).toEqual({
      q: '林先生',
      quick: 'today',
    })
    expect(buildRouterQuery({ q: '', quick: undefined, extra: null })).toEqual({})
  })

  it('buildRouterQuery skips empty arrays but joins non-empty ones', () => {
    expect(buildRouterQuery({ status: [] })).toEqual({})
    expect(buildRouterQuery({ status: ['待确认', '拍摄中'] })).toEqual({
      status: '待确认,拍摄中',
    })
  })

  it('buildRouterQuery coerces numeric values to string', () => {
    expect(buildRouterQuery({ amountMin: 0, amountMax: 399 })).toEqual({
      amountMin: '0',
      amountMax: '399',
    })
  })

  it('mergeRouterQuery removes cleared managed keys while preserving unrelated query', () => {
    expect(mergeRouterQuery(
      { open: 'A001', status: '进行中', date: '2026-06-15', q: '林先生' },
      { status: '', date: '', q: '', stage: 'selecting' },
    )).toEqual({
      open: 'A001',
      stage: 'selecting',
    })
  })
})
