<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">库存冲突提醒</h2>
        <p class="text-[13px] text-ink-muted mt-1.5 font-medium">{{ dateLabel }} · 同一服务组多渠道重叠时段</p>
      </div>
      <button
        class="yy-action text-[11px] font-sans font-normal text-ink-muted hover:text-ink transition-colors uppercase tracking-[0.1em]"
        type="button"
        @click="$emit('go-inventory')"
      >
        前往时段库存 ↗
      </button>
    </div>
    <div class="bg-surface-1 border border-hairline/70 rounded-xl shadow-sm overflow-hidden">
      <StateView
        :empty="conflicts.length === 0"
        empty-title="今日无库存冲突"
        empty-hint="各服务组当前未出现多渠道时段重叠，库存充足。"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-canvas/10 border-b border-hairline text-left">
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-ink-muted">门店 / 服务组</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-ink-muted">时段</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-ink-muted">冲突数</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-ink-muted">说明</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-hairline/50">
            <tr
              v-for="item in conflicts"
              :key="item.backendId"
              class="yy-clickable-row hover:bg-status-danger-bg/40"
              @click="$emit('go-inventory-item', item)"
            >
              <td class="px-7 py-3.5">
                <div class="text-[11.5px] font-sans font-medium text-ink">{{ item.storeName }}</div>
                <div class="text-[10px] font-sans text-ink-muted mt-0.5">{{ item.serviceGroupName }}</div>
              </td>
              <td class="px-7 py-3.5 text-[11px] font-mono text-ink">{{ item.window }}</td>
              <td class="px-7 py-3.5">
                <StatusBadge :label="`${item.conflictCount} 处冲突`" tone="danger" />
              </td>
              <td class="px-7 py-3.5 text-[10.5px] font-sans text-ink-muted leading-relaxed">{{ item.remark || '需人工确认或改期' }}</td>
            </tr>
          </tbody>
        </table>
      </StateView>
    </div>
  </section>
</template>

<script setup lang="ts">
import StateView from '../../shared/components/feedback/StateView.vue'
import StatusBadge from '../../shared/components/data/StatusBadge.vue'

defineProps<{
  dateLabel: string
  conflicts: Array<{ backendId: string; storeName: string; serviceGroupName: string; window: string; conflictCount: number; remark: string }>
}>()

defineEmits<{
  'go-inventory': []
  'go-inventory-item': [item: { backendId: string; storeName: string; serviceGroupName: string }]
}>()
</script>