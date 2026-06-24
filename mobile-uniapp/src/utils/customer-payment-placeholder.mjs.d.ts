declare module '@/utils/customer-payment-placeholder.mjs' {
  import type { CustomerPaymentParams } from '@/types/clientPhoto';

  export interface CustomerPaymentAction {
    shouldRequestPayment: boolean;
    toastMessage: string;
    fallbackMessage: string;
  }

  export function resolveCustomerPaymentAction(
    params?: Partial<CustomerPaymentParams> | null,
  ): CustomerPaymentAction;
}
