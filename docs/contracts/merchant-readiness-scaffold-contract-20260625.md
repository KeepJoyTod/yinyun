# 商家 readiness 脚手架契约

更新时间：2026-06-25

## 范围

- 本契约只覆盖 `merchant` 分组和直接依赖：商户、门店/服务组/时段库存、装修/微页面/微表单、抖音/美团/活动/表单承接、订单/商品/服务/内部协作等 readiness 入口。
- 不扩展到平台设置、账号中心、费用中心的真实写链路。
- 本次只新增只读脚手架和模块契约，不新增数据库表，不执行迁移，不调用抖音/美团真实写接口。

## 三层 owner

### 表现层

- `studio-workbench/src/features/merchant/modules/readiness/MerchantReadinessView.vue`
- `studio-workbench/src/features/merchant/modules/readiness/components/MerchantReadinessBoard.vue`
- `studio-workbench/src/features/merchant/merchantChrome.ts`
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`

### 控制逻辑层

- `studio-workbench/src/features/merchant/modules/readiness/composables/useMerchantReadinessState.ts`
- `studio-workbench/src/features/merchant/modules/readiness/merchantReadinessOperations.ts`
- `studio-workbench/src/shared/api/backendMerchantReadinessApi.ts`
- `studio-workbench/src/shared/api/backendTypesMerchant.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMerchantReadinessController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyMerchantReadinessService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMerchantReadinessServiceImpl.java`

### 持久数据层

- 本次不新增表、不写表。
- 真实边界继续沿用 `yy_order` 作为唯一订单/预约账本，`yy_booking_slot_inventory` 作为真实时段容量账本。
- 当前 readiness 数据来自产品清单和模块 owner 契约；缺真实表或真实状态源时返回 `BLOCKED` / `PARTIAL` / `BUILDING`，不伪造业务完成状态。

## 接口

统一只读接口：

- `GET /yy/merchant/readiness/summary`
- `GET /yy/merchant/readiness/schedule`
- `GET /yy/merchant/readiness/channels`
- `GET /yy/merchant/readiness/governance`
- `GET /yy/merchant/readiness/dependencies`

统一响应字段：

- `moduleKey`
- `moduleName`
- `status`: `READY | PARTIAL | BUILDING | BLOCKED | NOT_STARTED`
- `priority`: `P0 | P1 | P2`
- `sourceItems`
- `blockers`
- `nextActions`
- `evidenceRefs`

## 权限

- `summary`：`yy:store:list`
- `schedule`：`yy:bookingInventory:list`
- `channels`：`yy:store:list`
- `governance`：`yy:store:list`
- `dependencies`：`yy:store:list`

## 模块映射

| moduleKey | owner | priority | sourceItems |
| --- | --- | --- | --- |
| `schedule-governance` | `merchant/modules/schedule-governance` 后续 owner | P0 | `B-016`, `B-017`, `X-013` |
| `channel-readiness` | `merchant/modules/channel-readiness` 后续 owner | P1 | `B-026`, `B-027`, `B-045`, `B-046` |
| `governance` | `merchant/modules/governance` 后续 owner | P0 | `P-003`, `P-004`, `P-005`, `P-006` |
| `dependency-readiness` | `merchant/modules/dependency-readiness` 后续 owner | P1 | `X-001`, `X-002`, `X-003`, `X-004`, `B-068`, `B-069`, `R-014`, `R-015` |

## 边界

- readiness 页面可以展示状态、证据、阻塞原因和下一步动作。
- readiness 页面不直接发起审批、退款、提现、渠道核销、库存写入或导出任务。
- 后续真实闭环必须按独立任务包补接口契约、权限、审计、回滚和 smoke 证据。
