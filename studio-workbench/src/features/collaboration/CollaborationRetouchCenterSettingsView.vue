<template>
  <CollaborationSettingsPageShell
    eyebrow="Retouch Center"
    title="中央修图设置"
    description="维护中央修图的审片流程、信息隐藏策略、转派和异常退回规则。"
    :error="service.error"
  >
    <template #actions>
      <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" :disabled="service.saving" @click="save">
        {{ service.saving ? '保存中...' : '保存中央修图设置' }}
      </button>
    </template>

    <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article class="border border-amber-topbar-border bg-amber-content-bg p-5 text-[11px] text-amber-dark">
        <div class="space-y-4">
          <label class="flex items-center gap-2"><input v-model="draft.reviewFlowEnabled" type="checkbox" /> 启用审片流程</label>
          <label class="flex items-center gap-2"><input v-model="draft.transferEnabled" type="checkbox" /> 启用工单转派</label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">接单前产品信息隐藏</div>
            <select v-model="draft.productInfoMaskMode" class="h-9 w-full border border-amber-topbar-border px-3">
              <option v-for="option in productMaskModeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">异常退回动作</div>
            <select v-model="draft.fallbackAction" class="h-9 w-full border border-amber-topbar-border px-3">
              <option v-for="option in fallbackActionOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
        </div>
      </article>

      <article class="border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="mb-3 text-[11px] text-amber-dark">策略备注</div>
        <textarea v-model.trim="draft.remark" class="min-h-[220px] w-full border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark" />
      </article>
    </section>
  </CollaborationSettingsPageShell>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useServiceProduction } from '../service-production/composables/useServiceProduction'
import { createPolicyDraft, fallbackActionOptions, productMaskModeOptions, toPolicyPayload, type PolicyDraft } from '../service-production/serviceProductionOperations'
import CollaborationSettingsPageShell from './components/CollaborationSettingsPageShell.vue'

const service = useServiceProduction()
const draft = reactive<PolicyDraft>(createPolicyDraft())

const save = async () => {
  const next = await service.saveCollaborationPolicy(toPolicyPayload(draft))
  Object.assign(draft, createPolicyDraft(next))
}

onMounted(async () => {
  const next = await service.loadCollaborationPolicy()
  Object.assign(draft, createPolicyDraft(next))
})
</script>
