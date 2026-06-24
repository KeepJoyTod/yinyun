import type { Album, BookingOrder } from '../../shared/stores/appStore'
import {
  getOrderOperationalDate,
  hasCustomerContact,
  isMissingArrivalSchedule,
} from '../../shared/stores/orderIssueRules'

export type DerivedOrderFeatureKey = 'order-print' | 'order-enterprise' | 'order-card' | 'order-coupon' | 'order-forms'
export type DerivedOrderStage = '待跟进' | '待生产' | '待核销' | '已支付' | '资料异常'

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

const includesAny = (value: string, keywords: string[]) => keywords.some(keyword => value.includes(keyword))

const orderText = (order: BookingOrder) =>
  `${order.service} ${order.source} ${order.method} ${order.id}`.toLowerCase()

const albumForOrder = (order: BookingOrder, albums: Album[]) =>
  albums.find(album => album.orderBackendId === order.backendId || album.orderId === order.id)

const paidStage = (order: BookingOrder): DerivedOrderStage =>
  order.payment === '已支付' ? '已支付' : '待跟进'

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
    description: '从统一订单表 yy_order 和客户相册派生冲印/加洗/交付订单视图，店员只跟进生产和交付，不建立第二套冲印订单账本。',
    emptyTitle: '当前没有冲印或加洗订单',
    emptyHint: '真实冲印商品上线后，包含冲印、加洗、相纸、证照打印等关键词的订单会自动出现在这里。',
    match: (order, album) => includesAny(orderText(order), ['冲印', '加洗', '打印', '相纸', '证照打印']) || Boolean(album && order.service.includes('交付')),
    stage: (order, album) => (album && album.totalCount > 0 ? '待生产' : paidStage(order)),
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
    description: '从统一订单表 yy_order 派生企业客户、团体拍摄和多人订单视图，用于前台跟进交付，不建立第二套企业订单账本。',
    emptyTitle: '当前没有企业或团体订单',
    emptyHint: '来源或服务名称包含企业、团体、团单、多人等关键词的订单会自动归入这里。',
    match: order => includesAny(orderText(order), ['企业', '团体', '团单', '多人', '公司']),
    stage: order => (hasDataIssue(order) ? '资料异常' : paidStage(order)),
    nextAction: order => (hasDataIssue(order) ? '先补齐企业联系人、手机号和预约时间。' : '确认人数、拍摄批次和交付要求。'),
  },
  {
    key: 'order-card',
    title: '售卡订单',
    eyebrow: 'Card Orders',
    description: '从统一订单表 yy_order 派生会员卡、次卡、年卡等售卡订单视图，权益账本后续进入会员模块统一维护。',
    emptyTitle: '当前没有售卡订单',
    emptyHint: '服务名称或来源包含会员卡、年卡、次卡、储值卡等关键词的订单会自动归入这里。',
    match: order => includesAny(orderText(order), ['会员卡', '年卡', '次卡', '储值卡', '售卡']),
    stage: paidStage,
    nextAction: order => (order.payment === '已支付' ? '确认卡项权益和有效期，后续同步到会员账户。' : '先跟进客户付款，再开通卡项权益。'),
  },
  {
    key: 'order-coupon',
    title: '售券订单',
    eyebrow: 'Coupon Orders',
    description: '从统一订单表 yy_order 派生优惠券、兑换券和抖音/美团团购券订单视图，真实核销仍由渠道适配器处理。',
    emptyTitle: '当前没有售券或团购券订单',
    emptyHint: '抖音来客、美团、优惠券、兑换券、团购券等来源订单会自动归入这里。',
    match: order => includesAny(orderText(order), ['券', '团购', '抖音', '美团', '兑换']),
    stage: order => (order.payment === '已支付' ? '待核销' : '待跟进'),
    nextAction: order => (order.payment === '已支付' ? '核对渠道券码状态，预约到店后在统一订单处理。' : '先跟进支付或渠道同步状态。'),
  },
  {
    key: 'order-forms',
    title: '表单管理',
    eyebrow: 'Form Submissions',
    description: '从统一订单表 yy_order 派生客户表单和资料跟进视图，重点处理缺姓名、缺手机号、待支付和待确认订单。',
    emptyTitle: '当前没有需要跟进的表单资料',
    emptyHint: '缺资料、表单来源、待支付或待确认订单会出现在这里。',
    match: order => includesAny(orderText(order), ['表单', '问卷', '线索']) || hasDataIssue(order) || order.payment === '待支付' || order.status === '待确认',
    stage: order => (hasDataIssue(order) ? '资料异常' : '待跟进'),
    nextAction: order => {
      if (!order.phone) return '先补齐客户手机号，避免无法通知取片和预约。'
      if (order.payment === '待支付') return '联系客户确认是否保留预约并补支付。'
      return '确认客户资料和到店时间，转入统一订单处理。'
    },
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
        stageLabel: stage,
        progressHint: `${order.orderTime || '暂无下单时间'} 下单，${appointmentHint(order)}，来源 ${order.source || '未知'}`,
        nextAction: module.nextAction(order, album),
        actionLabel: '打开统一订单',
        actionPath: `/order/appointment?q=${encodeURIComponent(order.id)}&quick=all&storeId=${encodeURIComponent(String(order.storeBackendId))}`,
        boundary: `${module.title} 只读取统一订单表 yy_order，相关权益、表单和渠道核销后续由对应模块维护。`,
      }
    })
    .sort((left, right) => {
      if (left.stage === '资料异常' && right.stage !== '资料异常') return -1
      if (left.stage !== '资料异常' && right.stage === '资料异常') return 1
      return getOrderOperationalDate(left.order).localeCompare(getOrderOperationalDate(right.order))
        || left.order.arrivalClock.localeCompare(right.order.arrivalClock)
    })
