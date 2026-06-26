import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { appStore, type BookingOrder } from '../../../../shared/stores/appStore'
import { memberStore } from '../../../../shared/stores/memberStore'
import type { BackendId } from '../../../../shared/api/backendId'

export const useMemberTransactions = () => {
  const route = useRoute()
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const activeTab = ref<'orders' | 'points' | 'growth' | 'balance'>('orders')
  const selectedCustomerId = ref<BackendId | ''>('')

  const customers = computed(() => appStore.customers)
  const filteredCustomers = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return customers.value
    return customers.value.filter(customer =>
      `${customer.name} ${customer.mobile} ${customer.tags.join(' ')}`.toLowerCase().includes(query),
    )
  })
  const selectedCustomer = computed(() =>
    customers.value.find(customer => customer.backendId === selectedCustomerId.value) ?? null,
  )
  const recentOrders = computed<BookingOrder[]>(() => appStore.customerRecentOrders[selectedCustomerId.value] ?? [])
  const pointsLedger = computed(() => memberStore.pointsLedger[String(selectedCustomerId.value)] ?? [])
  const growthLedger = computed(() => memberStore.growthLedger[String(selectedCustomerId.value)] ?? [])
  const balanceLedger = computed(() => memberStore.balanceLedger[String(selectedCustomerId.value)] ?? [])

  const loadSelected = async (customerId: BackendId) => {
    loading.value = true
    error.value = ''
    try {
      await Promise.all([
        appStore.loadCustomerRecentOrders(customerId, 8),
        memberStore.refreshPointsLedger(customerId, 20),
        memberStore.refreshGrowthLedger(customerId, 20),
        memberStore.refreshBalanceLedger(customerId, 20),
      ])
    } catch (err) {
      error.value = err instanceof Error ? err.message : '会员交易读取失败'
    } finally {
      loading.value = false
    }
  }

  const selectCustomer = async (customerId: BackendId) => {
    selectedCustomerId.value = customerId
    await loadSelected(customerId)
  }

  const bootstrap = async () => {
    loading.value = true
    error.value = ''
    try {
      await appStore.ensureCustomersLoaded()
      if (!customers.value.length) return
      const routeCustomerId = String(route.query.customerId ?? '')
      const matchedRouteCustomer = routeCustomerId
        ? customers.value.find(customer => String(customer.backendId) === routeCustomerId)?.backendId
        : ''
      const nextId = matchedRouteCustomer || selectedCustomerId.value || filteredCustomers.value[0]?.backendId || customers.value[0]?.backendId
      if (!nextId) return
      selectedCustomerId.value = nextId
      await loadSelected(nextId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '消费记录初始化失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void bootstrap()
  })

  return {
    activeTab,
    balanceLedger,
    error,
    filteredCustomers,
    growthLedger,
    loading,
    pointsLedger,
    recentOrders,
    searchQuery,
    selectedCustomer,
    selectedCustomerId,
    selectCustomer,
  }
}
