<script setup lang="ts">
const pendingScenes = [
  '个人资料编辑与头像',
  '手机号 / 微信绑定安全校验',
  '品牌侧帮助与账号中心联动',
]
</script>

<template>
  <view class="phase0-page">
    <view class="phase0-card">
      <text class="phase0-kicker">Profile · Phase 0</text>
      <text class="phase0-title">个人资料脚手架</text>
      <text class="phase0-copy">本页先作为客户端资料域 owner，后续承接个人中心、账号资料、登录安全和帮助入口。</text>
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
  background: linear-gradient(180deg, #f6f7fb 0%, #e7edf8 100%);
}

.phase0-card {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 36rpx;
  border: 1rpx solid rgba(77, 108, 166, 0.18);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.82);
}

.phase0-kicker {
  font-size: 20rpx;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #5274b0;
}

.phase0-title {
  font-size: 42rpx;
  font-weight: 700;
  color: #1f2e4f;
}

.phase0-copy,
.phase0-list-item {
  font-size: 26rpx;
  line-height: 1.7;
  color: #516079;
}

.phase0-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
</style>
