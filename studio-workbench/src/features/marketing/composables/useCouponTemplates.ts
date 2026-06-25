import { computed, onMounted, ref } from 'vue'
import {
  backendApi,
  type MarketingCouponTemplateDto,
  type MarketingCouponTemplateListQuery,
  type MarketingCouponTemplatePayload,
} from '../../../shared/api/backend'
import type { MarketingCouponTemplateType } from '../../../shared/api/backendTypesMarketing'
import { appStore } from '../../../shared/stores/appStore'
import { buildFallbackCouponScaffold } from '../marketingScaffoldData'

export type CouponTemplateDraft = {
  templateName: string
  templateType: MarketingCouponTemplateType
  storeIds: string[]
  productIds: string[]
  faceValueCent: number
  minSpendCent: number
  stackPolicy: string
  restoreOnRefund: boolean
  startAt: string
  endAt: string
  status: string
}

const defaultDraft = (): CouponTemplateDraft => ({
  templateName: '',
  templateType: 'CASH',
  storeIds: [],
  productIds: [],
  faceValueCent: 3000,
  minSpendCent: 0,
  stackPolicy: 'COUPON_CODE_MUTEX',
  restoreOnRefund: true,
  startAt: '',
  endAt: '',
  status: 'ACTIVE',
})

const scaffoldToTemplates = (): MarketingCouponTemplateDto[] =>
  buildFallbackCouponScaffold(appStore.orders, appStore.customers).templates.map(template => ({
    templateId: template.templateId,
    templateName: template.templateName,
    templateType: template.templateType,
    status: template.status,
    storeIds: [],
    productIds: [],
    storeScopeLabel: template.storeScopeLabel,
    productScopeLabel: template.productScopeLabel,
    faceValueCent: template.faceValueCent,
    minSpendCent: 0,
    stackPolicy: template.stackedWith,
    restoreOnRefund: template.restoreOnRefund,
    issuedCount: template.issuedCount,
    writeoffCount: template.writeoffCount,
    startAt: '',
    endAt: template.expiresAt,
  }))

const toPayload = (draft: CouponTemplateDraft): MarketingCouponTemplatePayload => ({
  templateName: draft.templateName.trim(),
  templateType: draft.templateType,
  storeIds: draft.storeIds,
  productIds: draft.productIds,
  faceValueCent: Math.max(0, Number(draft.faceValueCent) || 0),
  minSpendCent: Math.max(0, Number(draft.minSpendCent) || 0),
  stackPolicy: draft.stackPolicy || 'COUPON_CODE_MUTEX',
  restoreOnRefund: Boolean(draft.restoreOnRefund),
  startAt: draft.startAt,
  endAt: draft.endAt,
  status: draft.status || 'ACTIVE',
})

export const useCouponTemplates = () => {
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref('')
  const filters = ref<MarketingCouponTemplateListQuery>({})
  const templates = ref<MarketingCouponTemplateDto[]>([])
  const selectedTemplateId = ref('')

  const selectedTemplate = computed(() =>
    templates.value.find(item => item.templateId === selectedTemplateId.value) ?? templates.value[0] ?? null,
  )
  const scaffold = computed(() => {
    const fallback = buildFallbackCouponScaffold(appStore.orders, appStore.customers)
    return {
      ...fallback,
      templates: templates.value.map(template => ({
        templateId: template.templateId,
        templateName: template.templateName,
        templateType: template.templateType,
        status: template.status,
        storeScopeLabel: template.storeScopeLabel,
        productScopeLabel: template.productScopeLabel,
        faceValueCent: template.faceValueCent,
        issuedCount: template.issuedCount,
        writeoffCount: template.writeoffCount,
        stackedWith: template.stackPolicy,
        restoreOnRefund: template.restoreOnRefund,
        expiresAt: template.endAt ?? fallback.templates[0]?.expiresAt ?? '',
      })),
    }
  })

  const buildDraft = (template?: MarketingCouponTemplateDto | null): CouponTemplateDraft => {
    if (!template) return defaultDraft()
    return {
      templateName: template.templateName,
      templateType: template.templateType,
      storeIds: [...template.storeIds],
      productIds: [...template.productIds],
      faceValueCent: template.faceValueCent,
      minSpendCent: template.minSpendCent,
      stackPolicy: template.stackPolicy,
      restoreOnRefund: template.restoreOnRefund,
      startAt: template.startAt ?? '',
      endAt: template.endAt ?? '',
      status: template.status,
    }
  }

  const ensureDemoData = async () => {
    await Promise.all([
      appStore.orders.length ? Promise.resolve(appStore.orders) : appStore.loadAllOrders(),
      appStore.customers.length ? Promise.resolve(appStore.customers) : appStore.ensureCustomersLoaded(),
    ])
  }

  const loadCouponTemplates = async () => {
    loading.value = true
    error.value = ''
    try {
      if (appStore.demoMode) {
        await ensureDemoData()
        templates.value = scaffoldToTemplates()
      } else {
        templates.value = await backendApi.listCouponTemplates(filters.value)
      }
      if (!templates.value.some(item => item.templateId === selectedTemplateId.value)) {
        selectedTemplateId.value = templates.value[0]?.templateId ?? ''
      }
    } catch (err) {
      templates.value = []
      error.value = err instanceof Error ? err.message : '券模板加载失败'
    } finally {
      loading.value = false
    }
  }

  const saveTemplate = async (draft: CouponTemplateDraft, templateId?: string) => {
    submitting.value = true
    error.value = ''
    try {
      const payload = toPayload(draft)
      if (appStore.demoMode) {
        await loadCouponTemplates()
        return
      }
      if (templateId) await backendApi.updateCouponTemplate(templateId, payload)
      else await backendApi.createCouponTemplate(payload)
      await loadCouponTemplates()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '券模板保存失败'
      throw err
    } finally {
      submitting.value = false
    }
  }

  const toggleTemplateStatus = async (template: MarketingCouponTemplateDto) => {
    const draft = buildDraft(template)
    draft.status = template.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    await saveTemplate(draft, template.templateId)
  }

  onMounted(loadCouponTemplates)

  return {
    loading,
    submitting,
    error,
    filters,
    templates,
    selectedTemplate,
    selectedTemplateId,
    buildDraft,
    scaffold,
    loadCouponTemplates,
    loadCouponScaffold: loadCouponTemplates,
    saveTemplate,
    toggleTemplateStatus,
  }
}
