<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm">
      <form class="w-full max-w-[760px] overflow-hidden border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border px-6 py-5">
          <div>
            <div class="text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">Coupon Template</div>
            <h2 class="mt-1 text-[18px] font-semibold text-amber-dark">{{ templateId ? '编辑券模板' : '新建券模板' }}</h2>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('close')">关闭</button>
        </div>

        <div class="grid gap-4 px-6 py-5 md:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">模板名称</span>
            <input v-model="draft.templateName" required class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">券类型</span>
            <select v-model="draft.templateType" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
              <option value="CASH">现金券</option>
              <option value="DISCOUNT">折扣券</option>
              <option value="REDEEM">兑换券</option>
            </select>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">适用门店</span>
            <select v-model="draft.storeIds" multiple required class="min-h-[96px] border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark outline-none">
              <option v-for="store in stores" :key="store.backendId" :value="store.backendId">{{ store.name }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">适用商品</span>
            <select v-model="draft.productIds" multiple required class="min-h-[96px] border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark outline-none">
              <option v-for="product in products" :key="product.backendId || product.id" :value="product.backendId || product.id">{{ product.name }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">面额（分）</span>
            <input v-model.number="draft.faceValueCent" min="1" required type="number" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">使用门槛（分）</span>
            <input v-model.number="draft.minSpendCent" min="0" type="number" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">开始时间</span>
            <input v-model="draft.startAt" required type="datetime-local" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">结束时间</span>
            <input v-model="draft.endAt" required type="datetime-local" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">状态</span>
            <select v-model="draft.status" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
              <option value="ACTIVE">启用</option>
              <option value="INACTIVE">停用</option>
              <option value="DRAFT">草稿</option>
            </select>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">叠加规则</span>
            <select v-model="draft.stackPolicy" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
              <option value="COUPON_CODE_MUTEX">优惠券与优惠码互斥</option>
              <option value="CARD_RIGHT_MUTEX">权益与券码互斥</option>
              <option value="REDEEM_EXCLUSIVE">兑换券独占</option>
            </select>
          </label>
          <label class="flex items-center gap-2 text-[11px] text-amber-dark">
            <input v-model="draft.restoreOnRefund" type="checkbox" />
            允许退单恢复
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
          <button class="yy-action px-4 py-2 text-[11px] text-amber-text-muted hover:text-amber-dark" type="button" @click="$emit('close')">取消</button>
          <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="submit" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存券模板' }}
          </button>
        </div>
      </form>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ProductConfig, StoreInfo } from '../../../shared/stores/appStore'
import type { CouponTemplateDraft } from '../composables/useCouponTemplates'

const props = defineProps<{
  show: boolean
  templateId?: string
  initialDraft: CouponTemplateDraft
  stores: StoreInfo[]
  products: ProductConfig[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [draft: CouponTemplateDraft]
}>()

const draft = reactive<CouponTemplateDraft>({ ...props.initialDraft })

watch(
  () => [props.show, props.initialDraft],
  () => Object.assign(draft, props.initialDraft),
  { immediate: true, deep: true },
)

const submit = () => {
  emit('submit', {
    ...draft,
    storeIds: [...draft.storeIds],
    productIds: [...draft.productIds],
  })
}
</script>
