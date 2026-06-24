<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero border border-amber-topbar-border bg-amber-content-bg p-6">
      <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Member Assets</span>
      <h2 class="mt-2 text-[18px] font-semibold text-amber-dark">会员资产总览</h2>
      <p class="mt-2 max-w-[760px] text-[11px] leading-relaxed text-amber-text-muted">
        统一查看会员卡、权益、优惠券、积分、成长值和余额摘要，并补齐门店手工充值入口。
      </p>
    </section>

    <section class="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <div class="text-[12px] font-semibold text-amber-dark">客户选择</div>
          <input
            v-model="searchQuery"
            class="yy-field-sm mt-3 w-full"
            placeholder="搜索客户 / 手机号 / 标签"
            type="text"
          >
        </div>

        <div v-if="filteredCustomers.length" class="max-h-[640px] overflow-auto">
          <button
            v-for="customer in filteredCustomers"
            :key="customer.backendId"
            class="flex w-full flex-col border-b border-amber-topbar-border/60 px-5 py-4 text-left hover:bg-black/[0.015]"
            :class="selectedCustomerId === customer.backendId ? 'bg-black/[0.03]' : ''"
            type="button"
            @click="void selectCustomer(customer.backendId)"
          >
            <span class="text-[12px] font-semibold text-amber-dark">{{ customer.name }}</span>
            <span class="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-text-muted">{{ customer.mobile }}</span>
            <span class="mt-2 text-[10.5px] text-amber-text-muted">
              {{ customer.memberLevel }} / {{ customer.tags.join(' / ') || '未打标签' }}
            </span>
          </button>
        </div>

        <div v-else class="px-5 py-8 text-[11px] text-amber-text-muted">
          暂无客户，请先到客户档案建立会员主档。
        </div>
      </aside>

      <div class="flex min-w-0 flex-col gap-5">
        <div
          v-if="error"
          class="rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[11px] text-[var(--color-status-danger)]"
        >
          {{ error }}
        </div>

        <div
          v-if="rechargeSuccess"
          class="rounded-md border border-[var(--color-status-success-border)] bg-[var(--color-status-success-bg)] px-4 py-3 text-[11px] text-[var(--color-status-success)]"
        >
          {{ rechargeSuccess }}
        </div>

        <div
          v-if="rechargeError"
          class="rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[11px] text-[var(--color-status-danger)]"
        >
          {{ rechargeError }}
        </div>

        <div v-if="selectedCustomer && selectedOverview" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article
            v-for="card in summaryCards"
            :key="card.label"
            class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-4"
          >
            <div class="text-[11px] font-semibold text-amber-dark">{{ card.label }}</div>
            <div class="mt-1 text-[10px] leading-relaxed text-amber-text-muted">{{ card.hint }}</div>
            <div class="mt-4 flex items-end justify-between gap-2">
              <strong class="text-[24px] leading-none text-amber-dark">{{ card.value }}</strong>
              <span class="font-mono text-[9px] uppercase tracking-[0.16em] text-amber-text-muted">{{ card.scope }}</span>
            </div>
          </article>
        </div>

        <section v-if="selectedCustomer && selectedOverview" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
          <div class="border-b border-amber-topbar-border px-5 py-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-[13px] font-semibold text-amber-dark">{{ selectedOverview.customerName }}</div>
                <div class="mt-1 text-[10.5px] text-amber-text-muted">
                  {{ selectedOverview.mobile }} / {{ selectedOverview.memberLevel }}
                </div>
              </div>

              <div class="flex flex-wrap items-center justify-end gap-3">
                <div class="text-[10.5px] text-amber-text-muted">
                  累计消费 {{ selectedOverview.totalSpend.toLocaleString('zh-CN') }} / 订单 {{ selectedOverview.totalOrderCount }}
                </div>
                <button
                  class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] font-medium text-[#F4EFE6] hover:bg-black disabled:bg-amber-bg disabled:text-amber-text-muted"
                  type="button"
                  :disabled="loading || rechargeSubmitting"
                  @click="openRecharge"
                >
                  {{ rechargeSubmitting ? '充值中...' : '会员充值' }}
                </button>
              </div>
            </div>
          </div>

          <div class="grid gap-5 p-5 xl:grid-cols-3">
            <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
              <div class="text-[12px] font-semibold text-amber-dark">会员卡</div>
              <div class="mt-3 space-y-3 text-[11px]">
                <div v-for="card in selectedCards" :key="card.backendId" class="rounded-md border border-amber-topbar-border/70 px-3 py-3">
                  <div class="font-medium text-amber-dark">{{ card.cardName }}</div>
                  <div class="mt-1 text-amber-text-muted">{{ card.cardType }} / {{ card.status }}</div>
                  <div class="mt-1 text-amber-text-muted">剩余 {{ card.remainingQuota }} / 总量 {{ card.totalQuota }}</div>
                </div>
                <div v-if="!selectedCards.length" class="text-amber-text-muted">暂无会员卡资产</div>
              </div>
            </article>

            <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
              <div class="text-[12px] font-semibold text-amber-dark">权益</div>
              <div class="mt-3 space-y-3 text-[11px]">
                <div v-for="benefit in selectedBenefits" :key="benefit.backendId" class="rounded-md border border-amber-topbar-border/70 px-3 py-3">
                  <div class="font-medium text-amber-dark">{{ benefit.benefitName }}</div>
                  <div class="mt-1 text-amber-text-muted">{{ benefit.benefitType }} / {{ benefit.status }}</div>
                  <div class="mt-1 text-amber-text-muted">剩余 {{ benefit.remainingAmount }} / 总量 {{ benefit.totalAmount }}</div>
                </div>
                <div v-if="!selectedBenefits.length" class="text-amber-text-muted">暂无权益账本</div>
              </div>
            </article>

            <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
              <div class="text-[12px] font-semibold text-amber-dark">优惠券</div>
              <div class="mt-3 space-y-3 text-[11px]">
                <div v-for="coupon in selectedCoupons" :key="coupon.backendId" class="rounded-md border border-amber-topbar-border/70 px-3 py-3">
                  <div class="font-medium text-amber-dark">{{ coupon.couponName }}</div>
                  <div class="mt-1 text-amber-text-muted">{{ coupon.couponType }} / {{ coupon.status }}</div>
                  <div class="mt-1 text-amber-text-muted">减免 {{ coupon.discountAmount }} / 门槛 {{ coupon.thresholdAmount }}</div>
                </div>
                <div v-if="!selectedCoupons.length" class="text-amber-text-muted">暂无优惠券资产</div>
              </div>
            </article>
          </div>
        </section>

        <section
          v-else
          class="yy-console-card border border-dashed border-amber-topbar-border bg-amber-content-bg px-6 py-10 text-[11px] text-amber-text-muted"
        >
          {{ loading ? '会员资产加载中...' : '请选择左侧客户查看会员资产。' }}
        </section>
      </div>
    </section>

    <MemberRechargeModal
      :open="rechargeOpen"
      :customer-name="selectedCustomer?.name ?? ''"
      :form="rechargeForm"
      :submitting="rechargeSubmitting"
      @close="closeRecharge"
      @submit="void submitRecharge()"
    />
  </div>
</template>

<script setup lang="ts">
import MemberRechargeModal from './components/MemberRechargeModal.vue'
import { useMemberAssetOverview } from './useMemberAssetOverview'
import { useMemberRecharge } from './useMemberRecharge'

const {
  error,
  filteredCustomers,
  loading,
  reloadSelectedCustomer,
  searchQuery,
  selectedBenefits,
  selectedCards,
  selectedCoupons,
  selectedCustomer,
  selectedCustomerId,
  selectedOverview,
  selectCustomer,
  summaryCards,
} = useMemberAssetOverview()

const {
  closeRecharge,
  form: rechargeForm,
  modalOpen: rechargeOpen,
  openRecharge,
  submitError: rechargeError,
  submitRecharge,
  submitting: rechargeSubmitting,
  successMessage: rechargeSuccess,
} = useMemberRecharge({
  reloadSelectedCustomer,
  selectedCustomer,
  selectedCustomerId,
})
</script>
