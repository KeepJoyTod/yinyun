import { onMounted, ref } from 'vue'
import { backendApi, type MarketingCouponScaffoldDto } from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'
import { buildFallbackCouponScaffold } from '../marketingScaffoldData'

const emptyScaffold = (): MarketingCouponScaffoldDto => ({
  status: 'scaffold',
  boundary: '营销券模板脚手架尚未接入。',
  templates: [],
  grantRecords: [],
  instances: [],
})

export const useCouponTemplates = () => {
  const loading = ref(false)
  const error = ref('')
  const scaffold = ref<MarketingCouponScaffoldDto>(emptyScaffold())

  const loadCouponScaffold = async () => {
    loading.value = true
    error.value = ''
    try {
      scaffold.value = await backendApi.getCouponTemplateScaffold()
    } catch (err) {
      await Promise.all([
        appStore.orders.length ? Promise.resolve(appStore.orders) : appStore.loadAllOrders(),
        appStore.customers.length ? Promise.resolve(appStore.customers) : appStore.ensureCustomersLoaded(),
      ])
      scaffold.value = buildFallbackCouponScaffold(appStore.orders, appStore.customers)
      error.value = err instanceof Error ? err.message : '券模板脚手架加载失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(loadCouponScaffold)

  return {
    loading,
    error,
    scaffold,
    loadCouponScaffold,
  }
}
