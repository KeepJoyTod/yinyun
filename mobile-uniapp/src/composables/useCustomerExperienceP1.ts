import { computed, ref } from 'vue'
import {
  createCustomerExperienceP1ReviewDraft,
  getCustomerExperienceP1AssetSummary,
  getCustomerExperienceP1BookingOptions,
  getCustomerExperienceP1OrderVerification,
} from '@/api/customerExperienceP1'
import type {
  CustomerExperienceP1AssetSummary,
  CustomerExperienceP1BookingOptions,
  CustomerExperienceP1OrderVerification,
  CustomerExperienceP1ReviewDraftPayload,
  CustomerExperienceP1ReviewDraftResult,
} from '@/types/customerExperienceP1'

const emptyAssetSummary: CustomerExperienceP1AssetSummary = {
  cardCount: 0,
  benefitCount: 0,
  couponCount: 0,
  points: 0,
  growthValue: 0,
  balanceLabel: '¥0.00',
  status: 'scaffold',
  emptyReason: '消费者端资产读侧待接入。',
}

export function useCustomerExperienceP1() {
  const loading = ref(false)
  const errorMessage = ref('')
  const bookingOptions = ref<CustomerExperienceP1BookingOptions | null>(null)
  const assetSummary = ref<CustomerExperienceP1AssetSummary>({ ...emptyAssetSummary })
  const verification = ref<CustomerExperienceP1OrderVerification | null>(null)
  const reviewResult = ref<CustomerExperienceP1ReviewDraftResult | null>(null)

  const entitlementCandidates = computed(() => bookingOptions.value?.entitlementCandidates || [])
  const serviceGroups = computed(() => bookingOptions.value?.serviceGroups || [])
  const profileFields = computed(() => bookingOptions.value?.profileFields || [])
  const notices = computed(() => bookingOptions.value?.notices || [])

  const loadBookingOptions = async (params: { productId?: string; storeId?: string } = {}) => {
    loading.value = true
    errorMessage.value = ''
    try {
      bookingOptions.value = await getCustomerExperienceP1BookingOptions(params)
      assetSummary.value = bookingOptions.value.assetSummary || assetSummary.value
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '消费者体验 P1 加载失败'
    } finally {
      loading.value = false
    }
  }

  const loadAssetSummary = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
      assetSummary.value = await getCustomerExperienceP1AssetSummary()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '会员资产摘要加载失败'
    } finally {
      loading.value = false
    }
  }

  const loadOrderVerification = async (orderId: string) => {
    if (!orderId) return
    loading.value = true
    errorMessage.value = ''
    try {
      verification.value = await getCustomerExperienceP1OrderVerification(orderId)
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '核销码策略加载失败'
    } finally {
      loading.value = false
    }
  }

  const submitReviewDraft = async (payload: CustomerExperienceP1ReviewDraftPayload): Promise<CustomerExperienceP1ReviewDraftResult> => {
    loading.value = true
    errorMessage.value = ''
    try {
      const result = await createCustomerExperienceP1ReviewDraft(payload)
      reviewResult.value = result
      return result
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '评价脚手架提交失败'
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    errorMessage,
    bookingOptions,
    assetSummary,
    verification,
    reviewResult,
    entitlementCandidates,
    serviceGroups,
    profileFields,
    notices,
    loadBookingOptions,
    loadAssetSummary,
    loadOrderVerification,
    submitReviewDraft,
  }
}
