<script setup lang="ts">
import type { CustomerExperienceP1AssetSummary } from '@/types/customerExperienceP1'

defineProps<{
  assetSummary: CustomerExperienceP1AssetSummary
}>()

const emit = defineEmits<{
  (event: 'open-page', url: string): void
}>()

const openPage = (url: string) => {
  emit('open-page', url)
}
</script>

<template>
  <view class="member-card member-p1-card">
    <view class="member-section-head">
      <text class="member-section-title">会员资产 P1</text>
      <text class="member-section-note">消费者端脚手架</text>
    </view>
    <view class="member-p1-grid">
      <button class="member-p1-item" @click="openPage('/pages/coupons/index')">
        <text class="member-p1-value">{{ assetSummary.cardCount + assetSummary.benefitCount }}</text>
        <text class="member-p1-label">卡项/权益</text>
      </button>
      <button class="member-p1-item" @click="openPage('/pages/coupons/index')">
        <text class="member-p1-value">{{ assetSummary.couponCount }}</text>
        <text class="member-p1-label">优惠券</text>
      </button>
      <button class="member-p1-item" @click="openPage('/pages/coupons/index')">
        <text class="member-p1-value">{{ assetSummary.points }}</text>
        <text class="member-p1-label">积分</text>
      </button>
      <button class="member-p1-item" @click="openPage('/pages/reviews/index')">
        <text class="member-p1-value">{{ assetSummary.growthValue }}</text>
        <text class="member-p1-label">成长值/评价</text>
      </button>
    </view>
    <text class="member-p1-note">{{ assetSummary.emptyReason || '真实权益核销、余额消费和成长规则仍待后续任务接入。' }}</text>
  </view>
</template>

<style scoped lang="scss">
.member-card {
  box-sizing: border-box;
  border: 1px solid rgba(207, 217, 215, 0.9);
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.97);
}

.member-p1-card {
  padding: 24rpx;
}

.member-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.member-section-title {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 820;
}

.member-section-note {
  color: #64748b;
  font-size: 22rpx;
}

.member-p1-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx;
  margin-top: 18rpx;
}

.member-p1-item {
  padding: 18rpx 8rpx;
  border: 1rpx solid rgba(37, 99, 235, 0.12);
  border-radius: 18rpx;
  background: #f8fafc;
  text-align: center;
}

.member-p1-value,
.member-p1-label,
.member-p1-note {
  display: block;
}

.member-p1-value {
  color: #0f172a;
  font-size: 28rpx;
  font-weight: 820;
}

.member-p1-label {
  margin-top: 6rpx;
  color: #64748b;
  font-size: 20rpx;
}

.member-p1-note {
  margin-top: 16rpx;
  color: #64748b;
  font-size: 22rpx;
  line-height: 1.55;
}
</style>
