<template>
  <CollaborationSettingsPageShell
    eyebrow="Common Config"
    title="通用设置"
    description="维护自动派单模式、门店启用范围和男女妆面业绩系数。"
    :error="service.error"
  >
    <template #actions>
      <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" :disabled="service.saving" @click="save">
        {{ service.saving ? '保存中...' : '保存通用设置' }}
      </button>
    </template>

    <section class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <article class="border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="space-y-4 text-[11px] text-amber-dark">
          <label class="block">
            <div class="mb-1 text-amber-text-muted">自动派单模式</div>
            <select v-model="draft.autoDispatchMode" class="h-9 w-full border border-amber-topbar-border px-3">
              <option v-for="option in autoDispatchModeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label class="flex items-center gap-2"><input v-model="draft.genderMakeupEnabled" type="checkbox" /> 区分男女妆面</label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">女妆业绩系数</div>
            <input v-model.number="draft.femaleMakeupRatio" class="h-9 w-full border border-amber-topbar-border px-3" min="0" step="0.1" type="number" />
          </label>
        </div>
      </article>

      <article class="border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="mb-3 text-[11px] text-amber-dark">启用门店范围</div>
        <div class="space-y-2 text-[11px] text-amber-dark">
          <label v-for="store in appStore.stores" :key="store.id" class="flex items-center gap-2">
            <input :checked="draft.enabledStoreIds.includes(store.id)" type="checkbox" @change="toggleStore(store.id)" />
            {{ store.name }}
          </label>
        </div>
      </article>
    </section>
  </CollaborationSettingsPageShell>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import { useServiceProduction } from '../service-production/composables/useServiceProduction'
import { autoDispatchModeOptions, createPolicyDraft, toPolicyPayload, type PolicyDraft } from '../service-production/serviceProductionOperations'
import CollaborationSettingsPageShell from './components/CollaborationSettingsPageShell.vue'

const service = useServiceProduction()
const draft = reactive<PolicyDraft>(createPolicyDraft())

const toggleStore = (storeId: string) => {
  draft.enabledStoreIds = draft.enabledStoreIds.includes(storeId)
    ? draft.enabledStoreIds.filter(item => item !== storeId)
    : [...draft.enabledStoreIds, storeId]
}

const save = async () => {
  const next = await service.saveCollaborationPolicy(toPolicyPayload(draft))
  Object.assign(draft, createPolicyDraft(next))
}

onMounted(async () => {
  await service.ensureStores()
  const next = await service.loadCollaborationPolicy()
  Object.assign(draft, createPolicyDraft(next))
})
</script>
