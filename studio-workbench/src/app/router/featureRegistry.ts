export type WorkbenchFeatureStatus = 'ready' | 'building'
export type WorkbenchFeatureRuntimeStatus = WorkbenchFeatureStatus | 'hidden'

export type WorkbenchPendingCounts = {
  pendingOrders: number
  todayArrivals: number
  inventoryConflicts: number
  activeSelections: number
}

export type WorkbenchFeature = {
  key: string
  group: string
  label: string
  path: string
  icon: string
  component: string
  status: WorkbenchFeatureStatus
  description: string
  badge?: string
  permission?: string
  hidden?: boolean
}

export type WorkbenchGroup = {
  key: string
  label: string
}

export const workbenchGroups: WorkbenchGroup[] = [
  { key: 'home', label: '首页' },
  { key: 'merchant', label: '商户' },
  { key: 'product', label: '商品' },
  { key: 'order', label: '订单' },
  { key: 'service', label: '服务' },
  { key: 'collaboration', label: '内部协作' },
  { key: 'resource', label: '资源' },
  { key: 'member', label: '会员' },
  { key: 'tool', label: '工具' },
  { key: 'marketing', label: '营销' },
  { key: 'report', label: '统计' },
  { key: 'settings', label: '设置' },
]

const featurePermissions: Record<string, string> = {
  'dashboard-overview': 'yy:dashboard:list',
  'dashboard-today': 'yy:dashboard:list',
  'dashboard-tasks': 'yy:dashboard:list',
  'merchant-overview': 'yy:store:list',
  'merchant-store': 'yy:store:list',
  'merchant-service-groups': 'yy:bookingConfig:list',
  'merchant-inventory': 'yy:bookingInventory:list',
  'merchant-decoration': 'yy:store:list',
  'merchant-micro-pages': 'yy:store:list',
  'merchant-micro-forms': 'yy:store:list',
  'product-service': 'yy:product:list',
  'product-addon': 'yy:product:list',
  'product-group': 'yy:product:list',
  'product-print': 'yy:product:list',
  'product-douyin': 'yy:channel:list',
  'product-meituan': 'yy:channel:list',
  'product-card-management': 'yy:product:list',
  'product-card-catalog': 'yy:product:list',
  'order-appointment': 'yy:order:list',
  'order-staff-booking': 'yy:order:add',
  'order-print': 'yy:order:list',
  'order-enterprise': 'yy:order:list',
  'order-card': 'yy:order:list',
  'order-coupon': 'yy:order:list',
  'order-verification': 'yy:channel:list',
  'order-campaign': 'yy:order:list',
  'order-forms': 'yy:order:list',
  'collaboration-overview': 'yy:order:list',
  'collaboration-work-orders': 'yy:order:list',
  'collaboration-export': 'yy:order:list',
  'collaboration-statistics': 'yy:order:list',
  'resource-files': 'yy:photoAlbum:list',
  'resource-samples': 'yy:photoAlbum:list',
  'service-selection': 'yy:photoAlbum:list',
  'service-photos': 'yy:photoAlbum:list',
  'member-customers': 'yy:customer:list',
  'member-accounts': 'yy:customer:list',
  'member-tags': 'yy:customer:list',
  'member-consumption': 'yy:customer:list',
  'tool-booking-entry': 'yy:store:list',
  'tool-pickup-entry': 'yy:store:list',
  'tool-share-links': 'yy:store:list',
  'tool-notifications': 'yy:notification:list',
  'marketing-center': 'yy:order:list',
  'marketing-coupons': 'yy:order:list',
  'marketing-campaigns': 'yy:order:list',
  'marketing-participations': 'yy:order:list',
  'report-store-daily': 'yy:order:list',
  'report-store-monthly': 'yy:order:list',
  'report-products': 'yy:order:list',
  'report-employees': 'yy:employee:list',
  'report-retouch': 'yy:photoAlbum:list',
  'report-finance': 'yy:order:list',
  'report-customers': 'yy:customer:list',
  'report-reviews': 'yy:customer:list',
  'report-channels': 'yy:order:list',
  'report-conversion': 'yy:order:list',
  'settings-employees': 'yy:employee:list',
  'settings-roles': 'yy:dashboard:list',
  'settings-logs': 'yy:channel:list',
  'settings-channels': 'yy:channel:list',
  'settings-workbench': 'yy:dashboard:list',
}

export const workbenchFeatures: WorkbenchFeature[] = [
  feature('dashboard-overview', 'home', '经营概况', '/', 'overview', 'dashboard', 'ready', '门店收入、订单、预约、客片和待办总览'),
  feature('dashboard-today', 'home', '今日预约', '/dashboard/today', 'calendar-new', 'schedule', 'ready', '查看今日各门店和工位的预约承接情况'),
  feature('dashboard-tasks', 'home', '待处理事项', '/dashboard/tasks', 'orders', 'orders', 'ready', '聚合今日待确认、待拍摄、待上传和待交付事项', '今日'),

  feature('merchant-overview', 'merchant', '模块总览', '/merchant/overview', 'overview', 'merchant-overview', 'ready', '汇总门店、订单、排期库存和抖音来客映射状态'),
  feature('merchant-store', 'merchant', '门店管理', '/merchant/store', 'store', 'store', 'ready', '维护门店资料并查看门店运营状态'),
  feature('merchant-service-groups', 'merchant', '服务组管理', '/merchant/service-groups', 'config', 'service-groups', 'ready', '配置服务组、服务时长和承接容量'),
  feature('merchant-inventory', 'merchant', '时段库存', '/merchant/inventory', 'calendar', 'inventory', 'ready', '查看全渠道预约时段库存和冲突记录'),
  feature('merchant-decoration', 'merchant', '门店装修', '/merchant/decoration', 'config', 'decoration', 'ready', '配置小程序首页、轮播图和菜单入口'),
  feature('merchant-micro-pages', 'merchant', '微页面管理', '/merchant/micro-pages', 'document', 'micro-pages', 'ready', '创建和编辑微页面内容块与模板'),
  feature('merchant-micro-forms', 'merchant', '微表单管理', '/merchant/micro-forms', 'form', 'micro-forms', 'ready', '创建和发布自定义表单，管理提交记录'),

  feature('product-service', 'product', '服务产品', '/product/service', 'config', 'products', 'ready', '维护可预约套餐、选片规则和上下架状态'),
  feature('product-addon', 'product', '附加产品', '/product/addon', 'plus', 'derived-product-module', 'ready', '维护加片、加急、造型等附加产品'),
  feature('product-group', 'product', '团单产品', '/product/group', 'orders', 'derived-product-module', 'ready', '维护企业和多人团体服务产品'),
  feature('product-print', 'product', '冲印产品', '/product/print', 'photo-mgmt', 'derived-product-module', 'ready', '维护相纸、尺寸和冲印交付产品'),
  feature('product-douyin', 'product', '抖音产品', '/product/douyin', 'online-selection', 'douyin-products', 'ready', '查看抖音来客商品映射和授权状态', '渠道'),
  feature('product-meituan', 'product', '美团产品', '/product/meituan', 'online-selection', 'derived-product-module', 'ready', '查看美团商品映射和核销能力', '渠道'),
  feature('product-card-management', 'product', '商品卡管理', '/product/card-management', 'config', 'product-cards', 'ready', '配置计次卡、储值卡和权益卡的商品属性'),
  feature('product-card-catalog', 'product', '商品卡目录', '/product/card-catalog', 'orders', 'product-card-catalog', 'ready', '查看商品卡销售汇总和渠道分布'),

  feature('order-appointment', 'order', '预约订单', '/order/appointment', 'orders', 'orders', 'ready', '处理微信、抖音、H5 和本地统一预约订单', '今日'),
  feature('order-staff-booking', 'order', '录入预约', '/order/staff-booking', 'plus', 'staff-booking-entry', 'ready', '店员手动录入电话、微信和现场预约，写入统一订单账本', '录入'),
  feature('order-print', 'order', '冲印订单', '/order/print', 'photo-mgmt', 'derived-order-module', 'ready', '处理冲印商品生产和交付订单'),
  feature('order-enterprise', 'order', '企业团单', '/order/enterprise', 'orders', 'derived-order-module', 'ready', '处理企业客户和多人团单'),
  feature('order-card', 'order', '售卡订单', '/order/card', 'orders', 'derived-order-module', 'ready', '查询会员卡项售卖订单'),
  feature('order-coupon', 'order', '售券订单', '/order/coupon', 'orders', 'derived-order-module', 'ready', '查询优惠券和兑换券发放记录'),
  feature('order-verification', 'order', '渠道核销', '/order/verification', 'filter', 'channel-verification', 'ready', '统一查看抖音、美团等渠道核销验收与同步状态'),
  feature('order-campaign', 'order', '活动订单', '/order/campaign', 'orders', 'campaign-orders', 'ready', '查询营销活动产生的订单'),
  feature('order-forms', 'order', '表单管理', '/order/forms', 'config', 'order-form-submissions', 'ready', '查看客户表单提交和跟进状态'),

  feature('service-selection', 'service', '在线选片', '/service/selection', 'online-selection', 'selection', 'ready', '查看客户选片链接、进度和访问情况'),
  feature('service-photos', 'service', '客片管理', '/service/photos', 'photo-mgmt', 'albums', 'ready', '上传、整理和交付客户照片'),

  feature('collaboration-overview', 'collaboration', '工作执行概况', '/collaboration/overview', 'overview', 'work-execution-overview', 'ready', '查看拍摄、上传、选片和交付执行情况'),
  feature('collaboration-work-orders', 'collaboration', '工单管理', '/collaboration/work-orders', 'orders', 'work-orders', 'ready', '分配并流转影像制作工单'),
  feature('collaboration-export', 'collaboration', '工单数据导出', '/collaboration/export', 'export', 'work-order-export', 'ready', '按门店、员工和环节导出工单'),
  feature('collaboration-statistics', 'collaboration', '环节统计', '/collaboration/statistics', 'trend-up', 'work-order-statistics', 'ready', '统计各制作环节数量、耗时和超时率'),

  feature('resource-files', 'resource', '文件资源', '/resource/files', 'photo-mgmt', 'derived-resource-module', 'ready', '统一查看私有 OSS 文件与业务归属'),
  feature('resource-samples', 'resource', '样片作品', '/resource/samples', 'album-icon', 'derived-resource-module', 'ready', '维护客户可见的作品分类和样片'),

  feature('member-customers', 'member', '客户档案', '/member/customers', 'overview', 'customers', 'ready', '查看客户资料、来源、消费、订单和相册'),
  feature('member-accounts', 'member', '会员账户', '/member/accounts', 'overview', 'derived-member-module', 'ready', '维护等级、积分、余额和会员卡项'),
  feature('member-tags', 'member', '客户标签', '/member/tags', 'filter', 'derived-member-module', 'ready', '维护客户分群和运营标签'),
  feature('member-consumption', 'member', '消费记录', '/member/consumption', 'orders', 'derived-member-module', 'ready', '查看客户订单、支付、退款和权益消费'),

  feature('tool-booking-entry', 'tool', '客户预约入口', '/tools/booking-entry', 'calendar-new', 'share-links', 'ready', '管理客户小程序和 H5 预约入口'),
  feature('tool-pickup-entry', 'tool', '取片入口', '/tools/pickup-entry', 'online-selection', 'share-links', 'ready', '管理客户取片入口和验证方式'),
  feature('tool-share-links', 'tool', '二维码与分享链接', '/tools/share-links', 'enter', 'share-links', 'ready', '生成预约、查单、取片和作品二维码'),
  feature('tool-notifications', 'tool', '通知模板', '/tools/notifications', 'notification', 'notifications', 'ready', '维护短信、微信和平台消息模板'),

  feature('marketing-center', 'marketing', '营销中心', '/marketing/center', 'trend-up', 'derived-marketing-module', 'ready', '查看营销能力和活动效果'),
  feature('marketing-coupons', 'marketing', '优惠券', '/marketing/coupons', 'orders', 'derived-marketing-module', 'ready', '维护券模板、发放、领取和核销'),
  feature('marketing-campaigns', 'marketing', '活动清单', '/marketing/campaigns', 'calendar', 'derived-marketing-module', 'ready', '维护营销活动、时间和参与条件'),
  feature('marketing-participations', 'marketing', '活动参与记录', '/marketing/participations', 'overview', 'derived-marketing-module', 'ready', '查询客户参与、转化和跟进记录'),

  feature('report-store-daily', 'report', '门店业绩日报', '/report/store-daily', 'trend-up', 'derived-report-module', 'ready', '查看门店每日订单、到店和收入'),
  feature('report-store-monthly', 'report', '门店业绩月报', '/report/store-monthly', 'trend-up', 'derived-report-module', 'ready', '查看门店月度经营趋势'),
  feature('report-products', 'report', '服务产品统计', '/report/products', 'trend-up', 'derived-report-module', 'ready', '统计产品预约量、收入和转化'),
  feature('report-employees', 'report', '员工业绩统计', '/report/employees', 'overview', 'derived-report-module', 'ready', '统计员工销售、服务和制作绩效'),
  feature('report-retouch', 'report', '修图量统计', '/report/retouch', 'photo-mgmt', 'derived-report-module', 'ready', '统计修图数量、耗时和超期情况'),
  feature('report-finance', 'report', '收支统计', '/report/finance', 'trend-up', 'derived-report-module', 'ready', '统计订单收入、退款和渠道金额'),
  feature('report-customers', 'report', '客户分析', '/report/customers', 'overview', 'derived-report-module', 'ready', '分析客户来源、复购和消费分层'),
  feature('report-reviews', 'report', '客户评价', '/report/reviews', 'overview', 'derived-report-module', 'ready', '查看各渠道客户评价和评分'),
  feature('report-channels', 'report', '渠道收入统计', '/report/channels', 'trend-up', 'derived-report-module', 'ready', '比较微信、抖音、H5 和门店收入'),
  feature('report-conversion', 'report', '订单转化分析', '/report/conversion', 'trend-up', 'derived-report-module', 'ready', '分析浏览、下单、支付、到店和交付转化'),

  feature('settings-employees', 'settings', '员工管理', '/settings/employees', 'overview', 'employees', 'ready', '维护员工、岗位、技能和门店归属'),
  feature('settings-roles', 'settings', '角色与权限', '/settings/roles', 'settings', 'roles', 'ready', '配置管理员、主管和岗位权限'),
  feature('settings-logs', 'settings', '系统日志', '/settings/logs', 'orders', 'logs', 'ready', '查看操作、订单、渠道和异常日志'),
  feature('settings-channels', 'settings', '渠道配置', '/settings/channels', 'config', 'channels', 'ready', '配置微信、抖音、美团和回调能力'),
  feature('settings-workbench', 'settings', '工作台设置', '/settings/workbench', 'settings', 'settings', 'ready', '查看工作台运行模式、安全边界和客户入口隔离'),
]

function feature(
  key: string,
  group: string,
  label: string,
  path: string,
  icon: string,
  component: string,
  status: WorkbenchFeatureStatus,
  description: string,
  badge?: string,
): WorkbenchFeature {
  return {
    key,
    group,
    label,
    path,
    icon,
    component,
    status,
    description,
    badge,
    permission: featurePermissions[key],
  }
}

export const getWorkbenchFeature = (key: string) => workbenchFeatures.find(feature => feature.key === key)

export const getWorkbenchGroupLabel = (key: string) => workbenchGroups.find(group => group.key === key)?.label ?? '影约云'

const pendingFeatureKeys: Record<keyof WorkbenchPendingCounts, string[]> = {
  pendingOrders: ['order-appointment'],
  todayArrivals: ['dashboard-today'],
  inventoryConflicts: ['merchant-inventory'],
  activeSelections: ['service-selection'],
}

export const canAccessWorkbenchFeature = (
  feature: Pick<WorkbenchFeature, 'permission' | 'hidden'> | undefined,
  permissions: string[],
) => {
  if (!feature || feature.hidden) return false
  if (!feature.permission) return true
  return permissions.includes('*:*:*') || permissions.includes(feature.permission)
}

export const getEffectiveFeatureStatus = (
  feature: WorkbenchFeature | undefined,
  featureStatuses: Record<string, WorkbenchFeatureRuntimeStatus>,
): WorkbenchFeatureRuntimeStatus => {
  if (!feature || feature.hidden) return 'hidden'
  const remoteStatus = featureStatuses[feature.key]
  if (remoteStatus === 'hidden') return 'hidden'
  if (feature.status === 'building' || remoteStatus === 'building') return 'building'
  return 'ready'
}

export const getFeaturePendingCount = (featureKey: string, pending: WorkbenchPendingCounts) => {
  for (const [pendingKey, featureKeys] of Object.entries(pendingFeatureKeys)) {
    if (featureKeys.includes(featureKey)) return pending[pendingKey as keyof WorkbenchPendingCounts] ?? 0
  }
  return 0
}
