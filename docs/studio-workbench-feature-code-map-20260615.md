> owner: studio-workbench-feature-code-map-20260615
> canonical_for: 门店工作台自然语言功能到代码位置、测试和接口的映射
> upstream: studio-workbench/src/app/router/featureRegistry.ts, studio-workbench/src/app/router/index.ts, docs/studio-workbench-api-route-map.md
> downstream: docs/studio-workbench-complete-delivery-plan-20260615.md, docs/studio-workbench-optimization-map-20260615.md

# 门店工作台功能代码地图

日期：2026-06-16

## 项目概览

| 项 | 内容 |
| --- | --- |
| 项目目录 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench` |
| 技术栈 | Vue 3, TypeScript, Vite, Vue Router, Tailwind CSS, Vitest |
| 路由来源 | `src/app/router/featureRegistry.ts` 注册 55 个功能 |
| 路由装配 | `src/app/router/index.ts` 根据 `feature.component` 懒加载页面 |
| 状态管理 | `src/shared/stores/appStore.ts`，后续按业务域继续拆分 |
| 后端适配 | `src/shared/api/backend.ts` + `src/shared/api/backendChannelInsights.ts` + `src/shared/api/yingyueAdapter.ts` |
| 业务类型 | `src/shared/api/backendTypes.ts`, `src/shared/stores/appStoreTypes.ts` |
| 测试规模 | 71 个 `*.test.ts`，覆盖路由、契约、纯规则、Store 行为和适配层 |

## 入口和布局

| 用户说法 | 路由/功能 | 主要文件 | 测试 | 修改指引 |
| --- | --- | --- | --- | --- |
| 员工登录、门店登录、登录应该在侧边 | `/login` | `src/features/auth/StaffLoginView.vue`, `src/shared/auth/staffSession.ts` | `StaffLoginView.contract.test.ts`, `staffSession.test.ts` | 登录布局和文案改 `StaffLoginView.vue`；会话隔离改 `staffSession.ts` |
| 左侧菜单、侧边栏、工作台导航 | 全局布局 | `src/shared/components/layout/Sidebar.vue`, `SidebarItem.vue`, `src/app/router/featureRegistry.ts` | `Sidebar.access.contract.test.ts`, `featureRegistry.contract.test.ts` | 新增菜单先改 `featureRegistry.ts`，再补权限和路由状态 |
| 顶部栏、搜索、处理订单按钮 | 全局布局 | `src/shared/components/layout/Header.vue` | `Header.contract.test.ts` | 顶部操作入口只放员工动作，不放客户预约表单 |
| 无权限页面、403 | `/403` | `src/features/system/ForbiddenView.vue`, `router/index.ts` | `router.contract.test.ts` | 权限跳转改路由守卫，页面提示改 `ForbiddenView.vue` |

## 首页、订单和排期

| 用户说法 | 路由/功能 | 主要文件 | 数据/API | 测试 | 修改指引 |
| --- | --- | --- | --- | --- | --- |
| 经营概况、首页、今日看板、今日待拍/待上传/待选片/待交付卡片 | `/` | `src/features/dashboard/DashboardView.vue` | `appStore.loadDashboardStats()`, `backendApi.orderStatusStats()`, `trendStats()`, `todaySlots()`；聚合卡片深链到订单/客片/选片/库存/工具页 | `DashboardView.contract.test.ts` | 指标和趋势图改 dashboard；首页聚合点击改 `openOperationCard/openStatusCard/openProductRanking/openChannelSummary/openQuickEntry`；统计派生改 `yingyueAdapter.ts` 或 `backend.ts` |
| 预约订单、今日待处理、订单详情 | `/order/appointment`, 旧 `/orders` | `src/features/orders/OrdersView.vue`, `orderOperations.ts` | `/yy/order/list`, `/yy/order/{id}/transition`, `/yy/order/{id}/reschedule`, `/yy/channel/DOUYIN_LIFE/orders/sync` | `OrdersView.contract.test.ts`, `orderOperations.test.ts` | 订单筛选/下一步动作优先改 `orderOperations.ts`；简约网式状态分组改 `buildOrderStatusGroupCounts()` / `matchesOrderStatusGroup()`，页面只接渲染和交互 |
| 改期、库存冲突、确认订单 | 订单详情动作 | `OrdersView.vue`, `backend.ts` | `backendApi.rescheduleOrder()`, `updateOrderStatus()` | `backend.contract.test.ts` | 后端字段先更新 `backendTypes.ts`，再改 facade 和页面 |
| 今日预约、日程、排期、排期卡片、工位点击 | `/dashboard/today`, 旧 `/schedule` | `src/features/schedule/ScheduleView.vue`, `src/features/schedule/scheduleOperations.ts`, `ReservationSlots.vue` | `backendApi.listSchedules()`, `/yy/bookingSlotInventory/list` | `ScheduleView.contract.test.ts`, `scheduleOperations.test.ts`, `ReservationSlots.contract.test.ts` | 视觉和筛选改 `ScheduleView.vue`；卡片跳转 query 改 `scheduleOperations.ts`；槽位展示和点击 emit 改 `ReservationSlots.vue` |
| 时段库存、容量冲突、服务组筛选 | `/merchant/inventory` | `src/features/merchant/InventoryView.vue`, `src/features/merchant/inventoryOperations.ts` | `/yy/bookingSlotInventory/list?serviceGroupId=...`, `/yy/bookingSlotInventory` | `InventoryView.contract.test.ts`, `inventoryOperations.test.ts`, `backend.contract.test.ts` | 新增库存字段先改 DTO，再改 store/backend query；统计卡片和筛选 options 优先改 `inventoryOperations.ts` |

## 商户和商品

| 用户说法 | 路由/功能 | 主要文件 | 数据/API | 测试 | 修改指引 |
| --- | --- | --- | --- | --- | --- |
| 门店管理、门店状态 | `/merchant/store`, 旧 `/store` | `src/features/stores/StoreView.vue` | `/yy/store/list` | `StoreView.contract.test.ts` | 门店指标和快捷筛选改 `StoreView.vue` |
| 服务组、承接容量 | `/merchant/service-groups` | `src/features/merchant/ServiceGroupsView.vue` | `/yy/serviceGroup/list`, `/yy/serviceGroup` | backend contract | 服务组表单字段改页面和 `ServiceGroupPayload` |
| 服务产品、套餐配置 | `/product/service`, 旧 `/config` | `src/features/products/ProductConfigView.vue`, `SelectionConfigModal.vue` | `/yy/product/list`, `/yy/product` | `ProductConfigView.contract.test.ts` | 产品字段改 `ProductConfigView.vue` 与 `productPayload()` |
| 附加产品、团单产品、冲印产品 | `/product/addon`, `/product/group`, `/product/print` | `src/features/products/DerivedProductModuleView.vue`, `derivedProductModules.ts` | 从 `yy_product` 派生 | `derivedProductModules.test.ts`, `DerivedProductModuleView.contract.test.ts` | 不建第二账本；正式细分字段见预实现方案 |
| 抖音产品、抖音商品映射 | `/product/douyin` | `src/features/products/DouyinProductsView.vue`, `douyinProductReadiness.ts` | `/yy/channelProductMapping/list?channelType=DOUYIN_LIFE` | `DouyinProductsView.contract.test.ts`, `douyinProductReadiness.test.ts` | 映射就绪规则改 `douyinProductReadiness.ts` |
| 渠道核销、抖音验收 logid、复制排障包 | `/order/verification` | `src/features/orders/ChannelVerificationView.vue`, `src/features/orders/channelVerificationOperations.ts` | `/yy/channel/DOUYIN_LIFE/acceptance-cases`, `/yy/channel/DOUYIN_LIFE/sync-health`, `/yy/channelSyncLog/list` | `ChannelVerificationView.contract.test.ts`, `channelVerificationOperations.test.ts` | 验收状态、logid 精确匹配、接口候选匹配和排障包文本改 `channelVerificationOperations.ts`；页面只处理加载、选中、复制和展示 |
| 美团产品 | `/product/meituan` | `DerivedProductModuleView.vue`, `derivedProductModules.ts` | `/yy/channelProductMapping/list?channelType=MEITUAN` | `derivedProductModules.test.ts` | 未授权时只显示真实空态，不写假 SKU |

## 客片和选片

| 用户说法 | 路由/功能 | 主要文件 | 数据/API | 测试 | 修改指引 |
| --- | --- | --- | --- | --- | --- |
| 客片管理、相册、上传照片、待上传深链 | `/service/photos`, 旧 `/photo-mgmt` | `src/features/albums/PhotoMgmtView.vue`, `photoMgmtOperations.ts` | `/yy/photoAlbum/list`, `/yy/photoAsset/list`, `/resource/oss/upload`, `/yy/photoAsset`；承接 `date`、`needsUpload=1` | `PhotoMgmtView.contract.test.ts`, `photoMgmtOperations.test.ts` | 上传链路改 `backendApi.uploadAlbumPhotos()`；页面规则先改 helper；首页待上传承接改 `filterDate/filterNeedsUpload` |
| 缩略图加载失败、批量选择、删除/重命名刷新 | 客片页内部 | `photoMgmtOperations.ts`, `PhotoMgmtView.vue`, `appStore.ts`, `backend.ts` | `yy_photo_asset.is_selected`，缩略图 URL 状态，`yy_photoAlbum/{id}` 权威相册详情 | `photoMgmtOperations.test.ts`, `PhotoMgmtView.contract.test.ts`, `backend.contract.test.ts`, `appStore.contract.test.ts`, `appStore.albumPhotos.test.ts` | 批量选片必须写回 `yy_photo_asset.is_selected`；删除/重命名后要重载后端相册详情；客户访问统计未接真表前不得伪造 |
| 客户访问日志、浏览记录、下载记录 | 客片页详情区 | `PhotoMgmtView.vue`, `photoMgmtOperations.ts`, `src/shared/api/backend.ts`, `src/shared/stores/appStore.ts` | `backendApi.listPhotoAccessLogs()`, `/yy/photoAccessLog/list`, `yy_photo_access_log` | `PhotoMgmtView.contract.test.ts`, `photoMgmtOperations.test.ts`, `backend.contract.test.ts`, `appStore.contract.test.ts` | 已接真实加载，日志从 `appStore.loadPhotoAccessLogs()` 进入页面；手机号、IP、签名 URL 必须脱敏，空数组保持真实空态 |
| 在线选片、客户选片链接、待选片/待交付深链 | `/service/selection`, 旧 `/online-selection` | `src/features/selection/OnlineSelectionView.vue` | 从 `yy_photo_album` / `yy_photo_asset` 派生；承接 `date`、`stage=pending-submit/selecting/done` | `OnlineSelectionView.contract.test.ts` | 链接展示改页面；链接构造改 `yingyueAdapter.ts`；首页选片/交付承接改 `filterDate/filterStage/linkBusinessDate` |
| 导出客户已选照片 | 在线选片导出 | `src/features/selection/selectionExport.ts` | `isSelected` / `is_selected` | `selectionExport.test.ts` | CSV 字段和转义只改纯函数并补测试 |

## 协作、资源、会员、营销、报表

| 用户说法 | 路由/功能 | 主要文件 | 数据/API | 测试 | 修改指引 |
| --- | --- | --- | --- | --- | --- |
| 工作执行概况 | `/collaboration/overview` | `WorkExecutionOverviewView.vue`, `workExecution.ts` | 订单、相册、选片链接派生 | `workExecution.test.ts`, `WorkExecutionOverviewView.contract.test.ts` | 当前一单只显示最靠后的一个环节 |
| 工单管理 | `/collaboration/work-orders` | `WorkOrdersView.vue`, `workOrders.ts`, `src/shared/api/backend.ts`, `backendTypes.ts` | `backendApi.listWorkOrders()`, `getWorkOrder()`, `listWorkOrderEvents()`, `transitionWorkOrder()` -> `/yy/workOrder/*` | `workOrders.test.ts`, `WorkOrdersView.contract.test.ts`, `backend.contract.test.ts`, `YyWorkOrderServiceImplTest` | 真表接入前页面保持派生工单池；后端和前端 API facade 已搭 CRUD + 流转事件骨架，生产迁移/权限/smoke 后再切页面 |
| 工单导出 | `/collaboration/export` | `WorkOrderExportView.vue`, `workOrderExport.ts` | 派生工单池 CSV | `workOrderExport.test.ts` | 导出字段改纯函数 |
| 环节统计 | `/collaboration/statistics` | `WorkOrderStatisticsView.vue`, `workOrderStats.ts` | 派生工单池 | `workOrderStats.test.ts` | 耗时/产能需要真事件表后再接 |
| 文件资源、样片作品 | `/resource/files`, `/resource/samples` | `DerivedResourceModuleView.vue`, `derivedResourceModules.ts` | `yy_photo_album`, `yy_photo_asset` | `derivedResourceModules.test.ts` | 样片公开发布前必须有授权/审核方案 |
| 客户档案 | `/member/customers` | `src/features/member/CustomersView.vue` | `/yy/customer/list`, `/yy/customer/{id}/orders` | `CustomersView.contract.test.ts` | 客户编辑字段改 `CustomerPayload` 和页面 |
| 会员账户、客户标签、消费记录 | `/member/accounts`, `/member/tags`, `/member/consumption` | `DerivedMemberModuleView.vue`, `derivedMemberModules.ts` | `yy_customer`, `yy_order` | `derivedMemberModules.test.ts` | 不创建积分/余额/标签第二账本 |
| 营销中心、优惠券、活动 | `/marketing/*` | `DerivedMarketingModuleView.vue`, `derivedMarketingModules.ts` | `yy_order`, `yy_customer` | `derivedMarketingModules.test.ts` | 不伪造券发放、领取、核销 |
| 报表、日报、月报、评价 | `/report/*` | `DerivedReportModuleView.vue`, `derivedReportModules.ts`, `src/shared/stores/appStore.ts` | 订单、员工、相册、客户派生；快照可读 `/yy/reportSnapshot/list` | `derivedReportModules.test.ts`, `DerivedReportModuleView.contract.test.ts`, `appStore.contract.test.ts` | `/report/reviews` 没有评价表/API 时必须真实空态；快照已接 `appStore.reportSnapshots` 和 `buildSnapshotAwareReportItems()`，无快照时继续标明派生来源 |

## 工具和设置

| 用户说法 | 路由/功能 | 主要文件 | 数据/API | 测试 | 修改指引 |
| --- | --- | --- | --- | --- | --- |
| 预约入口、取片入口、二维码 | `/tools/booking-entry`, `/tools/pickup-entry`, `/tools/share-links` | `ShareLinksView.vue`, `shareLinkOperations.ts` | `/yy/store/list` | `ShareLinksView.contract.test.ts`, `shareLinkOperations.test.ts` | 小程序路径、scene、H5 URL 改 `shareLinkOperations.ts` |
| 通知模板、通知日志 | `/tools/notifications` | `NotificationsView.vue` | `/yy/notificationTemplate/list`, `/yy/notificationLog/list` | `NotificationsView.contract.test.ts` | 模板字段改 `NotificationTemplatePayload` |
| 员工管理 | `/settings/employees` | `EmployeesView.vue` | `/yy/employee/list`, `/yy/employee` | `EmployeesView.contract.test.ts` | 员工字段改 `EmployeePayload` |
| 角色与权限 | `/settings/roles` | `RolesView.vue`, `rolesOperations.ts`, `studioAccessStore.ts` | bootstrap 权限体检 | `RolesView.contract.test.ts`, `studioAccessStore.test.ts` | 全局角色维护不在工作台执行 |
| 系统日志 | `/settings/logs` | `LogsView.vue`, `logsOperations.ts` | `/monitor/operlog/list`, `/yy/channelSyncLog/list` | `LogsView.contract.test.ts`, `logsOperations.test.ts` | 日志筛选、统计、复制文本改 `logsOperations.ts`；后端 query 参数改 `backend.ts` |
| 渠道配置 | `/settings/channels` | `ChannelsView.vue` | `/yy/channelProductMapping/list` | `ChannelsView.contract.test.ts` | Webhook/SPI 地址和合法域名改这里 |
| 工作台设置 | `/settings/workbench`, 旧 `/settings` | `SettingsView.vue` | 员工会话、本地运行状态 | `SettingsView.contract.test.ts` | 安全边界、运行模式、入口隔离说明改这里 |

## API 和骨架新增定位

| 用户说法 | 主要文件 | 状态 | 修改指引 |
| --- | --- | --- | --- |
| 渠道验收接口映射、同步健康映射 | `src/shared/api/backendChannelInsights.ts`, `backendChannelInsights.test.ts`, `backend.ts` | 已拆第一刀 | 后续继续拆 API slice 时保持 `backendApi` 外部方法不变 |
| 客片访问日志 adapter | `src/shared/api/backendTypes.ts`, `src/shared/api/backend.ts`, `src/shared/stores/appStore.ts` | 已接真实加载 | 页面接线用 `appStore.loadPhotoAccessLogs()`，展示前走 `summarizePhotoAccessLogs()` |
| 报表快照 adapter | `src/shared/api/backendTypes.ts`, `src/shared/api/backend.ts`, `src/shared/stores/appStore.ts`, `derivedReportModules.ts` | 已接真实加载 | 页面/Store 接线用 `appStore.loadReportSnapshots()`，无快照时保持派生说明 |
| 正式工单后端和前端 facade | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/**/YyWorkOrder*`, `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyWorkOrderServiceImplTest.java`, `studio-workbench/src/shared/api/backend.ts`, `studio-workbench/src/shared/api/backendTypes.ts`, `backend/script/sql/postgres/review_only_yy_work_order_migration_20260615.sql` | review-only CRUD + transition + event list + 前端 API facade 已生成 | 不重复生成 `workOrder`；下一步只能做权限菜单、页面切真表评估、smoke 和生产迁移审批 |
| 预约订单状态分组共享规则 | `studio-workbench/src/features/orders/orderOperations.ts`, `OrdersView.vue`, `DashboardView.vue`, `orderOperations.test.ts` | 已完成 | `全部有效订单 / 待服务 / 服务中 / 已完成 / 待支付 / 已取消 / 已退单` 只能改共享 helper；订单页和首页不能各写一套规则 |
| 国产模型批量执行入口 | `docs/domestic-model-batch-prompt-20260615.md`, `docs/domestic-model-current-status-20260615.md` | 已准备 | 直接复制批量提示词给国产模型；它完成后由 Codex review |
| 员工-门店绑定 | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyEmployeeStore.java` + 对应 migration | 新增实体 | 员工多门店绑定关系表，支持多对多 |
| 抖音来客订单归店解析 | `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IDouyinLifeStoreResolver.java`, `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/DouyinLifeStoreResolver.java` | 已完成 | `DOUYIN_LIFE` 订单通过 `externalPoiId`/`externalSkuId` 解析 storeId/productId；由 `DouyinLifeChannelAdapter.upsertLocalOrder()` 调用 |
| 抖音来客归店解析文档 | `docs/douyin-life-order-store-resolution.md` | 新建 | POI+Sku 精确匹配 → HIT；POI-only 多门店 → AMBIGUOUS；未命中 → NOT_FOUND + NEED_MAPPING |
| 异常概览仪表盘 | `studio-workbench/src/features/dashboard/DashboardView.vue` (Section: 异常概览) | 已接真实数据 | 展示 `anomalyPreStats.missingStoreMapping / missingArrivalTime / missingProductName` |
| 订单异常筛选 | `studio-workbench/src/features/orders/OrdersView.vue` (异常筛选区块) | 已实现 | 支持按 `missingStore / missingArrival / missingProduct` 筛选订单 |
| 抖音来客映射门店视图 | `studio-workbench/src/features/stores/StoreView.vue` (DOUYIN_LIFE 映射区块) | 已实现 | 按门店聚合展示 `channelProductMapping` 中 DOUYIN_LIFE 的 externalPoiId/externalSkuId/mappingStatus |

## 数据层修改顺序

1. 新后端字段：先改 `src/shared/api/backendTypes.ts`。
2. RuoYi VO 到工作台 DTO：再改 `src/shared/api/yingyueAdapter.ts`。
3. API 调用：再改 `src/shared/api/backend.ts`。
4. Store 展示模型：再改 `src/shared/stores/appStoreTypes.ts` 和 `appStoreTransforms.ts`。
5. 页面渲染：最后改对应 `src/features/**` 页面。
6. 测试：同一任务至少补一个纯函数或契约测试。

## 禁区

- 不在工作台里伪造支付成功、券核销、渠道评分、报表收入。
- 不把 `Date.now()` 或前端随机数当数据库 ID。
- 不把客户取片登录态复用给员工工作台。
- 不把 OSS 改成公开读。
- 不把 `DOUYIN_LIFE` 真实支付和 `DOUYIN_MINI_APP tt.pay` 合并。
