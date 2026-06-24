import type { CustomerOrder, CustomerOrderPage, CustomerOrderStatus } from '@/types/clientPhoto';

export function statusLabel(status?: string) {
  const map: Record<string, string> = {
    PENDING_PAYMENT: '待支付',
    PENDING_CONFIRM: '待确认',
    CONFIRMED: '已预约',
    SHOOTING: '拍摄中',
    PENDING_SELECTION: '待选片',
    RETOUCHING: '修图中',
    DELIVERED: '已完成',
    CANCELLED: '已取消',
    REFUNDING: '退款中',
    REFUNDED: '已退款',
  };
  return map[status || ''] || status || '';
}

export function payLabel(payStatus?: string) {
  const map: Record<string, string> = {
    UNPAID: '未支付',
    PAID: '已支付',
    REFUNDING: '退款中',
    REFUNDED: '已退款',
  };
  return map[payStatus || ''] || payStatus || '未支付';
}

export function amountLabel(order: CustomerOrder) {
  return `¥${Number(order.amount ?? order.payAmount ?? 0).toFixed(0)}`;
}

export function moneyLabel(value?: number) {
  return `¥${Number(value || 0).toFixed(0)}`;
}

export function percentLabel(value?: number) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(value?: string) {
  if (!value) {
    return '以订单规则为准';
  }
  return String(value).replace('T', ' ').slice(0, 16);
}

export function buildDefaultRescheduleDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return formatDateValue(date);
}

export function normalizeOrder(raw: CustomerOrder): CustomerOrder {
  const status = (raw.status || raw.orderStatus || 'PENDING_PAYMENT') as CustomerOrderStatus;
  return {
    ...raw,
    orderId: String(raw.orderId || raw.id || ''),
    status,
    statusLabel: raw.statusLabel || statusLabel(status),
    amount: Number(raw.amount ?? raw.payAmount ?? 0),
    productTitle: raw.productTitle || '摄影套餐',
    storeName: raw.storeName || '影约云门店',
    appointmentTime: raw.appointmentTime || [
      raw.appointmentDate,
      raw.appointmentTimeSlot,
    ].filter(Boolean).join(' '),
  };
}

export function normalizePage(payload: CustomerOrderPage): CustomerOrder[] {
  const list = payload?.content || payload?.records || payload?.list || [];
  return list.map(normalizeOrder);
}

export function createEmptyCopy(isLoggedIn: boolean, activeKey: string, activeLabel: string) {
  if (!isLoggedIn) {
    return '登录后可查看预约、支付、选片和底片进度。';
  }
  if (activeKey === 'all') {
    return '还没有预约订单，可先选择门店和套餐。';
  }
  return `当前没有${activeLabel}订单。`;
}
