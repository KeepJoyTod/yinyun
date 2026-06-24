# 订单 / 支付 / 排期库存 / 审计 Phase 1 数据流

> owner: full-product-closed-loop-phase1
> canonical_for: Phase 1 前端 owner 收口与真实账本只读/写入边界
> upstream: `docs/flows/full-product-closed-loop-flow.md`, `docs/flows/flow-template.md`
> downstream: 支付确认、库存刷新、审计证据和退款只读呈现

## 用户路径

1. 店员在 `预约订单` 打开订单详情。
2. 若订单满足人工确认收款条件，则在详情抽屉执行“确认收款”。
3. 收款成功后，订单、库存、今日预约、统计卡片与操作日志一起刷新。
4. 店员在 `时段库存` 查看某天某店真实容量与冲突，必要时更新容量备注。
5. 管理端在订单详情时间线中查看操作审计和渠道日志，确认支付、退款和渠道回调证据。

## Mermaid 数据流

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as 表现层\nOrdersView / InventoryView
  participant Store as 控制逻辑层\nappStore / workbenchOperationalStore
  participant PayApi as 控制逻辑层\nbackendPaymentsApi
  participant InvApi as 控制逻辑层\nbackendInventoryApi
  participant AuditApi as 控制逻辑层\nbackendAuditApi
  participant Backend as 后端\nController / Service
  participant Ledger as 持久层\nyy_order / yy_payment_record / yy_booking_slot_inventory / sys_oper_log / yy_channel_sync_log

  Staff->>View: 点击确认收款/查看库存/查看审计
  View->>Store: submit action / load scope
  alt 确认收款
    Store->>PayApi: confirmOrderPayment(id, amountCent, remark)
    PayApi->>Backend: POST /yy/order/{id}/payment/confirm
    Backend->>Ledger: 写 yy_order + yy_payment_record + yy_booking_slot_inventory + sys_oper_log
    Ledger-->>Backend: updated rows
    Backend-->>PayApi: YyOrderVo
    PayApi-->>Store: OrderDto
    Store-->>View: 刷新订单 / 库存 / 今日看板 / 操作日志
  else 查看或更新库存
    Store->>InvApi: listBookingInventory / updateBookingInventory
    InvApi->>Backend: GET/PUT /yy/bookingSlotInventory
    Backend->>Ledger: 读写 yy_booking_slot_inventory
    Ledger-->>Backend: inventory rows
    Backend-->>InvApi: BookingInventoryDto
    InvApi-->>Store: normalized inventory
    Store-->>View: 容量 / 已约 / 冲突 / 备注
  else 查看审计证据
    Store->>AuditApi: listOperationLogs / listChannelSyncLogs
    AuditApi->>Backend: GET /monitor/operlog/list + /yy/channelSyncLog/list
    Backend->>Ledger: 读 sys_oper_log + yy_channel_sync_log
    Ledger-->>Backend: evidence rows
    Backend-->>AuditApi: log rows
    AuditApi-->>Store: normalized audit logs
    Store-->>View: requestId/logid/退款证据
  end
```

## 执行步骤

1. 新增 Phase 1 契约与流程文档，固定允许改动范围和验证口径。
2. 在 `shared/api` 新增 `payments / inventory / audit` 三个 slice，并从旧 slice 中迁出对应方法。
3. 保留 `backendApi` 的兼容聚合外观，避免现有页面与 store 大改。
4. 为 Phase 1 新增共享 query/type 契约，至少覆盖支付记录类型、库存查询、审计查询。
5. 更新 contract tests 与地图，并执行目标验证。
