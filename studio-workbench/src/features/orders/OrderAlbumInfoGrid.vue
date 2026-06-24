<template>
  <dl class="grid grid-cols-[72px_1fr] gap-x-3 gap-y-2 text-[11px]">
    <dt class="text-amber-text-muted">相册号</dt>
    <dd class="font-mono text-amber-dark">{{ album.id }}</dd>
    <dt class="text-amber-text-muted">摄影师</dt>
    <dd class="text-amber-dark">{{ album.photographer || '未指派' }}</dd>
    <dt class="text-amber-text-muted">进度</dt>
    <dd class="text-amber-dark">{{ album.selectedCount }} / {{ album.totalCount }} 已选</dd>
    <dt class="text-amber-text-muted">状态</dt>
    <dd>
      <span class="px-2 py-0.5 text-[10.5px]" :class="statusClass">{{ album.status }}</span>
    </dd>
  </dl>
</template>

<script setup lang="ts">
import type { Album } from '../../shared/stores/appStore'

defineProps<{
  album: Pick<Album, 'id' | 'photographer' | 'selectedCount' | 'totalCount' | 'status'>
  statusClass: string
}>()
</script>
