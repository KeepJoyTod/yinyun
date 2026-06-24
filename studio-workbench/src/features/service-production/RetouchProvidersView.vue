<template>
  <div class="flex min-h-full flex-col gap-6">
    <section class="border border-amber-topbar-border bg-amber-content-bg p-6">
      <div class="flex items-end justify-between gap-5 max-[860px]:flex-col max-[860px]:items-start">
        <div>
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Retouch Providers</span>
          <h2 class="mt-1 font-sans text-[18px] font-medium text-amber-dark">三方修图服务商</h2>
          <p class="mt-2 max-w-[820px] text-[10.5px] leading-relaxed text-amber-text-muted">
            维护服务商入驻审核、门店适用范围、报价方式和 SLA，供三方修图中心直接派单。
          </p>
        </div>
        <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" @click="startCreate">
          新建服务商
        </button>
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div class="min-w-0 border border-amber-topbar-border bg-amber-content-bg">
        <div class="flex flex-wrap items-center gap-3 border-b border-amber-topbar-border px-5 py-4">
          <input v-model.trim="keyword" class="h-8 w-[240px] border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark max-[560px]:w-full" placeholder="搜索编码、服务商、联系人" type="search" />
          <select v-model="applicationStatus" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark">
            <option value="">全部审核状态</option>
            <option v-for="option in providerApplicationStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <select v-model="providerStatus" class="h-8 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark">
            <option value="">全部服务状态</option>
            <option v-for="option in providerStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark" type="button" :disabled="service.loading" @click="refreshProviders">
            {{ service.loading ? '刷新中...' : '刷新列表' }}
          </button>
        </div>

        <div v-if="providers.length" class="overflow-x-auto">
          <table class="w-full min-w-[920px] border-collapse">
            <thead>
              <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left">
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">服务商</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">联系人</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">服务范围</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">审核 / 状态</th>
                <th class="px-5 py-3 text-[11px] text-amber-text-muted">SLA</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-amber-topbar-border/60">
              <tr v-for="provider in providers" :key="provider.id" class="cursor-pointer hover:bg-black/[0.015]" :class="selectedProviderId === provider.id ? 'bg-[#FBF8F2]' : ''" @click="selectProvider(provider.id)">
                <td class="px-5 py-4">
                  <div class="font-mono text-[10.5px] text-amber-dark">{{ provider.providerCode }}</div>
                  <div class="mt-1 text-[11px] text-amber-dark">{{ provider.providerName }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ provider.contactName || '待补联系人' }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ provider.contactPhone || '待补电话' }}</div>
                </td>
                <td class="px-5 py-4 text-[10.5px] text-amber-text-muted">{{ provider.serviceScope || '未配置范围' }}</td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ provider.applicationStatus }}</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">{{ provider.status }}</div>
                </td>
                <td class="px-5 py-4">
                  <div class="text-[11px] text-amber-dark">{{ provider.slaHours }} 小时</div>
                  <div class="mt-1 text-[10px] text-amber-text-muted">评分 {{ provider.ratingScore }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="px-6 py-14 text-center">
          <div class="font-sans text-[15px] text-amber-dark">暂无修图服务商</div>
          <p class="mt-2 text-[11px] text-amber-text-muted">先创建服务商，再配置门店范围与接单规则。</p>
        </div>
      </div>

      <aside class="border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <span class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Provider Detail</span>
          <h3 class="mt-1 font-sans text-[15px] font-medium text-amber-dark">{{ draft.id ? '编辑服务商' : '新建服务商' }}</h3>
        </div>
        <div class="space-y-4 p-5 text-[11px] text-amber-dark">
          <label class="block">
            <div class="mb-1 text-amber-text-muted">服务商编码</div>
            <input v-model.trim="draft.providerCode" class="h-9 w-full border border-amber-topbar-border bg-white px-3" type="text" />
          </label>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">服务商名称</div>
            <input v-model.trim="draft.providerName" class="h-9 w-full border border-amber-topbar-border bg-white px-3" type="text" />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <div class="mb-1 text-amber-text-muted">联系人</div>
              <input v-model.trim="draft.contactName" class="h-9 w-full border border-amber-topbar-border bg-white px-3" type="text" />
            </label>
            <label class="block">
              <div class="mb-1 text-amber-text-muted">联系电话</div>
              <input v-model.trim="draft.contactPhone" class="h-9 w-full border border-amber-topbar-border bg-white px-3" type="text" />
            </label>
          </div>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">服务范围</div>
            <input v-model.trim="draft.serviceScope" class="h-9 w-full border border-amber-topbar-border bg-white px-3" type="text" />
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <div class="mb-1 text-amber-text-muted">报价模式</div>
              <select v-model="draft.quoteMode" class="h-9 w-full border border-amber-topbar-border bg-white px-3">
                <option v-for="option in quoteModeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="block">
              <div class="mb-1 text-amber-text-muted">结算模式</div>
              <select v-model="draft.settlementMode" class="h-9 w-full border border-amber-topbar-border bg-white px-3">
                <option v-for="option in settlementModeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <div class="mb-1 text-amber-text-muted">审核状态</div>
              <select v-model="draft.applicationStatus" class="h-9 w-full border border-amber-topbar-border bg-white px-3">
                <option v-for="option in providerApplicationStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
            <label class="block">
              <div class="mb-1 text-amber-text-muted">服务状态</div>
              <select v-model="draft.status" class="h-9 w-full border border-amber-topbar-border bg-white px-3">
                <option v-for="option in providerStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
              </select>
            </label>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <div class="mb-1 text-amber-text-muted">评分</div>
              <input v-model.number="draft.ratingScore" class="h-9 w-full border border-amber-topbar-border bg-white px-3" max="5" min="1" type="number" />
            </label>
            <label class="block">
              <div class="mb-1 text-amber-text-muted">SLA（小时）</div>
              <input v-model.number="draft.slaHours" class="h-9 w-full border border-amber-topbar-border bg-white px-3" min="1" type="number" />
            </label>
          </div>
          <div>
            <div class="mb-2 text-amber-text-muted">适用门店</div>
            <div class="grid grid-cols-2 gap-2">
              <label v-for="store in appStore.stores" :key="store.id" class="flex items-center gap-2 text-[10.5px]">
                <input :checked="draft.supportedStoreIds.includes(store.id)" type="checkbox" @change="toggleStore(store.id)" />
                {{ store.name }}
              </label>
            </div>
          </div>
          <label class="block">
            <div class="mb-1 text-amber-text-muted">备注</div>
            <textarea v-model.trim="draft.remark" class="min-h-[88px] w-full border border-amber-topbar-border bg-white px-3 py-2" />
          </label>
          <button class="yy-action w-full border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6]" type="button" :disabled="service.saving" @click="saveProvider">
            {{ service.saving ? '保存中...' : '保存服务商' }}
          </button>
          <div v-if="service.error" class="rounded border border-[#B8543B]/30 bg-[#FFF1EE] px-3 py-2 text-[10px] text-[#B8543B]">{{ service.error }}</div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import { useServiceProduction } from './composables/useServiceProduction'
import { createRetouchProviderDraft, providerApplicationStatusOptions, providerStatusOptions, quoteModeOptions, settlementModeOptions, toRetouchProviderPayload, type RetouchProviderDraft } from './serviceProductionOperations'

const service = useServiceProduction()
const keyword = ref('')
const applicationStatus = ref('')
const providerStatus = ref('')
const selectedProviderId = ref('')
const providers = ref<Awaited<ReturnType<typeof service.loadRetouchProviders>>>([])
const draft = reactive<RetouchProviderDraft>(createRetouchProviderDraft())

const refreshProviders = async () => {
  providers.value = await service.loadRetouchProviders({
    keyword: keyword.value,
    applicationStatus: applicationStatus.value,
    status: providerStatus.value,
  })
  if (!selectedProviderId.value && providers.value[0]) {
    selectProvider(providers.value[0].id)
  }
}

const selectProvider = (providerId: string) => {
  selectedProviderId.value = providerId
  const current = providers.value.find(provider => provider.id === providerId)
  Object.assign(draft, createRetouchProviderDraft(current))
}

const startCreate = () => {
  selectedProviderId.value = ''
  Object.assign(draft, createRetouchProviderDraft())
}

const toggleStore = (storeId: string) => {
  draft.supportedStoreIds = draft.supportedStoreIds.includes(storeId)
    ? draft.supportedStoreIds.filter(item => item !== storeId)
    : [...draft.supportedStoreIds, storeId]
}

const saveProvider = async () => {
  const saved = await service.saveRetouchProvider(toRetouchProviderPayload(draft))
  const existingIndex = providers.value.findIndex(provider => provider.id === saved.id)
  if (existingIndex >= 0) {
    providers.value[existingIndex] = saved
  } else {
    providers.value = [saved, ...providers.value]
  }
  selectProvider(saved.id)
}

onMounted(async () => {
  await service.ensureStores()
  await refreshProviders()
  if (!providers.value.length) startCreate()
})
</script>
