<template>
  <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
    <div class="border-b border-amber-topbar-border px-5 py-4">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Consumer Preview</span>
          <h3 class="mt-2 text-[16px] font-semibold text-amber-dark">消费者会员资产预览</h3>
          <p class="mt-2 max-w-[760px] text-[11px] leading-relaxed text-amber-text-muted">
            这是给后续消费者端接真接口预留的只读脚手架，先复用现有会员资料、卡项、权益、券、积分、成长值、余额和最近交易，
            把说明文案与空态占位补齐。
          </p>
        </div>

        <div class="flex flex-wrap gap-2 text-[10px]">
          <span class="rounded-full border border-amber-topbar-border px-3 py-1 text-amber-text-muted">只读脚手架</span>
          <span class="rounded-full border border-amber-topbar-border px-3 py-1 text-amber-text-muted">复用 memberStore DTO</span>
          <span class="rounded-full border border-amber-topbar-border px-3 py-1 text-amber-text-muted">
            {{ loading ? '正在刷新最近流水' : '准备逐步接真接口' }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-5 p-5">
      <div
        v-if="error"
        class="rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[11px] text-[var(--color-status-danger)]"
      >
        {{ error }}
      </div>

      <div class="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[12px] font-semibold text-amber-dark">会员资料</div>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <div
              v-for="fact in profileFacts"
              :key="fact.label"
              class="rounded-md border border-amber-topbar-border/70 px-3 py-3"
            >
              <div class="text-[10px] uppercase tracking-[0.12em] text-amber-text-muted">{{ fact.label }}</div>
              <div class="mt-1 text-[12px] font-medium text-amber-dark">{{ fact.value }}</div>
              <div class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ fact.hint }}</div>
            </div>
          </div>
        </article>

        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[12px] font-semibold text-amber-dark">状态说明</div>
          <div class="mt-3 grid gap-3 md:grid-cols-2">
            <div
              v-for="fact in assetFacts"
              :key="fact.label"
              class="rounded-md border border-amber-topbar-border/70 px-3 py-3"
            >
              <div class="text-[10px] uppercase tracking-[0.12em] text-amber-text-muted">{{ fact.label }}</div>
              <div class="mt-1 text-[12px] font-medium text-amber-dark">{{ fact.value }}</div>
              <div class="mt-1 text-[10.5px] leading-relaxed text-amber-text-muted">{{ fact.hint }}</div>
            </div>
          </div>

          <div class="mt-4 space-y-2 rounded-md border border-dashed border-amber-topbar-border/70 px-3 py-3 text-[10.5px] leading-relaxed text-amber-text-muted">
            <div v-for="note in readonlyNotes" :key="note">{{ note }}</div>
          </div>
        </article>
      </div>

      <div class="grid gap-5 xl:grid-cols-3">
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[12px] font-semibold text-amber-dark">会员卡 / 权益</div>
          <div class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            当前先把消费者看到的卡项和权益并列展示，后续再按真实小程序信息架构拆成独立卡面。
          </div>
          <div class="mt-3 space-y-3 text-[11px]">
            <div
              v-for="card in selectedCards"
              :key="`card-${card.backendId}`"
              class="rounded-md border border-amber-topbar-border/70 px-3 py-3"
            >
              <div class="font-medium text-amber-dark">{{ card.cardName }}</div>
              <div class="mt-1 text-amber-text-muted">{{ card.cardType }} / {{ card.status }}</div>
              <div class="mt-1 text-amber-text-muted">剩余 {{ card.remainingQuota }} / 总量 {{ card.totalQuota }}</div>
            </div>
            <div
              v-for="benefit in selectedBenefits"
              :key="`benefit-${benefit.backendId}`"
              class="rounded-md border border-amber-topbar-border/70 px-3 py-3"
            >
              <div class="font-medium text-amber-dark">{{ benefit.benefitName }}</div>
              <div class="mt-1 text-amber-text-muted">{{ benefit.benefitType }} / {{ benefit.status }}</div>
              <div class="mt-1 text-amber-text-muted">剩余 {{ benefit.remainingAmount }} / 总量 {{ benefit.totalAmount }}</div>
            </div>
            <div v-if="!selectedCards.length && !selectedBenefits.length" class="text-amber-text-muted">
              暂无会员卡或权益资产，后续可直接接入真实卡项实例与权益流水。
            </div>
          </div>
        </article>

        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[12px] font-semibold text-amber-dark">优惠券 / 兑换券</div>
          <div class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            当前先统一复用 <span class="font-mono">memberStore.coupons</span> 承接优惠券和兑换券说明，避免在前端凭空发明新 DTO。
          </div>
          <div class="mt-3 space-y-3 text-[11px]">
            <div
              v-for="coupon in selectedCoupons"
              :key="coupon.backendId"
              class="rounded-md border border-amber-topbar-border/70 px-3 py-3"
            >
              <div class="font-medium text-amber-dark">{{ coupon.couponName }}</div>
              <div class="mt-1 text-amber-text-muted">{{ coupon.couponType }} / {{ coupon.status }}</div>
              <div class="mt-1 text-amber-text-muted">减免 {{ money(coupon.discountAmount) }} / 门槛 {{ money(coupon.thresholdAmount) }}</div>
              <div class="mt-1 text-amber-text-muted">到期 {{ formatTime(coupon.expireTime) }}</div>
            </div>
            <div v-if="!selectedCoupons.length" class="text-amber-text-muted">
              暂无优惠券或兑换券占位，后续可在这里拆出可用、即将到期、已失效三种状态说明。
            </div>
          </div>
        </article>

        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[12px] font-semibold text-amber-dark">积分 / 成长值</div>
          <div class="mt-2 space-y-2 text-[11px]">
            <div class="rounded-md border border-amber-topbar-border/70 px-3 py-3">
              <div class="text-[10px] uppercase tracking-[0.12em] text-amber-text-muted">积分流水</div>
              <div
                v-for="row in pointsLedger.slice(0, 4)"
                :key="`points-${row.backendId}`"
                class="mt-2 border-t border-amber-topbar-border/40 pt-2 first:mt-0 first:border-t-0 first:pt-0"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="font-medium text-amber-dark">{{ row.changeType }}</span>
                  <span class="text-amber-dark">{{ signed(row.changeAmount) }}</span>
                </div>
                <div class="mt-1 text-[10.5px] text-amber-text-muted">
                  结余 {{ row.balanceAfter }} / {{ row.sourceType || '待接来源说明' }} / {{ formatTime(row.happenedAt) }}
                </div>
              </div>
              <div v-if="!pointsLedger.length" class="mt-2 text-amber-text-muted">暂无积分流水占位。</div>
            </div>

            <div class="rounded-md border border-amber-topbar-border/70 px-3 py-3">
              <div class="text-[10px] uppercase tracking-[0.12em] text-amber-text-muted">成长值流水</div>
              <div
                v-for="row in growthLedger.slice(0, 4)"
                :key="`growth-${row.backendId}`"
                class="mt-2 border-t border-amber-topbar-border/40 pt-2 first:mt-0 first:border-t-0 first:pt-0"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="font-medium text-amber-dark">{{ row.changeType }}</span>
                  <span class="text-amber-dark">{{ signed(row.changeAmount) }}</span>
                </div>
                <div class="mt-1 text-[10.5px] text-amber-text-muted">
                  结余 {{ row.balanceAfter }} / {{ row.sourceType || '待接来源说明' }} / {{ formatTime(row.happenedAt) }}
                </div>
              </div>
              <div v-if="!growthLedger.length" class="mt-2 text-amber-text-muted">暂无成长值流水占位。</div>
            </div>
          </div>
        </article>
      </div>

      <div class="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[12px] font-semibold text-amber-dark">余额 / 交易明细</div>
          <div class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            余额部分先展示最近流水，交易明细先复用最近订单，帮助后续消费者页明确“钱从哪里来、花到哪里去”。
          </div>
          <div class="mt-3 space-y-3 text-[11px]">
            <div
              v-for="row in balanceLedger.slice(0, 5)"
              :key="`balance-${row.backendId}`"
              class="rounded-md border border-amber-topbar-border/70 px-3 py-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="font-medium text-amber-dark">{{ row.changeType }}</div>
                <div class="text-amber-dark">{{ signedMoney(row.changeAmount) }}</div>
              </div>
              <div class="mt-1 text-amber-text-muted">结余 {{ money(row.balanceAfter) }}</div>
              <div class="mt-1 text-amber-text-muted">{{ row.sourceType || '待接来源说明' }} / {{ formatTime(row.happenedAt) }}</div>
            </div>
            <div v-if="!balanceLedger.length" class="text-amber-text-muted">
              暂无余额流水占位，后续接充值、消费、退款回滚后可直接替换成真实数据。
            </div>
          </div>
        </article>

        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[12px] font-semibold text-amber-dark">最近订单说明</div>
          <div class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            这里先用最近订单说明消费者为什么获得积分、成长值或余额变化；真实消费者页可再拆出订单详情抽屉。
          </div>
          <div class="mt-3 space-y-3 text-[11px]">
            <div
              v-for="order in recentOrders.slice(0, 5)"
              :key="order.backendId"
              class="rounded-md border border-amber-topbar-border/70 px-3 py-3"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="font-medium text-amber-dark">{{ order.service }}</div>
                <div class="text-amber-dark">{{ money(order.amount) }}</div>
              </div>
              <div class="mt-1 text-amber-text-muted">订单 {{ order.id }} / {{ order.status }} / {{ order.payment }}</div>
              <div class="mt-1 text-amber-text-muted">{{ order.arrivalDate }} {{ order.arrivalClock }} / {{ order.store }}</div>
            </div>
            <div v-if="!recentOrders.length" class="text-amber-text-muted">
              暂无最近订单占位，后续接真实消费者订单列表后可直接替换为分页或时间轴。
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BackendId } from '../../../../../shared/api/backendId'
import type { CustomerInfo } from '../../../../../shared/stores/appStore'
import type {
  MemberBenefitInfo,
  MemberCardInfo,
  MemberCouponInfo,
  MemberOverviewInfo,
} from '../../../../../shared/stores/appStoreTypes'
import { useMemberConsumerAssetPreview } from '../useMemberConsumerAssetPreview'

const props = defineProps<{
  selectedCustomer: CustomerInfo | null
  selectedCustomerId: BackendId | ''
  selectedOverview: MemberOverviewInfo | null
  selectedCards: MemberCardInfo[]
  selectedBenefits: MemberBenefitInfo[]
  selectedCoupons: MemberCouponInfo[]
}>()

const money = (value: number) =>
  `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const signed = (value: number) => `${value >= 0 ? '+' : ''}${value}`
const signedMoney = (value: number) => `${value >= 0 ? '+' : ''}${money(value)}`
const formatTime = (value?: string | null) => value?.trim() || '待接真实时间'

const {
  assetFacts,
  balanceLedger,
  error,
  growthLedger,
  loading,
  pointsLedger,
  profileFacts,
  readonlyNotes,
  recentOrders,
} = useMemberConsumerAssetPreview({
  selectedCustomer: computed(() => props.selectedCustomer),
  selectedCustomerId: computed(() => props.selectedCustomerId),
  selectedOverview: computed(() => props.selectedOverview),
})
</script>
