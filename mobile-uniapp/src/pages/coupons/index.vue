<script setup lang="ts">
const pendingScenes = [
  '优惠券 / 兑换券 / 卡项权益',
  '可用 / 已用 / 过期状态',
  '权益核销与订单联动',
]
</script>

<template>
  <view class="phase0-page">
    <view class="phase0-card">
      <text class="phase0-kicker">Coupons · Phase 0</text>
      <text class="phase0-title">卡券权益脚手架</text>
      <text class="phase0-copy">本页先作为客户端卡券域 owner，占位后续会员资产、券实例、权益核销和订单联动真实链路。</text>
      <view class="phase0-list">
        <text v-for="item in pendingScenes" :key="item" class="phase0-list-item">{{ item }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.phase0-page {
  min-height: 100vh;
  padding: 28rpx;
  background: linear-gradient(180deg, #f7f6f1 0%, #efe7da 100%);
}

.phase0-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 36rpx;
  border: 1rpx solid rgba(125, 91, 42, 0.2);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.78);
}

.phase0-kicker {
  font-size: 20rpx;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #a47d3a;
}

.phase0-title {
  font-size: 42rpx;
  font-weight: 700;
  color: #2f271d;
}

.phase0-copy,
.phase0-list-item {
  font-size: 26rpx;
  line-height: 1.7;
  color: #665949;
}

.phase0-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
</style>
