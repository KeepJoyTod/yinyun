import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = (process.env.STUDIO_MF_BASE_URL || 'https://studio.evanshine.me').replace(/\/+$/, '')
const apiBaseUrl = (process.env.STUDIO_MF_API_BASE_URL || 'https://api.evanshine.me').replace(/\/+$/, '')
const releaseId = process.env.STUDIO_MF_RELEASE_ID || ''
const outputDir = process.env.STUDIO_MF_OUTPUT_DIR || path.resolve('docs/evidence/studio-micro-form-booking-smoke')
const username = process.env.STUDIO_MF_USERNAME || ''
const password = process.env.STUDIO_MF_PASSWORD || ''
const clientId = process.env.STUDIO_MF_CLIENT_ID || 'e5cd7e4891bf95d1d19206ce24a7b32e'
const tenantId = process.env.STUDIO_MF_TENANT_ID || '000000'
const confirmWrite = process.env.STUDIO_MF_CONFIRM_WRITE_LOCAL_DB === '1'
const createBooking = process.env.STUDIO_MF_CREATE_BOOKING === '1'
const headed = process.env.STUDIO_MF_HEADED === '1'

if (!confirmWrite) throw new Error('Missing STUDIO_MF_CONFIRM_WRITE_LOCAL_DB=1')
if (!username || !password) throw new Error('Missing STUDIO_MF_USERNAME/STUDIO_MF_PASSWORD')

fs.mkdirSync(outputDir, { recursive: true })

const suffix = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const prefix = `CODEx_MF_${suffix}`
const syntheticCustomer = {
  name: `${prefix}_CUSTOMER`,
  phone: ['199', suffix.slice(-4), '0000'].join(''),
}

const result = {
  status: 'PASS',
  checkedAt: new Date().toISOString(),
  baseUrl,
  apiBaseUrl,
  releaseId,
  releaseTxt: '',
  markerMatched: false,
  boundary: 'WRITE_LOCAL_DB: creates one synthetic micro form and one public submission, verifies staff booking prefill through the real logged-in UI, then deletes the synthetic submission/form. With STUDIO_MF_CREATE_BOOKING=1 only, it also clicks 按该时段录入, saves one synthetic local staff booking with 发送通知 disabled, verifies inventory/follow status, cancels it, and checks inventory rollback. It never writes Douyin platform state.',
  selected: {},
  created: {
    formId: '',
    submissionId: '',
    orderId: '',
  },
  fullBooking: {
    enabled: createBooking,
    status: createBooking ? 'PENDING' : 'SKIPPED',
    inventory: {},
    submissionFollow: {},
    order: {},
    operationLogs: {
      status: 'SKIPPED',
      afterCreate: [],
      afterCancel: [],
      matched: {},
      error: '',
    },
  },
  ui: [],
  cleanup: {
    attempted: true,
    items: [],
  },
  consoleErrors: [],
  pageErrors: [],
  screenshots: [],
  errors: [],
}

let token = ''
let createdFormId = ''
let createdSubmissionId = ''
let createdOrderId = ''
let currentOrderStatus = 'PENDING'
let browser

const safe = value => String(value || '')
  .replace(/1\d{10}/g, '1**********')
  .replace(/\b\d{8,}\b/g, '[redacted-id]')
  .slice(0, 1200)

const parseJsonSafe = value => {
  try {
    return JSON.parse(String(value || '{}'))
  } catch {
    return {}
  }
}

const markFail = error => {
  result.status = 'FAIL'
  if (createBooking && result.fullBooking.status === 'RUNNING') {
    result.fullBooking.status = 'FAIL'
  }
  result.errors.push(safe(error?.message || error))
}

const addUi = (key, status, detail = '') => {
  result.ui.push({ key, status, detail: safe(detail) })
  if (status !== 'PASS') result.status = 'FAIL'
}

const request = async (apiPath, options = {}) => {
  const url = new URL(apiPath, `${apiBaseUrl}/`)
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token && options.auth !== false) headers.set('Authorization', `Bearer ${token}`)
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
  if (!response.ok) throw new Error(`${apiPath} http ${response.status}: ${safe(json.msg || json.message || text)}`)
  if (typeof json.code === 'number' && ![0, 200].includes(json.code)) {
    throw new Error(`${apiPath} business ${json.code}: ${safe(json.msg || json.message || text)}`)
  }
  return json
}

const rows = async (apiPath, query = {}) => {
  const json = await request(apiPath, { query: { pageNum: 1, pageSize: 5000, ...query } })
  return Array.isArray(json.rows) ? json.rows : []
}

const data = async (apiPath, options = {}) => {
  const json = await request(apiPath, options)
  return json.data ?? json
}

const loginApi = async () => {
  const json = await request('/auth/login', {
    method: 'POST',
    auth: false,
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

const toYmd = date => new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(date)

const addDays = days => new Date(Date.now() + days * 24 * 60 * 60 * 1000)

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

const isUiBookableSlot = slot =>
  slot.status !== 'DISABLED'
  && slot.startTime
  && slot.endTime
  && slot.conflictCount <= 0
  && slot.capacity > slot.paidCount

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

const findCreatedSyntheticOrder = async () => {
  if (createdOrderId) return createdOrderId
  const list = await rows('/yy/order/list', {
    customerName: syntheticCustomer.name,
    storeId: result.selected?.storeId,
    pageSize: 20,
  })
  const order = list.find(item => String(item.customerName || '') === syntheticCustomer.name)
  if (!order?.id) return ''
  createdOrderId = String(order.id)
  currentOrderStatus = String(order.status || currentOrderStatus || 'PENDING').toUpperCase()
  result.created.orderId = createdOrderId
  return createdOrderId
}

const compactOperationLog = row => ({
  id: String(row.operId || row.id || ''),
  title: safe(row.title || ''),
  method: safe(row.requestMethod || ''),
  url: safe(row.operUrl || ''),
  operatorPresent: Boolean(String(row.operName || '').trim()),
  deptName: safe(row.deptName || ''),
  status: String(row.status ?? ''),
  errorMessage: safe(row.errorMsg || ''),
  happenedAt: safe(row.operTime || row.createTime || ''),
})

const operationLogHaystack = row => [
  row.title,
  row.method,
  row.requestMethod,
  row.operUrl,
  row.operParam,
  row.jsonResult,
  row.errorMsg,
].map(value => String(value || '')).join('\n')

const collectOperationLogEvidence = async stage => {
  if (!createBooking || !createdOrderId) return
  try {
    const list = await rows('/monitor/operlog/list', {
      orderByColumn: 'operTime',
      isAsc: 'descending',
      pageSize: 200,
    })
    const orderId = String(createdOrderId)
    const submissionId = String(createdSubmissionId)
    const matched = list.filter(row => {
      const haystack = operationLogHaystack(row)
      const hasContext = haystack.includes(orderId) || (submissionId && haystack.includes(submissionId)) || haystack.includes(prefix)
      const hasEndpoint = /\/yy\/order\/staff-booking|\/yy\/order\/\d+\/transition|\/yy\/microFormSubmission\/follow/i.test(haystack)
      return hasContext && hasEndpoint
    }).slice(0, 12)
    const compact = matched.map(compactOperationLog)
    result.fullBooking.operationLogs[stage] = compact
    const previousMatched = result.fullBooking.operationLogs.matched || {}
    const currentMatched = {
      staffBooking: matched.some(row => /\/yy\/order\/staff-booking/i.test(operationLogHaystack(row))),
      follow: matched.some(row => /\/yy\/microFormSubmission\/follow/i.test(operationLogHaystack(row))),
      cancel: matched.some(row => new RegExp(`/yy/order/${orderId}/transition`, 'i').test(operationLogHaystack(row))),
      operatorPresent: compact.some(log => log.operatorPresent),
    }
    result.fullBooking.operationLogs.matched = {
      staffBooking: Boolean(previousMatched.staffBooking || currentMatched.staffBooking),
      follow: Boolean(previousMatched.follow || currentMatched.follow),
      cancel: Boolean(previousMatched.cancel || currentMatched.cancel),
      operatorPresent: Boolean(previousMatched.operatorPresent || currentMatched.operatorPresent),
    }
    const matchedState = result.fullBooking.operationLogs.matched
    result.fullBooking.operationLogs.status = matchedState.staffBooking && matchedState.follow && matchedState.cancel
      ? 'PASS'
      : 'WARN'
  } catch (error) {
    result.fullBooking.operationLogs.status = 'WARN'
    result.fullBooking.operationLogs.error = safe(error?.message || error)
  }
}

const cancelSyntheticOrder = async (label = 'cancel synthetic staff booking') => {
  const orderId = await findCreatedSyntheticOrder()
  if (!orderId || currentOrderStatus === 'CANCELLED') return
  await cleanupStep(label, async () => {
    const cancelled = await data(`/yy/order/${orderId}/transition`, {
      method: 'POST',
      body: {
        expectedStatus: currentOrderStatus,
        targetStatus: 'CANCELLED',
        remark: `${prefix} synthetic micro-form booking cleanup`,
      },
    })
    currentOrderStatus = String(cancelled?.status || 'CANCELLED').toUpperCase()
    result.fullBooking.order.cancelled = {
      id: orderId,
      status: currentOrderStatus,
      inventoryStatus: String(cancelled?.inventoryStatus || ''),
    }
  })
  await collectOperationLogEvidence('afterCancel')
}

const chooseStoreAndSlot = async () => {
  const stores = await rows('/yy/store/list')
  const store = stores.find(visibleStore)
  if (!store?.id) throw new Error('No visible real store found')

  const storeId = String(store.id)
  const serviceGroups = await rows('/yy/serviceGroup/list')
  const serviceGroup = serviceGroups.find(group => String(group.storeId || '') === storeId)
    || serviceGroups.find(group => String(group.status || '').toUpperCase() === 'ACTIVE')
    || serviceGroups[0]
  if (!serviceGroup?.id) throw new Error('No service group found for micro form booking smoke')

  const beginBizDate = toYmd(addDays(1))
  const endBizDate = toYmd(addDays(7))
  const slots = await rows('/yy/bookingSlotInventory/list', {
    storeId,
    serviceGroupId: String(serviceGroup.id),
    beginBizDate,
    endBizDate,
  })
  const availableSlot = slots
    .map(normalizeSlot)
    .filter(slot =>
      slot.storeId === storeId
      && slot.serviceGroupId === String(serviceGroup.id)
      && isUiBookableSlot(slot),
    )
    .sort((a, b) => slotKey(a).localeCompare(slotKey(b)))[0]

  if (createBooking && !availableSlot) {
    throw new Error('No available real inventory slot found for full micro-form booking smoke')
  }

  const slot = availableSlot || {
    id: '',
    storeId,
    serviceGroupId: String(serviceGroup.id),
    bizDate: beginBizDate,
    startTime: '10:00',
    endTime: '10:30',
    capacity: 0,
    paidCount: 0,
    conflictCount: 0,
    status: 'NO_MATCHING_INVENTORY_FALLBACK',
  }

  result.selected = {
    storeId,
    storeName: String(store.storeName || store.name || ''),
    serviceGroupId: String(serviceGroup.id),
    serviceGroupName: String(serviceGroup.groupName || serviceGroup.name || serviceGroup.serviceGroupName || ''),
    slot,
  }
  return result.selected
}

const createSyntheticMicroForm = async selected => {
  const formName = `${prefix}_BOOKING_PREFILL_FORM`
  await request('/yy/microForm', {
    method: 'POST',
    body: {
      storeId: selected.storeId,
      formName,
      status: 'DRAFT',
      schemaJson: JSON.stringify({
        schemaVersion: 2,
        fields: [
          { id: 'customerName', label: '姓名', type: 'text', required: true, sort: 1 },
          { id: 'customerPhone', label: '手机号', type: 'text', required: true, sort: 2 },
          { id: 'serviceText', label: '拍摄服务', type: 'text', required: true, sort: 3 },
          { id: 'bookingDate', label: '期望日期', type: 'text', required: true, sort: 4 },
          { id: 'bookingTime', label: '期望时间', type: 'text', required: true, sort: 5 },
          { id: '__storeId', label: '绑定门店', type: 'text', required: false, sort: 6 },
          { id: '__serviceGroupId', label: '绑定服务组', type: 'text', required: false, sort: 7 },
        ],
      }),
      notifyUsers: '',
      linkKey: `codex-mf-${suffix.toLowerCase()}`,
      remark: `${prefix} synthetic booking prefill smoke`,
    },
  })
  const form = (await rows('/yy/microForm/list', { formName }))
    .find(item => String(item.formName || '') === formName)
  if (!form?.id) throw new Error('Cannot find created synthetic micro form')
  createdFormId = String(form.id)
  result.created.formId = createdFormId

  await data(`/yy/microForm/${createdFormId}/publish`, { method: 'POST' })
  await data(`/yy/client/microForm/${createdFormId}`, { auth: false })

  const answers = {
    customerName: syntheticCustomer.name,
    customerPhone: syntheticCustomer.phone,
    serviceText: selected.serviceGroupName || '证件照预约',
    bookingDate: selected.slot.bizDate,
    bookingTime: `${selected.slot.startTime}-${selected.slot.endTime}`,
    __storeId: selected.storeId,
    __serviceGroupId: selected.serviceGroupId,
  }
  const submit = await data(`/yy/client/microForm/${createdFormId}/submit`, {
    method: 'POST',
    auth: false,
    body: {
      customerName: syntheticCustomer.name,
      customerPhone: syntheticCustomer.phone,
      answers,
    },
  })
  createdSubmissionId = String(submit.submissionId || '')
  if (!createdSubmissionId) throw new Error('Public micro form submit did not return submissionId')
  result.created.submissionId = createdSubmissionId

  const found = (await rows('/yy/microFormSubmission/list', { formId: createdFormId }))
    .find(item => String(item.id || '') === createdSubmissionId)
  if (!found?.id) throw new Error('Cannot find created synthetic micro form submission')
}

const cleanupStep = async (label, runner) => {
  const item = { label, status: 'PENDING', error: '' }
  result.cleanup.items.push(item)
  try {
    await runner()
    item.status = 'PASS'
  } catch (error) {
    item.status = 'FAIL'
    item.error = safe(error.message)
    if (result.status === 'PASS') result.status = 'PARTIAL'
  }
}

const cleanupSyntheticData = async () => {
  if (createBooking) {
    await cancelSyntheticOrder()
  }
  if (createdSubmissionId) {
    await cleanupStep('delete synthetic micro form submission', async () => {
      await request(`/yy/microFormSubmission/${createdSubmissionId}`, { method: 'DELETE' })
    })
  }
  if (createdFormId) {
    await cleanupStep('offline synthetic micro form', async () => {
      await request(`/yy/microForm/${createdFormId}/offline`, { method: 'POST' })
    })
    await cleanupStep('delete synthetic micro form', async () => {
      await request(`/yy/microForm/${createdFormId}`, { method: 'DELETE' })
    })
  }
}

const routeUrl = routePath => {
  const url = new URL(routePath, `${baseUrl}/`)
  url.searchParams.set('cb', releaseId || `mf-smoke-${Date.now()}`)
  return url.toString()
}

const redactPage = async page => {
  await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const nodes = []
    while (walker.nextNode()) nodes.push(walker.currentNode)
    for (const node of nodes) {
      node.nodeValue = String(node.nodeValue || '')
        .replace(/1\d{10}/g, '1**********')
        .replace(/\b\d{8,}\b/g, '[redacted-id]')
    }
  }).catch(() => {})
}

const screenshot = async (page, key) => {
  await redactPage(page)
  const file = path.join(outputDir, `${String(result.screenshots.length + 1).padStart(2, '0')}-${key}.png`)
  await page.screenshot({ path: file, fullPage: false })
  result.screenshots.push(file)
  return file
}

const fieldValueByLabel = async (page, labelText) => page.evaluate(label => {
  const roots = Array.from(document.querySelectorAll('section'))
    .filter(node => String(node.textContent || '').includes('新增服务订单'))
    .filter(node => {
      const style = window.getComputedStyle(node)
      const rect = node.getBoundingClientRect()
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
    })
  const root = roots.at(-1) || document
  const labels = Array.from(root.querySelectorAll('label'))
  const hit = labels.find(item => String(item.textContent || '').includes(label))
  const field = hit?.querySelector('input, textarea, select')
  if (!field) return ''
  if (field.tagName === 'SELECT') {
    const select = field
    return select.options[select.selectedIndex]?.textContent?.trim() || select.value || ''
  }
  return field.value || ''
}, labelText)

const loginUi = async page => {
  await page.goto(`${baseUrl}/login?redirect=/order/forms&cb=${encodeURIComponent(releaseId || 'micro-form-booking-smoke')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  })
  await page.getByLabel('账号').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: /进入门店工作台|正在进入/ }).click()
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 45000 })
  const hasToken = await page.evaluate(() => Boolean(window.localStorage.getItem('yingyue_studio_workbench_access_token') || window.localStorage.getItem('Admin-Token')))
  if (!hasToken) throw new Error('UI login completed without token')
  addUi('login', 'PASS', 'token accepted')
}

const waitForSubmissionFollowed = async page => {
  let submission = null
  for (let index = 0; index < 20; index += 1) {
    submission = await data(`/yy/microFormSubmission/${createdSubmissionId}`)
    if (String(submission?.followStatus || '').toUpperCase() === 'FOLLOWED' && submission?.orderId) {
      return submission
    }
    await page.waitForTimeout(500)
  }
  return submission
}

const verifyFullBookingWrite = async (page, selected, hasRequestedSlotAction) => {
  if (!createBooking) return
  result.fullBooking.status = 'RUNNING'
  if (!hasRequestedSlotAction) {
    throw new Error('Full micro-form booking smoke requires 按该时段录入, but the selected slot needs inventory handling')
  }

  const before = await querySlotSnapshot(selected.slot)
  result.fullBooking.inventory.before = before
  if (before.status === 'MISSING' || before.capacity <= before.paidCount || before.conflictCount > 0) {
    throw new Error(`Selected slot is not bookable before save: ${safe(JSON.stringify(before))}`)
  }

  const closeButton = page.getByRole('button', { name: '关闭' }).last()
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click()
    await page.waitForTimeout(500)
  }

  await page.getByRole('button', { name: '按该时段录入' }).first().click()
  await page.waitForSelector('text=新增服务订单', { timeout: 45000 })
  await page.waitForTimeout(800)
  await screenshot(page, 'staff-booking-scheduled-before-assert')

  const scheduledModeText = await fieldValueByLabel(page, '档期')
  result.fullBooking.modalValues = {
    scheduleModeText: safe(scheduledModeText),
  }
  if (!scheduledModeText.includes('已定档期')) {
    throw new Error(`按该时段录入 did not switch schedule mode to 已定档期: ${safe(scheduledModeText)}`)
  }
  const nameValue = await fieldValueByLabel(page, '客户姓名')
  const phoneValue = await fieldValueByLabel(page, '客户手机号')
  const remarkValue = await fieldValueByLabel(page, '备注')
  if (nameValue !== syntheticCustomer.name) throw new Error(`Customer name prefill mismatch after scheduled slot: ${safe(nameValue)}`)
  if (String(phoneValue).replace(/\D/g, '') !== syntheticCustomer.phone) throw new Error('Customer phone prefill mismatch after scheduled slot')
  if (!String(remarkValue).includes('来源：微表单')) throw new Error('Remark does not include micro form source after scheduled slot')

  const notifyCheckbox = page.getByLabel('发送通知')
  if (await notifyCheckbox.isChecked().catch(() => false)) {
    await notifyCheckbox.uncheck()
  }
  if (await notifyCheckbox.isChecked().catch(() => false)) {
    throw new Error('发送通知 checkbox is still checked before synthetic booking save')
  }
  await screenshot(page, 'staff-booking-scheduled-before-save')

  const [staffBookingResponse] = await Promise.all([
    page.waitForResponse(response =>
      response.url().includes('/yy/order/staff-booking')
      && response.request().method().toUpperCase() === 'POST',
      { timeout: 60000 },
    ),
    page.waitForURL(url => url.pathname === '/order/appointment', { timeout: 60000 }),
    page.getByRole('button', { name: '保存', exact: true }).click(),
  ])
  if (!staffBookingResponse.ok()) {
    throw new Error(`/yy/order/staff-booking returned http ${staffBookingResponse.status()}`)
  }
  const staffBookingRequestPayload = parseJsonSafe(staffBookingResponse.request().postData() || '{}')
  result.fullBooking.staffBookingRequest = {
    scheduleMode: String(staffBookingRequestPayload.scheduleMode || ''),
    arrivalTime: String(staffBookingRequestPayload.arrivalTime || ''),
    slotDate: String(staffBookingRequestPayload.slotDate || ''),
    slotStartTime: String(staffBookingRequestPayload.slotStartTime || ''),
    slotEndTime: String(staffBookingRequestPayload.slotEndTime || ''),
    storeId: staffBookingRequestPayload.storeId ? String(staffBookingRequestPayload.storeId) : '',
    serviceGroupId: staffBookingRequestPayload.serviceGroupId ? String(staffBookingRequestPayload.serviceGroupId) : '',
  }
  if (result.fullBooking.staffBookingRequest.scheduleMode !== 'SCHEDULED') {
    throw new Error(`staff booking request scheduleMode is not SCHEDULED: ${safe(JSON.stringify(result.fullBooking.staffBookingRequest))}`)
  }
  if (
    result.fullBooking.staffBookingRequest.slotDate !== selected.slot.bizDate
    || result.fullBooking.staffBookingRequest.slotStartTime !== selected.slot.startTime
    || result.fullBooking.staffBookingRequest.slotEndTime !== selected.slot.endTime
  ) {
    throw new Error(`staff booking request slot mismatch: ${safe(JSON.stringify(result.fullBooking.staffBookingRequest))}`)
  }
  await page.waitForTimeout(1500)

  const submission = await waitForSubmissionFollowed(page)
  result.fullBooking.submissionFollow = {
    followStatus: String(submission?.followStatus || ''),
    orderId: submission?.orderId ? String(submission.orderId) : '',
    followRemark: safe(submission?.followRemark || ''),
  }
  if (String(submission?.followStatus || '').toUpperCase() !== 'FOLLOWED' || !submission?.orderId) {
    throw new Error(`Micro-form submission was not marked FOLLOWED with orderId: ${safe(JSON.stringify(result.fullBooking.submissionFollow))}`)
  }

  createdOrderId = String(submission.orderId)
  result.created.orderId = createdOrderId
  const order = await data(`/yy/order/${createdOrderId}`)
  currentOrderStatus = String(order?.status || 'PENDING').toUpperCase()
  result.fullBooking.order.created = {
    id: createdOrderId,
    orderNo: safe(order?.orderNo || ''),
    status: currentOrderStatus,
    inventoryStatus: String(order?.inventoryStatus || ''),
    customerName: syntheticCustomer.name,
    customerPhone: '1**********',
  }
  await collectOperationLogEvidence('afterCreate')

  const afterCreate = await querySlotSnapshot(selected.slot)
  result.fullBooking.inventory.afterCreate = afterCreate
  if (afterCreate.paidCount !== before.paidCount + 1) {
    throw new Error(`slot paidCount did not increase by 1 after micro-form booking save: before=${before.paidCount}, after=${afterCreate.paidCount}`)
  }

  await cancelSyntheticOrder('cancel synthetic staff booking after micro-form smoke')
  const final = await querySlotSnapshot(selected.slot)
  result.fullBooking.inventory.final = final
  if (final.paidCount !== before.paidCount) {
    throw new Error(`slot paidCount did not rollback after cancel: before=${before.paidCount}, final=${final.paidCount}`)
  }

  result.fullBooking.status = 'PASS'
  addUi(
    'micro-form-full-booking-cancel-rollback',
    'PASS',
    `${selected.slot.bizDate} ${selected.slot.startTime}-${selected.slot.endTime}; paidCount ${before.paidCount}->${afterCreate.paidCount}->${final.paidCount}`,
  )
}

const verifyUiFlow = async selected => {
  result.releaseTxt = await fetch(`${baseUrl}/release.txt`, { cache: 'no-store' })
    .then(response => response.text())
    .then(text => text.trim())
    .catch(error => `ERROR:${safe(error.message)}`)
  result.markerMatched = releaseId ? result.releaseTxt === releaseId : Boolean(result.releaseTxt)

  browser = await chromium.launch({ headless: !headed })
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  page.on('console', message => {
    if (message.type() === 'error') result.consoleErrors.push(safe(message.text()))
  })
  page.on('pageerror', error => result.pageErrors.push(safe(error.stack || error.message)))

  await loginUi(page)

  const formsUrl = new URL('/order/forms', `${baseUrl}/`)
  formsUrl.searchParams.set('formId', createdFormId)
  formsUrl.searchParams.set('cb', releaseId || `mf-smoke-${Date.now()}`)
  await page.goto(formsUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 45000 })
  let formsText = ''
  for (let index = 0; index < 2; index += 1) {
    await page.waitForFunction(
      expectedPrefix => document.body.innerText.includes(expectedPrefix) && document.body.innerText.includes('转预约'),
      prefix,
      { timeout: 20000 },
    ).catch(() => null)
    formsText = await page.locator('body').innerText({ timeout: 10000 })
    if (formsText.includes(prefix) && formsText.includes('转预约')) break
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 45000 })
  }
  if (!formsText.includes(prefix) || !formsText.includes('转预约')) {
    throw new Error('Synthetic submission is not visible in order form submissions UI')
  }
  addUi('order-form-submission-visible', 'PASS', `formId=${createdFormId}`)
  await screenshot(page, 'order-form-submission')

  await page.getByRole('button', { name: '转预约' }).first().click()
  await page.waitForURL(url => url.pathname === '/order/staff-booking' && url.searchParams.get('fromSubmissionId') === createdSubmissionId, { timeout: 45000 })
  await page.waitForSelector('text=客户期望时段', { timeout: 45000 })
  await page.waitForSelector('text=按该时段录入', { timeout: 45000 })
  await page.waitForTimeout(1200)

  const bodyText = await page.locator('body').innerText({ timeout: 10000 })
  const expectedTexts = [
    '客户期望时段',
    selected.slot.bizDate,
    selected.slot.startTime,
  ]
  const missing = expectedTexts.filter(text => !bodyText.includes(text))
  if (missing.length) throw new Error(`Staff booking prefill page missing text: ${missing.join(',')}`)

  const hasRequestedSlotAction = bodyText.includes('按该时段录入')
  const hasInventoryAction = bodyText.includes('去库存处理')
  if (!hasRequestedSlotAction && !hasInventoryAction) {
    throw new Error('Staff booking page has neither requested-slot booking action nor inventory handling action')
  }
  addUi(
    'staff-booking-prefill',
    'PASS',
    `${selected.slot.bizDate} ${selected.slot.startTime}-${selected.slot.endTime}; action=${hasRequestedSlotAction ? '按该时段录入' : '去库存处理'}`,
  )
  await screenshot(page, 'staff-booking-prefill')
  await verifyFullBookingWrite(page, selected, hasRequestedSlotAction)

  if (result.pageErrors.length) {
    throw new Error(`Page runtime errors during micro form booking smoke: ${result.pageErrors.join(' | ')}`)
  }
}

const writeOutputs = () => {
  const jsonPath = path.join(outputDir, 'micro-form-booking-smoke.json')
  const mdPath = path.join(outputDir, 'micro-form-booking-smoke.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  const uiRows = result.ui.map(item => `| ${item.key} | ${item.status} | ${item.detail || ''} |`).join('\n')
  const cleanupRows = result.cleanup.items.map(item => `| ${item.label} | ${item.status} | ${item.error || ''} |`).join('\n')
  const content = [
    '# Studio Micro Form -> Staff Booking Smoke',
    '',
    `- Status: ${result.status}`,
    `- CheckedAt: ${result.checkedAt}`,
    `- BaseUrl: ${result.baseUrl}`,
    `- ApiBaseUrl: ${result.apiBaseUrl}`,
    `- ReleaseId: ${result.releaseId}`,
    `- ReleaseTxt: ${result.releaseTxt}`,
    `- MarkerMatched: ${result.markerMatched}`,
    '',
    '## Selected',
    '',
    '```json',
    JSON.stringify(result.selected, null, 2),
    '```',
    '',
    '## Created',
    '',
    '```json',
    JSON.stringify(result.created, null, 2),
    '```',
    '',
    '## Full Booking',
    '',
    '```json',
    JSON.stringify(result.fullBooking, null, 2),
    '```',
    '',
    '## UI',
    '',
    '| Key | Status | Detail |',
    '| --- | --- | --- |',
    uiRows || '| none | - | - |',
    '',
    '## Cleanup',
    '',
    '| Item | Status | Error |',
    '| --- | --- | --- |',
    cleanupRows || '| none | - | - |',
    '',
    '## Errors',
    '',
    result.errors.length ? result.errors.map(item => `- ${item}`).join('\n') : '- none',
    '',
    '## Boundary',
    '',
    result.boundary,
    '',
  ].join('\n')
  fs.writeFileSync(mdPath, content, 'utf8')
}

try {
  await loginApi()
  const selected = await chooseStoreAndSlot()
  await createSyntheticMicroForm(selected)
  await verifyUiFlow(selected)
} catch (error) {
  markFail(error)
} finally {
  if (browser) await browser.close()
  try {
    await cleanupSyntheticData()
  } catch (error) {
    if (result.status === 'PASS') result.status = 'PARTIAL'
    result.errors.push(`cleanup failed: ${safe(error.message)}`)
  }
  writeOutputs()
}

console.log(JSON.stringify({
  status: result.status,
  outputDir,
  releaseTxt: result.releaseTxt,
  markerMatched: result.markerMatched,
  formId: result.created.formId ? '[created]' : '',
  submissionId: result.created.submissionId ? '[created]' : '',
  orderId: result.created.orderId ? '[created-cancelled]' : '',
  fullBooking: result.fullBooking.status,
  ui: result.ui,
  cleanupFailures: result.cleanup.items.filter(item => String(item.status).startsWith('FAIL')).map(item => item.label),
  consoleErrorCount: result.consoleErrors.length,
  pageErrorCount: result.pageErrors.length,
  errorCount: result.errors.length,
}, null, 2))

if (result.status === 'FAIL') {
  process.exitCode = 1
}
