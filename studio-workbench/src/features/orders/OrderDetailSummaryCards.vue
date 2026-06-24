<template>
  <section class="order-basic-info-grid border border-amber-topbar-border bg-amber-content-bg/55 p-4">
    <div class="mb-3 flex items-center justify-between gap-2">
      <div class="font-sans text-[14px] font-medium text-amber-dark">基础信息</div>
      <StatusBadge :label="order.payment" :tone="paymentTone" />
    </div>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
      <div class="rounded-md border border-amber-topbar-border/70 bg-white/65 p-3">
        <div class="mb-2 font-sans text-[12px] font-semibold text-amber-dark">客户信息</div>
        <dl class="grid grid-cols-[58px_1fr] gap-x-2 gap-y-1.5 text-[10.5px]">
          <dt class="text-amber-text-muted">姓名</dt>
          <dd class="font-medium text-amber-dark">{{ order.customer || '待补充' }}</dd>
          <dt class="text-amber-text-muted">手机号</dt>
          <dd class="flex items-center gap-2 font-mono text-amber-dark">
            {{ order.phone || '待补充' }}
            <button
              v-if="order.phone"
              class="yy-action text-[9px] text-amber-text-muted hover:text-amber-dark"
              type="button"
              @click="emit('copy', order.phone, 'phone')"
            >
              {{ copiedField === 'phone' ? '已复制' : '复制' }}
            </button>
          </dd>
          <dt class="text-amber-text-muted">门店</dt>
          <dd class="text-amber-dark">{{ order.store }}</dd>
        </dl>
      </div>

      <div class="rounded-md border border-amber-topbar-border/70 bg-white/65 p-3">
        <div class="mb-2 font-sans text-[12px] font-semibold text-amber-dark">预约信息</div>
        <dl class="grid grid-cols-[58px_1fr] gap-x-2 gap-y-1.5 text-[10.5px]">
          <dt class="text-amber-text-muted">状态</dt>
          <dd><span class="px-2 py-0.5 text-[10px]" :class="statusClass">{{ order.status }}</span></dd>
          <dt class="text-amber-text-muted">下单</dt>
          <dd class="font-mono text-amber-dark">{{ order.orderTime || '未知' }}</dd>
          <dt class="text-amber-text-muted">到店</dt>
          <dd class="font-mono text-amber-dark">{{ order.arrivalTime || '未排期' }}</dd>
        </dl>
      </div>

      <div class="rounded-md border border-amber-topbar-border/70 bg-white/65 p-3">
        <div class="mb-2 font-sans text-[12px] font-semibold text-amber-dark">支付信息</div>
        <dl class="grid grid-cols-[58px_1fr] gap-x-2 gap-y-1.5 text-[10.5px]">
          <dt class="text-amber-text-muted">金额</dt>
          <dd class="font-mono text-amber-dark">¥ {{ order.amount.toLocaleString('zh-CN') }}</dd>
          <dt class="text-amber-text-muted">支付</dt>
          <dd class="text-amber-dark">{{ order.payment }}</dd>
          <dt class="text-amber-text-muted">方式</dt>
          <dd class="text-amber-dark">{{ order.method || '人工处理' }}</dd>
          <dt class="text-amber-text-muted">订单号</dt>
          <dd class="flex items-center gap-2 font-mono text-amber-dark">
            {{ order.id }}
            <button
              class="yy-action text-[9px] text-amber-text-muted hover:text-amber-dark"
              type="button"
              @click="emit('copy', order.id, 'orderId')"
            >
              {{ copiedField === 'orderId' ? '已复制' : '复制' }}
            </button>
          </dd>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import StatusBadge, { type StatusBadgeTone } from '../../shared/components/data/StatusBadge.vue'
import type { BookingOrder } from '../../shared/stores/appStore'

defineProps<{
  order: BookingOrder
  statusClass: string
  paymentTone: StatusBadgeTone
  copiedField: string
}>()

const emit = defineEmits<{
  copy: [value: string, key: string]
}>()
</script>
