import { describe, expect, it } from 'vitest'
import { resolveWorkbenchProtectedRoute } from './routeGuard'

describe('studio router guard', () => {
  it('redirects report order analysis to /403 when yy:report:list is missing', () => {
    expect(
      resolveWorkbenchProtectedRoute('report-order-analysis', {}, ['yy:dashboard:list']),
    ).toEqual({ path: '/403' })
  })

  it('allows report order analysis when yy:report:list is present', () => {
    expect(
      resolveWorkbenchProtectedRoute('report-order-analysis', {}, ['yy:report:list']),
    ).toBe(true)
  })

  it('keeps hidden features blocked even when permissions exist', () => {
    expect(
      resolveWorkbenchProtectedRoute('report-order-analysis', { 'report-order-analysis': 'hidden' }, ['yy:report:list']),
    ).toEqual({ path: '/403' })
  })
})
