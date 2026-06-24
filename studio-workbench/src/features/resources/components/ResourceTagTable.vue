<template>
  <div class="overflow-x-auto border border-amber-topbar-border bg-amber-content-bg">
    <table class="w-full min-w-[760px] border-collapse text-left text-[12px]">
      <thead class="bg-amber-bg/15 text-amber-text-muted">
        <tr>
          <th class="px-4 py-3">标签名</th>
          <th class="px-4 py-3">资源数量</th>
          <th class="px-4 py-3">创建人</th>
          <th class="px-4 py-3">所属门店</th>
          <th class="px-4 py-3">创建时间</th>
          <th class="px-4 py-3">动作</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-amber-topbar-border/60">
        <tr v-for="row in rows" :key="row.id">
          <td class="px-4 py-3 font-medium text-amber-dark">{{ row.tagName }}</td>
          <td class="px-4 py-3">{{ row.resourceCount }}</td>
          <td class="px-4 py-3">{{ row.createBy || '-' }}</td>
          <td class="px-4 py-3">{{ row.storeName || '-' }}</td>
          <td class="px-4 py-3">{{ row.createTime || '-' }}</td>
          <td class="px-4 py-3">
            <div class="flex flex-wrap gap-2">
              <button class="yy-action border border-amber-topbar-border px-2 py-1 hover:bg-black/5" type="button" @click="$emit('openTag', row.id)">查看资源</button>
              <button class="yy-action border border-amber-topbar-border px-2 py-1 hover:bg-black/5" type="button" @click="$emit('rename', row)">重命名</button>
              <button class="yy-action border border-[#B8543B]/35 px-2 py-1 text-[#8C3E2C] hover:bg-[#F8E7E2]" type="button" @click="$emit('delete', row)">删除</button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ResourceTagDto } from '../../../shared/api/backend'
import type { BackendId } from '../../../shared/api/backendId'

defineProps<{
  rows: ResourceTagDto[]
}>()

defineEmits<{
  rename: [row: ResourceTagDto]
  delete: [row: ResourceTagDto]
  openTag: [id: BackendId]
}>()
</script>
