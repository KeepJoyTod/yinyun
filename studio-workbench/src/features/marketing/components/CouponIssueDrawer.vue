<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm">
      <form class="w-full max-w-[620px] overflow-hidden border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border px-6 py-5">
          <div>
            <div class="text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">Coupon Issuance</div>
            <h2 class="mt-1 text-[18px] font-semibold text-amber-dark">发券</h2>
            <p class="mt-1 text-[11px] text-amber-text-muted">{{ templateName || '请选择券模板' }}</p>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('close')">关闭</button>
        </div>

        <div class="grid gap-4 px-6 py-5">
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">发券客户</span>
            <select v-model="draft.customerIds" multiple required class="min-h-[140px] border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark outline-none">
              <option v-for="customer in customers" :key="customer.backendId" :value="customer.backendId">{{ customer.name }} / {{ customer.mobile }}</option>
            </select>
          </label>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-medium text-amber-dark">发券来源</span>
              <input v-model="draft.issueSource" required class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
            </label>
            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-medium text-amber-dark">每人张数</span>
              <input v-model.number="draft.issueCount" min="1" required type="number" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
            </label>
          </div>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">备注</span>
            <textarea v-model="draft.remark" rows="3" class="border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark outline-none"></textarea>
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
          <button class="yy-action px-4 py-2 text-[11px] text-amber-text-muted hover:text-amber-dark" type="button" @click="$emit('close')">取消</button>
          <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="submit" :disabled="submitting">
            {{ submitting ? '发券中...' : '确认发券' }}
          </button>
        </div>
      </form>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { CustomerInfo } from '../../../shared/stores/appStore'
import type { CouponIssueDraft } from '../composables/useCouponIssuance'

const props = defineProps<{
  show: boolean
  templateName?: string
  initialDraft: CouponIssueDraft
  customers: CustomerInfo[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [draft: CouponIssueDraft]
}>()

const draft = reactive<CouponIssueDraft>({ ...props.initialDraft })

watch(
  () => [props.show, props.initialDraft],
  () => Object.assign(draft, props.initialDraft, { customerIds: [...props.initialDraft.customerIds] }),
  { immediate: true, deep: true },
)

const submit = () => {
  emit('submit', { ...draft, customerIds: [...draft.customerIds] })
}
</script>
