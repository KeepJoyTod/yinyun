<template>
  <aside class="min-w-0">
    <div class="mb-3 flex items-center gap-2 text-[12px] text-[#C65F2D]">
      <span class="shrink-0 font-semibold">微信/H5 链接</span>
      <input class="h-8 min-w-0 flex-1 border border-amber-topbar-border bg-white px-2 font-mono text-[11px] text-amber-dark outline-none" :value="selectedLink" readonly />
      <button class="yy-action inline-flex h-8 items-center gap-1 border border-amber-topbar-border px-2 text-[11px] text-amber-text-muted hover:bg-white" type="button" @click="copySelectedLink">
        复制
      </button>
    </div>

    <div class="mx-auto w-[336px] max-w-full rounded-[34px] border-[6px] border-[#DFDFDF] bg-[#F5F5F5] p-4 shadow-[0_20px_45px_rgba(23,18,12,0.08)]">
      <div class="mx-auto mb-4 h-2 w-20 rounded-full bg-[#D7D7D7]" />
      <div class="overflow-hidden rounded-[24px] border border-[#E5E0D8] bg-white">
        <div class="flex h-10 items-center justify-between border-b border-[#EEE8DE] px-4 text-[11px] text-amber-dark">
          <span>9:41</span>
          <span class="font-semibold">100%</span>
        </div>
        <div class="h-[520px] overflow-hidden" :style="{ backgroundColor: previewPage?.backgroundColor || '#F7F7F7' }">
          <div v-if="previewPage" class="h-full overflow-y-auto">
            <MicroPageRenderer
              :components="previewComponents"
              :cover-url="previewPage.coverUrl"
              :page-desc="previewPage.pageDesc"
              :page-title="previewPage.pageTitle"
              preview
            />
          </div>
          <div v-else class="flex h-full items-center justify-center px-8 text-center text-[12px] leading-relaxed text-amber-text-muted">
            请选择要预览的页面
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import MicroPageRenderer from '../../public/components/MicroPageRenderer.vue'
import type { MicroPageComponentSchema, MicroPageDto } from '../../../shared/api/backend'

defineProps<{
  previewPage: MicroPageDto | null
  previewComponents: MicroPageComponentSchema[]
  selectedLink: string
  copySelectedLink: () => void
}>()
</script>
