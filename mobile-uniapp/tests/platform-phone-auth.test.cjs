const test = require('node:test');
const assert = require('node:assert/strict');

const phoneAuthModule = import('../src/platform/phone-auth.mjs');

test('wechat and douyin can show platform phone authorization entry', async () => {
  const { canUsePlatformPhoneAuth } = await phoneAuthModule;

  assert.equal(canUsePlatformPhoneAuth('WECHAT_MINI_APP'), true);
  assert.equal(canUsePlatformPhoneAuth('DOUYIN_MINI_APP'), true);
  assert.equal(canUsePlatformPhoneAuth('H5'), false);
  assert.equal(canUsePlatformPhoneAuth('MANUAL'), false);
});

test('phone authorization event extracts modern miniapp phone code', async () => {
  const { extractPhoneAuthCode } = await phoneAuthModule;

  assert.equal(extractPhoneAuthCode({ detail: { code: 'wx-phone-code' } }), 'wx-phone-code');
  assert.equal(extractPhoneAuthCode({ detail: { phoneCode: 'dy-phone-code' } }), 'dy-phone-code');
  assert.equal(extractPhoneAuthCode({ code: 'plain-code' }), 'plain-code');
  assert.equal(extractPhoneAuthCode({ detail: { errMsg: 'getPhoneNumber:fail user deny' } }), '');
});

test('platform login payload keeps only safe exchange fields', async () => {
  const { buildPlatformPhoneLoginPayload } = await phoneAuthModule;

  assert.deepEqual(
    buildPlatformPhoneLoginPayload({
      platform: 'DOUYIN_MINI_APP',
      loginCode: 'login-code',
      phoneCode: 'phone-code',
    }),
    {
      platform: 'DOUYIN_MINI_APP',
      loginCode: 'login-code',
      phoneCode: 'phone-code',
    },
  );
});

test('platform phone authorization failures guide users back to pickup code', async () => {
  const { getPlatformPhoneAuthFallbackMessage } = await phoneAuthModule;

  assert.equal(
    getPlatformPhoneAuthFallbackMessage('平台手机号授权尚未接入，请使用手机号和取片码登录'),
    '手机号授权暂不可用，请继续使用手机号和取片码进入相册。',
  );
  assert.equal(
    getPlatformPhoneAuthFallbackMessage('getPhoneNumber:fail user deny'),
    '你已取消手机号授权，可继续输入手机号和取片码进入相册。',
  );
});

test('login page exposes platform authorization UI without hiding pickup-code fallback', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.resolve(__dirname, '..');
  const loginPage = fs.readFileSync(path.join(root, 'src/pages/pickup/login/index.vue'), 'utf8');

  assert.match(loginPage, /onPlatformPhoneLogin/);
  assert.match(loginPage, /getphonenumber/);
  assert.match(loginPage, /platformAuthMessage/);
  assert.match(loginPage, /取片码/);
  assert.match(loginPage, /进入相册/);
});
