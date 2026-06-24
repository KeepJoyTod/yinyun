import fs from 'node:fs'
import path from 'node:path'

const apiBaseUrl = (process.env.STUDIO_SMOKE_API_BASE_URL || 'https://api.evanshine.me').replace(/\/+$/, '')
const releaseId = process.env.STUDIO_SMOKE_RELEASE_ID || ''
const outputDir = process.env.STUDIO_SMOKE_OUTPUT_DIR || path.resolve('docs/evidence/studio-appointment-write-smoke')
const username = process.env.STUDIO_SMOKE_USERNAME || ''
const password = process.env.STUDIO_SMOKE_PASSWORD || ''
const clientId = process.env.STUDIO_SMOKE_CLIENT_ID || 'e5cd7e4891bf95d1d19206ce24a7b32e'
const tenantId = process.env.STUDIO_SMOKE_TENANT_ID || '000000'
const confirmWrite = process.env.STUDIO_SMOKE_CONFIRM_WRITE_LOCAL_DB === '1'

if (!confirmWrite) throw new Error('Missing STUDIO_SMOKE_CONFIRM_WRITE_LOCAL_DB=1')
if (!username || !password) throw new Error('Missing STUDIO_SMOKE_USERNAME/STUDIO_SMOKE_PASSWORD')

fs.mkdirSync(outputDir, { recursive: true })

const result = {
  status: 'PASS',
  checkedAt: new Date().toISOString(),
  apiBaseUrl,
  releaseId,
  boundary: 'WRITE_LOCAL_DB: creates one synthetic staff booking, reschedules it, cancels it, and verifies inventory counts return.',
  selected: {},
  order: {},
  inventory: {},
  operationLogs: {
    checked: false,
    matched: [],
  },
  cleanup: {
    attempted: false,
    status: 'NOT_NEEDED',
  },
  errors: [],
}

const safe = value => String(value || '')
  .replace(/1\d{10}/g, '1**********')
  .replace(/\b\d{8,}\b/g, '[redacted-id]')
  .slice(0, 800)

const toYmd = date => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(date)

const addDays = days => new Date(Date.now() + days * 24 * 60 * 60 * 1000)

const addMinutesToClock = (clock, minutes) => {
  const [hour, minute] = clock.split(':').map(Number)
  const total = hour * 60 + minute + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

let token = ''
let createdOrder = null
let currentOrderStatus = 'PENDING'

const request = async (apiPath, options = {}) => {
  const url = new URL(apiPath, `${apiBaseUrl}/`)
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (clientId) headers.set('clientid', clientId)
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const text = await response.text()
  let json = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`${apiPath} returned non-json ${response.status}: ${safe(text)}`)
  }
  if (!response.ok) {
    throw new Error(`${apiPath} http ${response.status}: ${safe(json.msg || json.message || text)}`)
  }
  if (typeof json.code === 'number' && ![0, 200].includes(json.code)) {
    throw new Error(`${apiPath} business ${json.code}: ${safe(json.msg || json.message || text)}`)
  }
  return json
}

const rows = async (apiPath, query = {}) => {
  const json = await request(apiPath, { query: { pageNum: 1, pageSize: 5000, ...query } })
  return Array.isArray(json.rows) ? json.rows : []
}

const data = async apiPath => (await request(apiPath)).data

const login = async () => {
  const json = await request('/auth/login', {
    method: 'POST',
    body: {
      tenantId,
      username,
      password,
      clientId,
      grantType: 'password',
    },
  })
  token = json.data?.access_token || json.data?.accessToken || ''
  if (!token) throw new Error('login succeeded without token')
}

const visibleStore = store => {
  const code = String(store.storeCode || '').toUpperCase()
  const name = String(store.storeName || store.name || '')
  return !code.includes('DEFAULT') && !name.includes('默认门店')
}

const normalizeSlot = row => ({
  id: String(row.id || ''),
  storeId: String(row.storeId || ''),
  serviceGroupId: row.serviceGroupId == null ? '' : String(row.serviceGroupId),
  bizDate: String(row.bizDate || ''),
  startTime: String(row.startTime || ''),
  endTime: String(row.endTime || ''),
  capacity: Number(row.capacity || 0),
  paidCount: Number(row.paidCount || 0),
  conflictCount: Number(row.conflictCount || 0),
  status: String(row.status || ''),
})

const slotKey = slot => `${slot.bizDate} ${slot.startTime}-${slot.endTime}`

const querySlotSnapshot = async slot => {
  const list = await rows('/yy/bookingSlotInventory/list', {
    storeId: slot.storeId,
    serviceGroupId: slot.serviceGroupId,
    bizDate: slot.bizDate,
  })
  const hit = list.map(normalizeSlot).find(item =>
    item.storeId === slot.storeId
    && item.serviceGroupId === slot.serviceGroupId
    && item.bizDate === slot.bizDate
    && item.startTime === slot.startTime
    && item.endTime === slot.endTime,
  )
  return hit || {
    id: '',
    storeId: slot.storeId,
    serviceGroupId: slot.serviceGroupId,
    bizDate: slot.bizDate,
    startTime: slot.startTime,
    endTime: slot.endTime,
    capacity: 0,
    paidCount: 0,
    conflictCount: 0,
    status: 'MISSING',
  }
}

const chooseSlots = async (storeId, serviceGroupId, durationMinutes) => {
  const beginBizDate = toYmd(addDays(1))
  const endBizDate = toYmd(addDays(7))
  const inventoryRows = await rows('/yy/bookingSlotInventory/list', { storeId, serviceGroupId, beginBizDate, endBizDate })
  const available = inventoryRows
    .map(normalizeSlot)
    .filter(slot =>
      slot.status !== 'DISABLED'
      && slot.storeId === String(storeId)
      && slot.serviceGroupId === String(serviceGroupId)
      && (slot.capacity <= 0 || slot.paidCount < slot.capacity)
      && slot.startTime
      && slot.endTime,
    )
    .sort((a, b) => slotKey(a).localeCompare(slotKey(b)))

  if (available.length >= 2) {
    return [available[0], available.find(slot => slotKey(slot) !== slotKey(available[0]))].filter(Boolean)
  }

  const syntheticDate = beginBizDate
  const starts = ['10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '18:00', '18:30']
  const candidates = []
  for (const startTime of starts) {
    candidates.push({
      id: '',
      storeId: String(storeId),
      serviceGroupId: String(serviceGroupId),
      bizDate: syntheticDate,
      startTime,
      endTime: addMinutesToClock(startTime, Math.min(Math.max(durationMinutes || 30, 30), 60)),
      capacity: 0,
      paidCount: 0,
      conflictCount: 0,
      status: 'SYNTHETIC_CANDIDATE',
    })
  }

  const chosen = []
  for (const candidate of candidates) {
    const snapshot = await querySlotSnapshot(candidate)
    const canUse = snapshot.status === 'MISSING'
      || snapshot.capacity <= 0
      || snapshot.paidCount < snapshot.capacity
    if (canUse) chosen.push(candidate)
    if (chosen.length >= 2) break
  }
  if (chosen.length < 2) throw new Error('No two available future slots found for write smoke')
  return chosen
}

const writeOutputs = () => {
  const jsonPath = path.join(outputDir, 'appointment-write-smoke.json')
  const mdPath = path.join(outputDir, 'appointment-write-smoke.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  const content = [
    '# Studio Appointment Write Smoke',
    '',
    `- Status: ${result.status}`,
    `- CheckedAt: ${result.checkedAt}`,
    `- ApiBaseUrl: ${result.apiBaseUrl}`,
    `- ReleaseId: ${result.releaseId}`,
    '',
    '## Selected',
    '',
    '```json',
    JSON.stringify(result.selected, null, 2),
    '```',
    '',
    '## Order',
    '',
    '```json',
    JSON.stringify(result.order, null, 2),
    '```',
    '',
    '## Inventory',
    '',
    '```json',
    JSON.stringify(result.inventory, null, 2),
    '```',
    '',
    '## Operation Logs',
    '',
    '```json',
    JSON.stringify(result.operationLogs, null, 2),
    '```',
    '',
    '## Cleanup',
    '',
    '```json',
    JSON.stringify(result.cleanup, null, 2),
    '```',
    '',
    '## Errors',
    '',
    result.errors.length ? result.errors.map(item => `- ${item}`).join('\n') : '- none',
    '',
    '## Boundary',
    '',
    'This smoke writes one synthetic local staff booking only. It does not notify customers, publish merchant content, refund, charge, verify, or write Douyin platform state.',
    '',
  ].join('\n')
  fs.writeFileSync(mdPath, content, 'utf8')
}

try {
  await login()
  const bootstrap = await data('/yy/studio/bootstrap')
  const store = (bootstrap.stores || []).find(visibleStore)
  if (!store) throw new Error('No visible real store in bootstrap')
  const storeId = String(store.storeId || store.id)
  const serviceGroups = await rows('/yy/serviceGroup/list', { storeId })
  const group = serviceGroups
    .filter(item => String(item.storeId || '') === storeId)
    .find(item => ['0', 'ACTIVE', ''].includes(String(item.status || '')))
  if (!group) throw new Error(`No service group found for store ${safe(storeId)}`)
  const serviceGroupId = String(group.id)
  const durationMinutes = Number(group.durationMinutes || 30) || 30
  const [oldSlot, newSlot] = await chooseSlots(storeId, serviceGroupId, durationMinutes)

  result.selected = {
    storeId,
    storeName: String(store.storeName || store.name || ''),
    serviceGroupId,
    serviceGroupName: String(group.groupName || ''),
    oldSlot,
    newSlot,
  }

  const beforeOld = await querySlotSnapshot(oldSlot)
  const beforeNew = await querySlotSnapshot(newSlot)
  result.inventory.beforeOld = beforeOld
  result.inventory.beforeNew = beforeNew

  const suffix = new Date().toISOString().replace(/\D/g, '').slice(4, 14)
  const syntheticPhone = `199${suffix.slice(0, 8)}`.slice(0, 11).padEnd(11, '0')
  const syntheticName = `CODEx_LOOP_${suffix}`
  const remark = `CODEx_LOOP_STAFF_BOOKING_${suffix}; auto-cancel after smoke`

  const created = await request('/yy/order/staff-booking', {
    method: 'POST',
    body: {
      storeId,
      serviceGroupId,
      customerName: syntheticName,
      customerPhone: syntheticPhone,
      arrivalTime: `${oldSlot.bizDate} ${oldSlot.startTime}:00`,
      scheduleMode: 'SCHEDULED',
      slotDate: oldSlot.bizDate,
      slotStartTime: oldSlot.startTime,
      slotEndTime: oldSlot.endTime,
      notifyEnabled: false,
      submitMode: 'SAVE',
      status: 'PENDING',
      payStatus: 'UNPAID',
      workstationNo: 'CODEx-LOOP',
      remark,
    },
  })
  createdOrder = created.data
  currentOrderStatus = String(createdOrder?.status || 'PENDING').toUpperCase()
  result.order.created = {
    id: String(createdOrder?.id || ''),
    orderNo: String(createdOrder?.orderNo || ''),
    status: currentOrderStatus,
    inventoryStatus: String(createdOrder?.inventoryStatus || ''),
    inventorySlotId: String(createdOrder?.inventorySlotId || ''),
    customerName: syntheticName,
    customerPhone: '1**********',
    remark,
  }
  if (!createdOrder?.id) throw new Error('staff booking returned no order id')
  if (String(createdOrder?.inventoryStatus || '').toUpperCase() !== 'CONFIRMED') {
    throw new Error(`created order inventory status is not CONFIRMED: ${safe(createdOrder?.inventoryStatus)}`)
  }

  const afterCreateOld = await querySlotSnapshot(oldSlot)
  result.inventory.afterCreateOld = afterCreateOld
  if (afterCreateOld.paidCount !== beforeOld.paidCount + 1) {
    throw new Error(`old slot paidCount did not increase by 1: before=${beforeOld.paidCount}, after=${afterCreateOld.paidCount}`)
  }

  const rescheduled = await request(`/yy/order/${createdOrder.id}/reschedule`, {
    method: 'POST',
    body: {
      expectedStatus: currentOrderStatus,
      arrivalTime: `${newSlot.bizDate} ${newSlot.startTime}:00`,
      serviceGroupId,
      slotDate: newSlot.bizDate,
      slotStartTime: newSlot.startTime,
      slotEndTime: newSlot.endTime,
      remark: `${remark}; reschedule smoke`,
    },
  })
  createdOrder = rescheduled.data
  currentOrderStatus = String(createdOrder?.status || currentOrderStatus).toUpperCase()
  result.order.rescheduled = {
    id: String(createdOrder?.id || ''),
    status: currentOrderStatus,
    inventoryStatus: String(createdOrder?.inventoryStatus || ''),
    inventorySlotId: String(createdOrder?.inventorySlotId || ''),
    slotDate: String(createdOrder?.slotDate || ''),
    slotStartTime: String(createdOrder?.slotStartTime || ''),
    slotEndTime: String(createdOrder?.slotEndTime || ''),
  }
  if (String(createdOrder?.inventoryStatus || '').toUpperCase() !== 'CONFIRMED') {
    throw new Error(`rescheduled order inventory status is not CONFIRMED: ${safe(createdOrder?.inventoryStatus)}`)
  }

  const afterRescheduleOld = await querySlotSnapshot(oldSlot)
  const afterRescheduleNew = await querySlotSnapshot(newSlot)
  result.inventory.afterRescheduleOld = afterRescheduleOld
  result.inventory.afterRescheduleNew = afterRescheduleNew
  if (afterRescheduleOld.paidCount !== beforeOld.paidCount) {
    throw new Error(`old slot paidCount did not return after reschedule: before=${beforeOld.paidCount}, after=${afterRescheduleOld.paidCount}`)
  }
  if (afterRescheduleNew.paidCount !== beforeNew.paidCount + 1) {
    throw new Error(`new slot paidCount did not increase by 1: before=${beforeNew.paidCount}, after=${afterRescheduleNew.paidCount}`)
  }

  result.cleanup.attempted = true
  const cancelled = await request(`/yy/order/${createdOrder.id}/transition`, {
    method: 'POST',
    body: {
      expectedStatus: currentOrderStatus,
      targetStatus: 'CANCELLED',
      remark: `${remark}; cleanup cancel`,
    },
  })
  createdOrder = cancelled.data
  currentOrderStatus = String(createdOrder?.status || 'CANCELLED').toUpperCase()
  result.cleanup.status = currentOrderStatus === 'CANCELLED' ? 'CANCELLED' : 'UNKNOWN'
  result.order.cancelled = {
    id: String(createdOrder?.id || ''),
    status: currentOrderStatus,
    inventoryStatus: String(createdOrder?.inventoryStatus || ''),
  }

  const finalOld = await querySlotSnapshot(oldSlot)
  const finalNew = await querySlotSnapshot(newSlot)
  result.inventory.finalOld = finalOld
  result.inventory.finalNew = finalNew
  if (finalOld.paidCount !== beforeOld.paidCount) {
    throw new Error(`old slot final paidCount mismatch: before=${beforeOld.paidCount}, final=${finalOld.paidCount}`)
  }
  if (finalNew.paidCount !== beforeNew.paidCount) {
    throw new Error(`new slot final paidCount mismatch: before=${beforeNew.paidCount}, final=${finalNew.paidCount}`)
  }

  const operationLogs = await rows('/monitor/operlog/list', {
    orderByColumn: 'operTime',
    isAsc: 'descending',
  })
  const orderId = String(createdOrder.id)
  const matchedLogs = operationLogs
    .filter(log => {
      const value = `${log.operUrl || ''}\n${log.operParam || ''}\n${log.jsonResult || ''}`
      return value.includes(`/yy/order/${orderId}/reschedule`)
        || value.includes(`/yy/order/${orderId}/transition`)
    })
    .slice(0, 10)
    .map(log => ({
      operId: String(log.operId || log.id || ''),
      operUrl: String(log.operUrl || ''),
      requestMethod: String(log.requestMethod || ''),
      operName: String(log.operName || '').trim() ? '[operator-present]' : '',
      deptName: String(log.deptName || ''),
      status: Number(log.status || 0),
      operTime: String(log.operTime || log.createTime || ''),
      operParam: safe(log.operParam || ''),
      errorMsg: safe(log.errorMsg || ''),
    }))
  const hasRescheduleLog = matchedLogs.some(log => log.operUrl.includes(`/yy/order/${orderId}/reschedule`))
  const hasCancelLog = matchedLogs.some(log => log.operUrl.includes(`/yy/order/${orderId}/transition`))
  const missingOperatorLogs = matchedLogs.filter(log => !log.operName.trim())
  result.operationLogs = {
    checked: true,
    expectedOrderId: orderId,
    hasRescheduleLog,
    hasCancelLog,
    operatorPresent: missingOperatorLogs.length === 0,
    matched: matchedLogs,
  }
  if (!hasRescheduleLog) throw new Error('operation log for reschedule was not found')
  if (!hasCancelLog) throw new Error('operation log for cancel transition was not found')
  if (missingOperatorLogs.length > 0) throw new Error('operation log operator name is missing')
} catch (error) {
  result.status = 'FAIL'
  result.errors.push(safe(error.message))
  if (createdOrder?.id && currentOrderStatus !== 'CANCELLED') {
    result.cleanup.attempted = true
    try {
      const cancelled = await request(`/yy/order/${createdOrder.id}/transition`, {
        method: 'POST',
        body: {
          expectedStatus: currentOrderStatus,
          targetStatus: 'CANCELLED',
          remark: 'CODEx_LOOP cleanup after failed appointment write smoke',
        },
      })
      result.cleanup.status = String(cancelled.data?.status || 'UNKNOWN')
      result.cleanup.afterFailureOrderId = String(cancelled.data?.id || createdOrder.id)
    } catch (cleanupError) {
      result.cleanup.status = 'FAILED'
      result.cleanup.error = safe(cleanupError.message)
    }
  }
} finally {
  writeOutputs()
}

console.log(JSON.stringify({
  status: result.status,
  outputDir,
  orderId: result.order.created?.id || '',
  cleanup: result.cleanup.status,
  oldSlot: result.selected.oldSlot ? `${result.selected.oldSlot.bizDate} ${result.selected.oldSlot.startTime}-${result.selected.oldSlot.endTime}` : '',
  newSlot: result.selected.newSlot ? `${result.selected.newSlot.bizDate} ${result.selected.newSlot.startTime}-${result.selected.newSlot.endTime}` : '',
  errors: result.errors,
}, null, 2))

if (result.status !== 'PASS') {
  process.exitCode = 1
}
