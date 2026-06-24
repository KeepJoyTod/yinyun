<template>
  <div class="w-full overflow-x-auto">
    <div class="grid min-w-[1150px] grid-cols-[220px_220px_120px_90px_120px_120px_240px] bg-amber-bg/40 border-b border-amber-topbar-border px-[21px] py-[14px]">
      <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">链接</div>
      <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">客户 / 产品</div>
      <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">已选 / 加片</div>
      <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">访问次数</div>
      <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">有效期至</div>
      <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px]">状态</div>
      <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px] text-right">操作</div>
    </div>

    <div
      v-for="link in links"
      :key="link.id"
      class="yy-clickable-row grid min-w-[1150px] grid-cols-[220px_220px_120px_90px_120px_120px_240px] px-[21px] py-[14px] border-b border-amber-topbar-border hover:bg-black/[0.01] transition-colors"
    >
      <div class="text-[11.375px] font-mono text-amber-dark leading-[17.06px] truncate">
        {{ link.display }}
      </div>

      <div class="min-w-0">
        <div class="text-[11.375px] font-sans font-medium text-amber-dark leading-[17.06px] truncate">{{ link.customer }} · {{ link.phone }}</div>
        <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] leading-[15px] truncate">{{ link.product }}</div>
      </div>

      <div class="text-[11.375px] font-mono leading-[17.06px]">
        <span :class="link.selectedCount > 0 ? 'text-amber-dark' : 'text-amber-text-muted'">{{ link.selectedCount }}</span>
        <span class="text-amber-text-muted"> / </span>
        <span
          :class="link.extraCount > 0 ? 'text-amber-accent font-semibold' : 'text-amber-text-muted'"
        >+{{ link.extraCount }}</span>
        <div v-if="link.extraCount > 0" class="text-[9px] font-sans text-amber-accent uppercase tracking-wider">有加片</div>
      </div>

      <div class="text-[11.375px] font-mono text-amber-dark leading-[17.06px]">
        {{ link.visits }}
      </div>

      <div class="leading-[17.06px]">
        <div class="text-[11.375px] font-mono" :class="isLinkExpiringSoon(link) ? 'text-amber-accent font-semibold' : 'text-amber-dark'">
          {{ link.expire }}
        </div>
        <div v-if="isLinkExpiringSoon(link)" class="text-[9px] font-sans text-amber-accent uppercase tracking-wider">
          剩 {{ Math.max(0, daysUntilExpire(link)) }} 天
        </div>
      </div>

      <div class="flex flex-col items-start gap-1">
        <span
          class="px-[10.5px] py-[3.5px] border rounded-md text-[10px] font-mono uppercase tracking-[0.18em] leading-[15px] bg-white/60"
          :class="linkStatusStyle(link)"
        >
          {{ linkActionLabel(link) }}
        </span>
        <span
          class="text-[9px] font-sans uppercase tracking-wider"
          :class="link.selectedCount > 0 ? 'text-[#2D7A4D]' : 'text-amber-text-muted'"
        >{{ link.selectedCount > 0 ? '客户已提交' : '未提交' }}</span>
      </div>

      <div class="flex items-center justify-end gap-2">
        <button
          class="yy-action px-3 py-1.5 border border-amber-topbar-border rounded-md text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] hover:bg-black/5 transition-all"
          @click="$emit('open-detail', link)"
          type="button"
        >
          查看
        </button>
        <button
          class="yy-action px-3 py-1.5 border border-amber-topbar-border rounded-md text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] hover:bg-black/5 transition-all"
          :disabled="copyingKey === `selection-${link.id}`"
          @click="$emit('copy-link', link.url, `selection-${link.id}`)"
          type="button"
        >
          {{ copyingKey === `selection-${link.id}` ? '复制中...' : copiedKey === `selection-${link.id}` ? '已复制' : '复制链接' }}
        </button>
        <button
          class="yy-action px-3 py-1.5 border border-amber-topbar-border rounded-md text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] hover:bg-black/5 transition-all disabled:opacity-45"
          :disabled="exportingLinkId === link.id"
          @click="$emit('export-result', link)"
          type="button"
        >
          {{ exportingLinkId === link.id ? '导出中...' : '导出结果' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SelectionLink } from '../../../shared/stores/appStore'

defineProps<{
  links: SelectionLink[]
  copyingKey: string | null
  copiedKey: string | null
  exportingLinkId: string | null
  daysUntilExpire: (link: SelectionLink) => number
  isLinkExpiringSoon: (link: SelectionLink) => boolean
  linkActionLabel: (link: SelectionLink) => string
  linkStatusStyle: (link: SelectionLink) => string
}>()

defineEmits<{
  'open-detail': [link: SelectionLink]
  'copy-link': [url: string, key: string]
  'export-result': [link: SelectionLink]
}>()
</script>
