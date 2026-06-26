# report-finance 财务对账报表契约

日期：2026-06-26

## 目标

将 `/report/finance` 从派生收支统计升级为财务对账报表 owner，统一展示订单视角、资金流水视角、差异项和异步导出任务。

## 前端入口

- 路由：`/report/finance`
- owner：`studio-workbench/src/features/reports/ReportFinanceReconciliationView.vue`
- composable：`studio-workbench/src/features/reports/composables/useReportFinanceReconciliation.ts`
- API facade：`studio-workbench/src/shared/api/backendReportsApi.ts`

## 接口

### GET /yy/reportFinanceReconciliation/overview

权限：`yy:report:list`

请求参数：

- `storeId?: Long`
- `dateFrom?: yyyy-MM-dd`
- `dateTo?: yyyy-MM-dd`

响应字段：

- `overview.orderAmountCent`
- `overview.paidAmountCent`
- `overview.refundAmountCent`
- `overview.storedValueConsumeCent`
- `overview.storedValueReversalCent`
- `overview.withdrawPaidCent`
- `overview.discountAmountCent`
- `overview.waiveAmountCent`
- `overview.reconciliationDiffCent`
- `overview.attentionCount`
- `orderLedgers[].ledgerKey/ledgerLabel/recordCount/amountCent/refundAmountCent/sourceTable/statusSummary`
- `fundLedgers[].ledgerKey/ledgerLabel/recordCount/amountCent/refundAmountCent/sourceTable/statusSummary`
- `differences[].differenceKey/differenceLabel/amountCent/recordCount/severity/note`
- `exportTasks[]`

### POST /yy/reportFinanceReconciliation/export

权限：`yy:report:export`

请求参数同 overview。

响应：`ReportFinanceExportTaskDto`

当前实现为本地异步导出任务骨架：创建任务、状态置为 `COMPLETED`、返回下载地址、过期时间和审计说明。

### GET /yy/reportFinanceReconciliation/export/tasks

权限：`yy:report:list`

请求参数同 overview。

响应：当前 JVM 内已创建的财务对账导出任务列表。

## 数据边界

- 不新建第二套订单或支付主账本。
- 订单视角读取 `yy_order`。
- 支付流水读取 `yy_payment_record`。
- 储值消费和逆向读取 `yy_stored_value_consume_order`、`yy_member_balance_ledger`。
- 提现读取 `yy_member_withdraw_order`。
- 组合支付优惠减免读取 `yy_composite_payment_order`。
- 权益预占待释放读取 `yy_entitlement_reservation`。
- 不调用真实微信、抖音、美团、银行或微信提现接口。
- 当前导出任务为本地任务骨架，不等于持久化队列、对象存储文件和跨实例任务中心已完成。

## 验收

- `/report/finance` 打开独立财务对账页面，不再复用 `DerivedReportModuleView.vue`。
- 页面可按门店和日期筛选。
- 页面展示订单视角、资金流水视角、差异与待关注、导出任务。
- 点击异步导出能创建导出任务并刷新任务列表。
- 后端目标测试通过：
  - `YyReportFinanceReconciliationServiceImplTest`
  - `YyReportFinanceReconciliationControllerTest`
