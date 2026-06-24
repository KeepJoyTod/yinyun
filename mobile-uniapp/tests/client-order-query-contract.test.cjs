const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

test('client order query requires store id before verifying customer order token', () => {
  const pageSource = read('src/pages/order/query/index.vue');

  assert.match(pageSource, /请输入门店 ID/);
  assert.match(pageSource, /查询必须填写门店 ID 和完整手机号/);
  assert.match(pageSource, /verifyClientOrderAccess/);
});

test('client order query uses tokenized order lookup api', () => {
  const apiSource = read('src/api/clientOrder.ts');

  assert.match(apiSource, /\/client\/orders\/auth\/verify/);
  assert.match(apiSource, /YY_ORDER_CLIENT_TOKEN_KEY/);
  assert.match(apiSource, /X-Client-Order-Token/);
  assert.doesNotMatch(apiSource, /\/client\/orders\/by-phone/);
});
