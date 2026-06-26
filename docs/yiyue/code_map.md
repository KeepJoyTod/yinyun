# 影约云代码地图

更新时间：2026-06-24

## 2026-06-26 product-function-inventory-84-scaffold-acceptance

### 表现层
- `studio-workbench/src/features/system/ModuleScaffoldView.vue`
- `studio-workbench/src/features/system/moduleScaffold.ts`
- `studio-workbench/src/features/system/scaffoldAcceptanceMappings.ts`
- `studio-workbench/src/features/products/productModuleScaffold.ts`
- `studio-workbench/src/features/products/components/ProductModuleScaffoldPanel.vue`
- `studio-workbench/src/features/products/DerivedProductModuleView.vue`
- ``studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue``
- ``studio-workbench/src/features/marketing/MarketingCouponsView.vue``
- `studio-workbench/src/features/platform-settings/platformSettingsScaffolds.ts`
- `mobile-uniapp/src/pages/my/index.vue`
- `mobile-uniapp/src/pages/coupons/index.vue`

### 控制逻辑层
- 共享脚手架元数据新增 `inventoryCodes / acceptanceLabel / boundaryNotes / nextActions`。
- 客户端继续复用 `useCustomerExperienceP1.ts`；商品、会员、营销、平台继续复用现有 facade，不补高风险写接口。

### 说明
- `scaffoldAcceptanceMappings.ts` 是 21 项编号到 canonical owner、边界说明和下一步动作的唯一事实源。
- `B-023/B-024/B-025` 仍复用 `yy_product` 主账本，但页面已升级为标准 scaffold 兼容页。

## 2026-06-25 consumer-merchant-p1-scaffold

### 表现层
- `mobile-uniapp/src/pages/product/detail/index.vue`
- `mobile-uniapp/src/pages/coupons/index.vue`
- `mobile-uniapp/src/pages/my/index.vue`
- `mobile-uniapp/src/pages/reviews/index.vue`
- `studio-workbench/src/features/merchant/modules/consumer-ops-p1/MerchantConsumerOpsP1View.vue`
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`

### 控制逻辑层
- `mobile-uniapp/src/composables/useCustomerExperienceP1.ts`
- `mobile-uniapp/src/api/customerExperienceP1.ts`
- `mobile-uniapp/src/types/customerExperienceP1.ts`
- `studio-workbench/src/features/merchant/modules/consumer-ops-p1/composables/useMerchantConsumerOpsP1State.ts`
- `studio-workbench/src/features/merchant/modules/consumer-ops-p1/merchantConsumerOpsP1Operations.ts`
- `studio-workbench/src/shared/api/backendConsumerOpsP1Api.ts`
- `studio-workbench/src/shared/api/backendTypesConsumerOpsP1.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyClientExperienceP1Controller.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMerchantConsumerOpsP1Controller.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyClientExperienceP1Service.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyMerchantConsumerOpsP1Service.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyClientExperienceP1ServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMerchantConsumerOpsP1ServiceImpl.java`

### 持久数据层
- 本包不新增表、不新增 Mapper、不跑迁移。
- 只声明既有账本边界：``yy_order``、``yy_customer``、`yy_booking_slot_inventory`、营销券、会员资产、通知日志、装修配置、服务组、资源/相册。

### 说明
- 本轮只搭 P1 消费者体验与商户运营脚手架 owner，不接真实支付、权益核销、退款、通知 SDK、评价账本和财务对账。
- 客户端新增卡券权益和评价 owner；商户端新增消费者运营 P1 聚合页。

## 2026-06-25 merchant-readiness-scaffold

### 表现层
- `studio-workbench/src/features/merchant/modules/readiness/MerchantReadinessView.vue`
- `studio-workbench/src/features/merchant/modules/readiness/components/MerchantReadinessOwnerShell.vue`
- `studio-workbench/src/features/merchant/modules/readiness/components/MerchantReadinessBoard.vue`
- `studio-workbench/src/features/merchant/modules/schedule-governance/MerchantScheduleGovernanceView.vue`
- `studio-workbench/src/features/merchant/modules/channel-readiness/MerchantChannelReadinessView.vue`
- `studio-workbench/src/features/merchant/modules/governance/MerchantGovernanceView.vue`
- `studio-workbench/src/features/merchant/modules/dependency-readiness/MerchantDependencyReadinessView.vue`
- `studio-workbench/src/features/merchant/merchantChrome.ts`
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`

### 控制逻辑层
- `studio-workbench/src/features/merchant/modules/readiness/composables/useMerchantReadinessState.ts`
- `studio-workbench/src/features/merchant/modules/readiness/merchantReadinessOperations.ts`
- `studio-workbench/src/shared/api/backendMerchantReadinessApi.ts`
- `studio-workbench/src/shared/api/backendTypesMerchant.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMerchantReadinessController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyMerchantReadinessService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMerchantReadinessServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyMerchantReadinessItemVo.java`

### 持久数据层
- 本包不新增表、不写表、不跑迁移。
- readiness 证据引用产品清单和地图；真实业务账本仍以 ``yy_order``、`yy_booking_slot_inventory` 为边界。
- 四个 owner wrapper 均复用 readiness shell 和后端只读接口，不新增写表逻辑。

## 2026-06-24 dashboard-wave1-module-split

### 表现层
- `studio-workbench/src/features/dashboard/DashboardView.vue`
- `studio-workbench/src/features/dashboard/modules/home/DashboardHomeView.vue`
- `studio-workbench/src/features/dashboard/DashboardFinanceOverview.vue`
- `studio-workbench/src/features/dashboard/DashboardProductRanking.vue`
- `studio-workbench/src/features/dashboard/DashboardConversion.vue`
- `studio-workbench/src/features/dashboard/DashboardQuickEntries.vue`
- `studio-workbench/src/features/dashboard/DashboardOperationsPanel.vue`
- `studio-workbench/src/features/dashboard/DashboardScheduleSection.vue`

### 控制逻辑层
- `studio-workbench/src/features/dashboard/modules/home/composables/useDashboardHomeState.ts`
- `studio-workbench/src/features/dashboard/modules/home/composables/useDashboardHomeInsights.ts`
- `studio-workbench/src/features/dashboard/modules/home/composables/useDashboardHomeExport.ts`
- `studio-workbench/src/features/dashboard/modules/home/composables/useDashboardHomeRouting.ts`
- `studio-workbench/src/features/dashboard/modules/home/dashboardHomeOperations.ts`
- `studio-workbench/src/features/dashboard/useDashboardBusinessInsights.ts`
- `studio-workbench/src/features/dashboard/dashboardPresentation.ts`
- `studio-workbench/src/shared/api/backendDashboardApi.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyDashboardServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardOrderQuerySupport.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardMetricsAssembler.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardScheduleAssembler.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardExportAssembler.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardDomainSupport.java`

### 持久数据层
- ``yy_order``
- `yy_booking_slot_inventory`
- `yy_store`

### 说明
- `DashboardView.vue` 已收口为承接 `DashboardHomeView.vue` 的薄壳，旧入口 `useDashboardBusinessInsights.ts` 和 `dashboardPresentation.ts` 继续保留兼容外观。
- `YyDashboardServiceImpl.java` 已收口为公开入口编排，原有订单查询、指标聚合、排期装配和导出组装已拆到 `service/dashboard/*` owner。

## 2026-06-24 marketing-phase2-merchant-closed-loop

### 表现层
- ``studio-workbench/src/features/marketing/MarketingCouponsView.vue``
- `studio-workbench/src/features/marketing/MarketingCampaignsView.vue`
- `studio-workbench/src/features/marketing/MarketingParticipationsView.vue`
- `studio-workbench/src/features/marketing/MarketingCenterView.vue`
- `studio-workbench/src/features/marketing/components/CouponTemplateTable.vue`
- `studio-workbench/src/features/marketing/components/CouponTemplateDrawer.vue`
- `studio-workbench/src/features/marketing/components/CouponIssueDrawer.vue`
- `studio-workbench/src/features/marketing/components/CouponInstanceTable.vue`
- `studio-workbench/src/features/marketing/components/CampaignTable.vue`
- `studio-workbench/src/features/marketing/components/CampaignDrawer.vue`
- `studio-workbench/src/features/marketing/components/CampaignStatusActionBar.vue`
- `studio-workbench/src/features/marketing/components/ParticipationFilters.vue`
- `studio-workbench/src/features/marketing/components/ParticipationTable.vue`

### 控制逻辑层
- `studio-workbench/src/features/marketing/composables/useCouponTemplates.ts`
- ``studio-workbench/src/features/marketing/composables/useCouponIssuance.ts``
- `studio-workbench/src/features/marketing/composables/useCampaignEditor.ts`
- `studio-workbench/src/features/marketing/composables/useCampaignParticipation.ts`
- `studio-workbench/src/features/marketing/composables/useMarketingCapabilityGate.ts`
- `studio-workbench/src/shared/api/backendMarketingCouponsApi.ts`
- `studio-workbench/src/shared/api/backendMarketingCampaignsApi.ts`
- `studio-workbench/src/shared/api/backendMarketingParticipationsApi.ts`
- `studio-workbench/src/shared/api/backendMarketingCapabilitiesApi.ts`
- `studio-workbench/src/shared/api/backendMarketingApi.ts`
- `studio-workbench/src/shared/api/backendTypesMarketing.ts`

### 数据层
- 前端真实读写后端营销表：``yy_coupon_template``、``yy_coupon_instance``、``yy_coupon_grant_record``、`yy_coupon_writeoff_record`、`yy_campaign`、`yy_campaign_product`、`yy_campaign_participation`。
- 订单联动继续读取 ``yy_order``，不复制订单主账本。

## 2026-06-24 full-product-closed-loop-phase234-scaffold

### 表现层
- `studio-workbench/src/features/system/ModuleScaffoldView.vue`
- `studio-workbench/src/features/member/memberScaffolds.ts`
- `studio-workbench/src/features/marketing/marketingScaffolds.ts`
- `studio-workbench/src/features/resources/resourceScaffolds.ts`
- `studio-workbench/src/features/reports/reportScaffolds.ts`
- `studio-workbench/src/features/collaboration/collaborationScaffolds.ts`
- `studio-workbench/src/features/service-production/serviceProductionScaffolds.ts`

### 控制逻辑层
- `studio-workbench/src/features/system/moduleScaffold.ts`
- `studio-workbench/src/features/system/phaseModuleRegistry.ts`
- `studio-workbench/src/features/system/phase234ModuleScaffolds.ts`
- `studio-workbench/src/shared/api/backendToolsApi.ts`
- `studio-workbench/src/shared/api/backendTypesTools.ts`
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`

### 说明
- 本轮把 Phase 2~4 的域 owner 元数据从分散页面说明收口到统一 registry。
- `platform/account/finance` 从“仅 loader、无 feature 注册”补成一等导航与路由入口。
- 旧样片路径 `/tools/photo/sample` 改为兼容跳转，正式 owner 路径切到 `/tools/sample-works`。
- 共享 `ModuleScaffoldView` 已升级为阶段化三层楼骨架，可展示 `phase / ownerStatus / ownerLayers`。
- 工具中心新增独立 API/type owner，`toolScaffolds.ts` 不再只登记裸 HTTP 字符串。

## 2026-06-24 full-product-closed-loop-phase1

### 控制逻辑层
- `studio-workbench/src/shared/api/backendPaymentsApi.ts`
- `studio-workbench/src/shared/api/backendInventoryApi.ts`
- `studio-workbench/src/shared/api/backendAuditApi.ts`
- `studio-workbench/src/shared/api/backendTypesPhase1.ts`
- `studio-workbench/src/shared/api/backend.ts`
- `studio-workbench/src/shared/api/backend.contract.test.ts`
- `studio-workbench/src/features/orders/composables/useOrderDetailActions.ts`
- `studio-workbench/src/shared/stores/workbenchOperationalStore.ts`

### 说明
- 本轮把 `订单 / 支付确认 / 排期库存 / 审计` 的前端 API owner 从旧 `orders / merchant config / merchant ops` 中拆成独立 slice。
- `backendApi` 兼容外观保留，页面与 store 继续通过同一 facade 调用。
- 退款真实写链路未新增，只保留字段与证据链契约。
- 订单详情抽屉刷新证据时，会同时拉取 `sys_oper_log` 和 `yy_channel_sync_log`，确认收款/改期/取消后的 `requestId/logid` 可以跟随工作台局部刷新一起回显。

## 2026-06-24 full-product-closed-loop-phase0

### 表现层
- `studio-workbench/src/features/platform-settings/*`
- `studio-workbench/src/features/account-center/*`
- `studio-workbench/src/features/finance-center/*`
- `studio-workbench/src/features/tools/SampleWorksView.vue`
- `studio-workbench/src/features/tools/PrecisionDeliveryView.vue`
- `mobile-uniapp/src/pages/coupons/index.vue`
- `mobile-uniapp/src/pages/profile/index.vue`

### 控制逻辑层
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`
- `studio-workbench/src/shared/api/backendTypesPlatform.ts`
- `studio-workbench/src/shared/api/backendTypesAccount.ts`
- `studio-workbench/src/shared/api/backendTypesFinance.ts`
- `mobile-uniapp/src/domainRegistry.ts`

### 说明
- 本轮只搭 Phase 0 脚手架，不写真实平台设置、账号中心、费用中心业务账本。
- `admin-ui` 继续只作为迁移参考，不新增 owner。

## 2026-06-24 product-module-close-gap

### 表现层
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/features/products/ProductCardCatalogView.vue`
- `studio-workbench/src/features/products/DerivedProductModuleView.vue`
- `studio-workbench/src/features/products/components/AlbumProductReadinessPanel.vue`
- `studio-workbench/src/features/products/components/AlbumProductFulfillmentModal.vue`

### 控制逻辑层
- `studio-workbench/src/features/products/derivedProductModules.ts`
- `studio-workbench/src/features/products/productCardCatalogOperations.ts`
- `studio-workbench/src/features/products/albumProductReadiness.ts`
- `studio-workbench/src/features/products/albumProductFulfillmentEvidence.ts`
- `studio-workbench/src/shared/stores/productStoreTransforms.ts`
- `studio-workbench/src/shared/api/backendProductsApi.ts`
- `studio-workbench/src/shared/products/albumProductMetadata.ts`
- `studio-workbench/src/shared/stores/collaborationStore.ts`

## 2026-06-26 finance-export-async-closed-loop

### 表现层
- `studio-workbench/src/features/reports/ReportFinanceReconciliationView.vue`
- `studio-workbench/src/features/platform-settings/PlatformTaskCenterView.vue`
- `studio-workbench/src/features/platform-settings/components/PlatformPhase1StatusPanel.vue`

### 控制逻辑层
- `studio-workbench/src/features/reports/composables/useReportFinanceReconciliation.ts`
- `studio-workbench/src/features/reports/reportFinanceReconciliationOperations.ts`
- `studio-workbench/src/shared/api/backendReportsApi.ts`
- `studio-workbench/src/shared/api/backendPlatformApi.ts`
- `studio-workbench/src/shared/api/backendTypesReports.ts`
- `studio-workbench/src/shared/api/backendTypesPlatform.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyReportFinanceReconciliationController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyPlatformSettingsController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyAsyncTaskService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyPlatformSettingsService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyReportFinanceReconciliationService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyAsyncTaskServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPlatformSettingsServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyReportFinanceExportWorkerService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyReportFinanceReconciliationServiceImpl.java`

### 持久数据层
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyAsyncTask.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyPlatformAsyncTaskDetailVo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyPlatformAsyncTaskRunVo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyReportFinanceExportPayloadVo.java`
- `backend/script/sql/yy_cloud.sql`
- `backend/script/sql/postgres/postgres_yy_cloud.sql`

## 2026-06-25 platform-enterprise-scaffold

### 表现层
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`
- `studio-workbench/src/features/platform-settings/PlatformLoginRiskView.vue`
- `studio-workbench/src/features/platform-settings/PlatformOpenApiView.vue`
- `studio-workbench/src/features/platform-settings/PlatformTaskCenterView.vue`
- `studio-workbench/src/features/platform-settings/PlatformBackupRecoveryView.vue`
- `studio-workbench/src/features/platform-settings/PlatformMeituanReviewTraceView.vue`

### 控制逻辑层
- `studio-workbench/src/features/platform-settings/platformSettingsScaffolds.ts`
- `studio-workbench/src/features/platform-settings/composables/usePlatformSettingsList.ts`
- `studio-workbench/src/shared/api/backendPlatformApi.ts`
- `studio-workbench/src/shared/api/backendTypesPlatform.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyPlatformSettingsController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyPlatformSettingsService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPlatformSettingsServiceImpl.java`

### 持久数据层
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyPlatformLoginRiskPolicyVo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyPlatformOpenApiAppVo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyPlatformAsyncTaskVo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyPlatformBackupRecoveryVo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyPlatformMeituanReviewTraceVo.java`

### 说明
- 本轮只搭平台与企业级能力脚手架，不新增数据库表。
- 只读证据优先复用 `yy_channel_account`、`yy_channel_sync_log`、`yy_notification_*`、`yy_service_license_binding`；缺真实账本时返回 scaffold 状态。
- `studio-workbench/src/shared/api/backendCollaborationApi.ts`

### 持久数据层
- 真实商品账本：`yy_product`
- 入册履约配置账本：`yy_product_collaboration_config`
- 对应后端 VO：`backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyProductVo.java`
- 对应后端实体：`backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyProductCollaborationConfig.java`

## 2026-06-24 customer-payment-inventory-closed-loop part4/part5

### part4 移动端客户支付脚手架

- 表现层：
  - `mobile-uniapp/src/pages/product/detail/index.vue`
  - `mobile-uniapp/src/pages/customer/orders/index.vue`
- 控制逻辑层：
  - `mobile-uniapp/src/pages/customer/orders/customerPaymentFlow.ts`
  - `mobile-uniapp/src/api/customer.ts`
  - `mobile-uniapp/src/utils/customer-payment-placeholder.mjs`
- 契约类型：
  - `mobile-uniapp/src/types/clientPhoto.ts`
- 测试：
  - `mobile-uniapp/tests/customer-payment-placeholder.test.cjs`
  - `mobile-uniapp/tests/customer-orders-page-governance.test.cjs`

说明：
- 产品详情页和订单页都不再各自拼支付流程，统一由 `customerPaymentFlow.ts` 负责发起支付、判断 fallback、成功后刷新或跳转。
- `customer-payment-placeholder.mjs` 仍是“是否允许拉起支付”的唯一闸门。

### part5 工作台确认收款脚手架

- 表现层：
  - `studio-workbench/src/features/orders/OrderDetailActionSections.vue`
  - `studio-workbench/src/features/orders/OrderDetailDrawer.vue`
  - `studio-workbench/src/features/orders/OrderDetailDrawerHost.vue`
  - `studio-workbench/src/features/orders/OrderDetailDrawerWorkspace.vue`
  - `studio-workbench/src/features/orders/OrdersView.vue`
  - `studio-workbench/src/features/orders/OrdersViewOverlays.vue`
- 控制逻辑层：
  - `studio-workbench/src/features/orders/composables/useOrderDetailActions.ts`
  - `studio-workbench/src/features/orders/composables/useOrderDetailDrawerContext.ts`
  - `studio-workbench/src/features/orders/orderPaymentRules.ts`
  - `studio-workbench/src/shared/api/backend.ts`
  - ``studio-workbench/src/shared/stores/appStore.ts``
- 测试：
  - `studio-workbench/src/features/orders/OrdersView.contract.test.ts`
  - `studio-workbench/src/shared/api/backend.contract.test.ts`

说明：
- “确认收款”按钮显隐规则已经抽到 `orderPaymentRules.ts`，避免详情抽屉和动作 owner 双份判断。
- 前端真实调用通过 `backend.ts` 的 `confirmOrderPayment(...)` facade 进入，成功后继续走 `appStore.refreshOrderOperationalScope(order)` 刷新工作台范围数据。

## 2026-06-24 service-production-closed-loop

### 表现层

- `studio-workbench/src/features/service-production/RetouchCenterView.vue`
- `studio-workbench/src/features/service-production/RetouchProvidersView.vue`
- `studio-workbench/src/features/collaboration/CollaborationRetouchCenterSettingsView.vue`
- `studio-workbench/src/features/collaboration/CollaborationCommonSettingsView.vue`
- `studio-workbench/src/features/collaboration/CollaborationOpenSettingsView.vue`

### 控制逻辑层

- `studio-workbench/src/features/service-production/composables/useServiceProduction.ts`
- `studio-workbench/src/features/service-production/serviceProductionOperations.ts`
- `studio-workbench/src/shared/api/backendServiceProductionApi.ts`
- `studio-workbench/src/shared/api/backend.ts`
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyServiceProductionController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyServiceProductionService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyServiceProductionServiceImpl.java`

### 持久数据层

- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyRetouchProvider.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyRetouchTask.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyCollaborationPolicy.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyServiceLicenseBinding.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/mapper/YyRetouchProviderMapper.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/mapper/YyRetouchTaskMapper.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/mapper/YyCollaborationPolicyMapper.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/mapper/YyServiceLicenseBindingMapper.java`
- `backend/script/sql/yy_service_production_migration_20260624.sql`
- `backend/script/sql/postgres/postgres_yy_service_production_migration_20260624.sql`
## 2026-06-24 marketing-domain-scaffold

### 表现层
- `studio-workbench/src/features/marketing/MarketingCenterView.vue`
- ``studio-workbench/src/features/marketing/MarketingCouponsView.vue``
- `studio-workbench/src/features/marketing/MarketingCampaignsView.vue`
- `studio-workbench/src/features/marketing/MarketingParticipationsView.vue`
- `studio-workbench/src/features/marketing/components/MarketingCapabilityGateCard.vue`
- `studio-workbench/src/features/marketing/components/CampaignOrderLinkPanel.vue`
- `studio-workbench/src/features/marketing/components/PromotionTrialPanel.vue`
- `studio-workbench/src/features/orders/CampaignOrdersView.vue`

### 控制逻辑层
- `studio-workbench/src/shared/api/backendMarketingApi.ts`
- `studio-workbench/src/shared/api/backendTypesMarketing.ts`
- `studio-workbench/src/features/marketing/promotionPricingFacade.ts`
- `studio-workbench/src/features/marketing/campaignOrderBridge.ts`
- `studio-workbench/src/features/marketing/composables/useMarketingCapabilityGate.ts`
- `studio-workbench/src/features/marketing/composables/useCouponTemplates.ts`
- `studio-workbench/src/features/marketing/composables/useCampaignEditor.ts`
- `studio-workbench/src/features/marketing/composables/useCampaignParticipation.ts`
- `studio-workbench/src/features/marketing/composables/usePromotionTrial.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMarketingController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMarketingCapabilityController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyCouponTemplateController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyCampaignController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyCampaignParticipationController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyPromotionTrialController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/marketing/policy/PromotionPriorityPolicy.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/marketing/policy/PromotionRefundRestorePolicy.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/marketing/resolver/PromotionCapabilityResolver.java`

### 持久数据层
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyCouponTemplate.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyCouponInstance.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyCouponGrantRecord.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyCouponWriteoffRecord.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyCampaign.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyCampaignProduct.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyCampaignParticipation.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyPromotionCapability.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyPromotionTrialSnapshot.java`
- `backend/script/sql/20260624_marketing_domain_scaffold.sql`
- `backend/script/sql/postgres/20260624_marketing_domain_scaffold.sql`
## 2026-06-24 member-module-phase1

### 表现层
- ``studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue``
- ``studio-workbench/src/features/member/modules/transactions/MemberTransactionsView.vue``

### 控制逻辑层
- `studio-workbench/src/shared/api/backendMemberApi.ts`
- `studio-workbench/src/shared/stores/memberStore.ts`
- ``studio-workbench/src/features/member/modules/assets/useMemberAssetOverview.ts``
- ``studio-workbench/src/features/member/modules/transactions/useMemberTransactions.ts``
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMemberAssetController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyMemberAssetService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMemberAssetServiceImpl.java`

### 持久数据层
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyMemberAccount.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyMemberCardInstance.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyMemberBenefitLedger.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyMemberPointsLedger.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyMemberGrowthLedger.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyMemberBalanceLedger.java`
- `backend/script/sql/20260624_member_module_scaffold.sql`
- `backend/script/sql/postgres/20260624_member_module_scaffold.sql`

## 2026-06-24 member-recharge-closed-loop

### 表现层
- ``studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue``
- `studio-workbench/src/features/member/modules/assets/components/MemberRechargeModal.vue`

### 控制逻辑层
- `studio-workbench/src/features/member/modules/assets/useMemberRecharge.ts`
- `studio-workbench/src/shared/stores/memberRechargeStore.ts`
- `studio-workbench/src/shared/api/backendMemberApi.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMemberRechargeController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyMemberRechargeService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMemberRechargeServiceImpl.java`

### 持久数据层
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyMemberRechargeOrder.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyMemberRechargeCreateBo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyMemberRechargeOrderVo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/mapper/YyMemberRechargeOrderMapper.java`

## 2026-06-24 auth-foundation-phase2-collaboration

### 表现层
- `studio-workbench/src/features/collaboration/CollaborationOpenSettingsView.vue`
- `studio-workbench/src/features/system/FeatureGateStatusCard.vue`

### 控制逻辑层
- `studio-workbench/src/features/collaboration/composables/useCollaborationOpenSettings.ts`
- `studio-workbench/src/features/collaboration/collaborationLicenseOperations.ts`
- `studio-workbench/src/shared/api/backendFeatureScopeApi.ts`
- `studio-workbench/src/shared/api/backendTypesAccess.ts`
- `studio-workbench/src/features/system/featureGate.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyFeatureScopeController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyFeatureScopeService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyFeatureScopeServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyCollaborationController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyCollaborationServiceImpl.java`

### 持久数据层
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyFeatureScopeVo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyCollaborationLicenseBo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyCollaborationLicenseVo.java`
- `yy_service_license_binding` 继续作为唯一协作许可证账本，本包未新增表或迁移 SQL。

## 2026-06-24 internal-collaboration-work-order-stage-sla

### 表现层
- `studio-workbench/src/features/collaboration/WorkOrdersView.vue`
- `studio-workbench/src/features/collaboration/WorkOrderExportView.vue`
- `studio-workbench/src/features/collaboration/WorkOrderStatisticsView.vue`
- `studio-workbench/src/features/collaboration/WorkExecutionOverviewView.vue`

### 控制逻辑层
- `studio-workbench/src/features/collaboration/useCollaborationWorkOrders.ts`
- `studio-workbench/src/features/collaboration/workOrderRuntime.ts`
- `studio-workbench/src/shared/api/backendWorkOrdersApi.ts`
- `studio-workbench/src/shared/api/backendTypesPayloads.ts`
- `studio-workbench/src/shared/api/backendRowMappers.ts`
- `studio-workbench/src/shared/api/backendQueryMappers.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyWorkOrderServiceImpl.java`

### 持久数据层
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/YyWorkOrder.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyWorkOrderVo.java`
- `backend/script/sql/20260624_work_order_stage_due_time.sql`
- `backend/script/sql/postgres/20260624_work_order_stage_due_time.sql`

### 测试
- `studio-workbench/src/features/collaboration/workOrderRuntime.test.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyWorkOrderServiceImplTest.java`
## 2026-06-24 platform-settings-phase1

### Presentation
- `studio-workbench/src/features/platform-settings/PlatformIntegrationView.vue`
- `studio-workbench/src/features/platform-settings/PlatformNotificationCenterView.vue`
- `studio-workbench/src/features/platform-settings/PlatformServicePackagesView.vue`
- `studio-workbench/src/features/platform-settings/components/PlatformPhase1StatusPanel.vue`
- `studio-workbench/src/features/platform-settings/composables/usePlatformSettingsList.ts`

### Control
- `studio-workbench/src/shared/api/backendPlatformApi.ts`
- `studio-workbench/src/shared/api/backendTypesPlatform.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyPlatformSettingsController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyPlatformSettingsService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPlatformSettingsServiceImpl.java`

### Data
- `yy_channel_account`
- `yy_channel_sync_log`
- `yy_channel_event_inbox`
- `yy_notification_template`
- `yy_notification_log`
- `yy_service_license_binding`
- `yy_platform_setting`
## 2026-06-24 phase3-center-api-owner

### 表现层
- `studio-workbench/src/features/tools/toolScaffolds.ts`

### 控制逻辑层
- `studio-workbench/src/shared/api/backendToolsApi.ts`
- `studio-workbench/src/shared/api/backendAccountApi.ts`
- `studio-workbench/src/shared/api/backendFinanceApi.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyToolCenterController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyAccountCenterController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyFinanceCenterController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyToolCenterService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyAccountCenterService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyFinanceCenterService.java`

## 2026-06-25 member-recharge-read-side

### 表现层
- ``studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue``

### 控制逻辑层
- ``studio-workbench/src/features/member/modules/assets/useMemberAssetOverview.ts``
- `studio-workbench/src/shared/stores/memberStore.ts`
- `studio-workbench/src/shared/stores/memberRechargeStore.ts`
- `studio-workbench/src/shared/api/backendMemberApi.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMemberRechargeController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMemberRechargeServiceImpl.java`

### 持久数据层
- ``yy_member_recharge_order``
- ``yy_member_balance_ledger``
- ``yy_member_account``

## 2026-06-24 resource-collaboration-closed-loop-phase1

### 表现层
- `studio-workbench/src/features/resources/ResourceManageView.vue`
- `studio-workbench/src/features/resources/ResourceTagsView.vue`
- `studio-workbench/src/features/resources/ResourceUsageView.vue`
- `studio-workbench/src/features/collaboration/WorkOrdersView.vue`
- `studio-workbench/src/features/system/FeatureGateStatusCard.vue`

### 控制逻辑层
- `studio-workbench/src/features/system/useFeatureScopeGate.ts`
- `studio-workbench/src/features/resources/composables/useResourceManage.ts`
- `studio-workbench/src/features/resources/composables/useResourceUsage.ts`
- `studio-workbench/src/features/resources/composables/useResourceTagMutations.ts`
- `studio-workbench/src/features/collaboration/useCollaborationWorkOrders.ts`
- `studio-workbench/src/shared/api/backendResourcesApi.ts`
- `studio-workbench/src/shared/api/backendWorkOrdersApi.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyWorkOrderServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyFeatureScopeServiceImpl.java`

### 持久数据层
- 本包不新增表、不新增迁移 SQL。
- 资源继续使用 `yy_photo_asset`、`yy_photo_tag`、`yy_photo_asset_tag`。
- 协同工单继续使用 `yy_work_order`、`yy_work_order_event`。

### 持久数据层
- 本包不新增库表，工具中心读取 `yy_photo_album / `yy_customer` / yy_notification_log`。
- 账号中心读取登录态和 `yy_store`，品牌切换本包只返回响应级默认品牌。
- 费用中心读取 `yy_payment_record`，不新增充值、退款、提现写链路。

## 2026-06-25 product-module-full-chain-scaffold

### 表现层
- `studio-workbench/src/features/products/catalog/ProductCatalogModuleView.vue`
- `studio-workbench/src/features/products/sku/ProductSkuModuleView.vue`
- `studio-workbench/src/features/products/category/ProductCategoryModuleView.vue`
- `studio-workbench/src/features/products/relation/ProductRelationModuleView.vue`
- `studio-workbench/src/features/products/booking-rules/ProductBookingRulesModuleView.vue`
- `studio-workbench/src/features/products/channel/ProductChannelModuleView.vue`
- `studio-workbench/src/features/products/cards/ProductCardsModuleView.vue`
- `studio-workbench/src/features/products/components/ProductModuleScaffoldPanel.vue`

### 控制逻辑层
- `studio-workbench/src/shared/api/backendProductCatalogApi.ts`
- `studio-workbench/src/shared/api/backendProductSkuApi.ts`
- `studio-workbench/src/shared/api/backendProductCategoryApi.ts`
- `studio-workbench/src/shared/api/backendProductRelationApi.ts`
- `studio-workbench/src/shared/api/backendProductBookingRuleApi.ts`
- `studio-workbench/src/shared/api/backendProductChannelConfigApi.ts`
- `studio-workbench/src/shared/stores/productCatalogStore.ts`
- `studio-workbench/src/shared/stores/productCatalogTransforms.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyProductCatalogController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyProductCatalogServiceImpl.java`

### 持久数据层
- `yy_product` 继续作为唯一商品主账本。
- `backend/script/sql/20260625_product_module_scaffold.sql`
- `yy_product_category`
- `yy_product_sku`
- `yy_product_display_config`
- `yy_product_relation`
- `yy_product_booking_rule`
- `yy_product_channel_config`
- `yy_product_fulfillment_rule`
## 2026-06-25 P0 交易安全第一包

### Backend owners
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyBookingSlotInventoryController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyRiskApprovalController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderRefundController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyScheduleGovernanceServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyRiskApprovalServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderRefundServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMemberRechargeServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyFeatureScopeServiceImpl.java`

### Data owners
- `yy_schedule_exception_rule`：排期临时关档、恢复、容量覆盖规则。
- `yy_risk_approval`：`SLOT_CLOSE_WITH_PAID_ORDER`、`ORDER_REFUND`、`MEMBER_RECHARGE_CONFIRM` 审批账本。
- SQL 基线：`backend/script/sql/postgres/postgres_yy_cloud.sql`、`backend/script/sql/yy_cloud.sql`。

### Frontend owners
- `studio-workbench/src/features/merchant/modules/schedule-governance/MerchantScheduleGovernanceView.vue`
- `studio-workbench/src/features/merchant/modules/governance/MerchantGovernanceView.vue`
- `studio-workbench/src/features/orders/OrderDetailActionSections.vue`
- `studio-workbench/src/features/member/modules/assets/useMemberRecharge.ts`
- `studio-workbench/src/shared/api/backendInventoryApi.ts`
- `studio-workbench/src/shared/api/backendRiskApprovalApi.ts`
- `studio-workbench/src/shared/api/backendOrdersApi.ts`

## 2026-06-25 transaction-safety-scaffold

### 表现层
- `studio-workbench/src/features/member/modules/transaction-safety/MemberTransactionSafetyView.vue`
  - 统一承接权益预占、组合支付、储值消费、会员提现四个脚手架入口。
- 路由：`studio-workbench/src/app/router/featureRegistry.ts`
  - 新增 `member-transaction-safety`，路径 `/member/transaction-safety`，状态 `building`。

### 控制逻辑层
- `studio-workbench/src/features/member/modules/transaction-safety/useMemberTransactionSafety.ts`
  - 聚合筛选、列表加载、四类草稿创建动作。
- `studio-workbench/src/shared/api/backendTransactionSafetyApi.ts`
- `studio-workbench/src/shared/api/backendTypesTransactionSafety.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyTransactionSafetyController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyTransactionSafetyService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyTransactionSafetyServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyRiskApprovalService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyRiskApprovalServiceImpl.java`
  - 新增 `MEMBER_WITHDRAW_APPLY` 审批类型，并挂接提现通过/驳回。

### 持久数据层
- `yy_entitlement_reservation`
- `yy_composite_payment_order`
- `yy_stored_value_consume_order`
- `yy_member_withdraw_order`
- SQL 基线：
  - `backend/script/sql/yy_cloud.sql`
  - `backend/script/sql/postgres/postgres_yy_cloud.sql`

### 边界
- 仍以 ``yy_order`` 作为唯一订单账本。
- 本包只落内部脚手架与状态账本，不调用真实第三方支付、退款、出款接口。
- 本包未实际扣减 ``yy_member_account`.balance_amount`，仅做余额快照校验和内部状态流转。

## 2026-06-25 merchant-store-schedule-close-gap

### 表现层
- `studio-workbench/src/features/merchant/OrderAttributesView.vue`
  - 商户后台订单属性模板 owner，按门店维护字段模板。
- `studio-workbench/src/features/orders/OrderAttributeFieldsSection.vue`
- `studio-workbench/src/features/orders/OrderAttributeOrderSection.vue`
  - 录单弹窗与订单详情共用动态字段渲染和保存组件。
- `studio-workbench/src/features/merchant/modules/schedule-governance/MerchantScheduleGovernanceView.vue`
  - 支持审批 deeplink 回填查询并自动预览当前治理结果。
- `studio-workbench/src/features/merchant/modules/governance/MerchantGovernanceView.vue`
  - 展示 `SLOT_CLOSE_WITH_PAID_ORDER` 作用范围摘要、审批结果摘要和回跳按钮。

### 控制逻辑层
- `studio-workbench/src/shared/orderAttributes.ts`
  - 订单属性模板/快照合并、字段值归一化、保存 payload 映射。
- `studio-workbench/src/features/merchant/serviceGroupOperations.ts`
- `studio-workbench/src/features/merchant/components/ServiceGroupFormDialog.vue`
  - 服务组显式维护 `serviceMode=HORIZONTAL|VERTICAL`。
- `studio-workbench/src/features/orders/orderSlotOperations.ts`
- `studio-workbench/src/features/orders/composables/useOrderDetail.ts`
  - `VERTICAL` 模式下统一复用重叠阻塞判断。
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyRiskApprovalServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyScheduleGovernanceServiceImpl.java`
  - 付费关档审批通过后自动激活规则并批量应用库存动作。

### 持久数据层
- ``yy_order`_attribute_template`
- ``yy_order`.order_attribute_json`
- `yy_service_group.service_mode`
- `yy_schedule_exception_rule`
- `yy_risk_approval`
- SQL 基线：
  - `backend/script/sql/yy_cloud.sql`
  - `backend/script/sql/postgres/postgres_yy_cloud.sql`
## 2026-06-25 order-copy-closed-loop

### 表现层
- `studio-workbench/src/features/orders/OrderCopyPanel.vue`
- `studio-workbench/src/features/orders/OrderOperationalSummaryPanel.vue`
- `studio-workbench/src/features/orders/OrderDetailActionSections.vue`
- `studio-workbench/src/features/orders/OrderDetailDrawer.vue`
- `studio-workbench/src/features/orders/OrderDetailDrawerHost.vue`
- `studio-workbench/src/features/orders/OrdersViewOverlays.vue`
- `studio-workbench/src/features/orders/OrdersView.vue`

### 控制逻辑层
- `studio-workbench/src/features/orders/composables/useOrderCopyActions.ts`
- `studio-workbench/src/features/orders/composables/useOrdersViewState.ts`
- `studio-workbench/src/features/orders/composables/useOrdersViewDetailContext.ts`
- `studio-workbench/src/features/orders/composables/useOrderDetailDrawerContext.ts`
- `studio-workbench/src/shared/api/backendOrdersApi.ts`
- `studio-workbench/src/shared/api/backendTypesPayloads.ts`
- `studio-workbench/src/shared/stores/orderActionStore.ts`
- ``studio-workbench/src/shared/stores/appStore.ts``
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyOrderService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderCopyFactory.java`

### 持久数据层
- ``yy_order``
- `yy_booking_slot_inventory`

### 说明
- 复制订单已接到 `POST /yy/order/{id}/copy`，前端由订单详情抽屉和操作摘要面板触发。
- 新单复制客户、门店、服务组、工位、总金额、备注和属性快照，支付/退款/外部渠道字段清空。
- `REUSE_SLOT` 重新确认库存，`UNDECIDED` 不写档期。

## 2026-06-25 order-card-batch-scaffold

### 表现层
- `studio-workbench/src/features/orders/card-batch/OrderCardBatchView.vue`
  - 承接批量开卡申请表单、审批边界说明和最近申请列表。
- 路由：`studio-workbench/src/app/router/featureRegistry.ts`
  - 新增 `order-card-batch`，路径 `/order/card-batch`，状态 `building`。

### 控制逻辑层
- `studio-workbench/src/features/orders/card-batch/useOrderCardBatch.ts`
- `studio-workbench/src/features/orders/card-batch/orderCardBatchScaffold.ts`
- `studio-workbench/src/shared/api/backendCardBatchOrderApi.ts`
- `studio-workbench/src/shared/api/backendTypesCardBatchOrder.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyCardBatchOrderController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyCardBatchOrderService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyCardBatchOrderServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyRiskApprovalService.java`
  - 新增 `CARD_BATCH_ORDER_APPLY` 审批业务类型。

### 持久数据层
- `yy_risk_approval`
  - 承接批量开卡申请单，不新增第二套卡项订单表。

### 边界
- 仍以 ``yy_order`` 作为唯一真实订单账本。
- 本包只记录审批申请和批次元数据，不执行真实开卡、权益发放、退款或余额写入。

## 2026-06-26 order-analysis-scaffold

### 表现层
- `studio-workbench/src/features/reports/OrderAnalysisReportView.vue`
  - 独立承接 `订购分析` 页面，不复用共享 `DerivedReportModuleView.vue`。
- `studio-workbench/src/features/reports/reportScaffolds.ts`
  - 新增 `orderAnalysisScaffold`。
- 路由：`studio-workbench/src/app/router/featureRegistry.ts`
  - 新增 `report-order-analysis`，路径 `/report/order-analysis`，状态 `building`。

### 控制逻辑层
- `studio-workbench/src/features/reports/composables/useOrderAnalysisReport.ts`
- `studio-workbench/src/features/reports/orderAnalysisReportOperations.ts`
- `studio-workbench/src/shared/api/backendReportsApi.ts`
- `studio-workbench/src/shared/api/backendTypesReports.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderAnalysisController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyOrderAnalysisService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderAnalysisServiceImpl.java`

### 持久数据层
- ``yy_order``
- `yy_payment_record`

### 说明
- 聚合优先读取支付流水；无流水时回退订单支付/退款字段。
- 本包不新增表、不改 SQL、不接导出与任务中心。

## 2026-06-26 order-form-submissions-owner

### 表现层
- `studio-workbench/src/features/orders/modules/form-submissions/OrderFormSubmissionsOwnerView.vue`
- `studio-workbench/src/features/orders/OrderFormSubmissionsView.vue`
- `studio-workbench/src/app/router/index.ts`
- `studio-workbench/src/app/router/featureRegistry.ts`

### 控制逻辑层
- `studio-workbench/src/shared/api/backendMerchantContentApi.ts`
- `studio-workbench/src/features/orders/modules/form-submissions/OrderFormSubmissionsOwnerView.contract.test.ts`
- `studio-workbench/src/features/orders/OrderFormSubmissionsView.contract.test.ts`
- `studio-workbench/src/app/router/featureRegistry.access.test.ts`
- `studio-workbench/src/app/router/featureRegistry.contract.test.ts`

### 持久数据层
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMicroFormSubmissionController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMicroFormSubmissionServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyMicroFormSubmissionVo.java`

### 说明
- 本轮把 `order-forms` 从派生只读视图升级为独立工作台 owner，统一承接查询、跟进、导出和转预约。
- 真实表单数据继续读取 `yy_micro_form_submission`；转预约仍复用订单 owner 的真实写链路。

## 2026-06-26 member-assets-acceptance-upgrade

### 表现层
- `studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue`
  - 会员资产 owner 升级为详情工作台，新增动作条、权限提示、删除确认结果和充值/动作消息态。
- `studio-workbench/src/features/member/modules/transactions/MemberTransactionsView.vue`
  - 保持四类流水 owner，并支持通过路由 `customerId` 直接预选客户。
- `studio-workbench/src/features/marketing/MarketingCouponsView.vue`
  - 支持从会员详情带 `customerId` 打开发券抽屉，默认选中客户。

### 控制逻辑层
- `studio-workbench/src/features/member/modules/assets/useMemberDetailActions.ts`
  - 收口编辑、删除、预约、办卡、发券、交易明细动作。
- `studio-workbench/src/features/member/modules/assets/useMemberAssetOverview.ts`
  - 增加 `route.query.customerId` 预选支持。
- `studio-workbench/src/features/member/modules/transactions/useMemberTransactions.ts`
  - 增加 `route.query.customerId` 预选支持。
- `studio-workbench/src/features/marketing/composables/useCouponIssuance.ts`
  - `buildIssueDraft` 支持预传 `customerIds`。
- `studio-workbench/src/shared/stores/workbenchFacadeStore.ts`
- `studio-workbench/src/shared/stores/customersStore.ts`
- `studio-workbench/src/shared/stores/appStore.ts`
  - 补齐 `deleteCustomer` facade，统一前端删除会员链路。

### 持久数据层
- `yy_customer`
- `yy_member_account`
- `yy_member_card_instance`
- `yy_member_benefit_ledger`
- `yy_member_points_ledger`
- `yy_member_growth_ledger`
- `yy_member_balance_ledger`
- `yy_member_recharge_order`
- `yy_coupon_template`
- `yy_coupon_instance`
- `yy_coupon_grant_record`
- `yy_order`

### 边界
- 会员详情不创建第二套账本；订单、会员、营销仍各自写入既有真实表。
- `order-card-batch` 仍为待端到端验证模块，本次只消费其路由入口，不补真实开卡写链路。
