# Studio Interaction Refactor Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把门店工作台从“页面和接口基本有了”推进到“交互契约清晰、点进去都有去处、图表简洁、数据口径可信”的可日常使用状态。

**Architecture:** 继续使用 Vue 3 + TypeScript + Vite + Tailwind + ECharts，不换技术栈。通过新增少量共享交互组件、路由协调器和业务聚合函数，拆薄 `DashboardView.vue` / `OrdersView.vue` / `ScheduleView.vue`，并把简约网式日期条、横向滚轮、时段明细、产品环图排名和真实数据同步纳入统一契约。

**Tech Stack:** Vue 3, TypeScript, Vue Router, Vite, Tailwind CSS, Vitest, vue-echarts/ECharts, Spring Boot, RuoYi-Vue-Plus, PostgreSQL.

---

> owner: studio-interaction-refactor-20260616  
> canonical_for: 首页、今日预约、预约订单、门店页的交互协调和大文件重构  
> reference: 简约网 `brand.yuyue123.cn` 首页/预约概况/产品分析/时段明细截图  
> current_release: `prod-eb044ca-studio-jianyue-ui-20260616`

## 0. 当前判断

### 0.1 之前做的一大堆逻辑是否 OK

结论：**底层方向是 OK 的，但交互层和数据落地还没达标。**

已经 OK 的部分：

- 前端已经接真实 API 模式，不是纯 demo。
- `store-admin` 生产登录和 `/yy/studio/bootstrap` 能成功。
- 近一个月 `DOUYIN_LIFE` 订单可拉到 `1003` 条。
- 门店映射已经不是旧的单默认门店，订单样本能落到真实店：`900000000000000200 = 1001`、`900000000000000300 = 2`。
- 首页、订单、今日预约已经有初步页面和路由跳转。
- `JianyueSlotGrid` 已有上午/下午/晚上、容量、满员角标的基础组件。

没有达标的部分：

- 今日 `yy_booking_slot_inventory` 生产返回 `0` 个时段，简约网式时间槽没有真实库存支撑。
- 1003 条 `DOUYIN_LIFE` 订单状态样本仍全是 `PENDING`，待服务/服务中/已完成的真实推进还缺后端状态映射和回填。
- 页面横向区域只是原生 `overflow-x-auto`，没有“鼠标滚轮横滑”的统一体验。
- 点日期、点时段、点图表、点排行、点按钮的目标不完全统一，部分行为还是“跳大列表”而不是“进入该对象明细”。
- 首页产品分析没有做到简约网那种“环图 + 排名表 + 可点筛选”的清晰结构。
- `DashboardView.vue`、`OrdersView.vue` 继续变大，后面继续堆会越来越难改。

### 0.2 这轮为什么要先重构

这轮不是为了“好看”，是为了补交互骨架：

- 后面接更多真实数据时，页面不能继续一边加逻辑一边加 UI。
- 所有可点击区域必须有统一规则，才能让国产模型或子任务可靠填代码。
- 大文件需要拆成“组件 + 操作函数 + 路由协调器 + 聚合函数”，否则每次修一个交互都会误伤别的页面。

## 1. 目标交互契约

### 1.1 横向滚轮契约

所有横向内容区域统一支持：

- 鼠标滚轮 `deltaY` 转为横向滚动。
- `Shift + wheel` 保持浏览器默认横向意图。
- 只有容器确实横向溢出时才拦截。
- 垂直页面滚动不被误吞。
- 键盘方向键保留浏览器默认聚焦行为。

适用区域：

- 首页/今日预约日期条。
- 预约订单列表横向表格。
- 时段明细表格。
- 门店/商品过宽诊断表格。

### 1.2 日期条契约

日期条统一为 `JianyueDateStrip`：

- 左右箭头切一天或切一组。
- 鼠标滚轮横滑。
- 点击日期会更新 URL query。
- 今天高亮，选中日期高亮。
- 日期不足一屏时不展示横向滚动条。
- 在 `/dashboard/today` 和 `/schedule` 共用。

### 1.3 时段卡片契约

点击时段卡片后：

- 有订单：进入“时段明细抽屉/区域”，展示该时段订单，不只跳一个订单。
- 只有一个订单：可直接打开订单详情。
- 无订单但有库存：进入库存编辑入口。
- 无库存无订单：显示“可配置库存/预约入口”的明确动作。

时段明细需要有：

- 返回。
- 时间和日期。
- 订单数、工位占用。
- 编辑容量。
- 当期状态开关。
- 表格列：客户、下单来源、产品、状态、下单时间/到店时间。

### 1.4 首页产品分析契约

产品分析统一为 `ProductDonutRanking`：

- 左侧环图，中心显示总数。
- 右侧排名表：颜色点、产品名、预约量/下单量。
- 点击环图分片或排名行，跳到 `/order/appointment` 并带 `aservice`、日期、渠道等 query。
- 数据为空时展示业务空态，不展示空图。
- 颜色使用固定 5 色，不再随机或过度装饰。

### 1.5 路由协调契约

所有工作台跳转通过 `studioNavigation.ts`：

- `goOrdersByDate`
- `goOrdersByService`
- `goOrdersBySource`
- `goOrdersBySlot`
- `goInventoryBySlot`
- `goStoreOrders`
- `goShareLinkTool`

目标：页面模板不再到处手写 `router.push({ path, query })`。

## 2. 文件结构

### 2.1 新增共享组件/组合函数

- Create: `studio-workbench/src/shared/composables/useHorizontalWheel.ts`
  - 横向滚轮逻辑，只处理 DOM 交互，不知道业务。

- Create: `studio-workbench/src/shared/components/navigation/JianyueDateStrip.vue`
  - 日期条组件，支持滚轮横滑、箭头、选中态。

- Create: `studio-workbench/src/shared/components/dashboard/ProductDonutRanking.vue`
  - 简约网式环图 + 排名表。

- Create: `studio-workbench/src/shared/components/schedule/SlotDetailPanel.vue`
  - 时段明细区/抽屉，支持返回、编辑、开关、订单表格。

- Create: `studio-workbench/src/shared/navigation/studioNavigation.ts`
  - 工作台统一路由 query 构造。

### 2.2 新增业务聚合函数

- Create: `studio-workbench/src/features/dashboard/dashboardInsights.ts`
  - 经营概况、产品分布、渠道分布、日期范围统计。

- Create: `studio-workbench/src/features/schedule/slotDetailOperations.ts`
  - 从订单 + 库存构建时段明细模型。

- Modify: `studio-workbench/src/features/schedule/scheduleOperations.ts`
  - 保留 `buildJianyueSlotGroups`，补充能支撑明细 panel 的 slot id/order ids。

### 2.3 页面改造

- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
  - 替换手写产品排行和日期逻辑，接入 `ProductDonutRanking` / `JianyueDateStrip` / `studioNavigation`。

- Modify: `studio-workbench/src/features/schedule/ScheduleView.vue`
  - 替换日期条，接入时段明细 panel，统一滚轮横滑。

- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
  - 表格横向容器接 `useHorizontalWheel`，状态 tab/query 通过 `studioNavigation` 统一。

- Modify: `studio-workbench/src/features/stores/StoreView.vue`
  - 门店卡动作改走 `studioNavigation`，折叠诊断表格接横向滚轮。

## 3. 任务拆分

### Task 1: 横向滚轮基础能力

**Files:**

- Create: `studio-workbench/src/shared/composables/useHorizontalWheel.ts`
- Test: `studio-workbench/src/shared/composables/useHorizontalWheel.test.ts`
- Modify: `studio-workbench/src/features/orders/OrdersView.vue`
- Modify: `studio-workbench/src/features/schedule/ScheduleView.vue`

- [ ] **Step 1: 写失败测试**

```ts
import { describe, expect, it, vi } from 'vitest'
import { shouldHandleHorizontalWheel } from './useHorizontalWheel'

describe('shouldHandleHorizontalWheel', () => {
  it('handles vertical wheel when element can scroll horizontally', () => {
    expect(shouldHandleHorizontalWheel({
      deltaY: 120,
      deltaX: 0,
      shiftKey: false,
      scrollWidth: 1000,
      clientWidth: 600,
    })).toBe(true)
  })

  it('does not handle when there is no horizontal overflow', () => {
    expect(shouldHandleHorizontalWheel({
      deltaY: 120,
      deltaX: 0,
      shiftKey: false,
      scrollWidth: 600,
      clientWidth: 600,
    })).toBe(false)
  })

  it('does not override shift wheel', () => {
    expect(shouldHandleHorizontalWheel({
      deltaY: 120,
      deltaX: 0,
      shiftKey: true,
      scrollWidth: 1000,
      clientWidth: 600,
    })).toBe(false)
  })
})
```

- [ ] **Step 2: 实现组合函数**

```ts
import { onBeforeUnmount, onMounted, type Ref } from 'vue'

export type HorizontalWheelInput = {
  deltaY: number
  deltaX: number
  shiftKey: boolean
  scrollWidth: number
  clientWidth: number
}

export const shouldHandleHorizontalWheel = (input: HorizontalWheelInput) =>
  Math.abs(input.deltaY) > Math.abs(input.deltaX)
  && !input.shiftKey
  && input.scrollWidth > input.clientWidth + 1

export const useHorizontalWheel = (target: Ref<HTMLElement | null>) => {
  const onWheel = (event: WheelEvent) => {
    const el = target.value
    if (!el) return
    if (!shouldHandleHorizontalWheel({
      deltaY: event.deltaY,
      deltaX: event.deltaX,
      shiftKey: event.shiftKey,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    })) return
    event.preventDefault()
    el.scrollLeft += event.deltaY
  }

  onMounted(() => target.value?.addEventListener('wheel', onWheel, { passive: false }))
  onBeforeUnmount(() => target.value?.removeEventListener('wheel', onWheel))
}
```

- [ ] **Step 3: 接入订单表格和排期日期条**

OrdersView:

```vue
<div ref="ordersTableScrollRef" class="flex-1 overflow-x-auto bg-amber-content-bg">
```

```ts
import { useHorizontalWheel } from '../../shared/composables/useHorizontalWheel'

const ordersTableScrollRef = ref<HTMLElement | null>(null)
useHorizontalWheel(ordersTableScrollRef)
```

ScheduleView:

```vue
<div ref="dateStripScrollRef" class="px-7 py-3 ... overflow-x-auto">
```

```ts
const dateStripScrollRef = ref<HTMLElement | null>(null)
useHorizontalWheel(dateStripScrollRef)
```

- [ ] **Step 4: 验证**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/shared/composables/useHorizontalWheel.test.ts src/features/orders/OrdersView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
```

Expected: tests pass.

### Task 2: 统一日期条组件

**Files:**

- Create: `studio-workbench/src/shared/components/navigation/JianyueDateStrip.vue`
- Test: `studio-workbench/src/shared/components/navigation/JianyueDateStrip.contract.test.ts`
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify: `studio-workbench/src/features/schedule/ScheduleView.vue`

- [ ] **Step 1: 定义组件契约**

Props:

```ts
type DateStripItem = {
  date: string
  shortLabel: string
  dateLabel: string
  active: boolean
  today: boolean
}
```

Emits:

```ts
defineEmits<{
  select: [date: string]
  shift: [days: number]
}>()
```

- [ ] **Step 2: 模板实现**

```vue
<template>
  <div ref="scrollRef" class="jianyue-date-strip flex items-center gap-2 overflow-x-auto border-b border-amber-topbar-border bg-amber-content-bg px-7 py-3">
    <button class="yy-action h-10 w-10 shrink-0 rounded-md border border-amber-topbar-border bg-[#FBF8F2] text-[16px] text-amber-text-muted hover:bg-white" type="button" aria-label="前一天" @click="$emit('shift', -1)">‹</button>
    <button
      v-for="item in items"
      :key="item.date"
      class="yy-action min-w-[128px] rounded-md border px-4 py-2 text-left transition-colors"
      :class="item.active ? 'border-amber-accent bg-white text-amber-accent' : item.today ? 'border-amber-accent/35 bg-[#FFF8F1] text-amber-dark' : 'border-transparent text-amber-text-muted hover:border-amber-topbar-border hover:bg-white'"
      type="button"
      @click="$emit('select', item.date)"
    >
      <span class="block text-[12px] font-sans font-semibold">{{ item.shortLabel }}</span>
      <span class="mt-0.5 block text-[11px] font-mono">{{ item.dateLabel }}</span>
    </button>
    <button class="yy-action h-10 w-10 shrink-0 rounded-md border border-amber-topbar-border bg-[#FBF8F2] text-[16px] text-amber-text-muted hover:bg-white" type="button" aria-label="后一天" @click="$emit('shift', 1)">›</button>
  </div>
</template>
```

- [ ] **Step 3: 接入滚轮**

```ts
import { ref } from 'vue'
import { useHorizontalWheel } from '../../composables/useHorizontalWheel'

const scrollRef = ref<HTMLElement | null>(null)
useHorizontalWheel(scrollRef)
```

- [ ] **Step 4: 页面替换**

ScheduleView:

```vue
<JianyueDateStrip
  :items="scheduleDateTabs"
  @select="selectScheduleDate"
  @shift="shiftScheduleDate"
/>
```

DashboardView:

```vue
<JianyueDateStrip
  :items="dashboardDateTabs"
  @select="selectDashboardDate"
  @shift="shiftDashboardDate"
/>
```

- [ ] **Step 5: 验证**

```powershell
npm test -- --run src/shared/components/navigation/JianyueDateStrip.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
```

Expected: tests pass.

### Task 3: 时段明细 Drilldown

**Files:**

- Create: `studio-workbench/src/features/schedule/slotDetailOperations.ts`
- Create: `studio-workbench/src/features/schedule/slotDetailOperations.test.ts`
- Create: `studio-workbench/src/shared/components/schedule/SlotDetailPanel.vue`
- Test: `studio-workbench/src/shared/components/schedule/SlotDetailPanel.contract.test.ts`
- Modify: `studio-workbench/src/features/schedule/ScheduleView.vue`
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`

- [ ] **Step 1: 定义明细模型**

```ts
export type SlotDetailOrderRow = {
  id: string
  customer: string
  source: string
  product: string
  status: string
  orderTime: string
  arrivalTime: string
}

export type SlotDetailModel = {
  date: string
  time: string
  endTime: string
  title: string
  orderCount: number
  capacityLabel: string
  enabled: boolean
  rows: SlotDetailOrderRow[]
}
```

- [ ] **Step 2: 聚合函数**

```ts
export const buildSlotDetail = ({
  date,
  slot,
  orders,
}: {
  date: string
  slot: JianyueSlotCard
  orders: BookingOrder[]
}): SlotDetailModel => {
  const orderNoSet = new Set(slot.orderNos.map(String))
  const rows = orders
    .filter(order => order.arrivalDate === date)
    .filter(order => orderNoSet.size === 0 || orderNoSet.has(String(order.id)) || orderNoSet.has(String(order.backendId)))
    .map(order => ({
      id: String(order.id),
      customer: order.customer,
      source: order.source,
      product: order.service,
      status: order.status,
      orderTime: order.orderTime,
      arrivalTime: order.arrivalTime,
    }))

  return {
    date,
    time: slot.time,
    endTime: slot.endTime,
    title: `${date} ${slot.time}`,
    orderCount: rows.length || slot.orderCount,
    capacityLabel: slot.capacityLabel,
    enabled: !slot.isFull,
    rows,
  }
}
```

- [ ] **Step 3: 面板模板**

Panel 必须包含这些固定文本，便于 contract 锁定：

```vue
<button type="button" @click="$emit('back')">返回</button>
<button type="button" @click="$emit('edit-capacity')">编辑</button>
<span>订单数：{{ detail.orderCount }}</span>
<span>工位：{{ detail.capacityLabel }}</span>
<span>当期状态：</span>
<table>
  <thead>
    <tr>
      <th>客户</th>
      <th>下单来源</th>
      <th>产品</th>
      <th>状态</th>
      <th>下单时间 / 到店时间</th>
    </tr>
  </thead>
</table>
```

- [ ] **Step 4: 点击时段后优先打开明细**

ScheduleView:

```ts
const selectedSlotDetail = ref<SlotDetailModel | null>(null)

const openJianyueSlot = (slot: JianyueSlotCard) => {
  selectedSlotDetail.value = buildSlotDetail({
    date: date.value,
    slot,
    orders: appStore.orders,
  })
}
```

DashboardView:

```ts
const selectedDashboardSlotDetail = ref<SlotDetailModel | null>(null)

const openDashboardSlot = (slot: JianyueSlotCard) => {
  selectedDashboardSlotDetail.value = buildSlotDetail({
    date: selectedDateValue.value,
    slot,
    orders: ledgerOrders.value,
  })
}
```

- [ ] **Step 5: 明细里的编辑跳库存，行点击跳订单**

```ts
const editSelectedSlotCapacity = () => {
  if (!selectedSlotDetail.value) return
  router.push({
    path: '/merchant/inventory',
    query: {
      date: selectedSlotDetail.value.date,
      startTime: selectedSlotDetail.value.time,
    },
  })
}
```

Row click:

```ts
const openSlotOrder = (row: SlotDetailOrderRow) => {
  router.push({ path: '/order/appointment', query: { quick: 'all', q: row.id } })
}
```

- [ ] **Step 6: 验证**

```powershell
npm test -- --run src/features/schedule/slotDetailOperations.test.ts src/shared/components/schedule/SlotDetailPanel.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts
```

Expected: tests pass.

### Task 4: 产品分析改成环图 + 排名

**Files:**

- Create: `studio-workbench/src/shared/components/dashboard/ProductDonutRanking.vue`
- Test: `studio-workbench/src/shared/components/dashboard/ProductDonutRanking.contract.test.ts`
- Create: `studio-workbench/src/features/dashboard/dashboardInsights.ts`
- Create: `studio-workbench/src/features/dashboard/dashboardInsights.test.ts`
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`

- [ ] **Step 1: 产品分布聚合**

```ts
export type ProductDistributionRow = {
  product: string
  count: number
  amount: number
  color: string
}

const palette = ['#18D437', '#FFCB16', '#FF7900', '#329EF0', '#8A6BE8']

export const buildProductDistribution = (orders: BookingOrder[]): ProductDistributionRow[] => {
  const buckets = new Map<string, { product: string; count: number; amount: number }>()
  for (const order of orders) {
    const key = order.service || '未指定产品'
    const bucket = buckets.get(key) ?? { product: key, count: 0, amount: 0 }
    bucket.count += 1
    bucket.amount += order.amount
    buckets.set(key, bucket)
  }
  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((row, index) => ({ ...row, color: palette[index % palette.length] }))
}
```

- [ ] **Step 2: 环图组件**

Use ECharts `PieChart`:

```ts
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])
```

Template:

```vue
<div class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,0.9fr)_minmax(320px,1fr)]">
  <div class="relative h-[300px]">
    <v-chart class="h-full w-full" :option="option" autoresize />
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
      <div>
        <div class="text-[46px] font-bold leading-none text-amber-accent">{{ total }}</div>
        <div class="mt-2 text-[13px] font-semibold text-amber-text-muted">{{ totalLabel }}</div>
      </div>
    </div>
  </div>
  <table class="w-full border-collapse">
    <thead>
      <tr>
        <th>排名</th>
        <th>产品名称</th>
        <th>{{ countLabel }}</th>
      </tr>
    </thead>
  </table>
</div>
```

- [ ] **Step 3: 首页替换产品排行区块**

DashboardView:

```vue
<ProductDonutRanking
  title="预约服务产品分布"
  total-label="服务订单"
  count-label="预约量"
  :rows="bookingProductDistribution"
  @select="openProductRanking"
/>
```

```ts
const bookingProductDistribution = computed(() =>
  buildProductDistribution(dayOrdersForBusinessDate.value),
)
```

- [ ] **Step 4: 验证**

```powershell
npm test -- --run src/features/dashboard/dashboardInsights.test.ts src/shared/components/dashboard/ProductDonutRanking.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts
npm run build
```

Expected: tests and build pass.

### Task 5: 路由协调器

**Files:**

- Create: `studio-workbench/src/shared/navigation/studioNavigation.ts`
- Test: `studio-workbench/src/shared/navigation/studioNavigation.test.ts`
- Modify: `studio-workbench/src/features/dashboard/DashboardView.vue`
- Modify: `studio-workbench/src/features/schedule/ScheduleView.vue`
- Modify: `studio-workbench/src/features/stores/StoreView.vue`

- [ ] **Step 1: 定义 query 构造**

```ts
export const orderQueryByDate = (date: string, extra: Record<string, string | undefined> = {}) => ({
  quick: 'all',
  time: 'arrival',
  start: date,
  end: date,
  ...extra,
})

export const orderQueryByService = (date: string, service: string) =>
  orderQueryByDate(date, { aservice: service })

export const orderQueryBySource = (date: string, source: string) =>
  orderQueryByDate(date, { asource: source })

export const inventoryQueryBySlot = (date: string, startTime: string, storeId?: string) => ({
  date,
  startTime,
  storeId,
})
```

- [ ] **Step 2: 页面替换散落 query**

Example:

```ts
router.push({ path: '/order/appointment', query: orderQueryByService(businessDateKey.value, product) })
```

```ts
router.push({ path: '/merchant/inventory', query: inventoryQueryBySlot(date.value, slot.time, selectedStoreBackendId.value) })
```

- [ ] **Step 3: 验证**

```powershell
npm test -- --run src/shared/navigation/studioNavigation.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/stores/StoreView.contract.test.ts
```

Expected: tests pass.

### Task 6: 数据口径补强

**Files:**

- Modify: `studio-workbench/src/shared/api/backend.ts`
- Modify: `studio-workbench/src/shared/stores/appStore.ts`
- Modify: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- Test: existing frontend contract tests and targeted backend tests.

- [ ] **Step 1: 明确最近一个月 DOUYIN_LIFE 查询口径**

Frontend `buildAllOrdersQuery()` must keep:

```ts
channelType: 'DOUYIN_LIFE'
beginOrderTime: '<today-31> 00:00:00'
endOrderTime: '<today> 23:59:59'
```

Do not show all historical rows by default.

- [ ] **Step 2: 状态映射补充**

Backend sync/upsert must map Douyin states into:

- paid but not arrived: `PENDING` / 前端 `待确认` or `待服务`
- accepted/reserved: `CONFIRMED` / 前端 `已确认`
- in-service: `IN_PROGRESS` / 前端 `拍摄中`
- verified/fulfilled: `COMPLETED` / 前端 `已完成`
- cancelled/refunded: `CANCELLED` / `REFUNDED`

If raw payload does not provide enough state, keep `PENDING` but flag `inventoryStatus` or remark as `NEED_STATUS_MAPPING`.

- [ ] **Step 3: 今日库存同步策略**

Do not fake today slots. Populate `yy_booking_slot_inventory` only from:

- real Douyin reservation stock callbacks,
- confirmed business rules imported from reference system,
- or explicit store schedule configuration.

For local UI smoke, demo data can remain demo-only.

- [ ] **Step 4: 验证 production API smoke**

Run authenticated smoke:

```text
POST https://api.evanshine.me/auth/login
GET  https://api.evanshine.me/yy/studio/bootstrap
GET  https://api.evanshine.me/yy/order/list?channelType=DOUYIN_LIFE&beginOrderTime=<31d>&endOrderTime=<today>
GET  https://api.evanshine.me/yy/bookingSlotInventory/list?bizDate=<today>
```

Record:

- store count
- permission count
- order total
- status counts
- inventory slot count

### Task 7: 浏览器验收和部署

**Files:**

- Create: `docs/evidence/studio-interaction-refactor-20260616.md`
- Update: `C:\Users\Administrator\Desktop\yiyue\studio-workbench-interaction-map-20260616.md`

- [ ] **Step 1: 本地验证**

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run
npm run build
```

- [ ] **Step 2: 本地浏览器验收**

Routes:

- `/dashboard/today`
- `/schedule`
- `/order/appointment?quick=all`
- `/merchant/store`

Manual smoke checklist:

- 日期条滚轮能横滑，页面不被误横移。
- 订单表格滚轮能横滑。
- 点时段打开明细。
- 明细返回、编辑容量、行点击订单可用。
- 产品环图和排名表清晰。
- 点击产品进入订单筛选。
- 无数据时说明真实原因。

- [ ] **Step 3: 生产部署**

Deploy only static `studio-workbench/dist` to:

```text
/var/www/studio.evanshine.me
```

Keep:

- backup path
- release id
- zip SHA256
- HTTP probes
- browser smoke

## 4. 哪些任务适合交给国产模型

适合：

- `useHorizontalWheel`、`JianyueDateStrip`、`ProductDonutRanking` 组件和测试。
- `studioNavigation.ts` query 构造和测试。
- `dashboardInsights.ts` / `slotDetailOperations.ts` 纯函数和测试。
- 页面模板替换中不涉及生产数据和服务器的部分。

不建议直接交给国产模型独立做：

- 生产订单同步和状态映射。
- 抖音来客 raw payload 解析。
- `yy_booking_slot_inventory` 回填。
- 部署服务器。
- 任何带密码/token/服务器信息的操作。

国产模型执行前必须给它：

- 本计划文件。
- `docs/studio-workbench-feature-code-map-20260615.md`
- `docs/evidence/studio-workbench-jianyue-ui-deploy-20260616.md`
- 明确要求：每个任务写测试、跑测试、不得碰 secrets、不得重构无关模块。

## 5. 验收门槛

这轮完成不能只看“页面能打开”。必须满足：

1. 首页日期条、今日预约日期条、订单表格都支持预期横向滚轮。
2. 点击日期、时段、产品、排行、状态卡、门店卡都有明确目标。
3. 时段明细有返回、编辑、状态开关和订单表格。
4. 产品分析改为清晰的环图 + 排名表。
5. `DashboardView.vue` / `ScheduleView.vue` 至少拆出 3 个共享组件或业务函数，后续不再继续膨胀。
6. 近一个月 `DOUYIN_LIFE` 订单默认口径明确，不展示全部历史。
7. 今日库存为空时明确展示“库存未同步/未配置”，不伪造满员格子。
8. `npm test -- --run` 通过。
9. `npm run build` 通过。
10. 线上 smoke 记录到 `docs/evidence`。

## 6. 推荐执行顺序

1. Task 1 横向滚轮。
2. Task 2 日期条组件。
3. Task 5 路由协调器。
4. Task 3 时段明细。
5. Task 4 产品环图排名。
6. Task 6 数据口径补强。
7. Task 7 验收部署。

这样做的原因：先把“所有页面都要遵守的交互地基”铺好，再补对象明细和图表，最后再攻真实数据状态和库存同步。

