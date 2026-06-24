const DEFAULT_PAYMENT_PLACEHOLDER_MESSAGE = '订单已创建，请到店确认';

function normalizePaymentMessage(message) {
  return String(message || '').trim() || DEFAULT_PAYMENT_PLACEHOLDER_MESSAGE;
}

export function resolveCustomerPaymentAction(params = {}) {
  const shouldRequestPayment = params.paymentReady !== false && Boolean(params.timeStamp);
  return {
    shouldRequestPayment,
    toastMessage: shouldRequestPayment ? '' : normalizePaymentMessage(params.message),
    fallbackMessage: DEFAULT_PAYMENT_PLACEHOLDER_MESSAGE,
  };
}
