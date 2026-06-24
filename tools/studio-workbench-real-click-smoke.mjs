import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = (process.env.STUDIO_DEEP_BASE_URL || 'https://studio.evanshine.me').replace(/\/+$/, '')
const apiBaseUrl = (process.env.STUDIO_DEEP_API_BASE_URL || 'https://api.evanshine.me').replace(/\/+$/, '')
const releaseId = process.env.STUDIO_DEEP_RELEASE_ID || ''
const outputDir = process.env.STUDIO_DEEP_OUTPUT_DIR || path.resolve('docs/evidence/studio-real-click-smoke')
const username = process.env.STUDIO_DEEP_USERNAME || ''
const password = process.env.STUDIO_DEEP_PASSWORD || ''
const clientId = process.env.STUDIO_DEEP_CLIENT_ID || 'e5cd7e4891bf95d1d19206ce24a7b32e'
const tenantId = process.env.STUDIO_DEEP_TENANT_ID || '000000'
const headed = process.env.STUDIO_DEEP_HEADED === '1'
const confirmWrite = process.env.STUDIO_DEEP_CONFIRM_WRITE_LOCAL_DB === '1'

if (!confirmWrite) throw new Error('Missing STUDIO_DEEP_CONFIRM_WRITE_LOCAL_DB=1')
if (!username || !password) throw new Error('Missing STUDIO_DEEP_USERNAME/STUDIO_DEEP_PASSWORD')

fs.mkdirSync(outputDir, { recursive: true })

const result = {
  status: 'PASS',
  checkedAt: new Date().toISOString(),
  baseUrl,
  apiBaseUrl,
  releaseId,
  releaseTxt: '',
  markerMatched: false,
  boundary: 'WRITE_LOCAL_DB: creates one synthetic staff booking, clicks dashboard slot -> appointment detail, advances PENDING -> CONFIRMED, reschedules it through the real UI, verifies old/new slot inventory movement, marks ARRIVED, cancels it through the real UI, then verifies inventory rollback. It intentionally stops before SERVING/COMPLETED because SERVING is not cancellable.',
  selected: {},
  order: {
    statusFlow: [],
  },
  photo: {
    actions: [],
  },
  ui: [],
  inventory: {},
  cleanup: {
    attempted: false,
    status: 'NOT_NEEDED',
  },
  network: [],
  consoleErrors: [],
  ignoredConsoleErrors: [],
  pageErrors: [],
  screenshots: [],
  errors: [],
  failureEvidence: null,
}

const safe = value => String(value || '')
  .replace(/1\d{10}/g, '1**********')
  .replace(/\b\d{8,}\b/g, '[redacted-id]')
  .slice(0, 1000)
const escapeRegex = value => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const isIgnoredConsoleError = text => text.includes('Failed to load resource: net::ERR_CONNECTION_CLOSED')

const nowStamp = () => new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
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
const slotKey = slot => `${slot.bizDate} ${slot.startTime}-${slot.endTime}`

let token = ''
let createdOrder = null
let currentOrderStatus = 'PENDING'
let browser
let page

const fixturePngs = [
  {
    fileName: 'codex-order-drawer-photo-01.png',
    bytes: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', 'base64'),
  },
  {
    fileName: 'codex-order-drawer-photo-02.png',
    bytes: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARQAFT2H4swAAAABJRU5ErkJggg==', 'base64'),
  },
]

const request = async (apiPath, options = {}) => {
  const url = new URL(apiPath, `${apiBaseUrl}/`)
  for (const [key, value] of Object.entries(options.query || {})) {
    if (value === undefined || value === null || value === '') continue
    url.searchParams.set(key, String(value))
  }
  const headers = new Headers(options.headers || {})
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token && !options.noAuth) headers.set('Authorization', `Bearer ${token}`)
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

const data = async apiPath => (await request(apiPath)).data

const uploadFile = async (fileName, bytes, contentType = 'image/png') => {
  const url = new URL('/resource/oss/upload', `${apiBaseUrl}/`)
  const headers = new Headers({ repeatSubmit: 'false' })
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (clientId) headers.set('clientid', clientId)
  const formData = new FormData()
  formData.append('file', new Blob([bytes], { type: contentType }), fileName)
  const response = await fetch(url, { method: 'POST', headers, body: formData })
  const text = await response.text()
  let json = {}
  try {
    json = text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`/resource/oss/upload returned non-json ${response.status}: ${safe(text)}`)
  }
  if (!response.ok) throw new Error(`/resource/oss/upload http ${response.status}: ${safe(json.msg || text)}`)
  if (typeof json.code === 'number' && ![0, 200].includes(json.code)) {
    throw new Error(`/resource/oss/upload business ${json.code}: ${safe(json.msg || text)}`)
  }
  const ossId = json.data?.ossId
  if (!ossId) throw new Error('OSS upload returned no ossId')
  const oss = await request(`/resource/oss/listByIds/${ossId}`)
  const ossRecord = Array.isArray(oss.data) ? oss.data[0] : null
  const objectKey = String(ossRecord?.fileName || '')
  if (!objectKey) throw new Error('OSS objectKey lookup failed')
  return {
    ossId,
    objectKey,
    url: String(ossRecord?.url || json.data?.url || ''),
    fileName: String(json.data?.fileName || fileName),
  }
}

const loginApi = async () => {
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

const toYmdHms = date => {
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const listAlbumAssets = albumId => rows('/yy/photoAsset/list', { albumId })
const getAlbumById = albumId => data(`/yy/photoAlbum/${albumId}`)

const summarizeAlbum = async album => {
  const assets = await listAlbumAssets(album.id)
  return {
    id: String(album.id || ''),
    orderId: album.orderId == null ? '' : String(album.orderId),
    albumName: String(album.albumName || ''),
    customerName: safe(album.customerName || ''),
    customerPhone: safe(album.customerPhone || ''),
    status: String(album.status || ''),
    selectionStatus: String(album.selectionStatus || ''),
    assetCount: assets.length,
    selectedAssetCount: assets.filter(asset => String(asset.isSelected || '') === '1').length,
    visibleAssetCount: assets.filter(asset => String(asset.visible || '') === '1').length,
  }
}

const summarizeAlbumById = async albumId => summarizeAlbum(await getAlbumById(albumId))

const createLinkedSyntheticAlbum = async ({ storeId, suffix, syntheticName, syntheticPhone }) => {
  const albumName = `CODEx_ORDER_DRAWER_PHOTO_${suffix}`
  const accessCode = `PICK-CODEX-${suffix}`
  await request('/yy/photoAlbum', {
    method: 'POST',
    body: {
      storeId,
      orderId: createdOrder.id,
      albumName,
      customerName: syntheticName,
      customerPhone: syntheticPhone,
      publicToken: `codex-order-photo-${suffix}`,
      accessCode,
      channelType: 'MANUAL',
      status: 'ACTIVE',
      selectionStatus: 'WAITING',
      expireTime: toYmdHms(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      remark: `CODEx_SYNTHETIC order drawer photo delivery smoke ${suffix}`,
    },
  })
  const albums = await rows('/yy/photoAlbum/list')
  const album = albums
    .filter(item => String(item.albumName || '') === albumName)
    .sort((a, b) => String(b.id || '').localeCompare(String(a.id || '')))[0]
  if (!album?.id) throw new Error('Linked synthetic album was created but could not be found by albumName')
  result.photo.album = await summarizeAlbum(album)
  result.photo.actions.push({ action: 'createLinkedSyntheticAlbum', status: 'OK', albumId: String(album.id) })
  return album
}

const uploadAlbumFixtures = async album => {
  for (let index = 0; index < fixturePngs.length; index += 1) {
    const fixture = fixturePngs[index]
    const uploaded = await uploadFile(`${Date.now()}-${fixture.fileName}`, fixture.bytes)
    await request('/yy/photoAsset', {
      method: 'POST',
      body: {
        storeId: album.storeId,
        albumId: album.id,
        fileName: fixture.fileName,
        fileUrl: uploaded.url,
        objectKey: uploaded.objectKey,
        thumbnailObjectKey: uploaded.objectKey,
        sort: index,
        isSelected: '0',
        visible: '1',
        remark: `CODEx_SYNTHETIC order drawer fixture asset ${index + 1}`,
      },
    })
  }
  result.photo.actions.push({ action: 'uploadAlbumFixtures', status: 'OK', count: fixturePngs.length })
}

const submitAlbumSelectionAsClient = async album => {
  const assets = await listAlbumAssets(album.id)
  const assetIds = assets
    .filter(asset => String(asset.visible || '') === '1')
    .slice(0, 2)
    .map(asset => asset.id)
    .filter(Boolean)
  if (!assetIds.length) throw new Error('Cannot submit album selection: no visible assets')
  const verify = await request('/client/photo/auth/verify', {
    method: 'POST',
    noAuth: true,
    body: {
      phone: album.customerPhone,
      code: album.accessCode,
      platform: 'H5',
    },
  })
  const clientToken = verify.data?.clientToken || ''
  if (!clientToken) throw new Error('Client photo verify returned no clientToken')
  const selection = await request(`/client/photo/albums/${album.id}/selection`, {
    method: 'POST',
    noAuth: true,
    headers: { 'X-Client-Token': clientToken },
    body: { assetIds },
  })
  result.photo.actions.push({
    action: 'submitAlbumSelectionAsClient',
    status: 'OK',
    count: assetIds.length,
    selectionStatus: String(selection.data?.selectionStatus || ''),
  })
}

const assertAlbumAfterDelivery = async album => {
  let latest = null
  for (let attempt = 0; attempt < 10; attempt += 1) {
    latest = await summarizeAlbumById(album.id)
    const status = latest.status.toUpperCase()
    const selectionStatus = latest.selectionStatus.toUpperCase()
    if (status === 'DELIVERED' || latest.status === '已交付' || selectionStatus === 'DELIVERED') {
      result.photo.albumAfterUiActions = latest
      result.photo.actions.push({
        action: 'album-delivered-backend',
        status: latest.status,
        selectionStatus: latest.selectionStatus,
      })
      recordStep('album-delivered-backend', 'PASS', `status=${latest.status}; selectionStatus=${latest.selectionStatus}`)
      return latest
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`album-delivered-backend did not reach delivered state; latest=${safe(JSON.stringify(latest || {}))}`)
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

  const starts = ['10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '18:00', '18:30']
  const chosen = []
  for (const startTime of starts) {
    const candidate = {
      id: '',
      storeId: String(storeId),
      serviceGroupId: String(serviceGroupId),
      bizDate: beginBizDate,
      startTime,
      endTime: addMinutesToClock(startTime, Math.min(Math.max(durationMinutes || 30, 30), 60)),
      capacity: 0,
      paidCount: 0,
      conflictCount: 0,
      status: 'SYNTHETIC_CANDIDATE',
    }
    const snapshot = await querySlotSnapshot(candidate)
    if (snapshot.status === 'MISSING' || snapshot.capacity <= 0 || snapshot.paidCount < snapshot.capacity) chosen.push(candidate)
    if (chosen.length >= 2) break
  }
  if (chosen.length < 2) throw new Error('No two available future slots found for real click smoke')
  return chosen
}

const fetchOrderBySlot = async slot => {
  const candidates = await rows('/yy/order/list', {
    storeId: slot.storeId,
    slotDate: slot.bizDate,
    slotStartTime: slot.startTime,
    slotEndTime: slot.endTime,
  })
  return candidates.find(row =>
    String(row.id || '') === String(createdOrder?.id || '')
    || String(row.orderNo || '') === String(createdOrder?.orderNo || ''),
  ) || null
}

const pollOrderStatus = async (expectedStatus, slot = result.selected.slot) => {
  for (let i = 0; i < 12; i += 1) {
    const row = await fetchOrderBySlot(slot)
    if (row && String(row.status || '').toUpperCase() === expectedStatus) return row
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return fetchOrderBySlot(slot)
}

const screenshot = async (page, key) => {
  await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const nodes = []
    while (walker.nextNode()) nodes.push(walker.currentNode)
    const originals = []
    for (const node of nodes) {
      const original = String(node.nodeValue || '')
      const redacted = original
        .replace(/1\d{10}/g, '1**********')
        .replace(/\b\d{8,}\b/g, '[redacted-id]')
      if (redacted !== original) {
        originals.push([node, original])
        node.nodeValue = redacted
      }
    }
    window.__codexRestoreSmokeScreenshotRedaction = () => {
      for (const [node, original] of originals) node.nodeValue = original
      delete window.__codexRestoreSmokeScreenshotRedaction
    }
  }).catch(() => {})
  const file = path.join(outputDir, `${String(result.screenshots.length + 1).padStart(2, '0')}-${key}.png`)
  try {
    await page.screenshot({ path: file, fullPage: false })
  } finally {
    await page.evaluate(() => {
      window.__codexRestoreSmokeScreenshotRedaction?.()
    }).catch(() => {})
  }
  result.screenshots.push(file)
  return file
}

const captureFailureEvidence = async (page, error) => {
  if (!page) return
  const currentUrl = await Promise.resolve(page.url()).catch(() => '')
  const title = await page.title().catch(() => '')
  const visibleText = await page.locator('body').innerText({ timeout: 3000 }).catch(() => '')
  result.failureEvidence = {
    currentUrl: safe(currentUrl),
    title: safe(title),
    error: safe(error?.message || error),
    visibleText: safe(visibleText),
    createdOrderId: safe(createdOrder?.id || ''),
    createdOrderNo: safe(createdOrder?.orderNo || ''),
    currentOrderStatus: safe(currentOrderStatus),
    lastNetwork: result.network.slice(-12),
  }
  await screenshot(page, 'failure-page').catch(() => {})
}

const recordStep = (key, status = 'PASS', detail = '') => {
  result.ui.push({ key, status, detail })
  if (status !== 'PASS') result.status = 'FAIL'
}

const operationStatusSuccessParts = ['成功']
const operationSourceParts = ['操作来源：']
const defaultPhotoActionLabels = new Set(['通知客户', '客片确认', '资料发送'])

const assertOperationEvidence = async (page, key, expectedParts) => {
  const aside = page.locator('aside').filter({ hasText: '订单操作总览' }).last()
  await aside.getByText('最近操作证据').waitFor({ timeout: 15000 })
  let lastText = ''
  for (let attempt = 0; attempt < 8; attempt += 1) {
    lastText = await aside.textContent({ timeout: 5000 }).catch(() => '')
    const missing = expectedParts.filter(part => !lastText.includes(part))
    if (!missing.length) {
      result.order.operationEvidence = result.order.operationEvidence || []
      result.order.operationEvidence.push({
        key,
        status: 'PASS',
        expectedParts: expectedParts.map(safe),
        text: safe(lastText),
      })
      recordStep(key, 'PASS', expectedParts.map(safe).join(' / '))
      return
    }
    if (attempt === 2) {
      await aside.getByRole('button', { name: '刷新最近操作证据' }).click().catch(() => {})
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`${key} operation evidence missing expected parts: ${safe(expectedParts.filter(part => !lastText.includes(part)).join(', '))}; text=${safe(lastText)}`)
}

const assertOperationTimeline = async (page, key, expectedParts) => {
  const aside = page.locator('aside').filter({ hasText: '订单操作总览' }).last()
  const foldout = aside.locator('details.order-detail-foldout').filter({ hasText: '完整操作记录' }).first()
  await foldout.scrollIntoViewIfNeeded()
  const isOpen = await foldout.evaluate(element => Boolean(element.open)).catch(() => false)
  if (!isOpen) await foldout.locator('summary').click()
  await foldout.getByText('完整操作记录').waitFor({ timeout: 15000 })

  let lastText = ''
  for (let attempt = 0; attempt < 8; attempt += 1) {
    lastText = await foldout.textContent({ timeout: 5000 }).catch(() => '')
    const missing = expectedParts.filter(part => !lastText.includes(part))
    if (!missing.length) {
      result.order.operationTimeline = result.order.operationTimeline || []
      result.order.operationTimeline.push({
        key,
        status: 'PASS',
        expectedParts: expectedParts.map(safe),
        text: safe(lastText),
      })
      recordStep(key, 'PASS', expectedParts.map(safe).join(' / '))
      return
    }
    if (attempt === 2) {
      await foldout.getByRole('button', { name: '刷新完整操作记录' }).click().catch(() => {})
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(`${key} operation timeline missing expected parts: ${safe(expectedParts.filter(part => !lastText.includes(part)).join(', '))}; text=${safe(lastText)}`)
}

const assertPhotoActionDisabledReasons = async (
  page,
  key,
  { requiredParts = [], forbiddenLabels = [...defaultPhotoActionLabels] } = {},
) => {
  const drawer = page.locator('aside').filter({ hasText: '订单操作总览' }).last()
  const section = drawer.locator('section').filter({ hasText: '客片交付状态' }).first()
  await section.getByText('客片交付状态').waitFor({ timeout: 15000 })

  let snapshot = null
  for (let attempt = 0; attempt < 8; attempt += 1) {
    snapshot = await section.evaluate((element, defaults) => {
      const buttons = Array.from(element.querySelectorAll('button')).map(button => ({
        text: button.textContent?.replace(/\s+/g, ' ').trim() || '',
        disabled: button.disabled,
        title: button.getAttribute('title') || '',
      }))
      const disabledTitles = buttons
        .filter(button => button.disabled && button.title)
        .map(button => button.title)
      const visibleReasons = Array.from(element.querySelectorAll('span'))
        .map(span => span.textContent?.replace(/\s+/g, ' ').trim() || '')
        .filter(text => text && !defaults.includes(text))
      return {
        buttons,
        disabledTitles: [...new Set(disabledTitles)],
        visibleReasons: [...new Set(visibleReasons)],
        sectionText: element.textContent?.replace(/\s+/g, ' ').trim() || '',
      }
    }, [...defaultPhotoActionLabels])

    const joined = [...snapshot.visibleReasons, ...snapshot.disabledTitles, snapshot.sectionText].join('\n')
    const missing = requiredParts.filter(part => !joined.includes(part))
    const leakedLabels = snapshot.visibleReasons.filter(reason => forbiddenLabels.includes(reason))
    if (!missing.length && !leakedLabels.length) {
      result.photo.disabledReasons = result.photo.disabledReasons || []
      result.photo.disabledReasons.push({
        key,
        status: 'PASS',
        requiredParts: requiredParts.map(safe),
        forbiddenLabels: forbiddenLabels.map(safe),
        visibleReasons: snapshot.visibleReasons.map(safe),
        disabledTitles: snapshot.disabledTitles.map(safe),
      })
      recordStep(key, 'PASS', snapshot.visibleReasons.map(safe).join(' / '))
      return
    }
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  const joined = [
    ...(snapshot?.visibleReasons || []),
    ...(snapshot?.disabledTitles || []),
    snapshot?.sectionText || '',
  ].join('\n')
  const missing = requiredParts.filter(part => !joined.includes(part))
  const leakedLabels = (snapshot?.visibleReasons || []).filter(reason => forbiddenLabels.includes(reason))
  throw new Error(`${key} photo disabled reason check failed; missing=${safe(missing.join(', '))}; leakedLabels=${safe(leakedLabels.join(', '))}; snapshot=${safe(JSON.stringify(snapshot || {}))}`)
}

const readTransitionResponse = async (response, actionKey) => {
  let body = ''
  try {
    body = await response.text()
  } catch {
    body = ''
  }
  let json = {}
  try {
    json = body ? JSON.parse(body) : {}
  } catch {
    json = {}
  }
  if (!response.ok()) {
    throw new Error(`${actionKey} transition http ${response.status()}: ${safe(body)}`)
  }
  if (typeof json.code === 'number' && ![0, 200].includes(json.code)) {
    throw new Error(`${actionKey} transition business ${json.code}: ${safe(json.msg || json.message || body)}`)
  }
  return json
}

const readWriteResponse = async (response, actionKey) => {
  let body = ''
  try {
    body = await response.text()
  } catch {
    body = ''
  }
  let json = {}
  try {
    json = body ? JSON.parse(body) : {}
  } catch {
    json = {}
  }
  if (!response.ok()) {
    throw new Error(`${actionKey} http ${response.status()}: ${safe(body)}`)
  }
  if (typeof json.code === 'number' && ![0, 200].includes(json.code)) {
    throw new Error(`${actionKey} business ${json.code}: ${safe(json.msg || json.message || body)}`)
  }
  return json
}

const statusLabels = {
  CONFIRMED: '已确认',
  ARRIVED: '已到店',
  SERVING: '服务中',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
}

const performStatusAction = async (page, label, expectedStatus) => {
  const actionButton = page.locator('aside').getByRole('button', { name: new RegExp(`^${label}$`) }).first()
  await actionButton.scrollIntoViewIfNeeded()
  const transitionResponsePromise = page.waitForResponse(
    response => /\/yy\/order\/.+\/transition\b/.test(response.url()),
    { timeout: 15000 },
  ).catch(() => null)
  await actionButton.click()
  const transitionResponse = await transitionResponsePromise
  if (!transitionResponse) {
    const feedback = await page.locator('[aria-label="订单操作反馈"], [role="status"]').last().textContent({ timeout: 3000 }).catch(() => '')
    throw new Error(`${label} did not send transition request; feedback=${safe(feedback)}`)
  }
  await readTransitionResponse(transitionResponse, label)
  currentOrderStatus = expectedStatus
  const next = await pollOrderStatus(expectedStatus)
  if (!next || String(next.status || '').toUpperCase() !== expectedStatus) {
    throw new Error(`${label} did not produce ${expectedStatus}, latest=${safe(JSON.stringify(next || {}))}`)
  }
  result.order.statusFlow.push({
    action: label,
    status: String(next.status || ''),
    inventoryStatus: String(next.inventoryStatus || ''),
  })
  const expectedStatusLabel = statusLabels[expectedStatus] || expectedStatus
  await page.locator('aside').getByText(expectedStatusLabel).first().waitFor({ timeout: 15000 }).catch(() => {})
  await assertOperationEvidence(page, `operation-evidence-status-${expectedStatus.toLowerCase()}`, [
    '最近操作证据',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '状态流转',
    '操作人：',
    '门店/部门：',
    '目标状态',
    expectedStatusLabel,
  ])
  await assertOperationTimeline(page, `operation-timeline-status-${expectedStatus.toLowerCase()}`, [
    '完整操作记录',
    '订单操作',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '状态流转',
    '门店/部门：',
    '目标状态',
    expectedStatusLabel,
  ])
  await screenshot(page, `order-status-${expectedStatus.toLowerCase()}`)
  recordStep(`ui-${expectedStatus.toLowerCase()}`, 'PASS', `${label} -> ${expectedStatus}`)
}

const performRescheduleAction = async (page, oldSlot, newSlot, beforeOld, beforeNew) => {
  const rescheduleSection = page.locator('section.order-reschedule-section').first()
  await rescheduleSection.scrollIntoViewIfNeeded()
  const slotButton = rescheduleSection.getByRole('button', { name: new RegExp(`${newSlot.startTime}-${newSlot.endTime}`) }).first()
  await slotButton.click()
  const remarkInput = rescheduleSection.locator('input[placeholder="客户要求 / 门店调整"]').first()
  await remarkInput.fill('客户要求改期')

  const rescheduleResponsePromise = page.waitForResponse(
    response => /\/yy\/order\/.+\/reschedule\b/.test(response.url()),
    { timeout: 15000 },
  ).catch(() => null)
  await rescheduleSection.getByRole('button', { name: /^保存改期$/ }).click()
  const rescheduleResponse = await rescheduleResponsePromise
  if (!rescheduleResponse) {
    const feedback = await page.locator('[aria-label="订单操作反馈"], [role="status"]').last().textContent({ timeout: 3000 }).catch(() => '')
    throw new Error(`UI reschedule did not send reschedule request; feedback=${safe(feedback)}`)
  }
  const responseJson = await readWriteResponse(rescheduleResponse, '保存改期')
  createdOrder = responseJson.data || createdOrder
  currentOrderStatus = String(createdOrder?.status || currentOrderStatus).toUpperCase()
  result.selected.slot = newSlot
  result.order.rescheduled = {
    id: String(createdOrder?.id || ''),
    orderNo: String(createdOrder?.orderNo || ''),
    status: currentOrderStatus,
    inventoryStatus: String(createdOrder?.inventoryStatus || ''),
    slotDate: String(createdOrder?.slotDate || ''),
    slotStartTime: String(createdOrder?.slotStartTime || ''),
    slotEndTime: String(createdOrder?.slotEndTime || ''),
  }

  const afterRescheduleOld = await querySlotSnapshot(oldSlot)
  const afterRescheduleNew = await querySlotSnapshot(newSlot)
  result.inventory.afterRescheduleOld = afterRescheduleOld
  result.inventory.afterRescheduleNew = afterRescheduleNew
  if (afterRescheduleOld.paidCount !== beforeOld.paidCount) {
    throw new Error(`old slot paidCount did not return after UI reschedule: before=${beforeOld.paidCount}, after=${afterRescheduleOld.paidCount}`)
  }
  if (afterRescheduleNew.paidCount !== beforeNew.paidCount + 1) {
    throw new Error(`new slot paidCount did not increase by 1 after UI reschedule: before=${beforeNew.paidCount}, after=${afterRescheduleNew.paidCount}`)
  }

  await page.locator('aside').getByText(`${newSlot.startTime}-${newSlot.endTime}`).first().waitFor({ timeout: 15000 }).catch(() => {})
  await assertOperationEvidence(page, 'operation-evidence-reschedule', [
    '最近操作证据',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '改期',
    '操作人：',
    '门店/部门：',
    '目标时段',
    `${newSlot.bizDate} ${newSlot.startTime}-${newSlot.endTime}`,
    '原因：客户要求改期',
  ])
  await assertOperationTimeline(page, 'operation-timeline-reschedule', [
    '完整操作记录',
    '订单操作',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '改期',
    '门店/部门：',
    '目标时段',
    `${newSlot.bizDate} ${newSlot.startTime}-${newSlot.endTime}`,
    '原因：客户要求改期',
  ])
  await screenshot(page, 'order-rescheduled')
  recordStep('ui-reschedule', 'PASS', `${oldSlot.startTime}-${oldSlot.endTime} -> ${newSlot.startTime}-${newSlot.endTime}`)
  recordStep('inventory-reschedule', 'PASS', `old ${beforeOld.paidCount}->${afterRescheduleOld.paidCount}; new ${beforeNew.paidCount}->${afterRescheduleNew.paidCount}`)
}

const waitForEnabledAlbumActionButton = async (button, label, timeoutMs = 20000) => {
  const startedAt = Date.now()
  let lastText = ''
  let lastTitle = ''
  while (Date.now() - startedAt < timeoutMs) {
    await button.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {})
    lastText = await button.textContent({ timeout: 1000 }).catch(() => '')
    lastTitle = await button.getAttribute('title').catch(() => '')
    const disabled = await button.isDisabled().catch(() => true)
    if (!disabled) return
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`${label} button did not become enabled; title=${safe(lastTitle)}; text=${safe(lastText)}`)
}

const waitForAlbumActionText = async (page, drawer, label, expectedTextParts = [], timeoutMs = 20000) => {
  const startedAt = Date.now()
  let feedback = ''
  let combinedText = ''
  while (Date.now() - startedAt < timeoutMs) {
    feedback = await page.locator('[role="status"]').last().textContent({ timeout: 1000 }).catch(() => '')
    const drawerText = await drawer.textContent({ timeout: 1000 }).catch(() => '')
    combinedText = `${feedback}\n${drawerText}`
    const missing = expectedTextParts.filter(part => !combinedText.includes(part))
    if (!missing.length) return { feedback, combinedText }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  const missing = expectedTextParts.filter(part => !combinedText.includes(part))
  throw new Error(`${label} UI feedback missing expected parts: ${safe(missing.join(', '))}; text=${safe(combinedText)}`)
}

const performOrderAlbumAction = async (page, label, actionKey, urlPattern, expectedRemark, expectedTextParts = []) => {
  const drawer = page.locator('aside').filter({ hasText: '订单操作总览' }).last()
  await drawer.getByText('客片交付状态').waitFor({ timeout: 15000 })
  const button = drawer.getByRole('button', { name: new RegExp(`^${label}$`) }).first()
  await waitForEnabledAlbumActionButton(button, label)
  await button.scrollIntoViewIfNeeded()
  const buttonBox = await button.boundingBox().catch(() => null)
  const beforeText = await drawer.textContent({ timeout: 5000 }).catch(() => '')
  const buttonDiagnostics = {
    label,
    disabled: await button.isDisabled().catch(() => true),
    title: safe(await button.getAttribute('title').catch(() => '')),
    text: safe(await button.textContent({ timeout: 3000 }).catch(() => '')),
    box: buttonBox,
    hitTarget: buttonBox ? await page.evaluate(({ x, y }) => {
      const element = document.elementFromPoint(x, y)
      return {
        tag: element?.tagName || '',
        text: element?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 200) || '',
        closestButtonText: element?.closest('button')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 200) || '',
        closestButtonDisabled: element?.closest('button') instanceof HTMLButtonElement
          ? element.closest('button').disabled
          : undefined,
      }
    }, { x: buttonBox.x + buttonBox.width / 2, y: buttonBox.y + buttonBox.height / 2 }).catch(error => ({ error: safe(error.message) })) : null,
    drawerText: safe(beforeText),
  }
  result.photo.buttonDiagnostics = result.photo.buttonDiagnostics || []
  result.photo.buttonDiagnostics.push(buttonDiagnostics)
  const disabled = await button.isDisabled().catch(() => true)
  if (disabled) {
    const title = await button.getAttribute('title').catch(() => '')
    throw new Error(`${label} button is disabled; title=${safe(title)}`)
  }

  const requestPromise = page.waitForRequest(
    request => urlPattern.test(request.url()),
    { timeout: 15000 },
  ).catch(() => null)
  const responsePromise = page.waitForResponse(
    response => urlPattern.test(response.url()),
    { timeout: 15000 },
  ).catch(() => null)
  await button.click()
  const request = await requestPromise
  const response = await responsePromise
  if (!request) throw new Error(`${label} did not send photo delivery request`)
  const postData = request.postData() || ''
  if (expectedRemark && !postData.includes(expectedRemark)) {
    throw new Error(`${label} request did not include order drawer remark ${expectedRemark}; postData=${safe(postData)}`)
  }
  if (!response) {
    const feedback = await page.locator('[role="status"]').last().textContent({ timeout: 3000 }).catch(() => '')
    throw new Error(`${label} did not send photo delivery request; feedback=${safe(feedback)}`)
  }
  const responseJson = await readWriteResponse(response, label)
  const { feedback } = await waitForAlbumActionText(page, drawer, label, expectedTextParts)
  result.photo.actions.push({
    action: actionKey,
    status: responseJson.data?.auditStatus || responseJson.data?.status || 'OK',
    fallback: Boolean(responseJson.data?.fallback),
    message: safe(responseJson.data?.message || responseJson.msg || feedback),
  })
  const uiStepKey = `ui-photo-${actionKey}`
  result.photo.expectedUiSteps = ['ui-photo-notify', 'ui-photo-confirm', 'ui-photo-deliver']
  recordStep(uiStepKey, 'PASS', `${label} -> ${safe(responseJson.data?.status || responseJson.data?.selectionStatus || responseJson.msg || 'OK')}`)
}

const assertOrderPhotoAccessJumpToAlbum = async (page, album, returnUrl) => {
  const frontendAlbumIds = [String(album.id), `ALB-${album.id}`]
  const drawer = page.locator('aside').filter({ hasText: '订单操作总览' }).last()
  const moreButton = drawer.getByRole('button', { name: '查看更多' }).first()
  await moreButton.waitFor({ timeout: 15000 })
  await moreButton.scrollIntoViewIfNeeded()
  await moreButton.click()
  await page.waitForURL(
    url => url.pathname === '/service/photos' && frontendAlbumIds.includes(url.searchParams.get('album') || ''),
    { timeout: 45000 },
  )
  const activeAlbumId = new URL(page.url()).searchParams.get('album') || ''
  await page.getByText('客片交付控制台').waitFor({ timeout: 45000 })
  await page.getByText(new RegExp(`Roll · (${frontendAlbumIds.map(escapeRegex).join('|')})`)).waitFor({ timeout: 45000 })
  await screenshot(page, 'photo-access-album-workspace')
  result.photo.actions.push({
    action: 'orderPhotoAccessJumpToAlbum',
    status: 'OK',
    albumQuery: safe(activeAlbumId),
    backendAlbumId: safe(album.id),
  })
  recordStep('photo-access-jump-to-album', 'PASS', `/service/photos?album=${safe(activeAlbumId)}`)

  await page.goto(returnUrl, { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByText(createdOrder.orderNo).waitFor({ timeout: 45000 })
  await page.locator('tr', { hasText: createdOrder.orderNo }).first().click()
  await page.locator('aside').filter({ hasText: '订单操作总览' }).last().getByText('客片交付状态').waitFor({ timeout: 45000 })
}

const writeOutputs = () => {
  const jsonPath = path.join(outputDir, 'real-click-smoke.json')
  const mdPath = path.join(outputDir, 'real-click-smoke.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  const uiRows = result.ui.map(step => `| ${step.key} | ${step.status} | ${step.detail || ''} |`).join('\n')
  const content = [
    '# Studio Workbench Real Click Smoke',
    '',
    `- Status: ${result.status}`,
    `- CheckedAt: ${result.checkedAt}`,
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
    '## UI Steps',
    '',
    '| Step | Status | Detail |',
    '| --- | --- | --- |',
    uiRows,
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
    '## Photo Delivery',
    '',
    '```json',
    JSON.stringify(result.photo, null, 2),
    '```',
    '',
    '## Cleanup',
    '',
    '```json',
    JSON.stringify(result.cleanup, null, 2),
    '```',
    '',
    '## Failure Evidence',
    '',
    '```json',
    JSON.stringify(result.failureEvidence, null, 2),
    '```',
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
  result.releaseTxt = await fetch(`${baseUrl}/release.txt`, { cache: 'no-store' })
    .then(response => response.text())
    .then(text => text.trim())
    .catch(error => `ERROR:${safe(error.message)}`)
  result.markerMatched = releaseId ? result.releaseTxt === releaseId : Boolean(result.releaseTxt)

  await loginApi()
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
  const beforeOld = await querySlotSnapshot(oldSlot)
  const beforeNew = await querySlotSnapshot(newSlot)

  const suffix = nowStamp().slice(4, 14)
  const syntheticPhone = `199${suffix.slice(0, 8)}`.slice(0, 11).padEnd(11, '0')
  const syntheticName = `CODEx_UI_${suffix}`
  const remark = `CODEx_UI_CLICK_SMOKE_${suffix}; auto-advance-and-cancel through UI`

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
      workstationNo: 'CODEx-UI',
      remark,
    },
  })
  createdOrder = created.data
  currentOrderStatus = String(createdOrder?.status || 'PENDING').toUpperCase()
  if (!createdOrder?.id || !createdOrder?.orderNo) throw new Error('staff booking returned no id/orderNo')

  result.selected = {
    storeId,
    storeName: String(store.storeName || store.name || ''),
    serviceGroupId,
    serviceGroupName: String(group.groupName || ''),
    slot: oldSlot,
    oldSlot,
    newSlot,
  }
  result.order.created = {
    id: String(createdOrder.id),
    orderNo: String(createdOrder.orderNo),
    status: currentOrderStatus,
    customerName: syntheticName,
    customerPhone: '1**********',
  }
  result.inventory.beforeOld = beforeOld
  result.inventory.beforeNew = beforeNew
  const afterCreateOld = await querySlotSnapshot(oldSlot)
  result.inventory.afterCreateOld = afterCreateOld
  if (afterCreateOld.paidCount !== beforeOld.paidCount + 1) {
    throw new Error(`old slot paidCount did not increase by 1 after create: before=${beforeOld.paidCount}, after=${afterCreateOld.paidCount}`)
  }

  const linkedAlbum = await createLinkedSyntheticAlbum({ storeId, suffix, syntheticName, syntheticPhone })
  await uploadAlbumFixtures(linkedAlbum)
  await submitAlbumSelectionAsClient(linkedAlbum)
  result.photo.album = await summarizeAlbum(linkedAlbum)

  browser = await chromium.launch({ headless: !headed })
  page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  page.on('console', message => {
    if (message.type() === 'error') {
      const text = safe(message.text())
      if (isIgnoredConsoleError(text)) {
        result.ignoredConsoleErrors.push(text)
        return
      }
      result.consoleErrors.push(text)
    }
  })
  page.on('pageerror', error => result.pageErrors.push(safe(error.message)))
  page.on('request', request => {
    if (!/\/yy\/(?:order\/.+\/(?:transition|reschedule)|photoAlbum\/.+\/(?:notify|selection\/confirm|deliver))\b/.test(request.url())) return
    result.network.push({
      type: 'request',
      method: request.method(),
      url: safe(request.url()),
      postData: safe(request.postData() || ''),
    })
  })
  page.on('response', async response => {
    if (!/\/yy\/(?:order\/.+\/(?:transition|reschedule)|photoAlbum\/.+\/(?:notify|selection\/confirm|deliver))\b/.test(response.url())) return
    let body = ''
    try {
      body = await response.text()
    } catch {
      body = ''
    }
    result.network.push({
      type: 'response',
      status: response.status(),
      url: safe(response.url()),
      body: safe(body),
    })
  })

  await page.goto(`${baseUrl}/login?redirect=/dashboard/today&cb=${encodeURIComponent(releaseId || 'real-click-smoke')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  })
  await page.getByLabel('账号').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: /进入门店工作台|正在进入/ }).click()
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 45000 })
  recordStep('login', 'PASS', 'token accepted')

  const dashboardUrl = new URL('/dashboard/today', `${baseUrl}/`)
  dashboardUrl.searchParams.set('date', oldSlot.bizDate)
  dashboardUrl.searchParams.set('storeId', storeId)
  dashboardUrl.searchParams.set('slotStart', oldSlot.startTime)
  dashboardUrl.searchParams.set('slotEnd', oldSlot.endTime)
  dashboardUrl.searchParams.set('cb', releaseId || 'real-click-smoke')
  await page.goto(dashboardUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByText('上午 / 下午 / 晚上时段').waitFor({ timeout: 45000 })
  await page.locator('[aria-label="时段详情"]').waitFor({ timeout: 10000 }).catch(async () => {
    await page.getByRole('button', { name: new RegExp(oldSlot.startTime.replace(':', '\\:')) }).first().click()
    await page.locator('[aria-label="时段详情"]').waitFor({ timeout: 45000 })
  })
  await page.getByText(createdOrder.orderNo).waitFor({ timeout: 45000 })
  await screenshot(page, 'dashboard-slot-detail')
  recordStep('dashboard-slot-detail', 'PASS', `${oldSlot.bizDate} ${oldSlot.startTime}-${oldSlot.endTime}`)

  await page.getByRole('button', { name: '查看该时段订单' }).click()
  await page.waitForURL(url => url.pathname === '/order/appointment', { timeout: 45000 })
  await page.getByText(createdOrder.orderNo).waitFor({ timeout: 45000 })
  await screenshot(page, 'slot-scoped-orders')
  recordStep('slot-scoped-orders', 'PASS', 'synthetic order visible')

  await page.locator('tr', { hasText: createdOrder.orderNo }).first().click()
  await page.getByText('取消预约').first().waitFor({ timeout: 45000 })
  await page.getByText('操作记录').waitFor({ timeout: 45000 })
  await screenshot(page, 'order-detail')
  recordStep('order-detail', 'PASS', 'detail drawer opened')

  await performStatusAction(page, '确认订单', 'CONFIRMED')
  await performRescheduleAction(page, oldSlot, newSlot, beforeOld, beforeNew)
  await performStatusAction(page, '标记到店', 'ARRIVED')
  const newSlotOrdersUrl = new URL('/order/appointment', `${baseUrl}/`)
  newSlotOrdersUrl.searchParams.set('quick', 'all')
  newSlotOrdersUrl.searchParams.set('date', newSlot.bizDate)
  newSlotOrdersUrl.searchParams.set('storeId', storeId)
  newSlotOrdersUrl.searchParams.set('slotOriginDate', newSlot.bizDate)
  newSlotOrdersUrl.searchParams.set('slotOriginStoreId', storeId)
  newSlotOrdersUrl.searchParams.set('slotStart', newSlot.startTime)
  newSlotOrdersUrl.searchParams.set('slotEnd', newSlot.endTime)
  newSlotOrdersUrl.searchParams.set('cb', releaseId || 'real-click-smoke-photo')
  await page.goto(newSlotOrdersUrl.toString(), { waitUntil: 'domcontentloaded', timeout: 45000 })
  await page.getByText(createdOrder.orderNo).waitFor({ timeout: 45000 })
  await page.locator('tr', { hasText: createdOrder.orderNo }).first().click()
  await page.locator('aside').filter({ hasText: '订单操作总览' }).last().getByText('客片交付状态').waitFor({ timeout: 45000 })
  await screenshot(page, 'order-photo-delivery-ready')
  await assertOrderPhotoAccessJumpToAlbum(page, linkedAlbum, newSlotOrdersUrl.toString())
  await performOrderAlbumAction(page, '通知客户', 'notify', /\/yy\/photoAlbum\/.+\/notify\b/, '订单详情通知客户', ['通知'])
  await assertOperationEvidence(page, 'operation-evidence-photo-notify', [
    '最近操作证据',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '通知客户',
    '操作人：',
    '门店/部门：',
    '相册：',
    '订单详情通知客户',
  ])
  await assertOperationTimeline(page, 'operation-timeline-photo-notify', [
    '完整操作记录',
    '订单操作',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '通知客户',
    '门店/部门：',
    '原因：订单详情通知客户',
  ])
  await performOrderAlbumAction(page, '客片确认', 'confirm', /\/yy\/photoAlbum\/.+\/selection\/confirm\b/, '订单详情确认客片', ['客片'])
  await assertOperationEvidence(page, 'operation-evidence-photo-confirm', [
    '最近操作证据',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '客片确认',
    '操作人：',
    '门店/部门：',
    '相册：',
    '订单详情确认客片',
  ])
  await assertOperationTimeline(page, 'operation-timeline-photo-confirm', [
    '完整操作记录',
    '订单操作',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '客片确认',
    '门店/部门：',
    '原因：订单详情确认客片',
  ])
  await performOrderAlbumAction(page, '资料发送', 'deliver', /\/yy\/photoAlbum\/.+\/deliver\b/, '订单详情发送资料', ['已交付'])
  await assertOperationEvidence(page, 'operation-evidence-photo-deliver', [
    '最近操作证据',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '资料发送',
    '操作人：',
    '门店/部门：',
    '相册：',
    '订单详情发送资料',
  ])
  await assertOperationTimeline(page, 'operation-timeline-photo-deliver', [
    '完整操作记录',
    '订单操作',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '资料发送',
    '门店/部门：',
    '原因：订单详情发送资料',
  ])
  await assertAlbumAfterDelivery(linkedAlbum)
  await assertPhotoActionDisabledReasons(page, 'photo-disabled-reasons-after-delivery', {
    requiredParts: ['已交付'],
    forbiddenLabels: ['通知客户', '客片确认', '资料发送'],
  })
  await screenshot(page, 'order-photo-delivered')

  const cancelSection = page.locator('section').filter({ hasText: '取消原因' }).first()
  await cancelSection.scrollIntoViewIfNeeded()
  const cancelReasonButton = cancelSection.getByRole('button', { name: '客户主动取消' })
  if (!(await cancelReasonButton.isVisible().catch(() => false))) {
    await cancelSection.locator('details.cancel-reason-foldout > summary').click()
  }
  await cancelReasonButton.click()
  await cancelSection.locator('textarea').fill('客户主动取消')
  result.order.cancelDiagnosticsBeforeClick = await cancelSection.evaluate(section => {
    const buttons = Array.from(section.querySelectorAll('button')).map(button => ({
      text: button.textContent?.trim() || '',
      disabled: button.disabled,
      ariaDisabled: button.getAttribute('aria-disabled') || '',
      type: button.getAttribute('type') || '',
    }))
    const textarea = section.querySelector('textarea')
    return {
      buttons,
      textareaValue: textarea?.value || '',
      sectionText: section.textContent?.replace(/\s+/g, ' ').trim().slice(0, 500) || '',
    }
  }).catch(error => ({ error: safe(error.message) }))
  const transitionResponsePromise = page.waitForResponse(
    response => /\/yy\/order\/.+\/transition\b/.test(response.url()),
    { timeout: 15000 },
  ).catch(() => null)
  const cancelSubmitButton = cancelSection.locator('button').filter({ hasText: /^取消预约$/ })
  await cancelSubmitButton.scrollIntoViewIfNeeded()
  const submitBox = await cancelSubmitButton.boundingBox()
  result.order.cancelSubmitBox = submitBox
  if (!submitBox) throw new Error('UI cancel submit button has no bounding box')
  const submitCenter = {
    x: submitBox.x + submitBox.width / 2,
    y: submitBox.y + submitBox.height / 2,
  }
  result.order.cancelHitTargetBeforeClick = await page.evaluate(({ x, y }) => {
    const element = document.elementFromPoint(x, y)
    if (!element) return null
    return {
      tag: element.tagName,
      text: element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 200) || '',
      className: String(element.getAttribute('class') || ''),
      disabled: element instanceof HTMLButtonElement ? element.disabled : undefined,
      closestButtonText: element.closest('button')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 200) || '',
    }
  }, submitCenter).catch(error => ({ error: safe(error.message) }))
  await page.mouse.click(submitCenter.x, submitCenter.y)
  const transitionResponse = await transitionResponsePromise
  if (!transitionResponse) {
    const feedback = await page.locator('[aria-label="订单操作反馈"], [role="status"]').last().textContent({ timeout: 3000 }).catch(() => '')
    result.order.cancelDiagnosticsAfterClick = await cancelSection.evaluate(section => {
      const buttons = Array.from(section.querySelectorAll('button')).map(button => ({
        text: button.textContent?.trim() || '',
        disabled: button.disabled,
        ariaDisabled: button.getAttribute('aria-disabled') || '',
        type: button.getAttribute('type') || '',
      }))
      const textarea = section.querySelector('textarea')
      return {
        buttons,
        textareaValue: textarea?.value || '',
        sectionText: section.textContent?.replace(/\s+/g, ' ').trim().slice(0, 500) || '',
      }
    }).catch(error => ({ error: safe(error.message) }))
    result.order.cancelFeedback = safe(feedback)
    throw new Error(`UI cancel did not send transition request; feedback=${safe(feedback)}`)
  }
  const cancelled = await pollOrderStatus('CANCELLED')
  if (!cancelled || String(cancelled.status || '').toUpperCase() !== 'CANCELLED') {
    throw new Error(`UI cancel did not produce CANCELLED order, latest=${safe(JSON.stringify(cancelled || {}))}`)
  }
  currentOrderStatus = 'CANCELLED'
  result.order.cancelled = {
    id: String(cancelled.id || createdOrder.id),
    orderNo: String(cancelled.orderNo || createdOrder.orderNo),
    status: String(cancelled.status || ''),
    inventoryStatus: String(cancelled.inventoryStatus || ''),
  }
  await assertOperationEvidence(page, 'operation-evidence-cancel', [
    '最近操作证据',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '取消预约',
    '操作人：',
    '门店/部门：',
    '目标状态',
    '已取消',
    '原因：客户主动取消',
  ])
  await assertOperationTimeline(page, 'operation-timeline-cancel', [
    '完整操作记录',
    '订单操作',
    ...operationStatusSuccessParts,
    ...operationSourceParts,
    '取消预约',
    '门店/部门：',
    '目标状态',
    '已取消',
    '原因：客户主动取消',
  ])
  await screenshot(page, 'order-cancelled')
  recordStep('ui-cancel', 'PASS', 'synthetic order cancelled through UI')

  const finalOld = await querySlotSnapshot(oldSlot)
  const finalNew = await querySlotSnapshot(newSlot)
  result.inventory.finalOld = finalOld
  result.inventory.finalNew = finalNew
  if (finalOld.paidCount !== beforeOld.paidCount) {
    throw new Error(`old slot paidCount did not rollback after UI cancel: before=${beforeOld.paidCount}, final=${finalOld.paidCount}`)
  }
  if (finalNew.paidCount !== beforeNew.paidCount) {
    throw new Error(`new slot paidCount did not rollback after UI cancel: before=${beforeNew.paidCount}, final=${finalNew.paidCount}`)
  }
  recordStep('inventory-rollback', 'PASS', `old ${beforeOld.paidCount}->${afterCreateOld.paidCount}->${finalOld.paidCount}; new ${beforeNew.paidCount}->${finalNew.paidCount}`)

  await page.getByRole('button', { name: '回到该时段' }).click()
  await page.waitForURL(url => url.pathname === '/dashboard/today' && Boolean(url.searchParams.get('slotStart')), { timeout: 45000 })
  await page.locator('[aria-label="时段详情"]').waitFor({ timeout: 45000 })
  await screenshot(page, 'return-to-dashboard-slot')
  recordStep('return-to-slot', 'PASS', page.url())
} catch (error) {
  result.status = 'FAIL'
  result.errors.push(safe(error.message))
  await captureFailureEvidence(page, error)
  if (createdOrder?.id && currentOrderStatus !== 'CANCELLED') {
    result.cleanup.attempted = true
    try {
      const cancelled = await request(`/yy/order/${createdOrder.id}/transition`, {
        method: 'POST',
        body: {
          expectedStatus: currentOrderStatus,
          targetStatus: 'CANCELLED',
          remark: 'CODEx UI click smoke cleanup after failed run',
        },
      })
      currentOrderStatus = String(cancelled.data?.status || 'CANCELLED').toUpperCase()
      result.cleanup.status = currentOrderStatus
      result.cleanup.afterFailureOrderId = String(cancelled.data?.id || createdOrder.id)
    } catch (cleanupError) {
      result.cleanup.status = 'FAILED'
      result.cleanup.error = safe(cleanupError.message)
    }
  }
} finally {
  if (browser) await browser.close()
  if (result.consoleErrors.length || result.pageErrors.length) result.status = 'FAIL'
  writeOutputs()
}

console.log(JSON.stringify({
  status: result.status,
  outputDir,
  orderNo: result.order.created?.orderNo || '',
  uiSteps: result.ui.map(step => `${step.key}:${step.status}`),
  cleanup: result.cleanup.status,
  consoleErrorCount: result.consoleErrors.length,
  ignoredConsoleErrorCount: result.ignoredConsoleErrors.length,
  pageErrorCount: result.pageErrors.length,
  errors: result.errors,
}, null, 2))

if (result.status !== 'PASS') {
  process.exitCode = 1
}
