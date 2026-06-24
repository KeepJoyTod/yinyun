import type { MicroFormSubmissionDto } from '../../shared/api/backendTypes'
import type { BackendId } from '../../shared/api/backendId'

export type SubmissionBookingPrefill = {
  sourceSubmissionId: BackendId
  name: string
  phone: string
  storeId?: BackendId
  serviceGroupId?: BackendId
  serviceText?: string
  date: string
  startTime: string
  endTime: string
  scheduleMode: 'UNDECIDED'
}

const textValue = (value: unknown) => {
  if (Array.isArray(value)) return value.map(item => String(item ?? '').trim()).filter(Boolean).join('，')
  return String(value ?? '').trim()
}

const compactDigits = (value: string) => value.replace(/\D/g, '')

const normalizeDate = (value: string) => {
  const text = value.trim()
  const direct = text.match(/(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})/)
  if (direct) {
    return `${direct[1]}-${direct[2].padStart(2, '0')}-${direct[3].padStart(2, '0')}`
  }
  const monthDay = text.match(/(\d{1,2})[-/.月](\d{1,2})/)
  if (monthDay) {
    const year = new Date().getFullYear()
    return `${year}-${monthDay[1].padStart(2, '0')}-${monthDay[2].padStart(2, '0')}`
  }
  return ''
}

const normalizeClock = (value: string) => {
  const match = value.trim().match(/(\d{1,2})[:：点时](\d{1,2})?/)
  if (!match) return ''
  const hour = Number(match[1])
  const minute = Number(match[2] ?? 0)
  if (!Number.isFinite(hour) || !Number.isFinite(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return ''
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

const normalizeTimeRange = (value: string) => {
  const text = value.trim()
  const range = text.match(/(\d{1,2}[:：点时]\d{0,2})\s*(?:-|~|至|到)\s*(\d{1,2}[:：点时]\d{0,2})/)
  if (range) {
    return {
      startTime: normalizeClock(range[1]),
      endTime: normalizeClock(range[2]),
    }
  }
  return {
    startTime: normalizeClock(text),
    endTime: '',
  }
}

const answerEntries = (answers: Record<string, unknown>) =>
  Object.entries(answers).map(([key, value]) => ({
    key,
    label: key.replace(/^binding:[^:]+:/, '').replace(/^binding:/, ''),
    value: textValue(value),
  })).filter(item => item.value)

const findByKey = (
  entries: ReturnType<typeof answerEntries>,
  matcher: (key: string, label: string) => boolean,
) => entries.find(item => matcher(item.key, item.label))?.value ?? ''

export const buildSubmissionBookingPrefill = (row: MicroFormSubmissionDto): SubmissionBookingPrefill => {
  const entries = answerEntries(row.answers || {})
  const name = row.customerName
    || findByKey(entries, (key, label) => /(^|_)(name|customerName)$/i.test(key) || /姓名|客户|联系人/.test(label))
  const phone = row.customerPhone
    || findByKey(entries, (key, label) => /(phone|mobile|tel)/i.test(key) || /手机|电话|联系方式|联系/.test(label))
  const answerStoreId = findByKey(entries, key => key === '__storeId' || /^binding:storeId:/i.test(key) || key === 'storeId')
  const answerServiceGroupId = findByKey(entries, key =>
    key === '__serviceGroupId' || /^binding:serviceGroupId:/i.test(key) || key === 'serviceGroupId',
  )
  const dateText = findByKey(entries, (key, label) =>
    /(date|day|expectDate|bookingDate|reserveDate)/i.test(key) || /日期|哪天|到店日|预约日|期望日/.test(label),
  )
  const timeText = findByKey(entries, (key, label) =>
    /(time|clock|period|slot|expectTime|bookingTime|reserveTime)/i.test(key) || /时间|时段|几点|到店时间/.test(label),
  )
  const serviceText = findByKey(entries, (key, label) =>
    /(service|product|package|type)/i.test(key) || /服务|产品|套餐|类型|拍摄/.test(label),
  )
  const timeRange = normalizeTimeRange(timeText)

  return {
    sourceSubmissionId: row.id,
    name,
    phone: compactDigits(phone),
    storeId: (row.storeId || answerStoreId || undefined) as BackendId | undefined,
    serviceGroupId: (row.serviceGroupId || answerServiceGroupId || undefined) as BackendId | undefined,
    serviceText: serviceText || undefined,
    date: normalizeDate(dateText),
    startTime: timeRange.startTime,
    endTime: timeRange.endTime,
    scheduleMode: 'UNDECIDED',
  }
}
