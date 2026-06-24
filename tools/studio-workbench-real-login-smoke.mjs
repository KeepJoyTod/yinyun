import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = (process.env.STUDIO_SMOKE_BASE_URL || 'https://studio.evanshine.me').replace(/\/+$/, '')
const releaseId = process.env.STUDIO_SMOKE_RELEASE_ID || ''
const outputDir = process.env.STUDIO_SMOKE_OUTPUT_DIR || path.resolve('docs/evidence/studio-real-login-smoke')
const username = process.env.STUDIO_SMOKE_USERNAME || ''
const password = process.env.STUDIO_SMOKE_PASSWORD || ''
const headed = process.env.STUDIO_SMOKE_HEADED === '1'

if (!username || !password) {
  throw new Error('Missing STUDIO_SMOKE_USERNAME/STUDIO_SMOKE_PASSWORD')
}

const routes = [
  { key: 'dashboard', path: '/', expectedText: ['今日预约'] },
  { key: 'today', path: '/dashboard/today', expectedText: ['上午', '下午', '晚上'] },
  { key: 'orders', path: '/order/appointment?quick=all', expectedText: ['预约订单'] },
  { key: 'photos', path: '/service/photos', expectedText: ['客片'] },
  { key: 'merchant-decoration', path: '/merchant/decoration', expectedText: ['保存草稿', '发布上线'] },
  { key: 'merchant-micro-pages', path: '/merchant/micro-pages', expectedText: ['微页面管理', '新增页面'] },
  { key: 'merchant-micro-forms', path: '/merchant/micro-forms', expectedText: ['微表单管理', '新增表单'] },
  { key: 'card-management', path: '/product/card-management', expectedText: ['添加次卡', '添加储值卡', '客户链接', '抖音映射'] },
  { key: 'card-catalog', path: '/product/card-catalog', expectedText: ['商品卡目录', '新增卡项'] },
]

const now = new Date()
const iso = now.toISOString()
fs.mkdirSync(outputDir, { recursive: true })

const result = {
  status: 'PASS',
  checkedAt: iso,
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
  ignoredConsoleErrors: [],
  pageErrors: [],
  screenshots: [],
}

const safeText = value => String(value || '')
  .replace(/1\d{10}/g, '1**********')
  .replace(/\b\d{8,}\b/g, '[redacted-id]')
  .slice(0, 500)

const isIgnoredConsoleError = text => text.includes('TypeError: Failed to fetch')

const routeUrl = routePath => {
  const url = new URL(routePath, `${baseUrl}/`)
  url.searchParams.set('cb', releaseId || `smoke-${Date.now()}`)
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

const waitForExpectedText = async (page, expectedText = []) => {
  if (!expectedText.length) return
  await page.waitForFunction((texts) => {
    const bodyText = document.body?.innerText || ''
    return texts.every(text => bodyText.includes(text)) ||
      /\b403\b|无权限|Forbidden/i.test(bodyText) ||
      window.location.pathname.startsWith('/login')
  }, expectedText, { timeout: 6000 }).catch(() => {})
}

const waitForRouteQuiet = async page => {
  await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {})
}

const hasForbiddenText = bodyText => /\b403\b|无权限|Forbidden/i.test(String(bodyText || ''))

const writeOutputs = () => {
  const jsonPath = path.join(outputDir, 'real-login-smoke.json')
  const mdPath = path.join(outputDir, 'real-login-smoke.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  const routeRows = result.routes.map(route =>
    `| ${route.key} | ${route.status} | ${route.finalUrl} | ${route.detail || ''} |`,
  ).join('\n')
  const screenshotRows = result.screenshots.map(item => `- ${item}`).join('\n') || '- none'
  const content = [
    '# Studio Workbench Real Login Smoke',
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
    '## Ignored Console Errors',
    '',
    result.ignoredConsoleErrors.length ? result.ignoredConsoleErrors.map(item => `- ${item}`).join('\n') : '- none',
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
    'This smoke logs in and reads pages only. It does not create orders, change inventory, publish merchant pages, notify customers, or write Douyin platform state.',
    '',
  ].join('\n')
  fs.writeFileSync(mdPath, content, 'utf8')
}

let browser
try {
  result.releaseTxt = await fetch(`${baseUrl}/release.txt`, { cache: 'no-store' }).then(response => response.text()).then(text => text.trim()).catch(error => `ERROR:${safeText(error.message)}`)
  result.markerMatched = releaseId ? result.releaseTxt === releaseId : Boolean(result.releaseTxt)

  browser = await chromium.launch({ headless: !headed })
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
  page.on('console', message => {
    if (message.type() === 'error') {
      const text = safeText(message.text())
      if (isIgnoredConsoleError(text)) {
        result.ignoredConsoleErrors.push(text)
        return
      }
      result.consoleErrors.push(text)
    }
  })
  page.on('pageerror', error => {
    result.pageErrors.push(safeText(error.message))
  })

  await page.goto(`${baseUrl}/login?redirect=/dashboard/today&cb=${encodeURIComponent(releaseId || 'real-login-smoke')}`, {
    waitUntil: 'domcontentloaded',
    timeout: 45000,
  })
  await page.getByLabel('账号').fill(username)
  await page.getByLabel('密码').fill(password)
  await page.getByRole('button', { name: /进入门店工作台|正在进入/ }).click()
  await page.waitForURL(url => !url.pathname.startsWith('/login'), { timeout: 45000 })
  await page.waitForLoadState('domcontentloaded')
  await waitForRouteQuiet(page)
  result.login.finalUrl = page.url()
  result.login.tokenPresent = await page.evaluate(() => Boolean(window.localStorage.getItem('yingyue_studio_workbench_access_token') || window.localStorage.getItem('Admin-Token')))
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
      await waitForExpectedText(page, route.expectedText || [])
      await waitForRouteQuiet(page)
      current.finalUrl = page.url()
      if (new URL(page.url()).pathname.startsWith('/login')) {
        current.status = 'FAIL'
        current.detail = 'redirected-to-login'
      }
      const bodyText = await page.locator('body').innerText({ timeout: 5000 }).catch(() => '')
      if (hasForbiddenText(bodyText)) {
        current.status = 'FAIL'
        current.detail = current.detail || 'forbidden-visible'
      }
      const missingText = (route.expectedText || []).filter(text => !bodyText.includes(text))
      if (missingText.length) {
        current.status = 'FAIL'
        current.detail = current.detail || `missing-text:${missingText.join(',')}`
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
  ignoredConsoleErrorCount: result.ignoredConsoleErrors.length,
  pageErrorCount: result.pageErrors.length,
}, null, 2))

if (result.status !== 'PASS') {
  process.exitCode = 1
}
