import assert from 'node:assert/strict'
import test from 'node:test'

import {
  filterScheduleDays,
  shanghaiDateStamp,
  shanghaiToday,
} from './export-jianyue-schedule.mjs'

test('shanghaiDateStamp formats the date in Asia/Shanghai instead of UTC', () => {
  assert.equal(shanghaiDateStamp(new Date('2026-06-16T16:30:00.000Z')), '20260617')
})

test('filterScheduleDays keeps today and future days with a max day window', () => {
  const days = [
    { date: '2026-06-15 00:00:00', type: 0, cyc_id: 1 },
    { date: '2026-06-16 00:00:00', type: 0, cyc_id: 2 },
    { date: '2026-06-17 00:00:00', type: 0, cyc_id: 3 },
    { date: '2026-06-18 00:00:00', type: 1, cyc_id: 4 },
    { date: '2026-06-19 00:00:00', type: 2, cyc_id: 5 },
    { date: '2026-06-20 00:00:00', type: 0, cyc_id: 6 },
  ]

  assert.deepEqual(
    filterScheduleDays(days, { today: '2026-06-17', maxDays: 2 }).map((day) => day.cyc_id),
    [3, 4]
  )
})

test('shanghaiToday returns YYYY-MM-DD in Asia/Shanghai', () => {
  assert.equal(shanghaiToday(new Date('2026-06-16T16:00:00.000Z')), '2026-06-17')
})
