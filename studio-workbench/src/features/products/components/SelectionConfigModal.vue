<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1814]/40 backdrop-blur-sm p-4">
      <div class="bg-[#FBF8F2] border border-amber-topbar-border rounded-md shadow-2xl w-full max-w-[588px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        <!-- Header (12:418) -->
        <div class="px-7 py-5 border-b border-amber-topbar-border flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.22em] leading-none">产品配置</span>
            <h2 class="text-[17.5px] font-sans font-medium text-amber-dark leading-none tracking-tight">
              {{ mode === 'add' ? '新增服务产品' : '编辑服务产品' }}
            </h2>
            <p class="text-[10.5px] font-sans text-amber-text-muted mt-1 opacity-70">完善产品信息与价格配置，保存后用于预约、选片加购和商品展示。</p>
          </div>
          <button @click="$emit('close')" class="p-2 hover:bg-black/5 rounded-md transition-all">
            <img src="../../../assets/icons/close.svg" class="w-3.5 h-3.5 opacity-40" />
          </button>
        </div>

        <!-- Body (12:430) -->
        <div class="p-7 overflow-y-auto max-h-[70vh] flex flex-col gap-6">
          <!-- Image Upload (12:432) -->
          <div class="flex flex-col gap-2.5">
            <span class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">产品主图</span>
            <input ref="fileInputEl" type="file" accept="image/*" class="hidden" @change="onFileChange" />
            <div 
              class="w-full h-[180px] bg-[#EBE4D6] border-2 border-dashed border-amber-topbar-border rounded-md flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-amber-dark/30 hover:bg-amber-bg/10 transition-all group"
              @click="triggerUpload"
              @dragover.prevent
              @drop.prevent="onDrop"
            >
              <div v-if="!formData.image" class="flex flex-col items-center gap-2">
                <img src="../../../assets/icons/plus.svg" class="w-6 h-6 opacity-20 group-hover:opacity-40 transition-opacity" />
                <span class="text-[11px] font-sans text-amber-text-muted opacity-50">点击或拖拽上传封面图 (建议 1:1)</span>
              </div>
              <img v-else :src="formData.image" class="w-full h-full object-cover" />
            </div>
          </div>

          <!-- Form Fields (12:441) -->
          <div class="grid grid-cols-3 gap-x-3.5 gap-y-6">
            <!-- Row 1: Name & ID -->
            <div class="col-span-2 flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">产品名称</label>
              <input 
                v-model="formData.name"
                type="text" 
                placeholder="例：胶片人像 · 半日档"
                class="w-full px-3 py-2 bg-[#EBE4D6] border border-amber-topbar-border rounded-md text-[11.375px] font-sans focus:outline-none focus:border-amber-dark/30"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">产品编号</label>
              <input 
                v-model="formData.id"
                type="text" 
                placeholder="PRD-XXX"
                class="w-full px-3 py-2 bg-[#EBE4D6] border border-amber-topbar-border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
              />
            </div>

            <!-- Row 2: Prices -->
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">套系价 (¥)</label>
              <input 
                v-model="formData.price"
                type="number" 
                placeholder="0"
                class="w-full px-3 py-2 bg-[#EBE4D6] border border-amber-topbar-border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">选片单价 (¥/张)</label>
              <input 
                v-model="formData.unitPrice"
                type="number" 
                placeholder="0"
                class="w-full px-3 py-2 bg-[#EBE4D6] border border-amber-topbar-border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">含精修张数</label>
              <input 
                v-model="formData.includedCount"
                type="number" 
                placeholder="0"
                class="w-full px-3 py-2 bg-[#EBE4D6] border border-amber-topbar-border rounded-md text-[11.375px] font-mono focus:outline-none focus:border-amber-dark/30"
              />
            </div>

            <!-- Row 3: Album Spec (12:474) -->
            <div class="col-span-3 flex flex-col gap-2">
              <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">入册产品 / 成册规格</label>
              <div class="grid grid-cols-2 gap-2.5">
                <div 
                  v-for="opt in specChoices" :key="opt"
                  @click="formData.spec = opt"
                  class="px-3 py-2 border rounded-md cursor-pointer flex items-center gap-2 transition-all"
                  :class="formData.spec === opt ? 'bg-amber-accent/10 border-amber-accent' : 'bg-transparent border-amber-topbar-border hover:border-amber-dark/30'"
                >
                  <div class="w-3 h-3 rounded-full border border-amber-topbar-border flex items-center justify-center" :class="{ 'border-amber-accent': formData.spec === opt }">
                    <div v-if="formData.spec === opt" class="w-1.5 h-1.5 bg-amber-accent rounded-full"></div>
                  </div>
                  <span class="text-[10.5px] font-sans" :class="formData.spec === opt ? 'text-amber-accent' : 'text-amber-dark/70'">{{ opt }}</span>
                </div>
              </div>
            </div>

            <!-- Row 4: Description (12:511) -->
            <div class="col-span-3 flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <label class="text-[10px] font-mono text-amber-text-muted uppercase tracking-[0.18em]">产品说明</label>
                <span class="text-[9px] font-mono text-amber-text-muted opacity-40">{{ formData.desc.length }} / 160</span>
              </div>
              <textarea 
                v-model="formData.desc"
                maxlength="160"
                rows="3"
                placeholder="拍摄时长、服装套数、化妆师配置 …"
                class="w-full px-3 py-2 bg-[#EBE4D6] border border-amber-topbar-border rounded-md text-[11.375px] font-sans focus:outline-none focus:border-amber-dark/30 resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Footer (12:520) -->
        <div class="px-7 py-5 bg-[#FBF8F2] border-t border-amber-topbar-border flex items-center justify-end gap-3.5">
          <button @click="$emit('close')" class="px-6 py-2 text-[11px] font-sans font-medium text-amber-text-muted hover:text-amber-dark transition-colors">取消</button>
          <button 
            @click="handleSubmit"
            class="px-6 py-2 bg-amber-dark text-[#F4EFE6] rounded-md text-[11px] font-sans font-medium hover:bg-black transition-all"
          >
            {{ mode === 'add' ? '上架产品' : '保存修改' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  show: boolean
  mode: 'add' | 'edit'
  initialData?: any
  specOptions?: string[]
}>()

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  id: '',
  name: '',
  image: '',
  spec: '',
  price: '',
  unitPrice: '',
  includedCount: '',
  desc: ''
})

const specOptions = computed(() => Array.from(new Set((props.specOptions ?? []).filter(Boolean))))
const specChoices = computed(() => {
  if (formData.value.spec && !specOptions.value.includes(formData.value.spec)) {
    return [formData.value.spec, ...specOptions.value]
  }
  return specOptions.value
})

const fileInputEl = ref<HTMLInputElement | null>(null)

watch(() => props.initialData, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal }
  } else {
    formData.value = {
      id: '',
      name: '',
      image: '',
      spec: specOptions.value[0] ?? '',
      price: '',
      unitPrice: '',
      includedCount: '',
      desc: ''
    }
  }
}, { immediate: true })

watch(specOptions, (options) => {
  if (!formData.value.spec && options[0]) {
    formData.value.spec = options[0]
  }
})

const triggerUpload = () => {
  fileInputEl.value?.click()
}

const readAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsDataURL(file)
  })
}

const applyFile = async (file: File) => {
  if (!file.type.startsWith('image/')) return
  const url = await readAsDataUrl(file)
  formData.value.image = url
}

const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  await applyFile(file)
  input.value = ''
}

const onDrop = async (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (!file) return
  await applyFile(file)
}

const handleSubmit = () => {
  emit('submit', { ...formData.value })
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
