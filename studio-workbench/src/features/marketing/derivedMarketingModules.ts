import type { BookingOrder, CustomerInfo } from '../../shared/stores/appStore'

export type DerivedMarketingFeatureKey =
  | 'marketing-center'
  | 'marketing-coupons'
  | 'marketing-campaigns'
  | 'marketing-participations'

export type DerivedMarketingStage = '有效转化' | '待跟进' | '已转化' | '待转化' | '已退款'

export type DerivedMarketingModule = {
  key: DerivedMarketingFeatureKey
  title: string
  eyebrow: string
  description: string
  emptyTitle: string
  emptyHint: string
  source: 'center' | 'coupons' | 'campaigns' | 'participations'
}

export type DerivedMarketingItem = {
  id: string
  title: string
  subtitle: string
  module: DerivedMarketingModule
  order?: BookingOrder
  customer?: CustomerInfo
  stage: DerivedMarketingStage
  metricLabel: string
  ruleHint: string
  nextAction: string
  actionLabel: string
  actionPath: string
  boundary: string
  sourceLabel: string
}

const moduleConfigs: DerivedMarketingModule[] = [
  {
    key: 'marketing-center',
    title: '营销中心',
    eyebrow: 'Marketing Center',
    description: '按统一订单来源聚合渠道转化、支付金额和待跟进订单，作为门店营销运营总览。',
    emptyTitle: '当前没有营销转化数据',
    emptyHint: '微信、抖音、美团或门店线索订单进入 yy_order 后，会按来源汇总在这里。',
    source: 'center',
  },
  {
    key: 'marketing-coupons',
    title: '优惠券',
    eyebrow: 'Coupon Leads',
    description: '从券、团购和兑换类订单派生优惠券线索；未接真实券表前，不展示虚假的发放、领取或核销结果。',
    emptyTitle: '当前没有券或团购订单线索',
    emptyHint: '抖音、美团团购或兑换券订单同步后，会作为只读线索显示在这里。',
    source: 'coupons',
  },
  {
    key: 'marketing-campaigns',
    title: '活动清单',
    eyebrow: 'Campaign List',
    description: '按订单来源派生活动承接清单，查看渠道订单量、金额和待转化情况。',
    emptyTitle: '当前没有可派生活动',
    emptyHint: '有明确来源的订单会形成活动承接清单；真实活动规则仍等待营销表接入。',
    source: 'campaigns',
  },
  {
    key: 'marketing-participations',
    title: '活动参与记录',
    eyebrow: 'Campaign Participations',
    description: '逐单查看客户参与、支付转化、退款和后续跟进状态，所有结果仍以 yy_order 为准。',
    emptyTitle: '当前没有活动参与记录',
    emptyHint: '客户从微信、抖音、美团或门店入口下单后，会形成参与和转化记录。',
    source: 'participations',
  },
]

export const derivedMarketingModules = moduleConfigs

export const getDerivedMarketingModule = (key: string | undefined): DerivedMarketingModule =>
  moduleConfigs.find(module => module.key === key) ?? moduleConfigs[0]

const money = (value: number) => `¥${value.toLocaleString('zh-CN')}`

const orderStage = (order: BookingOrder): DerivedMarketingStage => {
  if (order.payment === '已退款') return '已退款'
  if (order.payment === '已支付' || order.payment === '部分支付') return '已转化'
  return '待转化'
}

const aggregateBySource = (
  module: DerivedMarketingModule,
  orders: BookingOrder[],
  campaignTitle: boolean,
): DerivedMarketingItem[] => {
  const buckets = new Map<string, BookingOrder[]>()
  for (const order of orders) {
    const source = order.source || '未标记来源'
    if (!buckets.has(source)) buckets.set(source, [])
    buckets.get(source)!.push(order)
  }

  return Array.from(buckets.entries()).map(([source, sourceOrders]) => {
    const amount = sourceOrders.reduce((sum, order) => sum + order.amount, 0)
    const paidCount = sourceOrders.filter(order => order.payment === '已支付' || order.payment === '部分支付').length
    const pendingCount = sourceOrders.length - paidCount
    const stage: DerivedMarketingStage = pendingCount ? '待跟进' : '有效转化'
    return {
      id: `${module.key}:${source}`,
      title: campaignTitle ? `${source}活动` : `${source}营销承接`,
      subtitle: `${sourceOrders.length} 单 · ${paidCount} 单已支付 · ${pendingCount} 单待跟进`,
      module,
      stage,
      metricLabel: `${sourceOrders.length} 单 / ${money(amount)}`,
      ruleHint: `已支付 ${paidCount} 单，待转化或退款 ${pendingCount} 单`,
      nextAction: pendingCount
        ? '打开统一订单，优先跟进待支付、待确认和退款订单。'
        : '当前来源订单已形成有效转化，可继续复盘客单价和复购。',
      actionLabel: '查看活动订单',
      actionPath: `/order/campaign?channel=${encodeURIComponent(source)}`,
      boundary: '营销聚合只读取 yy_order 的来源、支付和金额字段，不建立第二套活动或渠道订单账本。',
      sourceLabel: source,
    }
  })
}

const couponKeywords = ['券', '团购', '兑换', '抖音', '美团', '优惠']

const couponItems = (module: DerivedMarketingModule, orders: BookingOrder[], customers: CustomerInfo[]): DerivedMarketingItem[] =>
  orders
    .filter(order => couponKeywords.some(keyword => `${order.source} ${order.service}`.includes(keyword)))
    .map(order => {
      const customer = customers.find(item => item.mobile === order.phone)
      const stage = orderStage(order)
      return {
        id: `${module.key}:${order.id}`,
        title: `${order.source || '渠道'} · ${order.service}`,
        subtitle: `${order.customer || customer?.name || '未命名客户'} · ${order.id}`,
        module,
        order,
        customer,
        stage,
        metricLabel: money(order.amount),
        ruleHint: `${order.payment} · ${order.status} · ${order.store}`,
        nextAction: stage === '待转化'
          ? '跟进支付和渠道同步；真实券状态需要渠道核销或券实例表确认。'
          : stage === '已退款'
            ? '核对退款、渠道账单和客户回访。'
            : '已形成订单转化，但仍需渠道核销记录确认券是否真正使用。',
        actionLabel: '打开统一订单',
        actionPath: `/order/appointment?keyword=${encodeURIComponent(order.id)}`,
        boundary: '当前仅从 yy_order 派生券/团购订单线索，不等于真实优惠券核销记录，也不创建券实例账本。',
        sourceLabel: order.source || '未标记来源',
      }
    })

const participationItems = (
  module: DerivedMarketingModule,
  orders: BookingOrder[],
  customers: CustomerInfo[],
): DerivedMarketingItem[] =>
  orders.map(order => {
    const customer = customers.find(item => item.mobile === order.phone)
    const stage = orderStage(order)
    return {
      id: `${module.key}:${order.id}`,
      title: order.customer || customer?.name || '未命名客户',
      subtitle: `${order.source || '未标记来源'} · ${order.service} · ${order.id}`,
      module,
      order,
      customer,
      stage,
      metricLabel: money(order.amount),
      ruleHint: `${order.payment} · ${order.status} · 到店 ${order.arrivalTime || '未安排'}`,
      nextAction: stage === '待转化'
        ? '跟进支付、到店时间或渠道同步，转化结果以统一订单为准。'
        : stage === '已退款'
          ? '记录退款原因并安排客户回访。'
          : '已形成支付转化，可继续跟进到店、拍摄、选片和交付。',
      actionLabel: '跟进订单',
      actionPath: `/order/appointment?keyword=${encodeURIComponent(order.id)}`,
      boundary: '活动参与记录只读取 yy_order 与 yy_customer，不建立第二套参与、转化或客户账本。',
      sourceLabel: order.source || '未标记来源',
    }
  })

export const buildDerivedMarketingItems = (
  module: DerivedMarketingModule,
  orders: BookingOrder[],
  customers: CustomerInfo[],
): DerivedMarketingItem[] => {
  if (module.source === 'coupons') return couponItems(module, orders, customers)
  if (module.source === 'participations') return participationItems(module, orders, customers)
  return aggregateBySource(module, orders, module.source === 'campaigns')
}
