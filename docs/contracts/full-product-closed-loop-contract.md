# 全产品完美复刻闭环总契约

> owner: full-product-closed-loop-phase0
> canonical_for: 全产品脚手架、模块边界、跨端契约总纲
> upstream: `docs/architecture/three-layer-standard.md`, `docs/contracts/contract-template.md`
> downstream: Phase 0-4 各域子契约、feature owner、地图更新

## 1. 功能摘要

| 项 | 内容 |
| --- | --- |
| 功能名 | 全产品完美复刻脚手架 |
| 用户角色 | 客户端用户 / 店员 / 店长 / 品牌管理员 / 渠道平台 |
| 用户入口 | `mobile-uniapp` 客户端页面、`studio-workbench` 工作台页面、渠道回调 |
| 成功结果 | 先完成模块 owner、路由入口、文档契约、类型分层和兼容 facade；后续 Phase 再逐域补真实业务 |
| 失败结果 | Phase 0 只允许停留在占位页面或空态，不允许伪造资金、会员、营销、报表和渠道业务数据 |

## 2. 三层职责

| 层级 | Owner | 职责 |
| --- | --- | --- |
| 表现层 | `studio-workbench/src/features/**`, `mobile-uniapp/src/pages/**` | 展示菜单、入口、占位说明、空态、加载态、失败态 |
| 控制逻辑层-前端 | `studio-workbench/src/shared/api/**`, `studio-workbench/src/shared/stores/**`, `mobile-uniapp/src/domainRegistry.ts` | 统一路由、域注册、共享类型、兼容 facade、后续真实 API 落点 |
| 控制逻辑层-后端 | `backend/ruoyi-yy` 现有 controller/service/adapter 体系 | 保持真实账本与后续域拆分的一致落点 |
| 持久数据层 | `yy_order`、`yy_booking_slot_inventory`、会员资产、营销、通知、财务、审计账本 | Phase 0 只登记边界，不新增伪造数据写入 |

## 3. 前端模块契约

### `studio-workbench`

| 域 | 入口路由 | 当前 Phase 0 状态 |
| --- | --- | --- |
| 平台设置 | `/platform/*` | 生成独立 `XxxView.vue` 占位页，声明 owner、计划接口、计划账本 |
| 账号中心 | `/account/*` | 生成独立 `XxxView.vue` 占位页，登记个人中心、品牌切换、帮助中心 |
| 费用中心 | `/finance/*` | 生成独立 `XxxView.vue` 占位页，登记费用概览、收支明细 |
| 工具扩展 | `/tools/photo/sample`, `/tools/precision-delivery` | 生成独立占位页，后续承接样片作品、精准投放 |

### `mobile-uniapp`

| 域 | 主入口 | 当前 Phase 0 状态 |
| --- | --- | --- |
| home | `pages/home/index` | 已有正式页面，纳入域注册 |
| booking | `pages/store/list/index` | 已有正式页面，纳入域注册 |
| orders | `pages/customer/orders/index` | 已有正式页面，纳入域注册 |
| albums | `pages/pickup/albums/index` | 已有正式页面，纳入域注册 |
| member | `pages/my/index` | 已有正式页面，纳入域注册 |
| coupons | `pages/coupons/index` | Phase 0 新增占位页 |
| profile | `pages/profile/index` | Phase 0 新增占位页 |

## 4. 共享类型契约

Phase 0 要求把工作台共享类型按域拆出：

- `backendTypesPlatform.ts`
- `backendTypesAccount.ts`
- `backendTypesFinance.ts`

这些类型文件只定义稳定 DTO/Query/Payload/状态枚举，不承载 UI 逻辑，不在页面里内联临时结构。

## 5. 核心边界

- `yy_order` 继续作为订单/预约主账本。
- `yy_booking_slot_inventory` 继续作为真实排期库存账本。
- 会员、营销、通知、财务、审计等真实读写在 Phase 0 不落伪数据，只登记目标账本和接口边界。
- `admin-ui` 只作为迁移参考，不再新增 owner。
- 当前缺失 `docs\yiyue\jianyue_benchmark_map.md`，Phase 0 先在 `optimization_map.md` 登记替代说明。

## 6. Phase 0 验收命令

```powershell
npm --prefix studio-workbench run check:file-size
npm --prefix studio-workbench run test -- src/app/router/featureRegistry.contract.test.ts src/app/router/featureRegistry.access.test.ts src/shared/api/backend.contract.test.ts src/features/platform-settings/PlatformSettingsScaffold.contract.test.ts src/features/account-center/AccountCenterScaffold.contract.test.ts src/features/finance-center/FinanceCenterScaffold.contract.test.ts
npm --prefix studio-workbench run build
node --test mobile-uniapp/tests/domain-registry-contract.test.cjs
```
## 2026-06-24 Platform Settings Phase 1

- `/platform/integration`, `/platform/notification-center`, `/platform/service-packages` now use a read-only Phase 1 full-stack scaffold.
- Frontend owner: `studio-workbench/src/features/platform-settings/*`, `backendPlatformApi.ts`, `backendTypesPlatform.ts`.
- Backend facade: `GET /yy/platform-settings/integrations`, `GET /yy/platform-settings/notifications`, `GET /yy/platform-settings/service-packages`.
- Data ledgers reused: `yy_channel_account`, `yy_channel_sync_log`, `yy_channel_event_inbox`, `yy_notification_template`, `yy_notification_log`, `yy_service_license_binding`.
- Boundary: no real payment, no renewal write, no channel inventory write, no webhook subscription creation in this phase.
