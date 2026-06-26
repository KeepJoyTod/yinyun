import { computed, type Ref } from 'vue'
import type { CustomerInfo } from '../../shared/stores/appStore'

export type QuickCustomerFilter = 'all' | 'premium' | 'new' | 'revisit'

type CustomerArchiveInsightsInput = {
  customers: Ref<CustomerInfo[]>
  searchQuery: Ref<string>
  sourceFilter: Ref<string>
  levelFilter: Ref<string>
  activeCustomerFilter: Ref<QuickCustomerFilter>
}

const isPremium = (customer: CustomerInfo) => customer.totalSpend >= 1000
const isNewCustomer = (customer: CustomerInfo) => customer.totalOrderCount <= 1
const needsRevisit = (customer: CustomerInfo) =>
  customer.totalSpend >= 300 || customer.tags.includes('寰呭洖璁?') || customer.tags.includes('楂樺璐?')

export function useCustomerArchiveInsights(input: CustomerArchiveInsightsInput) {
  const sourceOptions = computed(() => Array.from(new Set(input.customers.value.map(customer => customer.source).filter(Boolean))))
  const levelOptions = computed(() => Array.from(new Set(input.customers.value.map(customer => customer.memberLevel).filter(Boolean))))
  const premiumCustomers = computed(() => input.customers.value.filter(isPremium))
  const newCustomers = computed(() => input.customers.value.filter(isNewCustomer))
  const revisitCustomers = computed(() => input.customers.value.filter(needsRevisit))

  const filteredCustomers = computed(() => {
    const query = input.searchQuery.value.trim().toLowerCase()
    return input.customers.value.filter(customer => {
      if (input.sourceFilter.value !== 'all' && customer.source !== input.sourceFilter.value) return false
      if (input.levelFilter.value !== 'all' && customer.memberLevel !== input.levelFilter.value) return false
      if (input.activeCustomerFilter.value === 'premium' && !isPremium(customer)) return false
      if (input.activeCustomerFilter.value === 'new' && !isNewCustomer(customer)) return false
      if (input.activeCustomerFilter.value === 'revisit' && !needsRevisit(customer)) return false
      if (!query) return true
      const haystack = `${customer.name} ${customer.mobile} ${customer.tags.join(' ')} ${customer.remark}`.toLowerCase()
      return haystack.includes(query)
    })
  })

  const quickCustomerFilters = computed(() => [
    { key: 'all' as const, label: '鍏ㄩ儴瀹㈡埛', count: input.customers.value.length },
    { key: 'premium' as const, label: '楂樺噣鍊煎鎴?', count: premiumCustomers.value.length },
    { key: 'new' as const, label: '鏈湀鏂板', count: newCustomers.value.length },
    { key: 'revisit' as const, label: '寰呰窡杩?', count: revisitCustomers.value.length },
  ])

  const cards = computed(() => [
    {
      label: '楂樺噣鍊煎鎴?',
      value: String(premiumCustomers.value.length),
      hint: '绱娑堣垂杈冮珮锛岄€傚悎浼樺厛璺熻繘澶嶈喘鍜屼細鍛樿浆鍖栥€?',
      scope: 'VIP',
    },
    {
      label: '鏈湀鏂板',
      value: String(newCustomers.value.length),
      hint: '褰撳墠鎬昏鍗曚笉瓒呰繃 1 鍗曠殑瀹㈡埛锛屽彲閲嶇偣鍋氬ソ棣栧崟浣撻獙銆?',
      scope: 'NEW',
    },
    {
      label: '鍙洖璁垮鎴?',
      value: String(revisitCustomers.value.length),
      hint: '閫傚悎鍋氳ˉ鎷嶃€佸崌绾у椁愩€佷氦浠樺弽棣堟垨浜屾娑堣垂鍥炶銆?',
      scope: 'REVISIT',
    },
    {
      label: '绱娑堣垂',
      value: `楼 ${input.customers.value.reduce((sum, customer) => sum + customer.totalSpend, 0).toLocaleString('zh-CN')}`,
      hint: '褰撳墠瀹㈡埛妗ｆ涓殑绱娑堣垂鎬婚锛岀敤浜庨棬搴楄繍钀ュ鐩樸€?',
      scope: 'GMV',
    },
  ])

  return {
    cards,
    filteredCustomers,
    levelOptions,
    quickCustomerFilters,
    sourceOptions,
  }
}
