import { describe, expect, it } from 'vitest'
import modalSource from './StaffBookingModal.vue?raw'
import stateSource from './useStaffBookingModalState.ts?raw'
import operationsSource from './staffBookingModalOperations.ts?raw'

const modalOwnerSource = `${modalSource}\n${stateSource}`
const modalContractSource = `${modalOwnerSource}\n${operationsSource}`

describe('staff booking modal contract', () => {
  it('collects the required staff appointment fields and submits through appStore.createOrder', () => {
    expect(modalSource).toContain('defineProps')
    expect(modalSource).toContain('StaffBookingInitial')
    expect(modalSource).toContain('客户姓名')
    expect(modalSource).toContain('客户手机号')
    expect(modalSource).toContain('性别')
    expect(modalSource).toContain('邮箱')
    expect(modalSource).toContain('关联客户')
    expect(modalSource).toContain('门店')
    expect(modalSource).toContain('服务组')
    expect(modalSource).toContain('产品')
    expect(modalSource).toContain('档期')
    expect(modalSource).toContain('档期未定')
    expect(modalSource).toContain('预约日期')
    expect(modalSource).toContain('开始时间')
    expect(modalSource).toContain('时长')
    expect(modalSource).toContain('发送通知')
    expect(modalSource).toContain('支付状态')
    expect(modalSource).toContain('订单状态')
    expect(modalSource).toContain('返回')
    expect(modalSource).toContain('保存并接待')
    expect(stateSource).toContain('appStore.createOrder')
    expect(stateSource).toContain('buildStaffOrderCreateInput(draft')
    expect(operationsSource).toContain('gender: draft.gender')
    expect(operationsSource).toContain('email: draft.email')
    expect(operationsSource).toContain('customerId: draft.customerId')
    expect(operationsSource).toContain('serviceGroupId: params.serviceGroup.backendId')
    expect(operationsSource).toContain('productId: params.product?.backendId')
    expect(operationsSource).toContain('scheduleMode: draft.scheduleMode')
    expect(operationsSource).toContain('slotDate: draft.date')
    expect(operationsSource).toContain('slotStartTime: draft.startTime')
    expect(operationsSource).toContain('slotEndTime: params.slotEndTime')
    expect(operationsSource).toContain('notifyEnabled: draft.notifyEnabled')
    expect(operationsSource).toContain('submitMode: params.submitMode')
    expect(operationsSource).toContain("payStatus: draft.payStatus")
    expect(operationsSource).toContain("status: draft.status")
  })

  it('accepts micro-form submission prefill without pretending it has a confirmed slot', () => {
    expect(modalContractSource).toContain('sourceSubmissionId?: BackendId')
    expect(modalContractSource).toContain('name?: string')
    expect(modalContractSource).toContain('phone?: string')
    expect(modalContractSource).toContain('remark?: string')
    expect(modalContractSource).toContain('scheduleMode?:')
    expect(modalContractSource).toContain("scheduleMode: initial?.scheduleMode || 'SCHEDULED'")
    expect(modalContractSource).toContain("name: initial?.name || ''")
    expect(modalContractSource).toContain("phone: initial?.phone || ''")
    expect(modalContractSource).toContain('sourceSubmissionId: initial?.sourceSubmissionId')
  })

  it('uses the initial slot end time only to seed duration, not to lock the submitted end time', () => {
    expect(modalContractSource).toContain('deriveInitialDurationMinutes')
    expect(modalContractSource).toContain('minutesBetweenClocks')
    expect(modalContractSource).toContain('initial?.endTime')
    expect(modalContractSource).toContain('initial?.startTime')
    expect(modalContractSource).toContain('durationMinutes: deriveInitialDurationMinutes(initial, group?.durationMinutes || 30)')
    expect(stateSource).toContain('const slotEndTime = computed(() => normalizeClock(addMinutesToClock(draft.date, draft.startTime, Number(draft.durationMinutes) || 30)))')
    expect(modalContractSource).not.toContain("props.initial?.endTime || addMinutesToClock")
  })

  it('checks slot inventory before saving scheduled bookings and redirects blocked slots to inventory', () => {
    expect(modalSource).toContain('useRouter')
    expect(stateSource).toContain('await appStore.loadBookingInventory({')
    expect(stateSource).toContain('findBlockedInventorySlot(inventorySlots')
    expect(operationsSource).toContain('const blockedSlot = inventorySlots.find(slot =>')
    expect(operationsSource).toContain('slot.confirmedCount >= slot.capacity')
    expect(operationsSource).toContain('slot.conflictCount > 0')
    expect(stateSource).toContain("path: '/merchant/inventory'")
    expect(stateSource).toContain("slotStart: draft.startTime")
    expect(stateSource).toContain('slotEnd: slotEndTime.value')
    expect(stateSource).toContain("returnTo: 'staffBooking'")
    expect(stateSource).toContain("errorMessage.value = '当前时段已满或存在冲突，请先去库存页处理后再返回录入。'")
  })

  it('loads service groups before resetting the draft when opened from a cold route', () => {
    expect(stateSource).toContain('ensureStaffBookingResources')
    expect(stateSource).toContain('if (!appStore.serviceGroups.length) await appStore.loadServiceGroups()')
    expect(stateSource).toContain('if (!props.open) return')
    expect(stateSource).toContain('resetDraft()')
    expect(stateSource).toContain('{ immediate: true }')
  })

  it('applies initial customer fields immediately before async resources finish loading', () => {
    const openWatcherStart = stateSource.indexOf('watch(() => props.open')
    const initialWatcherStart = stateSource.indexOf('watch(() => props.initial')
    expect(openWatcherStart).toBeGreaterThan(-1)
    expect(initialWatcherStart).toBeGreaterThan(-1)
    const openWatcher = stateSource.slice(openWatcherStart, initialWatcherStart)
    const initialWatcher = stateSource.slice(initialWatcherStart, stateSource.indexOf('watch(selectedServiceGroup', initialWatcherStart))
    expect(openWatcher.indexOf('resetDraft()')).toBeLessThan(openWatcher.indexOf('await ensureStaffBookingResources()'))
    expect(initialWatcher.indexOf('resetDraft()')).toBeLessThan(initialWatcher.indexOf('await ensureStaffBookingResources()'))
  })

  it('keeps an incoming service group selectable even if store scope is still settling', () => {
    expect(stateSource).toContain('const scoped = appStore.serviceGroups.filter')
    expect(stateSource).toContain('draft.serviceGroupId')
    expect(stateSource).toContain('appStore.serviceGroups.find(item => item.backendId === draft.serviceGroupId)')
    expect(stateSource).toContain('return [selected, ...scoped]')
  })

  it('re-applies async micro-form initial values while the modal is already open', () => {
    expect(stateSource).toContain('watch(() => props.initial')
    expect(stateSource).toContain('if (!props.open || !initial) return')
    expect(stateSource).toContain('await ensureStaffBookingResources()')
    expect(stateSource).toContain('resetDraft()')
  })

  it('keeps booking validation and inventory math in the operations owner instead of the modal view', () => {
    expect(stateSource).toContain('validateStaffBookingDraft(draft')
    expect(operationsSource).toContain('export const validateStaffBookingDraft')
    expect(operationsSource).toContain('export const buildStaffBookingDraftDefaults')
    expect(operationsSource).toContain('export const buildStaffOrderCreateInput')
    expect(operationsSource).toContain('export const findBlockedInventorySlot')
  })
})
