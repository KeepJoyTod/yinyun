# Studio JianYue P0 Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成门店工作台 P0 的预约订单、同步订单、首页经营概况、今日预约和门店页 UI/交互收口，让页面基于真实本地账本可实际使用。

**Architecture:** 继续以 `yy_order` 作为唯一订单账本，前端只读取本地后端 API，不直连抖音 OpenAPI。工作台层只做查询、聚合展示、状态流转、改期、导出和同步触发；只有现有接口无法承接时，才补最小聚合接口。

**Tech Stack:** Vue 3, TypeScript, Vite, Vue Router, Tailwind CSS, Vitest, Spring Boot, RuoYi-Vue-Plus, PostgreSQL, Redis.

---

> owner: studio-jianyue-p0-delivery-plan-20260616
> canonical_for: 门店工作台简约网口径 P0 剩余实现任务
> upstream: `docs/superpowers/specs/2026-06-16-studio-jianyue-p0-delivery-design.md`, `docs/studio-workbench-complete-delivery-plan-20260615.md`, `docs\yiyue\code_map.md`
> downstream: `docs/evidence/studio-jianyue-p0-delivery-*.md`, `docs\yiyue\studio-jianyue-p0-delivery-plan-20260616.md`

## 当前结论

这轮不是从零开始。当前仓库已经具备以下基础：

- `OrdersView.vue` 已有简约网式状态分组、同步订单入口、详情抽屉、改期、导出。
- `DashboardView.vue` 已有经营概况、服务订单状态、排行、渠道汇总、库存冲突提醒。
- `ScheduleView.vue` 已有预约工位块点击跳单、门店筛选、库存入口。
- `StoreView.vue` 已有四门店和 `DOUYIN_LIFE` 映射展示，但仍有死按钮和噪声 UI。
- `appStore.ts` 已有 `syncDouyinLifeOrdersAndRefresh()`、`loadDashboardStats()`、`loadSchedule()`、`loadAllOrders()` 等能力。

本轮剩余重点不是补新框架，而是收口以下缺口：

1. 同步订单后全量账本视图刷新不够彻底。
2. 首页快捷入口仍是空 URL 占位。
3. 门店页仍存在死按钮和无意义 CTA。
4. 部分空态/错误态文案还不统一。
5. 需要补齐验收证据和部署记录。

## 文件结构锁定

### 前端核心

- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\stores\appStore.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\api\backend.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\OrdersView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\orderOperations.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\dashboard\DashboardView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\schedule\ScheduleView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\stores\StoreView.vue`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\stores\storeDouyinBindings.ts`

### 关键测试

- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\stores\appStore.contract.test.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\api\backend.contract.test.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\OrdersView.contract.test.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\orderOperations.test.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\dashboard\DashboardView.contract.test.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\schedule\ScheduleView.contract.test.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\stores\StoreView.contract.test.ts`
- `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\stores\storeDouyinBindings.test.ts`

## Task 1: 收口同步订单后的刷新链路

**Files:**
- Modify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\stores\appStore.ts`
- Modify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\OrdersView.vue`
- Test: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\shared\stores\appStore.contract.test.ts`
- Test: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\OrdersView.contract.test.ts`

- [ ] **Step 1: 先补 failing contract，锁定“同步后必须刷新全量账本视图”**

Add assertions to `appStore.contract.test.ts`:

```ts
expect(appStoreSource).toContain('async syncDouyinLifeOrdersAndRefresh')
expect(appStoreSource).toContain('this.refreshCoreData()')
expect(appStoreSource).toContain('this.loadDashboardStats(refreshDate)')
expect(appStoreSource).toContain('this.loadSchedule(refreshDate)')
expect(appStoreSource).toContain('this.loadDouyinSyncHealth()')
expect(appStoreSource).toContain('this.loadChannelSyncLogs()')
expect(appStoreSource).toContain('if (input.refreshAllOrders)')
expect(appStoreSource).toContain('await this.loadAllOrders()')
```

Add assertions to `OrdersView.contract.test.ts`:

```ts
expect(ordersSource).toContain('syncDouyinLifeOrdersAndRefresh')
expect(ordersSource).toContain('refreshAllOrders: readQueryString(route.query.quick) === \'all\'')
expect(ordersSource).toContain('同步近24小时抖音来客订单')
```

- [ ] **Step 2: 运行测试，确认 RED**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/shared/stores/appStore.contract.test.ts src/features/orders/OrdersView.contract.test.ts
```

Expected: fail because `refreshAllOrders` is not wired yet.

- [ ] **Step 3: 在 store 中补最小刷新实现**

Update `appStore.ts`:

```ts
async syncDouyinLifeOrdersAndRefresh(
  input: DouyinLifeOrderSyncQuery & { refreshDate?: string; refreshAllOrders?: boolean } = {},
) {
  const refreshDate = input.refreshDate ?? todayKey()
  const result = await backendApi.syncDouyinLifeOrders(input)
  this.lastDouyinLifeOrderSync = {
    channelType: result.channelType,
    syncStatus: result.syncStatus,
    total: result.total,
    created: result.created,
    updated: result.updated,
    failed: result.failed,
    lastLogId: result.lastLogId,
    message: result.message,
  }

  await Promise.all([
    this.refreshCoreData(),
    this.loadDashboardStats(refreshDate),
    this.loadSchedule(refreshDate),
    this.loadDouyinSyncHealth(),
    this.loadChannelSyncLogs(),
  ])

  if (input.refreshAllOrders) {
    await this.loadAllOrders()
  }

  return this.lastDouyinLifeOrderSync
}
```

- [ ] **Step 4: 在订单页把 quick=all 视图纳入同步刷新**

Update `OrdersView.vue`:

```ts
await appStore.syncDouyinLifeOrdersAndRefresh({
  ...buildDouyinRecentSyncQuery(1),
  refreshDate: activeEndDate.value || todayKey,
  refreshAllOrders: readQueryString(route.query.quick) === 'all',
})
```

Keep the notice text stable:

```ts
notifyOrderAction(
  'success',
  `同步近24小时抖音来客订单完成：created ${result.created} · updated ${result.updated} · failed ${result.failed}`,
)
```

- [ ] **Step 5: 运行 GREEN**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/shared/stores/appStore.contract.test.ts src/features/orders/OrdersView.contract.test.ts
```

Expected: both files pass.

## Task 2: 把首页快捷入口从空占位改成真实入口

**Files:**
- Modify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\dashboard\DashboardView.vue`
- Test: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\dashboard\DashboardView.contract.test.ts`

- [ ] **Step 1: 先补 failing contract，锁定“快捷入口不能全为空 URL”**

Add assertions:

```ts
expect(dashboardSource).toContain('buildWorkbenchUrl')
expect(dashboardSource).toContain("key: 'booking'")
expect(dashboardSource).toContain("key: 'selection'")
expect(dashboardSource).toContain("key: 'pickup'")
expect(dashboardSource).toContain('/tools/booking-entry')
expect(dashboardSource).toContain('/tools/pickup-entry')
expect(dashboardSource).toContain('/service/selection')
```

- [ ] **Step 2: 运行测试，确认 RED**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/features/dashboard/DashboardView.contract.test.ts
```

Expected: fail because dashboard still uses empty string URLs.

- [ ] **Step 3: 实现真实入口 URL 生成**

Add helper in `DashboardView.vue`:

```ts
const buildWorkbenchUrl = (path: string, query?: Record<string, string | undefined>) => {
  const resolved = router.resolve({ path, query })
  if (typeof window === 'undefined') return resolved.href
  return new URL(resolved.href, window.location.origin).toString()
}
```

Replace `quickEntries` with:

```ts
const quickEntries = computed(() => {
  const primaryStoreId = appStore.stores[0]?.backendId
  return [
    {
      key: 'booking',
      label: '预约入口',
      url: primaryStoreId ? buildWorkbenchUrl('/tools/booking-entry', { storeId: primaryStoreId }) : '',
      hint: '客户小程序/H5 预约地址',
    },
    {
      key: 'selection',
      label: '选片入口',
      url: buildWorkbenchUrl('/service/selection'),
      hint: '客户在线选片工作台入口',
    },
    {
      key: 'pickup',
      label: '取片入口',
      url: primaryStoreId ? buildWorkbenchUrl('/tools/pickup-entry', { storeId: primaryStoreId }) : '',
      hint: '客户取片与查单地址',
    },
  ]
})
```

- [ ] **Step 4: 保留无门店时的真实空态**

Ensure the card fallback still exists:

```vue
<div v-else class="border border-dashed ...">
  点击进入对应工具页，按门店生成二维码或复制客户入口。
</div>
```

- [ ] **Step 5: 运行 GREEN**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/features/dashboard/DashboardView.contract.test.ts
```

Expected: contract passes.

## Task 3: 门店页去掉死按钮并把入口落到真实路由

**Files:**
- Modify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\stores\StoreView.vue`
- Test: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\stores\StoreView.contract.test.ts`

- [ ] **Step 1: 先补 failing contract，锁定门店卡片 CTA 必须可点击**

Add assertions:

```ts
expect(storeViewSource).toContain('useRouter')
expect(storeViewSource).toContain('const openStoreWorkbench = (store: StoreInfo)')
expect(storeViewSource).toContain("@click=\"openStoreWorkbench(store)\"")
expect(storeViewSource).toContain("path: '/order/appointment'")
expect(storeViewSource).toContain("statusTab: '待服务'")
```

- [ ] **Step 2: 运行测试，确认 RED**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/features/stores/StoreView.contract.test.ts
```

Expected: fail because the bottom CTA is currently not wired.

- [ ] **Step 3: 在门店页实现真实跳转函数**

Add router logic in `StoreView.vue`:

```ts
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const openStoreWorkbench = (store: StoreInfo) => {
  const hasPending = toCount(store.pendingOrders) > 0
  router.push({
    path: '/order/appointment',
    query: {
      quick: 'all',
      statusTab: hasPending ? '待服务' : 'all',
      store: store.name,
    },
  })
}
```

- [ ] **Step 4: 把底部按钮和顶部 CTA 都接到真实入口**

Update template:

```vue
<button
  class="p-4 border-t border-amber-topbar-border flex items-center justify-between group/btn hover:bg-amber-dark transition-all duration-300"
  type="button"
  @click="openStoreWorkbench(store)"
>
```

Update top-right button:

```vue
<button
  class="text-[11px] ..."
  type="button"
  @click="activeStoreFilter = 'all'"
>
  全部门店 <span class="text-[14px]">↗</span>
</button>
```

- [ ] **Step 5: 运行 GREEN**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/features/stores/StoreView.contract.test.ts src/features/stores/storeDouyinBindings.test.ts
```

Expected: store tests pass.

## Task 4: 统一首页/排期/订单页空态和错误态文案

**Files:**
- Modify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\OrdersView.vue`
- Modify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\dashboard\DashboardView.vue`
- Modify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\schedule\ScheduleView.vue`
- Test: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\OrdersView.contract.test.ts`
- Test: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\dashboard\DashboardView.contract.test.ts`
- Test: `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\schedule\ScheduleView.contract.test.ts`

- [ ] **Step 1: 补 contract，锁定统一文案方向**

Add assertions such as:

```ts
expect(ordersSource).toContain('当前统一订单库暂无可展示订单')
expect(dashboardSource).toContain('当前为订单聚合口径')
expect(scheduleSource).toContain('先确认待确认时段，再看已占用工位和剩余可接待能力')
```

- [ ] **Step 2: 运行测试，确认 RED**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
```

Expected: fail if wording is inconsistent or missing.

- [ ] **Step 3: 统一真实口径说明**

Keep or add the following patterns:

```ts
if (!orders.value.length) return '当前统一订单库暂无可展示订单；真实订单同步或小程序下单后会出现在这里。'
```

```vue
<p v-if="!financeOverview.hasBackendFinanceApi" class="...">
  金额基于订单行汇总，后端财务统计接口未接入。
</p>
```

```vue
<p class="...">
  先确认待确认时段，再看已占用工位和剩余可接待能力。
</p>
```

- [ ] **Step 4: 运行 GREEN**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
```

Expected: all selected contracts pass.

## Task 5: 回归验证、构建、浏览器 smoke、部署证据

**Files:**
- Create: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\studio-jianyue-p0-delivery-20260616.md`
- Copy: `docs\yiyue\studio-jianyue-p0-delivery-plan-20260616.md`

- [ ] **Step 1: 跑目标测试集**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run `
  src/shared/stores/appStore.contract.test.ts `
  src/features/orders/orderOperations.test.ts `
  src/features/orders/OrdersView.contract.test.ts `
  src/features/dashboard/DashboardView.contract.test.ts `
  src/features/schedule/ScheduleView.contract.test.ts `
  src/features/stores/StoreView.contract.test.ts `
  src/features/stores/storeDouyinBindings.test.ts `
  src/shared/api/backend.contract.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 2: 跑生产构建**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run build
```

Expected: `vue-tsc -b && vite build` passes.

- [ ] **Step 3: 浏览器 smoke**

Check:

```text
http://127.0.0.1:5190/dashboard/today
http://127.0.0.1:5190/order/appointment?quick=all
http://127.0.0.1:5190/merchant/store
http://127.0.0.1:5190/schedule
```

Expected:

```text
首页显示经营概况和服务订单状态，快捷入口 URL 可复制。
预约订单页显示同步订单、状态分组、真实空态/错误态文案。
门店页底部 CTA 可跳转到真实订单页。
排期页工位块可点，门店和日期筛选正常。
```

- [ ] **Step 4: 记录部署证据**

Record in evidence file:

```md
- git status 摘要
- 目标测试命令及结果
- build 命令及结果
- 浏览器 smoke 路由及结果
- 线上部署目录
- 备份目录
- 回滚路径
- 已知残余风险
```

## 非目标

- 不在本轮新增 `DOUYIN_MINI_APP` 支付闭环。
- 不在本轮重写后台财务子系统。
- 不在本轮重做整个工作台视觉系统。
- 不在本轮修改 `admin-ui` 的大范围路由和页面结构。

## 完成门槛

只有以下条件同时满足，才算这轮 P0 完成：

1. 同步订单后，首页、预约订单、今日预约能看到刷新结果。
2. 首页快捷入口不再是空 URL 占位。
3. 门店页不再存在主要死按钮。
4. 订单、首页、排期页空态/错误态文案统一且真实。
5. 目标测试集和构建通过。
6. 浏览器 smoke 和部署证据齐全。
