# 商户后台模块化脚手架契约

更新时间：2026-06-24

## 前端 owner 目录

- `studio-workbench/src/features/merchant/modules/core/`
  - `MerchantCoreView.vue`
  - `components/MerchantOverviewMetricsPanel.vue`
  - `composables/useMerchantCoreState.ts`
  - `merchantCoreOperations.ts`
- `studio-workbench/src/features/merchant/modules/config/`
  - `MerchantConfigView.vue`
  - `components/MerchantConfigScopeBar.vue`
  - `composables/useMerchantConfigState.ts`
  - `merchantConfigOperations.ts`
- `studio-workbench/src/features/merchant/modules/content/`
  - `MerchantContentView.vue`
  - `components/MerchantContentScopeBar.vue`
  - `composables/useMerchantContentState.ts`
  - `merchantContentOperations.ts`
- `studio-workbench/src/features/merchant/modules/decoration/`
  - `MerchantDecorationModuleView.vue`
  - `components/MerchantDecorationPublishPanel.vue`
  - `composables/useMerchantDecorationState.ts`
  - `merchantDecorationModuleOperations.ts`
- `studio-workbench/src/features/merchant/modules/product/`
  - `MerchantProductView.vue`
  - `components/MerchantProductReadinessBoard.vue`
  - `composables/useMerchantProductState.ts`
  - `merchantProductOperations.ts`
- `studio-workbench/src/features/merchant/modules/operations/`
  - `MerchantOperationsView.vue`
  - `components/MerchantOpsSummaryBoard.vue`
  - `composables/useMerchantOperationsState.ts`
  - `merchantOperationsOperations.ts`

## API slice 收口

- `studio-workbench/src/shared/api/backendMerchantConfigApi.ts`
  - `listServiceGroups`
  - `createServiceGroup`
  - `updateServiceGroup`
  - `deleteServiceGroup`
  - `listBookingInventory`
  - `updateBookingInventory`
- `studio-workbench/src/shared/api/backendMerchantOpsApi.ts`
  - `listNotificationTemplates`
  - `createNotificationTemplate`
  - `updateNotificationTemplate`
  - `listNotificationLogs`
  - `listOperationLogs`
  - `listChannelSyncLogs`
  - `listChannelProductMappings`
  - `listDouyinAcceptanceCases`
  - `getDouyinSyncHealth`
  - `syncDouyinLifeOrders`

## 兼容规则

- 顶层页面入口继续保留：
  - `studio-workbench/src/features/merchant/MerchantOverviewView.vue`
  - `studio-workbench/src/features/merchant/ServiceGroupsView.vue`
  - `studio-workbench/src/features/merchant/MerchantMicroFormsView.vue`
  - `studio-workbench/src/features/products/DouyinProductsView.vue`
  - `studio-workbench/src/features/tools/NotificationsView.vue`
- 页面层继续统一走 `backendApi` 和 `appStore` facade，不允许直接拼 `/yy/*`。
- `backend.ts` 继续是兼容总 facade，但商户配置域和商户运营域的方法 owner 已下沉到独立 slice。

## 数据边界

- `yy_order` 仍是唯一订单账本。
- `yy_booking_slot_inventory` 仍是唯一时段容量账本。
- 商户内容域仍围绕 `yy_merchant_decoration`、`yy_merchant_micro_page`、`yy_merchant_micro_form`、`yy_merchant_micro_form_submission`。
