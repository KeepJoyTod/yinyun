<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm">
      <div class="w-full max-w-[720px] overflow-hidden rounded-2xl border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border px-6 py-5">
          <div>
            <div class="text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">Album Workflow</div>
            <h2 class="mt-1 text-[18px] font-semibold text-amber-dark">{{ productName || '入册产品履约配置' }}</h2>
            <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">配置摄影、修图、选片审核和取件环节，补齐入册商品的订单履约字段。</p>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('close')">
            关闭
          </button>
        </div>

        <div class="grid gap-5 px-6 py-5">
          <div class="grid gap-3 md:grid-cols-3">
            <label v-for="item in switches" :key="item.key" class="rounded-xl border border-amber-topbar-border bg-white/70 px-4 py-3 text-[11px] text-amber-dark">
              <div class="flex items-center gap-2">
                <input v-model="draft[item.key]" type="checkbox" />
                <span class="font-medium">{{ item.label }}</span>
              </div>
            </label>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-medium text-amber-dark">妆面数</span>
              <input v-model.number="draft.makeupCount" min="0" class="h-10 rounded-xl border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" type="number" />
            </label>
            <label class="flex flex-col gap-2">
              <span class="text-[11px] font-medium text-amber-dark">出片时限（小时）</span>
              <input v-model.number="draft.deliverWithinHours" min="1" class="h-10 rounded-xl border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" type="number" />
            </label>
          </div>

          <div>
            <div class="text-[11px] font-medium text-amber-dark">履约节点</div>
            <div class="mt-3 grid gap-2 md:grid-cols-4">
              <label
                v-for="option in stageOptions"
                :key="option.code"
                class="flex items-center gap-2 rounded-xl border border-amber-topbar-border bg-white/70 px-3 py-2 text-[10.5px] text-amber-dark"
              >
                <input :checked="selectedStageCodes.includes(option.code)" type="checkbox" @change="toggleStage(option.code)" />
                <span>{{ option.label }}</span>
              </label>
            </div>
          </div>

          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">备注</span>
            <textarea v-model="draft.remark" rows="3" maxlength="180" class="rounded-xl border border-amber-topbar-border bg-white px-3 py-3 text-[11px] text-amber-dark outline-none"></textarea>
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
          <button class="yy-action px-4 py-2 text-[11px] text-amber-text-muted hover:text-amber-dark" type="button" @click="$emit('close')">取消</button>
          <button class="yy-action rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="button" :disabled="submitting" @click="submit">
            {{ submitting ? '保存中...' : '保存履约配置' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { CollaborationStageCode, ProductCollaborationConfigPayload } from '../../../shared/api/backend'
import { collaborationStageOptions, stringifyJson } from '../../collaboration/collaborationSettings'

const props = defineProps<{
  show: boolean
  submitting?: boolean
  productName?: string
  initialDraft: ProductCollaborationConfigPayload | null
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: ProductCollaborationConfigPayload]
}>()

const stageOptions = collaborationStageOptions

const draft = reactive<ProductCollaborationConfigPayload>({
  productId: '',
  workflowJson: stringifyJson({ stageCodes: ['RECEPTION', 'PHOTOGRAPHY', 'RETOUCH', 'SELECTION_REVIEW', 'PICKUP'] }),
  needMakeup: false,
  needPhotography: true,
  needRetouch: true,
  needReview: false,
  needSelectionReview: true,
  needPickup: true,
  makeupCount: 0,
  deliverWithinHours: 72,
  status: 'ACTIVE',
  remark: '',
})

const selectedStageCodes = computed<CollaborationStageCode[]>(() => {
  try {
    const parsed = JSON.parse(draft.workflowJson) as { stageCodes?: CollaborationStageCode[] }
    return Array.isArray(parsed.stageCodes) ? parsed.stageCodes : []
  } catch {
    return []
  }
})

watch(
  () => props.initialDraft,
  value => {
    if (!value) return
    Object.assign(draft, {
      ...value,
      remark: value.remark ?? '',
      status: value.status ?? 'ACTIVE',
    })
  },
  { immediate: true },
)

const switches: Array<{ key: keyof ProductCollaborationConfigPayload; label: string }> = [
  { key: 'needMakeup', label: '需要化妆' },
  { key: 'needPhotography', label: '需要摄影' },
  { key: 'needRetouch', label: '需要修图' },
  { key: 'needReview', label: '需要审片' },
  { key: 'needSelectionReview', label: '需要看片' },
  { key: 'needPickup', label: '需要取件' },
]

const toggleStage = (stage: CollaborationStageCode) => {
  const current = new Set(selectedStageCodes.value)
  if (current.has(stage)) current.delete(stage)
  else current.add(stage)
  draft.workflowJson = stringifyJson({ stageCodes: [...current] })
}

const submit = () => {
  emit('submit', {
    ...draft,
    workflowJson: stringifyJson({ stageCodes: selectedStageCodes.value }),
    deliverWithinHours: Math.max(1, Number(draft.deliverWithinHours) || 72),
    makeupCount: Math.max(0, Number(draft.makeupCount) || 0),
    remark: String(draft.remark ?? '').trim(),
  })
}
</script>
