import { describe, expect, it } from 'vitest'
import entrySource from './StaffBookingEntryView.vue?raw'
import operationsSource from './staffBookingEntryOperations.ts?raw'

const entryContractSource = `${entrySource}\n${operationsSource}`

describe('staff booking entry contract', () => {
  it('routes full or conflicted recommended slots to inventory instead of opening booking directly', () => {
    expect(entryContractSource).toContain('slotBlocked')
    expect(entryContractSource).toContain('slot.conflictCount > 0')
    expect(entrySource).toContain('goSlotInventory(slot)')
    expect(entryContractSource).toContain('调整容量')
    expect(entrySource).toContain('冲突')
  })

  it('shows explicit capacity and conflict reasons before sending staff to inventory', () => {
    expect(entryContractSource).toContain('slotBlockedReason')
    expect(entryContractSource).toContain('容量已满且有')
    expect(entryContractSource).toContain('单库存冲突')
    expect(entryContractSource).toContain('容量已满（容量')
    expect(entrySource).toContain('剩余 {{ slot.remaining }}')
    expect(entrySource).toContain('冲突 {{ slot.conflictCount }}')
    expect(entrySource).toContain('点击去库存处理')
  })

  it('marks inventory deep-links as returnable to staff booking entry', () => {
    expect(entryContractSource).toContain("returnTo: 'staffBooking'")
    expect(entryContractSource).toContain('slotStart: slot.startTime')
    expect(entryContractSource).toContain('slotEnd: slot.endTime')
  })

  it('can prefill entry draft when returning from inventory capacity adjustment', () => {
    expect(entrySource).toContain('useRoute')
    expect(entrySource).toContain('applyEntryPrefillFromQuery')
    expect(entrySource).toContain("route.query.storeId")
    expect(entrySource).toContain("route.query.serviceGroupId")
    expect(entrySource).toContain("route.query.slotStart")
    expect(entryContractSource).toContain("query.slotEnd")
    expect(entrySource).toContain("route.query.startTime")
    expect(entryContractSource).toContain("query.endTime")
    expect(entrySource).toContain('shouldOpenStaffBookingReturn')
  })

  it('restores slot return context from slotStart and slotEnd before reopening the booking form', () => {
    expect(entryContractSource).toContain("const slotStart = readQueryString(query.slotStart)")
    expect(entryContractSource).toContain("const slotEnd = readQueryString(query.slotEnd)")
    expect(entryContractSource).toContain("const startTime = slotStart || readQueryString(query.startTime)")
    expect(entryContractSource).toContain("const endTime = slotEnd || readQueryString(query.endTime)")
    expect(entryContractSource).toContain('startTime: /^\\d{2}:\\d{2}$/.test(startTime) ? startTime : params.draft.startTime')
    expect(entryContractSource).toContain('endTime: /^\\d{2}:\\d{2}$/.test(endTime) ? endTime : undefined')
  })

  it('replays return prefill after stores and service groups are loaded', () => {
    expect(entrySource).toContain('lastAppliedPrefillKey')
    expect(entrySource).toContain("() => appStore.stores.map(store => store.backendId).join('|')")
    expect(entrySource).toContain("() => appStore.serviceGroups.map(group => group.backendId).join('|')")
    expect(entrySource).toContain('applyEntryPrefillFromQuery(true)')
  })

  it('prefills and links public micro-form submissions through manual booking only', () => {
    expect(entrySource).toContain('fromSubmissionId')
    expect(entrySource).toContain('backendApi.getMicroFormSubmission')
    expect(entrySource).toContain('buildSubmissionBookingPrefill')
    expect(entryContractSource).toContain("scheduleMode: 'UNDECIDED'")
    expect(entryContractSource).toContain('sourceSubmissionId')
    expect(entrySource).toContain('linkSubmissionToOrder')
    expect(entrySource).toContain('backendApi.updateMicroFormSubmissionFollow')
    expect(entrySource).toContain('order.backendId')
    expect(entrySource).toContain('表单提交已转为预约订单')
  })

  it('does not silently navigate away when micro-form submission follow linking fails', () => {
    expect(entrySource).toContain('sourceSubmissionLinkError.value = error instanceof Error ? error.message :')
    expect(entrySource).toContain('throw error')
    const handleCreatedStart = entrySource.indexOf('const handleCreated = async')
    const routerPush = entrySource.indexOf('router.push({', handleCreatedStart)
    const linkCall = entrySource.indexOf('await linkSubmissionToOrder(order)', handleCreatedStart)
    expect(handleCreatedStart).toBeGreaterThan(-1)
    expect(linkCall).toBeGreaterThan(handleCreatedStart)
    expect(routerPush).toBeGreaterThan(linkCall)
  })

  it('keeps the staff booking modal mounted only after an explicit open action', () => {
    const modalStart = entrySource.indexOf('<StaffBookingModal')
    expect(modalStart).toBeGreaterThan(-1)
    const modalBlock = entrySource.slice(modalStart, entrySource.indexOf('/>', modalStart))
    expect(modalBlock).toContain('v-if="staffBookingOpen"')
    expect(modalBlock).toContain(':key="staffBookingModalKey"')
    expect(modalBlock).toContain(':initial="staffBookingInitial"')
    expect(entrySource).toContain('staffBookingInitial.value = buildSubmissionInitial(row,')
    const loadStart = entrySource.indexOf('const loadSubmissionPrefill')
    const loadEnd = entrySource.indexOf('const applyEntryPrefillFromQuery', loadStart)
    expect(entrySource.slice(loadStart, loadEnd)).not.toContain('staffBookingOpen.value = true')
  })

  it('loads stores and service groups before resolving a micro-form submission into a booking modal', () => {
    const loadStart = entrySource.indexOf('const loadSubmissionPrefill')
    const rowRead = entrySource.indexOf('const row = await backendApi.getMicroFormSubmission', loadStart)
    expect(loadStart).toBeGreaterThan(-1)
    expect(rowRead).toBeGreaterThan(loadStart)
    expect(entrySource.indexOf('if (!appStore.stores.length) await appStore.refreshCoreData()', loadStart)).toBeLessThan(rowRead)
    expect(entrySource.indexOf('if (!appStore.serviceGroups.length) await appStore.loadServiceGroups()', loadStart)).toBeLessThan(rowRead)
  })

  it('waits for requested-slot inventory before opening the booking modal from a micro-form submission', () => {
    const loadStart = entrySource.indexOf('const loadSubmissionPrefill')
    const inventoryLoad = entrySource.indexOf('await ensureSubmissionRequestedInventory()', loadStart)
    const modalOpen = entrySource.indexOf('staffBookingOpen.value = true', loadStart)
    expect(inventoryLoad).toBeGreaterThan(loadStart)
    expect(modalOpen).toBeGreaterThan(inventoryLoad)
  })

  it('uses structured micro-form answer prefill without auto-confirming the requested slot', () => {
    expect(entrySource).toContain('prefill.storeId')
    expect(entrySource).toContain('prefill.serviceGroupId')
    expect(entrySource).toContain('prefill.date')
    expect(entrySource).toContain('prefill.startTime')
    expect(entryContractSource).toContain('prefill.endTime')
    expect(entryContractSource).toContain('客户选择服务')
    expect(entryContractSource).toContain('客户期望时段')
    expect(entryContractSource).toContain("scheduleMode: 'UNDECIDED'")
  })

  it('requires inventory confirmation before turning requested micro-form time into a scheduled booking', () => {
    expect(entrySource).toContain('sourceSubmissionPrefill')
    expect(entrySource).toContain('sourceSubmissionSlot')
    expect(entrySource).toContain('ensureSubmissionRequestedInventory')
    expect(entrySource).toContain('appStore.loadBookingInventory')
    expect(entrySource).toContain('按该时段录入')
    expect(entrySource).toContain('goSubmissionRequestedSlotInventory')
    expect(entrySource).toContain("scheduleMode: 'SCHEDULED'")
    expect(entrySource).toContain('openStaffBookingModal({')
    expect(entryContractSource).toContain("returnTo: 'staffBooking'")
    expect(entrySource).toContain('sourceSubmissionId: sourceSubmission.value?.id')
  })

  it('recreates the staff booking modal for each explicit open action so old undecided drafts cannot leak', () => {
    expect(entrySource).toContain('nextTick')
    expect(entrySource).toContain('const staffBookingModalKey = ref(0)')
    expect(entrySource).toContain('const openStaffBookingModal = async')
    expect(entrySource).toContain('staffBookingOpen.value = false')
    expect(entrySource).toContain('await nextTick()')
    expect(entrySource).toContain('staffBookingModalKey.value += 1')
    expect(entrySource).toContain('staffBookingOpen.value = true')
  })

  it('uses Chinese visible section labels for staff operation', () => {
    expect(entrySource).toContain('店员录入')
    expect(entrySource).toContain('预填')
    expect(entrySource).toContain('手工')
    expect(entrySource).toContain('今日时段')
    for (const label of ['Staff Booking', 'Today Slots', '>Prefill<', '>MANUAL<']) {
      expect(entrySource).not.toContain(label)
    }
  })
})
