<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 bg-[#1A1814]/40 backdrop-blur-sm flex items-start justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="yy-modal-panel w-full max-w-[420px] bg-amber-content-bg border border-amber-topbar-border rounded-md overflow-hidden shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] mt-[140px]">
        <div class="px-7 py-5 border-b border-amber-topbar-border flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">Rename</span>
            <h2 class="text-[17.5px] font-sans font-medium text-amber-dark leading-none tracking-tight">重命名底片</h2>
          </div>
          <button @click="$emit('close')" class="yy-action p-2 hover:bg-black/5 rounded-md transition-all" type="button" aria-label="关闭重命名">
            <img src="../../../assets/icons/close.svg" class="w-3.5 h-3.5 opacity-40" />
          </button>
        </div>
        <div class="p-7 flex flex-col gap-3.5">
          <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">文件名</label>
          <input
            :value="modelValue"
            type="text"
            class="w-full px-3 py-2 bg-amber-content-bg border border-amber-topbar-border rounded-md text-[11.375px] font-mono text-amber-dark/80 focus:outline-none focus:border-amber-dark/30"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
            @keydown.enter.prevent="$emit('apply')"
          />
        </div>
        <div class="px-7 py-5 bg-amber-content-bg border-t border-amber-topbar-border flex items-center justify-end gap-3.5">
          <button @click="$emit('close')" class="yy-action px-6 py-2 text-[11px] font-sans font-medium text-amber-text-muted hover:text-amber-dark transition-colors" type="button">取消</button>
          <button
            class="yy-action px-6 py-2 bg-amber-dark text-[#F4EFE6] rounded-md text-[11px] font-sans font-medium hover:bg-black transition-all"
            @click="$emit('apply')"
            type="button"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  modelValue: string
}>()

defineEmits<{
  close: []
  apply: []
  'update:modelValue': [value: string]
}>()
</script>
