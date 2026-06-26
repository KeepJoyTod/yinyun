<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 py-6">
        <section class="max-h-[92vh] w-full max-w-[860px] overflow-hidden rounded-xl border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl">
          <header class="flex items-center justify-between gap-3 border-b border-amber-topbar-border px-5 py-4">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-dark text-[#F4EFE6]">
                <CalendarPlus :size="18" :stroke-width="1.8" />
              </span>
              <div>
                <h3 class="text-[17px] font-sans font-bold leading-tight text-amber-dark">新增服务预约订单</h3>
                <p class="mt-1 text-[11px] font-sans text-amber-text-muted">写入统一订单账本；有档期时占用对应工位时段库存。</p>
              </div>
            </div>
            <button class="yy-action rounded-md p-2 text-amber-text-muted hover:bg-black/5 hover:text-amber-dark" type="button" aria-label="关闭" @click="close">
              <X :size="18" :stroke-width="1.8" />
            </button>
          </header>

          <form class="grid max-h-[calc(92vh-76px)] grid-cols-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2" @submit.prevent="submit('SAVE')">
            <div class="sm:col-span-2">
              <h4 class="text-[12px] font-sans font-semibold text-amber-dark">客户信息</h4>
            </div>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              客户姓名
              <input v-model.trim="draft.name" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none" autocomplete="name" />
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              客户手机号
              <input v-model.trim="draft.phone" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] font-mono text-amber-dark focus:border-amber-dark/40 focus:outline-none" autocomplete="tel" inputmode="tel" />
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              性别
              <select v-model="draft.gender" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                <option value="">未选择</option>
                <option value="FEMALE">女</option>
                <option value="MALE">男</option>
                <option value="UNKNOWN">其他/未知</option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              邮箱
              <input v-model.trim="draft.email" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none" autocomplete="email" inputmode="email" />
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted sm:col-span-2">
              关联客户
              <select v-model="draft.customerId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                <option value="">新客户/暂不关联</option>
                <option v-for="item in appStore.customers" :key="item.backendId" :value="item.backendId">{{ item.name }} / {{ item.mobile }}</option>
              </select>
            </label>

            <div class="border-t border-amber-topbar-border pt-4 sm:col-span-2">
              <h4 class="text-[12px] font-sans font-semibold text-amber-dark">订单信息</h4>
            </div>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              门店
              <select v-model="draft.storeName" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                <option v-for="item in appStore.stores" :key="item.backendId" :value="item.name">{{ item.name }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              服务组
              <select v-model="draft.serviceGroupId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                <option value="">请选择服务组</option>
                <option v-for="item in serviceGroupOptions" :key="item.backendId" :value="item.backendId">{{ item.name }} / {{ item.durationMinutes || 30 }}分钟</option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              产品
              <select v-model="draft.productId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                <option value="">按服务组默认</option>
                <option v-for="item in productOptions" :key="item.backendId || item.id" :value="item.backendId">{{ item.name }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              档期
              <select v-model="draft.scheduleMode" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                <option value="SCHEDULED">已定档期</option>
                <option value="UNDECIDED">档期未定</option>
                <option value="PAST_DATE">补录历史档期</option>
              </select>
            </label>

            <label v-if="draft.scheduleMode !== 'UNDECIDED'" class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
              预约日期
              <input v-model.trim="draft.date" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] font-mono text-amber-dark focus:border-amber-dark/40 focus:outline-none" placeholder="YYYY-MM-DD" />
            </label>

            <div v-if="draft.scheduleMode !== 'UNDECIDED'" class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
                开始时间
                <input v-model.trim="draft.startTime" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] font-mono text-amber-dark focus:border-amber-dark/40 focus:outline-none" placeholder="10:00" />
              </label>
              <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
                时长
                <select v-model.number="draft.durationMinutes" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                  <option v-for="item in durationOptions" :key="item" :value="item">{{ item }} 分钟</option>
                </select>
              </label>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
                支付状态
                <select v-model="draft.payStatus" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                  <option value="UNPAID">待支付</option>
                  <option value="PAID">已支付</option>
                </select>
              </label>
              <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted">
                订单状态
                <select v-model="draft.status" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                  <option value="PENDING">待确认</option>
                  <option value="CONFIRMED">已确认</option>
                </select>
              </label>
            </div>

            <label class="flex items-center gap-2 rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[11px] font-sans font-medium text-amber-text-muted sm:col-span-2">
              <input v-model="draft.notifyEnabled" type="checkbox" class="h-4 w-4 accent-amber-dark" />
              发送通知
            </label>

            <div class="sm:col-span-2">
              <OrderAttributeFieldsSection
                :fields="draft.orderAttributes || []"
                :loading="orderAttributeLoading"
                description="这些字段来自当前门店模板，保存时会和订单一起写入快照。"
                @update:fields="draft.orderAttributes = $event"
              />
            </div>

            <label class="flex flex-col gap-1.5 text-[11px] font-sans font-medium text-amber-text-muted sm:col-span-2">
              备注
              <textarea v-model.trim="draft.remark" class="min-h-[72px] rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none" />
            </label>

            <p v-if="errorMessage" class="sm:col-span-2 rounded-md border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[12px] text-[var(--color-status-danger)]">
              {{ errorMessage }}
            </p>

            <footer class="flex items-center justify-between gap-3 border-t border-amber-topbar-border pt-4 sm:col-span-2">
              <span class="text-[11px] font-mono text-amber-text-muted">时段 {{ draft.date || '-' }} {{ draft.startTime || '--:--' }} - {{ slotEndTime || '--:--' }}</span>
              <div class="flex items-center gap-2">
                <button class="yy-action rounded-md border border-amber-topbar-border bg-white px-4 py-2 text-[12px] font-medium text-amber-text-muted hover:bg-black/5" type="button" @click="close">
                  返回
                </button>
                <button class="yy-action rounded-md border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] font-medium text-[#F4EFE6] disabled:cursor-not-allowed disabled:opacity-65" type="submit" :disabled="submitting">
                  {{ submitting ? '保存中...' : '保存' }}
                </button>
                <button class="yy-action rounded-md border border-amber-dark bg-white px-4 py-2 text-[12px] font-medium text-amber-dark disabled:cursor-not-allowed disabled:opacity-65" type="button" :disabled="submitting" @click="submit('SAVE_AND_RECEIVE')">
                  保存并接待
                </button>
              </div>
            </footer>
          </form>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { CalendarPlus, X } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { appStore, type BookingOrder } from '../../shared/stores/appStore'
import OrderAttributeFieldsSection from './OrderAttributeFieldsSection.vue'
import type { StaffBookingInitial } from './staffBookingModalOperations'
import { useStaffBookingModalState } from './useStaffBookingModalState'

export type { StaffBookingInitial } from './staffBookingModalOperations'

const props = defineProps<{
  open: boolean
  initial?: StaffBookingInitial | null
}>()

const emit = defineEmits<{
  close: []
  created: [order: BookingOrder]
}>()

const router = useRouter()
const { draft, submitting, errorMessage, orderAttributeLoading, serviceGroupOptions, productOptions, durationOptions, slotEndTime, close, submit } =
  useStaffBookingModalState(props, emit, router)
</script>
