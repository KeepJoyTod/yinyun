import { describe, expect, it } from 'vitest'
import slotsSource from './ReservationSlots.vue?raw'

describe('reservation slots contract', () => {
  it('emits the selected booking when a visible slot block is clicked', () => {
    expect(slotsSource).toContain("defineEmits")
    expect(slotsSource).toContain("select-booking")
    expect(slotsSource).toContain("@click.stop=\"selectBooking(booking)\"")
    expect(slotsSource).toContain("aria-label")
    expect(slotsSource).toContain("cursor-pointer")
  })

  it('supports horizontal wheel scrolling for the time axis', () => {
    expect(slotsSource).toContain('@wheel.prevent="handleWheel"')
    expect(slotsSource).toContain('scrollLeft += delta')
    expect(slotsSource).toContain('const handleWheel = (event: WheelEvent)')
  })
})
