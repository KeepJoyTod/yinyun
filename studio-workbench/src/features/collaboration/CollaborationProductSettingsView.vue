<template>
  <CollaborationSettingsPageShell
    eyebrow="Product Workflow"
    title="产品设置"
    description="按产品维护岗位流转、化妆/修图/审片/看片/取件开关、妆面数和出片时限。"
    :error="collaborationStore.error"
  >
    <section class="border border-amber-topbar-border bg-amber-content-bg p-5">
      <div class="space-y-4">
        <article v-for="product in appStore.products" :key="product.id" class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
          <div class="flex items-start justify-between gap-4 max-[860px]:flex-col max-[860px]:items-start">
            <div>
              <div class="text-[12px] font-semibold text-amber-dark">{{ product.name }}</div>
              <div class="mt-1 text-[10px] text-amber-text-muted">{{ product.spec }} · {{ product.storeNames?.[0] || '未绑定门店' }}</div>
            </div>
            <button class="yy-action border border-amber-dark bg-amber-dark px-3 py-2 text-[10.5px] text-[#F4EFE6]" type="button" :disabled="savingProductId === product.id" @click="saveProduct(product.id)">
              {{ savingProductId === product.id ? '保存中...' : '保存产品配置' }}
            </button>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4 text-[11px] text-amber-dark">
            <label class="flex items-center gap-2"><input v-model="drafts[product.id].needMakeup" type="checkbox" /> 需要化妆</label>
            <label class="flex items-center gap-2"><input v-model="drafts[product.id].needPhotography" type="checkbox" /> 需要摄影</label>
            <label class="flex items-center gap-2"><input v-model="drafts[product.id].needRetouch" type="checkbox" /> 需要修图</label>
            <label class="flex items-center gap-2"><input v-model="drafts[product.id].needReview" type="checkbox" /> 需要审片</label>
            <label class="flex items-center gap-2"><input v-model="drafts[product.id].needSelectionReview" type="checkbox" /> 需要看片</label>
            <label class="flex items-center gap-2"><input v-model="drafts[product.id].needPickup" type="checkbox" /> 需要取件</label>
            <label class="block">
              <div class="mb-1 text-amber-text-muted">妆面数</div>
              <input v-model.number="drafts[product.id].makeupCount" class="h-8 w-full border border-amber-topbar-border px-2" type="number" min="0" />
            </label>
            <label class="block">
              <div class="mb-1 text-amber-text-muted">出片时限(小时)</div>
              <input v-model.number="drafts[product.id].deliverWithinHours" class="h-8 w-full border border-amber-topbar-border px-2" type="number" min="1" />
            </label>
          </div>
        </article>
      </div>
    </section>
  </CollaborationSettingsPageShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { appStore } from '../../shared/stores/appStore'
import type { ProductCollaborationConfigPayload } from '../../shared/api/backend'
import { collaborationStore } from '../../shared/stores/collaborationStore'
import { buildDefaultWorkflowJson } from './collaborationSettings'
import CollaborationSettingsPageShell from './components/CollaborationSettingsPageShell.vue'

const savingProductId = ref('')
const drafts = reactive<Record<string, ProductCollaborationConfigPayload>>({})

const ensureDraft = (productId: string) => {
  if (drafts[productId]) return drafts[productId]
  drafts[productId] = {
    productId,
    workflowJson: buildDefaultWorkflowJson(),
    needMakeup: false,
    needPhotography: true,
    needRetouch: false,
    needReview: false,
    needSelectionReview: false,
    needPickup: true,
    makeupCount: 0,
    deliverWithinHours: 48,
    status: 'ACTIVE',
    remark: '',
  }
  return drafts[productId]
}

onMounted(async () => {
  if (!appStore.products.length) await appStore.refreshCoreData()
  const configs = await collaborationStore.loadProductConfigs()
  for (const product of appStore.products) {
    const config = configs.find(item => item.productId === product.id)
    drafts[product.id] = config
      ? {
          id: config.id,
          productId: product.id,
          workflowJson: config.workflowJson,
          needMakeup: config.needMakeup,
          needPhotography: config.needPhotography,
          needRetouch: config.needRetouch,
          needReview: config.needReview,
          needSelectionReview: config.needSelectionReview,
          needPickup: config.needPickup,
          makeupCount: config.makeupCount,
          deliverWithinHours: config.deliverWithinHours,
          status: config.status,
          remark: config.remark,
        }
      : ensureDraft(product.id)
  }
})

const saveProduct = async (productId: string) => {
  savingProductId.value = productId
  try {
    await collaborationStore.saveProductConfig(productId, ensureDraft(productId))
  } finally {
    savingProductId.value = ''
  }
}
</script>
