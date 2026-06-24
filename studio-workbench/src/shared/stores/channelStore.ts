import { reactive } from 'vue'
import { backendApi } from '../api/backend'
import type { ChannelProductMappingInfo, ChannelSyncLogInfo, DouyinAcceptanceCaseInfo, DouyinSyncHealthInfo, DouyinLifeOrderSyncInfo } from './appStoreTypes'
import { mapChannelProductMapping, mapChannelSyncLog, mapDouyinAcceptanceCase, mapDouyinSyncHealth } from './appStoreTransforms'
import type { StoreInfo, ProductConfig } from './appStoreTypes'

export const channelStore = reactive({
  channelSyncLogs: [] as ChannelSyncLogInfo[],
  channelProductMappings: [] as ChannelProductMappingInfo[],
  douyinAcceptanceCases: [] as DouyinAcceptanceCaseInfo[],
  douyinSyncHealth: null as DouyinSyncHealthInfo | null,
  lastDouyinLifeOrderSync: null as DouyinLifeOrderSyncInfo | null,

  reset() {
    this.channelSyncLogs = []
    this.channelProductMappings = []
    this.douyinAcceptanceCases = []
    this.douyinSyncHealth = null
    this.lastDouyinLifeOrderSync = null
  },

  async refreshChannelSyncLogs(stores: StoreInfo[]) {
    const logs = await backendApi.listChannelSyncLogs()
    this.channelSyncLogs = logs.map(item => mapChannelSyncLog(item, stores))
    return this.channelSyncLogs
  },

  async refreshChannelProductMappings(channelType: string, stores: StoreInfo[], products: ProductConfig[]) {
    const mappings = await backendApi.listChannelProductMappings({
      channelType: channelType === 'all' ? undefined : channelType,
    })
    this.channelProductMappings = mappings.map(item => mapChannelProductMapping(item, stores, products))
    return this.channelProductMappings
  },

  async refreshDouyinAcceptanceCases() {
    const cases = await backendApi.listDouyinAcceptanceCases()
    this.douyinAcceptanceCases = cases.map(mapDouyinAcceptanceCase)
    return this.douyinAcceptanceCases
  },

  async refreshDouyinSyncHealth() {
    const health = await backendApi.getDouyinSyncHealth()
    this.douyinSyncHealth = health ? mapDouyinSyncHealth(health) : null
    return this.douyinSyncHealth
  },

  loadDemoChannelSyncLogs(stores: StoreInfo[]) {
    this.channelSyncLogs = [
      {
        backendId: '7201',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        channelType: 'DOUYIN_LIFE',
        apiName: 'goodlife/v1/trade/order/query',
        requestId: 'douyin-logid-20260613-001',
        status: 'SUCCESS',
        errorMessage: '',
        durationMs: 612,
        retryable: false,
        remark: '已同步最近已卖订单 orderNo=YY202606100001 到 yy_order id=9001',
      },
      {
        backendId: '7202',
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        channelType: 'DOUYIN_LIFE',
        apiName: 'reservation/stock-query',
        requestId: 'douyin-logid-20260613-002',
        status: 'SUCCESS',
        errorMessage: '',
        durationMs: 132,
        retryable: false,
        remark: '库存查询命中本地时段账本，localOrderId=9001',
      },
      {
        backendId: '7203',
        storeName: stores[1]?.name ?? '影约云香港交付点',
        channelType: 'WECHAT_MINI_APP',
        apiName: '/client/photo/albums',
        requestId: 'wechat-request-20260613-003',
        status: 'FAILED',
        errorMessage: '客户 token 已过期',
        durationMs: 48,
        retryable: true,
        remark: '提示客户重新输入手机号和取片码',
      },
    ]
  },

  loadDemoChannelProductMappings(stores: StoreInfo[], products: ProductConfig[]) {
    this.channelProductMappings = [
      {
        backendId: '8301',
        productBackendId: products[0]?.backendId ?? '101',
        storeBackendId: stores[0]?.backendId,
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        productName: products[0]?.name ?? '证件照精修套餐',
        channelType: 'DOUYIN_LIFE',
        externalProductId: '1867049893048363',
        externalSkuId: '1867049646914595',
        externalPoiId: '7647419894213445642',
        landingUrl: 'https://www.douyin.com/life/goods/1867049893048363',
        landingPath: 'aweme://life_goods_detail?product_id=1867049893048363&sku_id=1867049646914595',
        externalName: '抖音来客 · 证件照快拍精修',
        mappingStatus: 'ENABLED',
        remark: '用于真实来客商品页下单，订单同步后写入 yy_order。',
        ready: true,
      },
      {
        backendId: '8302',
        productBackendId: products[1]?.backendId ?? '102',
        storeBackendId: stores[0]?.backendId,
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        productName: products[1]?.name ?? '个人形象照套餐',
        channelType: 'DOUYIN_LIFE',
        externalProductId: '1867049893048364',
        externalSkuId: '',
        externalPoiId: '7647419894213445642',
        landingUrl: '',
        landingPath: '',
        externalName: '抖音来客 · 职业形象照',
        mappingStatus: 'DRAFT',
        remark: '缺 SKU 和落地页，暂不对店员展示为可投放入口。',
        ready: false,
      },
      {
        backendId: '8303',
        productBackendId: products[0]?.backendId ?? '101',
        storeBackendId: stores[1]?.backendId,
        storeName: stores[1]?.name ?? '影约云香港交付点',
        productName: products[0]?.name ?? '证件照精修套餐',
        channelType: 'DOUYIN_LIFE',
        externalProductId: '1867049893048365',
        externalSkuId: '1867049646914596',
        externalPoiId: '',
        landingUrl: 'https://www.douyin.com/life/goods/1867049893048365',
        landingPath: '',
        externalName: '抖音来客 · 交付点体验券',
        mappingStatus: 'ENABLED',
        remark: '缺 POI，先不要投放真实门店。',
        ready: false,
      },
      {
        backendId: '8401',
        productBackendId: products[0]?.backendId ?? '101',
        storeBackendId: stores[0]?.backendId,
        storeName: stores[0]?.name ?? '影约云深圳旗舰店',
        productName: products[0]?.name ?? '证件照精修套餐',
        channelType: 'MEITUAN',
        externalProductId: 'mt-demo-product-001',
        externalSkuId: '',
        externalPoiId: 'mt-poi-demo-001',
        landingUrl: '',
        landingPath: '',
        externalName: '美团 · 证件照体验券',
        mappingStatus: 'NOT_AUTHORIZED',
        remark: '美团渠道待授权，展示为待补齐，不作为真实投放入口。',
        ready: false,
      },
    ]
  },

  loadDemoDouyinAcceptanceCases(today: string) {
    this.douyinAcceptanceCases = [
      {
        caseKey: 'tripartite-code-create',
        label: '三方码发券',
        apiName: '/api/douyin/life/tripartite-code/create',
        publicUrl: 'https://api.evanshine.me/api/douyin/life/tripartite-code/create',
        endpoint: '/api/douyin/life/tripartite-code/create',
        logidSource: 'X-Bytedance-Logid',
        status: 'PASSED',
        statusText: '已通过',
        requestId: '20260605004044D47C2263BA4FF69C928D',
        success: 'true',
        errorMessage: '',
        createTime: `${today} 00:40:44`,
        hint: '发券 SPI 已能返回业务 JSON，并记录抖音 logid。',
      },
      {
        caseKey: 'reservation-order-create',
        label: '预约接单',
        apiName: '/api/douyin/life/reservation/order-create',
        publicUrl: 'https://api.evanshine.me/api/douyin/life/reservation/order-create',
        endpoint: '/api/douyin/life/reservation/order-create',
        logidSource: 'X-Bytedance-Logid',
        status: 'PASSED',
        statusText: '已通过',
        requestId: '021780635182909fdbddc080000070f0000000000000043eb3aa8',
        success: 'true',
        errorMessage: '',
        createTime: `${today} 10:12:33`,
        hint: '创单 SPI 写入渠道同步日志，后续由订单同步落入 yy_order。',
      },
      {
        caseKey: 'whole-order-verify',
        label: '整单核销',
        apiName: '/yy/channel/DOUYIN_LIFE/verify',
        publicUrl: 'https://api.evanshine.me/yy/channel/DOUYIN_LIFE/verify',
        endpoint: '/yy/channel/DOUYIN_LIFE/verify',
        logidSource: 'X-Bytedance-Logid',
        status: 'PASSED',
        statusText: '已通过',
        requestId: '20260605131113AF2F064357C9C939F972',
        success: 'true',
        errorMessage: '',
        createTime: `${today} 13:11:13`,
        hint: '后端具备真实核销接口，门店工作台当前只展示验收记录，不直接提交真实核销。',
      },
    ]
  },

  loadDemoDouyinSyncHealth(today: string) {
    this.douyinSyncHealth = {
      channelType: 'DOUYIN_LIFE',
      healthStatus: 'HEALTHY',
      message: 'Webhook + 主动补偿同步均有最近成功记录。',
      failedEventCount: 0,
      retryableEventCount: 0,
      deadEventCount: 0,
      latestLogId: '20260605131113AF2F064357C9C939F972',
      latestWebhookTime: `${today} 13:11:13`,
      latestAutoSyncTime: `${today} 13:30:00`,
    }
  },
})
