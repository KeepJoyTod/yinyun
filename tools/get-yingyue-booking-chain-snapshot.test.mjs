import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('booking chain snapshot dry-run covers slot/order health without PII columns', () => {
  const result = spawnSync('pwsh', [
    '-NoProfile',
    '-File',
    'tools/get-yingyue-booking-chain-snapshot.ps1',
    '-DryRun',
    '-Date',
    '2026-06-17',
  ], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /yy_booking_slot_inventory/)
  assert.match(result.stdout, /yy_order/)
  assert.match(result.stdout, /DOUYIN_LIFE/)
  assert.match(result.stdout, /JIANYUE/)
  assert.match(result.stdout, /slot_date/)
  assert.match(result.stdout, /inventory_status/)
  assert.doesNotMatch(result.stdout, /customer_name/i)
  assert.doesNotMatch(result.stdout, /customer_phone/i)
  assert.doesNotMatch(result.stdout, /raw_payload/i)
})

test('booking chain snapshot aggregates today slot totals from raw slot rows', () => {
  const result = spawnSync('pwsh', [
    '-NoProfile',
    '-File',
    'tools/get-yingyue-booking-chain-snapshot.ps1',
    '-DryRun',
    '-Date',
    '2026-06-17',
  ], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /'capacity', \(select coalesce\(sum\(coalesce\(capacity, 0\)\), 0\) from slot_today\)/)
  assert.match(result.stdout, /'paidCount', \(select coalesce\(sum\(coalesce\(paid_count, 0\)\), 0\) from slot_today\)/)
  assert.match(result.stdout, /'conflictCount', \(select coalesce\(sum\(coalesce\(conflict_count, 0\)\), 0\) from slot_today\)/)
})

test('booking chain snapshot aggregates today order totals from raw order rows', () => {
  const result = spawnSync('pwsh', [
    '-NoProfile',
    '-File',
    'tools/get-yingyue-booking-chain-snapshot.ps1',
    '-DryRun',
    '-Date',
    '2026-06-17',
  ], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /'orderCount', \(select count\(\*\) from orders_today\)/)
  assert.match(result.stdout, /'paidCount', \(select count\(\*\) from orders_today where coalesce\(pay_status, ''\) = 'PAID'\)/)
  assert.match(result.stdout, /'conflictCount', \(select count\(\*\) from orders_today where coalesce\(inventory_status, ''\) = 'CONFLICT'\)/)
})
