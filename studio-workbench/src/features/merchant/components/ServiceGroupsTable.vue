<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[980px] border-collapse">
      <thead class="bg-[#F4EFE6]/70 text-left text-[12px] text-amber-text-muted">
        <tr>
          <th class="px-5 py-3 font-normal">服务组名称</th>
          <th class="px-5 py-3 font-normal">所属门店</th>
          <th class="px-5 py-3 font-normal">服务模式</th>
          <th class="px-5 py-3 font-normal">适用产品</th>
          <th class="px-5 py-3 font-normal">预计耗时</th>
          <th class="px-5 py-3 font-normal">默认容量</th>
          <th class="px-5 py-3 font-normal">状态</th>
          <th class="px-5 py-3 font-normal">更新时间</th>
          <th class="px-5 py-3 font-normal">操作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-amber-topbar-border/55">
        <tr v-for="group in groups" :key="group.backendId" class="hover:bg-black/[0.015]">
          <td class="px-5 py-4">
            <div class="text-[13px] font-semibold text-amber-dark">{{ group.name }}</div>
            <div class="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-amber-text-muted">{{ group.code }}</div>
          </td>
          <td class="px-5 py-4 text-[12px] text-amber-dark">{{ group.storeName }}</td>
          <td class="px-5 py-4">
            <span class="bg-[#EAE4D8] px-2 py-1 text-[11px] text-amber-dark">{{ serviceMode(group) }}</span>
          </td>
          <td class="px-5 py-4 text-[12px] text-amber-dark">{{ productHint(group) }}</td>
          <td class="px-5 py-4 font-mono text-[12px] text-amber-dark">{{ group.durationMinutes }} 分钟</td>
          <td class="px-5 py-4 font-mono text-[12px] text-amber-dark">{{ group.capacity }} 工位</td>
          <td class="px-5 py-4">
            <span class="px-2 py-1 text-[11px]" :class="group.status === 'ACTIVE' ? 'bg-[var(--color-status-done-bg)] text-[var(--color-status-done)]' : 'bg-[var(--color-status-neutral-bg)] text-[var(--color-status-neutral)]'">
              {{ group.status === 'ACTIVE' ? '启用' : '停用' }}
            </span>
          </td>
          <td class="px-5 py-4 font-mono text-[12px] text-amber-text-muted">{{ updatedAtHint(group) }}</td>
          <td class="px-5 py-4">
            <div class="flex items-center gap-3 text-amber-text-muted">
              <button class="yy-action inline-flex h-7 w-7 items-center justify-center disabled:opacity-40" type="button" aria-label="编辑服务组" :disabled="isRowBusy(group.backendId)" @click="emit('edit', group)">
                <Pencil :size="14" :stroke-width="1.8" />
              </button>
              <button class="yy-action inline-flex h-7 w-7 items-center justify-center disabled:opacity-40" type="button" aria-label="配置档期" :disabled="isRowBusy(group.backendId)" @click="emit('schedule', group)">
                <CalendarPlus :size="14" :stroke-width="1.8" />
              </button>
              <button class="yy-action inline-flex h-7 w-7 items-center justify-center disabled:opacity-40" type="button" aria-label="切换状态" :disabled="isRowBusy(group.backendId)" @click="emit('toggle', group)">
                <Power :size="14" :stroke-width="1.8" />
              </button>
              <button class="yy-action inline-flex h-7 w-7 items-center justify-center disabled:opacity-40" type="button" aria-label="删除服务组" :disabled="isRowBusy(group.backendId)" @click="emit('delete', group)">
                <Trash2 :size="14" :stroke-width="1.8" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="!groups.length" class="border-t border-amber-topbar-border px-6 py-10 text-center">
    <div class="font-serif text-[18px] text-amber-dark">当前筛选下没有服务组</div>
    <p class="mt-2 text-[12px] text-amber-text-muted">可以切换具体门店，或新增一个服务组后再配置容量与档期。</p>
  </div>
</template>

<script setup lang="ts">
import { CalendarPlus, Pencil, Power, Trash2 } from 'lucide-vue-next'
import type { ServiceGroupInfo } from '../../../shared/stores/appStore'

defineProps<{
  groups: ServiceGroupInfo[]
  serviceMode: (group: ServiceGroupInfo) => string
  productHint: (group: ServiceGroupInfo) => string
  updatedAtHint: (group: ServiceGroupInfo) => string
  isRowBusy: (backendId: string) => boolean
}>()

const emit = defineEmits<{
  edit: [group: ServiceGroupInfo]
  schedule: [group: ServiceGroupInfo]
  toggle: [group: ServiceGroupInfo]
  delete: [group: ServiceGroupInfo]
}>()
</script>
