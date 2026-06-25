# 全产品完美复刻 Phase 2~4 域脚手架数据流

> owner: full-product-closed-loop-phase234-scaffold
> canonical_for: Phase 2~4 域注册、导航接线和兼容路径
> upstream: `docs/flows/full-product-closed-loop-flow.md`, `docs/flows/flow-template.md`
> downstream: Phase 2~4 真功能任务包

## 用户路径

1. 工作台用户从侧边栏进入 Phase 2 真功能域或 Phase 3/4 脚手架域。
2. 路由统一从 `featureRegistry.ts` 读取分组、状态、权限和目标组件。
3. 页面 owner 再从 `phase234ModuleScaffolds.ts` 查到模块阶段、控制层 owner 和真实账本边界。

## 三层总图

```mermaid
flowchart TD
  Staff["店员 / 店长 / 品牌管理员"] --> Sidebar["表现层\nSidebar / featureRegistry"]
  Sidebar --> View["表现层\nXxxView.vue / DerivedXxxView.vue / ModuleScaffoldView.vue"]
  View --> Registry["控制逻辑层\nphase234ModuleScaffolds.ts"]
  Registry --> Api["控制逻辑层\nbackend*Api / store / composable"]
  Api --> Ledger["持久数据层\nyy_member_* / yy_coupon_* / yy_work_order* / yy_photo_* / yy_report_snapshot"]
  Ledger --> Api
  Api --> View
  View --> Staff
```

## 样片入口兼容流

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant OldRoute as 旧路由 /tools/photo/sample
  participant NewRoute as 新路由 /tools/sample-works
  participant View as SampleWorksView
  participant Registry as phase234ModuleScaffolds

  Staff->>OldRoute: 打开旧收藏路径
  OldRoute->>NewRoute: redirect
  NewRoute->>View: 命中 tool-sample-works
  View->>Registry: 读取 Phase 3 owner / API / 账本边界
  Registry-->>View: 返回统一模块元数据
  View-->>Staff: 展示脚手架说明与下一 Phase
```

## 运行态三层 owner 展示

```mermaid
flowchart TD
  Config["控制逻辑层\nXxxScaffolds.ts"] --> Hook["控制逻辑层\nuseModuleScaffold"]
  Hook --> View["表现层\nModuleScaffoldView"]
  View --> Phase["页面展示\nPhase / ownerStatus"]
  View --> Layers["页面展示\n表现层 / 控制逻辑层 / 持久数据层 owner"]
  Layers --> Staff["店员 / 管理员确认模块边界"]
```

## 失败路径

```mermaid
flowchart TD
  Start["进入 Phase 2~4 域"] --> Guard["检查权限与 feature status"]
  Guard -->|无权限| Forbidden["跳转 /403"]
  Guard -->|building| Scaffold["显示骨架页与边界说明"]
  Guard -->|ready/derived/partial| Module["进入现有 owner 页面"]
  Module --> Empty["无数据时显示真实空态或兼容空态"]
  Scaffold --> Safe["不伪造业务结果，只展示 owner / API / 账本 / 下一阶段"]
```
