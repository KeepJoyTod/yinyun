const test = require('node:test');
const assert = require('node:assert/strict');

const paymentPlaceholderModule = import('../src/utils/customer-payment-placeholder.mjs');

test('payment placeholder keeps user out of requestPayment when paymentReady is false', async () => {
  const { resolveCustomerPaymentAction } = await paymentPlaceholderModule;

  const action = resolveCustomerPaymentAction({
    orderId: '9001',
    paymentReady: false,
    message: '在线支付暂未接入，订单已创建，请到店或联系门店确认。',
    timeStamp: '',
    nonceStr: '',
    package: '',
    signType: '',
    paySign: '',
  });

  assert.deepEqual(action, {
    shouldRequestPayment: false,
    toastMessage: '在线支付暂未接入，订单已创建，请到店或联系门店确认。',
    fallbackMessage: '订单已创建，请到店确认',
  });
});

test('payment placeholder also blocks requestPayment when timeStamp is empty', async () => {
  const { resolveCustomerPaymentAction } = await paymentPlaceholderModule;

  const action = resolveCustomerPaymentAction({
    orderId: '9002',
    paymentReady: true,
    message: '',
    timeStamp: '',
    nonceStr: '',
    package: '',
    signType: '',
    paySign: '',
  });

  assert.equal(action.shouldRequestPayment, false);
  assert.equal(action.toastMessage, '订单已创建，请到店确认');
  assert.equal(action.fallbackMessage, '订单已创建，请到店确认');
});

test('payment placeholder allows requestPayment when paymentReady is true and timeStamp exists', async () => {
  const { resolveCustomerPaymentAction } = await paymentPlaceholderModule;

  const action = resolveCustomerPaymentAction({
    orderId: '9003',
    paymentReady: true,
    message: '',
    timeStamp: '1719200000',
    nonceStr: 'nonce',
    package: 'prepay_id=1',
    signType: 'RSA',
    paySign: 'sign',
  });

  assert.equal(action.shouldRequestPayment, true);
  assert.equal(action.toastMessage, '');
  assert.equal(action.fallbackMessage, '订单已创建，请到店确认');
});
