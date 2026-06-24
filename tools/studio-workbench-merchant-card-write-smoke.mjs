import fs from 'node:fs'
import path from 'node:path'

const apiBaseUrl = (process.env.STUDIO_SMOKE_API_BASE_URL || 'https://api.evanshine.me').replace(/\/+$/, '')
const releaseId = process.env.STUDIO_SMOKE_RELEASE_ID || ''
const outputDir = process.env.STUDIO_SMOKE_OUTPUT_DIR || path.resolve('docs/evidence/studio-merchant-card-write-smoke')
const username = process.env.STUDIO_SMOKE_USERNAME || ''
const password = process.env.STUDIO_SMOKE_PASSWORD || ''
const clientId = process.env.STUDIO_SMOKE_CLIENT_ID || 'e5cd7e4891bf95d1d19206ce24a7b32e'
const tenantId = process.env.STUDIO_SMOKE_TENANT_ID || '000000'
const confirmWrite = process.env.STUDIO_SMOKE_CONFIRM_MERCHANT_WRITE === '1'
const allowCreateDecorationDraft = process.env.STUDIO_SMOKE_ALLOW_CREATE_DECORATION_DRAFT === '1'

if (!confirmWrite) throw new Error('Missing STUDIO_SMOKE_CONFIRM_MERCHANT_WRITE=1')
if (!username || !password) throw new Error('Missing STUDIO_SMOKE_USERNAME/STUDIO_SMOKE_PASSWORD')

fs.mkdirSync(outputDir, { recursive: true })

const suffix = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
const prefix = `CODEx_LOOP_${suffix}`
const syntheticCustomerPhone = ['199', '0000', '0000'].join('')

const result = {
  status: 'PASS',
  checkedAt: new Date().toISOString(),
  apiBaseUrl,
  releaseId,
  boundary: 'WRITE_LOCAL_DB: reversible synthetic merchant decoration draft update when a draft already exists; optional default decoration draft creation requires STUDIO_SMOKE_ALLOW_CREATE_DECORATION_DRAFT=1. Synthetic micro page/form/submission and card product records only. No customer notification, payment, refund, order, inventory, or Douyin platform write.',
  selected: {},
  decoration: {},
  microPage: {},
  microForm: {},
  cardProduct: {},
  cleanup: {
    attempted: true,
    items: [],
  },
  errors: [],
}

const safe = value => String(value || '')
  .replace(/1\d{10}/g, '1**********')
  .replace(/\b\d{8,}\b/g, '[redacted-id]')
  .slice(0, 1000)

let token = ''

const markFail = error => {
  result.status = 'FAIL'
  result.errors.push(safe(error?.message || error))
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

const data = async (apiPath, options = {}) => {
  const json = await request(apiPath, options)
  return json.data ?? json
}

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
    auth: false,
  })
  token = json.data?.access_token || json.data?.accessToken || ''
  if (!token) throw new Error('login succeeded without token')
}

const visibleStore = store => {
  const code = String(store.storeCode || '').toUpperCase()
  const name = String(store.storeName || store.name || '')
  return !code.includes('DEFAULT') && !name.includes('默认门店')
}

const chooseStore = async () => {
  const stores = await rows('/yy/store/list')
  const store = stores.find(visibleStore)
  if (!store?.id) throw new Error('No visible real store found')
  result.selected.store = {
    id: String(store.id),
    storeCode: String(store.storeCode || ''),
    storeName: String(store.storeName || store.name || ''),
  }
  return result.selected.store
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
    result.status = 'PARTIAL'
  }
}

const cleanupProductStep = async (id, body) => {
  const item = { label: 'delete or archive synthetic card product', status: 'PENDING', error: '' }
  result.cleanup.items.push(item)
  try {
    await request(`/yy/product/${id}`, { method: 'DELETE' })
    item.status = 'PASS'
    result.cardProduct.cleanupMode = 'DELETED'
  } catch (error) {
    const message = safe(error.message)
    if (!message.includes('403') && !message.includes('没有访问权限')) {
      item.status = 'FAIL'
      item.error = message
      result.status = 'PARTIAL'
      return
    }
    await request('/yy/product', {
      method: 'PUT',
      body: {
        ...body,
        id,
        status: '1',
        remark: `${prefix} synthetic card product archived; account lacks yy:product:remove`,
      },
    })
    item.status = 'PASS_ARCHIVED_INACTIVE'
    item.error = 'remove permission missing; product kept inactive for future smoke reuse'
    result.cardProduct.cleanupMode = 'ARCHIVED_INACTIVE_NO_REMOVE_PERMISSION'
  }
}

const findOneByName = async (apiPath, query, predicate, label) => {
  const list = await rows(apiPath, query)
  const hit = list.find(predicate)
  if (!hit) throw new Error(`Cannot find created ${label}`)
  return hit
}

const cloneJson = value => JSON.parse(JSON.stringify(value ?? {}))

const verifyDecorationDraft = async store => {
  const original = await data('/yy/merchantDecoration', {
    query: { storeId: store.id, channelType: 'WECHAT' },
  })
  result.decoration.originalHadId = Boolean(original?.id)
  result.decoration.allowCreateDraft = allowCreateDecorationDraft
  if (!original?.id && !allowCreateDecorationDraft) {
    result.decoration.status = 'SKIPPED_NO_EXISTING_DECORATION'
    result.decoration.reason = 'Avoid creating a permanent decoration row when no previous row exists. Re-run with STUDIO_SMOKE_ALLOW_CREATE_DECORATION_DRAFT=1 if a default draft baseline is acceptable.'
    return
  }

  const originalConfig = (() => {
    try { return JSON.parse(String(original.configJson || '{}')) } catch { return {} }
  })()
  let restoreTarget = original
  let createdBaseline = false

  if (!original?.id && allowCreateDecorationDraft) {
    const created = await data('/yy/merchantDecoration', {
      method: 'POST',
      body: {
        storeId: store.id,
        channelType: 'WECHAT',
        configJson: original.configJson || JSON.stringify(originalConfig),
        shareIconOssId: null,
        watermarkOssId: null,
        remark: 'Synthetic default decoration draft created by smoke; safe to edit in UI.',
      },
    })
    if (!created?.id) throw new Error('Decoration default draft creation did not return id')
    restoreTarget = {
      ...original,
      id: created.id,
      storeId: store.id,
      channelType: 'WECHAT',
      configJson: original.configJson || created.configJson || JSON.stringify(originalConfig),
      shareIconOssId: null,
      watermarkOssId: null,
      remark: 'Synthetic default decoration draft created by smoke; safe to edit in UI.',
    }
    createdBaseline = true
  }

  const nextConfig = cloneJson(originalConfig)
  nextConfig.theme = {
    ...(nextConfig.theme || {}),
    brandName: `${prefix}_DECORATION`,
    shareTitle: 'Loop smoke draft only',
  }

  const body = {
    id: restoreTarget.id,
    storeId: store.id,
    channelType: 'WECHAT',
    configJson: JSON.stringify(nextConfig),
    shareIconOssId: restoreTarget.shareIconOssId ?? null,
    watermarkOssId: restoreTarget.watermarkOssId ?? null,
    remark: `${prefix} decoration draft smoke`,
  }
  const saved = await data('/yy/merchantDecoration', { method: 'POST', body })
  const afterSave = await data('/yy/merchantDecoration', {
    query: { storeId: store.id, channelType: 'WECHAT' },
  })
  if (!String(afterSave.remark || '').includes(prefix)) throw new Error('Decoration draft save did not persist smoke remark')

  await cleanupStep('restore merchant decoration draft', async () => {
    await request('/yy/merchantDecoration', {
      method: 'POST',
      body: {
        id: restoreTarget.id,
        storeId: restoreTarget.storeId ?? store.id,
        channelType: restoreTarget.channelType || 'WECHAT',
        configJson: restoreTarget.configJson || JSON.stringify(originalConfig),
        shareIconOssId: restoreTarget.shareIconOssId ?? null,
        watermarkOssId: restoreTarget.watermarkOssId ?? null,
        remark: restoreTarget.remark || '',
      },
    })
  })

  result.decoration = {
    status: createdBaseline ? 'PASS_CREATED_DEFAULT_DRAFT_AND_RESTORED' : 'PASS',
    id: String(saved.id || restoreTarget.id),
    originalHadId: Boolean(original?.id),
    createdBaseline,
    allowCreateDraft: allowCreateDecorationDraft,
    restored: true,
  }
}

const verifyMicroPage = async store => {
  const title = `${prefix}_MICRO_PAGE`
  await request('/yy/microPage', {
    method: 'POST',
    body: {
      storeId: store.id,
      pageTitle: title,
      pageDesc: 'Loop smoke synthetic page',
      coverUrl: '',
      coverOssId: null,
      backgroundColor: '#FBF8F2',
      editMode: 'COMPONENT',
      status: 'DRAFT',
      configJson: JSON.stringify({
        schemaVersion: 2,
        components: [
          {
            id: `${prefix}_title`,
            type: 'title',
            title: 'Loop Smoke',
            sort: 1,
            props: {
              text: 'Loop Smoke Page',
              subtitle: 'synthetic verification page',
            },
          },
        ],
      }),
      linkKey: `codex-${suffix.toLowerCase()}`,
      remark: `${prefix} synthetic micro page`,
    },
  })
  const row = await findOneByName('/yy/microPage/list', { pageTitle: title }, item => String(item.pageTitle || '') === title, 'micro page')
  const id = String(row.id)
  result.microPage.id = id
  result.microPage.created = true

  const published = await data(`/yy/microPage/${id}/publish`, { method: 'POST' })
  result.microPage.publishStatus = String(published.status || '')
  const publicRow = await data(`/yy/client/micro-page/${id}`, { auth: false })
  if (String(publicRow.pageTitle || '') !== title) throw new Error('Public micro page did not return synthetic page title')
  result.microPage.publicReadable = true

  await cleanupStep('offline synthetic micro page', async () => {
    await request(`/yy/microPage/${id}/offline`, { method: 'POST' })
  })
  await cleanupStep('delete synthetic micro page', async () => {
    await request(`/yy/microPage/${id}`, { method: 'DELETE' })
  })

  result.microPage.status = 'PASS'
}

const verifyMicroForm = async store => {
  const formName = `${prefix}_MICRO_FORM`
  await request('/yy/microForm', {
    method: 'POST',
    body: {
      storeId: store.id,
      formName,
      status: 'DRAFT',
      schemaJson: JSON.stringify({
        schemaVersion: 2,
        fields: [
          { id: 'customerName', label: '姓名', type: 'text', required: true, sort: 1 },
          { id: 'preferredTime', label: '期望时间', type: 'text', required: false, sort: 2 },
        ],
      }),
      notifyUsers: '',
      linkKey: `codex-form-${suffix.toLowerCase()}`,
      remark: `${prefix} synthetic micro form`,
    },
  })
  const row = await findOneByName('/yy/microForm/list', { formName }, item => String(item.formName || '') === formName, 'micro form')
  const id = String(row.id)
  result.microForm.id = id
  result.microForm.created = true

  const published = await data(`/yy/microForm/${id}/publish`, { method: 'POST' })
  result.microForm.publishStatus = String(published.status || '')
  const publicRow = await data(`/yy/client/microForm/${id}`, { auth: false })
  if (String(publicRow.formName || '') !== formName) throw new Error('Public micro form did not return synthetic form name')
  result.microForm.publicReadable = true

  const submitResult = await data(`/yy/client/microForm/${id}/submit`, {
    method: 'POST',
    auth: false,
    body: {
      customerName: 'CODEx Loop',
      customerPhone: syntheticCustomerPhone,
      answers: {
        customerName: 'CODEx Loop',
        preferredTime: 'Loop smoke synthetic preferred time',
        __storeId: store.id,
      },
    },
  })
  result.microForm.submissionId = String(submitResult.submissionId || '')
  const submissions = await rows('/yy/microFormSubmission/list', { formId: id })
  const hit = submissions.find(item => String(item.id) === result.microForm.submissionId || String(item.formId) === id)
  if (!hit) throw new Error('Cannot find synthetic micro form submission')
  const submissionId = String(hit.id)
  result.microForm.submissionId = submissionId

  await cleanupStep('delete synthetic micro form submission', async () => {
    await request(`/yy/microFormSubmission/${submissionId}`, { method: 'DELETE' })
  })
  await cleanupStep('offline synthetic micro form', async () => {
    await request(`/yy/microForm/${id}/offline`, { method: 'POST' })
  })
  await cleanupStep('delete synthetic micro form', async () => {
    await request(`/yy/microForm/${id}`, { method: 'DELETE' })
  })

  result.microForm.status = 'PASS'
}

const verifyCardProduct = async store => {
  const productName = 'CODEx_LOOP_CARD_PRODUCT_SMOKE'
  const body = {
    storeId: store.id,
    productType: '单项次卡',
    productName,
    price: 1,
    durationMinutes: 30,
    selectionPrice: 0,
    albumProductName: 'Loop smoke single times card',
    status: '1',
    sort: 999,
    remark: `${prefix} synthetic card product; inactive draft`,
  }
  const existingRows = await rows('/yy/product/list', { storeId: store.id, productName })
  const oldLoopRows = existingRows.length
    ? []
    : await rows('/yy/product/list', { storeId: store.id, pageSize: 5000 })
  const existing = existingRows.find(item => String(item.productName || '') === productName)
    || oldLoopRows.find(item =>
      String(item.productName || '').startsWith('CODEx_LOOP_')
      && String(item.productType || '').includes('次卡')
      && String(item.status || '') !== '0',
    )
  if (existing?.id) {
    await request('/yy/product', { method: 'PUT', body: { ...body, id: existing.id } })
  } else {
    await request('/yy/product', { method: 'POST', body })
  }
  const row = await findOneByName('/yy/product/list', { storeId: store.id, productName }, item => String(item.productName || '') === productName, 'card product')
  const id = String(row.id)
  if (!String(row.productType || '').includes('次卡')) throw new Error('Synthetic card product did not persist card-like productType')
  result.cardProduct = {
    status: 'PASS',
    id,
    productName,
    productType: String(row.productType || ''),
    active: String(row.status || '') === '0',
    reusedExisting: Boolean(existing?.id),
  }

  await cleanupProductStep(id, body)
}

const writeOutputs = () => {
  const jsonPath = path.join(outputDir, 'merchant-card-write-smoke.json')
  const mdPath = path.join(outputDir, 'merchant-card-write-smoke.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  const content = [
    '# Studio Merchant/Card Write Smoke',
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
    '## Decoration',
    '',
    '```json',
    JSON.stringify(result.decoration, null, 2),
    '```',
    '',
    '## Micro Page',
    '',
    '```json',
    JSON.stringify(result.microPage, null, 2),
    '```',
    '',
    '## Micro Form',
    '',
    '```json',
    JSON.stringify(result.microForm, null, 2),
    '```',
    '',
    '## Card Product',
    '',
    '```json',
    JSON.stringify(result.cardProduct, null, 2),
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
    result.boundary,
    '',
  ].join('\n')
  fs.writeFileSync(mdPath, content, 'utf8')
}

try {
  await login()
  const store = await chooseStore()
  await verifyDecorationDraft(store)
  await verifyMicroPage(store)
  await verifyMicroForm(store)
  await verifyCardProduct(store)
} catch (error) {
  markFail(error)
} finally {
  writeOutputs()
}

console.log(JSON.stringify({
  status: result.status,
  outputDir,
  storeId: result.selected.store?.id || '',
  decoration: result.decoration.status || '',
  microPage: result.microPage.status || '',
  microForm: result.microForm.status || '',
  cardProduct: result.cardProduct.status || '',
  cleanupFailures: result.cleanup.items.filter(item => String(item.status).startsWith('FAIL')).map(item => item.label),
  errorCount: result.errors.length,
}, null, 2))

if (result.status === 'FAIL') {
  process.exitCode = 1
}
