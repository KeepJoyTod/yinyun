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

test('customer order payment flow is owned by a shared module across detail and orders pages', () => {
  const detailSource = read('src/pages/product/detail/index.vue');
  const ordersPageSource = read('src/pages/customer/orders/index.vue');
  const paymentFlowSource = read('src/pages/customer/orders/customerPaymentFlow.ts');

  assert.match(detailSource, /runCustomerOrderPaymentFlow/);
  assert.match(ordersPageSource, /runCustomerOrderPaymentFlow/);
  assert.match(paymentFlowSource, /payCustomerOrder/);
  assert.match(paymentFlowSource, /resolveCustomerPaymentAction/);
  assert.match(paymentFlowSource, /uni\.requestPayment/);
  assert.match(paymentFlowSource, /status: 'success'/);
  assert.match(paymentFlowSource, /status: 'fallback'/);
  assert.match(paymentFlowSource, /status: 'failed'/);
});

test('product detail payment keeps redirecting customers back to the orders page for follow-up payment', () => {
  const detailSource = read('src/pages/product/detail/index.vue');

  assert.match(detailSource, /runCustomerOrderPaymentFlow\(order\.orderId\)/);
  assert.match(detailSource, /uni\.switchTab\(\{ url: '\/pages\/customer\/orders\/index\?refresh=1&fromPayment=1' \}\)/);
});

test('orders page payment reloads the list after the shared payment flow returns', () => {
  const ordersPageSource = read('src/pages/customer/orders/index.vue');

  assert.match(ordersPageSource, /const paymentResult = await runCustomerOrderPaymentFlow\(order\.orderId\)/);
  assert.match(ordersPageSource, /await loadOrders\(\)/);
});
