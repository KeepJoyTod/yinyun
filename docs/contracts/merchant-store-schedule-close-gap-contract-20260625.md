# 商户后台门店与档期闭环契约 2026-06-25

## 1. 摘要

| 项 | 内容 |
| --- | --- |
| 功能 | `B-011` 订单属性配置、`B-013` 横向/纵向服务模式、`B-016` 节假日/临时关档审批自动应用 |
| 角色 | 店长、店员、审批人、系统 |
| 入口 | `/stores`、`/merchant/order-attributes`、`/merchant/service-groups`、`/merchant/schedule-governance`、`/merchant/governance` |
| 成功结果 | 模板落库、服务模式显式化、付费关档审批通过后自动应用库存 |
| 失败结果 | 前端显示校验/审批/库存冲突信息，不做隐式兜底写入 |

## 2. 三层职责

| 层级 | Owner | 职责 |
| --- | --- | --- |
| 表现层 | `studio-workbench/src/features/merchant/OrderAttributesView.vue` | 门店订单属性模板 CRUD |
| 表现层 | `studio-workbench/src/features/orders/StaffBookingModal.vue`、`OrderAttributeOrderSection.vue` | 录单与订单详情动态字段渲染、保存 |
| 表现层 | `studio-workbench/src/features/merchant/modules/schedule-governance/MerchantScheduleGovernanceView.vue` | 关档预览、提交、审批回跳回填 |
| 表现层 | `studio-workbench/src/features/merchant/modules/governance/MerchantGovernanceView.vue` | 审批列表、范围摘要、deeplink |
| 控制逻辑层 | `backendOrderAttributeApi.ts`、`backendRiskApprovalApi.ts`、`orderSlotOperations.ts` | 模板接口、审批接口、`VERTICAL` 冲突规则 |
| 控制逻辑层 | `YyOrderServiceImpl`、`YyServiceGroupServiceImpl`、`YyScheduleGovernanceServiceImpl`、`YyRiskApprovalServiceImpl` | 快照保存、服务模式校验、关档审批与自动应用 |
| 持久数据层 | `yy_order_attribute_template`、`yy_order`、`yy_service_group`、`yy_schedule_exception_rule`、`yy_risk_approval` | 模板、订单快照、服务模式、例外规则、审批账本 |

## 3. 请求/响应契约

### 订单属性模板

- `GET /yy/orderAttributeTemplate/list?storeId=<yy_store.id>`
- `POST /yy/orderAttributeTemplate`
- `PUT /yy/orderAttributeTemplate`
- `DELETE /yy/orderAttributeTemplate/{id}`

请求字段：
- `storeId`
- `fieldCode`
- `fieldLabel`
- `fieldType=TEXT|TEXTAREA|PHONE|DATE|NUMBER|SELECT|CHECKBOX`
- `required`
- `optionsJson`
- `sort`
- `status`
- `remark`

### 录单 / 订单详情

- `POST /yy/order/staff-booking`
- `PUT /yy/order`

新增字段：

```ts
type OrderAttributeValuePayload = {
  fieldCode: string
  fieldLabel: string
  fieldType: 'TEXT' | 'TEXTAREA' | 'PHONE' | 'DATE' | 'NUMBER' | 'SELECT' | 'CHECKBOX'
  required: boolean
  options: string[]
  sort: number
  value: string | string[] | null
}
```

规则：
- 录单和订单详情都写 `orderAttributes`
- 后端统一回写 `yy_order.order_attribute_json`
- 历史订单回显使用“订单快照 + 最新模板补齐未填字段”

### 服务模式

- `yy_service_group.service_mode`
- 允许值：`HORIZONTAL | VERTICAL`

规则：
- `HORIZONTAL`：沿用现有目标时段容量判断
- `VERTICAL`：录单、改期必须做同服务组整段重叠阻塞

### 关档审批

- `POST /yy/bookingSlotInventory/governance/preview`
- `POST /yy/bookingSlotInventory/governance/apply`
- `GET /yy/riskApproval/list`
- `POST /yy/riskApproval/{id}/approve`
- `POST /yy/riskApproval/{id}/reject`

状态机：

| 对象 | 状态 |
| --- | --- |
| `yy_schedule_exception_rule` | `PENDING_APPROVAL -> ACTIVE` 或 `PENDING_APPROVAL -> REJECTED` |
| `yy_risk_approval` | `PENDING -> APPROVED` 或 `PENDING -> REJECTED` |

审批通过：
- `approval.businessType = SLOT_CLOSE_WITH_PAID_ORDER`
- 事务内激活规则
- 对命中库存执行 `CLOSE / REOPEN / CAPACITY_OVERRIDE`
- `resultSummary` 回写“已自动应用 N 个时段”

审批驳回：
- 规则改 `REJECTED`
- 不改库存

## 4. 读写表

| 表 | 操作 | 字段 |
| --- | --- | --- |
| `yy_order_attribute_template` | READ/WRITE | `store_id`、`field_code`、`field_type`、`options_json` |
| `yy_order` | READ/WRITE | `order_attribute_json` |
| `yy_service_group` | READ/WRITE | `service_mode` |
| `yy_schedule_exception_rule` | READ/WRITE | `status`、`approval_id`、时间范围、动作 |
| `yy_risk_approval` | READ/WRITE | `business_type`、`payload_json`、`status`、`result_summary` |
| `yy_booking_slot_inventory` | READ/WRITE | `status`、`capacity`、`remark` |

## 5. 边界

- 不改 `mobile-uniapp/**`
- 不接抖音/美团真实写接口
- 不做真实支付/退款出款
- `B-093/B-094` 留到后续消费者端/资源链路包
