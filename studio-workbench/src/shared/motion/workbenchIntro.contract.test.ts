import { describe, expect, it } from 'vitest'
import motionSource from './workbenchIntro.ts?raw'
import reservationSlotsSource from '../components/schedule/ReservationSlots.vue?raw'

describe('workbench intro motion contract', () => {
  it('filters GSAP selectors before animating route chrome', () => {
    expect(motionSource).toContain('selectExistingElements')
    expect(motionSource).toContain('allTargets.length')
    expect(motionSource).toContain('routeTargets.length')
    expect(motionSource).not.toContain("gsap.set('.yy-route-view > *'")
  })

  it('skips empty schedule slot animation targets', () => {
    expect(reservationSlotsSource).toContain('if (targets.length === 0) return')
    expect(reservationSlotsSource).toContain('if (rows.length > 0)')
    expect(reservationSlotsSource).toContain('if (bookings.length > 0)')
  })
})
