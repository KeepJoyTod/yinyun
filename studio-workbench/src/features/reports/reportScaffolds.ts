import { definePhaseModuleScaffold } from '../system/phaseModuleRegistry'

type ReportModuleDefinition = {
  featureKey: string
  title: string
  route: string
  summary: string
  nextPhase: string
  ledgers: string[]
  status?: 'derived' | 'partial'
}

const reportDefinitions: ReportModuleDefinition[] = [
  {
    featureKey: 'report-store-daily',
    title: '门店业绩日报',
    route: '/report/store-daily',
    summary: '日报继续优先读快照，无快照时回退订单聚合说明。',
    nextPhase: 'Phase 2 继续补真实快照生成任务和导出链路。',
    ledgers: ['yy_report_snapshot', 'yy_order'],
  },
  {
    featureKey: 'report-store-monthly',
    title: '门店业绩月报',
    route: '/report/store-monthly',
    summary: '月报与日报共享统一只读 owner 和快照边界。',
    nextPhase: 'Phase 2 继续补月度快照、同期对比和门店范围缓存。',
    ledgers: ['yy_report_snapshot', 'yy_order'],
  },
  {
    featureKey: 'report-products',
    title: '服务产品统计',
    route: '/report/products',
    summary: '产品销量和收入聚合继续走统一报表 owner。',
    nextPhase: 'Phase 2 继续补产品履约口径和渠道来源切片。',
    ledgers: ['yy_order', 'yy_report_snapshot'],
  },
  {
    featureKey: 'report-employees',
    title: '员工业绩统计',
    route: '/report/employees',
    summary: '员工业绩只读取员工与相册归属，不伪造提成账本。',
    nextPhase: 'Phase 2 继续补岗位产能和 SLA 统计。',
    ledgers: ['yy_employee', 'yy_photo_album', 'yy_report_snapshot'],
  },
  {
    featureKey: 'report-retouch',
    title: '修图量统计',
    route: '/report/retouch',
    summary: '修图量只读取相册和底片事实，不复制服务生产任务账本。',
    nextPhase: 'Phase 2 继续补修图耗时、退回率和服务商维度统计。',
    ledgers: ['yy_photo_album', 'yy_photo_asset', 'yy_report_snapshot'],
  },
  {
    featureKey: 'report-finance',
    title: '收支统计',
    route: '/report/finance',
    summary: '收支统计继续从统一订单账本和报表快照派生。',
    nextPhase: 'Phase 2 继续补费用中心对账口径和真实资金账本映射。',
    ledgers: ['yy_order', 'yy_report_snapshot'],
  },
  {
    featureKey: 'report-customers',
    title: '客户分析',
    route: '/report/customers',
    summary: '客户来源和消费层级继续走报表只读聚合，不创建第二套客户分析账本。',
    nextPhase: 'Phase 2 继续补标签圈选和会员资产联动口径。',
    ledgers: ['yy_customer', 'yy_order', 'yy_report_snapshot'],
  },
  {
    featureKey: 'report-reviews',
    title: '客户评价',
    route: '/report/reviews',
    summary: '评价模块保留明确空态，直到正式评价表或渠道评价 API 接入。',
    nextPhase: 'Phase 2 继续补客户评价表、渠道评分和差评通知链路。',
    ledgers: ['yy_report_snapshot'],
    status: 'partial',
  },
  {
    featureKey: 'report-channels',
    title: '渠道收入统计',
    route: '/report/channels',
    summary: '渠道收入继续从统一订单来源聚合，不在页面侧重复算口径。',
    nextPhase: 'Phase 2 继续补 webhook 请求链和渠道退款口径。',
    ledgers: ['yy_order', 'yy_channel_sync_log', 'yy_report_snapshot'],
  },
  {
    featureKey: 'report-conversion',
    title: '订单转化分析',
    route: '/report/conversion',
    summary: '转化漏斗继续从订单和相册事实派生，避免前端页面重复状态机。',
    nextPhase: 'Phase 2 继续补支付、到店、交付节点的一致性校验。',
    ledgers: ['yy_order', 'yy_photo_album', 'yy_report_snapshot'],
  },
]

export const reportScaffolds = reportDefinitions.map(definition =>
  definePhaseModuleScaffold({
    featureKey: definition.featureKey,
    phase: 'Phase 2',
    ownerStatus: definition.status ?? 'derived',
    domain: '统计',
    title: definition.title,
    summary: definition.summary,
    owner: 'studio-workbench/src/features/reports',
    nextPhase: definition.nextPhase,
    routes: [definition.route],
    contracts: [
      'docs/contracts/full-product-closed-loop-contract.md',
      'studio-workbench/src/features/reports/DerivedReportModuleView.vue',
    ],
    apis: ['appStore.ensureReportDataLoaded()', 'GET /yy/reportSnapshot/list'],
    ledgers: definition.ledgers,
    ownerLayers: {
      presentation: ['studio-workbench/src/features/reports/DerivedReportModuleView.vue'],
      control: ['studio-workbench/src/features/reports/derivedReportModules.ts', 'studio-workbench/src/shared/stores/appStore.ts'],
      data: definition.ledgers,
    },
  }),
)
