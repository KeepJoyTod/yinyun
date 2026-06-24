<template>
  <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Promotion Trial</span>
        <h3 class="mt-1 text-[14px] font-semibold text-amber-dark">优惠试算</h3>
      </div>
      <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="runTrial">
        重新试算
      </button>
    </div>

    <div v-if="!order" class="mt-4 text-[10.5px] text-amber-text-muted">选择活动订单后查看固定优先级试算结果。</div>
    <div v-else-if="loading" class="mt-4 text-[10.5px] text-amber-text-muted">正在计算优惠候选...</div>
    <div v-else-if="result" class="mt-4 space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <article class="border border-amber-topbar-border bg-[#FBF8F2] p-3">
          <div class="text-[10px] text-amber-text-muted">原价</div>
          <div class="mt-2 text-[18px] font-semibold text-amber-dark">{{ originalAmount }}</div>
        </article>
        <article class="border border-amber-topbar-border bg-[#FBF8F2] p-3">
          <div class="text-[10px] text-amber-text-muted">优惠额</div>
          <div class="mt-2 text-[18px] font-semibold text-amber-dark">{{ discountAmount }}</div>
        </article>
        <article class="border border-amber-topbar-border bg-[#FBF8F2] p-3">
          <div class="text-[10px] text-amber-text-muted">应付价</div>
          <div class="mt-2 text-[18px] font-semibold text-amber-dark">{{ finalAmount }}</div>
        </article>
      </div>

      <div class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
        <div class="text-[11px] font-semibold text-amber-dark">命中规则</div>
        <p class="mt-2 text-[10.5px] text-amber-text-muted">
          {{ result.appliedRuleCode || '未命中可用优惠' }}<span v-if="result.conflictSource"> · 互斥来源 {{ result.conflictSource }}</span>
        </p>
        <p class="mt-2 text-[10.5px] text-amber-text-muted">恢复策略：{{ result.restorePolicy }}</p>
      </div>

      <div class="space-y-2">
        <article v-for="candidate in result.candidates" :key="candidate.candidateId" class="border border-amber-topbar-border p-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-[11px] font-semibold text-amber-dark">{{ candidate.title }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">
                优先级 {{ candidate.priority }} · {{ candidate.candidateType }}
              </div>
            </div>
            <span class="border px-2 py-0.5 text-[10px]" :class="candidate.applicable ? 'border-[var(--color-status-done)] bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]' : 'border-[var(--color-status-danger)] bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)]'">
              {{ candidate.applicable ? '可用' : '不可用' }}
            </span>
          </div>
          <p class="mt-2 text-[10.5px] text-amber-text-muted">
            优惠额 {{ formatMarketingMoney(candidate.discountAmountCent) }} · 应付 {{ formatMarketingMoney(candidate.finalAmountCent) }}
          </p>
          <p v-if="candidate.reason" class="mt-1 text-[10px] text-amber-text-muted">{{ candidate.reason }}</p>
        </article>
      </div>

      <div v-if="result.blockedReasons.length" class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
        <div class="text-[11px] font-semibold text-amber-dark">不可用原因</div>
        <ul class="mt-2 space-y-1 text-[10.5px] text-amber-text-muted">
          <li v-for="reason in result.blockedReasons" :key="reason">{{ reason }}</li>
        </ul>
      </div>
    </div>
    <div v-if="error" class="mt-3 text-[10.5px] text-[var(--color-status-danger)]">{{ error }}</div>
  </section>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { BookingOrder, CustomerInfo } from '../../../shared/stores/appStore'
import { usePromotionTrial } from '../composables/usePromotionTrial'
import { formatMarketingMoney } from '../marketingScaffoldData'

const props = defineProps<{
  order: BookingOrder | null
  customer?: CustomerInfo | null
}>()

const { loading, error, result, runTrial } = usePromotionTrial(toRef(props, 'order'), toRef(props, 'customer'))

const originalAmount = computed(() => formatMarketingMoney(result.value?.originalAmountCent || 0))
const discountAmount = computed(() => formatMarketingMoney(result.value?.discountAmountCent || 0))
const finalAmount = computed(() => formatMarketingMoney(result.value?.finalAmountCent || 0))
</script>
