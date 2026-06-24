import { describe, expect, it } from 'vitest'
import formsSource from './OrderFormSubmissionsView.vue?raw'

describe('order form submissions contract', () => {
  it('routes public micro-form submissions into manual staff booking instead of creating orders directly', () => {
    expect(formsSource).toContain('转预约')
    expect(formsSource).toContain('convertSubmissionToBooking')
    expect(formsSource).toContain("path: '/order/staff-booking'")
    expect(formsSource).toContain("fromSubmissionId: row.id")
    expect(formsSource).toContain("scheduleMode: 'UNDECIDED'")
    expect(formsSource).not.toContain('remark: buildSubmissionBookingRemark(row)')
    expect(formsSource).not.toContain('customerPhone: row.customerPhone')
    expect(formsSource).not.toContain('customerName: row.customerName')
  })

  it('marks a converted submission as followed only after a real staff booking order is created', () => {
    expect(formsSource).toContain('row.orderId')
    expect(formsSource).toContain("router.push({ path: '/order/appointment'")
    expect(formsSource).not.toContain('/yy/order/staff-booking')
  })
})
