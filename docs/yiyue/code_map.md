# 影约云代码地图

更新时间：2026-06-24

## 2026-06-25 merchant-readiness-scaffold

### 表现层
- `studio-workbench/src/features/merchant/modules/readiness/MerchantReadinessView.vue`
- `studio-workbench/src/features/merchant/modules/readiness/components/MerchantReadinessBoard.vue`
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
- readiness 证据引用产品清单和地图；真实业务账本仍以 `yy_order`、`yy_booking_slot_inventory` 为边界。

## 2026-06-24 dashboard-wave1-module-split

### 琛ㄧ幇灞?
- `studio-workbench/src/features/dashboard/DashboardView.vue`
- `studio-workbench/src/features/dashboard/modules/home/DashboardHomeView.vue`
- `studio-workbench/src/features/dashboard/DashboardFinanceOverview.vue`
- `studio-workbench/src/features/dashboard/DashboardProductRanking.vue`
- `studio-workbench/src/features/dashboard/DashboardConversion.vue`
- `studio-workbench/src/features/dashboard/DashboardQuickEntries.vue`
- `studio-workbench/src/features/dashboard/DashboardOperationsPanel.vue`
- `studio-workbench/src/features/dashboard/DashboardScheduleSection.vue`

### 鎺у埗閫昏緫灞?
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

### 鎸佷箙鏁版嵁灞?
- `yy_order`
- `yy_booking_slot_inventory`
- `yy_store`

### 璇存槑
- `DashboardView.vue` 宸叉敹鍙ｄ负钖勫姩 `DashboardHomeView.vue` 鐨勮杽澹筹紝鏃у叆鍙?`useDashboardBusinessInsights.ts` 鍜?`dashboardPresentation.ts` 鍙繚鐣欏吋瀹瑰瑙傞噸瀵笺€?
- `YyDashboardServiceImpl.java` 宸叉敹鍙ｄ负鍏紑鍏ュ彛缂栨帓锛屽師鏈夌殑璁㈠崟鏌ヨ銆佹寚鏍囪仛鍚堛€佹帓鏈熻閰嶅拰瀵煎嚭缁勮宸叉媶鍒?`service/dashboard/*` owner銆?

## 2026-06-24 marketing-phase2-merchant-closed-loop

### 表现层
- `studio-workbench/src/features/marketing/MarketingCouponsView.vue`
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
- `studio-workbench/src/features/marketing/composables/useCouponIssuance.ts`
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
- 前端真实读写后端营销表：`yy_coupon_template`、`yy_coupon_instance`、`yy_coupon_grant_record`、`yy_coupon_writeoff_record`、`yy_campaign`、`yy_campaign_product`、`yy_campaign_participation`。
- 订单联动继续读取 `yy_order`，不复制订单主账本。

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
  - `studio-workbench/src/shared/stores/appStore.ts`
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
- `studio-workbench/src/features/marketing/MarketingCouponsView.vue`
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
- `studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue`
- `studio-workbench/src/features/member/modules/transactions/MemberTransactionsView.vue`

### 控制逻辑层
- `studio-workbench/src/shared/api/backendMemberApi.ts`
- `studio-workbench/src/shared/stores/memberStore.ts`
- `studio-workbench/src/features/member/modules/assets/useMemberAssetOverview.ts`
- `studio-workbench/src/features/member/modules/transactions/useMemberTransactions.ts`
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
- `studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue`
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

### 琛ㄧ幇灞?
- `studio-workbench/src/features/member/modules/assets/MemberAssetsView.vue`

### 鎺у埗閫昏緫灞?
- `studio-workbench/src/features/member/modules/assets/useMemberAssetOverview.ts`
- `studio-workbench/src/shared/stores/memberStore.ts`
- `studio-workbench/src/shared/stores/memberRechargeStore.ts`
- `studio-workbench/src/shared/api/backendMemberApi.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMemberRechargeController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMemberRechargeServiceImpl.java`

### 鎸佷箙鏁版嵁灞?
- `yy_member_recharge_order`
- `yy_member_balance_ledger`
- `yy_member_account`

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
- 本包不新增库表，工具中心读取 `yy_photo_album / yy_customer / yy_notification_log`。
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
