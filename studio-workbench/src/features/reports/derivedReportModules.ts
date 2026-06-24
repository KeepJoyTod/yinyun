import type { Album, BookingOrder, CustomerInfo, EmployeeInfo } from '../../shared/stores/appStore'

export type ReportSnapshotRow = {
  id?: string
  backendId?: string
  storeId?: string | null
  storeBackendId?: string
  reportDate: string
  reportType: string
  orderTotal: number
  arrivedTotal: number
  completedTotal: number
  revenueTotal: number
  selectionTotal: number
  sourceSummary: string
  remark: string
}

export type DerivedReportFeatureKey =
  | 'report-store-daily'
  | 'report-store-monthly'
  | 'report-products'
  | 'report-employees'
  | 'report-retouch'
  | 'report-finance'
  | 'report-customers'
  | 'report-reviews'
  | 'report-channels'
  | 'report-conversion'

export type DerivedReportStage = '正常' | '待关注' | '无数据'

export type DerivedReportModule = {
  key: DerivedReportFeatureKey
  title: string
  eyebrow: string
  description: string
  emptyTitle: string
  emptyHint: string
  source: 'store-daily' | 'store-monthly' | 'products' | 'employees' | 'retouch' | 'finance' | 'customers' | 'reviews' | 'channels' | 'conversion'
}

export type DerivedReportData = {
  orders: BookingOrder[]
  customers: CustomerInfo[]
  employees: EmployeeInfo[]
  albums: Album[]
}

export type DerivedReportItem = {
  id: string
  title: string
  subtitle: string
  module: DerivedReportModule
  stage: DerivedReportStage
  metricLabel: string
  secondaryLabel: string
  ruleHint: string
  nextAction: string
  actionLabel: string
  actionPath: string
  boundary: string
  sourceLabel: string
}

const moduleConfigs: DerivedReportModule[] = [
  report('report-store-daily', '门店业绩日报', 'Store Daily Report', '按最近营业日聚合门店订单、已支付收入和待处理订单。', '当前没有门店日报数据', '订单进入 yy_order 后，会按最近营业日生成门店日报。', 'store-daily'),
  report('report-store-monthly', '门店业绩月报', 'Store Monthly Report', '按最近订单月份聚合门店订单量、收入和未完成订单。', '当前没有门店月报数据', '有订单月份后，会按门店生成月度经营汇总。', 'store-monthly'),
  report('report-products', '服务产品统计', 'Product Report', '按订单中的服务快照聚合产品订单量、收入和支付转化。', '当前没有产品统计数据', '产品订单进入 yy_order 后，会按服务名称聚合。', 'products'),
  report('report-employees', '员工业绩统计', 'Employee Report', '从员工档案与摄影师相册归属派生服务工作量，不伪造销售归属。', '当前没有员工统计数据', '员工和相册数据同步后，会展示负责相册和底片工作量。', 'employees'),
  report('report-retouch', '修图量统计', 'Retouch Report', '按客户相册展示底片数量、已选数量和当前交付状态。', '当前没有修图统计数据', '门店上传客片后，会按相册形成修图工作量视图。', 'retouch'),
  report('report-finance', '收支统计', 'Finance Report', '从统一订单金额与支付状态派生门店收入、待收和退款概况。', '当前没有收支统计数据', '订单支付或退款同步后，会按门店聚合收支。', 'finance'),
  report('report-customers', '客户分析', 'Customer Analysis', '按客户来源聚合人数、累计消费和会员结构。', '当前没有客户分析数据', '客户档案进入 yy_customer 后，会按来源生成客户分析。', 'customers'),
  report('report-reviews', '客户评价', 'Customer Reviews', '预留客户评价与渠道评分入口；没有正式评价表或渠道评价 API 时保持真实空态，不伪造评分。', '评价接口未接入', '当前还没有正式评价表或渠道评价 API，不能伪造评分、好评率或客户评价。接入 yy_customer_review 或渠道评价同步接口后再展示真实评价。', 'reviews'),
  report('report-channels', '渠道收入统计', 'Channel Revenue', '按订单来源比较订单量、已支付收入和待转化金额。', '当前没有渠道收入数据', '渠道订单同步到 yy_order 后，会按来源聚合。', 'channels'),
  report('report-conversion', '订单转化分析', 'Order Conversion', '从下单、支付、确认服务和进入选片四个节点派生转化漏斗。', '当前没有转化数据', '订单、支付和相册数据同步后，会形成转化节点。', 'conversion'),
]

function report(
  key: DerivedReportFeatureKey,
  title: string,
  eyebrow: string,
  description: string,
  emptyTitle: string,
  emptyHint: string,
  source: DerivedReportModule['source'],
): DerivedReportModule {
  return { key, title, eyebrow, description, emptyTitle, emptyHint, source }
}

export const derivedReportModules = moduleConfigs

export const getDerivedReportModule = (key: string | undefined): DerivedReportModule =>
  moduleConfigs.find(module => module.key === key) ?? moduleConfigs[0]

const money = (value: number) => `¥${value.toLocaleString('zh-CN')}`
const isPaid = (order: BookingOrder) => order.payment === '已支付' || order.payment === '部分支付'

const groupBy = <T>(items: T[], getKey: (item: T) => string) => {
  const buckets = new Map<string, T[]>()
  for (const item of items) {
    const key = getKey(item) || '未标记'
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(item)
  }
  return buckets
}

const orderAggregateItems = (
  module: DerivedReportModule,
  orders: BookingOrder[],
  getKey: (order: BookingOrder) => string,
  title: (key: string) => string,
  actionPath: string,
): DerivedReportItem[] =>
  Array.from(groupBy(orders, getKey).entries()).map(([key, grouped]) => {
    const total = grouped.reduce((sum, order) => sum + order.amount, 0)
    const paid = grouped.filter(isPaid).reduce((sum, order) => sum + order.amount, 0)
    const pending = grouped.filter(order => !isPaid(order) || order.status === '待确认').length
    return {
      id: `${module.key}:${key}`,
      title: title(key),
      subtitle: `${grouped.length} 单 · 已支付 ${grouped.filter(isPaid).length} 单 · 待关注 ${pending} 单`,
      module,
      stage: pending ? '待关注' : '正常',
      metricLabel: `${grouped.length} 单 / ${money(total)}`,
      secondaryLabel: `已支付 ${money(paid)}`,
      ruleHint: `订单总额 ${money(total)}，已支付 ${money(paid)}，待支付或待确认 ${pending} 单`,
      nextAction: pending ? '进入统一订单处理待支付和待确认记录。' : '当前聚合范围状态正常，可继续复盘收入与转化。',
      actionLabel: '查看统一订单',
      actionPath,
      boundary: '优先读取 yy_report_snapshot；无快照时实时读取 yy_order 聚合，不写第二套财务账本。',
      sourceLabel: key,
    }
  })

const latestDate = (orders: BookingOrder[]) =>
  orders.map(order => order.orderDate).filter(Boolean).sort().at(-1) ?? ''

const storeDailyItems = (module: DerivedReportModule, orders: BookingOrder[]) => {
  const date = latestDate(orders)
  return orderAggregateItems(module, orders.filter(order => order.orderDate === date), order => order.store, store => store, `/order/appointment?date=${date}`)
    .map(item => ({ ...item, subtitle: `${date || '未记录日期'} · ${item.subtitle}` }))
}

const storeMonthlyItems = (module: DerivedReportModule, orders: BookingOrder[]) => {
  const month = latestDate(orders).slice(0, 7)
  return orderAggregateItems(module, orders.filter(order => order.orderDate.startsWith(month)), order => order.store, store => store, '/order/appointment')
    .map(item => ({ ...item, subtitle: `${month || '未记录月份'} · ${item.subtitle}` }))
}

const productItems = (module: DerivedReportModule, orders: BookingOrder[]) =>
  orderAggregateItems(module, orders, order => order.service || '未命名服务', service => service, '/product/service')

const channelItems = (module: DerivedReportModule, orders: BookingOrder[]) =>
  orderAggregateItems(module, orders, order => order.source || '未标记来源', source => source, '/order/campaign')

const financeItems = (module: DerivedReportModule, orders: BookingOrder[]) =>
  Array.from(groupBy(orders, order => order.store).entries()).map(([store, grouped]) => {
    const paid = grouped.filter(isPaid).reduce((sum, order) => sum + order.amount, 0)
    const pending = grouped.filter(order => order.payment === '待支付').reduce((sum, order) => sum + order.amount, 0)
    const refunded = grouped.filter(order => order.payment === '已退款').reduce((sum, order) => sum + order.amount, 0)
    return {
      id: `${module.key}:${store}`,
      title: `${store}收支`,
      subtitle: `${grouped.length} 单 · 待收 ${money(pending)} · 退款 ${money(refunded)}`,
      module,
      stage: pending || refunded ? '待关注' as const : '正常' as const,
      metricLabel: `收入 ${money(paid)}`,
      secondaryLabel: `待收 ${money(pending)} / 退款 ${money(refunded)}`,
      ruleHint: '收入按已支付和部分支付订单汇总；待收与退款按订单支付状态实时计算。',
      nextAction: pending || refunded ? '打开统一订单核对待支付、退款和渠道对账。' : '当前门店收支状态正常。',
      actionLabel: '查看统一订单',
      actionPath: `/order/appointment?store=${encodeURIComponent(store)}`,
      boundary: '收支统计只读取 yy_order 金额和支付状态，不替代正式支付流水与会计账簿。',
      sourceLabel: store,
    }
  })

const employeeItems = (module: DerivedReportModule, employees: EmployeeInfo[], albums: Album[]): DerivedReportItem[] =>
  employees.map(employee => {
    const ownedAlbums = albums.filter(album => album.photographer === employee.name)
    const photoCount = ownedAlbums.reduce((sum, album) => sum + album.totalCount, 0)
    return {
      id: `${module.key}:${employee.backendId}`,
      title: employee.name,
      subtitle: `${employee.storeName} · ${employee.roleType} · ${employee.employeeNo}`,
      module,
      stage: employee.status === 'ACTIVE' ? '正常' : '待关注',
      metricLabel: `${ownedAlbums.length} 个相册`,
      secondaryLabel: `${photoCount} 张底片`,
      ruleHint: `技能 ${employee.skillTags.join(' / ') || '未配置'} · 当前只统计摄影师相册归属`,
      nextAction: '如需销售额、工单耗时和提成绩效，需要订单员工归属与工单事件字段。',
      actionLabel: '查看员工',
      actionPath: `/settings/employees?q=${encodeURIComponent(employee.name)}`,
      boundary: '员工业绩仅从 yy_employee 与相册摄影师归属派生，不伪造销售、提成或工单绩效。',
      sourceLabel: employee.storeName,
    }
  })

const retouchItems = (module: DerivedReportModule, albums: Album[]): DerivedReportItem[] =>
  albums.map(album => ({
    id: `${module.key}:${album.id}`,
    title: `${album.customer} · ${album.service}`,
    subtitle: `${album.id} · ${album.photographer || '未指定摄影师'} · ${album.date}`,
    module,
    stage: album.status === '已交付' ? '正常' : '待关注',
    metricLabel: `${album.totalCount} 张底片`,
    secondaryLabel: `已选 ${album.selectedCount} 张`,
    ruleHint: `${album.status} · 选片进度 ${album.selectedCount}/${album.totalCount}`,
    nextAction: album.status === '已交付' ? '相册已交付，可用于历史工作量复盘。' : '进入客片或在线选片页面继续处理。',
    actionLabel: '查看客片',
    actionPath: `/service/photos?album=${encodeURIComponent(album.id)}`,
    boundary: '修图量统计只读取 yy_photo_album 与 yy_photo_asset，不写第二套修图计件账本。',
    sourceLabel: album.photographer || '未指定摄影师',
  }))

const customerItems = (module: DerivedReportModule, customers: CustomerInfo[]): DerivedReportItem[] =>
  Array.from(groupBy(customers, customer => customer.source || '未标记来源').entries()).map(([source, grouped]) => {
    const spend = grouped.reduce((sum, customer) => sum + customer.totalSpend, 0)
    const premium = grouped.filter(customer => customer.totalSpend >= 1000 || customer.memberLevel.includes('金')).length
    return {
      id: `${module.key}:${source}`,
      title: `${source}客户`,
      subtitle: `${grouped.length} 人 · 高价值 ${premium} 人`,
      module,
      stage: grouped.length ? '正常' : '无数据',
      metricLabel: `${grouped.length} 人`,
      secondaryLabel: `累计消费 ${money(spend)}`,
      ruleHint: `平均消费 ${money(grouped.length ? Math.round(spend / grouped.length) : 0)} · 高价值客户 ${premium} 人`,
      nextAction: '打开客户档案查看标签、最近订单和回访备注。',
      actionLabel: '查看客户档案',
      actionPath: `/member/customers?source=${encodeURIComponent(source)}`,
      boundary: '客户分析只读取 yy_customer 聚合，不写第二套客户画像或会员账本。',
      sourceLabel: source,
    }
  })

const conversionItems = (module: DerivedReportModule, data: DerivedReportData): DerivedReportItem[] => {
  if (!data.orders.length) return []
  const paid = data.orders.filter(isPaid).length
  const confirmed = data.orders.filter(order => order.status !== '待确认').length
  const albumOrderIds = new Set(data.albums.map(album => album.orderId))
  const selection = data.orders.filter(order => order.status === '选片中' || albumOrderIds.has(order.id)).length
  const stages = [
    { key: 'ordered', title: '已下单', count: data.orders.length, hint: '进入统一订单的全部记录。' },
    { key: 'paid', title: '已支付', count: paid, hint: '支付状态为已支付或部分支付。' },
    { key: 'confirmed', title: '已确认服务', count: confirmed, hint: '已离开待确认状态的订单。' },
    { key: 'selection', title: '已进入选片', count: selection, hint: '订单已选片中或已经建立客户相册。' },
  ]
  return stages.map((stage, index) => {
    const previous = index === 0 ? data.orders.length : stages[index - 1].count
    const rate = previous ? Math.round((stage.count / previous) * 100) : 0
    return {
      id: `${module.key}:${stage.key}`,
      title: stage.title,
      subtitle: stage.hint,
      module,
      stage: rate < 60 && index > 0 ? '待关注' : '正常',
      metricLabel: `${stage.count} 单`,
      secondaryLabel: index === 0 ? '漏斗起点' : `环节转化 ${rate}%`,
      ruleHint: index === 0 ? '统一订单总量作为转化漏斗起点。' : `相较上一节点保留 ${rate}% 的订单。`,
      nextAction: rate < 60 && index > 0 ? '检查待支付、待确认或未建相册订单。' : '当前节点转化处于可接受范围。',
      actionLabel: '查看统一订单',
      actionPath: '/order/appointment',
      boundary: '转化分析实时读取 yy_order 与 yy_photo_album，不写第二套漏斗快照。',
      sourceLabel: '统一订单',
    }
  })
}

export const buildDerivedReportItems = (
  module: DerivedReportModule,
  data: DerivedReportData,
): DerivedReportItem[] => {
  if (module.source === 'store-daily') return storeDailyItems(module, data.orders)
  if (module.source === 'store-monthly') return storeMonthlyItems(module, data.orders)
  if (module.source === 'products') return productItems(module, data.orders)
  if (module.source === 'employees') return employeeItems(module, data.employees, data.albums)
  if (module.source === 'retouch') return retouchItems(module, data.albums)
  if (module.source === 'finance') return financeItems(module, data.orders)
  if (module.source === 'customers') return customerItems(module, data.customers)
  if (module.source === 'reviews') return []
  if (module.source === 'channels') return channelItems(module, data.orders)
  return conversionItems(module, data)
}

export type SnapshotAwareReportInput = {
  orders: BookingOrder[]
  customers: CustomerInfo[]
  employees: EmployeeInfo[]
  albums: Album[]
  snapshots: ReportSnapshotRow[]
}

export const buildSnapshotAwareReportItems = (
  module: DerivedReportModule,
  data: SnapshotAwareReportInput,
): DerivedReportItem[] => {
  const snapshots = data.snapshots.filter(s => s.reportType === module.source)
  if (snapshots.length > 0) {
    return snapshots.map(snapshot => {
      const snapshotId = snapshot.id ?? snapshot.backendId ?? `${snapshot.reportType}:${snapshot.reportDate}`
      const storeId = snapshot.storeId ?? snapshot.storeBackendId ?? null
      return {
        id: `snapshot:${snapshotId}`,
        title: `${snapshot.reportType} · ${snapshot.reportDate || '未定日期'}`,
        subtitle: snapshot.remark || `订单 ${snapshot.orderTotal} · 到店 ${snapshot.arrivedTotal} · 完成 ${snapshot.completedTotal}`,
        module,
        stage: snapshot.orderTotal > 0 ? '正常' : '无数据',
        metricLabel: `收入 ${snapshot.revenueTotal ? `¥${snapshot.revenueTotal.toLocaleString('zh-CN')}` : '—'}`,
        secondaryLabel: `选片 ${snapshot.selectionTotal ? `¥${snapshot.selectionTotal.toLocaleString('zh-CN')}` : '—'}`,
        ruleHint: `快照来源：yy_report_snapshot，类型 ${snapshot.reportType}，门店 ${storeId || '全局'}`,
        nextAction: '快照数据来自后端定时任务，如需重新计算可触发后端快照生成。',
        actionLabel: '查看详情',
        actionPath: `/report/${module.source}`,
        boundary: '报表快照优先读取 yy_report_snapshot，无快照时回退到实时派生并标注来源。',
        sourceLabel: snapshot.reportType,
      }
    })
  }
  return buildDerivedReportItems(module, {
    orders: data.orders,
    customers: data.customers,
    employees: data.employees,
    albums: data.albums,
  })
}
