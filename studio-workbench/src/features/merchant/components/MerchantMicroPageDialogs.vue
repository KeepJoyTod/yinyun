<template>
  <div v-if="showTemplateDialog" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
    <div class="w-[640px] max-w-full bg-[#FBF8F2] p-6 shadow-2xl">
      <div class="flex items-center justify-between">
        <h3 class="text-[16px] font-semibold text-amber-dark">从模板中创建</h3>
        <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[12px] text-amber-dark" type="button" @click="closeTemplateDialog">
          关闭
        </button>
      </div>
      <div class="mt-4 grid gap-3 md:grid-cols-2">
        <button v-for="template in templates" :key="template.key" class="grid gap-2 border border-amber-topbar-border bg-white px-4 py-4 text-left hover:bg-[#FBF8F2]" type="button" @click="createFromTemplate(template.key)">
          <span class="text-[14px] font-semibold text-amber-dark">{{ template.label }}</span>
          <span class="text-[12px] text-amber-text-muted">{{ template.description }}</span>
        </button>
      </div>
    </div>
  </div>

  <div v-if="promotionPage" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
    <div class="w-[420px] max-w-full bg-[#FBF8F2] shadow-2xl">
      <div class="flex items-center justify-between border-b border-amber-topbar-border px-5 py-4">
        <h3 class="text-[15px] font-semibold text-amber-dark">推广</h3>
        <button class="yy-action text-[12px] text-amber-text-muted" type="button" @click="closePromotionDialog">关闭</button>
      </div>
      <div class="px-7 py-7 text-center">
        <h4 class="text-[17px] font-semibold text-amber-dark">二维码</h4>
        <div class="mx-auto mt-4 inline-flex bg-white p-3">
          <QrcodeVue :value="pageLink(promotionPage)" :size="132" level="M" render-as="canvas" />
        </div>
        <div class="mt-5 flex items-center">
          <input class="h-9 min-w-0 flex-1 border border-amber-topbar-border bg-white px-3 font-mono text-[11px] text-amber-dark outline-none" :value="pageLink(promotionPage)" readonly />
          <button class="yy-action h-9 border border-l-0 border-amber-topbar-border px-3 text-[12px] text-amber-dark hover:bg-white" type="button" @click="copyLink(pageLink(promotionPage), 'promotion-link')">
            {{ copiedKey === 'promotion-link' ? '已复制' : '复制' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
    <div class="w-[360px] max-w-full bg-[#FBF8F2] p-6 shadow-2xl">
      <h3 class="text-[15px] font-semibold text-amber-dark">删除页面</h3>
      <p class="mt-3 text-[12px] leading-relaxed text-amber-text-muted">确认删除"{{ deleteTarget.pageTitle }}"？已发布页面删除后对外链接会失效。</p>
      <div class="mt-6 flex justify-end gap-2">
        <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted hover:bg-white" type="button" @click="closeDeleteDialog">取消</button>
        <button class="yy-action bg-[#B8543B] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#963726]" type="button" @click="confirmDelete">删除</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'
import type { MicroPageDto } from '../../../shared/api/backend'

type TemplateKey = 'campaign' | 'product'

defineProps<{
  showTemplateDialog: boolean
  templates: ReadonlyArray<{ key: TemplateKey; label: string; description: string }>
  promotionPage: MicroPageDto | null
  deleteTarget: MicroPageDto | null
  copiedKey: string
  pageLink: (page: Pick<MicroPageDto, 'id' | 'linkKey' | 'storeId'>) => string
  copyLink: (link: string, key: string) => void | Promise<void>
  createFromTemplate: (key: TemplateKey) => void
  closeTemplateDialog: () => void
  closePromotionDialog: () => void
  closeDeleteDialog: () => void
  confirmDelete: () => void | Promise<void>
}>()
</script>
