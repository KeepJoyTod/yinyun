import { describe, expect, it } from 'vitest'
import type { MicroFormSubmissionDto } from '../../shared/api/backendTypes'
import { buildSubmissionBookingPrefill } from './microFormSubmissionBooking'

const makeSubmission = (overrides: Partial<MicroFormSubmissionDto> = {}): MicroFormSubmissionDto => ({
  id: 'sub-001',
  formId: 'form-001',
  formNameSnapshot: '预约拍摄登记',
  customerName: '',
  customerPhone: '',
  submittedAt: '2026-06-19 10:00:00',
  followStatus: 'PENDING',
  followRemark: '',
  answers: {},
  answersJson: '{}',
  orderId: null,
  remark: '',
  storeId: null,
  serviceGroupId: null,
  sourceCode: 'mp-home',
  sourcePath: '/public/micro-form/form-001',
  qrScene: '',
  assignee: '',
  followTimeline: [],
  duplicateCustomerHint: '',
  ...overrides,
})

describe('micro form submission booking prefill', () => {
  it('extracts hidden source store and service group binding into the staff booking draft', () => {
    const prefill = buildSubmissionBookingPrefill(makeSubmission({
      answers: {
        name: '李客户',
        phone: '13900139000',
        __storeId: '900000000000000200',
        __serviceGroupId: 'sg-portrait',
        expectDate: '2026-06-21',
        expectTime: '14:30',
      },
    }))

    expect(prefill).toMatchObject({
      name: '李客户',
      phone: '13900139000',
      storeId: '900000000000000200',
      serviceGroupId: 'sg-portrait',
      date: '2026-06-21',
      startTime: '14:30',
      scheduleMode: 'UNDECIDED',
    })
  })

  it('recognizes common Chinese labels for date, time, duration and service text', () => {
    const prefill = buildSubmissionBookingPrefill(makeSubmission({
      answers: {
        '客户姓名': '赵客人',
        '联系电话': '13700137000',
        '期望日期': '2026/06/22',
        '期望时段': '下午 15:00-16:30',
        '拍摄类型': '形象照主棚',
      },
    }))

    expect(prefill).toMatchObject({
      name: '赵客人',
      phone: '13700137000',
      date: '2026-06-22',
      startTime: '15:00',
      endTime: '16:30',
      serviceText: '形象照主棚',
      scheduleMode: 'UNDECIDED',
    })
  })

  it('keeps undecided schedule when no reliable date or time exists', () => {
    const prefill = buildSubmissionBookingPrefill(makeSubmission({
      answers: {
        name: '刘客户',
        mobile: '13600136000',
        remark: '周末都可以，电话沟通',
      },
    }))

    expect(prefill.date).toBe('')
    expect(prefill.startTime).toBe('')
    expect(prefill.endTime).toBe('')
    expect(prefill.scheduleMode).toBe('UNDECIDED')
  })
})
