<template>
  <section
    class="rounded-3xl border border-sky-100 bg-sky-50/80 px-5 py-4 text-slate-900"
    data-testid="order-copy-panel"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div class="space-y-1">
        <p class="text-sm font-semibold text-slate-950">复制订单</p>
        <p class="text-xs leading-5 text-slate-600">
          复制客户、门店、服务组、订单属性和备注，支付、退款、外部渠道事实会重置，新单重新校验库存。
        </p>
      </div>
      <button
        type="button"
        class="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="saving"
        @click="emit('submit')"
      >
        {{ saving ? '复制中...' : '复制订单' }}
      </button>
    </div>

    <div class="mt-4 space-y-4">
      <div class="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          class="rounded-2xl border px-4 py-3 text-left transition"
          :class="scheduleMode === 'REUSE_SLOT'
            ? 'border-sky-500 bg-white text-slate-950 shadow-sm'
            : 'border-sky-100 bg-white/70 text-slate-600 hover:border-sky-300'"
          :disabled="!canReuseSourceSlot"
          @click="emit('updateScheduleMode', 'REUSE_SLOT')"
        >
          <div class="text-sm font-semibold">复用原时段</div>
          <p class="mt-1 text-xs leading-5">
            {{ canReuseSourceSlot ? '沿用原订单日期与时段，可再微调时间。' : '源订单没有完整时段，当前不可用。' }}
          </p>
        </button>
        <button
          type="button"
          class="rounded-2xl border px-4 py-3 text-left transition"
          :class="scheduleMode === 'UNDECIDED'
            ? 'border-sky-500 bg-white text-slate-950 shadow-sm'
            : 'border-sky-100 bg-white/70 text-slate-600 hover:border-sky-300'"
          @click="emit('updateScheduleMode', 'UNDECIDED')"
        >
          <div class="text-sm font-semibold">复制为待定档期</div>
          <p class="mt-1 text-xs leading-5">新单只保留业务信息，不占用任何时段库存。</p>
        </button>
      </div>

      <div v-if="scheduleMode === 'REUSE_SLOT'" class="grid gap-3 md:grid-cols-3">
        <label class="space-y-1">
          <span class="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">日期</span>
          <input
            type="date"
            class="w-full rounded-2xl border border-sky-100 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
            :value="date"
            @input="emit('updateDate', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <label class="space-y-1">
          <span class="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">开始时间</span>
          <input
            type="time"
            class="w-full rounded-2xl border border-sky-100 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
            :value="time"
            @input="emit('updateTime', ($event.target as HTMLInputElement).value)"
          >
        </label>
        <label class="space-y-1">
          <span class="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">时长(分钟)</span>
          <input
            type="number"
            min="15"
            step="15"
            class="w-full rounded-2xl border border-sky-100 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
            :value="durationMinutes"
            @input="emit('updateDurationMinutes', Number.parseInt(($event.target as HTMLInputElement).value || '60', 10) || 60)"
          >
        </label>
      </div>

      <label class="block space-y-1">
        <span class="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">复制备注</span>
        <textarea
          class="min-h-[88px] w-full rounded-2xl border border-sky-100 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400"
          :value="remark"
          placeholder="补充本次复制说明，会拼接到新订单备注。"
          @input="emit('updateRemark', ($event.target as HTMLTextAreaElement).value)"
        />
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  scheduleMode: 'REUSE_SLOT' | 'UNDECIDED'
  date: string
  time: string
  durationMinutes: number
  remark: string
  saving: boolean
  canReuseSourceSlot: boolean
}>()

const emit = defineEmits<{
  updateScheduleMode: [value: 'REUSE_SLOT' | 'UNDECIDED']
  updateDate: [value: string]
  updateTime: [value: string]
  updateDurationMinutes: [value: number]
  updateRemark: [value: string]
  submit: []
}>()
</script>
