import { defineModuleScaffold } from '../system/moduleScaffold'

export const financeOverviewScaffold = defineModuleScaffold({
  featureKey: 'finance-overview',
  domain: '费用中心',
  title: '费用概览',
  summary: '统一承接消费账户、可用余额、预付款、欠费和收益概况的模块 owner。',
  owner: 'studio-workbench/src/features/finance-center',
  nextPhase: 'Phase 3 接真实费用概览、充值与对账规则。',
  routes: ['/finance/overview'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendFinanceApi.ts',
  ],
  apis: ['backendApi.getFinanceOverview()'],
  ledgers: ['消费账户账本', '收益概况快照'],
})

export const financeTransactionsScaffold = defineModuleScaffold({
  featureKey: 'finance-transactions',
  domain: '费用中心',
  title: '收支明细',
  summary: '统一承接收支流水、导出、脱敏权限和风险动作审计的 owner 模块。',
  owner: 'studio-workbench/src/features/finance-center',
  nextPhase: 'Phase 3 接真实充值、提现、退款和对账流水。',
  routes: ['/finance/transactions'],
  contracts: [
    'docs/contracts/full-product-closed-loop-contract.md',
    'studio-workbench/src/shared/api/backendFinanceApi.ts',
  ],
  apis: ['backendApi.listFinanceTransactions()'],
  ledgers: ['收支流水账本', '导出审计日志'],
})
