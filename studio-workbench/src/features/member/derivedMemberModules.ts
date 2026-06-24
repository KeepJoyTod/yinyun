import type { BookingOrder, CustomerInfo } from '../../shared/stores/appStore'

export type DerivedMemberFeatureKey = 'member-accounts' | 'member-tags' | 'member-consumption'
export type DerivedMemberStage = '高价值' | '普通' | '新客' | '活跃标签' | '低频标签' | '已入账' | '待支付' | '已退款'

export type DerivedMemberModule = {
  key: DerivedMemberFeatureKey
  title: string
  eyebrow: string
  description: string
  emptyTitle: string
  emptyHint: string
  source: 'accounts' | 'tags' | 'consumption'
}

export type DerivedMemberItem = {
  id: string
  title: string
  subtitle: string
  module: DerivedMemberModule
  customer?: CustomerInfo
  order?: BookingOrder
  tag?: string
  stage: DerivedMemberStage
  metricLabel: string
  ruleHint: string
  nextAction: string
  actionLabel: string
  actionPath: string
  boundary: string
  sourceLabel: string
}

const moduleConfigs: DerivedMemberModule[] = [
  {
    key: 'member-accounts',
    title: '会员账户',
    eyebrow: 'Member Accounts',
    description: '从客户档案、订单次数和累计消费派生会员账户视图；暂不维护余额、积分或会员卡第二账本。',
    emptyTitle: '当前没有会员账户',
    emptyHint: '客户档案同步后，会按会员等级、订单次数和累计消费显示在这里。',
    source: 'accounts',
  },
  {
    key: 'member-tags',
    title: '客户标签',
    eyebrow: 'Customer Tags',
    description: '从 yy_customer.tags 派生客户分群和回访线索，标签编辑仍回到客户档案统一维护。',
    emptyTitle: '当前没有客户标签',
    emptyHint: '客户档案补充标签后，会在这里按标签聚合客户数量和跟进建议。',
    source: 'tags',
  },
  {
    key: 'member-consumption',
    title: '消费记录',
    eyebrow: 'Consumption Records',
    description: '从统一订单 yy_order 派生客户消费、退款和待支付记录，便于门店跟进交付和回访。',
    emptyTitle: '当前没有消费记录',
    emptyHint: '微信、抖音、H5 或门店订单同步到 yy_order 后，会按客户展示消费记录。',
    source: 'consumption',
  },
]

export const derivedMemberModules = moduleConfigs

export const getDerivedMemberModule = (key: string | undefined): DerivedMemberModule =>
  moduleConfigs.find(module => module.key === key) ?? moduleConfigs[0]

const money = (value: number) => `¥${value.toLocaleString('zh-CN')}`

const accountStage = (customer: CustomerInfo): DerivedMemberStage => {
  if (customer.totalSpend >= 1000 || customer.memberLevel.includes('金') || customer.memberLevel.includes('VIP')) return '高价值'
  if (customer.totalOrderCount <= 1) return '新客'
  return '普通'
}

const consumptionStage = (order: BookingOrder): DerivedMemberStage => {
  if (order.payment === '已退款') return '已退款'
  if (order.payment === '待支付') return '待支付'
  return '已入账'
}

const byPhone = (orders: BookingOrder[], phone: string) => orders.filter(order => order.phone === phone)

const accountItems = (module: DerivedMemberModule, customers: CustomerInfo[], orders: BookingOrder[]): DerivedMemberItem[] =>
  customers.map(customer => {
    const relatedOrders = byPhone(orders, customer.mobile)
    const stage = accountStage(customer)
    return {
      id: `${module.key}:${customer.backendId}`,
      title: customer.name,
      subtitle: `${customer.mobile} · ${customer.source || '未标记来源'} · ${customer.memberLevel || '普通'}`,
      module,
      customer,
      stage,
      metricLabel: `${money(customer.totalSpend)} / ${customer.totalOrderCount} 单`,
      ruleHint: `最近订单 ${customer.lastOrderTime || '暂无'} · 已匹配 ${relatedOrders.length} 条统一订单`,
      nextAction: stage === '高价值'
        ? '优先安排回访、加片和复购提醒；会员权益仍回到客户档案维护。'
        : '保持基础跟进，后续积分、余额和卡项上线后再扩展真实账户账本。',
      actionLabel: '打开客户档案',
      actionPath: `/member/customers?q=${encodeURIComponent(customer.mobile)}`,
      boundary: '会员账户当前只从 yy_customer 与 yy_order 派生，不建立第二套积分、余额或卡项账本。',
      sourceLabel: 'yy_customer',
    }
  })

const tagItems = (module: DerivedMemberModule, customers: CustomerInfo[]): DerivedMemberItem[] => {
  const buckets = new Map<string, CustomerInfo[]>()
  for (const customer of customers) {
    for (const tag of customer.tags) {
      if (!buckets.has(tag)) buckets.set(tag, [])
      buckets.get(tag)!.push(customer)
    }
  }

  return Array.from(buckets.entries()).map(([tag, taggedCustomers]) => {
    const totalSpend = taggedCustomers.reduce((sum, customer) => sum + customer.totalSpend, 0)
    const stage: DerivedMemberStage = taggedCustomers.length >= 2 ? '活跃标签' : '低频标签'
    return {
      id: `${module.key}:${tag}`,
      title: tag,
      subtitle: taggedCustomers.map(customer => customer.name).join(' / '),
      module,
      tag,
      stage,
      metricLabel: `${taggedCustomers.length} 人`,
      ruleHint: `累计消费 ${money(totalSpend)} · 来源 ${Array.from(new Set(taggedCustomers.map(customer => customer.source))).join(' / ') || '未标记'}`,
      nextAction: '在客户档案中维护标签、备注和回访节奏；这里仅做分群查看和运营提示。',
      actionLabel: '打开客户档案',
      actionPath: `/member/customers?tag=${encodeURIComponent(tag)}`,
      boundary: '客户标签只读取 yy_customer.tags，不在工作台创建第二套标签账本。',
      sourceLabel: 'yy_customer.tags',
    }
  })
}

const consumptionItems = (
  module: DerivedMemberModule,
  customers: CustomerInfo[],
  orders: BookingOrder[],
): DerivedMemberItem[] =>
  orders.map(order => {
    const customer = customers.find(item => item.mobile === order.phone)
    const stage = consumptionStage(order)
    return {
      id: `${module.key}:${order.id}`,
      title: order.customer || customer?.name || '未命名客户',
      subtitle: `${order.service} · ${order.store} · ${order.source || '未标记渠道'}`,
      module,
      customer,
      order,
      stage,
      metricLabel: money(order.amount),
      ruleHint: `${order.payment} · ${order.status} · 下单 ${order.orderTime || order.orderDate || '未记录'}`,
      nextAction: stage === '待支付'
        ? '跟进支付状态或渠道同步结果，成功后仍回写统一订单。'
        : stage === '已退款'
          ? '核对退款、渠道对账和客户回访记录。'
          : '可用于客户消费记录、会员分层和门店业绩统计。',
      actionLabel: '打开订单',
      actionPath: `/order/appointment?keyword=${encodeURIComponent(order.id)}`,
      boundary: '消费记录只读取 yy_order 的支付和金额字段，不复制外部渠道或会员消费账本。',
      sourceLabel: 'yy_order',
    }
  })

export const buildDerivedMemberItems = (
  module: DerivedMemberModule,
  customers: CustomerInfo[],
  orders: BookingOrder[],
): DerivedMemberItem[] => {
  if (module.source === 'tags') return tagItems(module, customers)
  if (module.source === 'consumption') return consumptionItems(module, customers, orders)
  return accountItems(module, customers, orders)
}
