# report-finance 财务对账报表三层流程

日期：2026-06-26

```mermaid
flowchart TD
  A["第一层 表现层: /report/finance"] --> B["筛选门店/dateFrom/dateTo"]
  B --> C["第二层 控制层: useReportFinanceReconciliation"]
  C --> D["backendReportsApi.getReportFinanceReconciliation"]
  D --> E["GET /yy/reportFinanceReconciliation/overview"]
  E --> F["YyReportFinanceReconciliationServiceImpl"]
  F --> G["第三层 数据层: yy_order"]
  F --> H["第三层 数据层: yy_payment_record"]
  F --> I["第三层 数据层: yy_member_balance_ledger"]
  F --> J["第三层 数据层: yy_stored_value_consume_order"]
  F --> K["第三层 数据层: yy_member_withdraw_order"]
  F --> L["第三层 数据层: yy_composite_payment_order"]
  F --> M["第三层 数据层: yy_entitlement_reservation"]
  F --> N["返回 overview/orderLedgers/fundLedgers/differences/exportTasks"]
  N --> A
  A --> O["点击异步导出"]
  O --> P["POST /yy/reportFinanceReconciliation/export"]
  P --> Q["创建本地导出任务骨架"]
  Q --> R["GET /yy/reportFinanceReconciliation/export/tasks"]
  R --> A
```

## 失败路径

- 日期格式错误：后端返回 `ServiceException`，前端展示 `report-finance-error`。
- 无权限：`yy:report:list` 或 `yy:report:export` 校验失败，由统一请求层处理。
- 当前范围无数据：页面展示真实空态，不伪造金额。

## 不做事项

- 不写入真实支付、退款、提现外部接口。
- 不新增第二套财务主账本。
- 不在本包落对象存储文件、跨实例队列和下载过期清理任务。
