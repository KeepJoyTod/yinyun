# 首页模块收口契约

> owner: dashboard-home-close-gap
> canonical_for: 商户工作台首页 `/`、`/dashboard/today`、`/dashboard/tasks` 的首页读模型收口、导出筛选补齐、快捷入口真实化
> upstream: `docs/architecture/three-layer-standard.md`, `docs/product-function-inventory(产品功能清单).md`, `docs/studio-workbench-route-implementation-status.md`
> downstream: `studio-workbench/src/features/dashboard/**`, `studio-workbench/src/shared/api/**`, `backend/ruoyi-modules/ruoyi-yy/**`

## 1. 功能摘要

| 项 | 内容 |
| --- | --- |
| 功能名 | 首页模块未完全收口闭环 |
| 用户角色 | 店员 / 店长 |
| 用户入口 | 工作台首页 `/` 的经营概况、转化率、产品排行、快捷入口、导出 |
| 成功结果 | 首页核心指标全部走统一后端口径；导出支持独立导出门店；快捷入口复制真实客户入口；失败时展示明确错误和来源 |
| 失败结果 | 保留当前页面，显示统一错误文案和重试入口；真实 API 模式不再静默冒充完整口径 |

## 2. 本次收口范围

### 2.1 必收口

1. `B-004 用户转化率` 口径固定为“订单账本履约转化”，不再把订单数伪装成访问数。
2. 首页状态卡、趋势、今日时段从前端本地派生切到真实后端只读接口。
3. 产品排行切到真实后端排行接口，支持按预约量 / 按金额双口径。
4. 首页快捷入口复制真实客户入口：
   - 预约入口、取片入口复用 `shareLinkOperations.ts`
   - 选片入口复用现有 `selectionLinks`
5. 经营概况在真实 API 模式下失败时展示 warning，不再静默按“商品金额=订单金额、优惠减免=0”伪装完整数据。
6. 首页导出新增独立导出门店筛选，默认跟随首页门店，但允许单次改写。

### 2.2 不在本次范围

1. 不新增访客埋点、UV、复购表。
2. 不新增异步任务中心。
3. 不接入抖音 / 微信 / 美团真实开放平台写链路。
4. 不改消费者端、小程序端入口协议。

## 3. 三层职责

| 层级 | Owner | 职责 |
| --- | --- | --- |
| 表现层 | `studio-workbench/src/features/dashboard/DashboardView.vue`、`DashboardFinanceOverview.vue`、`DashboardConversion.vue`、`DashboardProductRanking.vue`、`DashboardQuickEntries.vue` | 展示指标、导出筛选、错误态、复制入口、门店切换 |
| 控制逻辑层 - 前端 | `useDashboardBusinessInsights.ts`、`useDashboardSummaries.ts`、`workbenchOperationalStore.ts`、`backendDashboardApi.ts`、`backend.ts` | 请求后端读模型、归一化 DTO、兜底规则、导出参数编排 |
| 控制逻辑层 - 后端 | `YyDashboardController`、`IYyDashboardService`、`YyDashboardServiceImpl` | 权限、参数校验、首页聚合口径、响应对象 |
| 持久数据层 | `yy_order`、`yy_booking_slot_inventory`、`yy_store`、`yy_photo_album`、`yy_photo_asset` | 首页读模型事实来源 |

## 4. 口径定义

### 4.1 转化率口径

当前版本收口为“订单履约转化”，不展示“访问 UV”与“复购率”。

| 字段 | 含义 | 口径 |
| --- | --- | --- |
| `bookedCount` | 预约提交数 | 当日、当前门店范围内，`yy_order` 的运营日期命中订单数 |
| `paidCount` | 支付完成数 | `yy_order.pay_status = PAID` 的订单数 |
| `arrivedCount` | 到店数 | `yy_order.status in (ARRIVED, SERVING, COMPLETED)` 的订单数 |
| `completedCount` | 完成数 | `yy_order.status = COMPLETED` 的订单数 |
| `paidRate` | 支付转化率 | `paidCount / bookedCount` |
| `arrivedRate` | 到店转化率 | `arrivedCount / paidCount` |
| `completedRate` | 完成转化率 | `completedCount / arrivedCount` |

说明：

- 运营日期优先使用 `slotDate`，否则回退 `arrivalTime`，再回退 `orderTime`。
- 当前不再使用 `visitCount` 命名。

### 4.2 产品排行口径

| 字段 | 口径 |
| --- | --- |
| `byOrderCount` | 订单数降序，按 `productSnapshot -> externalProductId -> productId -> serviceName` 兜底聚合 |
| `byAmount` | 订单金额降序，金额单位后端保留分，前端展示元 |

### 4.3 快捷入口口径

| 入口 | 来源 |
| --- | --- |
| 预约入口 | `shareLinkOperations.buildEntryPayload({ storeId, entryType: 'BOOKING', channel: 'WECHAT' })` 的 `h5Url` |
| 取片入口 | `shareLinkOperations.buildEntryPayload({ storeId, entryType: 'PICKUP', channel: 'WECHAT' })` 的 `h5Url` |
| 选片入口 | `selectionLinks` 中当前门店最近有效链接；无数据时回退到工具页，不直接伪造客户链接 |

## 5. 请求契约

### 5.1 GET `/yy/dashboard/order-status-stats`

请求：

```ts
type DashboardOrderStatusStatsQuery = {
  date: string
  storeId?: string
}
```

规则：

- `date` 必填，格式 `yyyy-MM-dd`
- `storeId` 为空表示当前租户全部门店
- 权限：`yy:dashboard:list`

### 5.2 GET `/yy/dashboard/trend-stats`

请求：

```ts
type DashboardTrendStatsQuery = {
  endDate: string
  days?: number
  storeId?: string
}
```

规则：

- `endDate` 必填
- `days` 默认 `20`，最大 `31`
- 权限：`yy:dashboard:list`

### 5.3 GET `/yy/dashboard/today-slots`

请求：

```ts
type DashboardTodaySlotsQuery = {
  date: string
  storeId?: string
}
```

规则：

- `date` 必填
- 基于真实 `yy_booking_slot_inventory` 聚合，不凭历史无时段订单伪造时段

### 5.4 GET `/yy/dashboard/product-ranking`

请求：

```ts
type DashboardProductRankingQuery = {
  date: string
  storeId?: string
  topN?: number
}
```

规则：

- `date` 必填
- `topN` 默认 `10`，最大 `20`

### 5.5 GET `/yy/dashboard/conversion`

请求：

```ts
type DashboardConversionQuery = {
  date: string
  storeId?: string
}
```
规则：

- `date` 必填
- 仅返回订单履约转化，不返回访客 UV、复购

### 5.6 POST `/yy/dashboard/export`

沿用现有接口，请求扩展使用现有 `storeId`，前端新增独立导出门店状态：

```ts
type DashboardExportQuery = {
  beginDate: string
  endDate: string
  storeId?: string
  channelType?: string
}
```

规则：

- 允许 `storeId` 与首页当前选中门店不同
- `beginDate <= endDate`
- 日期范围最大 `31` 天
- 权限：`yy:dashboard:export`

## 6. 响应契约

### 6.1 `DashboardOrderStatusStatDto[]`

```ts
type DashboardOrderStatusStatDto = {
  status: string
  label: string
  count: number
  amountCents: number
}
```

### 6.2 `DashboardTrendStatDto[]`

```ts
type DashboardTrendStatDto = {
  day: string
  bookedCount: number
  arrivedCount: number
  amountCents: number
}
```

### 6.3 `DashboardTodaySlotDto[]`

```ts
type DashboardTodaySlotDto = {
  bookingId?: string | null
  storeId: string
  storeName: string
  studioId?: string | null
  studioName?: string
  startAt: string
  endAt: string
  bookingStatus?: string
  orderNo?: string
  customerName?: string
  customerPhone?: string
  serviceName?: string
  orderStatus?: string
}
```

### 6.4 `DashboardProductRankingDto`

```ts
type DashboardProductRankingRowDto = {
  rank: number
  productName: string
  orderCount: number
  amountCents: number
}

type DashboardProductRankingDto = {
  byOrderCount: DashboardProductRankingRowDto[]
  byAmount: DashboardProductRankingRowDto[]
}
```

### 6.5 `DashboardConversionDto`

```ts
type DashboardConversionDto = {
  date: string
  storeId?: string
  bookedCount: number
  paidCount: number
  arrivedCount: number
  completedCount: number
  paidRate: number
  arrivedRate: number
  completedRate: number
}
```

## 7. 错误契约

| 场景 | UI 文案 | 是否可重试 | 日志要求 |
| --- | --- | --- | --- |
| 日期格式错误 | 日期格式错误，请重新选择 | 是 | 记录 query 与用户 |
| 日期范围超限 | 日期范围不能超过 31 天 | 是 | 记录 begin/end |
| 无权限 | 当前账号没有首页查看权限 | 否 | 记录权限点 |
| 无权限导出 | 当前账号没有首页导出权限 | 否 | 记录权限点 |
| 首页统计读取失败 | 首页数据刷新失败，请稍后重试 | 是 | 记录接口名、storeId、date |
| 导出失败 | 首页导出失败，请稍后重试 | 是 | 记录接口名、storeId、begin/end |

## 8. 数据表读写

| 表 | 操作 | 字段 | 规则 |
| --- | --- | --- | --- |
| `yy_order` | READ | `store_id`, `slot_date`, `arrival_time`, `order_time`, `status`, `pay_status`, `total_amount_cent`, `paid_amount_cent`, `refund_amount_cent`, `channel_type`, `external_product_id`, `external_sku_id` | 唯一订单账本 |
| `yy_booking_slot_inventory` | READ | `store_id`, `biz_date`, `start_time`, `end_time`, `capacity`, `paid_count`, `conflict_count`, `status` | 唯一真实时段容量账本 |
| `yy_store` | READ | `id`, `store_name`, `status` | 门店真实范围 |
| `yy_photo_album` | READ | `id`, `order_id`, `store_id`, `biz_date` | 选片入口关联来源 |
| `yy_photo_asset` | READ | `album_id`, `is_selected` | 选片统计来源 |

本次不写任何业务表。

## 9. 实施步骤

1. 文档先行：补 `contract + flow`。
2. 后端补首页只读接口与 VO，复用 `YyDashboardServiceImpl` 现有聚合逻辑。
3. 前端新增 dashboard API owner，替换 `backend.ts` 中首页统计本地派生。
4. 前端改首页转化、排行、快捷入口、导出门店筛选与失败态。
5. 更新地图与功能清单口径。
6. 跑目标测试与构建。

## 10. 验证命令

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/shared/api/backend.contract.test.ts src/shared/stores/appStore.contract.test.ts
npm --prefix studio-workbench run check:file-size
npm --prefix studio-workbench run build
cd backend
mvn -pl ruoyi-modules/ruoyi-yy -Dtest=YyDashboardServiceImplTest test
```
