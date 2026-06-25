import { apiRequest, apiRequestRaw } from './request'
import { accountApi } from './backendAccountApi'
import { createAuditApi } from './backendAuditApi'
import { assetsApi } from './backendAssetsApi'
import { createAlbumsApi } from './backendAlbumsApi'
import { dashboardApi } from './backendDashboardApi'
import { featureScopeApi } from './backendFeatureScopeApi'
import { financeApi } from './backendFinanceApi'
import { normalizeBackendId, type BackendId } from './backendId'
import { createInventoryApi } from './backendInventoryApi'
import { createMasterDataApi } from './backendMasterDataApi'
import { createMemberApi } from './backendMemberApi'
import { createMerchantConfigApi } from './backendMerchantConfigApi'
import { marketingApi } from './backendMarketingApi'
import { merchantContentApi } from './backendMerchantContentApi'
import { createMerchantOpsApi } from './backendMerchantOpsApi'
import { merchantReadinessApi } from './backendMerchantReadinessApi'
import { createOrdersApi } from './backendOrdersApi'
import { createPaymentsApi } from './backendPaymentsApi'
import { platformApi } from './backendPlatformApi'
import { createProductsApi } from './backendProductsApi'
import { resourcesApi } from './backendResourcesApi'
import { reportsApi } from './backendReportsApi'
import { scheduleRulesApi } from './backendScheduleRulesApi'
import { serviceProductionApi } from './backendServiceProductionApi'
import { toolsApi } from './backendToolsApi'
import { workOrdersApi } from './backendWorkOrdersApi'
import {
  pageQuery,
} from './backendQueryMappers'
import {
  mapChannelProductMappingRow,
} from './backendRowMappers'
import {
  buildScheduleItemsFromOrders,
  buildStudiosFromStores,
  extractRuoyiRows,
  mapYyStore,
  type RuoyiTableResponse,
  type YyOrderVo,
  type YyStoreVo,
} from './yingyueAdapter'
import type {
  BookingInventoryDto,
  ChannelAcceptanceCaseDto,
  ChannelProductMappingDto,
  ChannelSyncLogDto,
  CustomerDto,
  EmployeeDto,
  MemberBalanceLedgerDto,
  MemberBenefitDto,
  MemberCardDto,
  MemberCouponDto,
  MemberGrowthLedgerDto,
  MemberOverviewDto,
  MemberPointsLedgerDto,
  MemberRechargeOrderDto,
  MemberRechargeCapabilityDto,
  MemberRechargeSettingDto,
  MemberStoredValueTransactionDto,
  MemberStoredValueTransactionListQuery,
  NotificationLogDto,
  NotificationTemplateDto,
  OperationLogDto,
  OrderDto,
  ProductDto,
  ServiceGroupDto,
  StoreDto,
  WorkbenchBootstrapDto,
} from './backendTypes'

export type {
  AccountBrandDto,
  AccountProfileDto,
  AlbumDto,
  AlbumPhotoDto,
  BookingInventoryDto,
  BookingInventoryListQuery,
  BookingInventoryUpdatePayload,
  ChannelAcceptanceCaseDto,
  ChannelProductMappingDto,
  ChannelSyncHealthDto,
  ChannelSyncLogDto,
  ChannelSyncLogListQuery,
  CollaborationPolicyDto,
  CollaborationPolicyPayload,
  CollaborationLicenseBindStorePayload,
  CollaborationLicenseDto,
  CollaborationLicensePayload,
  CollaborationLicenseStoreBindingDto,
  CollaborationPositionConfigItemDto,
  CollaborationSettingDto,
  CollaborationSettingPayload,
  CollaborationStageCode,
  CustomerDto,
  CustomerPayload,
  DashboardConversionDto,
  DashboardExportQuery,
  DashboardFinanceDto,
  DashboardProductRankingDto,
  DashboardProductRankingQuery,
  DashboardProductRankingRowDto,
  DashboardScopeQuery,
  DashboardTrendStatsQuery,
  DouyinLifeOrderSyncQuery,
  DouyinLifeOrderSyncResult,
  EmployeeDto,
  EmployeePayload,
  FeatureScopeApprovalState,
  FeatureScopeDto,
  FeatureScopeLicenseState,
  FeatureScopeLicenseSummaryDto,
  FeatureScopePluginState,
  FeatureScopePluginSummaryDto,
  FinanceOverviewDto,
  FinanceTransactionDto,
  FinanceTransactionQuery,
  HelpCenterArticleDto,
  MemberBalanceLedgerDto,
  MemberBenefitDto,
  MemberCardDto,
  MemberCouponDto,
  MemberGrowthLedgerDto,
  MemberOverviewDto,
  MemberPointsLedgerDto,
  MemberRechargeCapabilityDto,
  MemberRechargeCreatePayload,
  MemberRechargeOrderDto,
  MemberRechargeSettingDto,
  MerchantDecorationConfig,
  MerchantDecorationDto,
  MerchantDecorationPayload,
  MerchantReadinessItemDto,
  MerchantReadinessPriority,
  MerchantReadinessStatus,
  MicroFormDto,
  MicroFormFieldSchema,
  MicroFormFieldType,
  MicroFormListQuery,
  MicroFormPayload,
  MicroFormSchema,
  MicroFormSubmissionDto,
  MicroFormSubmissionFollowPayload,
  MicroFormSubmissionQuery,
  MicroPageComponentSchema,
  MicroPageComponentType,
  MicroPageDto,
  MicroPageListQuery,
  MicroPagePayload,
  MicroPageSchema,
  MarketingCampaignDto,
  MarketingCampaignListQuery,
  MarketingCampaignParticipationDto,
  MarketingCampaignPayload,
  MarketingCampaignScaffoldDto,
  MarketingCapabilityDto,
  MarketingChannelSummaryDto,
  MarketingCouponGrantDto,
  MarketingCouponGrantRecordDto,
  MarketingCouponInstanceDto,
  MarketingCouponIssuePayload,
  MarketingCouponScaffoldDto,
  MarketingCouponTemplateListQuery,
  MarketingCouponTemplateDto,
  MarketingCouponTemplatePayload,
  MarketingCouponTemplateType,
  MarketingCouponWriteoffDto,
  MarketingDashboardDto,
  MarketingDashboardMetricDto,
  MarketingParticipationListQuery,
  MarketingParticipationRowDto,
  MarketingScaffoldStatus,
  NotificationLogDto,
  NotificationTemplateDto,
  NotificationTemplatePayload,
  OperationLogDto,
  OperationLogListQuery,
  OrderCreatePayload,
  OrderExportQuery,
  OrderDto,
  OrderListQuery,
  OrderPaymentConfirmPayload,
  OrderReschedulePayload,
  OrderStatusPayload,
  OrderStatusStatDto,
  PlatformActionHintDto,
  PlatformBookingPolicyDto,
  PlatformBrandInfoDto,
  PlatformEmailSettingsDto,
  PlatformEvidenceDto,
  PlatformIntegrationDto,
  PlatformIntegrationStatusDto,
  PlatformNotificationCenterDto,
  PlatformNotificationRuleDto,
  PlatformPrintSettingsDto,
  PlatformScoreSettingsDto,
  PlatformScaffoldStatus,
  PlatformServicePackageDto,
  PlatformServicePackageStatusDto,
  PaymentRecordDto,
  PhotoAccessLog,
  PhotoAccessLogQuery,
  ProductCollaborationConfigDto,
  ProductCollaborationConfigPayload,
  ProductDto,
  ProductPayload,
  ReportSnapshot,
  ReportSnapshotQuery,
  RetouchProviderDto,
  RetouchProviderListQuery,
  RetouchProviderPayload,
  RetouchTaskActionPayload,
  RetouchTaskDto,
  RetouchTaskListQuery,
  ResourceBatchUpdatePayload,
  ResourceListQuery,
  ResourceRowDto,
  ResourceSizeBackfillPayload,
  ResourceSizeBackfillResultDto,
  ResourceTagDto,
  ResourceTagListQuery,
  ResourceTagOptionDto,
  ResourceTagPayload,
  ResourceUsageBreakdownDto,
  ResourceUsageSummaryDto,
  ScheduleItemDto,
  ScheduleRuleDto,
  SelectionLinkDto,
  SelectionStatsDto,
  ServiceGroupDto,
  ServiceLicenseBindingDto,
  ServiceLicenseBindingPayload,
  StoreDto,
  StudioDto,
  TodaySlotDto,
  ToolPrecisionDeliverySummaryDto,
  ToolPrecisionDeliveryTaskDto,
  ToolSampleWorkDto,
  TrendStatDto,
  WorkOrderDto,
  WorkOrderEventDto,
  WorkOrderListQuery,
  WorkOrderTransitionPayload,
  WorkbenchBootstrapDto,
  PublicMicroFormDto,
  PublicMicroFormSubmitPayload,
  PublicMicroFormSubmitResult,
  PublicMicroPageDto,
  PromotionCandidateType,
  PromotionTrialCandidateDto,
  PromotionTrialPayload,
  PromotionTrialResultDto,
  MemberStoredValueTransactionDto,
  MemberStoredValueTransactionListQuery,
} from './backendTypes'

let cachedStores: StoreDto[] = []
let cachedProducts: ProductDto[] = []
let cachedOrders: OrderDto[] = []
let cachedLedgerOrders: OrderDto[] = []
let cachedServiceGroups: ServiceGroupDto[] = []
let cachedBookingInventory: BookingInventoryDto[] = []
let cachedEmployees: EmployeeDto[] = []
let cachedCustomers: CustomerDto[] = []
let cachedMemberOverviews: Record<string, MemberOverviewDto> = {}
let cachedMemberCards: Record<string, MemberCardDto[]> = {}
let cachedMemberBenefits: Record<string, MemberBenefitDto[]> = {}
let cachedMemberCoupons: Record<string, MemberCouponDto[]> = {}
let cachedMemberPointsLedger: Record<string, MemberPointsLedgerDto[]> = {}
let cachedMemberGrowthLedger: Record<string, MemberGrowthLedgerDto[]> = {}
let cachedMemberBalanceLedger: Record<string, MemberBalanceLedgerDto[]> = {}
let cachedMemberRechargeOrders: Record<string, MemberRechargeOrderDto[]> = {}
let cachedNotificationTemplates: NotificationTemplateDto[] = []
let cachedNotificationLogs: NotificationLogDto[] = []
let cachedOperationLogs: OperationLogDto[] = []
let cachedChannelSyncLogs: ChannelSyncLogDto[] = []
let cachedChannelProductMappings: ChannelProductMappingDto[] = []
let cachedDouyinAcceptanceCases: ChannelAcceptanceCaseDto[] = []

const listRows = async <T>(path: string, query?: Record<string, string | number | boolean | null | undefined>) => {
  const response = await apiRequestRaw<RuoyiTableResponse<T>>(path, {}, { ...pageQuery, ...query })
  return extractRuoyiRows(response)
}

const normalizeMatchText = (value?: string | number | null) => String(value ?? '').trim()

const ensureChannelProductMappingsLoaded = async (channelType = 'DOUYIN_LIFE') => {
  const normalized = String(channelType).trim()
  if (cachedChannelProductMappings.some(item => String(item.channelType ?? '').trim() === normalized)) return
  const rows = await listRows<Record<string, any>>('/yy/channelProductMapping/list', { channelType: normalized })
  cachedChannelProductMappings = rows.map(mapChannelProductMappingRow)
}

const sameId = (left: string | number | undefined | null, right: string | number | undefined | null) =>
  String(left ?? '') === String(right ?? '')

const resolveOrderPresentation = (row: YyOrderVo) => {
  const externalSkuId = normalizeMatchText(row.externalSkuId)
  const externalPoiId = normalizeMatchText(row.externalPoiId)
  const externalProductId = normalizeMatchText(row.externalProductId)

  const skuMappings = externalSkuId
    ? cachedChannelProductMappings.filter(item => normalizeMatchText(item.externalSkuId) === externalSkuId)
    : []
  const poiMappings = externalPoiId
    ? cachedChannelProductMappings.filter(item => normalizeMatchText(item.externalPoiId) === externalPoiId)
    : []

  const mapping = skuMappings.find(item => externalPoiId && normalizeMatchText(item.externalPoiId) === externalPoiId)
    ?? skuMappings[0]
    ?? poiMappings.find(item => !normalizeMatchText(item.externalSkuId))
    ?? poiMappings[0]

  const mappedProductId = mapping ? normalizeBackendId(mapping.productId) : null
  const directProduct = cachedProducts.find(item =>
    sameId(item.id, externalProductId) || String(item.productCode ?? '').trim() === externalProductId,
  )
  const mappedProduct = mappedProductId ? cachedProducts.find(item => item.id === mappedProductId) : undefined
  const product = mappedProduct ?? directProduct

  return {
    productId: product?.id ?? mappedProductId ?? null,
    serviceNameSnapshot: product?.name || mapping?.externalName || (externalSkuId ? `抖音SKU ${externalSkuId}` : ''),
  }
}

const productsApi = createProductsApi({
  getStores: () => cachedStores,
  getProducts: () => cachedProducts,
  setProducts: items => { cachedProducts = items },
})

const masterDataApi = createMasterDataApi({
  ensureProductsLoaded: async () => {
    if (!cachedProducts.length) await backendApi.listProducts()
  },
  getCachedProducts: () => cachedProducts,
  getServiceGroups: () => cachedServiceGroups,
  setServiceGroups: items => { cachedServiceGroups = items },
  getEmployees: () => cachedEmployees,
  setEmployees: items => { cachedEmployees = items },
  getCustomers: () => cachedCustomers,
  setCustomers: items => { cachedCustomers = items },
  getNotificationTemplates: () => cachedNotificationTemplates,
  setNotificationTemplates: items => { cachedNotificationTemplates = items },
  getNotificationLogs: () => cachedNotificationLogs,
  setNotificationLogs: items => { cachedNotificationLogs = items },
})

const merchantConfigApi = createMerchantConfigApi({
  getServiceGroups: () => cachedServiceGroups,
  setServiceGroups: items => { cachedServiceGroups = items },
})

const merchantOpsApi = createMerchantOpsApi({
  getNotificationTemplates: () => cachedNotificationTemplates,
  setNotificationTemplates: items => { cachedNotificationTemplates = items },
  getNotificationLogs: () => cachedNotificationLogs,
  setNotificationLogs: items => { cachedNotificationLogs = items },
  getChannelProductMappings: () => cachedChannelProductMappings,
  setChannelProductMappings: items => { cachedChannelProductMappings = items },
  getDouyinAcceptanceCases: () => cachedDouyinAcceptanceCases,
  setDouyinAcceptanceCases: items => { cachedDouyinAcceptanceCases = items },
})

const inventoryApi = createInventoryApi({
  getBookingInventory: () => cachedBookingInventory,
  setBookingInventory: items => { cachedBookingInventory = items },
})

const auditApi = createAuditApi({
  getOperationLogs: () => cachedOperationLogs,
  setOperationLogs: items => { cachedOperationLogs = items },
  getChannelSyncLogs: () => cachedChannelSyncLogs,
  setChannelSyncLogs: items => { cachedChannelSyncLogs = items },
})

const memberApi = createMemberApi({
  getOverviews: () => cachedMemberOverviews,
  setOverviews: items => { cachedMemberOverviews = items },
  getCards: () => cachedMemberCards,
  setCards: items => { cachedMemberCards = items },
  getBenefits: () => cachedMemberBenefits,
  setBenefits: items => { cachedMemberBenefits = items },
  getCoupons: () => cachedMemberCoupons,
  setCoupons: items => { cachedMemberCoupons = items },
  getPointsLedger: () => cachedMemberPointsLedger,
  setPointsLedger: items => { cachedMemberPointsLedger = items },
  getGrowthLedger: () => cachedMemberGrowthLedger,
  setGrowthLedger: items => { cachedMemberGrowthLedger = items },
  getBalanceLedger: () => cachedMemberBalanceLedger,
  setBalanceLedger: items => { cachedMemberBalanceLedger = items },
  getRechargeOrders: () => cachedMemberRechargeOrders,
  setRechargeOrders: items => { cachedMemberRechargeOrders = items },
})

const memberStoredValueApi = {
  getMemberRechargeSetting() {
    return apiRequest<MemberRechargeSettingDto>('/yy/member/recharge-setting')
  },
  getMemberRechargeCapability() {
    return apiRequest<MemberRechargeCapabilityDto>('/yy/member/recharge-capability')
  },
  listMemberStoredValueTransactions(query: MemberStoredValueTransactionListQuery = {}) {
    return apiRequest<MemberStoredValueTransactionDto[]>('/yy/member/stored-value-transactions', {}, query)
  },
}

const ordersApi = createOrdersApi({
  listRows,
  ensureChannelProductMappingsLoaded,
  resolveOrderPresentation,
  getProducts: () => cachedProducts,
  getOrders: () => cachedOrders,
  setOrders: items => { cachedOrders = items },
  getLedgerOrders: () => cachedLedgerOrders,
  setLedgerOrders: items => { cachedLedgerOrders = items },
})

const paymentsApi = createPaymentsApi({
  resolveOrderPresentation,
  getProducts: () => cachedProducts,
  getOrders: () => cachedOrders,
  setOrders: items => { cachedOrders = items },
  getLedgerOrders: () => cachedLedgerOrders,
  setLedgerOrders: items => { cachedLedgerOrders = items },
})

export const backendApi = {
  getWorkbenchBootstrap: () => apiRequest<WorkbenchBootstrapDto>('/yy/studio/bootstrap'),
  ...featureScopeApi,
  ...accountApi,
  ...assetsApi,
  ...dashboardApi,
  ...marketingApi,
  async listStores() {
    const rows = await listRows<YyStoreVo>('/yy/store/list')
    cachedStores = rows.map(mapYyStore)
    return cachedStores
  },
  ...productsApi,
  ...masterDataApi,
  ...memberApi,
  ...memberStoredValueApi,
  ...merchantConfigApi,
  ...merchantOpsApi,
  ...inventoryApi,
  ...auditApi,
  ...ordersApi,
  ...paymentsApi,
  ...resourcesApi,
  ...createAlbumsApi({ getCachedOrders: () => cachedOrders }),
  async listProductSpecOptions() {
    if (!cachedProducts.length) await this.listProducts()
    return Array.from(new Set(cachedProducts.map(product => product.spec).filter(Boolean)))
  },
  async listStudios() {
    return buildStudiosFromStores(cachedStores)
  },
  listSchedules: (query: { date?: string; storeId?: BackendId }) =>
    Promise.resolve(
      buildScheduleItemsFromOrders(
        cachedLedgerOrders.length ? cachedLedgerOrders : cachedOrders,
        query.date,
        query.storeId,
      ),
    ),
  ...workOrdersApi,
  ...reportsApi,
  ...scheduleRulesApi,
  ...serviceProductionApi,
  ...financeApi,
  ...merchantContentApi,
  ...merchantReadinessApi,
  ...platformApi,
  ...toolsApi,
}

export { getApiAssetUrl } from './request'
export type { BackendId } from './backendId'
export type { PhotoAlbumActionDto, PhotoAlbumActionPayload } from './backendAlbumsApi'
export { buildAllOrdersQuery } from './backendQueryMappers'
export {
  defaultMerchantDecorationConfig,
  defaultMicroFormSchema,
  defaultMicroPageSchema,
} from './backendMerchantContentApi'
