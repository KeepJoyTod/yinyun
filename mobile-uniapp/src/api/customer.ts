import { customerRequest } from './request';
import type {
  CreateCustomerOrderPayload,
  CustomerAuthResponse,
  CustomerOrder,
  CustomerOrderPage,
  CustomerRescheduleRequest,
  CustomerOrderSummary,
  CustomerPaymentParams,
  CustomerProfile,
} from '@/types/clientPhoto';

const customerRoot = '/api/customer';
const customerApiFallbackEnabled = String(import.meta.env.PROD) !== 'true'
  && String(import.meta.env.VITE_CUSTOMER_API_FALLBACK || 'true').toLowerCase() !== 'false';

function fallbackAllowed(error: unknown) {
  if (!customerApiFallbackEnabled) {
    throw error;
  }
}

function fallbackUser(phone = '') {
  return {
    id: `local-customer-${phone || 'preview'}`,
    phone,
    phoneMasked: phone ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '预览会员',
    nickname: '影约会员',
    platform: 'H5' as const,
    createdAt: new Date().toISOString(),
  };
}

function fallbackOrder(): CustomerOrder {
  return {
    orderId: 'local-order-preview',
    orderNo: 'YY-PREVIEW-0001',
    productTitle: '职业形象照基础套餐',
    storeName: '影约云旗舰店',
    status: 'CONFIRMED',
    statusLabel: '已预约',
    amount: 199,
    payStatus: 'PAID',
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTimeSlot: '10:00-10:30',
    appointmentTime: `${new Date().toISOString().slice(0, 10)} 10:00-10:30`,
    storePhone: '',
    storeAddress: '预约后显示详细到店地址',
    refundRule: '正式接口接入后按门店退款规则计算。',
    rescheduleRule: '正式接口接入后按门店改期规则提交。',
    canCancel: true,
    canReschedule: true,
    rescheduleRemainingCount: 1,
    refundRatio: 0.8,
    estimatedRefundAmount: 159,
  };
}

export function customerWechatLogin(code: string): Promise<CustomerAuthResponse> {
  return customerRequest<CustomerAuthResponse>({
    url: `${customerRoot}/auth/wechat-login`,
    method: 'POST',
    data: { code },
    silent: true,
  }).catch((error) => {
    fallbackAllowed(error);
    const user = fallbackUser();
    return {
      accessToken: `local-customer-token-${Date.now()}`,
      refreshToken: '',
      expiresIn: 24 * 60 * 60,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      user,
    };
  });
}

export function bindCustomerPhone(phone: string, verificationCode?: string) {
  return customerRequest<CustomerProfile & Partial<CustomerAuthResponse>>({
    url: `${customerRoot}/auth/bind-phone`,
    method: 'POST',
    data: { phone, verificationCode },
    silent: customerApiFallbackEnabled,
  }).catch((error) => {
    fallbackAllowed(error);
    return fallbackUser(phone);
  });
}

export function getCustomerProfile() {
  return customerRequest<CustomerProfile>({
    url: `${customerRoot}/profile`,
    silent: true,
  }).catch((error) => {
    fallbackAllowed(error);
    return fallbackUser();
  });
}

export function getCustomerOrderSummary() {
  return customerRequest<CustomerOrderSummary>({
    url: `${customerRoot}/orders/summary`,
    silent: true,
  }).catch((error) => {
    fallbackAllowed(error);
    return {
      totalOrders: 1,
      pendingPaymentCount: 0,
      pendingSelectionCount: 0,
      completedCount: 0,
      downloadablePhotoCount: 0,
    };
  });
}

export interface CustomerOrderListParams {
  page?: number;
  size?: number;
  status?: string;
}

export function listCustomerOrders(params: CustomerOrderListParams = {}) {
  const query: string[] = [
    `page=${encodeURIComponent(String(params.page ?? 0))}`,
    `size=${encodeURIComponent(String(params.size ?? 20))}`,
  ];
  if (params.status) {
    query.push(`status=${encodeURIComponent(params.status)}`);
  }
  return customerRequest<CustomerOrderPage>({
    url: `${customerRoot}/orders?${query.join('&')}`,
    silent: true,
  }).catch((error) => {
    fallbackAllowed(error);
    const order = fallbackOrder();
    return {
      content: !params.status || params.status === order.status ? [order] : [],
      totalElements: !params.status || params.status === order.status ? 1 : 0,
      number: params.page ?? 0,
      size: params.size ?? 20,
      last: true,
    };
  });
}

export function getCustomerOrder(orderId: string) {
  return customerRequest<CustomerOrder>({
    url: `${customerRoot}/orders/${encodeURIComponent(orderId)}`,
    silent: true,
  }).catch((error) => {
    fallbackAllowed(error);
    return { ...fallbackOrder(), orderId };
  });
}

export function createCustomerOrder(payload: CreateCustomerOrderPayload) {
  return customerRequest<CustomerOrder>({
    url: `${customerRoot}/orders`,
    method: 'POST',
    data: payload as unknown as Record<string, unknown>,
  }).catch((error) => {
    fallbackAllowed(error);
    return {
      ...fallbackOrder(),
      orderId: `local-order-${Date.now()}`,
      productId: payload.skuId,
      storeId: payload.storeId,
      customerName: payload.customerName,
      appointmentDate: payload.appointmentDate,
      appointmentTimeSlot: payload.timeSlot,
      appointmentTime: `${payload.appointmentDate} ${payload.timeSlot}`,
      status: 'PENDING_PAYMENT',
      statusLabel: '待支付',
      payStatus: 'UNPAID',
    };
  });
}

export function payCustomerOrder(orderId: string) {
  return customerRequest<CustomerPaymentParams>({
    url: `${customerRoot}/orders/${encodeURIComponent(orderId)}/pay`,
    method: 'POST',
  }).catch((error) => {
    fallbackAllowed(error);
    return {
      timeStamp: '',
      nonceStr: '',
      package: '',
      signType: '',
      paySign: '',
      paymentReady: false,
      message: '在线支付暂未接入，订单已创建，请到店或联系门店确认。',
      orderId,
      orderNo: fallbackOrder().orderNo,
      amount: fallbackOrder().amount,
      provider: 'WECHAT_MINI_APP',
      outTradeNo: '',
      payStatus: 'UNPAID',
      paymentRecordId: '',
    };
  });
}

export function cancelCustomerOrder(orderId: string, reason?: string) {
  return customerRequest<CustomerOrder>({
    url: `${customerRoot}/orders/${encodeURIComponent(orderId)}/cancel`,
    method: 'POST',
    data: { reason: reason || '' },
  }).catch((error) => {
    fallbackAllowed(error);
    return {
      ...fallbackOrder(),
      orderId,
      status: 'CANCELLED',
      statusLabel: '已取消',
    };
  });
}

export function rescheduleCustomerOrder(
  orderId: string,
  payload: { newDate: string; newTimeSlot: string; reason?: string },
) {
  return customerRequest<CustomerRescheduleRequest>({
    url: `${customerRoot}/orders/${encodeURIComponent(orderId)}/reschedule`,
    method: 'POST',
    data: payload,
  }).catch((error) => {
    fallbackAllowed(error);
    return {
      orderId,
      newDate: payload.newDate,
      newTimeSlot: payload.newTimeSlot,
      reason: payload.reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
  });
}
