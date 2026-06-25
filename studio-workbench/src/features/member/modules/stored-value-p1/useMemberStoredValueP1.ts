import { computed, onMounted, ref } from 'vue'
import {
  backendApi,
  type MemberRechargeCapabilityDto,
  type MemberRechargeSettingDto,
  type MemberStoredValueTransactionDto,
  type MemberStoredValueTransactionListQuery,
} from '../../../../shared/api/backend'
import { resolveFeatureGate, type FeatureGateResult } from '../../../system/featureGate'
import {
  buildFallbackMemberRechargeCapability,
  buildFallbackMemberRechargeSetting,
  buildFallbackMemberStoredValueTransactions,
} from './memberStoredValueP1Scaffold'

const capabilityToGate = (capability: MemberRechargeCapabilityDto): FeatureGateResult =>
  resolveFeatureGate({
    featureKey: 'member-accounts',
    capability: {
      capabilityCode: capability.capabilityCode,
      capabilityName: capability.capabilityName,
      enabled: capability.enabled,
      status: capability.status,
      scopeLabel: capability.scopeLabel,
      gateCopy: capability.gateCopy,
      expiresAt: capability.expiresAt,
    },
    requireStoreScope: true,
    pluginEnabled: capability.pluginState === 'unknown' ? null : capability.pluginState === 'enabled',
    requiresApproval: capability.requiresApproval,
    licenseBindings: capability.licenseState === 'active'
      ? [
          {
            licenseKey: capability.capabilityCode,
            planName: capability.capabilityName,
            status: 'ACTIVE',
            expireTime: capability.expiresAt ?? '',
            boundStoreIds: '',
          },
        ]
      : capability.licenseState === 'missing'
        ? []
        : null,
  })

export const useMemberStoredValueP1 = (initialQuery: MemberStoredValueTransactionListQuery = {}) => {
  const loading = ref(false)
  const error = ref('')
  const query = ref<MemberStoredValueTransactionListQuery>({
    ...initialQuery,
    limit: initialQuery.limit ?? 20,
  })
  const capability = ref<MemberRechargeCapabilityDto | null>(null)
  const setting = ref<MemberRechargeSettingDto | null>(null)
  const transactions = ref<MemberStoredValueTransactionDto[]>([])

  const gate = computed<FeatureGateResult | null>(() =>
    capability.value ? capabilityToGate(capability.value) : null,
  )
  const hasEnabledGiftRules = computed(() => Boolean(setting.value?.giftRules.some(rule => rule.enabled)))
  const capabilityOpen = computed(() => Boolean(capability.value?.enabled) && capability.value?.status === 'ready')

  const load = async (nextQuery?: Partial<MemberStoredValueTransactionListQuery>) => {
    if (nextQuery) {
      query.value = { ...query.value, ...nextQuery }
    }

    loading.value = true
    error.value = ''

    const [capabilityResult, settingResult, transactionResult] = await Promise.allSettled([
      backendApi.getMemberRechargeCapability(),
      backendApi.getMemberRechargeSetting(),
      backendApi.listMemberStoredValueTransactions(query.value),
    ])

    capability.value = capabilityResult.status === 'fulfilled'
      ? capabilityResult.value
      : buildFallbackMemberRechargeCapability()
    setting.value = settingResult.status === 'fulfilled'
      ? settingResult.value
      : buildFallbackMemberRechargeSetting()
    transactions.value = transactionResult.status === 'fulfilled'
      ? transactionResult.value
      : buildFallbackMemberStoredValueTransactions(query.value)

    if ([capabilityResult, settingResult, transactionResult].some(item => item.status === 'rejected')) {
      error.value = '会员储值正式版读取未全部接通，已切到本地脚手架数据。'
    }

    loading.value = false
  }

  onMounted(() => {
    void load()
  })

  return {
    capability,
    capabilityOpen,
    error,
    gate,
    hasEnabledGiftRules,
    load,
    loading,
    query,
    setting,
    transactions,
  }
}
