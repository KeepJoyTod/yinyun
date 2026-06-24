<script setup lang="ts">
withDefaults(defineProps<{
  open: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
  confirmDanger?: boolean;
}>(), {
  title: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  loading: false,
  confirmDanger: false,
});

const emit = defineEmits<{
  close: [];
  cancel: [];
  confirm: [];
}>();

function onMaskTap() {
  emit('close');
}

function onCancel() {
  emit('cancel');
  emit('close');
}
</script>

<template>
  <view v-if="open" class="yy-sheet-root">
    <view class="yy-sheet-mask" @tap="onMaskTap" />
    <view class="yy-sheet-panel">
      <view class="yy-sheet-handle" />
      <view class="yy-sheet-head">
        <text class="yy-sheet-title">{{ title }}</text>
        <button class="yy-sheet-close" aria-label="关闭" @tap="onMaskTap">×</button>
      </view>
      <view class="yy-sheet-body">
        <slot />
      </view>
      <view class="yy-sheet-actions">
        <button
          v-if="showCancel"
          class="yy-sheet-action yy-sheet-action-cancel"
          :disabled="loading"
          @tap="onCancel"
        >
          {{ cancelText }}
        </button>
        <button
          class="yy-sheet-action yy-sheet-action-confirm"
          :class="{ 'yy-sheet-action-danger': confirmDanger }"
          :loading="loading"
          :disabled="loading"
          @tap="emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.yy-sheet-root {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.yy-sheet-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.42);
}

.yy-sheet-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  max-height: 82dvh;
  padding: 14rpx 30rpx calc(26rpx + env(safe-area-inset-bottom));
  border-radius: 34rpx 34rpx 0 0;
  border: 1px solid rgba(255, 255, 255, 0.84);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(239, 247, 255, 0.96)),
    #fff;
  box-shadow: 0 -28rpx 80rpx rgba(37, 99, 235, 0.18);
  backdrop-filter: blur(24rpx);
  animation: yy-sheet-enter 180ms ease-out;
}

.yy-sheet-handle {
  width: 72rpx;
  height: 8rpx;
  margin: 0 auto 20rpx;
  border-radius: 999rpx;
  background: rgba(148, 163, 184, 0.42);
}

.yy-sheet-head,
.yy-sheet-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.yy-sheet-title {
  flex: 1;
  min-width: 0;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 820;
  line-height: 1.25;
}

.yy-sheet-close {
  flex: none;
  width: 64rpx;
  height: 64rpx;
  min-height: 64rpx;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 999rpx;
  background: rgba(226, 239, 255, 0.88);
  color: #52677f;
  font-size: 38rpx;
  line-height: 60rpx;
}

.yy-sheet-close::after,
.yy-sheet-action::after {
  border: 0;
}

.yy-sheet-body {
  overflow-y: auto;
  max-height: calc(82dvh - 210rpx);
  margin-top: 20rpx;
}

.yy-sheet-actions {
  margin-top: 24rpx;
}

.yy-sheet-action {
  flex: 1;
  min-height: 78rpx;
  margin: 0;
  border-radius: 18rpx;
  font-size: 26rpx;
  font-weight: 780;
  line-height: 78rpx;
}

.yy-sheet-action-cancel {
  background: rgba(234, 243, 255, 0.92);
  color: #1d4ed8;
}

.yy-sheet-action-confirm {
  background: #2563eb;
  color: #fff;
  box-shadow: 0 16rpx 34rpx rgba(37, 99, 235, 0.18);
}

.yy-sheet-action-danger {
  background: #9a4e1f;
  box-shadow: 0 16rpx 34rpx rgba(154, 78, 31, 0.18);
}

.yy-sheet-action:active,
.yy-sheet-close:active {
  transform: scale(0.98);
  opacity: 0.86;
}

@keyframes yy-sheet-enter {
  from {
    transform: translateY(32rpx);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
