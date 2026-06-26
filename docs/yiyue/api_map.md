# 影约云 API 地图

更新时间：2026-06-24

## 2026-06-26 product-function-inventory-84-scaffold-acceptance

### 统一口径
- 本轮 21 项脚手架验收继续复用既有 facade，不新增真实高风险写接口。
- 共享 scaffold 展示字段统一为：`status`、`updatedAt?`、`evidence?`、`nextActions?`。

### 复用的 API owner
- 客户端 P1：`/api/customer/experience-p1/booking-options`、`/api/customer/experience-p1/asset-summary`
- 商品：`/yy/productCatalog/{productId}`、`/yy/productSku/*`、`/yy/productRelation/*`、`/yy/productBookingRule/*`、`/yy/productChannelConfig/*`、`/yy/productCatalog/{productId}/benefit-binding`
- 营销券：`marketingApi.getCouponTemplateScaffold()`
- 平台设置：`backendApi.listPlatformBookingPolicies()`、`backendApi.listPlatformPrintSettings()`、`backendApi.listPlatformScoreSettings()`、`backendApi.getPlatformEmailSettings()`、`backendApi.listPlatformNotificationCenters()`

### 边界
- 不新增真实支付、库存扣减、权益扣减/回滚、退款、渠道授权写接口。
- `B-085` 保留 `/tools/notifications` 入口，但 canonical API owner 固定为平台通知中心 facade。

## 2026-06-25 consumer-merchant-p1-scaffold

### 客户端 P1 脚手架

| 方法 | 路径 | owner | 说明 |
|---|---|---|---|
| GET | `/api/customer/experience-p1/booking-options` | `YyClientExperienceP1Controller` | 返回服务组、资料项、权益候选、资产摘要和脚手架提示，不写真实订单权益 |
| GET | `/api/customer/experience-p1/asset-summary` | `YyClientExperienceP1Controller` | 返回会员资产摘要空态 |
| GET | `/api/customer/experience-p1/order-verification/{orderId}` | `YyClientExperienceP1Controller` | 返回核销码展示策略和不可展示原因 |
| POST | `/api/customer/experience-p1/review-drafts` | `YyClientExperienceP1Controller` | 返回评价脚手架提交结果，不写评价表 |
| POST | `/api/customer/orders` | `YyClientPublicApiServiceImpl` | 消费者预约下单新增 `serviceGroupId/customFields/entitlement*` 可选字段；`serviceGroupId` 会校验存在、启用且属于当前门店；`customFields` 写入 `yy_order.order_attribute_json`；可用权益候选仅创建 `yy_entitlement_reservation` scaffold 预占草稿，不做真实核销/扣减 |

### 商户端 P1 聚合

| 方法 | 路径 | 权限 | owner | 说明 |
|---|---|---|---|---|
| GET | `/yy/merchant/consumer-ops-p1/overview` | `yy:store:list` | `YyMerchantConsumerOpsP1Controller` | 返回 P1 缺口、现有 owner、数据边界和交付标准 |

## 2026-06-25 merchant-readiness-scaffold

### 前端 API owner
- `studio-workbench/src/shared/api/backendMerchantReadinessApi.ts`
  - `GET /yy/merchant/readiness/summary`
  - `GET /yy/merchant/readiness/schedule`
  - `GET /yy/merchant/readiness/channels`
  - `GET /yy/merchant/readiness/governance`
  - `GET /yy/merchant/readiness/dependencies`

### 后端 API owner
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMerchantReadinessController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyMerchantReadinessService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMerchantReadinessServiceImpl.java`

### DTO
- `MerchantReadinessItemDto`
- `YyMerchantReadinessItemVo`
- 字段：`moduleKey`、`moduleName`、`status`、`priority`、`sourceItems`、`blockers`、`nextActions`、`evidenceRefs`

### 权限
- `summary/channels/governance/dependencies`：`yy:store:list`
- `schedule`：`yy:bookingInventory:list`

### 边界
- 只读接口，不新增真实写链路，不调用抖音/美团写接口。
- `/merchant/schedule-governance`、`/merchant/channel-readiness`、`/merchant/governance`、`/merchant/dependency-readiness` 均复用上述只读接口，不新增独立写 API。

## 2026-06-24 dashboard-wave1-module-split

### 前端 API owner
- `studio-workbench/src/shared/api/backendDashboardApi.ts`
  - `GET /yy/dashboard/overview`
  - `GET /yy/dashboard/finance`
  - `GET /yy/dashboard/order-status-stats`
  - `GET /yy/dashboard/trend-stats`
  - `GET /yy/dashboard/today-slots`

## 2026-06-25 merchant-store-schedule-close-gap

### 前端 owner / API facade
- `studio-workbench/src/features/merchant/OrderAttributesView.vue`
- `studio-workbench/src/features/merchant/modules/schedule-governance/MerchantScheduleGovernanceView.vue`
- `studio-workbench/src/features/merchant/modules/governance/MerchantGovernanceView.vue`
- `studio-workbench/src/shared/api/backendOrderAttributeApi.ts`
- `studio-workbench/src/shared/api/backendRiskApprovalApi.ts`

### 写接口
- `GET /yy/orderAttributeTemplate/list`
- `POST /yy/orderAttributeTemplate`
- `PUT /yy/orderAttributeTemplate`
- `DELETE /yy/orderAttributeTemplate/{id}`
- `POST /yy/order/staff-booking`
  - 新增请求字段：`orderAttributes`
- `PUT /yy/order`
  - 新增保存能力：订单详情回写 `orderAttributes`，落 `yy_order.order_attribute_json`
- `POST /yy/bookingSlotInventory/governance/preview`
- `POST /yy/bookingSlotInventory/governance/apply`
  - `CLOSE` 命中已付费时段时创建 `SLOT_CLOSE_WITH_PAID_ORDER` 审批和 `yy_schedule_exception_rule(status=PENDING_APPROVAL)`
- `GET /yy/riskApproval/list`
- `POST /yy/riskApproval/{id}/approve`
- `POST /yy/riskApproval/{id}/reject`
  - `SLOT_CLOSE_WITH_PAID_ORDER` 审批通过后自动应用到库存；驳回只改规则状态，不改库存

### 边界
- 本包只收口后台配置和审批闭环，不接 `mobile-uniapp` 消费者写链路。
- 服务模式后端仍共用单账本 `yy_booking_slot_inventory`，不新增第二套排期表。
  - `GET /yy/dashboard/product-ranking`
  - `GET /yy/dashboard/conversion`
  - `GET /yy/dashboard/schedule-grid`
  - `POST /yy/dashboard/export`

### 后端 control owner
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyDashboardController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyDashboardServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardOrderQuerySupport.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardMetricsAssembler.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardScheduleAssembler.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/dashboard/YyDashboardExportAssembler.java`

### 数据边界
- `yy_order` 浠嶆槸棣栭〉缁忚惀銆佽浆鍖栥€佷骇鍝佹帓琛屽拰瀵煎嚭鐨勫敮涓€璁㈠崟璐︽湰
- `yy_booking_slot_inventory` 浠嶆槸浠婃棩棰勭害銆佹帓鏈熺綉鏍煎拰瀵煎嚭鏃舵瀹归噺鐨勫敮涓€鏃舵璐︽湰
- `yy_store` 鐢ㄤ簬闂ㄥ簵鍚嶇О鏄犲皠鍜岄棬搴楄寖鍥磋仛鍚?

### 璇存槑
- 鏈疆鍙媶 owner锛屼笉鏀?`/yy/dashboard/*` 璺敱銆佸叆鍙傘€佸嚭鍙傚悎鍚屻€?
- 瀵煎嚭鍙ｅ緞浠嶅鐢?`finance/order-status/today-slots/product-ranking/conversion` 鐨勭幇鏈夐鍩熻涔夛紝涓嶆柊澧炵浜屽棣栭〉璐︽湰銆?

## 2026-06-24 marketing-phase2-merchant-closed-loop

### 前端 API owner
- `backendMarketingCouponsApi.ts`：`GET /yy/couponTemplate/list`、`POST /yy/couponTemplate`、`PUT /yy/couponTemplate`、`POST /yy/couponTemplate/{id}/issue`、`GET /yy/couponTemplate/{id}/grants`、`GET /yy/couponTemplate/{id}/instances`、`GET /yy/couponTemplate/{id}/writeoffs`。
- `backendMarketingCampaignsApi.ts`：`GET /yy/campaign/list`、`POST /yy/campaign`、`PUT /yy/campaign`、`POST /yy/campaign/{id}/online`、`POST /yy/campaign/{id}/offline`、`PUT /yy/campaign/{id}/products`。
- `backendMarketingParticipationsApi.ts`：`GET /yy/campaignParticipation/list`。
- `backendMarketingCapabilitiesApi.ts`：`GET /yy/marketingCapability/list`、`GET /yy/marketing/dashboard`、`POST /yy/promotionTrial/run`。

### 兼容 facade
- `backendApi` 继续暴露营销方法；页面不直接调用 `backendApi`，由 composable 统一调用。
- `/scaffold` 接口仅保留给 `demoMode` 和回归对照。

## 2026-06-24 full-product-closed-loop-phase234-scaffold

### 统一 owner 元数据来源
- `studio-workbench/src/features/system/phase234ModuleScaffolds.ts`
  - 统一登记 Phase、featureKey、路由、API owner、真实账本边界
- `studio-workbench/src/features/system/moduleScaffold.ts`
  - `ModuleScaffoldConfig.ownerLayers.presentation`
  - `ModuleScaffoldConfig.ownerLayers.control`
  - `ModuleScaffoldConfig.ownerLayers.data`

### Phase 2 重点接口 owner
- 会员：`studio-workbench/src/shared/api/backendMemberApi.ts`
- 营销：`studio-workbench/src/shared/api/backendMarketingApi.ts`
- 资源：`studio-workbench/src/shared/api/backendResourcesApi.ts`
- 协作：`studio-workbench/src/shared/api/backendCollaborationApi.ts`
- 服务生产：`studio-workbench/src/shared/api/backendServiceProductionApi.ts`

### Phase 3~4 脚手架接口 owner
- 平台设置：`studio-workbench/src/shared/api/backendPlatformApi.ts`
- 账号中心：`studio-workbench/src/shared/api/backendAccountApi.ts`
- 费用中心：`studio-workbench/src/shared/api/backendFinanceApi.ts`
- 工具中心：`studio-workbench/src/shared/api/backendToolsApi.ts`

### 2026-06-25 平台与企业级脚手架接口
- 前端 facade：`studio-workbench/src/shared/api/backendPlatformApi.ts`
- DTO：
  - `PlatformLoginRiskPolicyDto`
  - `PlatformOpenApiAppDto`
  - `PlatformAsyncTaskDto`
  - `PlatformBackupRecoveryDto`
  - `PlatformMeituanReviewTraceDto`
- 后端接口：
  - `GET /yy/platform-settings/login-risk-policies`
  - `GET /yy/platform-settings/open-api-apps`
  - `GET /yy/platform-settings/async-tasks`
  - `GET /yy/platform-settings/backup-recovery-plans`
  - `GET /yy/platform-settings/meituan-review-traces`

### 工具中心 DTO
- `ToolSampleWorkDto`
- `ToolPrecisionDeliverySummaryDto`
- `ToolPrecisionDeliveryTaskDto`

### 说明
- 本轮未新增新的真实写接口；主要把现有已验证 API owner 与目标账本绑定到统一 registry。

## 2026-06-24 full-product-closed-loop-phase1

### Phase 1 owner 拆分
- `studio-workbench/src/shared/api/backendPaymentsApi.ts`
  - `POST /yy/order/{id}/payment/confirm`
- `studio-workbench/src/shared/api/backendInventoryApi.ts`
  - `GET /yy/bookingSlotInventory/list`
  - `PUT /yy/bookingSlotInventory`
- `studio-workbench/src/shared/api/backendAuditApi.ts`
  - `GET /monitor/operlog/list`
  - `GET /yy/channelSyncLog/list`

### Phase 1 共享契约
- `PaymentRecordDto`
  - 依据 `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyPaymentRecordVo.java`
- `BookingInventoryListQuery`
- `OperationLogListQuery`
- `ChannelSyncLogListQuery`

### 说明
- 本轮未新增未验证退款接口；退款仍以 `yy_order.refundStatus/refundAmountCent` 和渠道日志证据为准。

## 2026-06-24 full-product-closed-loop-phase0

### Phase 0 类型分层
- `studio-workbench/src/shared/api/backendTypesPlatform.ts`
  - `PlatformBrandInfoDto`
  - `PlatformIntegrationDto`
  - `PlatformBookingPolicyDto`
  - `PlatformNotificationCenterDto`
- `studio-workbench/src/shared/api/backendTypesAccount.ts`
  - `AccountProfileDto`
  - `AccountBrandDto`
  - `HelpCenterArticleDto`
- `studio-workbench/src/shared/api/backendTypesFinance.ts`
  - `FinanceOverviewDto`
  - `FinanceTransactionDto`
  - `FinanceTransactionQuery`

### Phase 0 计划接口口径
- 平台设置：
  - `GET/PUT /yy/platform/brand-info`
  - `GET /yy/platform/integration`
  - `GET /yy/platform/login-risk`
  - `GET /yy/platform/open-api`
  - `GET /yy/platform/task-center`
  - `GET/PUT /yy/platform/booking-policy`
  - `GET /yy/platform/backup-recovery`
  - `GET /yy/platform/meituan-review-trace`
  - `GET/PUT /yy/platform/email-settings`
- 账号中心：
  - `GET/PUT /yy/account/profile`
  - `GET /yy/account/brands`
  - `GET /yy/account/help-center`
- 费用中心：
  - `GET /yy/finance/overview`
  - `GET /yy/finance/transactions`
  - `POST /yy/finance/transactions/export`

### 说明
- 本轮只登记稳定 DTO 和目标接口，不新增真实后端读写实现。

## 2026-06-24 product-module-close-gap

### 商品写入链路
- 前端请求契约：
  - `studio-workbench/src/shared/api/backendTypesPayloads.ts`
  - `ProductPayload.bizCategory?: string`
- 前端 facade：
  - `studio-workbench/src/shared/api/backendProductsApi.ts`
  - `productType = payload.bizCategory || payload.spec || 'SERVICE'`
- 后端接口：
  - `POST /yy/product`
  - `PUT /yy/product`
  - `GET /yy/product/list`

### 入册闭环补齐接口
- 商品元数据编码：
  - `studio-workbench/src/shared/products/albumProductMetadata.ts`
  - `yy_product.album_product_name = <规格>｜<张数>张`
- 入册履约配置接口：
  - `GET /yy/collaboration/product-config/list`
  - `PUT /yy/collaboration/product-config/{productId}`
- 履约配置关键字段：
  - `productId`
  - `workflowJson`
  - `needMakeup`
  - `needPhotography`
  - `needRetouch`
  - `needSelectionReview`
  - `needPickup`
  - `makeupCount`
  - `deliverWithinHours`
- 持久层：
  - `yy_product_collaboration_config`

### 入册履约证据回读
- 本轮不新增后端接口。
- 前端只读现有归一化对象：
  - `ProductConfig`
  - `BookingOrder`
  - `Album`
  - `SelectionLink`
- 证据匹配规则：
  - 订单匹配 `productBackendId`，兼容 `externalProductId / externalSkuId`
  - 相册匹配订单 `backendId / id`
  - 选片链接匹配订单或相册 `backendId / id`

### 分类口径
- `ALBUM`：入册产品
- `GROUP_BUY`：团单产品新写入口径
- `GROUP`：仅兼容读取旧数据

## 2026-06-24 customer-payment-inventory-closed-loop part4/part5

### 客户支付相关

- 客户支付入口：
  - `POST /api/customer/orders/{orderId}/pay`
  - 前端入口：`mobile-uniapp/src/api/customer.ts`
  - 前端支付 owner：`mobile-uniapp/src/pages/customer/orders/customerPaymentFlow.ts`
- 客户支付返回字段已在前端契约补齐：
  - `provider`
  - `outTradeNo`
  - `payStatus`
  - `paymentRecordId`

### 工作台确认收款

- 门店确认收款入口：
  - `POST /yy/order/{id}/payment/confirm`
  - 后端控制器：`backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderPaymentController.java`
  - 前端 facade：`studio-workbench/src/shared/api/backend.ts`
- 前端请求体：
  - `amountCent`
  - `remark`
- 前端返回模型：
  - 通过 `mapYyOrder(...)` 统一映射为 `BookingOrder`

说明：
- 本轮只做前端真实接线，不扩后端业务路径，不改退款、营销或抖音平台真实支付链路。

## 2026-06-24 service-production-closed-loop

### 服务生产接口

- 三方修图任务：
  - `GET /yy/serviceProduction/retouchTask/list`
  - `POST /yy/serviceProduction/retouchTask/{id}/action`
- 三方修图服务商：
  - `GET /yy/serviceProduction/retouchProvider/list`
  - `POST /yy/serviceProduction/retouchProvider`
  - `PUT /yy/serviceProduction/retouchProvider`
- 中央修图 / 通用设置：
  - `GET /yy/serviceProduction/collaborationPolicy`
  - `PUT /yy/serviceProduction/collaborationPolicy`
- 开通设置：
  - `GET /yy/serviceProduction/licenseBinding/list`
  - `PUT /yy/serviceProduction/licenseBinding`

### 前端 facade

- `studio-workbench/src/shared/api/backendServiceProductionApi.ts`
- `studio-workbench/src/shared/api/backend.ts`

### 关键契约字段

- 修图任务：
  - `storeId`
  - `providerId`
  - `status`
  - `acceptanceStatus`
  - `quoteAmountCent`
  - `dueTime`
- 协作策略：
  - `reviewFlowEnabled`
  - `productInfoMaskMode`
  - `enabledStoreIds`
  - `fallbackAction`
  - `autoDispatchMode`
- 许可证：
  - `licenseKey`
  - `status`
  - `boundStoreIds`
  - `seatCount`
  - `expireTime`
## 2026-06-24 marketing-domain-scaffold

### 商户营销工作台接口
- `GET /yy/marketing/dashboard`
  - 聚合营销中心概览、渠道承接、待跟进和活动订单联动指标
- `GET /yy/marketing/capabilities`
  - 返回品牌/租户营销能力开关、到期时间、菜单显隐和未开通提示所需字段
- `GET /yy/marketing/coupons/templates`
  - 返回券模板、发券记录、券实例、核销记录和退单恢复策略脚手架数据
- `GET /yy/marketing/campaigns`
  - 返回活动清单、时间窗、商品绑定和上下线脚手架数据
- `GET /yy/marketing/participations`
  - 返回客户活动参与、转化、退款、失效和待跟进脚手架数据
- `POST /yy/marketing/promotion-trial`
  - 返回固定优先级试算结果：命中规则、不可用原因、原价、优惠额、应付价、互斥来源、恢复策略

### 商户工作台首页接口
- `POST /yy/dashboard/export`
  - 导出首页汇总 Excel，请求字段：`beginDate`、`endDate`、`storeId?`、`channelType?`
- `GET /yy/dashboard/order-status-stats`
  - 返回首页经营概况的订单状态聚合，支持 `date`、`storeId`
- `GET /yy/dashboard/trend-stats`
  - 返回首页预约趋势，支持 `date`、`storeId`、`days`
- `GET /yy/dashboard/today-slots`
  - 返回首页今日预约卡片，支持 `date`、`storeId`
- `GET /yy/dashboard/product-ranking`
  - 返回首页产品排行，支持 `date`、`storeId`、`topN`
- `GET /yy/dashboard/conversion`
  - 返回首页履约转化，支持 `date`、`storeId`

### 说明
- 当前接口以脚手架数据和固定优先级规则为主，未完成真实券模板 CRUD、真实发券、真实核销和真实活动参与账本闭环。
- `yy_order` 继续作为唯一订单账本，营销域只补券、活动、参与、试算、授权事实表。
## 2026-06-24 member-module-phase1

### 新增会员只读接口
- `GET /yy/member/customer/{customerId}/overview`
- `GET /yy/member/customer/{customerId}/cards`
- `GET /yy/member/customer/{customerId}/benefits`
- `GET /yy/member/customer/{customerId}/coupons`
- `GET /yy/member/customer/{customerId}/points-ledger?limit=20`
- `GET /yy/member/customer/{customerId}/growth-ledger?limit=20`
- `GET /yy/member/customer/{customerId}/balance-ledger?limit=20`

### 契约说明
- 鉴权统一复用 `yy:customer:list`
- `overview` 聚合 `yy_customer + yy_member_account + 活跃资产计数`

## 2026-06-24 member-recharge-closed-loop

### 新增会员写接口
- `POST /yy/member/customer/{customerId}/recharge-orders`
- `POST /yy/member/recharge-orders/{rechargeOrderId}/confirm`

### 写表
- `yy_member_recharge_order`
- `yy_member_account`
- `yy_member_balance_ledger`

### 状态
- `yy_member_recharge_order.status`: `PENDING` -> `CONFIRMED`
- `yy_member_balance_ledger.change_type`: `RECHARGE`
- `yy_member_balance_ledger.source_type`: `RECHARGE_ORDER`
- `coupons` 当前读取 `yy_coupon_instance + yy_coupon_template`
- `points/growth/balance` 流水都按 `happened_at desc, id desc` 返回

### 保留边界
- 充值下单、余额充值支付、退款冲正、积分规则引擎本轮未开放 API。

## 2026-06-24 auth-foundation-phase2-collaboration

### 新增授权聚合只读接口
- `GET /yy/featureScope/list?featureKeys=collaboration-open-settings,marketing-center`

### 返回契约
- `featureKey`
- `licenseState`: `active | missing | expired | unknown | not_applicable`
- `pluginState`: `enabled | disabled | unknown | not_applicable`
- `approvalState`: `required | not_required | unknown | not_applicable`
- `gateCopy`
- `licenseSummary`: `licenseKey` / `planName` / `expireTime` / `boundStoreIds`
- `pluginSummary`: `channelType` / `pluginName` / `authStatus` / `openTip`

### 协作许可证 owner 链路
- 前端页面统一走 `GET /yy/collaboration/license/list`
- 保存走 `PUT /yy/collaboration/license`
- 绑定走 `POST /yy/collaboration/license/{licenseId}/bind-store`
- 解绑走 `POST /yy/collaboration/license/{licenseId}/unbind-store/{storeId}`
- `serviceProduction/licenseBinding` 仅保留后端账本 owner 兼容身份，页面不再直连。

## 2026-06-24 internal-collaboration-work-order-stage-sla

### 工单主链接口
- `GET /yy/workOrder/list`
  - 查询参数：`storeId`、`orderNo`、`orderId`、`orderType`、`stageCode`、`status`、`priority`、`handlerId`、`pageNum`、`pageSize`
  - 返回字段：`id`、`storeId`、`orderNo`、`orderId`、`orderType`、`stageCode`、`status`、`priority`、`handlerId`、`handlerName`、`dueTime`、`description`、`remark`、`createTime`
- `POST /yy/workOrder/{id}/transition`
  - 请求字段：`expectedStatus`、`targetStatus`、`remark`
  - 返回字段同工单主链列表行

### 字段口径
- `stageCode` 是协作岗位真实字段，允许值：`RECEPTION`、`MAKEUP`、`PHOTOGRAPHY`、`RETOUCH`、`REVIEW`、`SELECTION_REVIEW`、`PICKUP`。
- `dueTime` 是工单 SLA 截止时间，前端执行概况、工单列表、环节统计优先使用该字段；为空时才回退到岗位 SLA 推算。
- 本轮不新增第二套工单账本，仍以 `yy_work_order` / `yy_work_order_event` 为内部协作主链。
## 2026-06-24 platform-settings-phase1

### Frontend facade
- `studio-workbench/src/shared/api/backendPlatformApi.ts`
  - `GET /yy/platform-settings/integrations`
  - `GET /yy/platform-settings/notifications`
  - `GET /yy/platform-settings/service-packages`

### Backend facade
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyPlatformSettingsController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyPlatformSettingsService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPlatformSettingsServiceImpl.java`

### DTO
- `PlatformIntegrationStatusDto`
- `PlatformNotificationRuleDto`
- `PlatformServicePackageStatusDto`
- `PlatformEvidenceDto`
- `PlatformActionHintDto`
## 2026-06-24 phase3-center-api-owner

### 新增后端 owner 接口
- 工具中心：
  - `GET /yy/tool-center/sample-works`
  - `POST /yy/tool-center/sample-works/{sampleId}/publish`
  - `GET /yy/tool-center/precision-delivery/summary`
  - `GET /yy/tool-center/precision-delivery/tasks`
- 账号中心：
  - `GET /yy/account-center/profile`
  - `PUT /yy/account-center/profile`
  - `GET /yy/account-center/brands`
  - `PUT /yy/account-center/brands/{brandId}/switch`
  - `GET /yy/account-center/help/articles`
- 费用中心：
  - `GET /yy/finance-center/overview`
  - `GET /yy/finance-center/transactions`

## 2026-06-25 member-recharge-read-side

### Frontend API owner
- `studio-workbench/src/shared/api/backendMemberApi.ts`
  - `GET /yy/member/customer/{customerId}/recharge-orders`

### Backend control owner
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyMemberRechargeController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyMemberRechargeService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMemberRechargeServiceImpl.java`

### Data source
- `yy_member_recharge_order`
- `yy_member_balance_ledger`
- `yy_member_account`

## 2026-06-24 resource-collaboration-closed-loop-phase1

### 前端 owner API
- 资源管理：`resourcesApi.listResources()`、`resourcesApi.batchUpdateResources()`、`resourcesApi.deleteResource()`。
- 资源标签：`resourcesApi.listResourceTags()`、`resourcesApi.createResourceTag()`、`resourcesApi.updateResourceTag()`、`resourcesApi.deleteResourceTag()`。
- 资源用量：`resourcesApi.getResourceUsageSummary()`、`resourcesApi.backfillResourceSizes()`。
- 协同工单：`workOrdersApi.listWorkOrders()`、`workOrdersApi.transitionWorkOrder()`、`workOrdersApi.listWorkOrderEvents()`。

### 后端接口
- `GET /yy/featureScope/list?featureKeys=resource-manage,resource-tags,resource-usage,collaboration-work-orders`
  - 本包统一返回 `licenseState/pluginState/approvalState=not_applicable`，只作为权限与门店范围门禁聚合输入。
- `GET /yy/photoAsset/resource-list`
- `POST /yy/photoAsset/batch-update`
- `DELETE /yy/photoAsset/{id}`
- `GET /yy/photoAsset/usage-summary`
- `POST /yy/photoAsset/size-backfill`
- `GET /yy/photoTag/list`
- `POST /yy/photoTag`
- `PUT /yy/photoTag`
- `DELETE /yy/photoTag/{id}`
- `GET /yy/workOrder/list`
- `GET /yy/workOrder/{id}/events`
- `POST /yy/workOrder/{id}/transition`

### 状态机
- 工单状态允许：`PENDING -> IN_PROGRESS|BLOCKED|CANCELLED`、`IN_PROGRESS -> COMPLETED|BLOCKED|CANCELLED`、`BLOCKED -> IN_PROGRESS|CANCELLED`。
- `COMPLETED` 与 `CANCELLED` 为终态，本包不允许继续流转；非法跳转不写 `yy_work_order_event`。

### 边界
- 本包只补 API owner 和只读派生/响应级动作占位，不新增资金写入、外部渠道写入或真实审批流。
- 前端 `backendToolsApi.ts / backendAccountApi.ts / backendFinanceApi.ts` API 模式走 `apiRequest`，Demo 模式保留 fallback。

## 2026-06-25 product-module-full-chain-scaffold

### 商品目录聚合
- `GET /yy/productCatalog/{productId}`
- `GET /yy/productCatalog/{productId}/order-readiness`
- `GET /yy/productCatalog/{productId}/inventory-binding`
- `GET /yy/productCatalog/{productId}/benefit-binding`

### 商品扩展配置 CRUD
- `GET /yy/productSku/list`
- `POST /yy/productSku`
- `PUT /yy/productSku`
- `DELETE /yy/productSku/{ids}`
- `GET /yy/productCategory/list`
- `POST /yy/productCategory`
- `PUT /yy/productCategory`
- `DELETE /yy/productCategory/{ids}`
- `GET /yy/productDisplayConfig/list`
- `POST /yy/productDisplayConfig`
- `PUT /yy/productDisplayConfig`
- `DELETE /yy/productDisplayConfig/{ids}`
- `GET /yy/productRelation/list`
- `POST /yy/productRelation`
- `PUT /yy/productRelation`
- `DELETE /yy/productRelation/{ids}`
- `GET /yy/productBookingRule/list`
- `POST /yy/productBookingRule`
- `PUT /yy/productBookingRule`
- `DELETE /yy/productBookingRule/{ids}`
- `GET /yy/productChannelConfig/list`
- `POST /yy/productChannelConfig`
- `PUT /yy/productChannelConfig`
- `DELETE /yy/productChannelConfig/{ids}`
- `GET /yy/productFulfillmentRule/list`
- `POST /yy/productFulfillmentRule`
- `PUT /yy/productFulfillmentRule`
- `DELETE /yy/productFulfillmentRule/{ids}`

### 边界
- 渠道配置只保存本地映射补充配置，不调用抖音/美团真实写接口。
- readiness 只读返回商品可接入状态，不触发订单、支付、库存、权益写操作。
## 2026-06-25 P0 交易安全第一包

### 库存治理
- `POST /yy/bookingSlotInventory/governance/preview`
  - 权限：`yy:bookingInventory:list`
  - 请求：`storeId/serviceGroupId/beginBizDate/endBizDate/startTime/endTime/actionType/capacity/reason`
  - 返回：影响时段数、已约时段数、冲突时段数、是否需要审批、审批单、时段列表。
- `POST /yy/bookingSlotInventory/governance/apply`
  - 权限：`yy:bookingInventory:edit`
  - 边界：`CLOSE` 命中已付费时段时只生成 `SLOT_CLOSE_WITH_PAID_ORDER` 审批；未命中已付费时段时批量更新 `yy_booking_slot_inventory.status/capacity/remark`。

### 高风险审批
- `GET /yy/riskApproval/list`
  - 权限：`yy:store:list`
  - 查询：`storeId/businessType/businessId/status/pageNum/pageSize`
- `POST /yy/riskApproval/{id}/approve`
  - 权限：`yy:store:edit`
  - 边界：审批 `ORDER_REFUND` 时只更新内部退款状态；审批 `MEMBER_RECHARGE_CONFIRM` 时充值单从 `PENDING_APPROVAL` 转 `PENDING`。
- `POST /yy/riskApproval/{id}/reject`
  - 权限：`yy:store:edit`

### 内部退款申请
- `POST /yy/order/{id}/refund/request`
  - 权限：`yy:order:edit`
  - 请求：`refundAmountCent/reason`
  - 边界：只创建 `ORDER_REFUND` 审批，不调用微信/抖音/美团真实退款 API。
## 2026-06-25 transaction-safety-scaffold

### 交易安全 owner API
- `GET /yy/transaction-safety/entitlement-reservations`
  - 权限：`yy:customer:list`
  - 查询：`storeId/customerId/orderId/status/limit`
  - 返回：权益预占草稿列表，含 `reservationNo/status/expireTime/targetSnapshot`
- `POST /yy/transaction-safety/entitlement-reservations`
  - 权限：`yy:customer:edit`
  - 请求：`storeId/customerId/orderId/reservationType/targetType/targetSnapshot/quantity/reservationAmount/expireMinutes`
  - 边界：只建预占账本，不做真实权益扣减
- `POST /yy/transaction-safety/entitlement-reservations/{id}/release`
  - 权限：`yy:customer:edit`
  - 请求：`reason/localAdapterRef`
  - 写入：预占状态从 `RESERVED` 推进到 `RELEASED`，记录 `releasedTime/executionMode/remark`
- `POST /yy/transaction-safety/entitlement-reservations/{id}/fulfill`
  - 权限：`yy:customer:edit`
  - 请求：`reason/localAdapterRef`
  - 写入：预占状态从 `RESERVED` 推进到 `FULFILLED`
- `GET /yy/transaction-safety/composite-payments`
  - 权限：`yy:customer:list`
  - 查询：`storeId/customerId/orderId/status/limit`
- `POST /yy/transaction-safety/composite-payments`
  - 权限：`yy:customer:edit`
  - 请求：`storeId/customerId/orderId/totalAmount/externalAmount/storedValueAmount/cashAmount/discountAmount/waiveAmount`
  - 边界：只记录组合支付拆账草稿，不做真实收款确认
- `POST /yy/transaction-safety/composite-payments/{id}/confirm`
  - 权限：`yy:customer:edit`
  - 请求：`reason/localAdapterRef`
  - 写入：组合支付 `CONFIRMED/SETTLED`，订单 `payStatus=PAID`，新增 `yy_payment_record` 本地流水，并核销订单下 `RESERVED` 权益预占
  - 边界：本地适配器确认，不代表真实微信/抖音/美团回调已联调
- `POST /yy/transaction-safety/composite-payments/{id}/fail`
  - 权限：`yy:customer:edit`
  - 请求：`reason/localAdapterRef`
  - 写入：组合支付 `FAILED/FAILED`，释放订单下 `RESERVED` 权益预占
- `GET /yy/transaction-safety/stored-value-consumes`
  - 权限：`yy:customer:list`
  - 查询：`storeId/customerId/orderId/status/limit`
- `POST /yy/transaction-safety/stored-value-consumes`
  - 权限：`yy:customer:edit`
  - 请求：`storeId/customerId/orderId/consumeAmount`
  - 边界：只做余额快照校验和冻结状态机，不直接扣减余额
- `POST /yy/transaction-safety/stored-value-consumes/{id}/confirm`
  - 权限：`yy:customer:edit`
  - 请求：`reason/localAdapterRef`
  - 写入：储值消费 `CONFIRMED`，扣减 `yy_member_account.balance_amount`，新增 `yy_member_balance_ledger`
- `POST /yy/transaction-safety/stored-value-consumes/{id}/reverse`
  - 权限：`yy:customer:edit`
  - 请求：`reason/localAdapterRef`
  - 写入：储值消费 `REVERSED`，已确认消费会回补余额并新增逆向余额流水
- `GET /yy/transaction-safety/withdraw-orders`
  - 权限：`yy:customer:list`
  - 查询：`storeId/customerId/orderId/status/limit`
- `POST /yy/transaction-safety/withdraw-orders`
  - 权限：`yy:customer:edit`
  - 请求：`storeId/customerId/withdrawAmount/accountName/accountNo`
  - 边界：只创建提现申请和 `MEMBER_WITHDRAW_APPLY` 审批，不做真实出款
- `POST /yy/transaction-safety/withdraw-orders/{id}/mark-paid`
  - 权限：`yy:customer:edit`
  - 请求：`reason/localAdapterRef`
  - 写入：仅允许 `APPROVED` 提现单标记 `PAID`，扣减会员余额并新增提现余额流水
  - 边界：本地适配器出款标记，不代表真实银行/微信提现回单已联调

### 相关账本
- `yy_entitlement_reservation`
- `yy_composite_payment_order`
- `yy_stored_value_consume_order`
- `yy_member_withdraw_order`

## 2026-06-25 order-card-batch-scaffold

- `GET /yy/card-batch-orders`
  - 作用：查询最近批量开卡申请脚手架记录。
  - 参数：`storeId`、`status`、`keyword`、`limit`。
  - 返回：申请号、卡项名称、卡项类型、批次数量、目标客户数、预估总额、审批状态、审批结果摘要。
  - 边界：只读取 `yy_risk_approval` 中 `businessType=CARD_BATCH_ORDER_APPLY` 的记录。
- `POST /yy/card-batch-orders`
  - 作用：创建批量开卡审批申请。
  - 请求：门店、卡项名称/类型、批次、目标客户、单价、目标人群、执行策略、审批原因。
  - 返回：审批申请 DTO，回显申请号和当前 `PENDING` 状态。
  - 边界：只创建 `yy_risk_approval` 申请，不生成真实卡项订单，不写会员资产账本。
## 2026-06-25 order-copy-closed-loop

### 前端 API owner
- `studio-workbench/src/shared/api/backendOrdersApi.ts`
  - `POST /yy/order/${payload.sourceOrderId}/copy`

### 后端 API owner
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyOrderService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderCopyFactory.java`

### 璇锋眰/鍝嶅簲
- `scheduleMode`
- `arrivalTime`
- `slotDate`
- `slotStartTime`
- `slotEndTime`
- `remark`
- 鍝嶅簲锛?`YyOrderVo`

### 边界
- `REUSE_SLOT` 瑕佹眰瀹屾暣妗ｆ湡骞跺啀娆℃牎楠屽簱瀛樸€?
- `UNDECIDED` 涓嶅啓妗ｆ湡锛屼笉瑙︽憚搴撳瓨纭銆?
- 澶嶅埗鍚庣殑鏂拌鍗曚繚鎸?`LOCAL` / `STAFF_COPY`锛屽苟閲嶇疆鏀粯銆侀€€娆俱€佸閮ㄥ崟鍙峰拰搴撳瓨鎸佹湁鐮併€?

## 2026-06-26 order-analysis-scaffold

- `GET /yy/reportOrderAnalysis/overview`
  - 作用：返回订购分析脚手架的概览、漏斗、渠道拆分和退款拆分。
  - 参数：`storeId?`、`dateFrom?`、`dateTo?`
  - 默认：未传按本月。
  - 返回：
    - `overview.orderedCount`
    - `overview.paidOrderCount`
    - `overview.paidAmountCent`
    - `overview.refundOrderCount`
    - `overview.refundAmountCent`
    - `overview.pendingAttentionCount`
    - `overview.boundaryNote`
    - `funnel[].stageKey/stageLabel/orderCount/amountCent/conversionRate`
    - `channels[].channelKey/channelLabel/orderCount/paidAmountCent/refundAmountCent/pendingCount`
    - `refunds[].refundStatus/orderCount/refundAmountCent/note`
  - 边界：
    - 只读接口。
    - 优先读取 `yy_payment_record`，无流水时回退 `yy_order`。
    - 不代表财务对账或第三方退款闭环已完成。

## 2026-06-26 report-finance-reconciliation

- `GET /yy/reportFinanceReconciliation/overview`
  - 作用：返回财务对账报表的概览、订单视角账本、资金流水视角账本、差异项和导出任务。
  - 参数：`storeId?`、`dateFrom?`、`dateTo?`
  - 权限：`yy:report:list`
  - 读取：`yy_order`、`yy_payment_record`、`yy_member_balance_ledger`、`yy_stored_value_consume_order`、`yy_member_withdraw_order`、`yy_composite_payment_order`、`yy_entitlement_reservation`
- `POST /yy/reportFinanceReconciliation/export`
  - 作用：创建财务对账真实异步导出任务。
  - 参数：`storeId?`、`dateFrom?`、`dateTo?`
  - 权限：`yy:report:export`
  - 返回：`taskId/status/dateFrom/dateTo/downloadUrl/expireTime/auditNote`
  - 写入：`yy_async_task`
  - 约束：创建时固化 `requestedStoreId / scopedStoreIds / dateFrom / dateTo / creatorUserId` 快照，避免 worker 扩大导出范围。
- `GET /yy/reportFinanceReconciliation/export/tasks`
  - 作用：查询财务对账真实导出任务列表。
  - 权限：`yy:report:list`
  - 边界：仅返回当前用户可访问的门店任务；`storeId=null` 聚合任务仅创建者或租户管理员可见。
- `GET /yy/reportFinanceReconciliation/export/tasks/{taskId}/download`
  - 作用：鉴权下载财务对账导出文件。
  - 权限：`yy:report:export`
  - 读取：`yy_async_task`、`sys_oss`
  - 边界：仅 `COMPLETED`、未过期、且 `ossId` 存在的任务允许下载。

## 2026-06-26 platform-async-task-ledger

- `GET /yy/platform-settings/async-tasks`
  - 作用：平台任务中心聚合读取统一异步任务账本。
  - 权限：`yy:platform:query`
  - 读取：`yy_async_task`
  - 返回：按 `taskType` 聚合后的 `taskType/taskName/queueName/latestRunStatus/retentionPolicy/status/evidence/nextActions`。
  - 边界：财务对账导出已能进入任务中心并显示真实任务摘要；其他任务类型仍待逐步接入。
- `GET /yy/platform-settings/async-tasks/{taskType}`
  - 作用：返回指定任务类型的最近运行明细、错误信息、过期时间和下载入口。
  - 权限：`yy:platform:query`
  - 当前已接入：`REPORT_FINANCE_RECONCILIATION_EXPORT`
