import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

test('refresh jianyue production booking chain defaults to dry-run and documents guarded write steps', () => {
  const result = spawnSync('pwsh', [
    '-NoProfile',
    '-File',
    'tools/refresh-jianyue-production-booking-chain.ps1',
    '-DryRun',
    '-Date',
    '2026-06-17',
  ], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  })

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /DRY_RUN/)
  assert.match(result.stdout, /export-jianyue-schedule\.mjs/)
  assert.match(result.stdout, /export-jianyue-orders\.mjs/)
  assert.match(result.stdout, /pg_dump/)
  assert.match(result.stdout, /postgres_jianyue_booking_slot_inventory_seed_20260617\.sql/)
  assert.match(result.stdout, /postgres_jianyue_orders_import_20260617\.sql/)
  assert.match(result.stdout, /get-yingyue-booking-chain-snapshot\.ps1/)
  assert.doesNotMatch(result.stdout, /Bill0821/i)
})

test('refresh jianyue production booking chain stops when a native node export fails', async () => {
  const fs = await import('node:fs/promises')
  const source = await fs.readFile(new URL('./refresh-jianyue-production-booking-chain.ps1', import.meta.url), 'utf8')

  assert.match(source, /function Invoke-NodeExport/)
  assert.match(source, /\$LASTEXITCODE -ne 0/)
  assert.match(source, /throw "Jianyue export failed:/)
})
