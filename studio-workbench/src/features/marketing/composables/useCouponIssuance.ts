import { onMounted, ref } from 'vue'
import {
  backendApi,
  type MarketingCouponGrantRecordDto,
  type MarketingCouponInstanceDto,
  type MarketingCouponIssuePayload,
  type MarketingCouponWriteoffDto,
} from '../../../shared/api/backend'
import { appStore } from '../../../shared/stores/appStore'
import { buildFallbackCouponScaffold } from '../marketingScaffoldData'

export type CouponIssueDraft = {
  templateId: string
  customerIds: string[]
  issueSource: string
  issueCount: number
  remark: string
}

const defaultIssueDraft = (templateId = ''): CouponIssueDraft => ({
  templateId,
  customerIds: [],
  issueSource: 'MERCHANT_BACKEND',
  issueCount: 1,
  remark: '',
})

const toPayload = (draft: CouponIssueDraft): MarketingCouponIssuePayload => ({
  templateId: draft.templateId,
  customerIds: draft.customerIds,
  issueSource: draft.issueSource || 'MERCHANT_BACKEND',
  issueCount: Math.max(1, Number(draft.issueCount) || 1),
  remark: draft.remark.trim(),
})

export const useCouponIssuance = () => {
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref('')
  const grantRecords = ref<MarketingCouponGrantRecordDto[]>([])
  const instances = ref<MarketingCouponInstanceDto[]>([])
  const writeoffs = ref<MarketingCouponWriteoffDto[]>([])

  const buildIssueDraft = (templateId = '') => defaultIssueDraft(templateId)

  const loadCouponLedger = async (templateId?: string) => {
    if (!templateId) {
      grantRecords.value = []
      instances.value = []
      writeoffs.value = []
      return
    }
    loading.value = true
    error.value = ''
    try {
      if (appStore.demoMode) {
        const scaffold = buildFallbackCouponScaffold(appStore.orders, appStore.customers)
        grantRecords.value = scaffold.grantRecords
          .filter(item => item.templateId === templateId)
          .map(item => ({
            grantId: item.grantId,
            templateId: item.templateId,
            templateName: item.templateName,
            customerName: item.targetCustomer,
            customerMobile: item.targetMobile,
            issueSource: item.grantSource,
            issueCount: 1,
            status: item.status,
            remark: '',
          }))
        instances.value = scaffold.instances
          .filter(item => item.templateId === templateId)
          .map(item => ({
            instanceId: item.instanceId,
            templateId: item.templateId,
            templateName: item.templateName,
            holderName: item.holderName,
            status: item.status,
            orderId: item.orderId,
            expiresAt: item.expiresAt,
          }))
        writeoffs.value = []
      } else {
        const [grants, couponInstances, couponWriteoffs] = await Promise.all([
          backendApi.listCouponGrantRecords(templateId),
          backendApi.listCouponInstances(templateId),
          backendApi.listCouponWriteoffs(templateId),
        ])
        grantRecords.value = grants
        instances.value = couponInstances
        writeoffs.value = couponWriteoffs
      }
    } catch (err) {
      grantRecords.value = []
      instances.value = []
      writeoffs.value = []
      error.value = err instanceof Error ? err.message : '券实例和核销记录加载失败'
    } finally {
      loading.value = false
    }
  }

  const issueCoupons = async (draft: CouponIssueDraft) => {
    submitting.value = true
    error.value = ''
    try {
      if (!draft.templateId) throw new Error('请先选择券模板')
      if (!draft.customerIds.length) throw new Error('请选择发券客户')
      if (!appStore.demoMode) await backendApi.issueCouponTemplate(draft.templateId, toPayload(draft))
      await loadCouponLedger(draft.templateId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '发券失败'
      throw err
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    if (!appStore.customers.length) void appStore.ensureCustomersLoaded().catch(() => undefined)
  })

  return {
    loading,
    submitting,
    error,
    grantRecords,
    instances,
    writeoffs,
    buildIssueDraft,
    loadCouponLedger,
    issueCoupons,
  }
}
