<template>
  <section class="space-y-6 px-6 py-6">
    <header class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">会员 / 交易安全</p>
      <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div class="space-y-2">
          <h1 class="text-2xl font-semibold text-slate-900">交易安全脚手架</h1>
          <p class="max-w-3xl text-sm leading-6 text-slate-600">
            先补齐权益预占、组合支付、储值消费和会员提现的内部 owner、状态账本与审批挂接，
            再继续对接真实支付渠道、出款适配器和财务闭环。
          </p>
        </div>
        <button
          class="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          :disabled="loading || saving"
          @click="load"
        >
          {{ loading ? '加载中...' : '刷新' }}
        </button>
      </div>
    </header>

    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in summaryCards"
        :key="card.key"
        class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <p class="text-xs uppercase tracking-[0.16em] text-slate-500">{{ card.label }}</p>
        <p class="mt-3 text-3xl font-semibold text-slate-900">{{ card.value }}</p>
        <p class="mt-2 text-sm text-slate-600">{{ card.hint }}</p>
      </article>
    </section>

    <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid gap-3 md:grid-cols-5">
        <label class="space-y-2 text-sm text-slate-700">
          <span>门店 ID</span>
          <input v-model="filters.storeId" class="h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <label class="space-y-2 text-sm text-slate-700">
          <span>会员 ID</span>
          <input v-model="filters.customerId" class="h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <label class="space-y-2 text-sm text-slate-700">
          <span>订单 ID</span>
          <input v-model="filters.orderId" class="h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <label class="space-y-2 text-sm text-slate-700">
          <span>状态</span>
          <input v-model="filters.status" class="h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <label class="space-y-2 text-sm text-slate-700">
          <span>数量</span>
          <input v-model="filters.limit" class="h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
      </div>
      <p v-if="errorMessage" class="mt-3 text-sm text-rose-600">{{ errorMessage }}</p>
      <p v-else-if="successMessage" class="mt-3 text-sm text-emerald-600">{{ successMessage }}</p>
    </section>

    <section class="grid gap-6 xl:grid-cols-2">
      <article class="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">权益预占</h2>
            <p class="text-sm text-slate-600">在支付前预占权益，后续再补超时释放和真实核销联动。</p>
          </div>
          <div class="flex gap-2">
            <button class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700" :disabled="saving" @click="releaseExpiredReservations">
              释放过期预占
            </button>
            <button class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700" :disabled="saving" @click="createReservation">
              创建脚手架记录
            </button>
          </div>
        </div>
        <div class="grid gap-3 md:grid-cols-3">
          <input v-model="reservationDraft.storeId" placeholder="门店 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="reservationDraft.customerId" placeholder="会员 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="reservationDraft.orderId" placeholder="订单 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="reservationDraft.targetSnapshot" placeholder="目标快照" class="h-10 rounded-md border border-slate-200 px-3 md:col-span-2" />
          <input v-model="reservationDraft.expireMinutes" placeholder="过期分钟数" class="h-10 rounded-md border border-slate-200 px-3" />
        </div>
        <table class="w-full text-left text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="pb-2">编号</th>
              <th class="pb-2">目标</th>
              <th class="pb-2">状态</th>
              <th class="pb-2">过期时间</th>
              <th class="pb-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in entitlementReservations" :key="item.id" class="border-t border-slate-100">
              <td class="py-2 font-medium text-slate-900">{{ item.reservationNo }}</td>
              <td class="py-2 text-slate-600">{{ item.targetType }} / {{ item.targetSnapshot || '-' }}</td>
              <td class="py-2 text-slate-600">{{ item.status }}</td>
              <td class="py-2 text-slate-600">{{ item.expireTime || '-' }}</td>
              <td class="py-2">
                <div v-if="item.status === 'RESERVED'" class="flex justify-end gap-2">
                  <button class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" :disabled="saving" @click="fulfillReservation(item.id)">
                    核销
                  </button>
                  <button class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" :disabled="saving" @click="releaseReservation(item.id)">
                    释放
                  </button>
                </div>
                <span v-else class="block text-right text-xs text-slate-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">组合支付</h2>
            <p class="text-sm text-slate-600">统一记录外部支付、储值、现金、优惠和减免的拆账草稿。</p>
          </div>
          <button class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700" :disabled="saving" @click="createCompositePayment">
            创建脚手架记录
          </button>
        </div>
        <div class="grid gap-3 md:grid-cols-3">
          <input v-model="compositeDraft.storeId" placeholder="门店 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="compositeDraft.customerId" placeholder="会员 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="compositeDraft.orderId" placeholder="订单 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="compositeDraft.totalAmount" placeholder="总金额" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="compositeDraft.externalAmount" placeholder="外部支付" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="compositeDraft.storedValueAmount" placeholder="储值支付" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="compositeDraft.cashAmount" placeholder="现金" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="compositeDraft.discountAmount" placeholder="优惠" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="compositeDraft.waiveAmount" placeholder="减免" class="h-10 rounded-md border border-slate-200 px-3" />
        </div>
        <table class="w-full text-left text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="pb-2">编号</th>
              <th class="pb-2">拆账</th>
              <th class="pb-2">状态</th>
              <th class="pb-2">执行模式</th>
              <th class="pb-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in compositePayments" :key="item.id" class="border-t border-slate-100">
              <td class="py-2 font-medium text-slate-900">{{ item.compositeNo }}</td>
              <td class="py-2 text-slate-600">{{ item.totalAmount }} = {{ item.externalAmount }} + {{ item.storedValueAmount }} + {{ item.cashAmount }}</td>
              <td class="py-2 text-slate-600">{{ item.status }} / {{ item.settleStatus }}</td>
              <td class="py-2 text-slate-600">{{ item.executionMode }}</td>
              <td class="py-2">
                <div v-if="item.status === 'DRAFT'" class="flex justify-end gap-2">
                  <button class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" :disabled="saving" @click="confirmCompositePayment(item.id)">
                    确认
                  </button>
                  <button class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" :disabled="saving" @click="failCompositePayment(item.id)">
                    失败
                  </button>
                </div>
                <span v-else class="block text-right text-xs text-slate-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">储值消费</h2>
            <p class="text-sm text-slate-600">先冻结储值消费，再继续补真实余额扣减和退款逆向。</p>
          </div>
          <button class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700" :disabled="saving" @click="createStoredValueConsume">
            创建脚手架记录
          </button>
        </div>
        <div class="grid gap-3 md:grid-cols-4">
          <input v-model="consumeDraft.storeId" placeholder="门店 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="consumeDraft.customerId" placeholder="会员 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="consumeDraft.orderId" placeholder="订单 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="consumeDraft.consumeAmount" placeholder="消费金额" class="h-10 rounded-md border border-slate-200 px-3" />
        </div>
        <table class="w-full text-left text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="pb-2">编号</th>
              <th class="pb-2">金额</th>
              <th class="pb-2">余额快照</th>
              <th class="pb-2">状态</th>
              <th class="pb-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in storedValueConsumes" :key="item.id" class="border-t border-slate-100">
              <td class="py-2 font-medium text-slate-900">{{ item.consumeNo }}</td>
              <td class="py-2 text-slate-600">{{ item.consumeAmount }}</td>
              <td class="py-2 text-slate-600">{{ item.balanceSnapshot }}</td>
              <td class="py-2 text-slate-600">{{ item.status }} / {{ item.reversalStatus }}</td>
              <td class="py-2">
                <div v-if="item.status === 'FROZEN'" class="flex justify-end gap-2">
                  <button class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" :disabled="saving" @click="confirmStoredValueConsume(item.id)">
                    确认
                  </button>
                  <button class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" :disabled="saving" @click="reverseStoredValueConsume(item.id)">
                    逆向
                  </button>
                </div>
                <div v-else-if="item.status === 'CONFIRMED'" class="flex justify-end">
                  <button class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" :disabled="saving" @click="reverseStoredValueConsume(item.id)">
                    逆向
                  </button>
                </div>
                <span v-else class="block text-right text-xs text-slate-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">会员提现</h2>
            <p class="text-sm text-slate-600">先进入内部审批，再继续补真实出款适配器和对账链路。</p>
          </div>
          <button class="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700" :disabled="saving" @click="createWithdrawOrder">
            创建脚手架记录
          </button>
        </div>
        <div class="grid gap-3 md:grid-cols-4">
          <input v-model="withdrawDraft.storeId" placeholder="门店 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="withdrawDraft.customerId" placeholder="会员 ID" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="withdrawDraft.withdrawAmount" placeholder="提现金额" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="withdrawDraft.accountName" placeholder="账户名称" class="h-10 rounded-md border border-slate-200 px-3" />
          <input v-model="withdrawDraft.accountNo" placeholder="账号" class="h-10 rounded-md border border-slate-200 px-3 md:col-span-2" />
        </div>
        <table class="w-full text-left text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="pb-2">编号</th>
              <th class="pb-2">金额</th>
              <th class="pb-2">审批单</th>
              <th class="pb-2">状态</th>
              <th class="pb-2 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in memberWithdrawOrders" :key="item.id" class="border-t border-slate-100">
              <td class="py-2 font-medium text-slate-900">{{ item.withdrawNo }}</td>
              <td class="py-2 text-slate-600">{{ item.withdrawAmount }}</td>
              <td class="py-2 text-slate-600">{{ item.approvalId || '-' }}</td>
              <td class="py-2 text-slate-600">{{ item.status }}</td>
              <td class="py-2">
                <div v-if="item.status === 'APPROVED'" class="flex justify-end">
                  <button class="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700" :disabled="saving" @click="markWithdrawPaid(item.id)">
                    标记出款
                  </button>
                </div>
                <span v-else class="block text-right text-xs text-slate-400">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useMemberTransactionSafety } from './useMemberTransactionSafety'

const {
  loading,
  saving,
  errorMessage,
  successMessage,
  filters,
  reservationDraft,
  compositeDraft,
  consumeDraft,
  withdrawDraft,
  entitlementReservations,
  compositePayments,
  storedValueConsumes,
  memberWithdrawOrders,
  summaryCards,
  load,
  createReservation,
  createCompositePayment,
  createStoredValueConsume,
  createWithdrawOrder,
  releaseReservation,
  releaseExpiredReservations,
  fulfillReservation,
  confirmCompositePayment,
  failCompositePayment,
  confirmStoredValueConsume,
  reverseStoredValueConsume,
  markWithdrawPaid,
} = useMemberTransactionSafety()

onMounted(() => {
  void load()
})
</script>
