<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-[560px] overflow-hidden rounded-md border border-amber-topbar-border bg-amber-content-bg shadow-2xl">
        <div class="border-b border-amber-topbar-border px-6 py-5">
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Member Recharge</span>
          <h3 class="mt-1 text-[17px] font-sans text-amber-dark">门店手工充值</h3>
          <p class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            为当前会员创建充值单并立即确认到账，写入会员余额总账和余额流水。
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 px-6 py-5 max-[720px]:grid-cols-1">
          <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
            会员客户
            <input :value="customerName" class="yy-field-md bg-black/[0.02]" disabled type="text" />
          </label>
          <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
            充值渠道
            <select v-model="form.channelType" class="yy-field-md">
              <option value="STORE_CASH">门店现金</option>
              <option value="WECHAT_OFFLINE">微信收款</option>
              <option value="ALIPAY_OFFLINE">支付宝收款</option>
              <option value="BANK_TRANSFER">银行转账</option>
            </select>
          </label>
          <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
            充值金额
            <input v-model="form.rechargeAmount" class="yy-field-md" min="0.01" placeholder="例如 200.00" step="0.01" type="number" />
          </label>
          <label class="flex flex-col gap-1 text-[10px] text-amber-text-muted">
            赠送金额
            <input v-model="form.giftAmount" class="yy-field-md" min="0" placeholder="例如 20.00" step="0.01" type="number" />
          </label>
          <label class="col-span-2 flex flex-col gap-1 text-[10px] text-amber-text-muted max-[720px]:col-span-1">
            外部流水号
            <input v-model="form.externalTradeNo" class="yy-field-md" placeholder="选填，登记门店收款流水或小票号" type="text" />
          </label>
          <label class="col-span-2 flex flex-col gap-1 text-[10px] text-amber-text-muted max-[720px]:col-span-1">
            备注
            <textarea
              v-model="form.remark"
              class="min-h-[100px] border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark focus:outline-none"
              placeholder="选填，例如活动充值、店员补录、赠送原因"
            />
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
          <button
            class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-text-muted hover:bg-black/5"
            type="button"
            :disabled="submitting"
            @click="$emit('close')"
          >
            取消
          </button>
          <button
            class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted"
            type="button"
            :disabled="submitting"
            @click="$emit('submit')"
          >
            {{ submitting ? '充值中...' : '确认充值' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { MemberRechargeFormModel } from '../useMemberRecharge'

defineProps<{
  customerName: string
  form: MemberRechargeFormModel
  open: boolean
  submitting: boolean
}>()

defineEmits<{
  close: []
  submit: []
}>()
</script>
