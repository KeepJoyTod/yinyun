<template>
  <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
    <OrderAlbumActionButton
      label="通知客户"
      loading-label="通知中..."
      :title-text="notifyTitleText"
      :disabled="notifyDisabled"
      :loading="notifyLoading"
      @click="emit('notify')"
    />
    <OrderAlbumActionButton
      label="客片确认"
      loading-label="确认中..."
      :title-text="confirmTitleText"
      :disabled="confirmDisabled"
      :loading="confirmLoading"
      @click="emit('confirm')"
    />
    <OrderAlbumActionButton
      label="资料发送"
      loading-label="发送中..."
      tone="primary"
      :title-text="deliverTitleText"
      :disabled="deliverDisabled"
      :loading="deliverLoading"
      @click="emit('deliver')"
    />
  </div>
  <button
    v-if="noAlbum"
    class="yy-action mt-2 w-full rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[11px] font-medium text-amber-text-muted hover:bg-black/5"
    type="button"
    @click="emit('openPhotoManagement')"
  >
    {{ primaryAction }}
  </button>
  <div
    v-if="availabilityReason"
    class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted"
  >
    {{ availabilityReason }}
  </div>
  <div
    v-if="visibleReasons.length"
    class="mt-2 flex flex-wrap gap-1.5 text-[10.5px] leading-relaxed text-amber-text-muted"
  >
    <span
      v-for="reason in visibleReasons"
      :key="reason"
      class="rounded border border-amber-topbar-border/70 bg-white/70 px-2 py-0.5"
    >
      {{ reason }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrderAlbumActionButton from './OrderAlbumActionButton.vue'

const props = defineProps<{
  notifyTitleText: string
  notifyDisabled: boolean
  notifyLoading: boolean
  confirmTitleText: string
  confirmDisabled: boolean
  confirmLoading: boolean
  deliverTitleText: string
  deliverDisabled: boolean
  deliverLoading: boolean
  noAlbum: boolean
  primaryAction: string
  availabilityReason: string
}>()

const defaultActionLabels = new Set(['通知客户', '客片确认', '资料发送'])

const visibleReasons = computed(() => {
  const reasons = [
    props.notifyDisabled && props.notifyTitleText,
    props.confirmDisabled && props.confirmTitleText,
    props.deliverDisabled && props.deliverTitleText,
  ].filter((reason): reason is string => Boolean(reason))
    .filter(reason => !defaultActionLabels.has(reason))
  return [...new Set(reasons)]
})

const emit = defineEmits<{
  notify: []
  confirm: []
  deliver: []
  openPhotoManagement: []
}>()
</script>
