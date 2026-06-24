# 订单 / 支付 / 排期库存 / 审计 Phase 1 契约

> owner: full-product-closed-loop-phase1
> canonical_for: 订单履约基础闭环、支付确认、库存账本、操作审计与渠道证据
> upstream: `docs/contracts/full-product-closed-loop-contract.md`, `docs/contracts/contract-template.md`
> downstream: Phase 1 owner 文件、前端 facade、后端真实账本接线

## 1. 任务包

```text
任务包：phase1-order-payment-inventory-audit
目标：把订单 / 支付 / 排期库存 / 审计四条高风险链路先收口成独立 owner，保留 backendApi 兼容外观
允许修改：
- docs/contracts/order-payment-inventory-audit-phase1-contract.md
- docs/flows/order-payment-inventory-audit-phase1-flow.md
- studio-workbench/src/shared/api/backend*.ts
- studio-workbench/src/shared/api/backendTypes*.ts
- studio-workbench/src/shared/stores/* 与订单 contract tests 的最小必要文件
- C:\Users\Administrator\Desktop\yiyue\code_map.md
- C:\Users\Administrator\Desktop\yiyue\function_map.md
- C:\Users\Administrator\Desktop\yiyue\api_map.md
- C:\Users\Administrator\Desktop\yiyue\optimization_map.md
禁止修改：
- mobile-uniapp 真实支付链路
- backend 退款写链路
- 会员、营销、平台设置域 owner
三层归属：表现层保持现状；控制逻辑层新增 payments / inventory / audit slice；持久数据层只登记账本与证据，不新增未验证写入
验证命令：
- npm --prefix studio-workbench run check:file-size
- npm --prefix studio-workbench run test -- src/shared/api/backend.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/shared/stores/appStore.contract.test.ts
- npm --prefix studio-workbench run build
停止条件：若发现需新增未验证后端退款接口或破坏现有 facade 兼容，则停止扩展真实功能，仅保留契约登记
```

## 2. 用户路径

1. 店员从 `预约订单` 进入订单详情，点击“确认收款”，系统只允许未支付、未退款、非抖音来客订单进入人工确认。
2. 店员从 `今日预约` 或 `商户/时段库存` 查看排期容量与冲突，按真实 `yy_booking_slot_inventory` 账本加载与更新。
3. 店长或管理员在订单详情和系统日志侧查看操作审计、渠道同步日志、退款证据和最近 `requestId/logid`。
4. 退款在本 Phase 仍以只读证据和字段一致性为目标，不新增前端退款写按钮，不编造后端退款接口。

## 3. 稳定契约

### 3.1 支付确认

- 前端 owner：`studio-workbench/src/shared/api/backendPaymentsApi.ts`
- 兼容 facade：`studio-workbench/src/shared/api/backend.ts`
- 已验证后端入口：`POST /yy/order/{id}/payment/confirm`
- 请求字段：
  - `id: BackendId`
  - `amountCent: number`
  - `remark: string`
- 返回字段：
  - 统一回到 `OrderDto`
- 权限：
  - `yy:order:edit`
- 幂等：
  - 后端控制器声明 `@RepeatSubmit`
- 账本：
  - `yy_order`
  - `yy_payment_record`
  - `yy_booking_slot_inventory`

### 3.2 排期库存

- 前端 owner：`studio-workbench/src/shared/api/backendInventoryApi.ts`
- 已验证后端入口：
  - `GET /yy/bookingSlotInventory/list`
  - `PUT /yy/bookingSlotInventory`
- 查询字段：
  - `bizDate`
  - `beginBizDate`
  - `endBizDate`
  - `storeId`
  - `serviceGroupId`
  - `conflictOnly`
- 更新字段：
  - `id`
  - `storeId`
  - `serviceGroupId`
  - `externalSkuId`
  - `bizDate`
  - `startTime`
  - `endTime`
  - `capacity`
  - `status`
  - `remark`
- 账本：
  - `yy_booking_slot_inventory`

### 3.3 审计与渠道证据

- 前端 owner：`studio-workbench/src/shared/api/backendAuditApi.ts`
- 已验证后端入口：
  - `GET /monitor/operlog/list`
  - `GET /yy/channelSyncLog/list`
- 返回字段：
  - `OperationLogDto`
  - `ChannelSyncLogDto`
- 用途：
  - 订单状态流转审计
  - 支付确认痕迹
  - 退款通知只读证据
  - 渠道 `requestId/logid` 回显
- 证据源：
  - `sys_oper_log`
  - `yy_channel_sync_log`

### 3.4 Phase 1 预备类型

- `PaymentRecordDto`
  - 依据已验证的 `YyPaymentRecordVo` 字段建立前端稳定类型
  - 本轮只做类型契约，不新增未验证查询接口
- `BookingInventoryListQuery`
- `OperationLogListQuery`
- `ChannelSyncLogListQuery`

## 4. 失败路径

- 支付确认失败：订单详情抽屉保持打开，错误文案直接使用后端返回，不触发假刷新。
- 库存加载失败：页面显示失败态，不用本地推断时段容量。
- 审计加载失败：订单仍可显示，但证据卡片只展示已知订单字段，不编造日志。
- 退款字段缺失：不生成退款时间线摘要；只有 `refundStatus/refundAmountCent/logid` 有证据时才展示。

## 5. 本轮不做

- 不新增前端退款申请、退款审核、退款回写。
- 不新增移动端支付能力。
- 不新增后端 controller/service/mapper。
- 不把支付、库存、审计逻辑重新塞回 `backend.ts` 以外的大文件。
