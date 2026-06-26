<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-[640px] border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl">
        <div class="border-b border-amber-topbar-border px-6 py-5">
          <div class="font-mono text-[11px] uppercase tracking-[0.28em] text-amber-text-muted">Service Group Form</div>
          <h3 class="mt-2 font-serif text-[21px] leading-none text-amber-dark">{{ editingId ? '编辑服务组' : '新增服务组' }}</h3>
        </div>
        <div class="grid grid-cols-2 gap-4 px-6 py-5 max-[720px]:grid-cols-1">
          <label class="grid gap-2 text-[12px] text-amber-text-muted">
            门店
            <select v-model="form.storeBackendId" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none">
              <option v-for="store in stores" :key="store.backendId" :value="store.backendId">
                {{ store.name }}
              </option>
            </select>
            <span v-if="errors.storeBackendId" class="text-[11px] text-[var(--color-status-danger)]">{{ errors.storeBackendId }}</span>
          </label>
          <label class="grid gap-2 text-[12px] text-amber-text-muted">
            编码
            <input v-model="form.code" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none" type="text" />
            <span v-if="errors.code" class="text-[11px] text-[var(--color-status-danger)]">{{ errors.code }}</span>
          </label>
          <label class="grid gap-2 text-[12px] text-amber-text-muted">
            名称
            <input v-model="form.name" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none" type="text" />
            <span v-if="errors.name" class="text-[11px] text-[var(--color-status-danger)]">{{ errors.name }}</span>
          </label>
          <label class="grid gap-2 text-[12px] text-amber-text-muted">
            状态
            <select v-model="form.status" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none">
              <option value="ACTIVE">启用</option>
              <option value="DISABLED">停用</option>
            </select>
          </label>
          <label class="grid gap-2 text-[12px] text-amber-text-muted">
            默认容量
            <input v-model.number="form.capacity" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none" min="0" type="number" />
          </label>
          <label class="grid gap-2 text-[12px] text-amber-text-muted">
            预计耗时
            <input v-model.number="form.durationMinutes" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none" min="0" step="5" type="number" />
          </label>
          <label class="grid gap-2 text-[12px] text-amber-text-muted">
            服务模式
            <select v-model="form.serviceMode" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none">
              <option value="HORIZONTAL">横向服务</option>
              <option value="VERTICAL">纵向服务</option>
            </select>
          </label>
          <label class="grid gap-2 text-[12px] text-amber-text-muted">
            排序
            <input v-model.number="form.sort" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none" min="0" type="number" />
          </label>
          <label class="grid gap-2 text-[12px] text-amber-text-muted sm:col-span-2">
            备注
            <input v-model="form.remark" class="h-10 border border-amber-topbar-border bg-[#F4EFE6] px-3 text-[13px] text-amber-dark outline-none" type="text" />
          </label>
        </div>
        <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
          <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[12px] text-amber-text-muted" type="button" @click="emit('close')">
            取消
          </button>
          <button class="yy-action bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6] disabled:bg-[#EAE4D8] disabled:text-amber-text-muted" :disabled="saving" type="button" @click="emit('submit')">
            {{ saving ? '保存中...' : '保存服务组' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { StoreInfo } from '../../../shared/stores/appStore'
import type { ServiceGroupFormDraft } from '../serviceGroupOperations'

defineProps<{
  open: boolean
  editingId: string | null
  form: ServiceGroupFormDraft
  errors: Record<string, string>
  stores: StoreInfo[]
  saving: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: []
}>()
</script>
