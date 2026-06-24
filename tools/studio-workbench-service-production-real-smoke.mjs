import fs from 'node:fs'
import path from 'node:path'
import { chromium } from '../mobile-uniapp/node_modules/playwright/index.mjs'

const baseUrl = (process.env.STUDIO_SMOKE_BASE_URL || 'https://studio.evanshine.me').replace(/\/+$/, '')
const releaseId = process.env.STUDIO_SMOKE_RELEASE_ID || ''
const outputDir = process.env.STUDIO_SMOKE_OUTPUT_DIR || path.resolve('docs/evidence/studio-service-production-real-smoke')
const username = process.env.STUDIO_SMOKE_USERNAME || ''
const password = process.env.STUDIO_SMOKE_PASSWORD || ''
const apiToken = process.env.STUDIO_SMOKE_API_TOKEN || ''
const headed = process.env.STUDIO_SMOKE_HEADED === '1'
const browserExecutable =
  process.env.STUDIO_SMOKE_BROWSER_PATH ||
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find(candidate => fs.existsSync(candidate)) ||
  ''

if (!apiToken && (!username || !password)) {
  throw new Error('Missing STUDIO_SMOKE_API_TOKEN or STUDIO_SMOKE_USERNAME/STUDIO_SMOKE_PASSWORD')
}

const routes = [
  {
    key: 'retouch-center',
    path: '/service/retouch-center',
    expectedTextAny: ['三方修图中心', 'RETOUCH CENTER', 'TASK DETAIL', '刷新任务'],
  },
  {
    key: 'retouch-providers',
    path: '/service/retouch-providers',
    expectedTextAny: ['三方修图服务商', 'RETOUCH PROVIDERS', 'PROVIDER DETAIL', '新建服务商'],
  },
  {
    key: 'collaboration-retouch-center-settings',
    path: '/collaboration/retouch-center-settings',
    expectedTextAny: ['中央修图设置', '保存中央修图设置'],
    forbiddenTextAny: ['Missing backend id', '发生未知异常', '影约云后端连接失败'],
  },
  {
    key: 'collaboration-common-settings',
    path: '/collaboration/common-settings',
    expectedTextAny: ['通用设置', '保存通用设置'],
  },
  {
    key: 'collaboration-open-settings',
    path: '/collaboration/open-settings',
    expectedTextAny: ['开通设置', '保存许可证', '新建许可证'],
  },
]

fs.mkdirSync(outputDir, { recursive: true })

const checkedAt = new Date().toISOString()
const result = {
  status: 'PASS',
  checkedAt,
  baseUrl,
  releaseId,
  releaseTxt: '',
  markerMatched: false,
  login: {
    status: 'PENDING',
    tokenPresent: false,
    finalUrl: '',
  },
  routes: [],
  consoleErrors: [],
  pageErrors: [],
  screenshots: [],
}

const safeText = value => String(value || '')
  .replace(/1\d{10}/g, '1**********')
  .replace(/\b\d{8,}\b/g, '[redacted-id]')
  .slice(0, 500)

const hasForbiddenText = bodyText => /\b403\b|Forbidden/i.test(String(bodyText || ''))

const routeUrl = routePath => {
  const url = new URL(routePath, `${baseUrl}/`)
  url.searchParams.set('cb', releaseId || `smoke-${Date.now()}`)
  return url.toString()
}

const routePathname = routePath => new URL(routePath, `${baseUrl}/`).pathname

const waitForRouteQuiet = async page => {
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {})
}

const waitForExpectedText = async (page, expectedTextAny = []) => {
  if (!expectedTextAny.length) return
  await page.waitForFunction((texts) => {
    const bodyText = document.body?.innerText || ''
    return texts.some(text => bodyText.includes(text)) ||
      /\b403\b|Forbidden/i.test(bodyText) ||
      window.location.pathname.startsWith('/login')
  }, expectedTextAny, { timeout: 6000 }).catch(() => {})
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

const writeOutputs = () => {
  const jsonPath = path.join(outputDir, 'service-production-real-smoke.json')
  const mdPath = path.join(outputDir, 'service-production-real-smoke.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  const routeRows = result.routes.map(route =>
    `| ${route.key} | ${route.status} | ${route.finalUrl} | ${route.detail || ''} |`,
  ).join('\n')
  const screenshotRows = result.screenshots.map(item => `- ${item}`).join('\n') || '- none'
  const content = [
    '# Studio Workbench Service Production Real Smoke',
    '',
    `- Status: ${result.status}`,
    `- CheckedAt: ${result.checkedAt}`,
    `- BaseUrl: ${result.baseUrl}`,
    `- ReleaseId: ${result.releaseId}`,
    `- ReleaseTxt: ${result.releaseTxt}`,
    `- MarkerMatched: ${result.markerMatched}`,
    `- TokenPresent: ${result.login.tokenPresent}`,
    '',
    '## Routes',
    '',
    '| Key | Status | Final URL | Detail |',
    '| --- | --- | --- | --- |',
    routeRows,
    '',
    '## Console Errors',
    '',
    result.consoleErrors.length ? result.consoleErrors.map(item => `- ${item}`).join('\n') : '- none',
    '',
    '## Page Errors',
    '',
    result.pageErrors.length ? result.pageErrors.map(item => `- ${item}`).join('\n') : '- none',
    '',
    '## Screenshots',
    '',
    screenshotRows,
    '',
    '## Boundary',
    '',
    'This smoke logs in and reads service production pages only. It does not click save, create providers, update licenses, or change collaboration policy.',
    '',
  ].join('\n')
  fs.writeFileSync(mdPath, content, 'utf8')
}

let browser
try {
  result.releaseTxt = await fetch(`${baseUrl}/release.txt`, { cache: 'no-store' })
    .then(response => response.text())
    .then(text => text.trim())
    .catch(error => `ERROR:${safeText(error.message)}`)
  result.markerMatched = releaseId ? result.releaseTxt === releaseId : Boolean(result.releaseTxt)

  browser = await chromium.launch(browserExecutable
    ? { headless: !headed, executablePath: browserExecutable }
    : { headless: !headed })
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  page.on('console', message => {
    if (message.type() === 'error') {
      result.consoleErrors.push(safeText(message.text()))
    }
  })
  page.on('pageerror', error => {
    result.pageErrors.push(safeText(error.message))
  })

  if (apiToken) {
    await page.addInitScript(token => {
      const session = {
        username: 'store-admin',
        role: '门店管理员',
        source: 'STUDIO_WORKBENCH',
        loginAt: new Date().toISOString(),
      }
      window.localStorage.setItem('yingyue_studio_workbench_access_token', token)
      window.localStorage.setItem('Admin-Token', token)
      window.localStorage.setItem('yingyue_studio_workbench_staff_session', JSON.stringify(session))
    }, apiToken)
    await page.goto(`${baseUrl}/dashboard/today?cb=${encodeURIComponent(releaseId || 'service-production-smoke')}`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    })
  } else {
    await page.goto(`${baseUrl}/login?redirect=/dashboard/today&cb=${encodeURIComponent(releaseId || 'service-production-smoke')}`, {
      waitUntil: 'domcontentloaded',
      timeout: 45000,
    })
    await page.locator('input[autocomplete="username"]').fill(username)
    await page.locator('input[autocomplete="current-password"]').fill(password)
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 45000 })
  }
  await page.waitForLoadState('domcontentloaded')
  await waitForRouteQuiet(page)
  result.login.finalUrl = page.url()
  result.login.tokenPresent = await page.evaluate(() =>
    Boolean(window.localStorage.getItem('yingyue_studio_workbench_access_token') || window.localStorage.getItem('Admin-Token')),
  )
  result.login.status = result.login.tokenPresent ? 'PASS' : 'FAIL'
  if (!result.login.tokenPresent) result.status = 'FAIL'

  for (const route of routes) {
    const current = {
      key: route.key,
      path: route.path,
      status: 'PASS',
      finalUrl: '',
      detail: '',
      screenshot: '',
    }
    try {
      await page.goto(routeUrl(route.path), { waitUntil: 'domcontentloaded', timeout: 45000 })
      await waitForExpectedText(page, route.expectedTextAny)
      await waitForRouteQuiet(page)
      current.finalUrl = page.url()
      const finalPathname = new URL(current.finalUrl).pathname
      if (finalPathname.startsWith('/login')) {
        current.status = 'FAIL'
        current.detail = 'redirected-to-login'
      }
      if (finalPathname !== routePathname(route.path)) {
        current.status = 'FAIL'
        current.detail = current.detail || `path-mismatch:${finalPathname}`
      }
      const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '')
      if (hasForbiddenText(bodyText)) {
        current.status = 'FAIL'
        current.detail = current.detail || 'forbidden-visible'
      }
      if (route.forbiddenTextAny?.some(text => bodyText.includes(text))) {
        current.status = 'FAIL'
        current.detail = current.detail || 'fatal-text-visible'
      }
      const hasExpectedText = !route.expectedTextAny?.length || route.expectedTextAny.some(text => bodyText.includes(text))
      if (!hasExpectedText) {
        current.status = 'FAIL'
        current.detail = current.detail || `missing-any-text:${route.expectedTextAny.join(',')}`
      }
      await redactPage(page)
      const screenshotPath = path.join(outputDir, `${String(result.routes.length + 1).padStart(2, '0')}-${route.key}.png`)
      await page.screenshot({ path: screenshotPath, fullPage: false })
      current.screenshot = screenshotPath
      result.screenshots.push(screenshotPath)
    } catch (error) {
      current.status = 'FAIL'
      current.detail = safeText(error.message)
    }
    if (current.status !== 'PASS') result.status = 'FAIL'
    result.routes.push(current)
  }
} catch (error) {
  result.status = 'FAIL'
  result.login.status = result.login.status === 'PENDING' ? 'FAIL' : result.login.status
  result.pageErrors.push(safeText(error.message))
} finally {
  if (browser) await browser.close()
  writeOutputs()
}

console.log(JSON.stringify({
  status: result.status,
  outputDir,
  releaseTxt: result.releaseTxt,
  markerMatched: result.markerMatched,
  tokenPresent: result.login.tokenPresent,
  routeCount: result.routes.length,
  failedRoutes: result.routes.filter(route => route.status !== 'PASS').map(route => route.key),
  consoleErrorCount: result.consoleErrors.length,
  pageErrorCount: result.pageErrors.length,
}, null, 2))

if (result.status !== 'PASS') {
  process.exitCode = 1
}
