<template>
  <CollaborationSettingsPageShell
    eyebrow="License Binding"
    title="开通设置"
    description="维护协作许可证有效期、续期策略与门店绑定范围。缺少许可证时仍可直接在这里补开或续期。"
    :error="error"
  >
    <template #actions>
      <div v-if="canEdit" class="flex items-center gap-2">
        <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-dark" type="button" @click="startCreate">
          新建许可证
        </button>
        <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" :disabled="saving || initializing" @click="saveLicense">
          {{ saving ? '保存中...' : '保存许可证' }}
        </button>
      </div>
    </template>

    <FeatureGateStatusCard :gate="gate" />

    <section v-if="canEdit" class="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <article class="border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="space-y-3 text-[11px] text-amber-dark">
          <label v-if="licenses.length" class="block">
            <div class="mb-1 text-amber-text-muted">已有许可证</div>
            <select v-model="selectedLicenseId" class="h-9 w-full border border-amber-topbar-border px-3" @change="syncDraftFromSelection">
              <option value="">新建许可证</option>
              <option v-for="license in licenses" :key="license.id" :value="license.id">{{ license.licenseName }} · {{ license.licenseKey }}</option>
            </select>
          </label>
          <label class="block"><div class="mb-1 text-amber-text-muted">套餐名称</div><input v-model.trim="draft.licenseName" class="h-9 w-full border border-amber-topbar-border px-3" type="text" /></label>
          <label class="block"><div class="mb-1 text-amber-text-muted">许可证密钥</div><input v-model.trim="draft.licenseKey" class="h-9 w-full border border-amber-topbar-border px-3" type="text" /></label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">状态</div>
            <select v-model="draft.status" class="h-9 w-full border border-amber-topbar-border px-3">
              <option v-for="option in collaborationLicenseStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label class="block"><div class="mb-1 text-amber-text-muted">生效时间</div><input v-model="draft.validFrom" class="h-9 w-full border border-amber-topbar-border px-3" type="datetime-local" /></label>
          <label class="block"><div class="mb-1 text-amber-text-muted">到期时间</div><input v-model="draft.validTo" class="h-9 w-full border border-amber-topbar-border px-3" type="datetime-local" /></label>
          <label class="block"><div class="mb-1 text-amber-text-muted">席位数</div><input v-model.number="draft.seatCount" class="h-9 w-full border border-amber-topbar-border px-3" min="1" type="number" /></label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">续期策略</div>
            <select v-model="draft.renewAction" class="h-9 w-full border border-amber-topbar-border px-3">
              <option v-for="option in collaborationRenewActionOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label class="block"><div class="mb-1 text-amber-text-muted">备注</div><textarea v-model.trim="draft.remark" class="min-h-[88px] w-full border border-amber-topbar-border px-3 py-2" /></label>
        </div>
      </article>

      <article class="border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="mb-4 text-[12px] font-semibold text-amber-dark">绑定门店</div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            v-for="store in storeOptions"
            :key="store.backendId"
            class="yy-action flex items-center justify-between border px-3 py-2 text-[10.5px]"
            :class="draft.boundStoreIds.includes(store.backendId) ? 'border-[#2D7A4D] bg-[#EBF4ED] text-[#2D7A4D]' : 'border-amber-topbar-border bg-white text-amber-dark'"
            type="button"
            @click="toggleStore(store.backendId)"
          >
            <span>{{ store.name }}</span>
            <span>{{ draft.boundStoreIds.includes(store.backendId) ? '已绑定' : '点击绑定' }}</span>
          </button>
        </div>
      </article>
    </section>
  </CollaborationSettingsPageShell>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import FeatureGateStatusCard from '../system/FeatureGateStatusCard.vue'
import { useCollaborationOpenSettings } from './composables/useCollaborationOpenSettings'
import CollaborationSettingsPageShell from './components/CollaborationSettingsPageShell.vue'

const {
  initializing,
  saving,
  error,
  licenses,
  selectedLicenseId,
  draft,
  gate,
  canEdit,
  collaborationLicenseStatusOptions,
  collaborationRenewActionOptions,
  storeOptions,
  init,
  syncDraftFromSelection,
  startCreate,
  toggleStore,
  saveLicense,
} = useCollaborationOpenSettings()

onMounted(init)
</script>
