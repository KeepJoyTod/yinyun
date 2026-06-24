<template>
  <span
    class="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-sans font-medium leading-none"
    :class="toneClass"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 统一的状态标签，语义色系统。
 *
 * tone 映射：
 * - neutral  待确认（琥珀/金）
 * - active   已确认（蓝灰/靛蓝）
 * - dark     拍摄中（青绿）
 * - inverted 选片中（紫灰/玫瑰灰）
 * - success  已完成/已交付（绿色）
 * - warn     待支付/临期（琥珀软）
 * - danger   冲突/失败/异常（克制红）
 */
export type StatusBadgeTone =
  | 'neutral'
  | 'active'
  | 'dark'
  | 'inverted'
  | 'success'
  | 'warn'
  | 'danger'

const props = withDefaults(
  defineProps<{
    label: string
    tone?: StatusBadgeTone
  }>(),
  { tone: 'neutral' },
)

const toneMap: Record<StatusBadgeTone, string> = {
  neutral: 'bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending)] border border-[var(--color-status-pending-border)]',
  active: 'bg-[var(--color-status-confirmed-bg)] text-[var(--color-status-confirmed)] border border-[var(--color-status-confirmed-border)]',
  dark: 'bg-[var(--color-status-shooting-bg)] text-[var(--color-status-shooting)] border border-[var(--color-status-shooting-border)]',
  inverted: 'bg-[var(--color-status-selecting-bg)] text-[var(--color-status-selecting)] border border-[var(--color-status-selecting-border)]',
  success: 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)] border border-[var(--color-status-done-border)]',
  warn: 'bg-[var(--color-status-warn-bg)] text-[var(--color-status-warn)] border border-[var(--color-status-warn-border)]',
  danger: 'bg-[var(--color-status-danger-bg)] text-[var(--color-status-danger)] border border-[var(--color-status-danger-border)]',
}

const toneClass = computed(() => toneMap[props.tone])
</script>
