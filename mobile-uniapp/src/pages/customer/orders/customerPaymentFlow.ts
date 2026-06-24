import { payCustomerOrder } from '@/api/customer';
import type { CustomerPaymentParams } from '@/types/clientPhoto';
import { resolveCustomerPaymentAction } from '@/utils/customer-payment-placeholder.mjs';

export type CustomerPaymentFlowResult =
  | { status: 'success'; params: CustomerPaymentParams; toastMessage: string }
  | { status: 'fallback'; params: CustomerPaymentParams; toastMessage: string }
  | { status: 'failed'; params?: CustomerPaymentParams; toastMessage: string };

function requestPayment(params: CustomerPaymentParams) {
  return new Promise<void>((resolve, reject) => {
    if (!uni.requestPayment) {
      reject(new Error('REQUEST_PAYMENT_UNAVAILABLE'));
      return;
    }
    (uni.requestPayment as any)({
      ...params,
      success: () => resolve(),
      fail: (err: unknown) => reject(err),
    });
  });
}

export async function runCustomerOrderPaymentFlow(orderId: string): Promise<CustomerPaymentFlowResult> {
  try {
    const params = await payCustomerOrder(orderId);
    const paymentAction = resolveCustomerPaymentAction(params);
    if (!paymentAction.shouldRequestPayment) {
      return {
        status: 'fallback',
        params,
        toastMessage: paymentAction.toastMessage,
      };
    }
    if (!uni.requestPayment) {
      return {
        status: 'failed',
        params,
        toastMessage: '当前环境暂不支持在线支付',
      };
    }
    await requestPayment(params);
    return {
      status: 'success',
      params,
      toastMessage: '已发起支付',
    };
  } catch {
    return {
      status: 'failed',
      toastMessage: '订单已创建，可在订单页继续支付',
    };
  }
}
