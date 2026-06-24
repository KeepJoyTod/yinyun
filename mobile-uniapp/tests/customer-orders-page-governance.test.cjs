const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function lineCount(relativePath) {
  return read(relativePath).split(/\r?\n/).length;
}

test('customer orders page delegates presentation, action, and style concerns to focused modules', () => {
  const pageSource = read('src/pages/customer/orders/index.vue');
  const presentationSource = read('src/pages/customer/orders/orderPresentation.ts');
  const actionsSource = read('src/pages/customer/orders/orderActions.ts');
  const styleSource = read('src/pages/customer/orders/orders-page.scss');

  assert.match(pageSource, /from '\.\/orderPresentation'/);
  assert.match(pageSource, /from '\.\/orderActions'/);
  assert.match(pageSource, /<style scoped src="\.\/orders-page\.scss"><\/style>/);

  assert.doesNotMatch(pageSource, /function normalizeOrder/);
  assert.doesNotMatch(pageSource, /function statusLabel/);
  assert.doesNotMatch(pageSource, /function payLabel/);
  assert.doesNotMatch(pageSource, /function actionsFor/);
  assert.doesNotMatch(pageSource, /const tabs:\s*StatusTab\[]/);

  assert.match(presentationSource, /export function normalizeOrder/);
  assert.match(presentationSource, /export function statusLabel/);
  assert.match(actionsSource, /export const tabs/);
  assert.match(actionsSource, /export function actionsFor/);
  assert.match(styleSource, /\.orders-content/);

  assert.ok(lineCount('src/pages/customer/orders/index.vue') <= 800, 'customer orders page should stay under temporary 800-line ceiling');
});
