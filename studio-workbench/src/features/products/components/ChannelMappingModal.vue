<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 backdrop-blur-sm p-4">
      <div class="bg-[#FBF8F2] border border-amber-topbar-border rounded-md shadow-2xl w-full max-w-[720px] flex flex-col overflow-hidden">
        <div class="px-7 py-5 border-b border-amber-topbar-border flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">渠道映射</span>
            <h2 class="text-[17.5px] font-sans font-medium text-amber-dark leading-none tracking-tight">
              {{ mode === 'add' ? `新增${channelLabel}映射` : `编辑${channelLabel}映射` }}
            </h2>
            <p class="text-[10.5px] font-sans text-amber-text-muted mt-1 opacity-70">维护本地服务产品与渠道商品、SKU、POI、入口和状态的对应关系</p>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-black/5 rounded-md transition-all" type="button">
            <img src="../../../assets/icons/close.svg" class="w-3.5 h-3.5 opacity-40" />
          </button>
        </div>

        <div class="p-7 overflow-y-auto max-h-[72vh] flex flex-col gap-6">
          <Transition name="fade">
            <div
              v-if="submitError"
              class="border border-[var(--color-status-danger-border)] bg-[var(--color-status-danger-bg)] px-4 py-3 text-[11px] font-sans text-[var(--color-status-danger)]"
            >
              {{ submitError }}
            </div>
          </Transition>

          <div class="grid grid-cols-2 gap-x-4 gap-y-5 max-[720px]:grid-cols-1">
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">门店</label>
              <select
                v-model="formData.storeBackendId"
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-sans focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.storeBackendId ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              >
                <option value="">请选择门店</option>
                <option v-for="store in storeOptions" :key="store.backendId" :value="store.backendId">
                  {{ store.name }}
                </option>
              </select>
              <p v-if="fieldErrors.storeBackendId" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.storeBackendId }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">本地产品</label>
              <select
                v-model="formData.productBackendId"
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-sans focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.productBackendId ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              >
                <option value="">请选择服务产品</option>
                <option v-for="product in productOptions" :key="product.backendId" :value="product.backendId">
                  {{ product.name }} · {{ product.id }}
                </option>
              </select>
              <p v-if="fieldErrors.productBackendId" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.productBackendId }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">渠道商品名</label>
              <input
                v-model="formData.externalName"
                type="text"
                placeholder="例如：抖音来客 · 证件照快拍精修"
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-sans focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.externalName ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              />
              <p v-if="fieldErrors.externalName" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.externalName }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">映射状态</label>
              <select
                v-model="formData.mappingStatus"
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-sans focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.mappingStatus ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              >
                <option v-for="status in mappingStatusOptions" :key="status" :value="status">{{ status }}</option>
              </select>
              <p v-if="fieldErrors.mappingStatus" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.mappingStatus }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">外部 Product ID</label>
              <input
                v-model="formData.externalProductId"
                type="text"
                placeholder="平台商品 ID"
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.externalProductId ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              />
              <p v-if="fieldErrors.externalProductId" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.externalProductId }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">外部 SKU ID</label>
              <input
                v-model="formData.externalSkuId"
                type="text"
                placeholder="平台 SKU ID"
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.externalSkuId ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              />
              <p v-if="fieldErrors.externalSkuId" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.externalSkuId }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">外部 POI ID</label>
              <input
                v-model="formData.externalPoiId"
                type="text"
                placeholder="门店 POI ID"
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.externalPoiId ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              />
              <p v-if="fieldErrors.externalPoiId" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.externalPoiId }}</p>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">落地页 URL</label>
              <input
                v-model="formData.landingUrl"
                type="text"
                placeholder="https://..."
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.landingUrl ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              />
              <p v-if="fieldErrors.landingUrl" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.landingUrl }}</p>
            </div>

            <div class="col-span-2 flex flex-col gap-2 max-[720px]:col-span-1">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">客户端 Path</label>
              <input
                v-model="formData.landingPath"
                type="text"
                placeholder="aweme://... 或 meituan://..."
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
                :class="fieldErrors.landingPath ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              />
              <p class="text-[10px] font-sans text-amber-text-muted">`landingUrl` 和 `landingPath` 至少填写一个。</p>
              <p v-if="fieldErrors.landingPath" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.landingPath }}</p>
            </div>

            <div class="col-span-2 flex flex-col gap-2 max-[720px]:col-span-1">
              <div class="flex items-center justify-between">
                <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">备注</label>
                <span class="text-[9px] font-mono text-amber-text-muted opacity-40">{{ formData.remark.length }} / 160</span>
              </div>
              <textarea
                v-model="formData.remark"
                rows="3"
                maxlength="160"
                placeholder="记录授权状态、补齐说明或运营备注"
                class="w-full px-3 py-2 bg-[#EBE4D6] border rounded-md text-[11.375px] font-sans focus:outline-none focus:border-amber-dark/30 resize-none"
                :class="fieldErrors.remark ? 'border-[#B8543B]/50' : 'border-amber-topbar-border'"
              ></textarea>
              <p v-if="fieldErrors.remark" class="text-[10px] font-sans text-[#B8543B]">{{ fieldErrors.remark }}</p>
            </div>
          </div>
        </div>

        <div class="px-7 py-5 bg-[#FBF8F2] border-t border-amber-topbar-border flex items-center justify-end gap-3.5">
          <button
            @click="$emit('close')"
            class="px-6 py-2 text-[11px] font-sans font-medium text-amber-text-muted hover:text-amber-dark transition-colors disabled:opacity-50"
            type="button"
            :disabled="submitting"
          >
            取消
          </button>
          <button
            @click="handleSubmit"
            class="px-6 py-2 bg-amber-dark text-[#F4EFE6] rounded-md text-[11px] font-sans font-medium hover:bg-black transition-all disabled:bg-amber-topbar-border disabled:text-amber-text-muted"
            type="button"
            :disabled="submitting"
          >
            {{ submitting ? '提交中...' : mode === 'add' ? '创建映射' : '保存映射' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ProductConfig, StoreInfo, ChannelProductMappingInfo } from '../../../shared/stores/appStore'

type ChannelMappingFormValues = {
  id?: string
  storeBackendId: string
  productBackendId: string
  externalName: string
  externalProductId: string
  externalSkuId: string
  externalPoiId: string
  landingUrl: string
  landingPath: string
  mappingStatus: string
  remark: string
}

type ChannelMappingField = keyof ChannelMappingFormValues

const props = defineProps<{
  show: boolean
  mode: 'add' | 'edit'
  channelLabel: string
  initialData?: Partial<ChannelProductMappingInfo> | null
  productOptions: ProductConfig[]
  storeOptions: StoreInfo[]
  submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: ChannelMappingFormValues]
}>()

const mappingStatusOptions = ['DRAFT', 'ENABLED', 'ACTIVE', 'MAPPED', 'DISABLED', 'NOT_AUTHORIZED']

const createDefaultForm = (): ChannelMappingFormValues => ({
  storeBackendId: props.storeOptions[0]?.backendId ?? '',
  productBackendId: '',
  externalName: '',
  externalProductId: '',
  externalSkuId: '',
  externalPoiId: '',
  landingUrl: '',
  landingPath: '',
  mappingStatus: 'DRAFT',
  remark: '',
})

const formData = ref<ChannelMappingFormValues>(createDefaultForm())
const submitError = ref('')
const fieldErrors = ref<Partial<Record<ChannelMappingField, string>>>({})

const validators: Record<ChannelMappingField, (value: ChannelMappingFormValues) => string> = {
  id: () => '',
  storeBackendId: values => (values.storeBackendId ? '' : '请选择门店'),
  productBackendId: values => (values.productBackendId ? '' : '请选择本地产品'),
  externalName: values => (values.externalName.trim() ? '' : '请填写渠道商品名'),
  externalProductId: values => (values.externalProductId.trim() ? '' : '请填写外部 Product ID'),
  externalSkuId: values => (values.externalSkuId.trim() ? '' : '请填写外部 SKU ID'),
  externalPoiId: values => (values.externalPoiId.trim() ? '' : '请填写外部 POI ID'),
  landingUrl: values => (values.landingUrl.trim() || values.landingPath.trim() ? '' : '请至少填写一个落地入口'),
  landingPath: values => (values.landingUrl.trim() || values.landingPath.trim() ? '' : '请至少填写一个落地入口'),
  mappingStatus: values => (values.mappingStatus.trim() ? '' : '请选择映射状态'),
  remark: () => '',
}

const resetForm = () => {
  const next = props.initialData
  if (!next) {
    formData.value = createDefaultForm()
  } else {
    formData.value = {
      id: next.backendId ? String(next.backendId) : undefined,
      storeBackendId: String(next.storeBackendId ?? ''),
      productBackendId: String(next.productBackendId ?? ''),
      externalName: String(next.externalName ?? ''),
      externalProductId: String(next.externalProductId ?? ''),
      externalSkuId: String(next.externalSkuId ?? ''),
      externalPoiId: String(next.externalPoiId ?? ''),
      landingUrl: String(next.landingUrl ?? ''),
      landingPath: String(next.landingPath ?? ''),
      mappingStatus: String(next.mappingStatus ?? 'DRAFT'),
      remark: String(next.remark ?? ''),
    }
  }
  submitError.value = ''
  fieldErrors.value = {}
}

watch(() => props.initialData, resetForm, { immediate: true })
watch(() => props.show, visible => {
  if (visible) resetForm()
})
watch(() => props.storeOptions, stores => {
  if (!formData.value.storeBackendId && stores[0]) {
    formData.value.storeBackendId = String(stores[0].backendId)
  }
})

const validateForm = () => {
  const nextErrors = {} as Partial<Record<ChannelMappingField, string>>
  ;(Object.keys(validators) as ChannelMappingField[]).forEach(field => {
    const message = validators[field](formData.value)
    if (message) nextErrors[field] = message
  })
  fieldErrors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

const normalizedValues = computed<ChannelMappingFormValues>(() => ({
  id: formData.value.id,
  storeBackendId: formData.value.storeBackendId.trim(),
  productBackendId: formData.value.productBackendId.trim(),
  externalName: formData.value.externalName.trim(),
  externalProductId: formData.value.externalProductId.trim(),
  externalSkuId: formData.value.externalSkuId.trim(),
  externalPoiId: formData.value.externalPoiId.trim(),
  landingUrl: formData.value.landingUrl.trim(),
  landingPath: formData.value.landingPath.trim(),
  mappingStatus: formData.value.mappingStatus.trim(),
  remark: formData.value.remark.trim(),
}))

const handleSubmit = () => {
  submitError.value = ''
  formData.value = { ...normalizedValues.value }
  if (!validateForm()) {
    submitError.value = '请先补齐必填字段后再提交'
    return
  }
  emit('submit', normalizedValues.value)
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
