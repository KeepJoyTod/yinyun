import type { CustomerOrder, CustomerOrderStatus } from '@/types/clientPhoto';

export const ORDER_STATUS_FILTER_KEY = 'yy_customer_order_status_filter';

export interface StatusTab {
  key: string;
  label: string;
  status?: CustomerOrderStatus | 'AFTERSALE';
}

export interface OrderActionItem {
  key: 'detail' | 'pay' | 'cancel' | 'selection' | 'albums' | 'reschedule';
  label: string;
  type: 'primary' | 'secondary' | 'plain';
}

export const tabs: StatusTab[] = [
  { key: 'all', label: '全部' },
  { key: 'pay', label: '待支付', status: 'PENDING_PAYMENT' },
  { key: 'confirm', label: '待确认', status: 'PENDING_CONFIRM' },
  { key: 'booked', label: '已预约', status: 'CONFIRMED' },
  { key: 'shooting', label: '拍摄中', status: 'SHOOTING' },
  { key: 'selection', label: '待选片', status: 'PENDING_SELECTION' },
  { key: 'done', label: '已完成', status: 'DELIVERED' },
  { key: 'after', label: '售后', status: 'AFTERSALE' },
];

export function findActiveTab(activeKey: string) {
  return tabs.find((item) => item.key === activeKey) || tabs[0];
}

export function resolvePresetActiveKey(preset?: string) {
  if (!preset) {
    return '';
  }
  return tabs.find((tab) => tab.status === preset)?.key || '';
}

export function queryStatus(tab: StatusTab) {
  const status = tab.status;
  if (!status || status === 'AFTERSALE') {
    return undefined;
  }
  return status;
}

export function actionsFor(order: CustomerOrder): OrderActionItem[] {
  const actions: OrderActionItem[] = [{ key: 'detail', label: '查看详情', type: 'secondary' }];
  if (order.status === 'PENDING_PAYMENT') {
    actions.unshift({ key: 'pay', label: '去支付', type: 'primary' });
    actions.push({ key: 'cancel', label: '取消', type: 'plain' });
  }
  if (order.status === 'CONFIRMED') {
    actions.push({
      key: 'reschedule',
      label: order.canReschedule === false ? '不可改期' : '改期',
      type: 'secondary',
    });
    actions.push({ key: 'cancel', label: '取消', type: 'plain' });
  }
  if (order.status === 'PENDING_SELECTION') {
    actions.unshift({ key: 'selection', label: '去选片', type: 'primary' });
    actions.push({ key: 'albums', label: '查看底片', type: 'secondary' });
  }
  if (order.status === 'DELIVERED') {
    actions.unshift({ key: 'albums', label: '查看底片', type: 'primary' });
  }
  return actions;
}
