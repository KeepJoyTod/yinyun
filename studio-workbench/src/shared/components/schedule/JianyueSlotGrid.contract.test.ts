import { describe, expect, it } from 'vitest'
import gridSource from './JianyueSlotGrid.vue?raw'

describe('jianyue slot grid contract', () => {
  it('renders the reference appointment card labels and full badge text', () => {
    expect(gridSource).toContain('上午')
    expect(gridSource).toContain('下午')
    expect(gridSource).toContain('晚上')
    expect(gridSource).toContain('订单')
    expect(gridSource).toContain('工位')
    expect(gridSource).toContain('剩余')
    expect(gridSource).toContain('满')
  })

  it('lays out morning afternoon evening slots as wrapping grids instead of horizontal scrollers', () => {
    expect(gridSource).toContain('jianyue-slot-grid-list')
    expect(gridSource).toContain('grid-cols-[repeat(auto-fill,minmax(176px,1fr))]')
    expect(gridSource).not.toContain('overflow-x-auto')
    expect(gridSource).not.toContain('@wheel=')
    expect(gridSource).not.toContain('shouldHandleHorizontalWheel')
  })

  it('uses flat half-hour cards with reference-like centered time and capacity', () => {
    expect(gridSource).toContain('min-h-[92px]')
    expect(gridSource).toContain('text-center')
    expect(gridSource).toContain('text-[23px]')
    expect(gridSource).toContain('订单：')
    expect(gridSource).toContain('工位：')
    expect(gridSource).toContain('剩余：')
    expect(gridSource).toContain('slot.remainingCount')
    expect(gridSource).toContain('slotClasses')
    expect(gridSource).toContain('slot.storeNames[0] || slot.serviceGroupNames[0]')
  })

  it('shows group summary with order count and capacity label', () => {
    expect(gridSource).toContain('group.orderCount')
    expect(gridSource).toContain('group.capacity')
    expect(gridSource).toContain('tabular-nums')
  })

  it('applies distinct background for full occupied and empty slots', () => {
    expect(gridSource).toContain('slot.isFull')
    expect(gridSource).toContain('slotClasses')
    expect(gridSource).toContain('bg-[#E9ECEF]')
    expect(gridSource).toContain('bg-[#FF7540]')
  })

  it('emits slot selection with scoped detail affordance on click', () => {
    expect(gridSource).toContain("type=\"button\"")
    expect(gridSource).toContain('@click="$emit(\'select-slot\', slot)"')
    expect(gridSource).toContain('查看 ${group.label} ${slot.time} 预约')
    expect(gridSource).not.toContain('全部门店')
  })
})
