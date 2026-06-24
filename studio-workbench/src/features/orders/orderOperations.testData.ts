import type { Album, BookingOrder, ChannelSyncLogInfo, OperationLogInfo } from '../../shared/stores/appStore'

export const baseOrder: BookingOrder = {
  backendId: '1',
  storeBackendId: '10',
  id: 'order-1',
  customer: '张三',
  phone: '13800000000',
  store: '影约云旗舰店',
  service: '证件照',
  source: '微信小程序',
  method: '在线预约',
  orderTime: '06-13 09:10',
  orderDate: '2026-06-13',
  orderClock: '09:10',
  arrivalTime: '06-14 10:00',
  arrivalDate: '2026-06-14',
  arrivalClock: '10:00',
  status: '待确认',
  payment: '已支付',
  amount: 299,
}

export const makeOrder = (overrides: Partial<BookingOrder> = {}): BookingOrder => ({
  ...baseOrder,
  ...overrides,
})

export const makeChannelLog = (overrides: Partial<ChannelSyncLogInfo> = {}): ChannelSyncLogInfo => ({
  backendId: 'log-1',
  storeName: '影约云旗舰店',
  channelType: 'DOUYIN_LIFE',
  apiName: 'goodlife/v1/trade/order/query',
  requestId: 'douyin-logid-001',
  status: 'SUCCESS',
  errorMessage: '',
  durationMs: 120,
  retryable: false,
  remark: '',
  ...overrides,
})

export const makeOperationLog = (overrides: Partial<OperationLogInfo> = {}): OperationLogInfo => ({
  backendId: 'oper-1',
  title: '预约订单',
  action: 'POST /yy/order/9001/transition',
  operator: '门店主管',
  operatorType: 1,
  deptName: '影约云旗舰店',
  requestMethod: 'POST',
  url: '/yy/order/9001/transition',
  ip: '127.0.0.1',
  status: 'SUCCESS',
  errorMessage: '',
  requestPayload: '',
  responsePayload: '',
  happenedAt: '2026-06-15 09:20:00',
  durationMs: 146,
  ...overrides,
})

export const makeAlbum = (overrides: Partial<Album> = {}): Album => ({
  backendId: 'album-1',
  orderBackendId: '1',
  id: 'ALB-1',
  orderId: 'order-1',
  customer: '张三',
  service: '证件照',
  date: '2026-06-14',
  photographer: '摄影师A',
  status: '待客户选片',
  selectedCount: 0,
  totalCount: 0,
  negatives: [],
  ...overrides,
})
