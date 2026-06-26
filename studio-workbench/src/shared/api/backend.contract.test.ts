import { describe, expect, it } from 'vitest'
import backendAccountApiSource from '/src/shared/api/backendAccountApi.ts?raw'
import backendAlbumsApiSource from '/src/shared/api/backendAlbumsApi.ts?raw'
import backendAuditApiSource from '/src/shared/api/backendAuditApi.ts?raw'
import backendAssetsApiSource from '/src/shared/api/backendAssetsApi.ts?raw'
import backendCardBatchOrderApiSource from '/src/shared/api/backendCardBatchOrderApi.ts?raw'
import backendDashboardApiSource from '/src/shared/api/backendDashboardApi.ts?raw'
import backendFeatureScopeApiSource from '/src/shared/api/backendFeatureScopeApi.ts?raw'
import backendFinanceApiSource from '/src/shared/api/backendFinanceApi.ts?raw'
import backendSource from '/src/shared/api/backend.ts?raw'
import backendInventoryApiSource from '/src/shared/api/backendInventoryApi.ts?raw'
import backendMarketingApiSource from '/src/shared/api/backendMarketingApi.ts?raw'
import backendMarketingCampaignsApiSource from '/src/shared/api/backendMarketingCampaignsApi.ts?raw'
import backendMarketingCapabilitiesApiSource from '/src/shared/api/backendMarketingCapabilitiesApi.ts?raw'
import backendMarketingCouponsApiSource from '/src/shared/api/backendMarketingCouponsApi.ts?raw'
import backendMarketingParticipationsApiSource from '/src/shared/api/backendMarketingParticipationsApi.ts?raw'
import backendMemberApiSource from '/src/shared/api/backendMemberApi.ts?raw'
import backendMasterDataApiSource from '/src/shared/api/backendMasterDataApi.ts?raw'
import backendMerchantContentApiSource from '/src/shared/api/backendMerchantContentApi.ts?raw'
import backendMerchantConfigApiSource from '/src/shared/api/backendMerchantConfigApi.ts?raw'
import backendMerchantOpsApiSource from '/src/shared/api/backendMerchantOpsApi.ts?raw'
import backendMerchantReadinessApiSource from '/src/shared/api/backendMerchantReadinessApi.ts?raw'
import backendOrdersApiSource from '/src/shared/api/backendOrdersApi.ts?raw'
import backendPaymentsApiSource from '/src/shared/api/backendPaymentsApi.ts?raw'
import backendPlatformApiSource from '/src/shared/api/backendPlatformApi.ts?raw'
import backendProductsApiSource from '/src/shared/api/backendProductsApi.ts?raw'
import backendQueryMappersSource from '/src/shared/api/backendQueryMappers.ts?raw'
import backendReportsApiSource from '/src/shared/api/backendReportsApi.ts?raw'
import backendResourcesApiSource from '/src/shared/api/backendResourcesApi.ts?raw'
import backendRowMappersSource from '/src/shared/api/backendRowMappers.ts?raw'
import backendScheduleRulesApiSource from '/src/shared/api/backendScheduleRulesApi.ts?raw'
import backendServiceProductionApiSource from '/src/shared/api/backendServiceProductionApi.ts?raw'
import backendToolsApiSource from '/src/shared/api/backendToolsApi.ts?raw'
import backendTypesAccountSource from '/src/shared/api/backendTypesAccount.ts?raw'
import backendTypesCardBatchOrderSource from '/src/shared/api/backendTypesCardBatchOrder.ts?raw'
import backendTypesDashboardSource from '/src/shared/api/backendTypesDashboard.ts?raw'
import backendTypesAccessSource from '/src/shared/api/backendTypesAccess.ts?raw'
import backendTypesFinanceSource from '/src/shared/api/backendTypesFinance.ts?raw'
import backendTypesMarketingSource from '/src/shared/api/backendTypesMarketing.ts?raw'
import backendTypesMemberSource from '/src/shared/api/backendTypesMember.ts?raw'
import backendTypesPhase1Source from '/src/shared/api/backendTypesPhase1.ts?raw'
import backendTypesSource from '/src/shared/api/backendTypes.ts?raw'
import backendTypesCoreSource from '/src/shared/api/backendTypesCore.ts?raw'
import backendTypesMerchantSource from '/src/shared/api/backendTypesMerchant.ts?raw'
import backendTypesPayloadsSource from '/src/shared/api/backendTypesPayloads.ts?raw'
import backendTypesPlatformSource from '/src/shared/api/backendTypesPlatform.ts?raw'
import backendTypesReportsSource from '/src/shared/api/backendTypesReports.ts?raw'
import backendTypesServiceProductionSource from '/src/shared/api/backendTypesServiceProduction.ts?raw'
import backendTypesToolsSource from '/src/shared/api/backendTypesTools.ts?raw'
import backendTypesWorkbenchSource from '/src/shared/api/backendTypesWorkbench.ts?raw'
import backendWorkOrdersApiSource from '/src/shared/api/backendWorkOrdersApi.ts?raw'

const backendContractSource = `${backendSource}\n${backendAccountApiSource}\n${backendAlbumsApiSource}\n${backendAuditApiSource}\n${backendAssetsApiSource}\n${backendCardBatchOrderApiSource}\n${backendDashboardApiSource}\n${backendFeatureScopeApiSource}\n${backendFinanceApiSource}\n${backendInventoryApiSource}\n${backendMarketingApiSource}\n${backendMarketingCampaignsApiSource}\n${backendMarketingCapabilitiesApiSource}\n${backendMarketingCouponsApiSource}\n${backendMarketingParticipationsApiSource}\n${backendMasterDataApiSource}\n${backendMemberApiSource}\n${backendMerchantConfigApiSource}\n${backendMerchantContentApiSource}\n${backendMerchantOpsApiSource}\n${backendMerchantReadinessApiSource}\n${backendOrdersApiSource}\n${backendPaymentsApiSource}\n${backendPlatformApiSource}\n${backendProductsApiSource}\n${backendReportsApiSource}\n${backendResourcesApiSource}\n${backendScheduleRulesApiSource}\n${backendServiceProductionApiSource}\n${backendToolsApiSource}\n${backendWorkOrdersApiSource}\n${backendQueryMappersSource}\n${backendRowMappersSource}`
const backendTypesContractSource = `${backendTypesSource}\n${backendTypesCoreSource}\n${backendTypesAccessSource}\n${backendTypesWorkbenchSource}\n${backendTypesServiceProductionSource}\n${backendTypesPayloadsSource}\n${backendTypesMerchantSource}\n${backendTypesPlatformSource}\n${backendTypesAccountSource}\n${backendTypesCardBatchOrderSource}\n${backendTypesFinanceSource}\n${backendTypesToolsSource}\n${backendTypesMarketingSource}\n${backendTypesMemberSource}\n${backendTypesPhase1Source}\n${backendTypesDashboardSource}\n${backendTypesReportsSource}`
const backendTypesNormalized = backendTypesContractSource.replace(/\r\n/g, '\n')

describe('studio backend api contract', () => {
  it('keeps snowflake identifiers as strings at the api boundary', () => {
    expect(backendContractSource).toContain('normalizeBackendId')
    expect(backendTypesNormalized).toContain('export type OrderDto = {\n  id: BackendId')
  })

  it('exposes merchant config and merchant ops slices through backendApi', () => {
    expect(backendSource).toContain('...merchantConfigApi')
    expect(backendSource).toContain('...merchantOpsApi')
    expect(backendContractSource).toContain("'/yy/serviceGroup/list'")
    expect(backendContractSource).toContain("'/yy/notificationTemplate/list'")
  })

  it('exposes merchant readiness as a read-only facade slice', () => {
    expect(backendSource).toContain('...merchantReadinessApi')
    expect(backendContractSource).toContain("'/yy/merchant/readiness/summary'")
    expect(backendContractSource).toContain("'/yy/merchant/readiness/schedule'")
    expect(backendContractSource).toContain("'/yy/merchant/readiness/channels'")
    expect(backendContractSource).toContain("'/yy/merchant/readiness/governance'")
    expect(backendContractSource).toContain("'/yy/merchant/readiness/dependencies'")
    expect(backendTypesNormalized).toContain('export type MerchantReadinessItemDto = {')
  })

  it('keeps work orders, reports, and orders slices aggregated on the shared facade', () => {
    expect(backendSource).toContain('...ordersApi')
    expect(backendSource).toContain('...workOrdersApi')
    expect(backendSource).toContain('...reportsApi')
    expect(backendSource).toContain('...merchantContentApi')
  })

  it('exposes order analysis scaffold on the shared reports facade', () => {
    expect(backendContractSource).toContain('/yy/reportOrderAnalysis/overview')
    expect(backendTypesSource).toContain("export type * from './backendTypesReports'")
    expect(backendTypesNormalized).toContain('export type OrderAnalysisQuery = {')
    expect(backendTypesNormalized).toContain('export type OrderAnalysisScaffoldDto = {')
  })

  it('exposes finance reconciliation and async export on the shared reports facade', () => {
    expect(backendContractSource).toContain('/yy/reportFinanceReconciliation/overview')
    expect(backendContractSource).toContain('/yy/reportFinanceReconciliation/export')
    expect(backendContractSource).toContain('/yy/reportFinanceReconciliation/export/tasks')
    expect(backendTypesNormalized).toContain('export type ReportFinanceReconciliationQuery = {')
    expect(backendTypesNormalized).toContain('export type ReportFinanceReconciliationDto = {')
    expect(backendTypesNormalized).toContain('export type ReportFinanceExportTaskDto = {')
  })

  it('splits phase1 payment, inventory, and audit slices while keeping backendApi compatibility', () => {
    expect(backendSource).toContain('...paymentsApi')
    expect(backendSource).toContain('...inventoryApi')
    expect(backendSource).toContain('...auditApi')
    expect(backendContractSource).toContain('/payment/confirm')
    expect(backendContractSource).toContain("'/yy/bookingSlotInventory/list'")
    expect(backendContractSource).toContain("'/yy/bookingSlotInventory'")
    expect(backendContractSource).toContain("'/monitor/operlog/list'")
    expect(backendContractSource).toContain("'/yy/channelSyncLog/list'")
    expect(backendTypesSource).toContain("export type * from './backendTypesPhase1'")
    expect(backendTypesNormalized).toContain('export type PaymentRecordDto = {')
    expect(backendTypesNormalized).toContain('export type BookingInventoryListQuery = {')
    expect(backendTypesNormalized).toContain('export type OperationLogListQuery = {')
    expect(backendTypesNormalized).toContain('export type ChannelSyncLogListQuery = {')
  })

  it('aggregates card batch order approval scaffold on the shared facade', () => {
    expect(backendSource).toContain('...cardBatchOrderApi')
    expect(backendSource).toContain("export type * from './backendTypes'")
    expect(backendContractSource).toContain("'/yy/card-batch-orders'")
    expect(backendTypesSource).toContain("export type * from './backendTypesCardBatchOrder'")
    expect(backendTypesNormalized).toContain('export type CardBatchOrderDto = {')
    expect(backendTypesNormalized).toContain('export type CardBatchOrderCreatePayload = {')
  })

  it('moves dashboard read models into a dedicated dashboard api slice', () => {
    expect(backendSource).toContain('...dashboardApi')
    expect(backendContractSource).toContain("'/yy/dashboard/finance'")
    expect(backendContractSource).toContain("'/yy/dashboard/order-status-stats'")
    expect(backendContractSource).toContain("'/yy/dashboard/trend-stats'")
    expect(backendContractSource).toContain("'/yy/dashboard/today-slots'")
    expect(backendContractSource).toContain("'/yy/dashboard/product-ranking'")
    expect(backendContractSource).toContain("'/yy/dashboard/conversion'")
    expect(backendContractSource).toContain("'/yy/dashboard/export'")
    expect(backendContractSource).toContain('mapDashboardProductRanking')
    expect(backendContractSource).toContain('mapDashboardConversionRow')
    expect(backendTypesSource).toContain("export type * from './backendTypesDashboard'")
    expect(backendTypesNormalized).toContain('export type DashboardProductRankingDto = {')
    expect(backendTypesNormalized).toContain('export type DashboardConversionDto = {')
  })

  it('splits marketing merchant APIs into coupon, campaign, participation and capability slices', () => {
    expect(backendSource).toContain('...marketingApi')
    expect(backendMarketingApiSource).toContain('...marketingCouponsApi')
    expect(backendMarketingApiSource).toContain('...marketingCampaignsApi')
    expect(backendMarketingApiSource).toContain('...marketingParticipationsApi')
    expect(backendMarketingApiSource).toContain('...marketingCapabilitiesApi')
    expect(backendContractSource).toContain("'/yy/couponTemplate/list'")
    expect(backendContractSource).toContain("'/yy/campaign/list'")
    expect(backendContractSource).toContain("'/yy/campaignParticipation/list'")
    expect(backendContractSource).toContain("'/yy/marketing/dashboard'")
    expect(backendTypesSource).toContain("export type * from './backendTypesMarketing'")
    expect(backendTypesNormalized).toContain('export type MarketingCouponTemplatePayload = {')
    expect(backendTypesNormalized).toContain('export type MarketingCampaignPayload = {')
    expect(backendTypesNormalized).toContain('export type MarketingParticipationRowDto = {')
  })

  it('aggregates feature scope apis on the shared facade', () => {
    expect(backendSource).toContain('...featureScopeApi')
    expect(backendTypesSource).toContain("export type * from './backendTypesAccess'")
    expect(backendTypesNormalized).toContain('export type FeatureScopeDto = {')
    expect(backendContractSource).toContain("'/yy/featureScope/list'")
    expect(backendContractSource).toContain('mapFeatureScopeRow')
  })

  it('aggregates resource apis on the shared facade', () => {
    expect(backendSource).toContain('...resourcesApi')
    expect(backendTypesNormalized).toContain('export type ResourceRowDto = {')
    expect(backendTypesNormalized).toContain('export type ResourceTagDto = {')
    expect(backendTypesNormalized).toContain('export type ResourceUsageSummaryDto = {')
    expect(backendTypesNormalized).toContain('export type ResourceSizeBackfillResultDto = {')
    expect(backendContractSource).toContain("'/yy/photoAsset/resource-list'")
    expect(backendContractSource).toContain("'/yy/photoAsset/batch-update'")
    expect(backendContractSource).toContain("'/yy/photoAsset/usage-summary'")
    expect(backendContractSource).toContain("'/yy/photoAsset/size-backfill'")
    expect(backendContractSource).toContain("'/yy/photoTag/list'")
    expect(backendContractSource).toContain('mapUsageSummary')
    expect(backendContractSource).toContain('mapSizeBackfillResult')
  })

  it('aggregates member asset apis on the shared facade', () => {
    expect(backendSource).toContain('...memberApi')
    expect(backendTypesSource).toContain("export type * from './backendTypesMember'")
    expect(backendTypesNormalized).toContain('export type MemberOverviewDto = {')
    expect(backendTypesNormalized).toContain('export type MemberCardDto = {')
    expect(backendTypesNormalized).toContain('export type MemberRechargeOrderDto = {')
    expect(backendTypesNormalized).toContain('export type MemberRechargeCreatePayload = {')
    expect(backendMemberApiSource).toContain('getMemberOverview')
    expect(backendMemberApiSource).toContain('listMemberCards')
    expect(backendMemberApiSource).toContain('listMemberBenefits')
    expect(backendMemberApiSource).toContain('listMemberCoupons')
    expect(backendMemberApiSource).toContain('listMemberPointsLedger')
    expect(backendMemberApiSource).toContain('listMemberGrowthLedger')
    expect(backendMemberApiSource).toContain('listMemberBalanceLedger')
    expect(backendMemberApiSource).toContain('listMemberRechargeOrders')
    expect(backendMemberApiSource).toContain('createMemberRechargeOrder')
    expect(backendMemberApiSource).toContain('confirmMemberRechargeOrder')
    expect(backendContractSource).toContain('/yy/member/customer/${customerId}/overview')
    expect(backendContractSource).toContain('/yy/member/customer/${customerId}/cards')
    expect(backendContractSource).toContain('/yy/member/customer/${customerId}/benefits')
    expect(backendContractSource).toContain('/yy/member/customer/${customerId}/coupons')
    expect(backendContractSource).toContain('/yy/member/customer/${customerId}/points-ledger')
    expect(backendContractSource).toContain('/yy/member/customer/${customerId}/growth-ledger')
    expect(backendContractSource).toContain('/yy/member/customer/${customerId}/balance-ledger')
    expect(backendContractSource).toContain('/yy/member/customer/${customerId}/recharge-orders')
    expect(backendContractSource).toContain('/yy/member/recharge-orders/${rechargeOrderId}/confirm')
  })

  it('aggregates customer delete api on the shared facade', () => {
    expect(backendMasterDataApiSource).toContain('async deleteCustomer(id: BackendId)')
    expect(backendContractSource).toContain("`/yy/customer/${id}`")
  })

  it('aggregates service production apis on the shared facade', () => {
    expect(backendTypesContractSource).toContain('export type RetouchTaskDto = {')
    expect(backendTypesContractSource).toContain('export type RetouchProviderDto = {')
    expect(backendTypesContractSource).toContain('export type CollaborationPolicyDto = {')
    expect(backendTypesContractSource).toContain('export type ServiceLicenseBindingDto = {')
    expect(backendSource).toContain('...serviceProductionApi')
    expect(backendContractSource).toContain("'/yy/serviceProduction/retouchTask/list'")
    expect(backendContractSource).toContain("'/yy/serviceProduction/retouchProvider/list'")
    expect(backendContractSource).toContain("'/yy/serviceProduction/collaborationPolicy'")
    expect(backendContractSource).toContain("'/yy/serviceProduction/licenseBinding/list'")
    expect(backendContractSource).toContain('mapRetouchTaskRow')
    expect(backendContractSource).toContain('mapRetouchProviderRow')
    expect(backendContractSource).toContain('mapCollaborationPolicyRow')
    expect(backendContractSource).toContain('mapServiceLicenseBindingRow')
  })

  it('splits phase0 scaffold dto types by platform, account, and finance domains', () => {
    expect(backendTypesSource).toContain("export type * from './backendTypesPlatform'")
    expect(backendTypesSource).toContain("export type * from './backendTypesAccount'")
    expect(backendTypesSource).toContain("export type * from './backendTypesFinance'")
    expect(backendTypesSource).toContain("export type * from './backendTypesTools'")
    expect(backendTypesSource).toContain("export type * from './backendTypesWorkbench'")
    expect(backendTypesSource).toContain("export type * from './backendTypesServiceProduction'")
    expect(backendTypesNormalized).toContain('export type PlatformBrandInfoDto = {')
    expect(backendTypesNormalized).toContain('export type AccountProfileDto = {')
    expect(backendTypesNormalized).toContain('export type FinanceOverviewDto = {')
    expect(backendTypesNormalized).toContain('export type ToolSampleWorkDto = {')
  })

  it('aggregates account, finance, platform and tool owner slices on the shared facade', () => {
    expect(backendSource).toContain('...accountApi')
    expect(backendSource).toContain('...financeApi')
    expect(backendSource).toContain('...platformApi')
    expect(backendSource).toContain('...toolsApi')
    expect(backendAccountApiSource).toContain('getAccountProfile')
    expect(backendAccountApiSource).toContain('listAccountBrands')
    expect(backendAccountApiSource).toContain("'/yy/account-center/profile'")
    expect(backendAccountApiSource).toContain("'/yy/account-center/brands'")
    expect(backendAccountApiSource).toContain("'/yy/account-center/help/articles'")
    expect(backendFinanceApiSource).toContain('getFinanceOverview')
    expect(backendFinanceApiSource).toContain('listFinanceTransactions')
    expect(backendFinanceApiSource).toContain("'/yy/finance-center/overview'")
    expect(backendFinanceApiSource).toContain("'/yy/finance-center/transactions'")
    expect(backendPlatformApiSource).toContain('getPlatformBrandInfo')
    expect(backendPlatformApiSource).toContain('listPlatformServicePackages')
    expect(backendPlatformApiSource).toContain("'/yy/platform-settings/integrations'")
    expect(backendPlatformApiSource).toContain("'/yy/platform-settings/login-risk-policies'")
    expect(backendPlatformApiSource).toContain("'/yy/platform-settings/open-api-apps'")
    expect(backendPlatformApiSource).toContain("'/yy/platform-settings/async-tasks'")
    expect(backendPlatformApiSource).toContain("'/yy/platform-settings/notifications'")
    expect(backendPlatformApiSource).toContain("'/yy/platform-settings/backup-recovery-plans'")
    expect(backendPlatformApiSource).toContain("'/yy/platform-settings/service-packages'")
    expect(backendPlatformApiSource).toContain("'/yy/platform-settings/meituan-review-traces'")
    expect(backendTypesNormalized).toContain('export type PlatformIntegrationStatusDto =')
    expect(backendTypesNormalized).toContain('export type PlatformLoginRiskPolicyDto = {')
    expect(backendTypesNormalized).toContain('export type PlatformOpenApiAppDto = {')
    expect(backendTypesNormalized).toContain('export type PlatformAsyncTaskDto = {')
    expect(backendTypesNormalized).toContain('export type PlatformNotificationRuleDto =')
    expect(backendTypesNormalized).toContain('export type PlatformBackupRecoveryDto = {')
    expect(backendTypesNormalized).toContain('export type PlatformServicePackageStatusDto =')
    expect(backendTypesNormalized).toContain('export type PlatformMeituanReviewTraceDto = {')
    expect(backendToolsApiSource).toContain('listToolSampleWorks')
    expect(backendToolsApiSource).toContain('publishToolSampleWork')
    expect(backendToolsApiSource).toContain('getPrecisionDeliverySummary')
    expect(backendToolsApiSource).toContain('listPrecisionDeliveryTasks')
    expect(backendToolsApiSource).toContain("'/yy/tool-center/sample-works'")
    expect(backendToolsApiSource).toContain("'/yy/tool-center/precision-delivery/summary'")
    expect(backendToolsApiSource).toContain("'/yy/tool-center/precision-delivery/tasks'")
  })

  it('exposes copy order api and payload contracts', () => {
    expect(backendOrdersApiSource).toContain('copyOrder(payload: OrderCopyPayload)')
    expect(backendOrdersApiSource).toContain('/yy/order/${payload.sourceOrderId}/copy')
    expect(backendTypesPayloadsSource).toContain('export type OrderCopyPayload = {')
    expect(backendTypesNormalized).toContain('export type OrderCopyPayload = {')
  })
})
