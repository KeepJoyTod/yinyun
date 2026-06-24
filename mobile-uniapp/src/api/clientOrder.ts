import { request } from './request';

export const YY_ORDER_CLIENT_TOKEN_KEY = 'yy_order_client_token';

export interface ClientOrderAccessQuery {
  storeId: string;
  phone?: string;
  phoneLast4?: string;
}

export interface ClientOrderByPhoneItem {
  orderId?: string | number;
  orderNo?: string;
  channelType?: string;
  status?: string;
  orderStatus?: string;
  payStatus?: string;
  title?: string;
  productTitle?: string;
  customerName?: string;
  phoneMasked?: string;
  amount?: number | string;
  createdTime?: string;
  appointmentTime?: string;
  pickupUrl?: string;
  orderDetailUrl?: string;
}

export interface ClientOrderAccessToken {
  clientOrderToken: string;
  expiresIn: number;
  expiresAt: string;
  phoneMasked: string;
  orders?: ClientOrderByPhoneItem[];
}

type ClientOrderPayload =
  | ClientOrderByPhoneItem[]
  | {
    records?: ClientOrderByPhoneItem[];
    list?: ClientOrderByPhoneItem[];
    orders?: ClientOrderByPhoneItem[];
  };

function normalizeDigits(value?: string) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeOrderPayload(payload: ClientOrderPayload): ClientOrderByPhoneItem[] {
  if (Array.isArray(payload)) {
    return payload;
  }
  return payload.records || payload.list || payload.orders || [];
}

function saveOrderToken(token: ClientOrderAccessToken) {
  if (token?.clientOrderToken) {
    uni.setStorageSync(YY_ORDER_CLIENT_TOKEN_KEY, JSON.stringify(token));
  }
}

function readOrderTokenValue() {
  try {
    const raw = uni.getStorageSync(YY_ORDER_CLIENT_TOKEN_KEY);
    if (!raw) {
      return '';
    }
    const token = JSON.parse(String(raw)) as ClientOrderAccessToken;
    return token.clientOrderToken || '';
  } catch {
    uni.removeStorageSync(YY_ORDER_CLIENT_TOKEN_KEY);
    return '';
  }
}

export function verifyClientOrderAccess(query: ClientOrderAccessQuery) {
  return request<ClientOrderAccessToken>({
    url: '/client/orders/auth/verify',
    method: 'POST',
    token: false,
    data: {
      storeId: String(query.storeId || '').trim(),
      phone: normalizeDigits(query.phone),
      phoneLast4: normalizeDigits(query.phoneLast4),
    },
  }).then((token) => {
    saveOrderToken(token);
    return {
      ...token,
      orders: normalizeOrderPayload(token.orders || []),
    };
  });
}

export function listClientOrdersByOrderToken() {
  const clientOrderToken = readOrderTokenValue();
  if (!clientOrderToken) {
    return Promise.reject(new Error('订单访问已失效，请重新验证手机号'));
  }
  return request<ClientOrderPayload>({
    url: '/client/orders',
    token: false,
    header: {
      'X-Client-Order-Token': clientOrderToken,
    },
  }).then(normalizeOrderPayload);
}
