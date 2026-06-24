import type { StoreInfo } from '../../shared/stores/appStore'

export type OrderExportQueryInput = {
  selectedTimeType: 'order' | 'arrival'
  startDate?: string
  endDate?: string
  storeName?: string
  sourceLabel?: string
  paymentLabel?: string
  statusLabel?: string
  statusLabels?: string[]
  serviceLabel?: string
  methodLabel?: string
  amountMin?: string
  amountMax?: string
  keyword?: string
  stores?: Pick<StoreInfo, 'backendId' | 'name'>[]
}

const sourceExportValues: Record<string, string> = {
  本地: 'LOCAL',
  抖音: 'DOUYIN',
  抖音来客: 'DOUYIN_LIFE',
  抖音小程序: 'DOUYIN_MINI_APP',
  美团: 'MEITUAN',
  微信: 'WECHAT',
  手工导入: 'IMPORT',
}

const paymentExportValues: Record<string, string> = {
  待支付: 'UNPAID',
  已支付: 'PAID',
  部分支付: 'PARTIAL_REFUNDED',
  已退款: 'REFUNDED',
}

const methodExportValues: Record<string, string> = {
  人工预约: 'MANUAL',
  H5预约: 'H5',
  小程序: 'MINI_APP',
  App: 'APP',
  渠道同步: 'CHANNEL',
}

const statusExportValues: Record<string, string> = {
  待确认: 'PENDING',
  已确认: 'CONFIRMED',
  已到店: 'ARRIVED',
  服务中: 'SERVING',
  拍摄中: 'SERVING',
  选片中: 'COMPLETED',
  已完成: 'COMPLETED',
  已取消: 'CANCELLED',
  已退单: 'REFUNDED',
}

const isConcreteFilter = (value: string | undefined, defaults: string[]) =>
  Boolean(value && value.trim() && !defaults.includes(value) && !value.startsWith('全部'))

const dayStart = (value: string | undefined) => value ? `${value} 00:00:00` : undefined
const dayEnd = (value: string | undefined) => value ? `${value} 23:59:59` : undefined

export const getUnsupportedOrderExportFilters = ({
  serviceLabel,
  methodLabel,
  amountMin,
  amountMax,
  statusLabels = [],
}: OrderExportQueryInput) => {
  const unsupported: string[] = []
  if (isConcreteFilter(serviceLabel, ['服务类型', '全部服务'])) unsupported.push('服务产品')
  if (isConcreteFilter(methodLabel, ['全部方式']) && !methodExportValues[methodLabel as string]) unsupported.push('预约方式')
  if (amountMin?.trim() || amountMax?.trim()) unsupported.push('金额区间')
  if (statusLabels.length > 1) unsupported.push('多状态')
  return unsupported
}

export type OrderExportSyncNoticeInput = {
  demoMode: boolean
  sourceLabel?: string
}

export const getOrderExportSyncNotice = ({
  demoMode,
  sourceLabel,
}: OrderExportSyncNoticeInput) => {
  if (demoMode) return 'Demo 模式仅预览样例；真实对账请连接 API，并先同步抖音来客订单。'
  if (sourceLabel === '抖音来客') return '导出范围：本地 yy_order 已同步订单。抖音来客对账前，先同步近24小时或指定时间窗口。'
  return '导出范围：本地 yy_order 已同步订单；跨渠道对账前请确认对应渠道已完成同步。'
}

export const buildOrderExportQuery = ({
  selectedTimeType,
  startDate,
  endDate,
  storeName,
  sourceLabel,
  paymentLabel,
  statusLabel,
  methodLabel,
  keyword,
  stores = [],
}: OrderExportQueryInput) => {
  const store = isConcreteFilter(storeName, ['门店选择'])
    ? stores.find(item => item.name === storeName)
    : undefined
  const normalizedKeyword = keyword?.trim()
  const query: Record<string, string | number | undefined> = {
    pageNum: 1,
    pageSize: 5000,
    storeId: store?.backendId,
    keyword: normalizedKeyword || undefined,
  }

  if (isConcreteFilter(sourceLabel, ['订单来源'])) query.source = sourceExportValues[sourceLabel as string]
  if (isConcreteFilter(paymentLabel, ['支付状态'])) query.payStatus = paymentExportValues[paymentLabel as string]
  if (isConcreteFilter(statusLabel, ['all', '全部有效订单'])) query.status = statusExportValues[statusLabel as string]
  if (isConcreteFilter(methodLabel, ['全部方式'])) query.bookingMethod = methodExportValues[methodLabel as string]

  if (selectedTimeType === 'order') {
    query.beginOrderTime = dayStart(startDate)
    query.endOrderTime = dayEnd(endDate)
  } else {
    query.beginArrivalTime = dayStart(startDate)
    query.endArrivalTime = dayEnd(endDate)
  }

  return Object.fromEntries(Object.entries(query).filter(([, value]) => value !== undefined && value !== ''))
}
