<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero rounded-[24px] p-6">
      <span class="font-mono text-[11px] uppercase tracking-[0.22em] text-amber-accent">Coupon Templates</span>
      <h2 class="mt-1 text-[28px] font-sans font-black leading-[1.08] tracking-[-0.02em] text-amber-dark">券模板与发券脚手架</h2>
      <p class="mt-2 max-w-[820px] text-[13px] leading-relaxed text-amber-text-muted">
        统一承接券模板、发券记录、券实例和退单恢复入口。当前先跑脚手架与真实接口骨架，不伪造第二套订单账本。
      </p>
    </section>

    <MarketingCapabilityGateCard v-if="couponCapability" :capability="couponCapability" />
    <p v-if="error" class="text-[10.5px] text-[var(--color-status-danger)]">{{ error }}</p>

    <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
      <div class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h3 class="text-[14px] font-semibold text-amber-dark">券模板</h3>
            <p class="mt-1 text-[10.5px] text-amber-text-muted">{{ scaffold.boundary }}</p>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-1.5 text-[10.5px] text-amber-dark hover:bg-black/5" type="button" @click="loadCouponScaffold">
            刷新
          </button>
        </div>
        <div class="mt-4 space-y-3">
          <article v-for="template in scaffold.templates" :key="template.templateId" class="border border-amber-topbar-border bg-[#FBF8F2] p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-[11px] font-semibold text-amber-dark">{{ template.templateName }}</div>
                <div class="mt-1 text-[10px] text-amber-text-muted">{{ template.storeScopeLabel }} · {{ template.productScopeLabel }}</div>
              </div>
              <span class="border border-amber-topbar-border px-2 py-0.5 text-[10px] text-amber-dark">{{ template.templateType }}</span>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-3 text-[10.5px] text-amber-text-muted">
              <div>面额 {{ formatMarketingMoney(template.faceValueCent) }}</div>
              <div>已发 {{ template.issuedCount }} / 已核销 {{ template.writeoffCount }}</div>
              <div>叠加规则 {{ template.stackedWith }}</div>
              <div>退单恢复 {{ template.restoreOnRefund ? '允许' : '不允许' }}</div>
            </div>
          </article>
        </div>
      </div>

      <aside class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
        <h3 class="text-[14px] font-semibold text-amber-dark">发券与券实例</h3>
        <div class="mt-4 space-y-3">
          <article v-for="grant in scaffold.grantRecords" :key="grant.grantId" class="border border-amber-topbar-border bg-[#FBF8F2] p-3">
            <div class="text-[11px] font-semibold text-amber-dark">{{ grant.templateName }}</div>
            <div class="mt-1 text-[10px] text-amber-text-muted">{{ grant.targetCustomer }} · {{ grant.targetMobile }}</div>
            <div class="mt-1 text-[10px] text-amber-text-muted">{{ grant.grantSource }}</div>
          </article>
        </div>
        <div class="mt-5 border-t border-amber-topbar-border pt-4">
          <div class="text-[11px] font-semibold text-amber-dark">券实例</div>
          <div class="mt-3 space-y-2">
            <div v-for="instance in scaffold.instances" :key="instance.instanceId" class="flex items-center justify-between gap-3 text-[10.5px] text-amber-text-muted">
              <span>{{ instance.holderName }} · {{ instance.templateName }}</span>
              <strong class="text-amber-dark">{{ instance.status }}</strong>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCouponTemplates } from './composables/useCouponTemplates'
import { useMarketingCapabilityGate } from './composables/useMarketingCapabilityGate'
import MarketingCapabilityGateCard from './components/MarketingCapabilityGateCard.vue'
import { formatMarketingMoney } from './marketingScaffoldData'

const { scaffold, error: couponError, loadCouponScaffold } = useCouponTemplates()
const { capabilityMap, error: capabilityError } = useMarketingCapabilityGate()

const couponCapability = computed(() => capabilityMap.value.get('COUPON_TEMPLATE'))
const error = computed(() => capabilityError.value || couponError.value)
</script>
