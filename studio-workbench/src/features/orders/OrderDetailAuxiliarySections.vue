<template>
  <OrderDetailFoldout title="商品信息" badge="商品">
    <OrderProductInfoPanel
      :order="order"
      :product="product"
      :addon-summary="addonSummary"
    />
  </OrderDetailFoldout>

  <OrderDetailFoldout
    title="渠道同步"
    :badge="syncLogs.length ? syncLogs.length + ' 条' : '同步'"
  >
    <OrderChannelSyncPanel
      :logs="syncLogs"
      :copied="channelDiagnosticCopied"
      @copy="emit('copyChannelDiagnostic')"
    />
  </OrderDetailFoldout>

  <OrderDetailFoldout title="完整操作记录" badge="日志">
    <OrderOperationTimelinePanel
      :items="timeline"
      :loading="operationLogsLoading"
      :state-text="operationLogsStateText"
      :tone-styles="timelineToneStyles"
      @refresh="emit('refreshOperationLogs')"
    />
  </OrderDetailFoldout>
</template>

<script setup lang="ts">
import type { BookingOrder, ChannelSyncLogInfo, ProductConfig } from '../../shared/stores/appStore'
import OrderChannelSyncPanel from './OrderChannelSyncPanel.vue'
import OrderDetailFoldout from './OrderDetailFoldout.vue'
import OrderOperationTimelinePanel from './OrderOperationTimelinePanel.vue'
import OrderProductInfoPanel from './OrderProductInfoPanel.vue'
import type { OrderDetailTimelineItem } from './orderOperations'

defineProps<{
  order: BookingOrder
  product: ProductConfig | null
  addonSummary: string
  syncLogs: ChannelSyncLogInfo[]
  channelDiagnosticCopied: boolean
  timeline: OrderDetailTimelineItem[]
  operationLogsLoading: boolean
  operationLogsStateText: string
  timelineToneStyles: Record<OrderDetailTimelineItem['tone'], string>
}>()

const emit = defineEmits<{
  copyChannelDiagnostic: []
  refreshOperationLogs: []
}>()
</script>
