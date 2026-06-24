# Studio Workbench P0 Correctness Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复门店工作台雪花 ID、订单查询范围、页面数据加载和创建结果一致性问题。

**Architecture:** 在 API 边界统一字符串 ID；将今日订单和范围订单分开加载；由页面按领域确保数据可用；写操作后使用服务端返回或重新加载的权威记录。保持现有 Vue reactive store 和页面视觉不变。

**Tech Stack:** Vue 3、TypeScript、Vitest、Vite、Spring Boot/RuoYi API。

---

### Task 1: 统一后端业务 ID

**Files:**
- Create: `studio-workbench/src/shared/api/backendId.ts`
- Create: `studio-workbench/src/shared/api/backendId.test.ts`
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Modify: `studio-workbench/src/shared/api/backend.contract.test.ts`

- [x] 写失败测试，断言 `normalizeBackendId('2063173289800183809')` 原样返回，数字和空值按契约归一化。
- [x] 运行 `npm test -- src/shared/api/backendId.test.ts`，确认因模块或函数不存在失败。
- [x] 实现 `BackendId`、`normalizeBackendId`、`optionalBackendId`。
- [x] 将 API DTO、payload、mapper 和 store 业务主键改为字符串 ID。
- [x] 运行 ID 单测、API/store 契约测试与 `npm run build`。

### Task 2: 分离今日订单与范围订单

**Files:**
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/api/backend.contract.test.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.contract.test.ts`

- [x] 写失败测试，断言同时存在 `listTodayOrders()` 和接受显式查询的 `listOrders(query)`。
- [x] 运行相关测试并确认旧实现只提供固定今日查询。
- [x] 新增 `OrderListQuery`，保留今日查询构造器，范围查询不隐式追加今日日期。
- [x] `refreshCoreData()` 仅加载今日订单；新增独立 `reportOrders` 与月份范围加载。
- [x] 运行 API/store 测试与构建。

### Task 3: 补齐会员和报表数据生命周期

**Files:**
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.contract.test.ts`
- Modify: `studio-workbench/src/features/member/DerivedMemberModuleView.vue`
- Modify: `studio-workbench/src/features/member/DerivedMemberModuleView.contract.test.ts`
- Modify: `studio-workbench/src/features/reports/DerivedReportModuleView.vue`
- Modify: `studio-workbench/src/features/reports/DerivedReportModuleView.contract.test.ts`

- [x] 写失败契约测试，要求派生会员和报表页面在挂载及模块切换时调用领域加载器。
- [x] 运行测试，确认当前页面没有 `onMounted` 和 ensure loader。
- [x] 实现幂等的客户、员工和报表数据加载方法。
- [x] 页面挂载与模块变化时加载正确数据，展示现有加载/错误边界。
- [x] 运行派生页面、store 测试与构建。

### Task 4: 移除正式创建流程中的伪造 ID

**Files:**
- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/api/backend.contract.test.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.contract.test.ts`

- [x] 写失败测试，禁止正式 API 创建方法使用 `Date.now()` 合成 DTO。
- [x] 运行测试，确认服务组、员工、客户、通知模板、订单和产品创建方法失败。
- [x] 创建接口读取响应 DTO；无 DTO 时重新加载对应列表。
- [x] 演示模式临时 ID 改为显式 `demo-*` 字符串。
- [x] 运行完整 `npm test` 和 `npm run build`。

### Task 5: 回归与文档

**Files:**
- Modify: `docs/studio-workbench-code-map-20260610.md`
- Modify: `docs/studio-workbench-optimization-map-20260610.md`

- [x] 更新 ID、订单范围和数据生命周期地图。
- [x] 运行 `npm test`。
- [x] 运行 `npm run build`。
- [x] 检查 `git diff --check` 和 `git status --short`。
- [x] 使用浏览器验证订单、会员、报表和客片路由。
