import { computed, reactive, ref, type ComputedRef, type Ref } from 'vue'
import type { BackendId } from '../../../../shared/api/backendId'
import type { CustomerInfo } from '../../../../shared/stores/appStore'
import { memberStore } from '../../../../shared/stores/memberStore'
import { memberRechargeStore } from '../../../../shared/stores/memberRechargeStore'

export type MemberRechargeFormModel = {
  rechargeAmount: string
  giftAmount: string
  channelType: string
  externalTradeNo: string
  remark: string
}

type UseMemberRechargeOptions = {
  selectedCustomer: ComputedRef<CustomerInfo | null>
  selectedCustomerId: Ref<BackendId | ''>
  reloadSelectedCustomer: () => Promise<unknown>
}

const defaultForm = (): MemberRechargeFormModel => ({
  rechargeAmount: '',
  giftAmount: '',
  channelType: 'STORE_CASH',
  externalTradeNo: '',
  remark: '',
})

const formatMoney = (value: number) =>
  `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const parseMoney = (value: string, label: string, allowZero = false) => {
  const normalized = value.trim()
  if (!normalized) {
    if (allowZero) return 0
    throw new Error(`请输入${label}`)
  }
  const amount = Number(normalized)
  if (!Number.isFinite(amount)) throw new Error(`${label}格式不正确`)
  if (amount < 0 || (!allowZero && amount <= 0)) {
    throw new Error(`${label}必须${allowZero ? '大于等于' : '大于'}0`)
  }
  return Number(amount.toFixed(2))
}

export const useMemberRecharge = (options: UseMemberRechargeOptions) => {
  const modalOpen = ref(false)
  const submitError = ref('')
  const successMessage = ref('')
  const form = reactive<MemberRechargeFormModel>(defaultForm())

  const submitting = computed(() =>
    options.selectedCustomerId.value
      ? memberRechargeStore.isSubmitting(options.selectedCustomerId.value)
      : false,
  )

  const resetForm = () => {
    Object.assign(form, defaultForm())
  }

  const openRecharge = () => {
    if (!options.selectedCustomer.value) {
      submitError.value = '请先选择会员客户'
      return
    }
    submitError.value = ''
    successMessage.value = ''
    resetForm()
    modalOpen.value = true
  }

  const closeRecharge = () => {
    if (submitting.value) return
    modalOpen.value = false
  }

  const submitRecharge = async () => {
    if (!options.selectedCustomerId.value) {
      submitError.value = '请先选择会员客户'
      return
    }
    const customerId = options.selectedCustomerId.value
    submitError.value = ''
    try {
      const rechargeAmount = parseMoney(form.rechargeAmount, '充值金额')
      const giftAmount = parseMoney(form.giftAmount, '赠送金额', true)
      const result = await memberRechargeStore.submitManualRecharge(customerId, {
        rechargeAmount,
        giftAmount,
        channelType: form.channelType.trim() || 'STORE_CASH',
        externalTradeNo: form.externalTradeNo.trim() || undefined,
        remark: form.remark.trim() || undefined,
      })
      await Promise.all([
        options.reloadSelectedCustomer(),
        memberStore.refreshBalanceLedger(customerId, 20),
      ])
      successMessage.value = `已为 ${options.selectedCustomer.value?.name ?? '会员'} 充值 ${formatMoney(result.creditedAmount)}`
      modalOpen.value = false
    } catch (error) {
      submitError.value = error instanceof Error ? error.message : '会员充值失败'
    }
  }

  return {
    closeRecharge,
    form,
    modalOpen,
    openRecharge,
    submitError,
    submitRecharge,
    submitting,
    successMessage,
  }
}
