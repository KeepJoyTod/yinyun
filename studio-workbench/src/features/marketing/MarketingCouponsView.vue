<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <span class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-accent">Coupon Templates</span>
      <h2 class="mt-1 text-[28px] font-sans font-black leading-[1.08] text-amber-dark">券模板与发券</h2>
      <p class="mt-2 max-w-[820px] text-[13px] leading-relaxed text-amber-text-muted">
        商户后台券模板、发券、券实例和核销记录已经切到真实营销接口；本页只在 Demo 模式使用本地 scaffold。
      </p>
    </section>

    <MarketingCapabilityGateCard v-if="couponCapability" :capability="couponCapability" />
    <p v-if="error" class="text-[10.5px] text-[var(--color-status-danger)]">{{ error }}</p>

    <section class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
      <div class="border-b border-amber-topbar-border px-5 py-4">
        <div class="text-[13px] font-semibold text-amber-dark">脚手架验收范围</div>
        <div class="mt-1 text-[10.5px] text-amber-text-muted">B-073 / B-074 / B-077 统一收口到营销券 owner，不新建第二套优惠码、兑换券或退单恢复页面。</div>
      </div>
      <div class="grid gap-4 p-5 lg:grid-cols-3">
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[11px] font-semibold text-amber-dark">B-073 优惠码</div>
          <div class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            当前只展示规则和 owner 边界，不执行真实传播、生成、核销和统计闭环。
          </div>
        </article>
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[11px] font-semibold text-amber-dark">B-074 兑换券</div>
          <div class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            当前只展示发放和活动绑定骨架，不执行真实兑换、核销和回滚。
          </div>
        </article>
        <article class="yy-console-card border border-amber-topbar-border bg-amber-content-bg/50 p-4">
          <div class="text-[11px] font-semibold text-amber-dark">B-077 退单后券恢复策略</div>
          <div class="mt-2 text-[10.5px] leading-relaxed text-amber-text-muted">
            当前只展示恢复策略 scaffold，不执行真实退单后的发券恢复与审计闭环。
          </div>
        </article>
      </div>
      <div class="border-t border-amber-topbar-border px-5 py-4 text-[10.5px] leading-relaxed text-amber-text-muted">
        下一步：补真实优惠码生成、兑换券发放、退单恢复、活动绑定和与订单/核销账本的联动验收。
      </div>
    </section>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <CouponTemplateTable
        :templates="templates"
        :selected-id="selectedTemplateId"
        :loading="templateLoading"
        @create="openTemplateDrawer()"
        @edit="openTemplateDrawer"
        @issue="openIssueDrawer"
        @refresh="loadCouponTemplates"
        @select="selectedTemplateId = $event"
        @toggle="toggleTemplate"
      />

      <CouponInstanceTable
        :grant-records="grantRecords"
        :instances="instances"
        :writeoffs="writeoffs"
        :loading="ledgerLoading"
      />
    </section>

    <CouponTemplateDrawer
      :show="templateDrawerOpen"
      :template-id="editingTemplateId"
      :initial-draft="templateDraft"
      :stores="appStore.stores"
      :products="appStore.products"
      :submitting="templateSubmitting"
      @close="templateDrawerOpen = false"
      @submit="submitTemplate"
    />

    <CouponIssueDrawer
      :show="issueDrawerOpen"
      :template-name="selectedTemplate?.templateName"
      :initial-draft="issueDraft"
      :customers="appStore.customers"
      :submitting="issueSubmitting"
      @close="issueDrawerOpen = false"
      @submit="submitIssue"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { appStore } from '../../shared/stores/appStore'
import CouponInstanceTable from './components/CouponInstanceTable.vue'
import CouponIssueDrawer from './components/CouponIssueDrawer.vue'
import CouponTemplateDrawer from './components/CouponTemplateDrawer.vue'
import CouponTemplateTable from './components/CouponTemplateTable.vue'
import MarketingCapabilityGateCard from './components/MarketingCapabilityGateCard.vue'
import { useCouponIssuance, type CouponIssueDraft } from './composables/useCouponIssuance'
import { useCouponTemplates, type CouponTemplateDraft } from './composables/useCouponTemplates'
import { useMarketingCapabilityGate } from './composables/useMarketingCapabilityGate'

const route = useRoute()
const {
  loading: templateLoading,
  submitting: templateSubmitting,
  error: couponError,
  templates,
  selectedTemplate,
  selectedTemplateId,
  buildDraft,
  loadCouponTemplates,
  saveTemplate,
  toggleTemplateStatus,
} = useCouponTemplates()
const {
  loading: ledgerLoading,
  submitting: issueSubmitting,
  error: issueError,
  grantRecords,
  instances,
  writeoffs,
  buildIssueDraft,
  loadCouponLedger,
  issueCoupons,
} = useCouponIssuance()
const { capabilityMap, error: capabilityError } = useMarketingCapabilityGate()

const templateDrawerOpen = ref(false)
const issueDrawerOpen = ref(false)
const editingTemplateId = ref('')
const templateDraft = ref<CouponTemplateDraft>(buildDraft())
const issueDraft = ref<CouponIssueDraft>(buildIssueDraft())

const couponCapability = computed(() => capabilityMap.value.get('COUPON_TEMPLATE'))
const error = computed(() => capabilityError.value || couponError.value || issueError.value)
const routeCustomerId = computed(() => String(route.query.customerId ?? ''))

const openTemplateDrawer = (templateId = '') => {
  editingTemplateId.value = templateId
  templateDraft.value = buildDraft(templates.value.find(item => item.templateId === templateId) ?? null)
  templateDrawerOpen.value = true
}

const openIssueDrawer = (templateId: string) => {
  selectedTemplateId.value = templateId
  issueDraft.value = buildIssueDraft(templateId, routeCustomerId.value ? [routeCustomerId.value] : [])
  issueDrawerOpen.value = true
}

const submitTemplate = async (draft: CouponTemplateDraft) => {
  await saveTemplate(draft, editingTemplateId.value || undefined)
  templateDrawerOpen.value = false
}

const submitIssue = async (draft: CouponIssueDraft) => {
  await issueCoupons(draft)
  issueDrawerOpen.value = false
  await loadCouponTemplates()
}

const toggleTemplate = async (templateId: string) => {
  const template = templates.value.find(item => item.templateId === templateId)
  if (template) await toggleTemplateStatus(template)
}

watch(selectedTemplateId, value => {
  void loadCouponLedger(value)
}, { immediate: true })

onMounted(async () => {
  if (!appStore.initialized && !appStore.loading) await appStore.bootstrap().catch(() => undefined)
  if (!appStore.customers.length) await appStore.ensureCustomersLoaded().catch(() => undefined)
  if (routeCustomerId.value && selectedTemplateId.value) {
    issueDraft.value = buildIssueDraft(selectedTemplateId.value, [routeCustomerId.value])
  }
})
</script>
