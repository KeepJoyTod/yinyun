import { reactive } from 'vue'
import { productBookingRuleApi } from '../api/backendProductBookingRuleApi'
import { productCatalogApi } from '../api/backendProductCatalogApi'
import { productCategoryApi } from '../api/backendProductCategoryApi'
import { productChannelConfigApi } from '../api/backendProductChannelConfigApi'
import { productDisplayConfigApi } from '../api/backendProductDisplayConfigApi'
import { productFulfillmentRuleApi } from '../api/backendProductFulfillmentRuleApi'
import { productRelationApi } from '../api/backendProductRelationApi'
import { productSkuApi } from '../api/backendProductSkuApi'
import type {
  ProductBookingRuleDto,
  ProductCatalogDto,
  ProductCategoryDto,
  ProductChannelConfigDto,
  ProductDisplayConfigDto,
  ProductFulfillmentRuleDto,
  ProductRelationDto,
  ProductSkuDto,
} from '../api/backendProductConfigTypes'
import type { BackendId } from '../api/backendId'
import { productScaffoldOwners, toCatalogSummary, type ProductCatalogSummary } from './productCatalogTransforms'

export const productCatalogStore = reactive({
  loading: false,
  error: '',
  catalog: null as ProductCatalogDto | null,
  summary: null as ProductCatalogSummary | null,
  categories: [] as ProductCategoryDto[],
  skus: [] as ProductSkuDto[],
  displayConfigs: [] as ProductDisplayConfigDto[],
  relations: [] as ProductRelationDto[],
  bookingRules: [] as ProductBookingRuleDto[],
  channelConfigs: [] as ProductChannelConfigDto[],
  fulfillmentRules: [] as ProductFulfillmentRuleDto[],
  owners: productScaffoldOwners,

  reset() {
    this.loading = false
    this.error = ''
    this.catalog = null
    this.summary = null
    this.categories = []
    this.skus = []
    this.displayConfigs = []
    this.relations = []
    this.bookingRules = []
    this.channelConfigs = []
    this.fulfillmentRules = []
  },

  async loadCatalog(productId: BackendId) {
    this.loading = true
    this.error = ''
    try {
      this.catalog = await productCatalogApi.getCatalog(productId)
      this.summary = toCatalogSummary(this.catalog)
      return this.catalog
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Load product catalog failed'
      throw error
    } finally {
      this.loading = false
    }
  },

  async loadConfigLists(productId?: BackendId) {
    this.loading = true
    this.error = ''
    const query = productId ? { productId } : undefined
    try {
      const [categories, skus, displayConfigs, relations, bookingRules, channelConfigs, fulfillmentRules] = await Promise.all([
        productCategoryApi.list(),
        productSkuApi.list(query),
        productDisplayConfigApi.list(query),
        productRelationApi.list(query),
        productBookingRuleApi.list(query),
        productChannelConfigApi.list(query),
        productFulfillmentRuleApi.list(query),
      ])
      this.categories = categories
      this.skus = skus
      this.displayConfigs = displayConfigs
      this.relations = relations
      this.bookingRules = bookingRules
      this.channelConfigs = channelConfigs
      this.fulfillmentRules = fulfillmentRules
      return { categories, skus, displayConfigs, relations, bookingRules, channelConfigs, fulfillmentRules }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Load product config failed'
      throw error
    } finally {
      this.loading = false
    }
  },
})
