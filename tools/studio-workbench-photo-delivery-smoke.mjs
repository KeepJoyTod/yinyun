import fs from 'node:fs'
import path from 'node:path'

const apiBaseUrl = (process.env.STUDIO_PHOTO_API_BASE_URL || 'https://api.evanshine.me').replace(/\/+$/, '')
const outputDir = process.env.STUDIO_PHOTO_OUTPUT_DIR || path.resolve('docs/evidence/studio-photo-delivery-smoke')
const username = process.env.STUDIO_PHOTO_USERNAME || ''
const password = process.env.STUDIO_PHOTO_PASSWORD || ''
const clientId = process.env.STUDIO_PHOTO_CLIENT_ID || 'e5cd7e4891bf95d1d19206ce24a7b32e'
const tenantId = process.env.STUDIO_PHOTO_TENANT_ID || '000000'
const albumId = process.env.STUDIO_PHOTO_ALBUM_ID || ''
const confirmWrite = process.env.STUDIO_PHOTO_CONFIRM_WRITE_LOCAL_DB === '1'
const runNotify = process.env.STUDIO_PHOTO_RUN_NOTIFY === '1'
const runConfirm = process.env.STUDIO_PHOTO_RUN_CONFIRM === '1'
const runDeliver = process.env.STUDIO_PHOTO_RUN_DELIVER === '1'
const createSyntheticAlbum = process.env.STUDIO_PHOTO_CREATE_SYNTHETIC_ALBUM === '1'
const uploadFixtureAssets = process.env.STUDIO_PHOTO_UPLOAD_FIXTURE_ASSETS === '1'
const submitSyntheticSelection = process.env.STUDIO_PHOTO_SUBMIT_SYNTHETIC_SELECTION === '1'

if (!username || !password) throw new Error('Missing STUDIO_PHOTO_USERNAME/STUDIO_PHOTO_PASSWORD')
fs.mkdirSync(outputDir, { recursive: true })

const result = {
  status: 'PASS',
  checkedAt: new Date().toISOString(),
  apiBaseUrl,
  boundary: 'READ_ONLY by default. WRITE_LOCAL_DB only when AlbumId + ConfirmWriteLocalDb are both set, and the target album is visibly synthetic/test-marked. No real customer notification is sent; notify only records backend fallback audit.',
  albumId: albumId || '',
  mode: albumId ? 'TARGETED' : 'DISCOVERY_ONLY',
  syntheticGuard: '',
  album: null,
  candidates: [],
  actions: [],
  errors: [],
}

let token = ''
let targetAlbumId = albumId

const safe = value => String(value || '')
  .replace(/\b1[3-9]\d{9}\b/g, '1**********')
  .replace(/"(access_token|accessToken|token|client_secret|password|Authorization)"\s*:\s*"[^"]*"/gi, '"$1":"[redacted]"')
  .slice(0, 1200)

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

const rows = async (apiPath, query = {}) => {
  const json = await request(apiPath, { query: { pageNum: 1, pageSize: 500, ...query } })
  return Array.isArray(json.rows) ? json.rows : []
}

const data = async apiPath => (await request(apiPath)).data

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

const syntheticText = album => [
  album?.albumName,
  album?.customerName,
  album?.remark,
  album?.accessCode,
  album?.publicToken,
  album?.channelType,
].map(value => String(value || '')).join(' ')

const isSyntheticAlbum = album => /codex|synthetic|preview|test|测试|预览|演示/i.test(syntheticText(album))

const summarizeAlbum = (album, assets = []) => ({
  id: String(album?.id || ''),
  albumName: String(album?.albumName || ''),
  customerName: safe(album?.customerName || ''),
  customerPhone: safe(album?.customerPhone || ''),
  storeId: album?.storeId == null ? '' : String(album.storeId),
  orderId: album?.orderId == null ? '' : String(album.orderId),
  channelType: String(album?.channelType || ''),
  status: String(album?.status || ''),
  selectionStatus: String(album?.selectionStatus || ''),
  assetCount: assets.length,
  visibleAssetCount: assets.filter(asset => String(asset.visible || '') === '1').length,
  selectedAssetCount: assets.filter(asset => String(asset.isSelected || '') === '1').length,
  deliverableAssetCount: assets
    .filter(asset => String(asset.visible || '') === '1')
    .filter(asset => String(asset.objectKey || '').trim())
    .length,
  synthetic: isSyntheticAlbum(album),
})

const listAssets = albumIdValue => rows('/yy/photoAsset/list', { albumId: albumIdValue })

const toYmdHms = date => {
  const pad = value => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const visibleStore = store => {
  const code = String(store.storeCode || '').toUpperCase()
  const name = String(store.storeName || store.name || '')
  return !code.includes('DEFAULT') && !name.includes('默认门店')
}

const fixturePngs = [
  {
    fileName: 'codex-photo-fixture-01.png',
    bytes: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', 'base64'),
  },
  {
    fileName: 'codex-photo-fixture-02.png',
    bytes: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARQAFT2H4swAAAABJRU5ErkJggg==', 'base64'),
  },
]

const createAlbum = async () => {
  const bootstrap = await data('/yy/studio/bootstrap')
  const store = (bootstrap.stores || []).find(visibleStore)
  if (!store) throw new Error('No visible real store in bootstrap')
  const storeId = String(store.storeId || store.id)
  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(4, 14)
  const albumName = `CODEx_SYNTHETIC_PHOTO_${suffix}`
  const phone = `199${suffix.slice(0, 8)}`.slice(0, 11).padEnd(11, '0')
  const accessCode = `PICK-CODEX-${suffix}`
  await request('/yy/photoAlbum', {
    method: 'POST',
    body: {
      storeId,
      albumName,
      customerName: `CODEx Photo ${suffix}`,
      customerPhone: phone,
      publicToken: `codex-photo-${suffix}`,
      accessCode,
      channelType: 'MANUAL',
      status: 'ACTIVE',
      selectionStatus: 'WAITING',
      expireTime: toYmdHms(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      remark: `CODEx_SYNTHETIC photo delivery smoke ${suffix}`,
    },
  })
  const albums = await rows('/yy/photoAlbum/list')
  const created = albums
    .filter(album => String(album.albumName || '') === albumName)
    .sort((a, b) => String(b.id || '').localeCompare(String(a.id || '')))[0]
  if (!created?.id) throw new Error('Synthetic album was created but could not be found by albumName')
  result.actions.push({
    action: 'create-album',
    status: 'OK',
    message: `created synthetic album ${created.id}`,
  })
  return created
}

const uploadFixtures = async album => {
  const createdAssets = []
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
        remark: `CODEx_SYNTHETIC fixture asset ${index + 1}`,
      },
    })
    createdAssets.push(uploaded)
  }
  result.actions.push({
    action: 'upload-fixtures',
    status: 'OK',
    message: `${createdAssets.length} fixture assets uploaded`,
  })
  return createdAssets
}

const submitSelectionAsClient = async album => {
  const assets = await listAssets(album.id)
  const selectedIds = assets
    .filter(asset => String(asset.visible || '') === '1')
    .slice(0, 2)
    .map(asset => asset.id)
    .filter(Boolean)
  if (selectedIds.length === 0) throw new Error('Cannot submit selection: no visible assets')
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
    body: { assetIds: selectedIds },
  })
  result.actions.push({
    action: 'client-submit-selection',
    status: 'OK',
    message: `submitted ${selectedIds.length} assets; selectionStatus=${selection.data?.selectionStatus || ''}`,
  })
}

const writeOutputs = () => {
  const jsonPath = path.join(outputDir, 'photo-delivery-smoke.json')
  const mdPath = path.join(outputDir, 'photo-delivery-smoke.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  const actionRows = result.actions.map(action => `| ${action.action} | ${action.status} | ${action.message || ''} |`).join('\n')
  const content = [
    '# Studio Photo Delivery Smoke',
    '',
    `- Status: ${result.status}`,
    `- CheckedAt: ${result.checkedAt}`,
    `- Mode: ${result.mode}`,
    `- AlbumId: ${result.albumId || 'none'}`,
    '',
    '## Album',
    '',
    '```json',
    JSON.stringify(result.album, null, 2),
    '```',
    '',
    '## Candidates',
    '',
    '```json',
    JSON.stringify(result.candidates, null, 2),
    '```',
    '',
    '## Actions',
    '',
    '| Action | Status | Message |',
    '| --- | --- | --- |',
    actionRows || '| none | SKIPPED | no write action requested |',
    '',
    '## Boundary',
    '',
    result.boundary,
    '',
    '## Errors',
    '',
    result.errors.length ? result.errors.map(error => `- ${error}`).join('\n') : '- none',
    '',
  ].join('\n')
  fs.writeFileSync(mdPath, content, 'utf8')
}

try {
  await loginApi()

  if ((createSyntheticAlbum || uploadFixtureAssets || submitSyntheticSelection || runNotify || runConfirm || runDeliver) && !confirmWrite) {
    throw new Error('Write actions requested without STUDIO_PHOTO_CONFIRM_WRITE_LOCAL_DB=1')
  }

  if (createSyntheticAlbum) {
    const created = await createAlbum()
    targetAlbumId = String(created.id)
    result.albumId = targetAlbumId
    result.mode = 'SYNTHETIC_FULL_FLOW'
  }

  if (!targetAlbumId) {
    const albums = await rows('/yy/photoAlbum/list')
    const candidates = []
    for (const album of albums.filter(isSyntheticAlbum).slice(0, 20)) {
      const assets = await listAssets(album.id).catch(() => [])
      candidates.push(summarizeAlbum(album, assets))
    }
    result.candidates = candidates
    result.status = candidates.length ? 'PASS' : 'SKIPPED_SAFE_TARGET_REQUIRED'
    result.syntheticGuard = candidates.length
      ? 'Synthetic/test-marked candidates found. Pass -AlbumId and -ConfirmWriteLocalDb to run write actions.'
      : 'No synthetic/test-marked album found. Prepare a dedicated test album with non-customer photos first.'
  } else {
    let album = await data(`/yy/photoAlbum/${targetAlbumId}`)
    if (uploadFixtureAssets) {
      await uploadFixtures(album)
      album = await data(`/yy/photoAlbum/${targetAlbumId}`)
    }
    if (submitSyntheticSelection) {
      await submitSelectionAsClient(album)
      album = await data(`/yy/photoAlbum/${targetAlbumId}`)
    }
    const assets = await listAssets(targetAlbumId)
    result.album = summarizeAlbum(album, assets)
    if (!result.album.synthetic) {
      throw new Error('Refusing to run photo delivery actions: target album is not visibly synthetic/test-marked')
    }
    result.syntheticGuard = 'Target album passed synthetic/test marker guard'
    if (runNotify) {
      const notify = await request(`/yy/photoAlbum/${targetAlbumId}/notify`, {
        method: 'POST',
        body: {
          channelType: 'MANUAL',
          remark: `CODEx photo delivery smoke notify ${new Date().toISOString()}`,
        },
      })
      result.actions.push({
        action: 'notify',
        status: notify.data?.auditStatus || notify.data?.status || 'OK',
        fallback: Boolean(notify.data?.fallback),
        message: safe(notify.data?.message || notify.msg || ''),
        requestId: safe(notify.data?.requestId || ''),
      })
    }
    if (runConfirm) {
      if (!['SUBMITTED', 'CONFIRMED'].includes(String(result.album.selectionStatus || '').toUpperCase())) {
        throw new Error(`Cannot confirm selection from selectionStatus=${result.album.selectionStatus}`)
      }
      const confirm = await request(`/yy/photoAlbum/${targetAlbumId}/selection/confirm`, {
        method: 'POST',
        body: {
          remark: `CODEx photo delivery smoke confirm ${new Date().toISOString()}`,
        },
      })
      result.actions.push({
        action: 'confirm',
        status: confirm.data?.auditStatus || confirm.data?.status || 'OK',
        fallback: Boolean(confirm.data?.fallback),
        message: safe(confirm.data?.message || confirm.msg || ''),
      })
      const refreshed = await data(`/yy/photoAlbum/${targetAlbumId}`)
      result.album = summarizeAlbum(refreshed, await listAssets(targetAlbumId))
    }
    if (runDeliver) {
      if (String(result.album.selectionStatus || '').toUpperCase() !== 'CONFIRMED') {
        throw new Error(`Cannot deliver before CONFIRMED selectionStatus; current=${result.album.selectionStatus}`)
      }
      if (Number(result.album.deliverableAssetCount || 0) <= 0) {
        throw new Error('Cannot deliver without visible assets that have objectKey')
      }
      const deliver = await request(`/yy/photoAlbum/${targetAlbumId}/deliver`, {
        method: 'POST',
        body: {
          remark: `CODEx photo delivery smoke deliver ${new Date().toISOString()}`,
        },
      })
      result.actions.push({
        action: 'deliver',
        status: deliver.data?.auditStatus || deliver.data?.status || 'OK',
        fallback: Boolean(deliver.data?.fallback),
        message: safe(deliver.data?.message || deliver.msg || ''),
      })
      const refreshed = await data(`/yy/photoAlbum/${targetAlbumId}`)
      result.album = summarizeAlbum(refreshed, await listAssets(targetAlbumId))
    }
  }
} catch (error) {
  result.status = 'FAIL'
  result.errors.push(safe(error.message))
} finally {
  writeOutputs()
}

console.log(JSON.stringify({
  status: result.status,
  outputDir,
  mode: result.mode,
  albumId: result.albumId || '',
  candidates: result.candidates.length,
  actions: result.actions.map(action => `${action.action}:${action.status}`),
  errors: result.errors,
}, null, 2))

if (result.status === 'FAIL') {
  process.exitCode = 1
}
