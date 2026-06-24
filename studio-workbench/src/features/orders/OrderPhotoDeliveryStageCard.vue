<template>
  <div class="mb-3 rounded-lg border border-amber-topbar-border/70 bg-white/65 p-3">
    <div class="flex items-center justify-between gap-2">
      <div class="text-[11px] font-sans font-medium text-amber-dark">客片交付状态</div>
      <span
        class="shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.12em]"
        :class="stageClass"
      >
        {{ stage.label }}
      </span>
    </div>
    <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">{{ stage.hint }}</p>
    <p
      v-if="showFallbackHint"
      class="mt-2 rounded-md border border-amber-topbar-border/70 bg-[#FBF8F2] px-2.5 py-2 text-[10.5px] leading-relaxed text-amber-text-muted"
    >
      通知会先调用后端客片接口；如短信/企微/小程序通知通道未接入，只记录人工跟进审计，不伪造成已送达。
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { OrderPhotoDeliveryStage } from './orderOperations'

defineProps<{
  stage: OrderPhotoDeliveryStage
  stageClass: string
  showFallbackHint?: boolean
}>()
</script>
