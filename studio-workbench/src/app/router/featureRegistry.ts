export type WorkbenchFeatureStatus = 'ready' | 'derived' | 'partial' | 'planned' | 'building'
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

export const workbenchStatusMeta: Record<WorkbenchFeatureStatus, { label: string; navLabel?: string }> = {
  ready: { label: '已开放' },
  derived: { label: '派生只读', navLabel: '派生' },
  partial: { label: '部分闭环', navLabel: '部分' },
  planned: { label: '未开通', navLabel: '规划' },
  building: { label: '建设中', navLabel: '建设中' },
}

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
  'product-album': 'yy:product:list',
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
  'collaboration-positions': 'yy:employee:list',
  'collaboration-product-settings': 'yy:product:list',
  'collaboration-retouch-center-settings': 'yy:bookingConfig:list',
  'collaboration-common-settings': 'yy:bookingConfig:list',
  'collaboration-open-settings': 'yy:bookingConfig:list',
  'resource-manage': 'yy:photoAsset:list',
  'resource-tags': 'yy:photoAsset:list',
  'resource-usage': 'yy:photoAsset:list',
  'service-selection': 'yy:photoAlbum:list',
  'service-photos': 'yy:photoAlbum:list',
  'service-retouch-center': 'yy:photoAlbum:list',
  'service-retouch-providers': 'yy:employee:list',
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

  feature('merchant-overview', 'merchant', '模块总览', '/merchant/overview', 'overview', 'merchant-overview', 'ready', '汇总门店、订单、排期库存和渠道映射状态'),
  feature('merchant-store', 'merchant', '门店管理', '/merchant/store', 'store', 'store', 'ready', '维护门店资料并查看门店运营状态'),
  feature('merchant-service-groups', 'merchant', '服务组管理', '/merchant/service-groups', 'config', 'service-groups', 'ready', '配置服务组、服务时长和承接容量'),
  feature('merchant-inventory', 'merchant', '时段库存', '/merchant/inventory', 'calendar', 'inventory', 'ready', '查看全渠道预约时段库存和冲突记录'),
  feature('merchant-decoration', 'merchant', '门店装修', '/merchant/decoration', 'config', 'decoration', 'ready', '配置小程序首页、轮播图和菜单入口'),
  feature('merchant-micro-pages', 'merchant', '微页面管理', '/merchant/micro-pages', 'document', 'micro-pages', 'ready', '创建和编辑微页面内容块与模板'),
  feature('merchant-micro-forms', 'merchant', '微表单管理', '/merchant/micro-forms', 'form', 'micro-forms', 'ready', '创建、发布和跟进微表单提交记录'),

  feature('product-service', 'product', '服务产品', '/product/service', 'config', 'products', 'ready', '维护可预约套餐、选片规则和上下架状态'),
  feature('product-addon', 'product', '附加产品', '/product/addon', 'plus', 'derived-product-module', 'derived', '从统一商品账本派生附加产品视图'),
  feature('product-group', 'product', '团单产品', '/product/group', 'orders', 'derived-product-module', 'derived', '从统一商品账本派生团单产品视图'),
  feature('product-print', 'product', '冲印产品', '/product/print', 'photo-mgmt', 'derived-product-module', 'derived', '从统一商品账本派生冲印产品视图'),
  feature('product-album', 'product', '入册产品', '/product/album', 'album-icon', 'product-card-catalog', 'ready', '维护入册分类、入册数量和上下架配置'),
  feature('product-douyin', 'product', '抖音产品', '/product/douyin', 'online-selection', 'douyin-products', 'ready', '查看抖音来客商品映射与授权状态', '渠道'),
  feature('product-meituan', 'product', '美团产品', '/product/meituan', 'online-selection', 'derived-product-module', 'derived', '查看美团商品映射与未授权边界', '渠道'),
  feature('product-card-management', 'product', '商品卡管理', '/product/card-management', 'config', 'product-cards', 'ready', '配置计次卡、储值卡和权益卡商品属性'),
  feature('product-card-catalog', 'product', '商品卡目录', '/product/card-catalog', 'orders', 'product-card-catalog', 'ready', '查看商品卡销售汇总和渠道分布'),

  feature('order-appointment', 'order', '预约订单', '/order/appointment', 'orders', 'orders', 'ready', '处理微信、抖音、H5 和本地统一预约订单', '今日'),
  feature('order-staff-booking', 'order', '录入预约', '/order/staff-booking', 'plus', 'staff-booking-entry', 'ready', '店员手动录入电话、微信和现场预约', '录入'),
  feature('order-print', 'order', '冲印订单', '/order/print', 'photo-mgmt', 'derived-order-module', 'derived', '从统一订单账本派生冲印订单视图'),
  feature('order-enterprise', 'order', '企业团单', '/order/enterprise', 'orders', 'derived-order-module', 'derived', '从统一订单账本派生企业团单视图'),
  feature('order-card', 'order', '售卡订单', '/order/card', 'orders', 'derived-order-module', 'derived', '从统一订单账本派生商品卡销售订单'),
  feature('order-coupon', 'order', '售券订单', '/order/coupon', 'orders', 'derived-order-module', 'derived', '从统一订单账本派生优惠券订单'),
  feature('order-verification', 'order', '渠道核销', '/order/verification', 'filter', 'channel-verification', 'partial', '统一查看渠道核销验收与同步状态'),
  feature('order-campaign', 'order', '活动订单', '/order/campaign', 'orders', 'campaign-orders', 'derived', '从统一订单来源归因活动订单'),
  feature('order-forms', 'order', '表单管理', '/order/forms', 'config', 'order-form-submissions', 'derived', '从微表单提交记录派生跟进视图'),

  feature('service-selection', 'service', '在线选片', '/service/selection', 'online-selection', 'selection', 'ready', '查看客户选片链接、进度和访问情况'),
  feature('service-photos', 'service', '客片管理', '/service/photos', 'photo-mgmt', 'albums', 'ready', '上传、整理和交付客户照片'),
  feature('service-retouch-center', 'service', '三方修图中心', '/service/retouch-center', 'photo-mgmt', 'service-retouch-center', 'ready', '查看修图任务队列、派单状态和审片进度'),
  feature('service-retouch-providers', 'service', '三方修图服务商', '/service/retouch-providers', 'employees', 'service-retouch-providers', 'ready', '维护修图服务商资料、门店范围和接单规则'),

  feature('collaboration-overview', 'collaboration', '工作执行概况', '/collaboration/overview', 'overview', 'work-execution-overview', 'ready', '真实工单执行队列与门店协作概览'),
  feature('collaboration-work-orders', 'collaboration', '工单管理', '/collaboration/work-orders', 'orders', 'work-orders', 'ready', '真实 yy_work_order 主链与状态流转'),
  feature('collaboration-export', 'collaboration', '工单数据导出', '/collaboration/export', 'export', 'work-order-export', 'ready', '从真实工单主链导出协作 CSV'),
  feature('collaboration-statistics', 'collaboration', '环节统计', '/collaboration/statistics', 'trend-up', 'work-order-statistics', 'ready', '按真实工单岗位统计阻塞、超时与进度'),
  feature('collaboration-positions', 'collaboration', '岗位设置', '/collaboration/positions', 'settings', 'collaboration-positions-settings', 'ready', '配置内部协作岗位、顺序和 SLA'),
  feature('collaboration-product-settings', 'collaboration', '产品设置', '/collaboration/product-settings', 'config', 'collaboration-product-settings', 'ready', '配置产品级协作流转和出片时限'),
  feature('collaboration-retouch-center-settings', 'collaboration', '中央修图设置', '/collaboration/retouch-center-settings', 'photo-mgmt', 'collaboration-retouch-settings', 'ready', '配置中央修图审片与转派规则'),
  feature('collaboration-common-settings', 'collaboration', '通用设置', '/collaboration/common-settings', 'settings', 'collaboration-common-settings', 'ready', '配置自动派单、自动完单和启用范围'),
  feature('collaboration-open-settings', 'collaboration', '开通设置', '/collaboration/open-settings', 'channels', 'collaboration-open-settings', 'ready', '配置协作许可证和门店绑定'),

  feature('resource-manage', 'resource', '资源管理', '/resource/manage', 'photo-mgmt', 'resource-manage', 'ready', '统一查看底片资源、标签和客户可见边界'),
  feature('resource-tags', 'resource', '资源标签', '/resource/tags', 'filter', 'resource-tags', 'ready', '维护资源标签字典和标签计数'),
  feature('resource-usage', 'resource', '资源用量', '/resource/usage', 'trend-up', 'resource-usage', 'ready', '查看资源容量占用、剩余额度和清理计划'),

  feature('member-customers', 'member', '客户档案', '/member/customers', 'overview', 'customers', 'ready', '查看客户资料、来源、消费、订单和相册'),
  feature('member-accounts', 'member', '会员账户', '/member/accounts', 'overview', 'member-assets', 'ready', '查看会员卡、权益、优惠券、积分和余额资产'),
  feature('member-tags', 'member', '客户标签', '/member/tags', 'filter', 'derived-member-module', 'derived', '从客户标签字段派生分群视图'),
  feature('member-consumption', 'member', '消费记录', '/member/consumption', 'orders', 'member-transactions', 'ready', '查看会员订单、积分、成长值和余额流水'),

  feature('tool-booking-entry', 'tool', '客户预约入口', '/tools/booking-entry', 'calendar-new', 'share-links', 'ready', '管理客户小程序和 H5 预约入口'),
  feature('tool-pickup-entry', 'tool', '取片入口', '/tools/pickup-entry', 'online-selection', 'share-links', 'ready', '管理客户取片入口和验证方式'),
  feature('tool-share-links', 'tool', '二维码与分享链接', '/tools/share-links', 'enter', 'share-links', 'ready', '生成预约、查单、取片和作品二维码'),
  feature('tool-notifications', 'tool', '通知模板', '/tools/notifications', 'notification', 'notifications', 'ready', '维护短信、微信和平台消息模板'),

  feature('marketing-center', 'marketing', '营销中心', '/marketing/center', 'trend-up', 'marketing-center-view', 'ready', '查看营销能力、渠道承接和活动订单联动'),
  feature('marketing-coupons', 'marketing', '优惠券', '/marketing/coupons', 'orders', 'marketing-coupons-view', 'ready', '维护券模板、发券记录、券实例和恢复策略脚手架'),
  feature('marketing-campaigns', 'marketing', '活动清单', '/marketing/campaigns', 'calendar', 'marketing-campaigns-view', 'ready', '维护活动清单、时间窗、商品绑定和活动订单桥接'),
  feature('marketing-participations', 'marketing', '活动参与记录', '/marketing/participations', 'overview', 'marketing-participations-view', 'ready', '查询客户参与、转化、退款和固定优先级试算'),

  feature('report-store-daily', 'report', '门店业绩日报', '/report/store-daily', 'trend-up', 'derived-report-module', 'derived', '从订单和快照聚合门店日报'),
  feature('report-store-monthly', 'report', '门店业绩月报', '/report/store-monthly', 'trend-up', 'derived-report-module', 'derived', '从订单和快照聚合门店月报'),
  feature('report-products', 'report', '服务产品统计', '/report/products', 'trend-up', 'derived-report-module', 'derived', '从订单聚合产品销量和收入'),
  feature('report-employees', 'report', '员工业绩统计', '/report/employees', 'overview', 'derived-report-module', 'derived', '从员工与相册派生服务工作量'),
  feature('report-retouch', 'report', '修图量统计', '/report/retouch', 'photo-mgmt', 'derived-report-module', 'derived', '从相册与底片派生修图工作量'),
  feature('report-finance', 'report', '收支统计', '/report/finance', 'trend-up', 'derived-report-module', 'derived', '从统一订单账本聚合收支概况'),
  feature('report-customers', 'report', '客户分析', '/report/customers', 'overview', 'derived-report-module', 'derived', '从客户档案聚合来源和消费层级'),
  feature('report-reviews', 'report', '客户评价', '/report/reviews', 'overview', 'derived-report-module', 'partial', '评价表与渠道评价 API 未接入时显示真实空态'),
  feature('report-channels', 'report', '渠道收入统计', '/report/channels', 'trend-up', 'derived-report-module', 'derived', '从订单来源聚合渠道收入'),
  feature('report-conversion', 'report', '订单转化分析', '/report/conversion', 'trend-up', 'derived-report-module', 'derived', '从订单和相册派生转化漏斗'),

  feature('settings-employees', 'settings', '员工管理', '/settings/employees', 'overview', 'employees', 'ready', '维护员工、岗位、技能和门店归属'),
  feature('settings-roles', 'settings', '角色与权限', '/settings/roles', 'settings', 'roles', 'partial', '展示权限矩阵，角色维护仍在 RuoYi 后台'),
  feature('settings-logs', 'settings', '系统日志', '/settings/logs', 'orders', 'logs', 'partial', '查看操作、订单、渠道和异常日志'),
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
  if (remoteStatus) return remoteStatus
  return feature.status
}

export const getFeaturePendingCount = (featureKey: string, pending: WorkbenchPendingCounts) => {
  for (const [pendingKey, featureKeys] of Object.entries(pendingFeatureKeys)) {
    if (featureKeys.includes(featureKey)) return pending[pendingKey as keyof WorkbenchPendingCounts] ?? 0
  }
  return 0
}
