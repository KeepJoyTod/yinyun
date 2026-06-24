import { describe, expect, it } from 'vitest'
import modalSource from './StaffBookingModal.vue?raw'
import operationsSource from './staffBookingModalOperations.ts?raw'

const modalContractSource = `${modalSource}\n${operationsSource}`

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
    expect(modalSource).toContain('appStore.createOrder')
    expect(modalSource).toContain('buildStaffOrderCreateInput(draft')
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
    expect(modalSource).toContain('const slotEndTime = computed(() => normalizeClock(addMinutesToClock(draft.date, draft.startTime, Number(draft.durationMinutes) || 30)))')
    expect(modalContractSource).not.toContain("props.initial?.endTime || addMinutesToClock")
  })

  it('checks slot inventory before saving scheduled bookings and redirects blocked slots to inventory', () => {
    expect(modalSource).toContain('useRouter')
    expect(modalSource).toContain('await appStore.loadBookingInventory({')
    expect(modalSource).toContain('findBlockedInventorySlot(inventorySlots')
    expect(operationsSource).toContain('const blockedSlot = inventorySlots.find(slot =>')
    expect(operationsSource).toContain('slot.confirmedCount >= slot.capacity')
    expect(operationsSource).toContain('slot.conflictCount > 0')
    expect(modalSource).toContain("path: '/merchant/inventory'")
    expect(modalSource).toContain("slotStart: draft.startTime")
    expect(modalSource).toContain('slotEnd: slotEndTime.value')
    expect(modalSource).toContain("returnTo: 'staffBooking'")
    expect(modalSource).toContain("errorMessage.value = '当前时段已满或存在冲突，请先去库存页处理后再返回录入。'")
  })

  it('loads service groups before resetting the draft when opened from a cold route', () => {
    expect(modalSource).toContain('ensureStaffBookingResources')
    expect(modalSource).toContain('if (!appStore.serviceGroups.length) await appStore.loadServiceGroups()')
    expect(modalSource).toContain('if (!props.open) return')
    expect(modalSource).toContain('resetDraft()')
    expect(modalSource).toContain('{ immediate: true }')
  })

  it('applies initial customer fields immediately before async resources finish loading', () => {
    const openWatcherStart = modalSource.indexOf('watch(() => props.open')
    const initialWatcherStart = modalSource.indexOf('watch(() => props.initial')
    expect(openWatcherStart).toBeGreaterThan(-1)
    expect(initialWatcherStart).toBeGreaterThan(-1)
    const openWatcher = modalSource.slice(openWatcherStart, initialWatcherStart)
    const initialWatcher = modalSource.slice(initialWatcherStart, modalSource.indexOf('watch(selectedServiceGroup', initialWatcherStart))
    expect(openWatcher.indexOf('resetDraft()')).toBeLessThan(openWatcher.indexOf('await ensureStaffBookingResources()'))
    expect(initialWatcher.indexOf('resetDraft()')).toBeLessThan(initialWatcher.indexOf('await ensureStaffBookingResources()'))
  })

  it('keeps an incoming service group selectable even if store scope is still settling', () => {
    expect(modalSource).toContain('const scoped = appStore.serviceGroups.filter')
    expect(modalSource).toContain('draft.serviceGroupId')
    expect(modalSource).toContain('appStore.serviceGroups.find(item => item.backendId === draft.serviceGroupId)')
    expect(modalSource).toContain('return [selected, ...scoped]')
  })

  it('re-applies async micro-form initial values while the modal is already open', () => {
    expect(modalSource).toContain('watch(() => props.initial')
    expect(modalSource).toContain('if (!props.open || !initial) return')
    expect(modalSource).toContain('await ensureStaffBookingResources()')
    expect(modalSource).toContain('resetDraft()')
  })

  it('keeps booking validation and inventory math in the operations owner instead of the modal view', () => {
    expect(modalSource).toContain('validateStaffBookingDraft(draft')
    expect(operationsSource).toContain('export const validateStaffBookingDraft')
    expect(operationsSource).toContain('export const buildStaffBookingDraftDefaults')
    expect(operationsSource).toContain('export const buildStaffOrderCreateInput')
    expect(operationsSource).toContain('export const findBlockedInventorySlot')
  })
})
