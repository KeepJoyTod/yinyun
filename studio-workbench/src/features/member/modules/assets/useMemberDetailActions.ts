import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { BackendId } from '../../../../shared/api/backendId'
import { appStore, type CustomerInfo } from '../../../../shared/stores/appStore'
import { studioAccessStore } from '../../../../shared/stores/studioAccessStore'

type MemberActionKey =
  | 'edit'
  | 'remove'
  | 'booking'
  | 'cardBatch'
  | 'issueCoupon'
  | 'transactions'

type UseMemberDetailActionsOptions = {
  selectedCustomer: ComputedRef<CustomerInfo | null>
  selectedCustomerId: Ref<BackendId | ''>
  reloadSelectedCustomer: () => Promise<unknown>
}

const hasPermission = (permission: string) =>
  studioAccessStore.menuPermissions.includes('*:*:*')
  || studioAccessStore.menuPermissions.includes(permission)

const findCustomerKeyword = (customer: CustomerInfo) => customer.mobile || customer.name

export const useMemberDetailActions = (options: UseMemberDetailActionsOptions) => {
  const router = useRouter()
  const route = useRoute()
  const actionError = ref('')
  const actionSuccess = ref('')
  const deleting = ref(false)

  const selectedCustomerName = computed(() => options.selectedCustomer.value?.name || '该会员')
  const customerId = computed(() => options.selectedCustomerId.value || '')

  const canEditCustomer = computed(() => hasPermission('yy:customer:edit'))
  const canDeleteCustomer = computed(() => hasPermission('yy:customer:remove'))
  const canCreateBooking = computed(() => hasPermission('yy:order:list') || hasPermission('yy:order:add'))
  const canIssueCoupon = computed(() => hasPermission('yy:order:list'))
  const canViewTransactions = computed(() => hasPermission('yy:customer:list'))
  const canOpenCardBatch = computed(() => hasPermission('yy:order:add'))

  const cardBatchBlockedReason = computed(() =>
    '办卡入口已挂到订单卡批次 owner，但该模块当前仍属待端到端验证；本批先提供带会员上下文的受控跳转。',
  )

  const clearMessages = () => {
    actionError.value = ''
    actionSuccess.value = ''
  }

  const ensureCustomer = () => {
    clearMessages()
    if (!options.selectedCustomer.value || !customerId.value) {
      actionError.value = '请先选择会员客户。'
      return null
    }
    return options.selectedCustomer.value
  }

  const buildCustomerQuery = (customer: CustomerInfo) => ({
    customerId: String(customer.backendId),
    q: findCustomerKeyword(customer),
    quick: 'all',
  })

  const goToTransactions = async () => {
    const customer = ensureCustomer()
    if (!customer) return
    await router.push({ path: '/member/consumption', query: { customerId: String(customer.backendId) } })
  }

  const goToBooking = async () => {
    const customer = ensureCustomer()
    if (!customer) return
    await router.push({ path: '/order/appointment', query: buildCustomerQuery(customer) })
  }

  const goToIssueCoupon = async () => {
    const customer = ensureCustomer()
    if (!customer) return
    await router.push({ path: '/marketing/coupons', query: { customerId: String(customer.backendId) } })
  }

  const goToEditCustomer = async () => {
    const customer = ensureCustomer()
    if (!customer) return
    await router.push({ path: '/member/customers', query: { customerId: String(customer.backendId), mode: 'edit' } })
  }

  const goToCardBatch = async () => {
    const customer = ensureCustomer()
    if (!customer) return
    await router.push({ path: '/order/card-batch', query: { customerId: String(customer.backendId) } })
    actionSuccess.value = cardBatchBlockedReason.value
  }

  const deleteCurrentCustomer = async () => {
    const customer = ensureCustomer()
    if (!customer) return
    if (!canDeleteCustomer.value) {
      actionError.value = '当前账号缺少删除会员权限 `yy:customer:remove`。'
      return
    }
    const confirmed = globalThis.confirm(`确认删除会员“${customer.name}”吗？删除后将从当前客户档案列表移除。`)
    if (!confirmed) return
    deleting.value = true
    try {
      await appStore.deleteCustomer(customer.backendId)
      actionSuccess.value = `已删除会员：${customer.name}`
      const nextCustomer = appStore.customers[0] ?? null
      if (nextCustomer) {
        options.selectedCustomerId.value = nextCustomer.backendId
        await options.reloadSelectedCustomer()
      } else {
        options.selectedCustomerId.value = ''
      }
      if (route.path === '/member/accounts') return
    } catch (error) {
      actionError.value = error instanceof Error ? error.message : '删除会员失败'
    } finally {
      deleting.value = false
    }
  }

  const actionDisabledReason = (key: MemberActionKey) => {
    switch (key) {
      case 'edit':
        return canEditCustomer.value ? '' : '当前账号缺少编辑会员权限 `yy:customer:edit`。'
      case 'remove':
        return canDeleteCustomer.value ? '' : '当前账号缺少删除会员权限 `yy:customer:remove`。'
      case 'booking':
        return canCreateBooking.value ? '' : '当前账号缺少预约查看或创建权限。'
      case 'cardBatch':
        return canOpenCardBatch.value ? cardBatchBlockedReason.value : '当前账号缺少办卡入口权限 `yy:order:add`。'
      case 'issueCoupon':
        return canIssueCoupon.value ? '' : '当前账号缺少发券权限 `yy:order:list`。'
      case 'transactions':
        return canViewTransactions.value ? '' : '当前账号缺少会员交易查看权限 `yy:customer:list`。'
      default:
        return ''
    }
  }

  return {
    actionError,
    actionSuccess,
    actionDisabledReason,
    canCreateBooking,
    canDeleteCustomer,
    canEditCustomer,
    canIssueCoupon,
    canOpenCardBatch,
    canViewTransactions,
    cardBatchBlockedReason,
    clearMessages,
    deleteCurrentCustomer,
    deleting,
    goToBooking,
    goToCardBatch,
    goToEditCustomer,
    goToIssueCoupon,
    goToTransactions,
    selectedCustomerName,
  }
}
