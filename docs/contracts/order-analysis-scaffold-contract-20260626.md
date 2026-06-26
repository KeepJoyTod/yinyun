# R-013 订购分析脚手架契约

更新时间：2026-06-26

## 范围

- 对应 `docs/product-function-inventory(产品功能清单).md` 中 `R-013 订购分析`。
- 本次只新增前后端只读脚手架、独立 report owner、接口 DTO/VO、契约测试和地图更新。
- 不新增表、不改 SQL、不接导出、不接异步任务中心、不改订单/支付/退款写链路。

## 三层 owner

### 表现层

- `studio-workbench/src/features/reports/OrderAnalysisReportView.vue`
- `studio-workbench/src/features/reports/reportScaffolds.ts`
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`

### 控制逻辑层

- `studio-workbench/src/features/reports/composables/useOrderAnalysisReport.ts`
- `studio-workbench/src/features/reports/orderAnalysisReportOperations.ts`
- `studio-workbench/src/shared/api/backendReportsApi.ts`
- `studio-workbench/src/shared/api/backendTypesReports.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderAnalysisController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyOrderAnalysisService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderAnalysisServiceImpl.java`

### 持久数据层

- `yy_order`
- `yy_payment_record`

## 路由与权限

- 路由：`/report/order-analysis`
- feature key：`report-order-analysis`
- component owner：`report-order-analysis`
- 权限：`yy:report:list`

## 接口

- `GET /yy/reportOrderAnalysis/overview`
  - 参数：`storeId?`、`dateFrom?`、`dateTo?`
  - 默认：未传时按本月
  - 返回：
    - `overview`
      - `orderedCount`
      - `paidOrderCount`
      - `paidAmountCent`
      - `refundOrderCount`
      - `refundAmountCent`
      - `pendingAttentionCount`
      - `boundaryNote`
    - `funnel[]`
      - `stageKey`
      - `stageLabel`
      - `orderCount`
      - `amountCent`
      - `conversionRate`
    - `channels[]`
      - `channelKey`
      - `channelLabel`
      - `orderCount`
      - `paidAmountCent`
      - `refundAmountCent`
      - `pendingCount`
    - `refunds[]`
      - `refundStatus`
      - `orderCount`
      - `refundAmountCent`
      - `note`

## 聚合口径

- 订购漏斗：`已下单 -> 已支付 -> 已确认服务 -> 已退款/退款中关注`
- 渠道拆分：优先 `channelType`，缺失时回退 `source`
- 退款拆分：按 `refundStatus`；如果只有退款金额没有退款状态，归到 `REFUND_AMOUNT_ONLY`
- 金额优先级：
  - 先读 `yy_payment_record.paidAmountCent/refundAmountCent`
  - 无支付流水时回退 `yy_order.paidAmountCent/refundAmountCent`
  - 仍缺失时，已支付金额再回退 `yy_order.totalAmountCent`

## 边界

- 页面只展示订购、支付、退款和渠道口径的只读分析。
- 页面不导出、不改订单状态、不改库存、不发起支付确认、不发起退款审批。
- 当前返回的是脚手架聚合，不等于财务对账、第三方退款闭环或异步任务中心已完成。
