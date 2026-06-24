<script setup lang="ts">
import { computed, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getResultRedirectUrl, getResultStatusConfig, normalizeResultType } from '@/pages/pickup/result/result-state.mjs';

const type = ref('info');
const message = ref('操作已完成');
const redirect = ref('');

const statusConfig = computed(() => getResultStatusConfig(type.value));

const title = computed(() => statusConfig.value.title);
const buttonLabel = computed(() => statusConfig.value.buttonLabel);
const copy = computed(() => statusConfig.value.copy);
const reason = computed(() => statusConfig.value.reason);
const nextSteps = computed(() => statusConfig.value.nextSteps);

onLoad((query) => {
  type.value = normalizeResultType(String(query?.type || 'info'));
  message.value = String(query?.message || '操作已完成');
  redirect.value = decodeURIComponent(String(query?.redirect || ''));
});

function goNext() {
  uni.redirectTo({ url: getResultRedirectUrl(type.value, redirect.value) });
}
</script>

<template>
  <view class="page-shell">
    <view class="page-content">
      <view class="stack">
        <view class="hero-panel hero-panel-compact">
          <view class="brand-row">
            <view class="brand-row" style="justify-content: flex-start">
              <view class="brand-mark">影</view>
              <text class="brand-name">影约云</text>
            </view>
            <text class="chip chip-neutral">状态页</text>
          </view>
          <view class="hero-title">{{ title }}</view>
          <view class="hero-copy">{{ message }}</view>
        </view>

        <view class="surface-card">
          <view class="state-title">{{ title }}</view>
          <view class="state-copy">{{ copy }}</view>

          <view class="result-diagnostic-panel">
            <view class="result-diagnostic-item">
              <text class="result-diagnostic-label">当前状态</text>
              <text class="result-diagnostic-value">{{ title }}</text>
            </view>
            <view class="result-diagnostic-item">
              <text class="result-diagnostic-label">可能原因</text>
              <text class="result-diagnostic-value">{{ reason }}</text>
            </view>
          </view>

          <view class="result-next-steps">
            <view class="result-next-title">下一步</view>
            <view v-for="(step, index) in nextSteps" :key="step" class="result-next-step">
              <text class="result-next-index">{{ index + 1 }}</text>
              <text>{{ step }}</text>
            </view>
          </view>

          <view class="result-safety-note">
            手机号和取片码只用于校验当前相册，不会展示后台地址或长期图片链接。
          </view>

          <button class="button-primary" @click="goNext">{{ buttonLabel }}</button>
        </view>
      </view>
    </view>
  </view>
</template>
