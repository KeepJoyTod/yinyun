import { computed, reactive, ref } from 'vue'
import { backendApi, type BackendId } from '../../../../shared/api/backend'

type IdForm = {
  storeId: string
  customerId: string
  orderId: string
}

type CompositeDraft = IdForm & {
  totalAmount: string
  externalAmount: string
  storedValueAmount: string
  cashAmount: string
  discountAmount: string
  waiveAmount: string
}

type WithdrawDraft = {
  storeId: string
  customerId: string
  withdrawAmount: string
  accountName: string
  accountNo: string
}

const emptyIds = (): IdForm => ({
  storeId: '',
  customerId: '',
  orderId: '',
})

const toBackendId = (value: string): BackendId | null => {
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed
}

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(value.trim())
  return Number.isFinite(parsed) ? parsed : fallback
}

export const useMemberTransactionSafety = () => {
  const loading = ref(false)
  const saving = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const filters = reactive({
    ...emptyIds(),
    status: '',
    limit: '20',
  })

  const reservationDraft = reactive({
    ...emptyIds(),
    reservationType: 'BENEFIT',
    targetType: 'MEMBER_ASSET',
    targetSnapshot: '',
    quantity: '1',
    reservationAmount: '0',
    expireMinutes: '30',
  })

  const compositeDraft = reactive<CompositeDraft>({
    ...emptyIds(),
    totalAmount: '100',
    externalAmount: '50',
    storedValueAmount: '30',
    cashAmount: '0',
    discountAmount: '20',
    waiveAmount: '0',
  })

  const consumeDraft = reactive({
    ...emptyIds(),
    consumeAmount: '50',
  })

  const withdrawDraft = reactive<WithdrawDraft>({
    storeId: '',
    customerId: '',
    withdrawAmount: '50',
    accountName: '',
    accountNo: '',
  })

  const entitlementReservations = ref<any[]>([])
  const compositePayments = ref<any[]>([])
  const storedValueConsumes = ref<any[]>([])
  const memberWithdrawOrders = ref<any[]>([])

  const query = computed(() => ({
    storeId: toBackendId(filters.storeId),
    customerId: toBackendId(filters.customerId),
    orderId: toBackendId(filters.orderId),
    status: filters.status.trim() || undefined,
    limit: Math.max(1, Math.min(100, toNumber(filters.limit, 20))),
  }))

  const summaryCards = computed(() => [
    { key: 'reservation', label: '权益预占', value: entitlementReservations.value.length, hint: '支付前先占用权益，后续再补释放与核销' },
    { key: 'composite', label: '组合支付', value: compositePayments.value.length, hint: '统一承接多支付方式拆账草稿' },
    { key: 'consume', label: '储值消费', value: storedValueConsumes.value.length, hint: '先冻结消费，再接真实余额扣减' },
    { key: 'withdraw', label: '会员提现', value: memberWithdrawOrders.value.length, hint: '提现申请先进入风险审批队列' },
  ])

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const load = async () => {
    loading.value = true
    clearMessages()
    const result = await Promise.allSettled([
      backendApi.listEntitlementReservations(query.value),
      backendApi.listCompositePayments(query.value),
      backendApi.listStoredValueConsumes(query.value),
      backendApi.listMemberWithdrawOrders(query.value),
    ])
    loading.value = false

    entitlementReservations.value = result[0].status === 'fulfilled' ? result[0].value : []
    compositePayments.value = result[1].status === 'fulfilled' ? result[1].value : []
    storedValueConsumes.value = result[2].status === 'fulfilled' ? result[2].value : []
    memberWithdrawOrders.value = result[3].status === 'fulfilled' ? result[3].value : []

    const rejected = result.find(item => item.status === 'rejected') as PromiseRejectedResult | undefined
    if (rejected) {
      errorMessage.value = rejected.reason instanceof Error ? rejected.reason.message : '加载失败'
    }
  }

  const runCreate = async (task: () => Promise<unknown>, successText: string) => {
    saving.value = true
    clearMessages()
    try {
      await task()
      successMessage.value = successText
      await load()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '请求失败'
    } finally {
      saving.value = false
    }
  }

  const actionPayload = (label: string) => ({
    reason: `studio local adapter: ${label}`,
    localAdapterRef: `studio-${Date.now()}`,
  })

  const runAction = async (task: () => Promise<unknown>, successText: string) => {
    saving.value = true
    clearMessages()
    try {
      await task()
      successMessage.value = successText
      await load()
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : '请求失败'
    } finally {
      saving.value = false
    }
  }

  const createReservation = () =>
    runCreate(
      () =>
        backendApi.createEntitlementReservation({
          storeId: toBackendId(reservationDraft.storeId),
          customerId: toBackendId(reservationDraft.customerId)!,
          orderId: toBackendId(reservationDraft.orderId),
          reservationType: reservationDraft.reservationType,
          targetType: reservationDraft.targetType,
          targetSnapshot: reservationDraft.targetSnapshot.trim(),
          quantity: toNumber(reservationDraft.quantity, 1),
          reservationAmount: toNumber(reservationDraft.reservationAmount, 0),
          expireMinutes: toNumber(reservationDraft.expireMinutes, 30),
        }),
      '权益预占脚手架记录已创建',
    )

  const createCompositePayment = () =>
    runCreate(
      () =>
        backendApi.createCompositePayment({
          storeId: toBackendId(compositeDraft.storeId),
          customerId: toBackendId(compositeDraft.customerId)!,
          orderId: toBackendId(compositeDraft.orderId),
          totalAmount: toNumber(compositeDraft.totalAmount, 0),
          externalAmount: toNumber(compositeDraft.externalAmount, 0),
          storedValueAmount: toNumber(compositeDraft.storedValueAmount, 0),
          cashAmount: toNumber(compositeDraft.cashAmount, 0),
          discountAmount: toNumber(compositeDraft.discountAmount, 0),
          waiveAmount: toNumber(compositeDraft.waiveAmount, 0),
        }),
      '组合支付脚手架记录已创建',
    )

  const createStoredValueConsume = () =>
    runCreate(
      () =>
        backendApi.createStoredValueConsume({
          storeId: toBackendId(consumeDraft.storeId),
          customerId: toBackendId(consumeDraft.customerId)!,
          orderId: toBackendId(consumeDraft.orderId),
          consumeAmount: toNumber(consumeDraft.consumeAmount, 0),
        }),
      '储值消费脚手架记录已创建',
    )

  const createWithdrawOrder = () =>
    runCreate(
      () =>
        backendApi.createMemberWithdrawOrder({
          storeId: toBackendId(withdrawDraft.storeId),
          customerId: toBackendId(withdrawDraft.customerId)!,
          withdrawAmount: toNumber(withdrawDraft.withdrawAmount, 0),
          accountName: withdrawDraft.accountName.trim(),
          accountNo: withdrawDraft.accountNo.trim(),
        }),
      '会员提现脚手架记录已创建并送审',
    )

  const releaseReservation = (id: BackendId) =>
    runAction(() => backendApi.releaseEntitlementReservation(id, actionPayload('release entitlement')), '权益预占已释放')

  const fulfillReservation = (id: BackendId) =>
    runAction(() => backendApi.fulfillEntitlementReservation(id, actionPayload('fulfill entitlement')), '权益预占已核销')

  const releaseExpiredReservations = () =>
    runAction(
      () => backendApi.releaseExpiredEntitlementReservations({
        ...actionPayload('release expired entitlements'),
        limit: 50,
      }),
      '已批量释放过期权益预占',
    )

  const confirmCompositePayment = (id: BackendId) =>
    runAction(() => backendApi.confirmCompositePayment(id, actionPayload('confirm composite payment')), '组合支付已确认')

  const failCompositePayment = (id: BackendId) =>
    runAction(() => backendApi.failCompositePayment(id, actionPayload('fail composite payment')), '组合支付已失败并释放权益')

  const confirmStoredValueConsume = (id: BackendId) =>
    runAction(() => backendApi.confirmStoredValueConsume(id, actionPayload('confirm stored value consume')), '储值消费已扣减')

  const reverseStoredValueConsume = (id: BackendId) =>
    runAction(() => backendApi.reverseStoredValueConsume(id, actionPayload('reverse stored value consume')), '储值消费已逆向')

  const markWithdrawPaid = (id: BackendId) =>
    runAction(() => backendApi.markWithdrawPaid(id, actionPayload('mark withdraw paid')), '会员提现已标记出款')

  return {
    loading,
    saving,
    errorMessage,
    successMessage,
    filters,
    reservationDraft,
    compositeDraft,
    consumeDraft,
    withdrawDraft,
    entitlementReservations,
    compositePayments,
    storedValueConsumes,
    memberWithdrawOrders,
    summaryCards,
    load,
    createReservation,
    createCompositePayment,
    createStoredValueConsume,
    createWithdrawOrder,
    releaseReservation,
    releaseExpiredReservations,
    fulfillReservation,
    confirmCompositePayment,
    failCompositePayment,
    confirmStoredValueConsume,
    reverseStoredValueConsume,
    markWithdrawPaid,
  }
}
