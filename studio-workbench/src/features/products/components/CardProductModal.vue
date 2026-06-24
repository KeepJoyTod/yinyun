<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 bg-[#1A1814]/42 p-4 backdrop-blur-sm">
      <div class="flex min-h-full items-center justify-center">
        <div class="flex max-h-[calc(100vh-32px)] w-full max-w-[1080px] flex-col overflow-hidden rounded-[28px] border border-amber-topbar-border bg-[#FBF8F2] shadow-[0_32px_120px_rgba(26,24,20,0.22)]">
          <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border px-7 py-6">
            <div>
              <p class="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">Card Product</p>
              <h3 class="mt-2 text-[26px] font-sans font-black tracking-[-0.02em] text-amber-dark">
                {{ mode === 'add' ? `新增${cardTypeLabel}` : `编辑${cardTypeLabel}` }}
              </h3>
              <p class="mt-2 max-w-[620px] text-[12px] leading-relaxed text-amber-text-muted">
                在原有商品后台风格里维护卡项信息，统一配置售价、权益范围、有效期、生效方式和详情说明。
              </p>
            </div>
            <button class="yy-action rounded-xl border border-amber-topbar-border p-2 hover:bg-black/5" type="button" @click="$emit('close')">
              <img src="../../../assets/icons/close.svg" class="h-3.5 w-3.5 opacity-40" />
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-7 py-6">
            <div v-if="submitError" class="mb-6 rounded-[18px] border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[12px] text-[var(--color-status-danger)]">
              {{ submitError }}
            </div>

            <section class="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div class="space-y-5">
                <PanelBlock title="卡项基础" description="先补齐卡项名称、别名和主金额字段。">
                  <div class="grid gap-4 md:grid-cols-2">
                    <FieldBlock label="卡项名称" required>
                      <input
                        v-model.trim="form.name"
                        class="h-11 w-full rounded-[16px] border border-amber-topbar-border bg-white px-4 text-[12px] text-amber-dark outline-none focus:border-amber-dark/40"
                        placeholder="请输入卡项名称"
                        type="text"
                      />
                    </FieldBlock>
                    <FieldBlock label="卡项别名">
                      <input
                        v-model.trim="form.nickname"
                        class="h-11 w-full rounded-[16px] border border-amber-topbar-border bg-white px-4 text-[12px] text-amber-dark outline-none focus:border-amber-dark/40"
                        placeholder="例如年卡、季度储值卡"
                        type="text"
                      />
                    </FieldBlock>
                  </div>

                  <div v-if="cardMode === 'TIMES'" class="grid gap-4 md:grid-cols-2">
                    <FieldBlock label="售价" required>
                      <AmountInput v-model="form.cardSalePrice" placeholder="请输入售价" />
                    </FieldBlock>
                    <FieldBlock label="次卡类型" required>
                      <div class="flex flex-wrap gap-3">
                        <RadioChip v-model="form.cardTimesType" value="SINGLE" label="单项次数" />
                        <RadioChip v-model="form.cardTimesType" value="SHARED" label="共享次数" />
                      </div>
                      <p class="mt-2 text-[10px] leading-relaxed text-amber-text-muted">
                        单项次数按服务逐项核销，共享次数可在同组权益内共用。
                      </p>
                    </FieldBlock>
                  </div>

                  <div v-else class="grid gap-4 md:grid-cols-3">
                    <FieldBlock label="充值金额" required>
                      <AmountInput v-model="form.cardRechargeAmount" placeholder="请输入充值金额" />
                    </FieldBlock>
                    <FieldBlock label="赠送金额">
                      <AmountInput v-model="form.cardGiftAmount" placeholder="例如 100" />
                    </FieldBlock>
                    <FieldBlock label="开卡额外赠送金额">
                      <AmountInput v-model="form.cardOpeningGiftAmount" placeholder="例如 50" />
                    </FieldBlock>
                  </div>
                </PanelBlock>

                <PanelBlock
                  :title="cardMode === 'TIMES' ? '服务权益' : '适用服务'"
                  :description="cardMode === 'TIMES'
                    ? '配置次卡可核销的服务项目；单项次数支持逐项设置次数。'
                    : '配置储值卡可抵扣的服务产品范围，也可直接放开到全部产品。'"
                >
                  <div v-if="cardMode === 'STORED'" class="mb-4">
                    <div class="flex flex-wrap gap-3">
                      <RadioChip v-model="form.cardProductScope" value="SELECTED" label="选择产品" />
                      <RadioChip v-model="form.cardProductScope" value="ALL" label="全部产品（含后续新产品）" />
                    </div>
                  </div>

                  <div v-if="cardMode === 'STORED' && form.cardProductScope === 'ALL'" class="rounded-[18px] border border-amber-topbar-border bg-[#F7F1E4] px-4 py-3 text-[11px] leading-relaxed text-amber-text-muted">
                    当前储值卡已设置为可覆盖全部产品，后续新增商品也会自动纳入同一范围。
                  </div>

                  <div v-else class="space-y-3">
                    <ServiceItemRow
                      v-for="(item, index) in form.cardServiceItems"
                      :key="`service-${index}`"
                      :count-enabled="cardMode === 'TIMES'"
                      :item="item"
                      :options="productOptions"
                      label-prefix="服务"
                      @change="payload => updateServiceItem(index, payload)"
                      @remove="removeServiceItem(index)"
                    />
                    <button class="yy-action rounded-[16px] border border-amber-dark/20 bg-white px-4 py-3 text-[12px] font-semibold text-amber-accent hover:bg-[#FFF4E8]" type="button" @click="addServiceItem()">
                      + 添加服务
                    </button>
                  </div>
                </PanelBlock>

                <PanelBlock
                  :title="cardMode === 'TIMES' ? '赠送项目' : '开卡赠送项目'"
                  :description="cardMode === 'TIMES' ? '可设置额外赠送的服务或加购权益。' : '可设置开卡时直接赠送的服务权益。'"
                >
                  <div class="space-y-3">
                    <ServiceItemRow
                      v-for="(item, index) in form.cardGiftItems"
                      :key="`gift-${index}`"
                      :count-enabled="true"
                      :item="item"
                      :options="productOptions"
                      label-prefix="赠送"
                      @change="payload => updateGiftItem(index, payload)"
                      @remove="removeGiftItem(index)"
                    />
                    <button class="yy-action rounded-[16px] border border-amber-dark/20 bg-white px-4 py-3 text-[12px] font-semibold text-amber-accent hover:bg-[#FFF4E8]" type="button" @click="addGiftItem()">
                      + 添加赠送
                    </button>
                  </div>
                </PanelBlock>
              </div>

              <div class="space-y-5">
                <PanelBlock title="有效期设置" description="支持永久有效、自激活日起按天有效，或固定截止日期。">
                  <div class="space-y-3">
                    <ChoiceCard v-model="form.cardValidityMode" value="FOREVER" title="永久有效" description="卡项不限制截止日期" />
                    <ChoiceCard v-model="form.cardValidityMode" value="AFTER_ACTIVATION" title="自激活日起按天有效" description="售卡后从激活日起开始计算有效天数" />
                    <ChoiceCard v-model="form.cardValidityMode" value="FIXED_DATE" title="有效期至指定日期" description="适合活动卡、季度卡等固定周期卡项" />
                  </div>

                  <div v-if="form.cardValidityMode === 'AFTER_ACTIVATION'" class="mt-4">
                    <FieldBlock label="有效天数" required>
                      <div class="flex items-center gap-3">
                        <input
                          v-model.number="form.cardValidityDays"
                          class="h-11 w-[180px] rounded-[16px] border border-amber-topbar-border bg-white px-4 text-[12px] text-amber-dark outline-none focus:border-amber-dark/40"
                          min="1"
                          step="1"
                          type="number"
                        />
                        <span class="text-[12px] font-semibold text-amber-dark">天</span>
                      </div>
                    </FieldBlock>
                  </div>

                  <div v-if="form.cardValidityMode === 'FIXED_DATE'" class="mt-4">
                    <FieldBlock label="截止日期" required>
                      <input
                        v-model="form.cardValidityDate"
                        class="h-11 w-full rounded-[16px] border border-amber-topbar-border bg-white px-4 text-[12px] text-amber-dark outline-none focus:border-amber-dark/40"
                        type="date"
                      />
                    </FieldBlock>
                  </div>
                </PanelBlock>

                <PanelBlock title="生效方式" description="售卡后立即生效，或由顾客手动激活后生效。">
                  <div class="space-y-3">
                    <ChoiceCard v-model="form.cardActivationMode" value="IMMEDIATE" title="售卡即生效" description="适合门店直接核销或即时使用的卡项" />
                    <ChoiceCard v-model="form.cardActivationMode" value="MANUAL" title="售卡后需顾客手动激活" description="适合可转赠、需客户确认开始时间的卡项" />
                  </div>
                </PanelBlock>

                <PanelBlock title="展示与说明" description="补齐简介说明、详情介绍和发布状态，方便后续页面联调。">
                  <div class="grid gap-4">
                    <FieldBlock label="简介说明">
                      <textarea
                        v-model.trim="form.intro"
                        rows="4"
                        class="w-full rounded-[16px] border border-amber-topbar-border bg-white px-4 py-3 text-[12px] text-amber-dark outline-none focus:border-amber-dark/40"
                        placeholder="用于卡项卡片、列表和关联商品里的简短介绍"
                      />
                    </FieldBlock>
                    <FieldBlock label="详情介绍" required>
                      <textarea
                        v-model.trim="form.desc"
                        rows="6"
                        class="w-full rounded-[16px] border border-amber-topbar-border bg-white px-4 py-3 text-[12px] text-amber-dark outline-none focus:border-amber-dark/40"
                        placeholder="用于商品详情和门店说明的完整介绍"
                      />
                    </FieldBlock>
                    <FieldBlock label="发布状态">
                      <div class="flex flex-wrap gap-3">
                        <RadioChip v-model="form.publishMode" value="PUBLISHED" label="保存并发布" />
                        <RadioChip v-model="form.publishMode" value="DRAFT" label="先存草稿" />
                      </div>
                    </FieldBlock>
                  </div>
                </PanelBlock>

                <PanelBlock title="配置摘要" description="当前卡项的关键配置会同步沉淀到商品主数据。">
                  <div class="grid gap-3 md:grid-cols-2">
                    <SummaryCard label="卡项类型" :value="cardTypeLabel" />
                    <SummaryCard label="权益项目数" :value="String(form.cardServiceItems.filter(item => item.productName.trim()).length)" />
                    <SummaryCard label="赠送项目数" :value="String(form.cardGiftItems.filter(item => item.productName.trim()).length)" />
                    <SummaryCard label="有效期" :value="validitySummary" />
                  </div>
                </PanelBlock>
              </div>
            </section>
          </div>

          <div class="shrink-0 border-t border-amber-topbar-border bg-[#FBF8F2]/95 px-7 py-5 shadow-[0_-18px_36px_rgba(26,24,20,0.06)] backdrop-blur">
            <div class="flex items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
            <div class="text-[11px] leading-relaxed text-amber-text-muted">
              保存后会即时刷新卡项产品列表，并联动当前工作台中的商品主数据。
            </div>
            <div class="flex items-center justify-end gap-3">
              <button class="yy-action px-4 py-2 text-[11px] text-amber-text-muted hover:text-amber-dark" type="button" @click="$emit('close')">
                取消
              </button>
              <button
                class="yy-action rounded-xl border border-amber-dark bg-amber-dark px-5 py-2 text-[11px] font-semibold text-[#F4EFE6] hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
                :disabled="submitting"
                type="button"
                @click="submit"
              >
                {{ submitting ? '保存中...' : mode === 'add' ? '创建卡项' : '保存修改' }}
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { CardProductItem, ProductConfig } from '../../../shared/stores/appStore'
import {
  buildCardFormFromProduct,
  buildCardProductPayload,
  buildDefaultCardForm,
  defaultCardProductItem,
  resolveCardValiditySummary,
  validateCardForm,
  type CardFormState,
  type CardModalType,
} from './cardProductModalOperations'
import {
  AmountInput,
  ChoiceCard,
  FieldBlock,
  PanelBlock,
  RadioChip,
  ServiceItemRow,
  SummaryCard,
  type ProductOption,
} from './cardProductModalUi'

const props = defineProps<{
  show: boolean
  mode: 'add' | 'edit'
  cardType: CardModalType
  initialData?: ProductConfig | null
  productOptions?: ProductOption[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: ProductConfig]
}>()

const form = reactive<CardFormState>(buildDefaultCardForm('times'))
const submitError = reactive({ message: '' })

const cardMode = computed(() => form.cardMode)
const cardTypeLabel = computed(() => (cardMode.value === 'STORED' ? '储值卡' : '次卡'))

const validitySummary = computed(() => resolveCardValiditySummary(form))

const productOptions = computed(() => props.productOptions ?? [])

const resetForm = () => {
  Object.assign(form, buildCardFormFromProduct(props.cardType, props.initialData))
  submitError.message = ''
}

const addServiceItem = () => {
  form.cardServiceItems = [...form.cardServiceItems, defaultCardProductItem()]
}

const removeServiceItem = (index: number) => {
  form.cardServiceItems = form.cardServiceItems.filter((_, itemIndex) => itemIndex !== index)
  if (!form.cardServiceItems.length) form.cardServiceItems = [defaultCardProductItem()]
}

const updateServiceItem = (index: number, payload: CardProductItem) => {
  form.cardServiceItems = form.cardServiceItems.map((item, itemIndex) => (itemIndex === index ? payload : item))
}

const addGiftItem = () => {
  form.cardGiftItems = [...form.cardGiftItems, defaultCardProductItem()]
}

const removeGiftItem = (index: number) => {
  form.cardGiftItems = form.cardGiftItems.filter((_, itemIndex) => itemIndex !== index)
  if (!form.cardGiftItems.length) form.cardGiftItems = [defaultCardProductItem()]
}

const updateGiftItem = (index: number, payload: CardProductItem) => {
  form.cardGiftItems = form.cardGiftItems.map((item, itemIndex) => (itemIndex === index ? payload : item))
}

const submit = () => {
  const error = validateCardForm(form)
  submitError.message = error
  if (error) return
  emit('submit', buildCardProductPayload({
    form,
    initialData: props.initialData,
    validitySummary: validitySummary.value,
  }))
}

watch(
  () => [props.show, props.initialData, props.cardType],
  ([visible]) => {
    if (visible) resetForm()
  },
  { deep: true, immediate: true },
)
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
