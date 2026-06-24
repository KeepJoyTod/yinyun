# 首页模块收口数据流

> owner: dashboard-home-close-gap
> canonical_for: 商户工作台首页收口的数据流、失败路径、读模型边界
> upstream: `docs/contracts/dashboard-home-close-gap-contract.md`, `docs/architecture/three-layer-standard.md`
> downstream: 首页实现、测试、handoff

## 1. 用户路径

### 1.1 首页指标刷新

1. 店员进入工作台首页 `/`
2. 选择门店、日期
3. 页面并发刷新：
   - 经营概况
   - 状态卡
   - 趋势
   - 今日时段
   - 转化率
   - 产品排行
4. 成功时显示真实后端读模型
5. 失败时展示统一错误提示与重试入口，不伪装完整口径

### 1.2 首页导出

1. 店员在经营概况区域选择导出开始日期、结束日期、渠道、导出门店
2. 点击“导出”
3. 前端调用 `POST /yy/dashboard/export`
4. 成功下载 Excel；失败显示导出错误

### 1.3 快捷入口复制

1. 店员在首页点击“复制预约入口 / 取片入口 / 选片入口”
2. 前端优先生成真实客户入口 URL
3. 复制成功显示已复制；参数不完整时显示不可复制原因

## 2. 首页读模型三层图

```mermaid
flowchart TD
  A["店员打开首页 / 切换门店日期"] --> B["表现层\nDashboardView / DashboardFinanceOverview / DashboardConversion / DashboardProductRanking / DashboardQuickEntries"]
  B --> C["前端控制逻辑\nuseDashboardBusinessInsights\nuseDashboardSummaries\nworkbenchOperationalStore"]
  C --> D["前端 API\nbackendDashboardApi / backend.ts"]
  D --> E["后端 Controller\nYyDashboardController"]
  E --> F["后端 Service\nYyDashboardServiceImpl"]
  F --> G["持久数据层\nyy_order"]
  F --> H["持久数据层\nyy_booking_slot_inventory"]
  F --> I["持久数据层\nyy_store"]
  F --> J["持久数据层\nyy_photo_album / yy_photo_asset"]
  G --> F
  H --> F
  I --> F
  J --> F
  F --> E
  E --> D
  D --> C
  C --> B
  B --> K["用户看到成功 / 失败 / warning / retry"]
```

## 3. 首页刷新时序

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as DashboardView
  participant Logic as useDashboardBusinessInsights / workbenchOperationalStore
  participant Api as backendDashboardApi
  participant Controller as YyDashboardController
  participant Service as YyDashboardServiceImpl
  participant DB as yy_order / yy_booking_slot_inventory / yy_store

  Staff->>View: 进入首页或切换门店/日期
  View->>Logic: loadDashboardFor(date, storeId)
  Logic->>Api: dashboardFinance / orderStatusStats / trendStats / todaySlots / conversion / productRanking
  Api->>Controller: GET /yy/dashboard/*
  Controller->>Service: query(date, storeId)
  Service->>DB: 读取首页聚合事实
  DB-->>Service: rows
  Service-->>Controller: normalized vo
  Controller-->>Api: response
  Api-->>Logic: dto
  Logic-->>View: update state
  View-->>Staff: 显示真实口径
```

## 4. 导出时序

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as DashboardFinanceOverview
  participant Logic as DashboardView
  participant Api as backend.ts exportDashboard
  participant Controller as YyDashboardController
  participant Service as YyDashboardServiceImpl
  participant DB as yy_order / yy_booking_slot_inventory

  Staff->>View: 选择导出门店/日期范围/渠道
  View->>Logic: exportDashboardSummary()
  Logic->>Api: POST /yy/dashboard/export
  Api->>Controller: form body
  Controller->>Service: exportRows(bo)
  Service->>DB: 读取订单与时段容量
  DB-->>Service: rows
  Service-->>Controller: export rows
  Controller-->>Api: xlsx blob
  Api-->>Logic: BlobResponse
  Logic-->>View: 触发下载 / 显示失败
```

## 5. 快捷入口数据流

```mermaid
flowchart LR
  A["首页快捷入口"] --> B["useDashboardBusinessInsights"]
  B --> C["预约/取片入口\nshareLinkOperations.buildEntryPayload"]
  B --> D["选片入口\nselectionLinks / albumsStore"]
  C --> E["真实 H5 / 小程序路径"]
  D --> E
  E --> F["复制到剪贴板"]
```

说明：

- 预约、取片入口复用 `shareLinkOperations.ts`，不新增新表、不新增新接口。
- 选片入口复用现有 `selectionLinks` 刷新链路。

## 6. 失败路径

```mermaid
flowchart TD
  Start["首页发起读取"] --> Validate["前端校验日期/门店"]
  Validate -->|失败| UIValidate["前端直接提示参数错误"]
  Validate -->|通过| Request["请求 /yy/dashboard/*"]
  Request --> Auth["后端权限校验"]
  Auth -->|失败| UIPermission["展示无权限"]
  Auth -->|通过| Aggregate["后端聚合读模型"]
  Aggregate -->|失败| UIError["展示首页刷新失败 + retry"]
  Aggregate -->|成功| Render["渲染真实口径"]
```

## 7. 写库表 / 读接口 / UI 状态

| 项 | 内容 |
| --- | --- |
| 写库表 | 无 |
| 读接口 | `/yy/dashboard/finance`、`/yy/dashboard/order-status-stats`、`/yy/dashboard/trend-stats`、`/yy/dashboard/today-slots`、`/yy/dashboard/product-ranking`、`/yy/dashboard/conversion`、`/yy/dashboard/export` |
| 空态 | 当前日期暂无数据，显示空态和切换建议 |
| 加载态 | 首页卡片 skeleton / loading hint |
| 失败态 | `StateView` + retry；经营概况展示 warning 来源 |
| 风险边界 | 不伪造访客 UV，不新增第二账本，不把历史无时段订单写入今日时段 |

## 8. 验证

```powershell
npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/shared/api/backend.contract.test.ts src/shared/stores/appStore.contract.test.ts
npm --prefix studio-workbench run build
cd backend
mvn -pl ruoyi-modules/ruoyi-yy -Dtest=YyDashboardServiceImplTest test
```
