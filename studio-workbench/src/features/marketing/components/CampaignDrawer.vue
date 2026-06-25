<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm">
      <form class="w-full max-w-[760px] overflow-hidden border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl" @submit.prevent="submit">
        <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border px-6 py-5">
          <div>
            <div class="text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">Campaign</div>
            <h2 class="mt-1 text-[18px] font-semibold text-amber-dark">{{ campaignId ? '编辑活动' : '新建活动' }}</h2>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('close')">关闭</button>
        </div>

        <div class="grid gap-4 px-6 py-5 md:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">活动名称</span>
            <input v-model="draft.campaignName" required class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">活动类型</span>
            <select v-model="draft.campaignType" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
              <option value="SECKILL">秒杀</option>
              <option value="GROUP_BUY">拼团</option>
              <option value="BARGAIN">砍价</option>
              <option value="LIMITED_DISCOUNT">限时折扣</option>
              <option value="SHARE_GIFT">分享有礼</option>
            </select>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">适用门店</span>
            <select v-model="draft.storeIds" multiple required class="min-h-[96px] border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark outline-none">
              <option v-for="store in stores" :key="store.backendId" :value="store.backendId">{{ store.name }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">绑定商品</span>
            <select v-model="draft.productIds" multiple class="min-h-[96px] border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark outline-none">
              <option v-for="product in products" :key="product.backendId || product.id" :value="product.backendId || product.id">{{ product.name }}</option>
            </select>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">开始时间</span>
            <input v-model="draft.startAt" required type="datetime-local" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">结束时间</span>
            <input v-model="draft.endAt" required type="datetime-local" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" />
          </label>
          <label class="flex flex-col gap-2 md:col-span-2">
            <span class="text-[11px] font-medium text-amber-dark">规则摘要</span>
            <textarea v-model="draft.ruleSummary" rows="3" class="border border-amber-topbar-border bg-white px-3 py-2 text-[11px] text-amber-dark outline-none"></textarea>
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">状态</span>
            <select v-model="draft.status" class="h-10 border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none">
              <option value="DRAFT">草稿</option>
              <option value="ONLINE">上线</option>
              <option value="OFFLINE">下线</option>
            </select>
          </label>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-6 py-4">
          <button class="yy-action px-4 py-2 text-[11px] text-amber-text-muted hover:text-amber-dark" type="button" @click="$emit('close')">取消</button>
          <button class="yy-action border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="submit" :disabled="submitting">
            {{ submitting ? '保存中...' : '保存活动' }}
          </button>
        </div>
      </form>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { ProductConfig, StoreInfo } from '../../../shared/stores/appStore'
import type { CampaignDraft } from '../composables/useCampaignEditor'

const props = defineProps<{
  show: boolean
  campaignId?: string
  initialDraft: CampaignDraft
  stores: StoreInfo[]
  products: ProductConfig[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [draft: CampaignDraft]
}>()

const draft = reactive<CampaignDraft>({ ...props.initialDraft })

watch(
  () => [props.show, props.initialDraft],
  () => Object.assign(draft, props.initialDraft, {
    storeIds: [...props.initialDraft.storeIds],
    productIds: [...props.initialDraft.productIds],
  }),
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
