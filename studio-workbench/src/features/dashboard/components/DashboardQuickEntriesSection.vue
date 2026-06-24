<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-amber-dark leading-[1.2] tracking-tight">快捷入口</h2>
        <p class="text-[13px] text-amber-text-muted mt-1.5 font-medium">客户预约 / 选片 / 取片地址，复制后发给客户</p>
      </div>
      <button
        class="yy-action text-[11px] font-sans font-normal text-amber-text-muted hover:text-amber-dark transition-colors uppercase tracking-[0.1em]"
        type="button"
        @click="$emit('go-share-links')"
      >
        前往二维码管理 ↗
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <article
        v-for="entry in entries"
        :key="entry.key"
        class="yy-surface bg-amber-content-bg border border-amber-topbar-border/70 rounded-md shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        role="button"
        tabindex="0"
        @click="$emit('open-entry', entry.key)"
        @keydown.enter.prevent="$emit('open-entry', entry.key)"
      >
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[15px] font-sans font-semibold text-amber-dark">{{ entry.label }}</span>
            <span class="border border-amber-topbar-border/60 bg-black/[0.02] px-2 py-0.5 rounded-md text-[11px] font-sans text-amber-text-muted">{{ entry.key === 'booking' ? '预约' : entry.key === 'selection' ? '选片' : '取片' }}</span>
          </div>
          <p class="mt-1.5 text-[13px] font-sans text-amber-text-muted leading-relaxed">{{ entry.hint }}</p>
        </div>
        <div class="mt-4">
          <div v-if="entry.url" class="flex items-center gap-2">
            <span class="min-w-0 flex-1 truncate border border-amber-topbar-border bg-[#FBF8F2] px-2.5 py-1.5 rounded-md text-[12px] font-mono text-amber-dark">{{ entry.url }}</span>
            <button
              class="yy-action shrink-0 border border-amber-topbar-border bg-amber-content-bg px-3 py-1.5 rounded-md text-[12px] font-sans font-medium text-amber-text-muted hover:text-amber-dark"
              type="button"
              @click.stop="$emit('copy-entry', entry.key, entry.url)"
            >{{ copiedEntryKey === entry.key ? '已复制' : '复制' }}</button>
          </div>
          <div v-else class="border border-dashed border-amber-topbar-border bg-[#FBF8F2]/60 px-3 py-2.5 rounded-md text-[12px] font-sans leading-relaxed text-amber-text-muted">
            点击进入对应工具页，按门店生成二维码或复制客户入口。
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
type DashboardQuickEntry = {
  key: string
  label: string
  url: string
  hint: string
}

defineProps<{
  entries: DashboardQuickEntry[]
  copiedEntryKey: string
}>()

defineEmits<{
  'go-share-links': []
  'open-entry': [entryKey: string]
  'copy-entry': [key: string, url: string]
}>()
</script>
