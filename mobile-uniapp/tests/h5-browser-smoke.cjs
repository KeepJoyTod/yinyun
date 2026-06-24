const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (error) {
  console.error('Playwright is required for H5 browser smoke. Install it with: npm install -D playwright');
  throw error;
}

const config = {
  url: process.env.H5_URL || 'http://127.0.0.1:5174/#/pages/pickup/login/index',
  phone: process.env.PICKUP_PHONE || '',
  code: process.env.PICKUP_CODE || '',
  expectedAlbumTitle: process.env.PICKUP_ALBUM_TITLE || '',
  expectDelivered: process.env.PICKUP_EXPECT_DELIVERED === '1',
  assetIndex: Number(process.env.PICKUP_ASSET_INDEX || '1'),
  screenshotDir: process.env.PICKUP_SCREENSHOT_DIR || path.resolve(__dirname, '../../output/h5-browser-smoke'),
};

const knownPresetScenarios = new Map([
  [
    '13800003333|PICK-202606-001',
    {
      albumTitle: '王女士亲子套系选片',
      channelLabel: '网页取片',
      allowEmptyAlbum: false,
    },
  ],
  [
    '13900001111|PREVIEW-20260608',
    {
      albumTitle: '影约云小程序预览相册',
      channelLabel: '门店交付',
      allowEmptyAlbum: true,
    },
  ],
]);

const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'small-phone', width: 320, height: 568 },
  { name: 'landscape', width: 844, height: 390 },
];

function assertIncludes(text, expected, label) {
  assert.ok(text.includes(expected), `${label} should include "${expected}". Actual text: ${text}`);
}

function assertIncludesAny(text, expectedValues, label) {
  assert.ok(
    expectedValues.some((expected) => text.includes(expected)),
    `${label} should include one of ${expectedValues.map((item) => `"${item}"`).join(', ')}. Actual text: ${text}`,
  );
}

async function collectPhotoResponses(page) {
  const responses = [];
  page.on('response', async (response) => {
    if (!response.url().includes('/client/photo')) {
      return;
    }
    let body = '';
    if (response.url().includes('/stream')) {
      body = '[stream]';
    } else {
      try {
        body = await response.text();
      } catch {
        body = '';
      }
    }
    responses.push({
      status: response.status(),
      url: response.url(),
      body: body.slice(0, 500),
    });
  });
  return responses;
}

function screenshotName(viewportName, step) {
  return `${step}-${viewportName}.png`;
}

function summarizeUnexpectedPhotoFailures(responses) {
  return responses.filter((response) => {
    if (response.url.includes('/stream')) {
      return false;
    }
    return response.status >= 400 || !response.body.includes('"code":200');
  });
}

async function waitForPhotoResponses(responses, predicate, label, timeout = 12000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (responses.some(predicate)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for ${label}. Responses: ${JSON.stringify(responses, null, 2)}`);
}

async function runScenario(browser, viewport) {
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
  });
  const pageErrors = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  const responses = await collectPhotoResponses(page);

  try {
    await page.goto(config.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(config.screenshotDir, screenshotName(viewport.name, '01-login')), fullPage: true });

    const initialValues = await page.locator('input').evaluateAll((inputs) => inputs.map((input) => input.value));
    const scenarioPhone = config.phone || initialValues[0];
    const scenarioCode = config.code || initialValues[1];
    const knownScenario = knownPresetScenarios.get(`${scenarioPhone}|${scenarioCode}`) || {};
    const expectedAlbumTitle = config.expectedAlbumTitle || knownScenario.albumTitle || '';
    assert.ok(/^1\d{10}$/.test(scenarioPhone), `login phone preset should be a valid mobile number: ${scenarioPhone}`);
    assert.ok(scenarioCode, 'login pickup code preset should not be empty');
    assert.equal(initialValues[0], scenarioPhone, 'login phone preset');
    assert.equal(initialValues[1], scenarioCode, 'login pickup code preset');

    await page.locator('uni-button').filter({ hasText: '进入相册' }).click();
    await waitForPhotoResponses(
      responses,
      (response) => response.url.includes('/auth/verify') && response.body.includes('"code":200'),
      'auth verify success',
    );
    await page.waitForURL(/#\/pages\/pickup\/albums\/index/, { timeout: 12000 });
    await waitForPhotoResponses(
      responses,
      (response) => response.url.endsWith('/client/photo/albums') && response.body.includes('"code":200'),
      'albums response success',
    );
    await page.waitForTimeout(2500);
    const albumsText = await page.locator('body').innerText();
    if (expectedAlbumTitle) {
      assertIncludes(albumsText, expectedAlbumTitle, 'albums page');
    }
    if (knownScenario.allowEmptyAlbum) {
      assertIncludesAny(albumsText, ['待开放', '可查看'], 'albums customer status label');
    } else {
      assertIncludes(albumsText, '可查看', 'albums customer status label');
    }
    if (knownScenario.channelLabel) {
      assertIncludes(albumsText, knownScenario.channelLabel, 'albums customer channel label');
    }
    if (config.expectDelivered) {
      assertIncludes(albumsText, '已交付', 'albums delivered state');
    }
    assert.ok(!albumsText.includes('ACTIVE'), 'albums page should not expose technical status ACTIVE');
    assert.ok(!albumsText.includes('· H5'), 'albums page should not expose technical channel H5');
    await page.screenshot({ path: path.join(config.screenshotDir, screenshotName(viewport.name, '02-albums')), fullPage: true });

    await page.locator('uni-view.album-card').first().click();
    await page.waitForURL(/#\/pages\/pickup\/detail\/index\?albumId=/, { timeout: 12000 });
    await waitForPhotoResponses(
      responses,
      (response) => response.url.includes('/client/photo/albums/') && response.body.includes('"assets"'),
      'album detail response',
    );
    await page.waitForTimeout(2500);
    const detailText = await page.locator('body').innerText();
    if (expectedAlbumTitle) {
      assertIncludes(detailText, expectedAlbumTitle, 'detail page');
    }
    if (config.expectDelivered) {
      assertIncludes(detailText, '已交付', 'delivered album detail status');
      assertIncludes(detailText, '打开照片查看大图', 'delivered album detail guide');
      assertIncludes(detailText, '保存需要的交付照片', 'delivered album detail guide');
      assertIncludes(detailText, '选片清单已锁定', 'delivered album detail guide');
      assertIncludes(detailText, '查看', 'delivered album detail action');
      assert.ok(!detailText.includes('先点照片右上角选择'), `delivered album detail should not show selection guide. Actual text: ${detailText}`);
      assert.ok(!detailText.includes('选择顺序就是精修顺序'), `delivered album detail should not show retouch sequence guide. Actual text: ${detailText}`);
      assert.ok(!detailText.includes('提交后门店会按顺序处理'), `delivered album detail should not show submit processing guide. Actual text: ${detailText}`);
    }
    const assetTiles = page.locator('uni-view.asset-tile');
    const assetCount = await assetTiles.count();
    if (assetCount === 0) {
      assert.ok(
        knownScenario.allowEmptyAlbum || detailText.includes('门店还未开放照片') || detailText.includes('暂无可见照片'),
        `empty album should be allowed only for preview scenarios or show a clear empty state. Actual text: ${detailText}`,
      );
      assertIncludes(detailText, '门店还未开放照片', 'detail empty album state');
      assert.deepEqual(pageErrors, [], `page should not throw runtime errors: ${pageErrors.join('\n')}`);
      const unexpectedFailures = summarizeUnexpectedPhotoFailures(responses);
      assert.deepEqual(unexpectedFailures, [], `unexpected /client/photo failures: ${JSON.stringify(unexpectedFailures, null, 2)}`);
      await page.screenshot({ path: path.join(config.screenshotDir, screenshotName(viewport.name, '03-detail-empty')), fullPage: true });
      return {
        viewport,
        phone: scenarioPhone,
        code: scenarioCode,
        responseCount: responses.length,
        download: 'empty-album',
      };
    }
    assertIncludesAny(detailText, ['点击照片进入预览', '点开照片可看大图'], 'detail page preview guidance');
    assert.ok(
      detailText.includes('可预览') ||
        detailText.includes('预览暂不可用') ||
        detailText.includes('生成预览中') ||
        detailText.includes('加载照片中'),
      `detail page should show an explicit asset state. Actual text: ${detailText}`,
    );
    assert.ok(
      detailText.includes('查看大图') || detailText.includes('进入重试') || detailText.includes('准备中'),
      `detail page should show a clear asset action. Actual text: ${detailText}`,
    );
    await page.screenshot({ path: path.join(config.screenshotDir, screenshotName(viewport.name, '03-detail')), fullPage: true });

    assert.ok(assetCount > config.assetIndex, `asset index ${config.assetIndex} should exist, assetCount=${assetCount}`);
    await assetTiles.nth(config.assetIndex).click();
    await page.waitForURL(/#\/pages\/pickup\/preview\/index\?albumId=.*assetId=/, { timeout: 12000 });
    await waitForPhotoResponses(
      responses,
      (response) => response.url.includes('/preview-url') && response.body.includes('"code":200'),
      'preview signed url',
    );
    await page.waitForTimeout(3000);
    const previewText = await page.locator('body').innerText();
    assertIncludes(previewText, '安全查看', 'preview page security label');
    assertIncludes(previewText, '下载原图', 'preview page download action');
    if (assetCount > 1) {
      assertIncludes(previewText, '左右滑动切换照片', 'preview page swipe guidance');
    }
    assert.ok(
      !responses.some((response) => response.url.includes('/download-url')),
      'preview page should not request download-url before user clicks download',
    );
    await page.screenshot({ path: path.join(config.screenshotDir, screenshotName(viewport.name, '04-preview')), fullPage: true });

    const downloadButton = page.locator('uni-button').filter({ hasText: '下载原图' });
    await downloadButton.scrollIntoViewIfNeeded();
    await downloadButton.waitFor({ state: 'visible', timeout: 5000 });
    const downloadDisabled = await downloadButton.evaluate((button) => button.hasAttribute('disabled') || button.getAttribute('aria-disabled') === 'true');
    if (downloadDisabled) {
      assertIncludes(previewText, '图片暂时无法预览', 'preview unavailable title');
      assertIncludes(previewText, '重新加载', 'preview unavailable retry action');
      assert.ok(!previewText.includes('原比例查看'), 'preview unavailable state should not show original ratio action');
      assert.ok(
        !responses.some((response) => response.url.includes('/download-url')),
        'disabled download should not request download-url',
      );
      assert.deepEqual(pageErrors, [], `page should not throw runtime errors: ${pageErrors.join('\n')}`);
      return {
        viewport,
        phone: scenarioPhone,
        code: scenarioCode,
        responseCount: responses.length,
        download: 'disabled-preview-unavailable',
      };
    }
    assertIncludes(previewText, '原比例查看', 'preview page original ratio action');
    const downloadResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/download-url') && response.status() === 200,
      { timeout: 12000 },
    );
    const streamResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/stream'),
      { timeout: 12000 },
    );
    await downloadButton.click();
    const downloadResponse = await downloadResponsePromise;
    const downloadBody = await downloadResponse.text();
    assert.ok(downloadBody.includes('"code":200'), `download-url response should succeed. Body: ${downloadBody}`);
    const streamResponse = await streamResponsePromise;
    assert.ok(!streamResponse.url().includes('client_token='), `stream URL should not expose client_token: ${streamResponse.url()}`);
    if (streamResponse.status() === 200) {
      const contentType = streamResponse.headers()['content-type'] || '';
      assert.ok(/^image\//.test(contentType), `stream 200 should return image content-type. Actual: ${contentType}`);
    }
    await page.waitForFunction(
      () => document.body.innerText.includes('下载已开始') || document.body.innerText.includes('限时链接'),
      { timeout: 12000 },
    );

    assert.deepEqual(pageErrors, [], `page should not throw runtime errors: ${pageErrors.join('\n')}`);
    const unexpectedFailures = summarizeUnexpectedPhotoFailures(responses);
    assert.deepEqual(unexpectedFailures, [], `unexpected /client/photo failures: ${JSON.stringify(unexpectedFailures, null, 2)}`);

    return {
      viewport,
      phone: scenarioPhone,
      code: scenarioCode,
      responseCount: responses.length,
      streamStatus: streamResponse.status(),
    };
  } finally {
    await page.close();
  }
}

async function run() {
  fs.mkdirSync(config.screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const viewport of viewports) {
      results.push(await runScenario(browser, viewport));
    }
  } finally {
    await browser.close();
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        url: config.url,
        phone: config.phone || 'auto-from-login-prefill',
        screenshots: config.screenshotDir,
        results,
      },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
