import { computed, onMounted, ref } from 'vue'
import { appStore, type CustomerInfo } from '../../../../shared/stores/appStore'
import { memberStore } from '../../../../shared/stores/memberStore'
import type { BackendId } from '../../../../shared/api/backendId'

const money = (value: number) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const useMemberAssetOverview = () => {
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const selectedCustomerId = ref<BackendId | ''>('')

  const customers = computed(() => appStore.customers)
  const filteredCustomers = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return customers.value
    return customers.value.filter(customer => {
      const haystack = `${customer.name} ${customer.mobile} ${customer.tags.join(' ')} ${customer.memberLevel}`.toLowerCase()
      return haystack.includes(query)
    })
  })

  const selectedCustomer = computed<CustomerInfo | null>(() =>
    customers.value.find(customer => customer.backendId === selectedCustomerId.value) ?? null,
  )
  const selectedOverview = computed(() => memberStore.overviews[String(selectedCustomerId.value)] ?? null)
  const selectedCards = computed(() => memberStore.cards[String(selectedCustomerId.value)] ?? [])
  const selectedBenefits = computed(() => memberStore.benefits[String(selectedCustomerId.value)] ?? [])
  const selectedCoupons = computed(() => memberStore.coupons[String(selectedCustomerId.value)] ?? [])

  const summaryCards = computed(() => {
    const overview = selectedOverview.value
    if (!overview) return []
    return [
      { label: '会员余额', value: money(overview.balanceAmount), hint: '真实余额账本以后续充值、消费、退款流水为准。', scope: 'BALANCE' },
      { label: '积分余额', value: String(overview.pointsBalance), hint: '用于后续积分规则、抵扣和退单回滚。', scope: 'POINTS' },
      { label: '成长值', value: String(overview.growthValue), hint: '支撑等级成长和权益门槛。', scope: 'GROWTH' },
      { label: '活跃资产', value: `${overview.activeCardCount + overview.activeCouponCount + overview.activeBenefitCount}`, hint: '会员卡、权益和券资产汇总。', scope: 'ASSET' },
    ]
  })

  const loadSelectedCustomer = async (customerId: BackendId) => {
    loading.value = true
    error.value = ''
    try {
      await Promise.all([
        memberStore.refreshOverview(customerId),
        memberStore.refreshCards(customerId),
        memberStore.refreshBenefits(customerId),
        memberStore.refreshCoupons(customerId),
      ])
    } catch (err) {
      error.value = err instanceof Error ? err.message : '会员资产读取失败'
    } finally {
      loading.value = false
    }
  }

  const selectCustomer = async (customerId: BackendId) => {
    selectedCustomerId.value = customerId
    await loadSelectedCustomer(customerId)
  }

  const reloadSelectedCustomer = async () => {
    if (!selectedCustomerId.value) return
    await loadSelectedCustomer(selectedCustomerId.value)
  }

  const bootstrap = async () => {
    loading.value = true
    error.value = ''
    try {
      await appStore.ensureCustomersLoaded()
      if (!customers.value.length) return
      const nextId = selectedCustomerId.value || filteredCustomers.value[0]?.backendId || customers.value[0]?.backendId
      if (!nextId) return
      selectedCustomerId.value = nextId
      await loadSelectedCustomer(nextId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '会员模块初始化失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void bootstrap()
  })

  return {
    error,
    filteredCustomers,
    loading,
    searchQuery,
    selectedBenefits,
    selectedCards,
    selectedCoupons,
    selectedCustomer,
    selectedCustomerId,
    selectedOverview,
    reloadSelectedCustomer,
    selectCustomer,
    summaryCards,
  }
}
