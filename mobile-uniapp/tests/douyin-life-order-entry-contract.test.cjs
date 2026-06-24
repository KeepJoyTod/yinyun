const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const mobileRoot = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(mobileRoot, relativePath), 'utf8');
}

test('douyin life order entry page is registered for H5 and miniapps', () => {
  const pagesJson = read('src/pages.json');

  assert.match(pagesJson, /pages\/douyin\/order\/index/);
  assert.match(pagesJson, /抖音下单/);
});

test('client API exposes public douyin life order entries without photo token', () => {
  const api = read('src/api/clientPhoto.ts');
  const types = read('src/types/clientPhoto.ts');

  assert.match(types, /interface\s+ClientDouyinLifeOrderEntry/);
  assert.match(api, /listDouyinLifeOrderEntries/);
  assert.match(api, /\/client\/douyin-life\/order-entries/);
  assert.match(api, /token:\s*false/);
});

test('login page links to public douyin life order entry page', () => {
  const loginPage = read('src/pages/pickup/login/index.vue');

  assert.match(loginPage, /goDouyinOrder/);
  assert.match(loginPage, /pages\/douyin\/order\/index/);
  assert.match(loginPage, /预约下单/);
});

test('douyin order page can open or copy configured real landing entry', () => {
  const orderPage = read('src/pages/douyin/order/index.vue');

  assert.match(orderPage, /listDouyinLifeOrderEntries/);
  assert.match(orderPage, /landingUrl/);
  assert.match(orderPage, /landingPath/);
  assert.match(orderPage, /uni\.setClipboardData/);
  assert.match(orderPage, /window\.location\.href/);
  assert.match(orderPage, /DOUYIN_LIFE/);
});
