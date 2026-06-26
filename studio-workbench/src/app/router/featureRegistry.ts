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
  { key: 'platform', label: '平台设置' },
  { key: 'account', label: '账号中心' },
  { key: 'finance', label: '费用中心' },
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
  'merchant-readiness': 'yy:store:list',
  'merchant-schedule-governance': 'yy:bookingInventory:list',
  'merchant-channel-readiness': 'yy:store:list',
  'merchant-governance': 'yy:store:list',
  'merchant-dependency-readiness': 'yy:store:list',
  'merchant-consumer-ops-p1': 'yy:store:list',
  'merchant-store': 'yy:store:list',
  'merchant-service-groups': 'yy:bookingConfig:list',
  'merchant-inventory': 'yy:bookingInventory:list',
  'merchant-decoration': 'yy:store:list',
  'merchant-micro-pages': 'yy:store:list',
  'merchant-micro-forms': 'yy:store:list',
  'product-service': 'yy:product:list',
  'product-catalog': 'yy:product:list',
  'product-sku': 'yy:product:list',
  'product-category': 'yy:product:list',
  'product-relation': 'yy:product:list',
  'product-booking-rules': 'yy:product:list',
  'product-channel': 'yy:channel:list',
  'product-cards': 'yy:product:list',
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
  'order-card-batch': 'yy:order:add',
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
  'member-transaction-safety': 'yy:customer:list',
  'member-tags': 'yy:customer:list',
  'member-consumption': 'yy:customer:list',
  'tool-booking-entry': 'yy:store:list',
  'tool-pickup-entry': 'yy:store:list',
  'tool-share-links': 'yy:store:list',
  'tool-notifications': 'yy:notification:list',
  'tool-sample-works': 'yy:photoAsset:list',
  'tool-precision-delivery': 'yy:notification:list',
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
  'report-order-analysis': 'yy:report:list',
  'settings-employees': 'yy:employee:list',
  'settings-roles': 'yy:dashboard:list',
  'settings-logs': 'yy:channel:list',
  'settings-channels': 'yy:channel:list',
  'settings-workbench': 'yy:dashboard:list',
  'platform-brand-info': 'yy:dashboard:list',
  'platform-integration': 'yy:channel:list',
  'platform-login-risk': 'yy:dashboard:list',
  'platform-open-api': 'yy:channel:list',
  'platform-task-center': 'yy:dashboard:list',
  'platform-booking-policy': 'yy:bookingConfig:list',
  'platform-print-settings': 'yy:bookingConfig:list',
  'platform-score-settings': 'yy:bookingConfig:list',
  'platform-meituan-review-trace': 'yy:channel:list',
  'platform-email-settings': 'yy:notification:list',
  'platform-notification-center': 'yy:notification:list',
  'platform-backup-recovery': 'yy:dashboard:list',
  'platform-service-packages': 'yy:dashboard:list',
  'account-profile': 'yy:dashboard:list',
  'account-brands': 'yy:dashboard:list',
  'account-help': 'yy:dashboard:list',
  'finance-overview': 'yy:dashboard:list',
  'finance-transactions': 'yy:dashboard:list',
}

export const workbenchFeatures: WorkbenchFeature[] = [
  feature('dashboard-overview', 'home', '经营概况', '/', 'overview', 'dashboard', 'ready', '门店收入、订单、预约、客片和待办总览'),
  feature('dashboard-today', 'home', '今日预约', '/dashboard/today', 'calendar-new', 'schedule', 'ready', '查看今日各门店和工位的预约承接情况'),
  feature('dashboard-tasks', 'home', '待处理事项', '/dashboard/tasks', 'orders', 'orders', 'ready', '聚合今日待确认、待拍摄、待上传和待交付事项', '今日'),

  feature('merchant-overview', 'merchant', '模块总览', '/merchant/overview', 'overview', 'merchant-overview', 'ready', '汇总门店、订单、排期库存和渠道映射状态'),
  feature('merchant-readiness', 'merchant', '闭环脚手架', '/merchant/readiness', 'overview', 'merchant-readiness', 'building', '汇总商家模块未完成项、阻塞原因和下一步动作'),
  feature('merchant-schedule-governance', 'merchant', '档期治理', '/merchant/schedule-governance', 'calendar', 'merchant-schedule-governance', 'ready', '执行节假日关档、恢复营业、容量调整与审批回跳结果查看'),
  feature('merchant-channel-readiness', 'merchant', '渠道承接', '/merchant/channel-readiness', 'online-selection', 'merchant-channel-readiness', 'building', '承接抖音、美团、活动订单和表单订单 readiness'),
  feature('merchant-governance', 'merchant', '商家治理', '/merchant/governance', 'settings', 'merchant-governance', 'building', '承接权限数据范围、操作审计和高风险审批 readiness'),
  feature('merchant-dependency-readiness', 'merchant', '依赖闭环', '/merchant/dependency-readiness', 'orders', 'merchant-dependency-readiness', 'building', '承接订单、商品、服务、会员、营销和报表依赖 readiness'),
  feature('merchant-consumer-ops-p1', 'merchant', '消费者运营 P1', '/merchant/consumer-ops-p1', 'overview', 'merchant-consumer-ops-p1', 'building', '承接消费者体验与商户运营 P1 脚手架 owner，不写真实权益/通知/评价账本'),
  feature('merchant-store', 'merchant', '门店管理', '/merchant/store', 'store', 'store', 'ready', '维护门店资料并查看门店运营状态'),
  feature('merchant-service-groups', 'merchant', '服务组管理', '/merchant/service-groups', 'config', 'service-groups', 'ready', '配置服务组、服务时长和承接容量'),
  feature('merchant-inventory', 'merchant', '时段库存', '/merchant/inventory', 'calendar', 'inventory', 'ready', '查看全渠道预约时段库存和冲突记录'),
  feature('merchant-decoration', 'merchant', '门店装修', '/merchant/decoration', 'config', 'decoration', 'ready', '配置小程序首页、轮播图和菜单入口'),
  feature('merchant-micro-pages', 'merchant', '微页面管理', '/merchant/micro-pages', 'document', 'micro-pages', 'ready', '创建和编辑微页面内容块与模板'),
  feature('merchant-micro-forms', 'merchant', '微表单管理', '/merchant/micro-forms', 'form', 'micro-forms', 'ready', '创建、发布和跟进微表单提交记录'),

  feature('product-service', 'product', '服务产品', '/product/service', 'config', 'products', 'ready', '维护可预约套餐、选片规则和上下架状态'),
  feature('product-catalog', 'product', '商品目录', '/product/catalog', 'overview', 'product-catalog-module', 'building', '聚合 yy_product 与 SKU、展示、预约、关联、渠道和履约配置骨架'),
  feature('product-sku', 'product', '规格价格', '/product/sku', 'config', 'product-sku-module', 'building', '维护 SKU、价格、工位消耗和线上展示配置骨架'),
  feature('product-category', 'product', '分类运营', '/product/category', 'filter', 'product-category-module', 'building', '维护商品分类、排序、门店范围和批量运营骨架'),
  feature('product-relation', 'product', '关联产品', '/product/relation', 'plus', 'product-relation-module', 'building', '维护加购、入册、加修和冲印联动关系骨架'),
  feature('product-booking-rules', 'product', '预约规则', '/product/booking-rules', 'calendar', 'product-booking-rules-module', 'building', '维护预约门店、服务组、预付模式和限制骨架'),
  feature('product-channel', 'product', '渠道配置', '/product/channel', 'online-selection', 'product-channel-module', 'building', '维护抖音/美团商品映射补充配置骨架'),
  feature('product-cards', 'product', '卡项产品', '/product/cards', 'orders', 'product-cards-module', 'building', '维护卡项商品与权益 readiness 骨架'),
  feature('product-addon', 'product', '附加产品', '/product/addon', 'plus', 'derived-product-module', 'building', '附加产品脚手架兼容入口，继续复用统一商品主账本'),
  feature('product-group', 'product', '团单产品', '/product/group', 'orders', 'derived-product-module', 'building', '团单产品脚手架兼容入口，继续复用统一商品主账本'),
  feature('product-print', 'product', '冲印产品', '/product/print', 'photo-mgmt', 'derived-product-module', 'building', '冲印产品脚手架兼容入口，继续复用统一商品主账本'),
  feature('product-album', 'product', '入册产品', '/product/album', 'album-icon', 'product-card-catalog', 'ready', '维护入册分类、入册数量和上下架配置'),
  feature('product-douyin', 'product', '抖音产品', '/product/douyin', 'online-selection', 'douyin-products', 'ready', '查看抖音来客商品映射与授权状态', '渠道'),
  feature('product-meituan', 'product', '美团产品', '/product/meituan', 'online-selection', 'derived-product-module', 'derived', '查看美团商品映射与未授权边界', '渠道'),
  feature('product-card-management', 'product', '商品卡管理', '/product/card-management', 'config', 'product-cards', 'ready', '配置计次卡、储值卡和权益卡商品属性'),
  feature('product-card-catalog', 'product', '商品卡目录', '/product/card-catalog', 'orders', 'product-card-catalog', 'ready', '查看商品卡销售汇总和渠道分布'),

  feature('order-appointment', 'order', '预约订单', '/order/appointment', 'orders', 'orders', 'ready', '处理微信、抖音、H5 和本地统一预约订单', '今日'),
  feature('order-staff-booking', 'order', '录入预约', '/order/staff-booking', 'plus', 'staff-booking-entry', 'ready', '店员手动录入电话、微信和现场预约', '录入'),
  feature('order-card-batch', 'order', '批量开卡', '/order/card-batch', 'plus', 'order-card-batch', 'building', '高风险批量新建卡项订单脚手架，先接审批申请和执行边界说明'),
  feature('order-print', 'order', '冲印订单', '/order/print', 'photo-mgmt', 'derived-order-module', 'derived', '从统一订单账本派生冲印订单视图'),
  feature('order-enterprise', 'order', '企业团单', '/order/enterprise', 'orders', 'derived-order-module', 'derived', '从统一订单账本派生企业团单视图'),
  feature('order-card', 'order', '售卡订单', '/order/card', 'orders', 'derived-order-module', 'derived', '从统一订单账本派生商品卡销售订单'),
  feature('order-coupon', 'order', '售券订单', '/order/coupon', 'orders', 'derived-order-module', 'derived', '从统一订单账本派生优惠券订单'),
  feature('order-verification', 'order', '渠道核销', '/order/verification', 'filter', 'channel-verification', 'partial', '统一查看渠道核销验收与同步状态'),
  feature('order-campaign', 'order', '活动订单', '/order/campaign', 'orders', 'campaign-orders', 'derived', '从统一订单来源归因活动订单'),
  feature('order-forms', 'order', '表单管理', '/order/forms', 'config', 'order-form-submissions', 'ready', '独立承接微表单提交查询、跟进、导出与转预约'),

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
  feature('member-transaction-safety', 'member', '交易安全', '/member/transaction-safety', 'settings', 'member-transaction-safety', 'building', '承接权益预占、组合支付、储值消费和会员提现脚手架'),
  feature('member-tags', 'member', '客户标签', '/member/tags', 'filter', 'derived-member-module', 'derived', '从客户标签字段派生分群视图'),
  feature('member-consumption', 'member', '消费记录', '/member/consumption', 'orders', 'member-transactions', 'ready', '查看会员订单、积分、成长值和余额流水'),

  feature('tool-booking-entry', 'tool', '客户预约入口', '/tools/booking-entry', 'calendar-new', 'share-links', 'ready', '管理客户小程序和 H5 预约入口'),
  feature('tool-pickup-entry', 'tool', '取片入口', '/tools/pickup-entry', 'online-selection', 'share-links', 'ready', '管理客户取片入口和验证方式'),
  feature('tool-share-links', 'tool', '二维码与分享链接', '/tools/share-links', 'enter', 'share-links', 'ready', '生成预约、查单、取片和作品二维码'),
  feature('tool-notifications', 'tool', '通知模板', '/tools/notifications', 'notification', 'notifications', 'building', '通知模板操作入口，canonical owner 为平台通知中心'),
  feature('tool-sample-works', 'tool', '样片作品', '/tools/sample-works', 'photo-mgmt', 'tool-sample-works', 'building', '维护样片作品授权、公开展示策略和发布证据'),
  feature('tool-precision-delivery', 'tool', '精准投放', '/tools/precision-delivery', 'trend-up', 'tool-precision-delivery', 'building', '维护圈选人群、投放任务和触达结果骨架'),

  feature('marketing-center', 'marketing', '营销中心', '/marketing/center', 'trend-up', 'marketing-center-view', 'ready', '查看营销能力、渠道承接和活动订单联动'),
  feature('marketing-coupons', 'marketing', '优惠券', '/marketing/coupons', 'orders', 'marketing-coupons-view', 'ready', '维护券模板、发券记录、券实例和恢复策略脚手架'),
  feature('marketing-campaigns', 'marketing', '活动清单', '/marketing/campaigns', 'calendar', 'marketing-campaigns-view', 'ready', '维护活动清单、时间窗、商品绑定和活动订单桥接'),
  feature('marketing-participations', 'marketing', '活动参与记录', '/marketing/participations', 'overview', 'marketing-participations-view', 'ready', '查询客户参与、转化、退款和固定优先级试算'),

  feature('report-store-daily', 'report', '门店业绩日报', '/report/store-daily', 'trend-up', 'derived-report-module', 'derived', '从订单和快照聚合门店日报'),
  feature('report-store-monthly', 'report', '门店业绩月报', '/report/store-monthly', 'trend-up', 'derived-report-module', 'derived', '从订单和快照聚合门店月报'),
  feature('report-products', 'report', '服务产品统计', '/report/products', 'trend-up', 'derived-report-module', 'derived', '从订单聚合产品销量和收入'),
  feature('report-employees', 'report', '员工业绩统计', '/report/employees', 'overview', 'derived-report-module', 'derived', '从员工与相册派生服务工作量'),
  feature('report-retouch', 'report', '修图量统计', '/report/retouch', 'photo-mgmt', 'derived-report-module', 'derived', '从相册与底片派生修图工作量'),
  feature('report-finance', 'report', '财务对账报表', '/report/finance', 'trend-up', 'report-finance-reconciliation', 'building', '统一核对订单、支付、退款、储值、提现、优惠减免和权益预占口径'),
  feature('report-customers', 'report', '客户分析', '/report/customers', 'overview', 'derived-report-module', 'derived', '从客户档案聚合来源和消费层级'),
  feature('report-reviews', 'report', '客户评价', '/report/reviews', 'overview', 'derived-report-module', 'partial', '评价表与渠道评价 API 未接入时显示真实空态'),
  feature('report-channels', 'report', '渠道收入统计', '/report/channels', 'trend-up', 'derived-report-module', 'derived', '从订单来源聚合渠道收入'),
  feature('report-conversion', 'report', '订单转化分析', '/report/conversion', 'trend-up', 'derived-report-module', 'derived', '从订单和相册派生转化漏斗'),
  feature('report-order-analysis', 'report', '订购分析', '/report/order-analysis', 'trend-up', 'report-order-analysis', 'building', '基于订单与支付流水搭建订购、支付、退款、渠道口径脚手架'),

  feature('settings-employees', 'settings', '员工管理', '/settings/employees', 'overview', 'employees', 'ready', '维护员工、岗位、技能和门店归属'),
  feature('settings-roles', 'settings', '角色与权限', '/settings/roles', 'settings', 'roles', 'partial', '展示权限矩阵，角色维护仍在 RuoYi 后台'),
  feature('settings-logs', 'settings', '系统日志', '/settings/logs', 'orders', 'logs', 'partial', '查看操作、订单、渠道和异常日志'),
  feature('settings-channels', 'settings', '渠道配置', '/settings/channels', 'config', 'channels', 'ready', '配置微信、抖音、美团和回调能力'),
  feature('settings-workbench', 'settings', '工作台设置', '/settings/workbench', 'settings', 'settings', 'ready', '查看工作台运行模式、安全边界和客户入口隔离'),

  feature('platform-brand-info', 'platform', '品牌信息', '/platform/brand-info', 'overview', 'platform-brand-info', 'building', '维护品牌资料、LOGO、分享展示信息和品牌审计边界'),
  feature('platform-integration', 'platform', '平台对接', '/platform/integration', 'config', 'platform-integration', 'building', '维护微信、抖音、美团平台授权、Webhook 和 SPI 对接骨架'),
  feature('platform-login-risk', 'platform', '登录风控', '/platform/login-risk', 'settings', 'platform-login-risk', 'building', '维护设备、IP、异常登录和二次校验脚手架'),
  feature('platform-open-api', 'platform', '开放 API', '/platform/open-api', 'channels', 'platform-open-api', 'building', '维护开放应用、API key、签名和限流骨架'),
  feature('platform-task-center', 'platform', '任务中心', '/platform/task-center', 'orders', 'platform-task-center', 'building', '维护导出、图片处理、通知和报表汇总任务骨架'),
  feature('platform-booking-policy', 'platform', '预约设置', '/platform/booking-policy', 'calendar', 'platform-booking-policy', 'building', '维护预约费用、自助改期和退单策略骨架'),
  feature('platform-print-settings', 'platform', '打印设置', '/platform/print-settings', 'config', 'platform-print-settings', 'building', '维护打印模板、输出策略和门店适用范围骨架'),
  feature('platform-score-settings', 'platform', '评分配置', '/platform/score-settings', 'trend-up', 'platform-score-settings', 'building', '维护评价规则、评分项和差评通知骨架'),
  feature('platform-meituan-review-trace', 'platform', '美团差评溯源', '/platform/meituan-review-trace', 'online-selection', 'platform-meituan-review-trace', 'building', '维护美团评价拉取、差评归因和插件授权骨架'),
  feature('platform-email-settings', 'platform', '邮箱设置', '/platform/email-settings', 'notification', 'platform-email-settings', 'building', '维护发件邮箱、SMTP 和失败重试骨架'),
  feature('platform-notification-center', 'platform', '通知中心', '/platform/notification-center', 'notification', 'platform-notification-center', 'building', '维护通知场景、触达对象和多渠道开关骨架'),
  feature('platform-backup-recovery', 'platform', '备份恢复', '/platform/backup-recovery', 'overview', 'platform-backup-recovery', 'building', '维护主库 PITR、对象版本化和恢复演练证据骨架'),
  feature('platform-service-packages', 'platform', '简约服务中心', '/platform/service-packages', 'config', 'platform-service-packages', 'building', '维护套餐插件授权、资源额度和服务购买记录骨架'),

  feature('account-profile', 'account', '个人中心', '/account/profile', 'overview', 'account-profile', 'building', '维护账号资料、安全设置和绑定信息骨架'),
  feature('account-brands', 'account', '我的品牌', '/account/brands', 'store', 'account-brands', 'building', '维护品牌授权关系、默认品牌和切换审计骨架'),
  feature('account-help', 'account', '帮助中心', '/account/help', 'overview', 'account-help', 'building', '维护产品帮助、版本说明和常见问题检索骨架'),

  feature('finance-overview', 'finance', '费用概览', '/finance/overview', 'overview', 'finance-overview', 'building', '维护消费账户、余额、欠费和收益概况骨架'),
  feature('finance-transactions', 'finance', '收支明细', '/finance/transactions', 'orders', 'finance-transactions', 'building', '维护收支流水、导出、脱敏权限和审计骨架'),
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
