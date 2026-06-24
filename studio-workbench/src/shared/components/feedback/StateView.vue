<template>
  <!-- loading：骨架占位，避免空白 -->
  <div
    v-if="loading"
    class="flex flex-col items-center justify-center gap-2 border border-dashed border-amber-topbar-border bg-[#FBF8F2]/70 px-6 py-8 text-center"
    role="status"
  >
    <div class="flex items-center gap-2 text-[11px] font-sans text-amber-text-muted">
      <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-accent"></span>
      <span>{{ loadingLabel }}</span>
    </div>
    <slot name="loading-skeleton" />
  </div>

  <!-- error：红色提示 + 重试 -->
  <div
    v-else-if="error"
    class="flex flex-col items-center justify-center gap-3 border border-[#B8543B]/25 bg-[#F8E7E2] px-6 py-8 text-center"
    role="alert"
  >
    <div class="text-[13px] font-serif font-medium text-[#B8543B]">{{ errorTitle }}</div>
    <p class="mx-auto max-w-[420px] text-[10.5px] font-sans leading-relaxed text-[#8C3E2C]">
      {{ error }}
    </p>
    <button
      v-if="onRetry"
      class="yy-action border border-[#B8543B] bg-[#B8543B] px-4 py-2 text-[10.5px] font-sans font-medium text-[#F4EFE6] hover:bg-[#8C3E2C]"
      type="button"
      @click="onRetry"
    >
      {{ retryLabel }}
    </button>
  </div>

  <!-- empty：空态，可选主操作 -->
  <div
    v-else-if="empty"
    class="flex flex-col items-center justify-center gap-3 border border-dashed border-amber-topbar-border bg-[#FBF8F2]/70 px-6 py-8 text-center"
    role="status"
  >
    <img
      :src="emptyImage"
      alt=""
      class="h-[86px] w-[112px] object-contain opacity-90"
      loading="lazy"
    />
    <div class="text-[13px] font-serif font-medium text-amber-dark">{{ emptyTitle }}</div>
    <p v-if="emptyHint" class="mx-auto max-w-[420px] text-[10.5px] font-sans leading-relaxed text-amber-text-muted">
      {{ emptyHint }}
    </p>
    <div v-if="$slots['empty-action']" class="mt-1 flex justify-center gap-2">
      <slot name="empty-action" />
    </div>
  </div>

  <!-- 正常内容 -->
  <slot v-else />
</template>

<script setup lang="ts">
import { workbenchImages } from '../../stores/workbenchAssets'

withDefaults(
  defineProps<{
    loading?: boolean
    error?: string
    empty?: boolean
    /** 空态标题 */
    emptyTitle?: string
    /** 空态说明 */
    emptyHint?: string
    /** 提供后，错误态会显示重试按钮 */
    onRetry?: () => void
    loadingLabel?: string
    errorTitle?: string
    retryLabel?: string
    emptyImage?: string
  }>(),
  {
    loading: false,
    error: '',
    empty: false,
    emptyTitle: '暂无数据',
    emptyHint: '',
    onRetry: undefined,
    loadingLabel: '加载中…',
    errorTitle: '加载失败',
    retryLabel: '重试',
    emptyImage: workbenchImages.emptyFiles,
  },
)
</script>
