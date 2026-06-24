<template>
  <section class="space-y-4">
    <div class="flex items-end justify-between px-1">
      <div>
        <h2 class="text-[26px] font-sans font-bold text-ink leading-[1.2] tracking-tight">快捷入口</h2>
        <p class="text-[13px] text-ink-muted mt-1.5 font-medium">客户预约 / 选片 / 取片地址，复制后发给客户</p>
      </div>
      <button
        class="yy-action text-[11px] font-sans font-normal text-ink-muted hover:text-ink transition-colors uppercase tracking-[0.1em]"
        type="button"
        @click="$emit('go-share-links')"
      >
        前往二维码管理 ↗
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3 yy-stagger">
      <article
        v-for="entry in entries"
        :key="entry.key"
        class="yy-double-bezel p-5 flex flex-col justify-between hover:-translate-y-0.5 cursor-pointer"
        role="button"
        tabindex="0"
        @click="$emit('open-entry', entry.key)"
        @keydown.enter.prevent="$emit('open-entry', entry.key)"
      >
        <div>
          <div class="flex items-center justify-between">
            <span class="text-[15px] font-sans font-semibold text-ink">{{ entry.label }}</span>
            <span class="border border-hairline/60 bg-black/[0.02] px-2 py-0.5 rounded-md text-[11px] font-sans text-ink-muted">{{ entry.key === 'booking' ? '预约' : entry.key === 'selection' ? '选片' : '取片' }}</span>
          </div>
          <p class="mt-1.5 text-[13px] font-sans text-ink-muted leading-relaxed">{{ entry.hint }}</p>
        </div>
        <div class="mt-4">
          <div v-if="entry.url" class="flex items-center gap-2">
            <span class="min-w-0 flex-1 truncate border border-hairline bg-canvas px-2.5 py-1.5 rounded-md text-[12px] font-mono text-ink">{{ entry.url }}</span>
            <button
              class="yy-action shrink-0 border border-hairline bg-surface-1 px-3 py-1.5 rounded-md text-[12px] font-sans font-medium text-ink-muted hover:text-ink"
              type="button"
              @click.stop="$emit('copy-entry', entry.key, entry.url)"
            >{{ copiedEntryKey === entry.key ? '已复制' : '复制' }}</button>
          </div>
          <div v-else class="border border-dashed border-hairline bg-canvas px-3 py-2.5 rounded-md text-[12px] font-sans leading-relaxed text-ink-muted">
            点击进入对应工具页，按门店生成二维码或复制客户入口。
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
type QuickEntry = {
  key: string
  label: string
  url: string
  hint: string
}

defineProps<{
  entries: QuickEntry[]
  copiedEntryKey: string
}>()

defineEmits<{
  'go-share-links': []
  'open-entry': [entryKey: string]
  'copy-entry': [key: string, url: string]
}>()
</script>
