<template>
  <div class="flex flex-col gap-6">
    <section class="yy-glass-panel yy-console-hero border border-amber-topbar-border bg-amber-content-bg p-6">
      <span class="text-[10px] font-mono uppercase tracking-[0.22em] text-amber-text-muted">Member Transactions</span>
      <h2 class="mt-2 text-[18px] font-semibold text-amber-dark">会员交易与价值流水</h2>
      <p class="mt-2 max-w-[760px] text-[11px] leading-relaxed text-amber-text-muted">
        当前聚合最近订单、积分流水、成长值流水和余额流水，为后续充值、退款回滚和等级变更留出标准 owner。
      </p>
    </section>

    <section class="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
        <div class="border-b border-amber-topbar-border px-5 py-4">
          <div class="text-[12px] font-semibold text-amber-dark">会员客户</div>
          <input
            v-model="searchQuery"
            class="yy-field-sm mt-3 w-full"
            placeholder="搜索客户 / 手机号"
            type="text"
          >
        </div>
        <div v-if="filteredCustomers.length" class="max-h-[640px] overflow-auto">
          <button
            v-for="customer in filteredCustomers"
            :key="customer.backendId"
            class="flex w-full flex-col border-b border-amber-topbar-border/60 px-5 py-4 text-left hover:bg-black/[0.015]"
            :class="selectedCustomerId === customer.backendId ? 'bg-black/[0.03]' : ''"
            type="button"
            @click="void selectCustomer(customer.backendId)"
          >
            <span class="text-[12px] font-semibold text-amber-dark">{{ customer.name }}</span>
            <span class="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-text-muted">{{ customer.mobile }}</span>
            <span class="mt-2 text-[10.5px] text-amber-text-muted">{{ customer.totalOrderCount }} 单 · {{ customer.memberLevel }}</span>
          </button>
        </div>
        <div v-else class="px-5 py-8 text-[11px] text-amber-text-muted">暂无客户可供查看交易流水。</div>
      </aside>

      <div class="flex min-w-0 flex-col gap-5">
        <div
          v-if="error"
          class="rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[11px] text-[var(--color-status-danger)]"
        >
          {{ error }}
        </div>

        <section v-if="selectedCustomer" class="yy-console-card border border-amber-topbar-border bg-amber-content-bg">
          <div class="border-b border-amber-topbar-border px-5 py-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div class="text-[13px] font-semibold text-amber-dark">{{ selectedCustomer.name }}</div>
                <div class="mt-1 text-[10.5px] text-amber-text-muted">
                  {{ selectedCustomer.mobile }} · {{ selectedCustomer.memberLevel }}
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  class="yy-action yy-filter-chip"
                  :class="activeTab === 'orders' ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted'"
                  type="button"
                  @click="activeTab = 'orders'"
                >
                  订单
                </button>
                <button
                  class="yy-action yy-filter-chip"
                  :class="activeTab === 'points' ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted'"
                  type="button"
                  @click="activeTab = 'points'"
                >
                  积分
                </button>
                <button
                  class="yy-action yy-filter-chip"
                  :class="activeTab === 'growth' ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted'"
                  type="button"
                  @click="activeTab = 'growth'"
                >
                  成长值
                </button>
                <button
                  class="yy-action yy-filter-chip"
                  :class="activeTab === 'balance' ? 'border-amber-dark bg-amber-dark text-[#F4EFE6]' : 'border-amber-topbar-border text-amber-text-muted'"
                  type="button"
                  @click="activeTab = 'balance'"
                >
                  余额
                </button>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'orders'" class="overflow-x-auto">
            <table class="yy-console-table w-full">
              <thead>
                <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left text-[11px] text-amber-text-muted">
                  <th class="px-5 py-3">订单</th>
                  <th class="px-5 py-3">服务</th>
                  <th class="px-5 py-3">状态</th>
                  <th class="px-5 py-3">支付</th>
                  <th class="px-5 py-3">金额</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in recentOrders" :key="order.backendId" class="border-b border-amber-topbar-border/50 text-[11px] text-amber-dark">
                  <td class="px-5 py-4">{{ order.id }}</td>
                  <td class="px-5 py-4">{{ order.service }}</td>
                  <td class="px-5 py-4">{{ order.status }}</td>
                  <td class="px-5 py-4">{{ order.payment }}</td>
                  <td class="px-5 py-4">{{ order.amount.toLocaleString('zh-CN') }}</td>
                </tr>
                <tr v-if="!recentOrders.length">
                  <td class="px-5 py-6 text-[11px] text-amber-text-muted" colspan="5">暂无最近订单。</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="yy-console-table w-full">
              <thead>
                <tr class="border-b border-amber-topbar-border bg-amber-bg/10 text-left text-[11px] text-amber-text-muted">
                  <th class="px-5 py-3">类型</th>
                  <th class="px-5 py-3">变更</th>
                  <th class="px-5 py-3">变更后</th>
                  <th class="px-5 py-3">来源</th>
                  <th class="px-5 py-3">时间</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in activeTab === 'points' ? pointsLedger : activeTab === 'growth' ? growthLedger : balanceLedger"
                  :key="row.backendId"
                  class="border-b border-amber-topbar-border/50 text-[11px] text-amber-dark"
                >
                  <td class="px-5 py-4">{{ row.changeType }}</td>
                  <td class="px-5 py-4">{{ row.changeAmount }}</td>
                  <td class="px-5 py-4">{{ row.balanceAfter }}</td>
                  <td class="px-5 py-4">{{ row.sourceType }}</td>
                  <td class="px-5 py-4">{{ row.happenedAt || '--' }}</td>
                </tr>
                <tr v-if="!(activeTab === 'points' ? pointsLedger : activeTab === 'growth' ? growthLedger : balanceLedger).length">
                  <td class="px-5 py-6 text-[11px] text-amber-text-muted" colspan="5">暂无该类流水。</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section
          v-else
          class="yy-console-card border border-dashed border-amber-topbar-border bg-amber-content-bg px-6 py-10 text-[11px] text-amber-text-muted"
        >
          {{ loading ? '交易流水加载中...' : '请选择左侧客户查看会员交易。' }}
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useMemberTransactions } from './useMemberTransactions'

const {
  activeTab,
  balanceLedger,
  error,
  filteredCustomers,
  growthLedger,
  loading,
  pointsLedger,
  recentOrders,
  searchQuery,
  selectedCustomer,
  selectedCustomerId,
  selectCustomer,
} = useMemberTransactions()
</script>
