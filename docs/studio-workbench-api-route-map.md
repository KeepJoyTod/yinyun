> owner: studio-workbench-api-route-map
> canonical_for: 门店工作台前端路由、页面、store action、backendApi 和后端接口的映射
> upstream: studio-workbench/src/app/router/featureRegistry.ts, studio-workbench/src/shared/stores/appStore.ts, studio-workbench/src/shared/api/backend.ts
> downstream: docs/domestic-model-handoff-small-features.md, docs/studio-workbench-route-implementation-status.md

# 门店工作台接口与路径总表

更新时间：2026-06-16

## 2026-06-15 API 契约入口

接口契约和待实现骨架以这里为准：

```text
docs/contracts/studio-workbench-api-contract-20260615.md
docs/api/studio-workbench-openapi-skeleton-20260615.yaml
```

国产模型填接口代码必须先读上面两个文件，再读对应 `docs/domestic-model-tasks/DM-API-*.md`。

## 读法

```text
前端路由 -> 页面文件 -> appStore 动作/数据 -> backendApi 方法 -> 后端接口
```

`DERIVED` 表示页面从现有统一账本派生，不新增后端接口。

## 核心页面

| 路由 | 页面 | store / helper | backendApi | 后端接口 |
| --- | --- | --- | --- | --- |
| `/` | `features/dashboard/DashboardView.vue` | `loadDashboardStats()`、`refreshCoreData()`、首页聚合深链 | `orderStatusStats()`、`trendStats()`、`todaySlots()` | 聚合统计接口；缺失时从订单/排期派生 |
| `/dashboard/today` | `features/schedule/ScheduleView.vue` | `loadSchedule()`、`loadBookingInventory()`、排期卡片深链 | `listSchedules()`、`listBookingInventory()` | `/yy/order/list`、`/yy/bookingSlotInventory/list` |
| `/dashboard/tasks` | `features/orders/OrdersView.vue` | `orderOperations.ts`、`orders` | `listTodayOrders()` | `/yy/order/list` |
| `/order/appointment` | `features/orders/OrdersView.vue` | `updateOrderStatus()`、`rescheduleOrder()` | `updateOrderStatus()`、`rescheduleOrder()` | `POST /yy/order/{id}/transition`、`POST /yy/order/{id}/reschedule` |
| `/service/photos` | `features/albums/PhotoMgmtView.vue` | `uploadAlbumPhotos()`、`loadAlbumDetails()`、`loadPhotoAccessLogs()`、`photoMgmtOperations.ts` | `uploadAlbumPhotos()`、`getAlbum()`、`listPhotoAccessLogs()` | `/resource/oss/upload`、`/resource/oss/listByIds/{ossId}`、`/yy/photoAsset`、`/yy/photoAsset/list`、`/yy/photoAccessLog/list` |
| `/service/selection` | `features/selection/OnlineSelectionView.vue` | `generateSelectionLink()`、`loadSelectionStats()` | `createSelectionLink()`、`selectionStats()` | 当前从 `yy_photo_album` / `yy_photo_asset` 派生 |
| `/tools/share-links` | `features/tools/ShareLinksView.vue` | `shareLinkOperations.ts`、`stores` | `listStores()` | `/yy/store/list` |
| `/tools/booking-entry` | `features/tools/ShareLinksView.vue` | `getEntryTypeFromRouteName()` | `listStores()` | `/yy/store/list` |
| `/tools/pickup-entry` | `features/tools/ShareLinksView.vue` | `getEntryTypeFromRouteName()` | `listStores()` | `/yy/store/list` |

## 聚合入口 Query 承接

| 来源 | 目标 | Query | 承接页面 |
| --- | --- | --- | --- |
| `/` 今日待拍 | `/order/appointment` | `quick=todayOps&time=arrival&start=YYYY-MM-DD&end=YYYY-MM-DD` | `OrdersView.vue` 从 URL 恢复 quick/time/date |
| `/` 待上传 | `/service/photos` | `date=YYYY-MM-DD&needsUpload=1` | `PhotoMgmtView.vue` 按业务日期和缺底片过滤 |
| `/` 待选片 | `/service/selection` | `date=YYYY-MM-DD&stage=pending-submit` | `OnlineSelectionView.vue` 按相册/订单日期和阶段过滤 |
| `/` 待交付 | `/service/selection` | `date=YYYY-MM-DD&stage=selecting` | `OnlineSelectionView.vue` 只看客户已选、待精修/交付链接 |
| `/` 服务订单状态 | `/order/appointment` | `statusTab=<状态>&time=arrival&start/end=YYYY-MM-DD` | `OrdersView.vue` 状态 Tab 深链 |
| `/` 产品排行 | `/order/appointment` | `aservice=<产品>&time=arrival&start/end=YYYY-MM-DD` | `OrdersView.vue` 高级服务筛选 |
| `/` 渠道汇总 | `/order/appointment` | `asource=<渠道>&time=arrival&start/end=YYYY-MM-DD` | `OrdersView.vue` 高级渠道筛选 |
| `/` 库存冲突 | `/merchant/inventory` | `date=YYYY-MM-DD&storeId=<门店ID>` | `InventoryView.vue` 库存日期/门店承接 |
| `/dashboard/today` 排期卡片 | `/order/appointment` 或 `/merchant/inventory` | `quick/time/start/end` 或 `date/storeId/conflictOnly=1` | 订单页、库存页承接 |

## 商户与商品

| 路由 | 页面 | store / helper | backendApi | 后端接口 |
| --- | --- | --- | --- | --- |
| `/merchant/store` | `features/stores/StoreView.vue` | `stores`、`orders`、`albums` | `listStores()` | `/yy/store/list` |
| `/merchant/service-groups` | `features/merchant/ServiceGroupsView.vue` | `loadServiceGroups()`、`saveServiceGroup()` | `listServiceGroups()`、`createServiceGroup()`、`updateServiceGroup()` | `/yy/serviceGroup/list`、服务组新增/修改接口 |
| `/merchant/inventory` | `features/merchant/InventoryView.vue` | `loadBookingInventory()`、`updateBookingInventory()` | `listBookingInventory()`、`updateBookingInventory()` | `/yy/bookingSlotInventory/list`、库存更新接口 |
| `/product/service` | `features/products/ProductConfigView.vue` | `products`、`updateProduct()` | `listProducts()`、`createProduct()`、`updateProduct()` | `/yy/product/list`、产品新增/修改接口 |
| `/product/addon` | `features/products/DerivedProductModuleView.vue` | `derivedProductModules.ts` | DERIVED | 从 `yy_product` 派生 |
| `/product/group` | `features/products/DerivedProductModuleView.vue` | `derivedProductModules.ts` | DERIVED | 从 `yy_product` 派生 |
| `/product/print` | `features/products/DerivedProductModuleView.vue` | `derivedProductModules.ts` | DERIVED | 从 `yy_product` 派生 |
| `/product/douyin` | `features/products/DouyinProductsView.vue` | `loadChannelProductMappings('DOUYIN_LIFE')` | `listChannelProductMappings()` | `/yy/channelProductMapping/list` |
| `/product/meituan` | `features/products/DerivedProductModuleView.vue` | `derivedProductModules.ts` | `listChannelProductMappings()` | `/yy/channelProductMapping/list?channelType=MEITUAN` |

## 订单与渠道

| 路由 | 页面 | store / helper | backendApi | 后端接口 |
| --- | --- | --- | --- | --- |
| `/order/print` | `features/orders/DerivedOrderModuleView.vue` | `derivedOrderModules.ts` | DERIVED | 从 `yy_order`、相册派生 |
| `/order/enterprise` | `features/orders/DerivedOrderModuleView.vue` | `derivedOrderModules.ts` | DERIVED | 从 `yy_order` 派生 |
| `/order/card` | `features/orders/DerivedOrderModuleView.vue` | `derivedOrderModules.ts` | DERIVED | 从 `yy_order` 派生 |
| `/order/coupon` | `features/orders/DerivedOrderModuleView.vue` | `derivedOrderModules.ts` | DERIVED | 从 `yy_order` 派生 |
| `/order/forms` | `features/orders/DerivedOrderModuleView.vue` | `derivedOrderModules.ts` | DERIVED | 从 `yy_order` 派生 |
| `/order/campaign` | `features/orders/CampaignOrdersView.vue` | `orders`、活动来源归因 | DERIVED | 从 `yy_order` 派生 |
| `/order/verification` | `features/orders/ChannelVerificationView.vue` | `loadDouyinAcceptanceCases()`、`loadDouyinSyncHealth()`、`loadChannelSyncLogs()` | `listDouyinAcceptanceCases()`、`getDouyinSyncHealth()`、`listChannelSyncLogs()` | `/yy/channel/DOUYIN_LIFE/acceptance-cases`、`/yy/channel/DOUYIN_LIFE/sync-health`、`/yy/channelSyncLog/list` |

## 预约订单 / 首页 / 今日预约同步闭环

| 能力 | 页面入口 | Store / API | 后端接口 | 状态 |
| --- | --- | --- | --- | --- |
| 全量本地预约订单 | `/order/appointment`、`/`、`/dashboard/today` | `appStore.refreshCoreData()`、`backendApi.listOrders()` | `GET /yy/order/list` | 已接 |
| 简约网式状态分组 | `/order/appointment`、`/` | `orderOperations.ts` 的 `buildOrderStatusGroupCounts()` / `matchesOrderStatusGroup()` | 本地 `yy_order` 聚合 | 已接共享规则 |
| 手动同步抖音来客订单 | `/order/appointment` 顶部“同步订单” | `appStore.syncDouyinLifeOrdersAndRefresh()`、`backendApi.syncDouyinLifeOrders()` | `POST /yy/channel/DOUYIN_LIFE/orders/sync` | 已接 |
| 同步后刷新首页/排期/日志 | “同步订单”成功后 | `refreshCoreData()`、`loadDashboardStats()`、`loadSchedule()`、`loadDouyinSyncHealth()`、`loadChannelSyncLogs()` | 多接口刷新 | 已接 |
| 自动同步状态 | 渠道验收/日志排障 | 后端 `YyDouyinLifeAutoSyncService` | `GET /yy/channel/DOUYIN_LIFE/auto-sync/status` | 已接后端 |
| 同步健康 | 渠道验收页、排障页 | `backendApi.getDouyinSyncHealth()` | `GET /yy/channel/DOUYIN_LIFE/sync-health` | 已接 |
| 今日预约排期 | `/dashboard/today` | `appStore.loadSchedule()`、`backendApi.listSchedules()` | 当前由 `/yy/order/list` 和 `/yy/bookingSlotInventory/list` 派生 | 已接 |
| 首页经营概况 | `/` | `appStore.loadDashboardStats()`、订单/排期聚合 | 订单和排期接口；财务专表未接时不伪造 | 已接 |

状态分组口径：

```text
全部有效订单 = 排除 已取消 / 已退单 / 已退款
待服务 = 待确认
服务中 = 已确认 + 拍摄中
已完成 = 选片中 + 已完成，且非取消/退款
待支付 = 有效订单 + 支付状态待支付
已取消 = 已取消
已退单 = 已退单 或 支付状态已退款，且不重复计入已取消
```

2026-06-16 验证：状态分组已由 `OrdersView.vue` 和 `DashboardView.vue` 共用同一套 helper；`orderOperations.test.ts` 17 个用例通过，订单/首页/排期/store/backend facade 选定契约测试 91 个用例通过，`npm run build` 通过。

## 内部协作、资源、会员、营销、报表

| 路由组 | 页面 | 数据来源 | 后端接口 |
| --- | --- | --- | --- |
| `/collaboration/overview` | `WorkExecutionOverviewView.vue` | `workExecution.ts` 从订单、相册、选片链接派生 | `yy_order`、`yy_photo_album`、`yy_photo_asset` |
| `/collaboration/work-orders` | `WorkOrdersView.vue` | `workOrders.ts` 派生工单池；`backendApi.listWorkOrders/getWorkOrder/listWorkOrderEvents/transitionWorkOrder()` 已预接 `GET /yy/workOrder/list`、`POST /yy/workOrder/{id}/transition`、`GET /yy/workOrder/{id}/events` | 正式接口骨架和前端 facade 已实现，页面仍走派生池，等迁移/权限/smoke 后再切 |
| `/collaboration/export` | `WorkOrderExportView.vue` | `workOrderExport.ts` 导出 CSV | 当前只读 |
| `/collaboration/statistics` | `WorkOrderStatisticsView.vue` | `workOrderStats.ts` 聚合环节 | 当前只读 |
| `/resource/files` | `DerivedResourceModuleView.vue` | 相册底片和私有 OSS 归属 | `/yy/photoAlbum/list`、`/yy/photoAsset/list` |
| `/resource/samples` | `DerivedResourceModuleView.vue` | 客户已选照片候选 | `/yy/photoAlbum/list`、`/yy/photoAsset/list` |
| `/member/customers` | `CustomersView.vue` | `loadCustomers()`、`loadCustomerRecentOrders()` | `/yy/customer/list`、`/yy/order/list` |
| `/member/accounts`、`/member/tags`、`/member/consumption` | `DerivedMemberModuleView.vue` | `derivedMemberModules.ts` | `/yy/customer/list`、`/yy/order/list` |
| `/marketing/*` | `DerivedMarketingModuleView.vue` | `derivedMarketingModules.ts` | 当前从 `yy_order` / `yy_customer` 派生 |
| `/report/*` | `DerivedReportModuleView.vue` | `ensureReportDataLoaded()`、`loadReportSnapshots()`、`derivedReportModules.ts` | `/yy/order/list`、`/yy/employee/list`、`/yy/photoAlbum/list`、`/yy/photoAsset/list`、`/yy/customer/list`、`/yy/reportSnapshot/list` |

## 设置和日志

| 路由 | 页面 | store / helper | backendApi | 后端接口 |
| --- | --- | --- | --- | --- |
| `/settings/employees` | `features/settings/EmployeesView.vue` | `loadEmployees()`、`saveEmployee()` | `listEmployees()`、`createEmployee()`、`updateEmployee()` | `/yy/employee/list`、员工新增/修改接口 |
| `/settings/roles` | `features/settings/RolesView.vue` | `studioAccessStore`、`featureRegistry` | `bootstrap` 权限体检 | RuoYi 权限由系统后台维护 |
| `/settings/logs` | `features/settings/LogsView.vue` | `loadOperationLogs()`、`loadChannelSyncLogs()` | `listOperationLogs()`、`listChannelSyncLogs()` | `/monitor/operlog/list`、`/yy/channelSyncLog/list` |
| `/settings/channels` | `features/settings/ChannelsView.vue` | 静态上线配置和渠道状态 | `listChannelProductMappings()` | `/yy/channelProductMapping/list` |
| `/settings/workbench` | `features/settings/SettingsView.vue` | 员工会话、API/demo 模式、入口边界 | 本地状态 | 无新增接口 |
| `/tools/notifications` | `features/tools/NotificationsView.vue` | `loadNotificationTemplates()`、`saveNotificationTemplate()`、`loadNotificationLogs()` | 通知模板与日志 API | `/yy/notificationTemplate/list`、`/yy/notificationLog/list` |

## 旧路径重定向

| 旧路径 | 新路径 |
| --- | --- |
| `/orders` | `/order/appointment` |
| `/schedule` | `/dashboard/today` |
| `/store` | `/merchant/store` |
| `/config` | `/product/service` |
| `/photo-mgmt` | `/service/photos` |
| `/online-selection` | `/service/selection` |
| `/settings` | `/settings/workbench` |

## 后端路径清单

```text
GET  /yy/store/list
GET  /yy/product/list
GET  /yy/serviceGroup/list
GET  /yy/bookingSlotInventory/list
GET  /yy/employee/list
GET  /yy/customer/list
GET  /yy/notificationTemplate/list
GET  /yy/notificationLog/list
GET  /yy/order/list
POST /yy/order/{id}/transition
POST /yy/order/{id}/reschedule
POST /yy/order/export
GET  /yy/channel/DOUYIN_LIFE/orders
POST /yy/channel/DOUYIN_LIFE/orders/sync
GET  /yy/channel/DOUYIN_LIFE/auto-sync/status
GET  /yy/channel/DOUYIN_LIFE/sync-health
GET  /yy/photoAlbum/list
GET  /yy/photoAsset/list
POST /resource/oss/upload
GET  /resource/oss/listByIds/{ossId}
POST /yy/photoAsset
GET  /yy/channelProductMapping/list
GET  /yy/channel/DOUYIN_LIFE/acceptance-cases
GET  /yy/channel/DOUYIN_LIFE/sync-health
GET  /yy/channelSyncLog/list
GET  /monitor/operlog/list
GET  /yy/photoAccessLog/list
GET  /yy/reportSnapshot/list
GET  /yy/workOrder/list
GET  /yy/workOrder/{id}
GET  /yy/workOrder/{id}/events
POST /yy/workOrder/{id}/transition
POST /yy/workOrder
PUT  /yy/workOrder
DELETE /yy/workOrder/{ids}
POST /yy/workOrder/export
```

新增接口前先更新本表，再改 `backendTypes.ts`、`backend.ts` 和对应页面/测试。
