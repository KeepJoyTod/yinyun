import type { Album, BookingOrder } from '../../shared/stores/appStore'
import {
  getOrderOperationalDate,
  hasCustomerContact,
  isMissingArrivalSchedule,
} from '../../shared/stores/orderIssueRules'

export type DerivedOrderFeatureKey = 'order-print' | 'order-enterprise' | 'order-card' | 'order-coupon'
export type DerivedOrderStage = 'FOLLOW_UP' | 'PRODUCTION' | 'VERIFY' | 'PAID' | 'ISSUE'

export type DerivedOrderModule = {
  key: DerivedOrderFeatureKey
  title: string
  eyebrow: string
  description: string
  emptyTitle: string
  emptyHint: string
  match: (order: BookingOrder, album?: Album) => boolean
  stage: (order: BookingOrder, album?: Album) => DerivedOrderStage
  nextAction: (order: BookingOrder, album?: Album) => string
}

export type DerivedOrderItem = {
  id: string
  order: BookingOrder
  album?: Album
  module: DerivedOrderModule
  stage: DerivedOrderStage
  stageLabel: string
  progressHint: string
  nextAction: string
  actionLabel: string
  actionPath: string
  boundary: string
}

const STAGE_LABELS: Record<DerivedOrderStage, string> = {
  FOLLOW_UP: '待跟进',
  PRODUCTION: '待生产',
  VERIFY: '待核销',
  PAID: '已支付',
  ISSUE: '资料异常',
}

const includesAny = (value: string, keywords: string[]) => keywords.some(keyword => value.includes(keyword))

const orderText = (order: BookingOrder) =>
  `${order.service} ${order.source} ${order.method} ${order.id}`.toLowerCase()

const albumForOrder = (order: BookingOrder, albums: Album[]) =>
  albums.find(album => album.orderBackendId === order.backendId || album.orderId === order.id)

const paidStage = (order: BookingOrder): DerivedOrderStage =>
  order.payment === '已支付' ? 'PAID' : 'FOLLOW_UP'

const hasDataIssue = (order: BookingOrder) => !hasCustomerContact(order) || isMissingArrivalSchedule(order)

const appointmentHint = (order: BookingOrder) => {
  if (order.arrivalTime) return `${order.arrivalTime} 到店`
  const operationalDate = getOrderOperationalDate(order)
  if (operationalDate) return `未预约，按 ${operationalDate} 处理`
  return '暂无预约时间'
}

const moduleConfigs: DerivedOrderModule[] = [
  {
    key: 'order-print',
    title: '冲印订单',
    eyebrow: 'Print Orders',
    description: '从统一订单表 yy_order 与客户相册派生冲印、加洗与交付订单视图。',
    emptyTitle: '当前没有冲印或加洗订单',
    emptyHint: '包含冲印、加洗、相纸、证照打印等关键词的订单会出现在这里。',
    match: (order, album) => includesAny(orderText(order), ['冲印', '加洗', '打印', '相纸', '证照打印']) || Boolean(album && order.service.includes('交付')),
    stage: (order, album) => (album && album.totalCount > 0 ? 'PRODUCTION' : paidStage(order)),
    nextAction: (order, album) => {
      if (album && album.totalCount > 0) return '确认客户照片和规格，进入冲印或交付排产。'
      if (order.payment !== '已支付') return '先跟进支付，再安排冲印生产。'
      return '核对冲印规格，准备进入生产。'
    },
  },
  {
    key: 'order-enterprise',
    title: '企业团单',
    eyebrow: 'Enterprise Orders',
    description: '从统一订单表 yy_order 派生企业客户、团体拍摄和多人订单视图。',
    emptyTitle: '当前没有企业或团体订单',
    emptyHint: '来源或服务名包含企业、团体、团单、多人等关键词的订单会归入这里。',
    match: order => includesAny(orderText(order), ['企业', '团体', '团单', '多人', '公司']),
    stage: order => (hasDataIssue(order) ? 'ISSUE' : paidStage(order)),
    nextAction: order => (hasDataIssue(order) ? '先补齐企业联系人、手机号和预约时间。' : '确认人数、拍摄批次和交付要求。'),
  },
  {
    key: 'order-card',
    title: '售卡订单',
    eyebrow: 'Card Orders',
    description: '从统一订单表 yy_order 派生会员卡、次卡、年卡等售卡订单视图。',
    emptyTitle: '当前没有售卡订单',
    emptyHint: '服务名称或来源包含会员卡、年卡、次卡、储值卡等关键词的订单会归入这里。',
    match: order => includesAny(orderText(order), ['会员卡', '年卡', '次卡', '储值卡', '售卡']),
    stage: paidStage,
    nextAction: order => (order.payment === '已支付' ? '确认卡项权益和有效期，后续同步到会员账户。' : '先跟进客户付款，再开通卡项权益。'),
  },
  {
    key: 'order-coupon',
    title: '售券订单',
    eyebrow: 'Coupon Orders',
    description: '从统一订单表 yy_order 派生优惠券、兑换券和抖音/美团团购券订单视图。',
    emptyTitle: '当前没有售券或团购券订单',
    emptyHint: '抖音来客、美团、优惠券、兑换券、团购券等来源订单会归入这里。',
    match: order => includesAny(orderText(order), ['券', '团购', '抖音', '美团', '兑换']),
    stage: order => (order.payment === '已支付' ? 'VERIFY' : 'FOLLOW_UP'),
    nextAction: order => (order.payment === '已支付' ? '核对渠道券码状态，到店后在统一订单处理。' : '先跟进支付或渠道同步状态。'),
  },
]

export const derivedOrderModules = moduleConfigs

export const getDerivedOrderModule = (key: string | undefined): DerivedOrderModule =>
  moduleConfigs.find(module => module.key === key) ?? moduleConfigs[0]

export const buildDerivedOrderItems = (
  module: DerivedOrderModule,
  orders: BookingOrder[],
  albums: Album[],
): DerivedOrderItem[] =>
  orders
    .map(order => ({ order, album: albumForOrder(order, albums) }))
    .filter(({ order, album }) => module.match(order, album))
    .map(({ order, album }) => {
      const stage = module.stage(order, album)
      return {
        id: `${module.key}:${order.id}`,
        order,
        album,
        module,
        stage,
        stageLabel: STAGE_LABELS[stage],
        progressHint: `${order.orderTime || '暂无下单时间'} 下单，${appointmentHint(order)}，来源 ${order.source || '未知'}`,
        nextAction: module.nextAction(order, album),
        actionLabel: '打开统一订单',
        actionPath: `/order/appointment?q=${encodeURIComponent(order.id)}&quick=all&storeId=${encodeURIComponent(String(order.storeBackendId))}`,
        boundary: `${module.title} 只读取统一订单表 yy_order，相关权益、表单和渠道核销后续由对应模块维护。`,
      }
    })
    .sort((left, right) => {
      if (left.stage === 'ISSUE' && right.stage !== 'ISSUE') return -1
      if (left.stage !== 'ISSUE' && right.stage === 'ISSUE') return 1
      return getOrderOperationalDate(left.order).localeCompare(getOrderOperationalDate(right.order))
        || left.order.arrivalClock.localeCompare(right.order.arrivalClock)
    })
