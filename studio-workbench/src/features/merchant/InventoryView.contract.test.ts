import { describe, expect, it } from 'vitest'
import inventorySource from './InventoryView.vue?raw'

describe('inventory page contract', () => {
  it('filters inventory slots by service group without hiding backend conflict filters', () => {
    expect(inventorySource).toContain('serviceGroupFilter')
    expect(inventorySource).toContain('serviceGroupOptions')
    expect(inventorySource).toContain('全部服务组')
    expect(inventorySource).toContain('serviceGroupBackendId: serviceGroupFilter.value ===')
    expect(inventorySource).toContain('conflictOnly: conflictOnly.value')
  })

  it('keeps inventory summary cards in a helper instead of inline page math', () => {
    expect(inventorySource).toContain('buildInventoryCards')
    expect(inventorySource).toContain('cards = computed(() => buildInventoryCards(slots.value))')
  })

  it('reads deep-link query params from schedule and dashboard pages', () => {
    expect(inventorySource).toContain('useRoute')
    expect(inventorySource).toContain('applyInventoryFiltersFromQuery')
    expect(inventorySource).toContain("route.query.date")
    expect(inventorySource).toContain("route.query.storeId")
    expect(inventorySource).toContain("route.query.serviceGroupId")
    expect(inventorySource).toContain("route.query.conflictOnly")
  })

  it('preserves staff booking return context for blocked slot capacity fixes', () => {
    expect(inventorySource).toContain("route.query.returnTo")
    expect(inventorySource).toContain("route.query.fromSubmissionId")
    expect(inventorySource).toContain("route.query.slotStart")
    expect(inventorySource).toContain("route.query.slotEnd")
    expect(inventorySource).toContain('isStaffBookingReturn')
    expect(inventorySource).toContain('selectedStoreLabel')
    expect(inventorySource).toContain('selectedServiceGroupLabel')
    expect(inventorySource).toContain('returnContextLabel')
    expect(inventorySource).toContain('goBackToStaffBooking')
    expect(inventorySource).toContain('fromSubmissionIdFilter')
    expect(inventorySource).toContain('fromSubmissionId: fromSubmissionIdFilter.value || undefined')
    expect(inventorySource).toContain('slotStart: slotStartFilter.value || undefined')
    expect(inventorySource).toContain('slotEnd: slotEndFilter.value || undefined')
    expect(inventorySource).toContain('回到录入预约')
  })

  it('scopes inventory to a concrete store instead of exposing an all-store staff filter', () => {
    expect(inventorySource).toContain('concreteStoreOptions')
    expect(inventorySource).toContain('normalizeStoreFilter')
    expect(inventorySource).toContain('ensureWorkbenchStores')
    expect(inventorySource).toContain('await ensureWorkbenchStores()')
    expect(inventorySource).not.toContain('<option value="all">全部门店</option>')
    expect(inventorySource).not.toContain("storeFilter.value === 'all' ? undefined")
  })
})
