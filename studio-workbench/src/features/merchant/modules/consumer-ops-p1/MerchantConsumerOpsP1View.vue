<template>
  <MerchantModuleChrome>
    <template #status>
      <span class="text-[11px] text-amber-text-muted">P1 scaffold / {{ overview?.updatedAt || 'loading' }}</span>
    </template>

    <section class="space-y-4 text-amber-dark">
      <div class="border border-amber-topbar-border bg-white/85 p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="text-[11px] font-semibold text-amber-text-muted">Consumer Ops P1</div>
            <h1 class="mt-2 text-[20px] font-semibold">{{ overview?.title || 'P1 消费者体验与商户运营闭环' }}</h1>
            <p class="mt-2 max-w-3xl text-[12px] leading-relaxed text-amber-text-muted">
              只读聚合消费者端预约增强、卡券权益、评价触达与商户运营配置缺口；本页只承接 owner 边界，不写真实权益、通知、评价或财务账本。
            </p>
          </div>
          <button class="yy-action border border-amber-dark px-3 py-2 text-[12px]" type="button" @click="reload">刷新</button>
        </div>

        <div class="mt-5 grid gap-3 md:grid-cols-5">
          <div class="border border-amber-topbar-border bg-amber-content-bg/70 p-3">
            <div class="text-[10px] text-amber-text-muted">模块</div>
            <div class="mt-1 text-[18px] font-semibold">{{ summary.total }}</div>
          </div>
          <div class="border border-amber-topbar-border bg-amber-content-bg/70 p-3">
            <div class="text-[10px] text-amber-text-muted">脚手架</div>
            <div class="mt-1 text-[18px] font-semibold">{{ summary.scaffoldCount }}</div>
          </div>
          <div class="border border-amber-topbar-border bg-amber-content-bg/70 p-3">
            <div class="text-[10px] text-amber-text-muted">建设中</div>
            <div class="mt-1 text-[18px] font-semibold">{{ summary.buildingCount }}</div>
          </div>
          <div class="border border-amber-topbar-border bg-amber-content-bg/70 p-3">
            <div class="text-[10px] text-amber-text-muted">未接线</div>
            <div class="mt-1 text-[18px] font-semibold">{{ summary.notConnectedCount }}</div>
          </div>
          <div class="border border-amber-topbar-border bg-amber-content-bg/70 p-3">
            <div class="text-[10px] text-amber-text-muted">高风险</div>
            <div class="mt-1 text-[18px] font-semibold">{{ summary.highRiskCount }}</div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="border border-amber-topbar-border bg-white/80 p-5 text-[12px] text-amber-text-muted">
        正在加载 P1 脚手架。
      </div>
      <div v-else-if="errorMessage" class="border border-[#B03A3A]/25 bg-[#F4D7D7] p-5 text-[12px] text-[#8E2F2F]">
        {{ errorMessage }}
      </div>
      <div v-else-if="overview && overview.items.length === 0" class="border border-dashed border-amber-topbar-border bg-white/80 p-5 text-[12px] leading-relaxed text-amber-text-muted">
        褰撳墠娌℃湁鍙睍绀虹殑 P1 缂哄彛椤广€傛湰椤典粛淇濇寔鍙 owner 杈圭晫锛屽悗缁湡瀹炴潈鐩娿€侀€氱煡銆佽瘎浠蜂笌璐㈠姟闂幆浠嶉渶鎸夊瓙浠诲姟缁х画鎺ュ叆銆?
      </div>

      <div v-else class="grid gap-3">
        <article v-for="item in overview?.items || []" :key="item.itemKey" class="border border-amber-topbar-border bg-white/85 p-4">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-[14px] font-semibold">{{ item.itemName }}</h2>
                <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-amber-text-muted">{{ item.itemKey }}</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-1.5">
                <span v-for="source in item.sourceItems" :key="source" class="yy-status-chip border border-amber-topbar-border bg-amber-content-bg text-amber-text-muted">{{ source }}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 text-[10px]">
              <span :class="['yy-status-chip', consumerOpsP1StatusClass(item.status)]">{{ consumerOpsP1StatusLabel(item.status) }}</span>
              <span :class="['yy-status-chip', consumerOpsP1RiskClass(item.risk)]">{{ consumerOpsP1RiskLabel(item.risk) }}</span>
            </div>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-4">
            <div>
              <div class="text-[10px] font-semibold text-amber-text-muted">现有 owner</div>
              <ul class="mt-2 space-y-1 text-[12px] leading-relaxed">
                <li v-for="owner in item.existingOwners" :key="owner">- {{ owner }}</li>
              </ul>
            </div>
            <div>
              <div class="text-[10px] font-semibold text-amber-text-muted">缺失能力</div>
              <ul class="mt-2 space-y-1 text-[12px] leading-relaxed">
                <li v-for="capability in item.missingCapabilities" :key="capability">- {{ capability }}</li>
              </ul>
            </div>
            <div>
              <div class="text-[10px] font-semibold text-amber-text-muted">下一步</div>
              <ul class="mt-2 space-y-1 text-[12px] leading-relaxed">
                <li v-for="step in item.nextSteps" :key="step">- {{ step }}</li>
              </ul>
            </div>
            <div>
              <div class="text-[10px] font-semibold text-amber-text-muted">证据</div>
              <ul class="mt-2 space-y-1 text-[12px] leading-relaxed">
                <li v-for="ref in item.evidenceRefs" :key="ref">{{ ref }}</li>
              </ul>
            </div>
          </div>
        </article>
      </div>

      <div v-if="overview" class="grid gap-3 md:grid-cols-2">
        <div class="border border-amber-topbar-border bg-white/85 p-4">
          <div class="text-[11px] font-semibold text-amber-text-muted">数据边界</div>
          <ul class="mt-2 space-y-1 text-[12px] leading-relaxed">
            <li v-for="ledger in overview.dataLedgers" :key="ledger">- {{ ledger }}</li>
          </ul>
        </div>
        <div class="border border-amber-topbar-border bg-white/85 p-4">
          <div class="text-[11px] font-semibold text-amber-text-muted">交付标准</div>
          <ul class="mt-2 space-y-1 text-[12px] leading-relaxed">
            <li v-for="standard in overview.deliveryStandard" :key="standard">- {{ standard }}</li>
          </ul>
        </div>
      </div>
    </section>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import MerchantModuleChrome from '../../components/MerchantModuleChrome.vue'
import {
  consumerOpsP1RiskClass,
  consumerOpsP1RiskLabel,
  consumerOpsP1StatusClass,
  consumerOpsP1StatusLabel,
} from './merchantConsumerOpsP1Operations'
import { useMerchantConsumerOpsP1State } from './composables/useMerchantConsumerOpsP1State'

const { loading, errorMessage, overview, summary, reload } = useMerchantConsumerOpsP1State()
</script>
