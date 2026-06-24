import { describe, expect, it } from 'vitest'
import dateStripSource from './JianyueDateStrip.vue?raw'

describe('JianyueDateStrip contract', () => {
  it('centralizes the reference-style horizontal date strip behavior', () => {
    expect(dateStripSource).toContain('defineProps')
    expect(dateStripSource).toContain('defineEmits')
    expect(dateStripSource).toContain('useHorizontalWheel')
    expect(dateStripSource).toContain('scrollRef')
    expect(dateStripSource).toContain("emit('shift', -1)")
    expect(dateStripSource).toContain("emit('shift', 1)")
    expect(dateStripSource).toContain("emit('select', item.date)")
  })

  it('renders active and today states for date tabs', () => {
    expect(dateStripSource).toContain('item.active')
    expect(dateStripSource).toContain('item.today')
    expect(dateStripSource).toContain('item.shortLabel')
    expect(dateStripSource).toContain('item.dateLabel')
  })
})
