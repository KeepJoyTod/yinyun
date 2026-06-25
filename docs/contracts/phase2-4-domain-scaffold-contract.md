# 全产品完美复刻 Phase 2~4 域脚手架契约

> owner: full-product-closed-loop-phase234-scaffold
> canonical_for: Phase 2~4 域 owner、统一模块注册、导航分组和兼容路由
> upstream: `docs/contracts/full-product-closed-loop-contract.md`, `docs/architecture/three-layer-standard.md`
> downstream: `studio-workbench/src/features/system/phase234ModuleScaffolds.ts`, `docs/yiyue/*.md`

## 1. 任务包边界

| 项 | 内容 |
| --- | --- |
| 目标 | 先把 Phase 2~4 域的 owner、导航、契约与兼容路径收口到统一 registry，不在本轮伪造新业务数据 |
| 允许修改 | `studio-workbench/src/app/router/**`、`studio-workbench/src/features/**Scaffolds.ts`、`studio-workbench/src/features/system/**`、`docs/contracts/**`、`docs/flows/**`、`docs/yiyue/**` |
| 禁止修改 | `admin-ui/**`、无关后端写链路、抖音/香港2 真实外部验收脚本 |
| 兼容要求 | 历史 facade 保持兼容；旧样片路径保留兼容跳转，不删除旧引用入口 |

## 2. 用户路径

1. 店员/店长进入工作台侧边栏，可直接看到 `平台设置 / 账号中心 / 费用中心` 一级组，不再只有隐藏路由。
2. 运营、会员、营销、资源、报表、服务生产和内部协作域继续按现有 owner 页面进入，但其阶段、控制层和持久层边界统一登记到 Phase 2~4 registry。
3. 旧样片地址 `/tools/photo/sample` 继续可访问，但只负责跳转到正式入口 `/tools/sample-works`。

## 3. 三层契约

| 层级 | 本轮 owner |
| --- | --- |
| 表现层 | `studio-workbench/src/features/**Scaffolds.ts`、各域 `XxxView.vue`、`Sidebar.vue` |
| 控制逻辑层 | `featureRegistry.ts`、`phaseModuleRegistry.ts`、`phase234ModuleScaffolds.ts`、各域 API module |
| 持久数据层 | 只登记真实账本边界：`yy_member_*`、`yy_coupon_*`、`yy_campaign_*`、`yy_work_order*`、`yy_photo_*`、`yy_report_snapshot`、`yy_service_license_binding` 等 |

## 4. 阶段归属

### Phase 2

- 会员：`member-customers`、`member-accounts`、`member-tags`、`member-consumption`
- 营销：`marketing-center`、`marketing-coupons`、`marketing-campaigns`、`marketing-participations`
- 资源：`resource-manage`、`resource-tags`、`resource-usage`
- 报表：`report-*`
- 服务生产：`service-selection`、`service-photos`、`service-retouch-center`、`service-retouch-providers`
- 内部协作履约：`collaboration-overview`、`collaboration-work-orders`、`collaboration-export`、`collaboration-statistics`

### Phase 3

- 工具脚手架：`tool-sample-works`、`tool-precision-delivery`
- 平台设置：`platform-brand-info`、`platform-integration`、`platform-booking-policy`、`platform-print-settings`、`platform-score-settings`、`platform-email-settings`、`platform-notification-center`
- 账号中心：`account-profile`、`account-brands`、`account-help`
- 费用中心：`finance-overview`、`finance-transactions`

### Phase 4

- 平台治理：`platform-service-packages`
- 协作治理：`collaboration-positions`、`collaboration-product-settings`、`collaboration-retouch-center-settings`、`collaboration-common-settings`、`collaboration-open-settings`

## 5. 兼容规则

- `backendApi`、`appStore`、历史 facade 继续保留兼容外观。
- 旧样片地址 `/tools/photo/sample` 不直接承载新 owner，只做跳转。
- `DerivedMemberModuleView.vue`、`DerivedReportModuleView.vue`、`DerivedResourceModuleView.vue` 继续保留，但其 owner 信息改由统一 registry 描述。

## 6. 验收命令

```powershell
npm --prefix studio-workbench run check:file-size
npm --prefix studio-workbench run test -- src/features/system/Phase234Scaffolds.contract.test.ts src/app/router/featureRegistry.contract.test.ts src/app/router/featureRegistry.access.test.ts src/features/resources/DerivedResourceModuleView.contract.test.ts
npm --prefix studio-workbench run build
```

## 7. 下一步运行态脚手架

- `ModuleScaffoldView.vue` 必须展示当前 `phase`，不再固定为 `Phase 0 Scaffold`。
- `ModuleScaffoldConfig` 必须允许登记 `ownerStatus` 和 `ownerLayers`。
- `ownerLayers` 固定拆为 `presentation / control / data`，分别对应表现层、控制逻辑层和持久数据层。
- Phase 3/4 建设态页面必须从自身 scaffold config 传入三层 owner，后续接真实接口时不得只改页面文案。
- 工具中心必须有独立 `backendToolsApi.ts` 和 `backendTypesTools.ts`，样片作品、精准投放不得继续只写裸字符串接口名。
