<template>
  <Transition name="fade">
    <div
      v-if="open && link"
      class="fixed inset-0 z-50 bg-[#1A1814]/40 backdrop-blur-sm flex items-start justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="yy-modal-panel w-full max-w-[588px] bg-amber-content-bg border border-amber-topbar-border rounded-md overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] mt-[70.66px]">
        <div class="px-7 py-5 border-b border-amber-topbar-border flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">Selection Link</span>
            <h2 class="text-[17.5px] font-sans font-medium text-amber-dark leading-[24.5px] tracking-[-0.01em]">查看链接</h2>
            <p class="text-[10.5px] font-sans text-amber-text-muted leading-[15.75px] mt-[3.5px] opacity-70">二维码与复制链接可直接分享给客户</p>
          </div>
          <button @click="$emit('close')" class="yy-action p-2 hover:bg-black/5 rounded-md transition-all" type="button" aria-label="关闭选片链接详情">
            <img src="../../../assets/icons/close.svg" class="w-3.5 h-3.5 opacity-40" />
          </button>
        </div>

        <div class="p-7 flex flex-col gap-6">
          <div class="grid grid-cols-2 gap-x-3.5 gap-y-4">
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">客户</span>
              <span class="text-[11.375px] font-sans font-medium text-amber-dark">{{ link.customer }} · {{ link.phone }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">产品</span>
              <span class="text-[11.375px] font-sans font-medium text-amber-dark">{{ link.product }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">进度</span>
              <span class="text-[11.375px] font-mono text-amber-dark">{{ link.selectedCount }} / +{{ link.extraCount }}</span>
            </div>
            <div class="flex flex-col gap-1.5">
              <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">有效期</span>
              <span class="text-[11.375px] font-mono text-amber-dark">{{ link.expire }}</span>
            </div>
          </div>

          <div class="p-4 bg-amber-bg/20 border border-amber-topbar-border rounded-md flex items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">链接</div>
              <div class="text-[11.375px] font-mono text-amber-dark leading-[17.06px] mt-1 truncate">{{ link.url }}</div>
            </div>
            <button
              class="yy-action px-4 py-2 bg-amber-dark text-[#F4EFE6] rounded-md text-[10px] font-mono uppercase tracking-[0.18em] hover:bg-black transition-all"
              :disabled="copyingKey === `selection-${link.id}`"
              @click="$emit('copy-link', link.url, `selection-${link.id}`)"
              type="button"
            >
              {{ copyingKey === `selection-${link.id}` ? '复制中...' : copiedKey === `selection-${link.id}` || copied ? '已复制' : '复制链接' }}
            </button>
          </div>

          <div class="grid grid-cols-[auto_1fr] items-start gap-6 max-[560px]:grid-cols-1">
            <div class="p-3 bg-amber-content-bg border border-amber-topbar-border rounded-md" ref="qrWrap">
              <QrcodeVue :value="link.url" :size="168" :margin="1" level="M" render-as="canvas" />
            </div>

            <div class="flex-1 flex flex-col gap-3">
              <div class="text-[10.5px] font-sans text-amber-text-muted leading-[15.75px]">
                建议客户使用微信扫码打开链接进行选片，或直接复制链接在浏览器打开。链接有效期至 {{ link.expire }}，过期前可催客户完成确认。
              </div>
              <div class="grid grid-cols-2 gap-2 max-[560px]:grid-cols-1">
                <div class="border border-amber-topbar-border bg-white/45 p-3">
                  <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">访问</div>
                  <div class="mt-1 text-[13px] font-mono text-amber-dark">{{ link.visits }} 次</div>
                </div>
                <div class="border border-amber-topbar-border bg-white/45 p-3">
                  <div class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">下一步</div>
                  <div class="mt-1 text-[13px] font-sans text-amber-dark">{{ actionLabel }}</div>
                </div>
              </div>
              <button
                class="yy-action px-4 py-2 border border-amber-topbar-border rounded-md text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] hover:bg-black/5 transition-all"
                @click="downloadQr()"
                type="button"
              >
                下载二维码
              </button>
              <button
                class="yy-action px-4 py-2 border border-amber-topbar-border rounded-md text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em] hover:bg-black/5 transition-all disabled:opacity-45"
                :disabled="exporting"
                @click="$emit('export-result', link)"
                type="button"
              >
                {{ exporting ? '导出中...' : '导出选择结果' }}
              </button>
            </div>
          </div>
        </div>

        <div class="px-7 py-5 border-t border-amber-topbar-border flex items-center justify-end gap-3.5 bg-amber-content-bg">
          <button
            class="yy-action px-6 py-2 text-[11px] font-sans font-medium text-amber-text-muted hover:text-amber-dark transition-colors"
            @click="$emit('close')"
            type="button"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import type { SelectionLink } from '../../../shared/stores/appStore'

defineProps<{
  open: boolean
  link: SelectionLink | null
  copied: boolean
  copyingKey: string | null
  copiedKey: string | null
  exporting: boolean
  actionLabel: string
}>()

const emit = defineEmits<{
  close: []
  'copy-link': [url: string, key: string]
  'export-result': [link: SelectionLink]
  'qr-downloaded': []
}>()

const qrWrap = ref<HTMLElement | null>(null)

const downloadQr = () => {
  const wrap = qrWrap.value
  if (!wrap) return
  const canvas = wrap.querySelector('canvas') as HTMLCanvasElement | null
  if (!canvas) return
  const url = canvas.toDataURL('image/png')
  const a = document.createElement('a')
  a.href = url
  a.download = 'selection-link.png'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  emit('qr-downloaded')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
