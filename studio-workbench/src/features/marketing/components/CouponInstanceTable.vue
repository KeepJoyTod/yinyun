<template>
  <aside class="yy-console-card border border-amber-topbar-border bg-amber-content-bg p-5">
    <div class="flex items-start justify-between gap-4">
      <div>
        <h3 class="text-[14px] font-semibold text-amber-dark">发券与核销</h3>
        <p class="mt-1 text-[10.5px] text-amber-text-muted">随选中券模板刷新真实实例、发券记录和核销记录。</p>
      </div>
      <span class="border border-amber-topbar-border px-2 py-0.5 text-[10px] text-amber-text-muted">{{ loading ? '加载中' : '已同步' }}</span>
    </div>

    <div class="mt-4 border-t border-amber-topbar-border pt-4">
      <div class="text-[11px] font-semibold text-amber-dark">发券记录</div>
      <div class="mt-3 space-y-3">
        <article v-for="grant in grantRecords" :key="grant.grantId" class="border border-amber-topbar-border bg-[#FBF8F2] p-3">
          <div class="text-[11px] font-semibold text-amber-dark">{{ grant.customerName || '未命名客户' }}</div>
          <div class="mt-1 text-[10px] text-amber-text-muted">{{ grant.issueSource }} / {{ grant.issueCount }} 张 / {{ grant.status }}</div>
        </article>
        <p v-if="!grantRecords.length" class="text-[10.5px] text-amber-text-muted">暂无发券记录。</p>
      </div>
    </div>

    <div class="mt-5 border-t border-amber-topbar-border pt-4">
      <div class="text-[11px] font-semibold text-amber-dark">券实例</div>
      <div class="mt-3 space-y-2">
        <div v-for="instance in instances" :key="instance.instanceId" class="flex items-center justify-between gap-3 text-[10.5px] text-amber-text-muted">
          <span>{{ instance.holderName || '未命名客户' }} / {{ instance.expiresAt || '无到期时间' }}</span>
          <strong class="text-amber-dark">{{ instance.status }}</strong>
        </div>
        <p v-if="!instances.length" class="text-[10.5px] text-amber-text-muted">暂无券实例。</p>
      </div>
    </div>

    <div class="mt-5 border-t border-amber-topbar-border pt-4">
      <div class="text-[11px] font-semibold text-amber-dark">核销记录</div>
      <div class="mt-3 space-y-2">
        <div v-for="writeoff in writeoffs" :key="writeoff.writeoffId" class="text-[10.5px] text-amber-text-muted">
          {{ writeoff.orderId || '无订单' }} / {{ formatMarketingMoney(writeoff.writeoffAmountCent) }} / {{ writeoff.restoreStatus || 'NONE' }}
        </div>
        <p v-if="!writeoffs.length" class="text-[10.5px] text-amber-text-muted">暂无核销记录。</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type {
  MarketingCouponGrantRecordDto,
  MarketingCouponInstanceDto,
  MarketingCouponWriteoffDto,
} from '../../../shared/api/backend'
import { formatMarketingMoney } from '../marketingScaffoldData'

defineProps<{
  grantRecords: MarketingCouponGrantRecordDto[]
  instances: MarketingCouponInstanceDto[]
  writeoffs: MarketingCouponWriteoffDto[]
  loading?: boolean
}>()
</script>
