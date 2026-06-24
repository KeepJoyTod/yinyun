<template>
  <Transition name="fade">
    <div v-if="show && product" class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/42 p-4 backdrop-blur-sm">
      <div class="w-full max-w-[920px] overflow-hidden rounded-[28px] border border-amber-topbar-border bg-[#FBF8F2] shadow-[0_32px_120px_rgba(26,24,20,0.22)]">
        <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border px-7 py-6">
          <div>
            <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Product Actions</p>
            <h3 class="mt-2 text-[26px] font-sans font-black tracking-[-0.02em] text-amber-dark">{{ product.nickname || product.name }}</h3>
            <p class="mt-2 max-w-[560px] text-[12px] leading-relaxed text-amber-text-muted">
              在这里补齐发布状态、互斥规则、关联商品、上架配置和下单限制，方便后续商品联动运营。
            </p>
          </div>
          <button class="yy-action rounded-xl border border-amber-topbar-border p-2 hover:bg-black/5" type="button" @click="$emit('close')">
            <img src="../../../assets/icons/close.svg" class="h-3.5 w-3.5 opacity-40" />
          </button>
        </div>

        <div class="grid grid-cols-1 gap-6 px-7 py-6 lg:grid-cols-[300px_1fr]">
          <aside class="rounded-[24px] border border-amber-topbar-border bg-[#F7F1E4] p-4">
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="action in actionCards"
                :key="action.key"
                class="yy-action rounded-[18px] border px-4 py-4 text-left transition-all"
                :class="currentAction === action.key
                  ? 'border-amber-dark bg-amber-dark text-[#F4EFE6] shadow-[0_18px_34px_rgba(26,24,20,0.15)]'
                  : 'border-amber-topbar-border bg-white/75 text-amber-dark hover:bg-white'"
                type="button"
                @click="currentAction = action.key"
              >
                <div class="flex items-center gap-2 text-[11px] font-semibold">
                  <span
                    class="inline-flex h-7 w-7 items-center justify-center rounded-full border"
                    :class="currentAction === action.key ? 'border-white/25 bg-white/10' : 'border-amber-topbar-border bg-[#FBF7F0]'"
                  >
                    {{ action.short }}
                  </span>
                  <span>{{ action.label }}</span>
                </div>
                <p class="mt-3 text-[10px] leading-relaxed" :class="currentAction === action.key ? 'text-[#F4EFE6]/70' : 'text-amber-text-muted'">
                  {{ action.hint }}
                </p>
              </button>
            </div>
          </aside>

          <section class="rounded-[24px] border border-amber-topbar-border bg-white/80 p-5">
            <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border pb-4">
              <div>
                <p class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">{{ currentMeta.meta }}</p>
                <h4 class="mt-2 text-[22px] font-sans font-black tracking-[-0.02em] text-amber-dark">{{ currentMeta.label }}</h4>
                <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">{{ currentMeta.detail }}</p>
              </div>
              <span class="rounded-full border border-amber-topbar-border bg-[#FBF7F0] px-3 py-1 text-[10px] text-amber-text-muted">
                {{ draft.published ? '已发布' : '已取消发布' }}
              </span>
            </div>

            <div class="mt-5">
              <div v-if="currentAction === 'edit'" class="space-y-4">
                <div class="rounded-[20px] border border-amber-topbar-border bg-[#FBF7F0] p-4">
                  <div class="text-[11px] font-semibold text-amber-dark">商品基础信息</div>
                  <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">
                    继续沿用商品编辑表单，维护封面、名称、规格、价格、门店范围和商品说明。
                  </p>
                </div>
                <button
                  class="yy-action inline-flex min-h-[42px] items-center rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6] hover:bg-black"
                  type="button"
                  @click="$emit('edit-product', product)"
                >
                  打开商品编辑
                </button>
              </div>

              <div v-else-if="currentAction === 'publish'" class="space-y-4">
                <label class="flex cursor-pointer items-start gap-3 rounded-[18px] border border-amber-topbar-border bg-[#FBF7F0] p-4">
                  <input v-model="draft.published" class="mt-1" type="checkbox" />
                  <div>
                    <div class="text-[12px] font-semibold text-amber-dark">继续发布到商品列表</div>
                    <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">
                      关闭后会同步切换成未发布状态，列表、加购入口和门店工作台都会视为已下架。
                    </p>
                  </div>
                </label>
              </div>

              <div v-else-if="currentAction === 'exclusive'" class="space-y-4">
                <label class="flex flex-col gap-2">
                  <span class="text-[11px] font-semibold text-amber-dark">互斥规则</span>
                  <textarea
                    v-model="draft.mutuallyExclusiveRule"
                    rows="4"
                    maxlength="160"
                    class="rounded-[18px] border border-amber-topbar-border bg-[#FBF7F0] px-4 py-3 text-[11px] text-amber-dark outline-none focus:border-amber-dark/40"
                    placeholder="例如：与同档期特价券、同类加片包或指定团购活动互斥"
                  />
                </label>
              </div>

              <div v-else-if="currentAction === 'linked'" class="space-y-4">
                <label class="flex flex-col gap-2">
                  <span class="text-[11px] font-semibold text-amber-dark">关联产品</span>
                  <select
                    v-model="draft.linkedProductIds"
                    multiple
                    class="min-h-[180px] rounded-[18px] border border-amber-topbar-border bg-[#FBF7F0] px-4 py-3 text-[11px] text-amber-dark outline-none focus:border-amber-dark/40"
                  >
                    <option v-for="option in filteredLinkableProducts" :key="option.id" :value="option.id">
                      {{ option.name }} / {{ option.category }}
                    </option>
                  </select>
                  <span class="text-[10px] text-amber-text-muted">用于加片包、冲印包、入册和卡项联动推荐。</span>
                </label>
              </div>

              <div v-else-if="currentAction === 'shelf'" class="space-y-4">
                <label class="flex flex-col gap-2">
                  <span class="text-[11px] font-semibold text-amber-dark">上架配置</span>
                  <textarea
                    v-model="draft.shelfConfig"
                    rows="4"
                    maxlength="180"
                    class="rounded-[18px] border border-amber-topbar-border bg-[#FBF7F0] px-4 py-3 text-[11px] text-amber-dark outline-none focus:border-amber-dark/40"
                    placeholder="例如：同步到预约页、选片加购区、门店工作台，仅指定门店可见"
                  />
                </label>
              </div>

              <div v-else-if="currentAction === 'limit'" class="space-y-4">
                <label class="flex flex-col gap-2">
                  <span class="text-[11px] font-semibold text-amber-dark">下单限制</span>
                  <textarea
                    v-model="draft.orderLimitRule"
                    rows="4"
                    maxlength="180"
                    class="rounded-[18px] border border-amber-topbar-border bg-[#FBF7F0] px-4 py-3 text-[11px] text-amber-dark outline-none focus:border-amber-dark/40"
                    placeholder="例如：单手机号 7 天内限购 2 次，拍摄完成后 48 小时内可加购"
                  />
                </label>
              </div>
            </div>

            <div class="mt-6 flex items-center justify-end gap-3 border-t border-amber-topbar-border pt-5">
              <button class="yy-action px-4 py-2 text-[11px] text-amber-text-muted hover:text-amber-dark" type="button" @click="$emit('close')">
                取消
              </button>
              <button
                class="yy-action rounded-xl border border-amber-dark bg-amber-dark px-5 py-2 text-[11px] font-semibold text-[#F4EFE6] hover:bg-black"
                type="button"
                @click="submit"
              >
                保存当前设置
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { ProductConfig } from '../../../shared/stores/appStore'

export type ProductCardActionKey = 'edit' | 'publish' | 'exclusive' | 'linked' | 'shelf' | 'limit'

type LinkableProductOption = {
  id: string
  name: string
  category: string
}

type ActionCard = {
  key: ProductCardActionKey
  label: string
  short: string
  hint: string
  meta: string
  detail: string
}

export type ProductCardActionUpdatePayload = {
  product: ProductConfig
  activeAction: ProductCardActionKey
  published: boolean
  mutuallyExclusiveRule: string
  linkedProductIds: string[]
  shelfConfig: string
  orderLimitRule: string
}

const props = defineProps<{
  show: boolean
  product: ProductConfig | null
  linkableProducts: LinkableProductOption[]
  initialAction?: ProductCardActionKey
}>()

const emit = defineEmits<{
  close: []
  'edit-product': [product: ProductConfig]
  submit: [payload: ProductCardActionUpdatePayload]
}>()

const currentAction = ref<ProductCardActionKey>('edit')
const draft = reactive({
  published: true,
  mutuallyExclusiveRule: '',
  linkedProductIds: [] as string[],
  shelfConfig: '',
  orderLimitRule: '',
})

const actionCards: ActionCard[] = [
  { key: 'edit', label: '修改', short: '改', hint: '编辑商品基础信息', meta: 'BASE', detail: '用于维护商品封面、名称、规格、价格与门店适用范围。' },
  { key: 'publish', label: '取消发布', short: '发', hint: '控制商品是否对外发布', meta: 'STATUS', detail: '取消发布后，附加商品会从当前运营入口中撤下。' },
  { key: 'exclusive', label: '互斥规则', short: '斥', hint: '维护互斥销售规则', meta: 'RULE', detail: '适合活动档期、同类商品和渠道限制的业务说明。' },
  { key: 'linked', label: '关联产品', short: '联', hint: '配置联动推荐商品', meta: 'LINK', detail: '可把服务产品、冲印、入册和卡项商品纳入同一条推荐链路。' },
  { key: 'shelf', label: '上架配置', short: '架', hint: '维护上架入口说明', meta: 'SHELF', detail: '记录预约页、选片加购区、门店工作台等露出位置。' },
  { key: 'limit', label: '下单限制', short: '限', hint: '维护下单约束规则', meta: 'ORDER', detail: '记录限购频控、可售时间窗和其他业务限制。' },
]

const currentMeta = computed(() => actionCards.find(item => item.key === currentAction.value) ?? actionCards[0])
const filteredLinkableProducts = computed(() => props.linkableProducts.filter(item => item.id !== props.product?.id))

const syncDraft = () => {
  currentAction.value = props.initialAction ?? 'edit'
  draft.published = props.product?.publishStatus !== 'UNPUBLISHED' && Boolean(props.product?.active)
  draft.mutuallyExclusiveRule = props.product?.mutuallyExclusiveRule ?? ''
  draft.linkedProductIds = [...(props.product?.linkedProductIds ?? [])]
  draft.shelfConfig = props.product?.shelfConfig ?? ''
  draft.orderLimitRule = props.product?.orderLimitRule ?? ''
}

watch(
  () => props.show,
  visible => {
    if (visible) syncDraft()
  },
)

watch(
  () => props.product,
  () => {
    if (props.show) syncDraft()
  },
)

watch(
  () => props.initialAction,
  next => {
    if (next) currentAction.value = next
  },
)

const submit = () => {
  if (!props.product) return
  emit('submit', {
    product: props.product,
    activeAction: currentAction.value,
    published: draft.published,
    mutuallyExclusiveRule: draft.mutuallyExclusiveRule.trim(),
    linkedProductIds: [...draft.linkedProductIds],
    shelfConfig: draft.shelfConfig.trim(),
    orderLimitRule: draft.orderLimitRule.trim(),
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.24s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>