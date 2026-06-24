import { describe, expect, it } from 'vitest'
import { shouldHandleHorizontalWheel } from './useHorizontalWheel'

describe('shouldHandleHorizontalWheel', () => {
  it('handles vertical wheel when the element can scroll horizontally', () => {
    expect(shouldHandleHorizontalWheel({
      deltaY: 120,
      deltaX: 0,
      shiftKey: false,
      scrollWidth: 1000,
      clientWidth: 600,
    })).toBe(true)
  })

  it('does not handle wheel when there is no horizontal overflow', () => {
    expect(shouldHandleHorizontalWheel({
      deltaY: 120,
      deltaX: 0,
      shiftKey: false,
      scrollWidth: 600,
      clientWidth: 600,
    })).toBe(false)
  })

  it('does not override shift wheel gestures', () => {
    expect(shouldHandleHorizontalWheel({
      deltaY: 120,
      deltaX: 0,
      shiftKey: true,
      scrollWidth: 1000,
      clientWidth: 600,
    })).toBe(false)
  })

  it('does not handle mostly-horizontal wheel deltas', () => {
    expect(shouldHandleHorizontalWheel({
      deltaY: 12,
      deltaX: 80,
      shiftKey: false,
      scrollWidth: 1000,
      clientWidth: 600,
    })).toBe(false)
  })
})
