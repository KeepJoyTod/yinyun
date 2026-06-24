declare module '@/utils/customer-payment-placeholder.mjs' {
  import type { CustomerPaymentParams } from '@/types/clientPhoto';

  export interface CustomerPaymentAction {
    shouldRequestPayment: boolean;
    toastMessage: string;
    fallbackMessage: string;
  }

  export type CustomerPaymentFlowResult =
    | { status: 'success'; params: CustomerPaymentParams; toastMessage: string }
    | { status: 'fallback'; params: CustomerPaymentParams; toastMessage: string }
    | { status: 'failed'; params?: CustomerPaymentParams; toastMessage: string };

  export function resolveCustomerPaymentAction(
    params?: Partial<CustomerPaymentParams> | null,
  ): CustomerPaymentAction;
}
