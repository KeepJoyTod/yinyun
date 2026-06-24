<template>
  <div v-if="form" class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
    <div ref="promotionPanel" class="w-[420px] max-w-full bg-[#FBF8F2] shadow-2xl">
      <div class="flex items-center justify-between border-b border-amber-topbar-border px-5 py-4">
        <h3 class="text-[15px] font-semibold text-amber-dark">推广</h3>
        <button class="yy-action inline-flex h-8 w-8 items-center justify-center text-amber-text-muted hover:bg-white" type="button" @click="emit('close')" aria-label="关闭推广弹窗">
          <X :size="16" :stroke-width="1.9" />
        </button>
      </div>
      <div class="px-7 py-7 text-center">
        <h4 class="text-[17px] font-semibold text-amber-dark">二维码</h4>
        <div class="mx-auto mt-4 inline-flex bg-white p-3">
          <QrcodeVue :value="link" :size="132" level="M" render-as="canvas" />
        </div>
        <div class="mt-4 text-[12px] text-amber-text-muted">默认态：普通推广二维码，可追踪来源参数。</div>
        <div class="mt-4">
          <button class="yy-action inline-flex items-center gap-2 bg-[#F58235] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#D96C25]" type="button" @click="downloadQr">
            <Download :size="14" :stroke-width="1.9" />
            下载
          </button>
        </div>
        <div class="mt-5 flex items-center">
          <input class="h-9 min-w-0 flex-1 border border-amber-topbar-border bg-white px-3 font-mono text-[11px] text-amber-dark outline-none" :value="link" readonly />
          <button class="yy-action h-9 border border-l-0 border-amber-topbar-border px-3 text-[12px] text-amber-dark hover:bg-white" type="button" @click="emit('copy', link, 'promotion-link')">
            {{ copiedKey === 'promotion-link' ? '已复制' : '复制' }}
          </button>
        </div>
        <button class="yy-action mt-7 w-full border border-[#F58235] px-4 py-2 text-[12px] font-semibold text-[#C65F2D] hover:bg-white" type="button" @click="emit('create-fan-qr')">
          创建吸粉二维码
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import QrcodeVue from 'qrcode.vue'
import { Download, X } from 'lucide-vue-next'
import type { MicroFormDto } from '../../../shared/api/backend'

const props = defineProps<{
  form: MicroFormDto | null
  link: string
  copiedKey: string
}>()

const emit = defineEmits<{
  close: []
  copy: [link: string, key: string]
  'create-fan-qr': []
  'download-error': [message: string]
}>()

const promotionPanel = ref<HTMLElement | null>(null)

const downloadQr = () => {
  const canvas = promotionPanel.value?.querySelector('canvas') as HTMLCanvasElement | null
  if (!canvas || !props.form) {
    emit('download-error', '二维码尚未渲染完成')
    return
  }
  const link = document.createElement('a')
  link.href = canvas.toDataURL('image/png')
  link.download = `micro-form-${props.form.id}-qr.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
}
</script>
