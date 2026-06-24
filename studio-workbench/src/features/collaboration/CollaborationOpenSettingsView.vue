<template>
  <CollaborationSettingsPageShell
    eyebrow="License Binding"
    title="开通设置"
    description="维护协作许可证有效期、席位数，并绑定到真实门店范围。"
    :error="service.error"
  >
    <template #actions>
      <div class="flex items-center gap-2">
        <button class="yy-action border border-amber-topbar-border px-4 py-2 text-[11px] text-amber-dark" type="button" @click="startCreate">
          新建许可证
        </button>
        <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" :disabled="service.saving" @click="saveLicense">
          {{ service.saving ? '保存中...' : '保存许可证' }}
        </button>
      </div>
    </template>

    <section class="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
      <article class="border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="space-y-3 text-[11px] text-amber-dark">
          <label v-if="licenses.length" class="block">
            <div class="mb-1 text-amber-text-muted">已有许可证</div>
            <select v-model="selectedLicenseId" class="h-9 w-full border border-amber-topbar-border px-3" @change="syncDraftFromSelection">
              <option value="">新建许可证</option>
              <option v-for="license in licenses" :key="license.id" :value="license.id">{{ license.planName }} · {{ license.licenseKey }}</option>
            </select>
          </label>
          <label class="block"><div class="mb-1 text-amber-text-muted">套餐名称</div><input v-model.trim="draft.planName" class="h-9 w-full border border-amber-topbar-border px-3" type="text" /></label>
          <label class="block"><div class="mb-1 text-amber-text-muted">许可证密钥</div><input v-model.trim="draft.licenseKey" class="h-9 w-full border border-amber-topbar-border px-3" type="text" /></label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">状态</div>
            <select v-model="draft.status" class="h-9 w-full border border-amber-topbar-border px-3">
              <option v-for="option in licenseStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label class="block"><div class="mb-1 text-amber-text-muted">激活时间</div><input v-model="draft.activatedTime" class="h-9 w-full border border-amber-topbar-border px-3" type="datetime-local" /></label>
          <label class="block"><div class="mb-1 text-amber-text-muted">过期时间</div><input v-model="draft.expireTime" class="h-9 w-full border border-amber-topbar-border px-3" type="datetime-local" /></label>
          <label class="block"><div class="mb-1 text-amber-text-muted">席位数</div><input v-model.number="draft.seatCount" class="h-9 w-full border border-amber-topbar-border px-3" min="1" type="number" /></label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">续期策略</div>
            <select v-model="draft.renewAction" class="h-9 w-full border border-amber-topbar-border px-3">
              <option v-for="option in renewActionOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>
          <label class="block"><div class="mb-1 text-amber-text-muted">备注</div><textarea v-model.trim="draft.remark" class="min-h-[88px] w-full border border-amber-topbar-border px-3 py-2" /></label>
        </div>
      </article>

      <article class="border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="mb-4 text-[12px] font-semibold text-amber-dark">绑定门店</div>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            v-for="store in appStore.stores"
            :key="store.id"
            class="yy-action flex items-center justify-between border px-3 py-2 text-[10.5px]"
            :class="draft.boundStoreIds.includes(store.id) ? 'border-[#2D7A4D] bg-[#EBF4ED] text-[#2D7A4D]' : 'border-amber-topbar-border bg-white text-amber-dark'"
            type="button"
            @click="toggleStore(store.id)"
          >
            <span>{{ store.name }}</span>
            <span>{{ draft.boundStoreIds.includes(store.id) ? '已绑定' : '点击绑定' }}</span>
          </button>
        </div>
      </article>
    </section>
  </CollaborationSettingsPageShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import { useServiceProduction } from '../service-production/composables/useServiceProduction'
import { createLicenseDraft, licenseStatusOptions, renewActionOptions, toLicensePayload, type LicenseDraft } from '../service-production/serviceProductionOperations'
import CollaborationSettingsPageShell from './components/CollaborationSettingsPageShell.vue'

const service = useServiceProduction()
const licenses = ref<Awaited<ReturnType<typeof service.loadLicenseBindings>>>([])
const selectedLicenseId = ref('')
const draft = reactive<LicenseDraft>(createLicenseDraft())

const syncDraftFromSelection = () => {
  const current = licenses.value.find(item => item.id === selectedLicenseId.value)
  Object.assign(draft, createLicenseDraft(current))
}

const startCreate = () => {
  selectedLicenseId.value = ''
  Object.assign(draft, createLicenseDraft())
}

const toggleStore = (storeId: string) => {
  draft.boundStoreIds = draft.boundStoreIds.includes(storeId)
    ? draft.boundStoreIds.filter(item => item !== storeId)
    : [...draft.boundStoreIds, storeId]
}

const saveLicense = async () => {
  const next = await service.saveLicenseBinding(toLicensePayload(draft))
  const index = licenses.value.findIndex(item => item.id === next.id)
  if (index >= 0) {
    licenses.value[index] = next
  } else {
    licenses.value = [next, ...licenses.value]
  }
  selectedLicenseId.value = next.id
  syncDraftFromSelection()
}

onMounted(async () => {
  await service.ensureStores()
  licenses.value = await service.loadLicenseBindings()
  if (licenses.value[0]) {
    selectedLicenseId.value = licenses.value[0].id
    syncDraftFromSelection()
  }
})
</script>
