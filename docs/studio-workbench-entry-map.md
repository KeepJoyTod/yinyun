# 影约云门店工作台入口地图

更新时间：2026-06-15

## 这份文档做什么

这是一份入口索引，不替代详细代码地图。

用途很直接：

- 先看这里，快速找到登录、主控台、订单、客片、选片、设置这些入口。
- 再跳到更细的代码地图和路由状态文档。
- 以后继续新增页面时，也先把它挂进这里。

## 推荐阅读顺序

1. `docs/studio-workbench-complete-delivery-index-20260615.md`
2. `docs/studio-workbench-complete-delivery-plan-20260615.md`
3. `docs/studio-workbench-feature-code-map-20260615.md`
4. `docs/studio-workbench-optimization-map-20260615.md`
5. `docs/studio-workbench-preimplementation-solutions-20260615.md`
6. `docs/studio-workbench-acceptance-checklist-20260615.md`
7. `docs/studio-workbench-api-route-map.md`
8. `docs/studio-workbench-route-implementation-status.md`

旧版地图 `docs/studio-workbench-code-map-20260610.md` 和 `docs/studio-workbench-optimization-map-20260610.md` 保留作历史参考；继续执行以 `20260615` 文档包为准。

## 入口总览

| 入口 | 路由 | 文件 |
| --- | --- | --- |
| 员工登录 | `/login` | `studio-workbench/src/features/auth/StaffLoginView.vue` |
| 预约概况 | `/` | `studio-workbench/src/features/dashboard/DashboardView.vue` |
| 预约订单 | `/orders` | `studio-workbench/src/features/orders/OrdersView.vue` |
| 日程管理 | `/schedule` | `studio-workbench/src/features/schedule/ScheduleView.vue` |
| 客片管理 | `/photo-mgmt` | `studio-workbench/src/features/albums/PhotoMgmtView.vue` |
| 在线选片 | `/online-selection`、`/service/selection` | `studio-workbench/src/features/selection/OnlineSelectionView.vue` |
| 会员账户 | `/member/accounts` | `studio-workbench/src/features/member/DerivedMemberModuleView.vue` |
| 营销中心 | `/marketing/center` | `studio-workbench/src/features/marketing/DerivedMarketingModuleView.vue` |
| 报表 | `/report/*` | `studio-workbench/src/features/reports/DerivedReportModuleView.vue` |
| 设置 | `/settings/*` | `studio-workbench/src/features/settings/*.vue` |

## 入口边界

- 员工登录只给门店工作台用。
- 客户入口走 `client-web` 和 `mobile-uniapp`。
- 管理后台走 `admin-ui`。
- 路由、权限、API 对应关系继续以 `docs/studio-workbench-api-route-map.md` 为准。
