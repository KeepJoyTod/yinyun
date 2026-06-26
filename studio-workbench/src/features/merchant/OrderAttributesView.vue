<template>
  <MerchantModuleChrome>
    <section class="border border-amber-topbar-border bg-[#FBF8F2]">
      <div class="flex items-center justify-between gap-4 border-b border-amber-topbar-border px-5 py-5 max-[720px]:flex-col max-[720px]:items-start">
        <div>
          <div class="yy-eyebrow">订单属性</div>
          <h2 class="mt-2 font-serif text-[22px] leading-none text-amber-dark">门店订单属性模板</h2>
          <p class="mt-2 text-[12px] text-amber-text-muted">店长在这里维护字段模板，录单弹窗和订单详情会读取同一套配置并写入订单快照。</p>
        </div>
        <button class="yy-action inline-flex items-center gap-2 bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6]" type="button" @click="openCreate">
          新增字段
        </button>
      </div>

      <div class="grid gap-4 border-b border-amber-topbar-border px-5 py-4 md:grid-cols-[1fr_auto]">
        <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
          门店
          <select v-model="selectedStoreId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
            <option value="">请选择门店</option>
            <option v-for="store in appStore.stores" :key="store.backendId" :value="store.backendId">{{ store.name }}</option>
          </select>
        </label>
        <div class="flex items-end gap-2">
          <button class="yy-action rounded-md border border-amber-topbar-border bg-white px-4 py-2 text-[12px] text-amber-text-muted" type="button" :disabled="loading" @click="loadTemplates">
            {{ loading ? '加载中...' : '刷新模板' }}
          </button>
        </div>
      </div>

      <p v-if="notice" class="px-5 py-3 text-[12px]" :class="noticeType === 'error' ? 'text-[var(--color-status-danger)]' : 'text-[var(--color-status-done)]'">{{ notice }}</p>

      <div class="grid gap-5 px-5 py-5 lg:grid-cols-[1.12fr_0.88fr]">
        <section class="overflow-hidden border border-amber-topbar-border bg-white/80">
          <table class="w-full min-w-[720px] border-collapse">
            <thead class="bg-[#F4EFE6]/70 text-left text-[12px] text-amber-text-muted">
              <tr>
                <th class="px-4 py-3 font-normal">字段</th>
                <th class="px-4 py-3 font-normal">类型</th>
                <th class="px-4 py-3 font-normal">规则</th>
                <th class="px-4 py-3 font-normal">选项</th>
                <th class="px-4 py-3 font-normal">状态</th>
                <th class="px-4 py-3 font-normal">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="template in templates" :key="template.id" class="border-t border-amber-topbar-border/70">
                <td class="px-4 py-3">
                  <div class="text-[13px] font-semibold text-amber-dark">{{ template.fieldLabel }}</div>
                  <div class="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-text-muted">{{ template.fieldCode }}</div>
                </td>
                <td class="px-4 py-3 text-[12px] text-amber-dark">{{ getOrderAttributeFieldLabel(template.fieldType) }}</td>
                <td class="px-4 py-3 text-[12px] text-amber-dark">
                  {{ template.required === '1' ? '必填' : '选填' }} / 排序 {{ template.sort }}
                </td>
                <td class="px-4 py-3 text-[12px] text-amber-text-muted">{{ template.options.length ? template.options.join(' / ') : '-' }}</td>
                <td class="px-4 py-3 text-[12px] text-amber-dark">{{ template.status === 'ACTIVE' ? '启用' : '停用' }}</td>
                <td class="px-4 py-3">
                  <div class="flex gap-2 text-[11px]">
                    <button class="yy-action rounded-md border border-amber-topbar-border bg-white px-2.5 py-1.5 text-amber-text-muted" type="button" @click="openEdit(template)">编辑</button>
                    <button class="yy-action rounded-md border border-[var(--color-status-danger-border)] bg-white px-2.5 py-1.5 text-[var(--color-status-danger)]" type="button" @click="removeTemplate(template.id)">删除</button>
                  </div>
                </td>
              </tr>
              <tr v-if="!templates.length">
                <td class="px-4 py-8 text-center text-[12px] text-amber-text-muted" colspan="6">当前门店还没有订单属性模板。</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="border border-amber-topbar-border bg-white/80 p-4">
          <div class="border-b border-amber-topbar-border pb-3">
            <div class="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-text-muted">template editor</div>
            <h3 class="mt-2 text-[18px] font-semibold text-amber-dark">{{ form.id ? '编辑字段' : '新增字段' }}</h3>
          </div>

          <div class="mt-4 grid gap-3">
            <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
              门店
              <select v-model="form.storeId" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                <option value="">请选择门店</option>
                <option v-for="store in appStore.stores" :key="store.backendId" :value="store.backendId">{{ store.name }}</option>
              </select>
              <span v-if="errors.storeId" class="text-[11px] text-[var(--color-status-danger)]">{{ errors.storeId }}</span>
            </label>

            <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
              字段编码
              <input v-model.trim="form.fieldCode" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none" placeholder="例如 customer_note" />
              <span v-if="errors.fieldCode" class="text-[11px] text-[var(--color-status-danger)]">{{ errors.fieldCode }}</span>
            </label>

            <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
              字段名称
              <input v-model.trim="form.fieldLabel" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none" placeholder="例如 客户备注" />
              <span v-if="errors.fieldLabel" class="text-[11px] text-[var(--color-status-danger)]">{{ errors.fieldLabel }}</span>
            </label>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
                字段类型
                <select v-model="form.fieldType" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                  <option v-for="option in ORDER_ATTRIBUTE_FIELD_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
              </label>
              <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
                排序
                <input v-model.number="form.sort" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none" min="0" type="number" />
              </label>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
                状态
                <select v-model="form.status" class="h-10 rounded-md border border-amber-topbar-border bg-white px-3 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none">
                  <option value="ACTIVE">启用</option>
                  <option value="DISABLED">停用</option>
                </select>
              </label>
              <label class="flex items-center gap-2 rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[12px] text-amber-dark">
                <input v-model="form.required" class="h-4 w-4 accent-amber-dark" type="checkbox" />
                <span>必填字段</span>
              </label>
            </div>

            <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
              选项
              <textarea v-model="form.optionsText" class="min-h-[76px] rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none" placeholder="下拉/多选字段使用，多个选项用中文逗号或换行分隔" />
            </label>

            <label class="grid gap-1.5 text-[11px] font-medium text-amber-text-muted">
              备注
              <textarea v-model.trim="form.remark" class="min-h-[76px] rounded-md border border-amber-topbar-border bg-white px-3 py-2 text-[12px] text-amber-dark focus:border-amber-dark/40 focus:outline-none" />
            </label>

            <div class="flex items-center justify-end gap-2 border-t border-amber-topbar-border pt-4">
              <button class="yy-action rounded-md border border-amber-topbar-border bg-white px-4 py-2 text-[12px] text-amber-text-muted" type="button" @click="resetForm">重置</button>
              <button class="yy-action rounded-md border border-amber-dark bg-amber-dark px-4 py-2 text-[12px] font-semibold text-[#F4EFE6] disabled:opacity-60" :disabled="saving" type="button" @click="submit">
                {{ saving ? '保存中...' : '保存字段' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  </MerchantModuleChrome>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { backendApi, type OrderAttributeFieldType, type OrderAttributeTemplateDto } from '../../shared/api/backend'
import { appStore } from '../../shared/stores/appStore'
import MerchantModuleChrome from './components/MerchantModuleChrome.vue'
import { ORDER_ATTRIBUTE_FIELD_OPTIONS, getOrderAttributeFieldLabel } from '../../shared/orderAttributes'

const route = useRoute()

const loading = ref(false)
const saving = ref(false)
const selectedStoreId = ref(String(route.query.storeId ?? ''))
const templates = ref<OrderAttributeTemplateDto[]>([])
const notice = ref('')
const noticeType = ref<'success' | 'error'>('success')

const form = reactive({
  id: '',
  storeId: '',
  fieldCode: '',
  fieldLabel: '',
  fieldType: 'TEXT' as OrderAttributeFieldType,
  required: false,
  optionsText: '',
  sort: 10,
  status: 'ACTIVE',
  remark: '',
})

const errors = reactive({
  storeId: '',
  fieldCode: '',
  fieldLabel: '',
})

const normalizedOptions = computed(() => form.optionsText
  .split(/[\n,，]/)
  .map(item => item.trim())
  .filter(Boolean))

const resetForm = () => {
  form.id = ''
  form.storeId = selectedStoreId.value
  form.fieldCode = ''
  form.fieldLabel = ''
  form.fieldType = 'TEXT'
  form.required = false
  form.optionsText = ''
  form.sort = 10
  form.status = 'ACTIVE'
  form.remark = ''
  errors.storeId = ''
  errors.fieldCode = ''
  errors.fieldLabel = ''
}

const openCreate = () => resetForm()

const openEdit = (template: OrderAttributeTemplateDto) => {
  form.id = template.id
  form.storeId = template.storeId
  form.fieldCode = template.fieldCode
  form.fieldLabel = template.fieldLabel
  form.fieldType = template.fieldType as OrderAttributeFieldType
  form.required = template.required === '1'
  form.optionsText = template.options.join('\n')
  form.sort = template.sort
  form.status = template.status
  form.remark = template.remark || ''
}

const validate = () => {
  errors.storeId = form.storeId ? '' : '请选择门店'
  errors.fieldCode = form.fieldCode.trim() ? '' : '请输入字段编码'
  errors.fieldLabel = form.fieldLabel.trim() ? '' : '请输入字段名称'
  return !errors.storeId && !errors.fieldCode && !errors.fieldLabel
}

const loadTemplates = async () => {
  if (!selectedStoreId.value) {
    templates.value = []
    return
  }
  loading.value = true
  notice.value = ''
  try {
    templates.value = await backendApi.listOrderAttributeTemplates(selectedStoreId.value)
  } catch (error) {
    noticeType.value = 'error'
    notice.value = error instanceof Error ? error.message : '订单属性模板加载失败'
  } finally {
    loading.value = false
  }
}

const submit = async () => {
  if (!validate()) return
  saving.value = true
  notice.value = ''
  try {
    const payload = {
      id: form.id || undefined,
      storeId: form.storeId,
      fieldCode: form.fieldCode.trim(),
      fieldLabel: form.fieldLabel.trim(),
      fieldType: form.fieldType,
      required: form.required,
      options: normalizedOptions.value,
      sort: Number(form.sort || 0),
      status: form.status,
      remark: form.remark.trim(),
    }
    if (form.id) await backendApi.updateOrderAttributeTemplate(payload)
    else await backendApi.createOrderAttributeTemplate(payload)
    selectedStoreId.value = form.storeId
    await loadTemplates()
    noticeType.value = 'success'
    notice.value = '订单属性模板已保存'
    resetForm()
  } catch (error) {
    noticeType.value = 'error'
    notice.value = error instanceof Error ? error.message : '订单属性模板保存失败'
  } finally {
    saving.value = false
  }
}

const removeTemplate = async (id: string) => {
  if (!globalThis.confirm('确认删除这个订单属性字段吗？')) return
  try {
    await backendApi.deleteOrderAttributeTemplate(id)
    templates.value = templates.value.filter(template => template.id !== id)
    noticeType.value = 'success'
    notice.value = '订单属性字段已删除'
    if (form.id === id) resetForm()
  } catch (error) {
    noticeType.value = 'error'
    notice.value = error instanceof Error ? error.message : '订单属性字段删除失败'
  }
}

watch(selectedStoreId, async storeId => {
  if (!form.id) form.storeId = storeId
  await loadTemplates()
})

onMounted(async () => {
  if (!appStore.stores.length) await appStore.refreshCoreData()
  if (!selectedStoreId.value) selectedStoreId.value = String(appStore.stores[0]?.backendId ?? '')
  else await loadTemplates()
  if (!form.storeId) form.storeId = selectedStoreId.value
})
</script>
