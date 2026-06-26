export type ScaffoldAcceptanceMapping = {
  inventoryCode: string
  title: string
  canonicalOwner: string
  acceptanceLabel: string
  boundaryNotes: string[]
  nextActions: string[]
}

export type ScaffoldAcceptanceMeta = {
  inventoryCodes: string[]
  acceptanceLabel: string
  boundaryNotes: string[]
  nextActions: string[]
}

const acceptanceLabel = '脚手架验收完成 / 待真实验收'

export const scaffoldAcceptanceMappings: Record<string, ScaffoldAcceptanceMapping> = {
  'C-023': {
    inventoryCode: 'C-023',
    title: '会员资料',
    canonicalOwner: 'mobile-uniapp:/pages/my/index + member-accounts',
    acceptanceLabel,
    boundaryNotes: [
      '消费者端只展示资料、等级、标签、成长值和资产摘要，不开放真实资料写入闭环。',
      '商家侧继续复用 member-accounts 读侧 owner，不新增第二套会员资料账本。',
    ],
    nextActions: [
      '补真实资料保存、标签规则和成长值升级发放策略。',
      '补资料修改审计与多门店会员范围校验。',
    ],
  },
  'C-025': {
    inventoryCode: 'C-025',
    title: '优惠券/兑换券',
    canonicalOwner: 'mobile-uniapp:/pages/coupons/index',
    acceptanceLabel,
    boundaryNotes: [
      '当前只展示 P1 卡券/权益候选和状态摘要，不执行真实核销、扣减或退单回滚。',
      '真实下单核销、权益预占释放和退款逆向仍归后续交易闭环任务。',
    ],
    nextActions: [
      '补真实可用/已用/过期/退单恢复账本联动。',
      '补消费者端核销码与卡券可用性校验闭环。',
    ],
  },
  'B-018': {
    inventoryCode: 'B-018',
    title: '服务产品',
    canonicalOwner: 'product-catalog',
    acceptanceLabel,
    boundaryNotes: [
      '继续使用 yy_product 作为唯一商品主账本，不新增第二套服务产品账本。',
      '只提供目录聚合和扩展配置骨架，不触发支付、库存、权益或渠道真实写入。',
    ],
    nextActions: [
      '补真实商品表单验收和生产数据迁移。',
      '补门店、渠道和展示配置的目标租户 smoke。',
    ],
  },
  'B-019': {
    inventoryCode: 'B-019',
    title: '产品规格价格',
    canonicalOwner: 'product-sku',
    acceptanceLabel,
    boundaryNotes: [
      'SKU 只维护价格、线上展示和工位消耗骨架，不改真实订单价格结算链路。',
      '当前只验收 CRUD 骨架和 owner，不宣称生产履约闭环。',
    ],
    nextActions: [
      '补 SKU 批量导入、历史迁移和价格联动校验。',
      '补真实订单场景下的规格价格验收。',
    ],
  },
  'B-020': {
    inventoryCode: 'B-020',
    title: '产品二维码',
    canonicalOwner: 'product-catalog.display-qrcode',
    acceptanceLabel,
    boundaryNotes: [
      '当前只补展示配置、直达地址和二维码场景骨架，不生成真实外部短链或投放日志。',
      '二维码入口仍依赖现有商品和渠道映射，不新建独立商品来源。',
    ],
    nextActions: [
      '补真实二维码生成、统计和失效策略。',
      '补渠道投放与公开入口验收。',
    ],
  },
  'B-021': {
    inventoryCode: 'B-021',
    title: '关联产品/加购',
    canonicalOwner: 'product-relation',
    acceptanceLabel,
    boundaryNotes: [
      '只维护关联、加购、入册、加修和冲印关系骨架，不自动下单或扣减库存。',
      '所有关联关系继续依附统一商品主账本。',
    ],
    nextActions: [
      '补真实订单加购联动与冲突校验。',
      '补商品关系批量管理与历史迁移策略。',
    ],
  },
  'B-022': {
    inventoryCode: 'B-022',
    title: '在线选片配置',
    canonicalOwner: 'product-catalog.selection-fulfillment',
    acceptanceLabel,
    boundaryNotes: [
      '只补选片单价、入册产品和履约规则骨架，不代表真实选片履约已端到端验收。',
      '入册履约配置继续复用 yy_product_collaboration_config，不新增第二套履约表。',
    ],
    nextActions: [
      '补真实订单、选片链接和履约节点的目标环境验收。',
      '补客户侧真实选片、加片、交付链路 smoke。',
    ],
  },
  'B-023': {
    inventoryCode: 'B-023',
    title: '附加产品',
    canonicalOwner: '/product/addon',
    acceptanceLabel,
    boundaryNotes: [
      '当前作为统一商品主账本的派生兼容入口，不新增第二套附加产品表。',
      '页面只提供标准 scaffold 走查信息，不开放独立真实写链路。',
    ],
    nextActions: [
      '补真实附加产品表单 owner 或确认长期保持派生模式。',
      '补与订单加购、选片加片和结算联动验收。',
    ],
  },
  'B-024': {
    inventoryCode: 'B-024',
    title: '团单产品',
    canonicalOwner: '/product/group',
    acceptanceLabel,
    boundaryNotes: [
      '继续派生自 yy_product，不新建第二套团单商品账本。',
      '当前只展示团单商品承接边界，不声明企业团单真实销售闭环。',
    ],
    nextActions: [
      '补团单规则、人数/批次配置和真实订单验收。',
      '补企业客户与团单商品映射策略。',
    ],
  },
  'B-025': {
    inventoryCode: 'B-025',
    title: '冲印产品',
    canonicalOwner: '/product/print',
    acceptanceLabel,
    boundaryNotes: [
      '继续派生自 yy_product，不新建第二套冲印商品账本。',
      '当前只展示冲印规则和承接边界，不接真实打印产出和交付效果验收。',
    ],
    nextActions: [
      '补冲印规格、打印模板和履约验收。',
      '补订单打印/交付流程的目标环境 smoke。',
    ],
  },
  'B-028': {
    inventoryCode: 'B-028',
    title: '卡项产品配置',
    canonicalOwner: 'product-cards',
    acceptanceLabel,
    boundaryNotes: [
      '只展示卡项商品与权益 readiness，不改权益、支付和提现高风险状态机。',
      '卡项售卖订单仍回统一订单账本处理。',
    ],
    nextActions: [
      '补卡项适用范围、权益核销和支付确认验收。',
      '补真实售卡链路与退款逆向策略。',
    ],
  },
  'B-110': {
    inventoryCode: 'B-110',
    title: '积分规则',
    canonicalOwner: 'member-accounts.points-rules',
    acceptanceLabel,
    boundaryNotes: [
      '当前只展示规则 owner 和只读资产关联，不接真实积分获取、抵扣、过期和退单回滚引擎。',
      '不新增第二套会员积分主账本。',
    ],
    nextActions: [
      '补真实积分规则引擎、发放与回滚逻辑。',
      '补多门店积分口径与审计验收。',
    ],
  },
  'B-111': {
    inventoryCode: 'B-111',
    title: '会员等级',
    canonicalOwner: 'member-accounts.level-rules',
    acceptanceLabel,
    boundaryNotes: [
      '当前只展示等级、人数和权益边界，不接真实成长值门槛升级与权益自动发放。',
      '等级规则继续挂在会员账户 owner 内，不拆第二个会员账本入口。',
    ],
    nextActions: [
      '补真实成长值升级规则、权益发放和失效策略。',
      '补等级变更审计和门店范围验收。',
    ],
  },
  'B-073': {
    inventoryCode: 'B-073',
    title: '优惠码',
    canonicalOwner: 'marketing-coupons.code-readiness',
    acceptanceLabel,
    boundaryNotes: [
      '当前只展示优惠码规则和 owner 边界，不补真实传播、核销和渠道发码写链路。',
      '仍复用营销券 owner，不新建第二套优惠码账本。',
    ],
    nextActions: [
      '补真实优惠码生成、传播、核销和统计。',
      '补和订单/活动的互斥与叠加校验。',
    ],
  },
  'B-074': {
    inventoryCode: 'B-074',
    title: '兑换券',
    canonicalOwner: 'marketing-coupons.exchange-readiness',
    acceptanceLabel,
    boundaryNotes: [
      '当前只展示兑换券发放和活动绑定骨架，不做真实兑换核销闭环。',
      '仍复用营销券 owner，不新建第二套兑换券入口。',
    ],
    nextActions: [
      '补真实兑换券发放、兑换、失效和回滚逻辑。',
      '补活动绑定与订单使用验收。',
    ],
  },
  'B-077': {
    inventoryCode: 'B-077',
    title: '退单后券恢复策略',
    canonicalOwner: 'marketing-coupons.recovery-strategy',
    acceptanceLabel,
    boundaryNotes: [
      '当前只展示恢复策略 scaffold，不执行真实退单后发券恢复。',
      '仍依附营销券 owner，避免另起恢复策略页面。',
    ],
    nextActions: [
      '补真实退单逆向、发券恢复和审计证据。',
      '补部分退款、整单退款和多券并存场景验收。',
    ],
  },
  'B-085': {
    inventoryCode: 'B-085',
    title: '场景触发',
    canonicalOwner: 'platform-notification-center',
    acceptanceLabel,
    boundaryNotes: [
      '当前只展示通知规则、触达日志和 next actions，不定义完整触发引擎与频控执行器。',
      '工具通知模板入口继续保留为操作入口，但 canonical owner 固定为平台通知中心。',
    ],
    nextActions: [
      '补触发条件、动作、频控、重试和日志模型。',
      '补真实通知 SDK 与发送失败处理验收。',
    ],
  },
  'B-115': {
    inventoryCode: 'B-115',
    title: '预约设置',
    canonicalOwner: 'platform-booking-policy',
    acceptanceLabel,
    boundaryNotes: [
      '当前只维护预约费用、自助改期和退单策略骨架，不改真实支付、库存扣减或渠道订单写链路。',
      '不同渠道差异化策略仍待后续真实验收。',
    ],
    nextActions: [
      '补真实渠道策略、门店范围和订单联动验收。',
      '补自助改期/退单的目标环境 smoke。',
    ],
  },
  'B-116': {
    inventoryCode: 'B-116',
    title: '打印设置',
    canonicalOwner: 'platform-print-settings',
    acceptanceLabel,
    boundaryNotes: [
      '当前只维护模板配置骨架，不验证正式打印效果、权限和设备联动。',
      '不扩真实打印任务中心与设备驱动写链路。',
    ],
    nextActions: [
      '补模板字段权限、订单打印效果和设备兼容验收。',
      '补打印审计和失败重试策略。',
    ],
  },
  'B-117': {
    inventoryCode: 'B-117',
    title: '评分配置',
    canonicalOwner: 'platform-score-settings',
    acceptanceLabel,
    boundaryNotes: [
      '当前只维护评价开关、评分项和通知策略骨架，不写真实评价账本。',
      '差评通知和评价渠道差异仍待后续闭环任务。',
    ],
    nextActions: [
      '补真实评价账本、审核流和评价报表。',
      '补差评通知触达和配置验收。',
    ],
  },
  'B-118': {
    inventoryCode: 'B-118',
    title: '邮箱设置',
    canonicalOwner: 'platform-email-settings',
    acceptanceLabel,
    boundaryNotes: [
      '当前只展示发件邮箱、SMTP 和重试策略骨架，不发送真实邮件。',
      '发送测试、失败重试和告警仍待后续闭环。',
    ],
    nextActions: [
      '补真实 SMTP 配置、发送测试和失败重试。',
      '补邮件发送审计和权限验收。',
    ],
  },
}

export const getScaffoldAcceptanceMapping = (inventoryCode: string) => scaffoldAcceptanceMappings[inventoryCode]

const uniqueItems = (items: string[]) => Array.from(new Set(items))

export const collectScaffoldAcceptanceMeta = (inventoryCodes: string[]): ScaffoldAcceptanceMeta => {
  const mappings = inventoryCodes
    .map(inventoryCode => getScaffoldAcceptanceMapping(inventoryCode))
    .filter((item): item is ScaffoldAcceptanceMapping => Boolean(item))

  return {
    inventoryCodes,
    acceptanceLabel: mappings[0]?.acceptanceLabel ?? acceptanceLabel,
    boundaryNotes: uniqueItems(mappings.flatMap(item => item.boundaryNotes)),
    nextActions: uniqueItems(mappings.flatMap(item => item.nextActions)),
  }
}
