<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 p-4 backdrop-blur-sm">
      <div class="flex max-h-[80vh] w-full max-w-[720px] flex-col overflow-hidden rounded-2xl border border-amber-topbar-border bg-[#FBF8F2] shadow-2xl">
        <div class="flex items-start justify-between gap-4 border-b border-amber-topbar-border px-7 py-5">
          <div>
            <span class="text-[10px] uppercase tracking-[0.22em] text-amber-text-muted">产品配置</span>
            <h2 class="mt-1 text-[18px] font-semibold text-amber-dark">{{ mode === 'add' ? '新增商品' : '编辑商品' }}</h2>
            <p class="mt-2 text-[11px] leading-relaxed text-amber-text-muted">保存后用于预约、选片加购和商品展示。</p>
          </div>
          <button class="yy-action border border-amber-topbar-border px-3 py-2 text-[10px] text-amber-dark hover:bg-black/5" type="button" @click="$emit('close')">
            关闭
          </button>
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto px-7 py-6">
          <div v-if="externalError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[11px] text-red-700">
            {{ externalError }}
          </div>

          <div class="grid gap-6 lg:grid-cols-[220px_1fr]">
            <div class="space-y-2">
              <div class="text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">商品主图</div>
              <input ref="fileInputEl" type="file" accept="image/*" class="hidden" @change="onFileChange" />
              <button
                class="flex h-[220px] w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-amber-topbar-border bg-[#EBE4D6] text-[11px] text-amber-text-muted hover:border-amber-dark/30"
                type="button"
                @click="triggerUpload"
              >
                <img v-if="previewImage" :src="previewImage" class="h-full w-full object-cover" />
                <span v-else>点击上传封面图</span>
              </button>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-2 md:col-span-2">
                <span class="text-[11px] font-medium text-amber-dark">商品名称</span>
                <input v-model.trim="formData.name" class="h-10 rounded-xl border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" type="text" />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[11px] font-medium text-amber-dark">商品编号</span>
                <input v-model.trim="formData.id" class="h-10 rounded-xl border border-amber-topbar-border bg-white px-3 font-mono text-[11px] text-amber-dark outline-none" type="text" />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[11px] font-medium text-amber-dark">业务分类</span>
                <input v-model.trim="formData.bizCategory" class="h-10 rounded-xl border border-amber-topbar-border bg-[#F3EEE3] px-3 text-[11px] text-amber-dark outline-none" type="text" disabled />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[11px] font-medium text-amber-dark">套餐价</span>
                <input v-model.trim="formData.price" class="h-10 rounded-xl border border-amber-topbar-border bg-white px-3 font-mono text-[11px] text-amber-dark outline-none" type="number" min="0" />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[11px] font-medium text-amber-dark">加购单价</span>
                <input v-model.trim="formData.unitPrice" class="h-10 rounded-xl border border-amber-topbar-border bg-white px-3 font-mono text-[11px] text-amber-dark outline-none" type="number" min="0" />
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[11px] font-medium text-amber-dark">规格</span>
                <input v-model.trim="formData.spec" list="product-spec-options" class="h-10 rounded-xl border border-amber-topbar-border bg-white px-3 text-[11px] text-amber-dark outline-none" type="text" />
                <datalist id="product-spec-options">
                  <option v-for="option in specChoiceOptions" :key="option" :value="option" />
                </datalist>
              </label>
              <label class="flex flex-col gap-2">
                <span class="text-[11px] font-medium text-amber-dark">入册张数</span>
                <input v-model.number="formData.includedCount" class="h-10 rounded-xl border border-amber-topbar-border bg-white px-3 font-mono text-[11px] text-amber-dark outline-none" type="number" min="0" />
              </label>
            </div>
          </div>

          <label class="flex flex-col gap-2">
            <span class="text-[11px] font-medium text-amber-dark">商品说明</span>
            <textarea v-model.trim="formData.desc" rows="4" maxlength="180" class="rounded-2xl border border-amber-topbar-border bg-white px-3 py-3 text-[11px] text-amber-dark outline-none"></textarea>
          </label>

          <div class="space-y-2">
            <span class="text-[11px] font-medium text-amber-dark">适用门店</span>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="store in storeOptions"
                :key="store"
                class="flex items-center gap-2 rounded-full border border-amber-topbar-border bg-white px-3 py-2 text-[10.5px] text-amber-dark"
              >
                <input :checked="formData.storeNames.includes(store)" type="checkbox" @change="toggleStore(store)" />
                <span>{{ store }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 border-t border-amber-topbar-border px-7 py-5">
          <button class="yy-action px-4 py-2 text-[11px] text-amber-text-muted hover:text-amber-dark" type="button" @click="$emit('close')">取消</button>
          <button class="yy-action rounded-xl border border-amber-dark bg-amber-dark px-4 py-2 text-[11px] text-[#F4EFE6] hover:bg-black" type="button" :disabled="submitting" @click="handleSubmit">
            {{ submitting ? '保存中...' : mode === 'add' ? '创建商品' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ModalSubmitPayload } from '../productCardCatalogOperations'

const props = defineProps<{
  show: boolean
  mode: 'add' | 'edit'
  initialData?: Partial<ModalSubmitPayload['values']> | null
  specOptions?: string[]
  storeOptions?: string[]
  submitting?: boolean
  externalError?: string
}>()

const emit = defineEmits<{
  close: []
  submit: [payload: ModalSubmitPayload]
}>()

const emptyValues = (): ModalSubmitPayload['values'] => ({
  id: '',
  bizCategory: 'SERVICE',
  name: '',
  nickname: '',
  image: '',
  listImage: '',
  halfImage: '',
  channels: ['WECHAT'],
  categoryName: '',
  allowOnlineBooking: true,
  showInApp: true,
  allowStoreOrder: true,
  selfPayMode: 'PAY',
  fullSlotMode: 'ALLOW',
  durationLabel: '',
  supportSelection: false,
  giftAlbum: false,
  originalPriceLabel: '原价',
  currentPriceLabel: '现价',
  priceLabelText: '',
  hasSpecs: false,
  consumeCredit: 0,
  ladderPricingText: '',
  depositMode: 'BRAND',
  depositAmount: '',
  intro: '',
  detailButtonMode: 'BOOK_NOW',
  detailButtonText: '立即预约',
  detailModules: [],
  publishMode: 'PUBLISHED',
  spec: '',
  price: '',
  unitPrice: '',
  includedCount: 0,
  desc: '',
  storeNames: [],
})

const formData = ref<ModalSubmitPayload['values']>(emptyValues())
const imageFile = ref<File | null>(null)
const fileInputEl = ref<HTMLInputElement | null>(null)

const specChoiceOptions = computed(() => {
  const current = formData.value.spec ? [formData.value.spec] : []
  return Array.from(new Set([...current, ...(props.specOptions ?? []).filter(Boolean)]))
})

const previewImage = computed(() => formData.value.image)

watch(
  () => props.initialData,
  value => {
    formData.value = {
      ...emptyValues(),
      ...value,
      storeNames: [...(value?.storeNames ?? [])],
      channels: [...(value?.channels ?? ['WECHAT'])],
      detailModules: [...(value?.detailModules ?? [])],
    }
    imageFile.value = null
  },
  { immediate: true },
)

const triggerUpload = () => {
  fileInputEl.value?.click()
}

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(file)
  })

const applyFile = async (file: File) => {
  if (!file.type.startsWith('image/')) return
  imageFile.value = file
  formData.value = {
    ...formData.value,
    image: await readAsDataUrl(file),
  }
}

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await applyFile(file)
  input.value = ''
}

const toggleStore = (store: string) => {
  const stores = new Set(formData.value.storeNames)
  if (stores.has(store)) stores.delete(store)
  else stores.add(store)
  formData.value = {
    ...formData.value,
    storeNames: [...stores],
  }
}

const handleSubmit = () => {
  emit('submit', {
    values: {
      ...formData.value,
      includedCount: Math.max(0, Number(formData.value.includedCount) || 0),
    },
    imageFiles: {
      image: imageFile.value,
      listImage: null,
      halfImage: null,
    },
  })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
