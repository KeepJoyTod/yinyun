<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-amber-dark leading-[1.2] tracking-tight">库存冲突提醒</h2>
        <p class="text-[13px] text-amber-text-muted mt-1.5 font-medium">{{ selectedDateLabel }} · 同一服务组多渠道重叠时段</p>
      </div>
      <button
        class="yy-action text-[11px] font-sans font-normal text-amber-text-muted hover:text-amber-dark transition-colors uppercase tracking-[0.1em]"
        type="button"
        @click="$emit('open-inventory')"
      >
        前往时段库存 ↗
      </button>
    </div>

    <div class="bg-amber-content-bg border border-amber-topbar-border/70 rounded-lg shadow-sm overflow-hidden">
      <StateView
        :empty="items.length === 0"
        empty-title="今日无库存冲突"
        empty-hint="各服务组当前未出现多渠道时段重叠，库存充足。"
      >
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-amber-bg/10 border-b border-amber-topbar-border text-left">
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-amber-text-muted">门店 / 服务组</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-amber-text-muted">时段</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-amber-text-muted">冲突数</th>
              <th class="px-7 py-3 text-[11px] font-sans font-medium text-amber-text-muted">说明</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-topbar-border/50">
            <tr
              v-for="item in items"
              :key="item.backendId"
              class="yy-clickable-row hover:bg-[#F8E7E2]/40"
              @click="$emit('open-inventory', item)"
            >
              <td class="px-7 py-3.5">
                <div class="text-[11.5px] font-sans font-medium text-amber-dark">{{ item.storeName }}</div>
                <div class="text-[10px] font-sans text-amber-text-muted mt-0.5">{{ item.serviceGroupName }}</div>
              </td>
              <td class="px-7 py-3.5 text-[11px] font-mono text-amber-dark">{{ item.window }}</td>
              <td class="px-7 py-3.5">
                <StatusBadge :label="`${item.conflictCount} 处冲突`" tone="danger" />
              </td>
              <td class="px-7 py-3.5 text-[10.5px] font-sans text-amber-text-muted leading-relaxed">{{ item.remark || '需人工确认或改期' }}</td>
            </tr>
          </tbody>
        </table>
      </StateView>
    </div>
  </section>
</template>

<script setup lang="ts">
import StateView from '../../../shared/components/feedback/StateView.vue'
import StatusBadge from '../../../shared/components/data/StatusBadge.vue'

export type DashboardInventoryConflictItem = {
  backendId: string
  storeName: string
  serviceGroupName: string
  window: string
  conflictCount: number
  remark?: string
}

defineProps<{
  selectedDateLabel: string
  items: DashboardInventoryConflictItem[]
}>()

defineEmits<{
  'open-inventory': [item?: DashboardInventoryConflictItem]
}>()
</script>
