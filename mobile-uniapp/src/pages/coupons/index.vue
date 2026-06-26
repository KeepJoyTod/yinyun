<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCustomerExperienceP1 } from '@/composables/useCustomerExperienceP1'

const {
  loading,
  errorMessage,
  entitlementCandidates,
  assetSummary,
  loadBookingOptions,
  loadAssetSummary,
} = useCustomerExperienceP1()

const tabs = computed(() => [
  { key: 'available', label: '可用', count: entitlementCandidates.value.filter(item => item.status === 'available').length },
  { key: 'used', label: '已用', count: entitlementCandidates.value.filter(item => item.status === 'used').length },
  { key: 'expired', label: '过期', count: entitlementCandidates.value.filter(item => item.status === 'expired').length },
  { key: 'unavailable', label: '不可用', count: entitlementCandidates.value.filter(item => item.status === 'unavailable').length },
])

onMounted(() => {
  void Promise.all([
    loadBookingOptions(),
    loadAssetSummary(),
  ])
})
</script>

<template>
  <view class="coupons-page">
    <view class="coupons-hero">
      <text class="coupons-kicker">P1 Scaffold</text>
      <text class="coupons-title">卡券权益</text>
      <text class="coupons-copy">C-025 对应消费者端 canonical owner。展示卡券、兑换券、会员权益与下单核销的 owner 边界；暂未接入真实下单核销。</text>
    </view>

    <view class="asset-summary-card">
      <view class="asset-summary-item">
        <text class="asset-summary-value">{{ assetSummary.cardCount }}</text>
        <text class="asset-summary-label">会员卡</text>
      </view>
      <view class="asset-summary-item">
        <text class="asset-summary-value">{{ assetSummary.benefitCount }}</text>
        <text class="asset-summary-label">权益</text>
      </view>
      <view class="asset-summary-item">
        <text class="asset-summary-value">{{ assetSummary.couponCount }}</text>
        <text class="asset-summary-label">券</text>
      </view>
      <view class="asset-summary-item">
        <text class="asset-summary-value">{{ assetSummary.balanceLabel }}</text>
        <text class="asset-summary-label">余额</text>
      </view>
    </view>

    <view class="coupon-tabs">
      <view v-for="tab in tabs" :key="tab.key" class="coupon-tab">
        <text class="coupon-tab-label">{{ tab.label }}</text>
        <text class="coupon-tab-count">{{ tab.count }}</text>
      </view>
    </view>

    <view v-if="loading" class="coupon-state">正在加载卡券权益脚手架</view>
    <view v-else-if="errorMessage" class="coupon-state coupon-state-error">{{ errorMessage }}</view>
    <view v-else class="coupon-list">
      <view v-for="candidate in entitlementCandidates" :key="candidate.candidateId" class="coupon-card">
        <view>
          <text class="coupon-title">{{ candidate.title }}</text>
          <text class="coupon-reason">{{ candidate.reason }}</text>
        </view>
        <view class="coupon-side">
          <text class="coupon-amount">{{ candidate.amountLabel }}</text>
          <text class="coupon-status">{{ candidate.status }}</text>
        </view>
      </view>
      <view class="coupon-card coupon-card-muted">
        <text class="coupon-title">下单核销未接入</text>
        <text class="coupon-reason">本页只作为消费者端卡券权益 owner，真实权益预占、扣减、兑换和退单恢复归后续交易闭环任务。</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.coupons-page {
  min-height: 100vh;
  padding: 28rpx;
  background: #f5f9ff;
}

.coupons-hero,
.asset-summary-card,
.coupon-tabs,
.coupon-card,
.coupon-state {
  border: 1rpx solid rgba(37, 99, 235, 0.12);
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18rpx 42rpx rgba(15, 23, 42, 0.06);
}

.coupons-hero {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 32rpx;
}

.coupons-kicker,
.coupons-title,
.coupons-copy,
.asset-summary-value,
.asset-summary-label,
.coupon-tab-label,
.coupon-tab-count,
.coupon-title,
.coupon-reason,
.coupon-amount,
.coupon-status {
  display: block;
}

.coupons-kicker {
  color: #2563eb;
  font-size: 20rpx;
  font-weight: 760;
}

.coupons-title {
  color: #0f172a;
  font-size: 42rpx;
  font-weight: 840;
}

.coupons-copy,
.coupon-reason {
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.65;
}

.asset-summary-card,
.coupon-tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;
  padding: 20rpx;
}

.asset-summary-item,
.coupon-tab {
  text-align: center;
}

.asset-summary-value,
.coupon-tab-count {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 820;
}

.asset-summary-label,
.coupon-tab-label {
  margin-top: 4rpx;
  color: #64748b;
  font-size: 20rpx;
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 18rpx;
}

.coupon-card {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  padding: 24rpx;
}

.coupon-card-muted {
  border-style: dashed;
}

.coupon-title {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 780;
}

.coupon-side {
  flex: 0 0 auto;
  text-align: right;
}

.coupon-amount {
  color: #1d4ed8;
  font-size: 24rpx;
  font-weight: 780;
}

.coupon-status {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 20rpx;
}

.coupon-state {
  margin-top: 18rpx;
  padding: 28rpx;
  color: #64748b;
  font-size: 24rpx;
}

.coupon-state-error {
  color: #b91c1c;
}
</style>
