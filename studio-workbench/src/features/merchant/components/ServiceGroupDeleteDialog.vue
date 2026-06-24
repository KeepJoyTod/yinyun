<template>
  <Transition name="fade">
    <div
      v-if="target"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-[420px] border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl">
        <div class="border-b border-amber-topbar-border px-6 py-5">
          <div class="font-mono text-[11px] uppercase tracking-[0.28em] text-amber-text-muted">Delete Service Group</div>
          <h3 class="mt-2 font-serif text-[21px] leading-none text-amber-dark">确认删除服务组</h3>
        </div>
        <div class="grid gap-3 px-6 py-5 text-[12px] leading-6 text-amber-dark">
          <p>确认删除"{{ target.name }}"？</p>
          <p class="text-amber-text-muted">如果服务组仍被其它业务使用，后端会直接返回原始错误提示。</p>
        </div>
        <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
          <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted" type="button" :disabled="busy" @click="emit('close')">
            取消
          </button>
          <button class="yy-action bg-[#B8543B] px-4 py-2 text-[12px] font-semibold text-white disabled:bg-[#EAE4D8] disabled:text-amber-text-muted" type="button" :disabled="busy" @click="emit('confirm')">
            {{ busy ? '删除中...' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { ServiceGroupInfo } from '../../../shared/stores/appStore'

defineProps<{
  target: ServiceGroupInfo | null
  busy: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>
